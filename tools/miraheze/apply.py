#!/usr/bin/env python3
"""Gap-fill our guide data from the Pokémon Unbound Wiki (Miraheze, CC BY-SA 4.0). Facts only, no prose/images.
Usage:  python3 tools/miraheze/apply.py [--refresh] [--dry]
Reads cached API data (fetch.py), parses templates (parse.py), and fills ONLY gaps:
  wild lv/rate, trainer prize, gym team corrections (Difficult/Expert/Insane; Vanilla kept), missing items/collectibles,
  special encounters. Every value written carries src (page + revision timestamp). Writes tools/miraheze/report.{json,md}."""
import json, os, re, sys, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import fetch, parse
DRY = '--dry' in sys.argv
WIKI = 'https://pokemonunbound.miraheze.org/wiki/'
titles = fetch.all_titles()
keep = [t for t in titles if not re.search(r'soundtrack|/Quotes|^Battle!|^Encounter!|^Victory!|^Victory Against|Theme|Mix|\(Day\)|\(Night\)', t)]
PAGES = fetch.pages(keep)
PARSED = {t: parse.parse_page(v['text']) for t, v in PAGES.items()}
def src(page): return {'from': 'miraheze', 'page': page, 'url': WIKI + page.replace(' ', '_'), 'rev': PAGES[page]['ts'][:10]}
R = collections.defaultdict(int); CONFLICTS = []; UNMAPPED = []; TEAMS = []; ADDED = []
def low(s): return re.sub(r'[^a-z0-9]', '', (s or '').lower().replace('é', 'e'))
def species(s):
    s = re.sub(r'-(Mega|Blue|Red|Yellow|White|Orange|Alola|Alolan|Galar|Galarian|Hisui|Therian|IcySnow|Origin|Incarnate).*$|\(.*?\)', '', s or '')
    return low(re.sub(r'\b(Alolan|Galarian|Hisuian|Therian|Mega|Primal)\b', '', s, flags=re.I))
# ---------- section -> Miraheze page mapping ----------
ALIAS = {'thundercap mountain': 'Thundercap Mt.', 'route 4 east': 'Route 4', 'route 4 west': 'Route 4', 'route 9, liberated': 'Route 9',
         'the kbt expressway': 'KBT Expressway', 'kbt expressway': 'KBT Expressway', 'the safari zone': 'Safari Zone', 'the distortion world': 'Distortion World',
         'the trainer house': 'Trainer House', 'cliff cave and upper route 11': 'Route 11', 'cinder volcano depths': 'Cinder Volcano',
         'ruins of void (exterior)': 'Ruins of Void', 'seaport east warehouse': 'Seaport City', 'seaport west warehouse': 'Seaport City',
         'shadow battles': 'Shadow Base', 'return to thundercap': 'Thundercap Mt.', 'return to icicle cave': 'Icicle Cave',
         'return to thundercap mountain': 'Thundercap Mt.', 'dehara gym leader': 'Dehara City/Dehara City Gym', 'rival battle': None}
GYMPAGE = {'Dresco': 'Dresco Town/Dresco Town Gym', 'Crater': 'Crater Town/Crater Town Gym', 'Blizzard': 'Blizzard City/Blizzard City Gym',
           'Fallshore': 'Fallshore City/Fallshore City Gym', 'Dehara': 'Dehara City/Dehara City Gym', 'Antisis': 'Antisis City/Antisis City Gym',
           'Polder': 'Polder Town/Polder Town Gym', 'Redwood': 'Redwood Village/Redwood Village Gym'}
TL = {t.lower(): t for t in PAGES}
def map_section(name):
    m = re.match(r'(\w+) (?:Town )?Gym', name)
    if m and m.group(1) in GYMPAGE: return GYMPAGE[m.group(1)]
    if 'Gym Leader' in name:
        for k, v in GYMPAGE.items():
            if name.startswith(k): return v
    base = re.sub(r'^Optional:\s*', '', name)
    tail = base.split(' – ')[-1]
    for cand in (base, base.split(' – ')[0], re.sub(r'\s*\(.*?\)', '', base.split(' – ')[0]), re.sub(r'\s*\(.*?\)', '', tail)):
        c = cand.strip().lower()
        if c in ALIAS: return ALIAS[c]
        if c in TL: return TL[c]
    return None
# ---------- load our data ----------
def load_js(path, prefix_re):
    s = open(path, encoding='utf8').read(); m = re.match(prefix_re, s, re.S)
    return s, m.group(0), json.loads(s[m.end():].rstrip().rstrip(';'))
PD = {}
for n in range(2, 41):
    s, pre, j = load_js(os.path.join(ROOT, f'data/p{n}.js'), r'\(window\.PD=window\.PD\|\|\{\}\)\[\d+\]=')
    PD[n] = (pre, j)
