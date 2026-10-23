#!/usr/bin/env python3
"""Polite, cached fetcher for the Pokémon Unbound Wiki on Miraheze (MediaWiki API).
Cache: tools/miraheze/cache/ (wikitext + revision timestamp per page). Re-run with --refresh to refetch."""
import json, os, sys, time, urllib.parse, urllib.request, hashlib
API = 'https://pokemonunbound.miraheze.org/w/api.php'
UA = 'UnboundGuideSync/1.0 (https://unbound-guide.vercel.app; fact gap-fill, cached, 1 req/s)'
HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, 'cache'); os.makedirs(CACHE, exist_ok=True)
REFRESH = '--refresh' in sys.argv
_last = [0.0]
def api(params):
    params = dict(params, format='json', formatversion='2')
    key = hashlib.sha1(json.dumps(params, sort_keys=True).encode()).hexdigest()[:16]
    fp = os.path.join(CACHE, key + '.json')
    if os.path.exists(fp) and not REFRESH:
        return json.load(open(fp))
    wait = 1.0 - (time.time() - _last[0])
    if wait > 0: time.sleep(wait)
    url = API + '?' + urllib.parse.urlencode(params)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=30) as r:
                data = json.load(r); break
        except Exception as e:
            if attempt == 3: raise
            time.sleep(3 * (attempt + 1))
    _last[0] = time.time()
    json.dump(data, open(fp, 'w'))
    return data
def all_titles():
    out, cont = [], {}
    while True:
        d = api(dict(action='query', list='allpages', apnamespace=0, apfilterredir='nonredirects', aplimit=500, **cont))
        out += [p['title'] for p in d['query']['allpages']]
        if 'continue' not in d: return out
        cont = {'apcontinue': d['continue']['apcontinue']}
def redirects():
    out, cont = {}, {}
    while True:
        d = api(dict(action='query', list='allredirects', arnamespace=0, arprop='title', arunique=0, arlimit=500, **cont))
        if 'continue' not in d: break
        cont = {'arcontinue': d['continue']['arcontinue']}
    return out
def pages(titles):
    """Wikitext + last-edit timestamp, 40 titles per request."""
    res = {}
    for i in range(0, len(titles), 40):
        chunk = titles[i:i+40]
        d = api(dict(action='query', prop='revisions', rvprop='content|timestamp', rvslots='main', titles='|'.join(chunk), redirects=1))
        for p in d['query']['pages']:
            if 'revisions' in p:
                r = p['revisions'][0]
                res[p['title']] = {'ts': r['timestamp'], 'text': r['slots']['main']['content']}
    return res
