#!/usr/bin/env python3
"""Parse Miraheze wikitext into plain facts (no prose): wild encounters, trainers, bosses, items, collectibles."""
import re
def find_templates(text):
    """Yield (start, name, args) for every top-level-or-nested {{template}} in document order."""
    out, stack, i = [], [], 0
    while i < len(text):
        if text.startswith('{{', i): stack.append(i); i += 2; continue
        if text.startswith('}}', i) and stack:
            s = stack.pop(); body = text[s+2:i]
            out.append((s, body)); i += 2; continue
        i += 1
    out.sort()
    res = []
    for s, body in out:
        parts = split_top(body)
        name = parts[0].strip()
        pos, kw = [], {}
        for p in parts[1:]:
            m = re.match(r'\s*([A-Za-z0-9_ ]+?)\s*=(.*)$', p, re.S)
            if m and not p.strip().startswith('{{'): kw[m.group(1).strip()] = clean(m.group(2))
            else: pos.append(clean(p))
        res.append((s, name, pos, kw))
    return res
def split_top(body):
    parts, depth, cur, i = [], 0, '', 0
    while i < len(body):
        two = body[i:i+2]
        if two in ('{{', '[['): depth += 1; cur += two; i += 2; continue
        if two in ('}}', ']]'): depth -= 1; cur += two; i += 2; continue
        if body[i] == '|' and depth == 0: parts.append(cur); cur = ''; i += 1; continue
        cur += body[i]; i += 1
    parts.append(cur); return parts
def clean(s):
    s = re.sub(r'\{\{\s*tt\s*\|([^|}]*)\|[^}]*\}\}', r'\1', s)
    s = re.sub(r'\{\{\s*(HM|TM)\s*\|([^|}]*)\|([^}]*)\}\}', r'\1\2 \3', s)
    s = re.sub(r'\{\{\s*pdollar\s*\}\}', '₽', s)
    s = re.sub(r'\[\[File:[^\]]*\]\]', '', s)
    s = re.sub(r'\[\[(?:[^|\]]*\|)?([^\]]*)\]\]', r'\1', s)
    s = re.sub(r'\{\{[^{}]*\}\}', '', s)
    s = re.sub(r"'''?|<br\s*/?>|<[^>]+>", ' ', s)
    return re.sub(r'\s+', ' ', s).strip()
def headings(text):
    return [(m.start(), len(m.group(1)), clean(m.group(2))) for m in re.finditer(r'^(=+)\s*(.*?)\s*=+\s*$', text, re.M)]
def heading_at(H, pos):
    path = {}
    for s, lvl, t in H:
        if s > pos: break
        path[lvl] = t
        for k in list(path):
            if k > lvl: del path[k]
    return ' / '.join(path[k] for k in sorted(path))
def lvnorm(s): return s.replace('–', '-').replace('—', '-').replace(' ', '')
def money(s):
    m = re.search(r'₽?\s*([\d,]+)', s or ''); return int(m.group(1).replace(',', '')) if m else None
def parse_page(text):
    T = find_templates(text); H = headings(text)
    wild, trainers, parties, special, items, collect = [], [], [], [], [], []
    method_div = ''; party = None
    for s, name, pos, kw in T:
        h = heading_at(H, s); n = name.lower()
        if n == 'catch/div': method_div = pos[1] if len(pos) > 1 else ''
        elif n in ('catch/entryallday', 'catch/entrytimed') and len(pos) >= 5:
            e = dict(dex=pos[0], name=pos[1], method=pos[2], lv=lvnorm(pos[3]), div=method_div, h=h)
            if n == 'catch/entrytimed': e.update(day=pos[4], night=pos[5] if len(pos) > 5 else '')
            else: e['rate'] = pos[4]
            wild.append(e)
        elif n == 'trainerentry' and len(pos) >= 4:
            cls, nm, prize, cnt = pos[0], pos[1], pos[2], pos[3]
            team = []; rest = pos[4:]
            for i in range(0, len(rest) - 3, 5):
                team.append(dict(name=rest[i+1], lv=rest[i+3]))
            trainers.append(dict(cls=cls, name=nm, prize=money(prize), team=team, h=h))
        elif n.startswith('party/') and n not in ('party/div', 'party/footer'):
            party = dict(kind=name, name=kw.get('name', ''), cls=kw.get('class', ''), diff=kw.get('difficulty', ''),
                         prize=money(kw.get('prize', '')), prize_raw=kw.get('prize', ''), loc=kw.get('location', ''), team=[], h=h)
            parties.append(party)
        elif n == 'party/footer': party = None
        elif n == 'pokémon/trainerboss' and party is not None:
            party['team'].append(dict(name=kw.get('pokemon', '') + (kw.get('form', '') or ''), lv=kw.get('level', ''), held=kw.get('held', '')))
        elif n in ('pokémon/reg', 'pokémon/wildboss'):
            special.append(dict(name=kw.get('pokemon', ''), form=kw.get('form', ''), lv=kw.get('level', ''), boss=n.endswith('wildboss'), h=h))
        elif n == 'itemlist' and pos:
            items.append(dict(name=pos[0], display=kw.get('display', pos[0]), where=pos[1] if len(pos) > 1 else '', h=h))
        elif n == 'missionlist/collect':
            collect.append(dict(mission=kw.get('mission', ''), what=pos[0] if pos else '', where=pos[1] if len(pos) > 1 else '', h=h))
    return dict(wild=wild, trainers=trainers, parties=parties, special=special, items=items, collect=collect)