bs, bpre, BOOK = load_js(os.path.join(ROOT, 'data/book.js'), r'window\.BOOK=')
LOCS = {l['id']: l for l in BOOK['locs']}
# ---------- wild ----------
METHOD = lambda label: ('surf' if re.search(r'surf', label, re.I) else 'fish' if re.search(r'fish|rod', label, re.I)
                        else 'smash' if re.search(r'smash', label, re.I) else 'land')
def mh_method(e):
    m = e['method'].lower()
    return 'surf' if m.startswith('surf') else 'fish' if m.startswith('fish') else 'smash' if 'smash' in m else 'land' if m in ('grass', 'cave', 'walking', 'sand', 'long grass', 'land') else m
def floor_tokens(secname):
    return set(re.findall(r'\b(B?\d+F)\b', secname))
def best_wild(page, mon, label, secname):
    cands = [e for e in PARSED[page]['wild'] if species(e['name']) == species(mon)]
    if not cands: return None
    want = METHOD(label or '')
    byM = [e for e in cands if mh_method(e) == want] or (cands if want == 'land' and len({mh_method(e) for e in cands}) == 1 else [])
    if not byM: return None
    ft = floor_tokens(secname)
    if ft:
        f2 = [e for e in byM if any(t in e['h'] for t in ft)]
        if f2: byM = f2
    lvs = sorted({e['lv'] for e in byM})
    def rate(e): return e.get('rate') or f"Day {e['day']} / Night {e['night']}"
    rates = sorted({rate(e) for e in byM})
    if len(lvs) == 1: lv = lvs[0]
    else:
        nums = [int(x) for l in lvs for x in re.findall(r'\d+', l)]
        lv = f'{min(nums)}-{max(nums)}' if nums else None
    return dict(lv=lv, rate=rates[0] if len(rates) == 1 else None, areas=len(byM))
# ---------- trainers ----------
def trainer_match(page, uname):
    nm = low(uname)
    for t in PARSED[page]['trainers']:
        if low(t['cls'] + t['name']) == nm or (low(t['name']) and nm.endswith(low(t['name'])) and low(t['cls'])[:4] in nm):
            return t
    for p in PARSED[page]['parties']:
        if p['name'] and low(p['name']) in nm and p['prize']: return p
    return None
def fmt(p): return '₽{:,}'.format(p)
# ---------- items ----------
TAGS = [(r'hidden', 'hidden'), (r'daily', 'daily'), (r'post ?game', 'post-game'), (r'mission', 'mission'), (r'received|given|gift|reward', 'gift')]
HMS = ['Rock Climb', 'Rock Smash', 'Surf', 'Strength', 'Cut', 'Waterfall', 'Dive', 'Flash', 'Fly']
def item_sub(where):
    tags = [t for rx, t in TAGS if re.search(rx, where, re.I)]
    need = [h for h in HMS if re.search(r'\b' + h + r'\b', where)]
    return ' · '.join(tags + (['needs ' + need[0]] if need else []))
