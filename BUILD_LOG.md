# Build log: full-guide extension
- [x] Fetched walkthrough parts 1–40 (40 = post-game) and 8 gym pages -> /workspace/unbound-build/raw
- [x] parse.py -> parts/part-N.json (sections, figs, maps+legends, items, wild, trainers, encounters, tables)
- [x] parse_gyms.py -> parts/gyms.json (teams for Vanilla/Difficult/Expert/Insane)
- [ ] download images (4739 urls) -> dl/
- [ ] convert to WebP (full + lite)
- [ ] units + measure + paginate
- [ ] app: virtualized book, chapter tabs, badge tabs -> gym spreads, PokéGear for all locations
- [ ] verify per chapter, zips

## Complete edition progress (Oct 18)
- [x] All 40 parts parsed → data/p2–p40.js; paginated into 950 pages (build2.py, real measurement)
- [x] Ch1 assets converted to WebP (21MB → 2.9MB)
- [x] app.js rewritten: virtualized leaves (±3/2), riffle jumps, chapter tab overlay, badge tabs → gym spreads, generated PokéGear locs
- [x] Gym spreads: difficulty switcher, compact 5–6 mon layout
- [x] Re-measured with images loaded; LIMIT tuned → 921 pages, overflow+folio scan clean on every spread
- [x] Screenshots per chapter, gyms, PokéGear, lightbox, riffle, mobile → screenshots/v2/
- [x] Lite build (<25MB) + zips

## v3 Trainer's Journal (2026-10-18)
- [x] journal.css theme + fonts-journal.css; re-measured & re-paginated (925 pages; scan clean except a 3px folio gap on p.838)
- [x] annotations (DrawSVG), stickers, badge stamp, Poké Ball toggles, night mode, settings tab
- [x] Three.js intro + 2D/reduced-motion fallback, skip remembered; portrait fog fix
- [x] screenshots/v3, lite synced, zips rebuilt
- v2 backup: /workspace/unbound-build/v2-backup + unbound-guide-v2.zip