def item_key(n): return low(re.sub(r'\(.*?\)|<br>|×\s*\d+|x\s?\d+\b|hidden|\bTM\d+\b|\bHM\d+\b', '', n, flags=re.I))
COLLECT = {'Zygarde': 'Zygarde Cell', 'Tips': 'Trainer Tips sign', 'Portal': 'Portal', 'Vivillon': 'Vivillon pattern', 'Den': 'Max Raid Den', 'Tablet': 'Stone Tablet'}
# ---------- walk our pages ----------
page_sections = collections.defaultdict(list)   # mh page -> [(part, secidx)]
for n, (pre, d) in PD.items():
    prev = None
    for si, sec in enumerate(d['sections']):
        pg = map_section(sec['title'])
        if not pg and prev and re.match(r'^(B?\d+F|Optional|Return|HM\d)', sec['title']): pg = prev
        if pg: prev = pg
        units = [u for u in d['units'] if u.get('s') == si]
        has = any(u['k'] in ('wild', 'trainer', 'items', 'enc') for u in units)
        if not pg:
            if has: UNMAPPED.append(f'Part {n} §{si} "{sec["title"]}" – no matching Miraheze page')
            continue
        page_sections[pg].append((n, si))
        loc = LOCS.get(f'p{n}s{si}')
        for u in units:
            if u['k'] == 'wild':
                for m in u['mons']:
                    if m.get('lv'): continue
                    b = best_wild(pg, m['n'][0], u.get('label', ''), sec['title'])
                    if not b or not b['lv']:
                        R['wild_lv_unmatched'] += 1; continue
                    m['lv'] = b['lv'].replace('-', '–'); m['src'] = src(pg); R['wild_lv_filled'] += 1
                    if b['rate']: m['rate'] = b['rate']; R['wild_rate_filled'] += 1
                    if loc:
                        for w in loc['wild']:
                            if w['key'] == m.get('key') and w.get('label') == u.get('label'):
                                w['lv'] = m['lv']; w['src'] = m['src']['page']
                                if b['rate']: w['rate'] = b['rate']
            elif u['k'] == 'enc':
                for m in u['team']:
                    if m.get('lv'): continue
                    sp = [x for x in PARSED[pg]['special'] if species(x['name']) == species(m['n'][0]) and x['lv']]
                    if sp: m['lv'] = sp[0]['lv']; m['src'] = src(pg); R['encounter_lv_filled'] += 1
            elif u['k'] == 'trainer' and n >= 2:
                if u.get('prize'): continue
                t = trainer_match(pg, u['name'])
                if not t or not t['prize']: R['trainer_prize_unmatched'] += 1; continue
                u['prize'] = fmt(t['prize']); u['src'] = src(pg); R['trainer_prize_filled'] += 1
                # level conflicts (report only; unboundwiki keeps its levels: it is the walkthrough these pages follow)
                ours = [(species(m['n'][0]), str(m['lv'])) for m in u['team']]
                theirs = [(species(m['name']), str(m['lv'])) for m in t['team']]
                if theirs and sorted(ours) != sorted(theirs):
                    CONFLICTS.append(dict(kind='trainer team', where=f'Part {n}: {u["name"]}', unboundwiki=', '.join(f'{a} {b}' for a, b in ours),
                                          miraheze=', '.join(f'{a} {b}' for a, b in theirs), won='unboundwiki (kept; prize added only)',
                                          why='Miraheze route lists can show rematch or difficulty-scaled teams; our walkthrough team stays, difference flagged'))
                if loc:
                    for lt in loc['trainers']:
                        if lt['id'] == u['id']: lt['prize'] = u['prize']; lt['src'] = pg
# ---------- special encounters + missing items/collectibles (once per Miraheze page, first section) ----------
for pg, secs in page_sections.items():
    n, si = min(secs); pre, d = PD[n]; loc = LOCS.get(f'p{n}s{si}')
    have_items = set()
    for (n2, s2) in secs:
        for u in PD[n2][1]['units']:
            if u.get('s') == s2 and u['k'] == 'items': have_items |= {item_key(r['name']) for r in u['rows']}
    have_mons = set()
    for (n2, s2) in secs:
        for u in PD[n2][1]['units']:
            if u.get('s') == s2 and u['k'] in ('wild', 'enc'):
                have_mons |= {species(m['n'][0]) for m in (u.get('mons') or u.get('team') or [])}
    new_rows = []
    for it in PARSED[pg]['items']:
        k = item_key(it['display'])
        if not k or k in have_items: continue
        have_items.add(k)
        new_rows.append(dict(id=f'mh-{low(pg)}-{k}', name=it['display'], img=None, hid=bool(re.search('hidden', it['where'], re.I)), sub=item_sub(it['where']) or None, src=src(pg)))
    for c in PARSED[pg]['collect']:
        label = COLLECT.get(c['mission'], c['mission'] + ' collectible')
        nm = f'{label} {c["what"]}'.strip(); k = item_key(nm)
        if k in have_items or (c['mission'] == 'Zygarde' and any('zygarde' in h for h in have_items) and False): continue
        have_items.add(k)
        new_rows.append(dict(id=f'mh-{low(pg)}-{k}', name=nm, img=None, hid=False, sub='collectible · ' + c['mission'] + ' mission', src=src(pg)))
    # wild-type special encounters (catch/entry "Gift"/"Special"/static) we don't list
    specials = []
    for e in PARSED[pg]['wild']:
        if mh_method(e) not in ('land', 'surf', 'fish', 'smash') and species(e['name']) not in have_mons:
            specials.append(dict(n=[e['name']], x=[e['method']], lv=None if e['lv'] in ('???', '') else e['lv'].replace('-', '–'), img=[None], key=low(e['name']), src=src(pg)))
            have_mons.add(species(e['name']))
    for x in PARSED[pg]['special']:
        if not x['boss'] and x['lv'] and species(x['name']) not in have_mons:
            specials.append(dict(n=[x['name']], x=[(x['form'].lstrip('-') + ' form') if x['form'] else 'Special encounter'], lv=x['lv'], img=[None], key=low(x['name'] + x['form']), src=src(pg)))
            have_mons.add(species(x['name']))
    units = d['units']; last = max(i for i, u in enumerate(units) if u.get('s', -1) <= si) if units else 0
    ins = []
    if new_rows:
        ins.append(dict(k='items', title='More Items (Miraheze wiki)', rows=new_rows, s=si, src=src(pg)))
        R['items_added'] += sum(1 for r in new_rows if not r['sub'] or 'collectible' not in r['sub'])
        R['collectibles_added'] += sum(1 for r in new_rows if r['sub'] and 'collectible' in r['sub'])
        if loc is not None: loc['items'] += [dict(id=r['id'], name=r['name'], hidden=r['hid'], where=r['sub'] or '', src=pg) for r in new_rows]
        ADDED += [f'{pg}: {r["name"]}' for r in new_rows]
    if specials:
        ins.append(dict(k='enc', title='Special Encounters (Miraheze wiki)', portrait=None, team=specials, notes=[], s=si, src=src(pg)))
        R['special_encounters_added'] += len(specials)
        ADDED += [f'{pg}: special {m["n"][0]} Lv.{m["lv"] or "?"}' for m in specials]
    for j, u in enumerate(ins): units.insert(last + 1 + j, u)
# ---------- gyms ----------
for g in BOOK['gyms']:
    town = g['slug'].split('-')[0].capitalize(); pg = GYMPAGE.get(town)
    parties = [p for p in PARSED.get(pg, {}).get('parties', []) if low(p['name']) == low(g['leader'])]
    if not parties:
        lp = TL.get(g['leader'].lower().replace('é', 'e')) or TL.get(g['leader'].lower())
        if lp: parties = [p for p in PARSED[lp]['parties'] if 'battleground' not in (p['loc'] + p['h']).lower() and 'frontier' not in (p['loc'] + p['h']).lower() and 'rematch' not in p['h'].lower()]; pg = lp
    if not parties: UNMAPPED.append(f'Gym {g["no"]} {g["leader"]}: no Miraheze team found'); continue
    if not any(p['diff'].lower() == 'vanilla' for p in parties):
        TEAMS.append(dict(gym=g['leader'], diff='Vanilla', change='kept ours (Miraheze has no Vanilla team)'))
    if parties[0]['prize'] and not g.get('prize'):
        g['prize'] = fmt(parties[0]['prize']); g['prizeSrc'] = src(pg); R['gym_prize_filled'] += 1
    for t in g['teams']:
        p = next((p for p in parties if p['diff'].lower() == t['diff'].lower()), None)
        if not p or not p['team']: continue
        ours = [(species(m['name']), str(m['lv'])) for m in t['mons']]
        theirs = [(species(m['name']), str(m['lv'])) for m in p['team']]
        if sorted(ours) == sorted(theirs): R['gym_teams_confirmed'] += 1; continue
        if len(theirs) < len(ours):
            CONFLICTS.append(dict(kind='gym team', where=f'{g["leader"]} ({t["diff"]})', unboundwiki=', '.join(f'{a} {b}' for a, b in ours),
                                  miraheze=', '.join(f'{a} {b}' for a, b in theirs), won='unboundwiki', why='Miraheze lists fewer Pokémon (its table looks incomplete)'))
            continue
        old = {species(m['name']): m for m in t['mons']}; mons = []
        for m in p['team']:
            base = old.get(species(m['name']))
            nm = dict(base) if base else dict(name=re.sub(r'-(Blue|Red|Yellow|White|Orange)$', '', m['name']), lv='', img=None, type='', weak='', item=m['held'] or 'None', moves='', ability='')
            nm['lv'] = m['lv']; mons.append(nm)
        TEAMS.append(dict(gym=g['leader'], diff=t['diff'], before=', '.join(f'{a} {b}' for a, b in ours), after=', '.join(f'{a} {b}' for a, b in theirs), src=pg))
        CONFLICTS.append(dict(kind='gym team', where=f'{g["leader"]} ({t["diff"]})', unboundwiki=', '.join(f'{a} {b}' for a, b in ours),
                              miraheze=', '.join(f'{a} {b}' for a, b in theirs), won='miraheze', why='structured per-difficulty table with held items/EVs, edited more recently'))
        t['mons'] = mons; t['src'] = src(pg); R['gym_teams_changed'] += 1
# ---------- write ----------
if not DRY:
    for n, (pre, d) in PD.items():
        open(os.path.join(ROOT, f'data/p{n}.js'), 'w', encoding='utf8').write(pre + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + ';')
    open(os.path.join(ROOT, 'data/book.js'), 'w', encoding='utf8').write(bpre + json.dumps(BOOK, ensure_ascii=False, separators=(',', ':')) + ';')
rep = dict(counts=dict(R), teams=TEAMS, conflicts=CONFLICTS, unmapped=UNMAPPED, added=ADDED)
json.dump(rep, open(os.path.join(HERE, 'report.json'), 'w'), ensure_ascii=False, indent=1)
print(json.dumps(dict(R), indent=1)); print('teams', len(TEAMS), 'conflicts', len(CONFLICTS), 'unmapped', len(UNMAPPED), 'added', len(ADDED))
