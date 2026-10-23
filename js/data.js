/* All data transcribed from unboundwiki.com (Walkthrough Part 1 + Location, Pokémon, Missions & Gyms pages).
   Anything the wiki does not state is marked "TBD". */
window.SRC = {
  wt1: "https://unboundwiki.com/walkthrough/part-1/",
  r1: "https://unboundwiki.com/locations/route-1/",
  fh: "https://unboundwiki.com/locations/frozen-heights/",
  bt: "https://unboundwiki.com/locations/bellin-town/",
  missions: "https://unboundwiki.com/missions/",
  gyms: "https://unboundwiki.com/gyms/"
};

window.MON = {
  vanillite: { name: "Vanillite", types: ["Ice"], dex: 582, abilities: ["Ice Body", "Snow Cloak", "Weak Armor"], held: "Never-Melt Ice (5%)" },
  snorunt:   { name: "Snorunt", types: ["Ice"], dex: 361, abilities: ["Inner Focus", "Ice Body", "Moody"], held: "Snowball (5%)" },
  delibird:  { name: "Delibird", types: ["Ice", "Flying"], dex: 225, abilities: ["Vital Spirit", "Hustle", "Prankster"], held: "None" },
  minior:    { name: "Minior", types: ["Rock", "Flying"], dex: 774, abilities: ["Shields Down"], held: "Star Piece (5%)" },
  beldum:    { name: "Beldum", types: ["Steel", "Psychic"], dex: 374 },
  gible:     { name: "Gible", types: ["Dragon", "Ground"], dex: 496 },
  larvitar:  { name: "Larvitar", types: ["Rock", "Ground"], dex: 246 },
  inkay:     { name: "Inkay", types: ["Dark", "Psychic"], dex: 686 },
  skorupi:   { name: "Skorupi", types: ["Poison", "Bug"], dex: 451 },
  stunky:    { name: "Stunky", types: ["Poison", "Dark"], dex: 434 },
  glameow:   { name: "Glameow", types: ["Normal"], dex: 431 },
  articuno:  { name: "Articuno", types: ["Ice", "Flying"], dex: 144 },
  "magearna-original": { name: "Original Color Magearna", types: [], dex: null },
  vivillon: { name: "Vivillon (Icy Snow)", types: ["Bug", "Flying"], dex: 666, sprite: "assets/pokemon/vivillon-icy-snow.png" },
  "sandslash-a": { name: "Alolan Sandslash", types: ["Ice", "Steel"], dex: null, sprite: "assets/bt/sandslash-a.webp" }
};
window.sprite = id => (MON[id] && MON[id].sprite) || `assets/pokemon/${id}.webp`;

window.LOCS = [
  {
    id: "shadow-base", name: "Shadow Base", color: "#5b3a8c", sub: "Escape sequence",
    wild: [],
    items: [
      { id: "sb-potion-1", name: "Potion", where: "Shadow Base (walkthrough screenshot)", img: "04" },
      { id: "sb-repel", name: "Repel", hidden: true, where: "Shadow Base (walkthrough screenshot)", img: "05" },
      { id: "sb-potion-2", name: "Potion", where: "Shadow Base (walkthrough screenshot)", img: "06" }
    ],
    trainers: [
      { id: "sb-grunt", name: "Shadow Grunt", note: "Double Battle, teamed with your Rival", sprite: "14", reward: "TBD",
        team: [{ mon: "inkay", lv: 7 }, { mon: "skorupi", lv: 7 }] }
    ]
  },
  {
    id: "frozen-heights", name: "Frozen Heights", color: "#2f7fc1", sub: "Your hometown",
    wild: [
      { mon: "articuno", method: "Static Legendary", time: "Post-game", rate: "–", lv: "50", src: "Miraheze: Frozen Heights", note: "Wander around the spot near KBT Expressway" },
      { mon: "magearna-original", method: "Reward Pokémon", time: "–", rate: "–", lv: "1", src: "Miraheze: Frozen Heights", note: "Reward for Mission #069: The National Pokédex" }
    ],
    items: [
      { id: "fh-berry-juice", name: "Berry Juice", where: "In your PC at game start", img: "27" },
      { id: "fh-pokedex", name: "Western Borrius Pokédex", gift: true, where: "Gift from Professor Log (with a Repel & 5 Poké Balls)" },
      { id: "fh-repel", name: "Repel", gift: true, where: "Gift from Professor Log" },
      { id: "fh-pokeballs", name: "Poké Ball ×5", gift: true, where: "Gift from Professor Log" },
      { id: "fh-mission-log", name: "Mission Log", gift: true, where: "Gift from your Mom (Cube component)" },
      { id: "fh-costume-box", name: "Costume Box", gift: true, where: "Speak to your mother in your house", img: "fh/03-pokemon-unbound-costume-box-gift-speak-to-mother.webp" },
      { id: "fh-gem", name: "Psychic / Ground / Dragon Gem", gift: true, where: "Mission #041 reward from your neighbor (type depends on your starter)" },
      { id: "fh-stat-scanner", name: "Stat Scanner", gift: true, where: "Professor Log's Assistant, once 50 Pokémon are caught" },
      { id: "fh-dawn-stone", name: "Dawn Stone", req: "Rock Smash", where: "South of the Shadow Base entrance, past the breakable rock" },
      { id: "fh-zygarde", name: "Zygarde Cell", where: "Top-left corner behind your neighbor's house" },
      { id: "fh-tips-1", name: "Trainer Tips sign #1", src: "Miraheze: Frozen Heights", where: "Beside your house (collectible)" },
      { id: "fh-master-ball", name: "Master Ball", gift: true, src: "Miraheze: Frozen Heights", where: "Mission reward: Portal Purge" },
      { id: "fh-catching-charm", name: "Catching Charm", gift: true, src: "Miraheze: Frozen Heights", where: "Mission reward: The West Borrius Pokédex" }
    ],
    trainers: [
      { id: "fh-rival", name: "Rival (First Round)", note: "Uses the starter strong against yours: you Beldum → he Gible; you Gible → he Larvitar; you Larvitar → he Beldum", sprite: "32", reward: "TBD",
        team: [{ mon: "beldum", lv: 10, alt: true }, { mon: "gible", lv: 10, alt: true }, { mon: "larvitar", lv: 10, alt: true }] },
      { id: "fh-grunt2", name: "Shadow Grunt", note: "North of Frozen Heights, past the Cut tree. She has Prof. Log's package.", sprite: "69", reward: "₽288", src: "Miraheze: Frozen Heights",
        team: [{ mon: "snorunt", lv: 9 }] }
    ]
  },
  {
    id: "route-1", name: "Route 1", color: "#3d9a4f", sub: "Snowy Mountain Pass",
    wild: [
      { mon: "vanillite", method: "Long Grass", time: "Day & Night", rate: "49%", lv: "7–9", src: "Miraheze: Route 1" },
      { mon: "snorunt",   method: "Long Grass", time: "Day & Night", rate: "45%", lv: "7–9", src: "Miraheze: Route 1" },
      { mon: "delibird",  method: "Long Grass", time: "Day & Night", rate: "4%",  lv: "8–9", src: "Miraheze: Route 1" },
      { mon: "minior",    method: "Long Grass", time: "Day & Night", rate: "2%",  lv: "9–10", src: "Miraheze: Route 1" },
      { mon: "vivillon", method: "Special Encounter", time: "–", rate: "–", lv: "50", src: "Miraheze: Route 1", note: "Icy Snow pattern, up a Rock Climb ledge; also counts for the Vivillon pattern mission" }
    ],
    items: [
      { id: "r1-ice-heal", name: "Ice Heal", where: "West side of the route on the highest ledge, between a grove of trees near a patch of long grass", img: "44" },
      { id: "r1-oran", name: "Oran Berry", hidden: true, where: "West side on the southern ledge, north of the Icicle Cave entrance, in a rock", img: "45" },
      { id: "r1-lucky-egg", name: "Lucky Egg", req: "Rock Climb", where: "East of the frozen pond, up a cliff", img: "r1/04-pokemon-unbound-lucky-egg.webp" },
      { id: "r1-zygarde", name: "Zygarde Cell", req: "Mission #070 (Dresco Town)", where: "Southwest of the frozen pond", img: "r1/05-pokemon-unbound-zygarde-cell-southwest-of-frozen-pond.webp" },
      { id: "r1-quick-ball", name: "Quick Ball", gift: true, src: "Miraheze: Route 1", where: "Daily gift from the man at the south end of the route, after his catching tutorial" },
      { id: "r1-tips-2", name: "Trainer Tips sign #2", src: "Miraheze: Route 1", where: "North of the old man (collectible)" }
    ],
    trainers: []
  },
  {
    id: "bellin-town", name: "Bellin Town", color: "#d9502e", sub: "First town past home",
    wild: [
      { mon: "stunky",  method: "Gift Egg", time: "–", rate: "1 of 3", lv: "1", note: "Egg Gentleman. Which of the 3 you get is fixed by your Trainer ID (ID mod 3), so it can't be rerolled" },
      { mon: "skorupi", method: "Gift Egg", time: "–", rate: "1 of 3", lv: "1", note: "Egg Gentleman. Which of the 3 you get is fixed by your Trainer ID (ID mod 3), so it can't be rerolled" },
      { mon: "glameow", method: "Gift Egg", time: "–", rate: "1 of 3", lv: "1", note: "Egg Gentleman. Which of the 3 you get is fixed by your Trainer ID (ID mod 3), so it can't be rerolled" }
    ],
    items: [
      { id: "bt-heal-balls", name: "Heal Ball ×5", gift: true, where: "Speak to the man in the southwest house", img: "54" },
      { id: "bt-beast-balls", name: "Beast Ball ×15", gift: true, where: "Same man, only with the Randomizer difficulty modifier", img: "bt/03-pokemon-unbound-beast-balls-x15-gift-man-in-the-southwest-house.webp" },
      { id: "bt-tm97", name: "TM97 Frost Breath", req: "Rock Climb", where: "Near the northeast house, up a climbable wall", img: "bt/04-pokemon-unbound-tm97-frost-breath-requires-rock-climb-northeast-house.webp" },
      { id: "bt-tm56", name: "TM56 Hone Claws", gift: true, where: "Reward for Mission #067: The Food Thief (completed in Icicle Cave)" },
      { id: "bt-tips-7", name: "Trainer Tips sign #7", src: "Miraheze: Bellin Town", where: "By the path into town (collectible)" },
      { id: "bt-zygarde-3", name: "Zygarde Cell", src: "Miraheze: Bellin Town", where: "East side of town beside the fence" }
    ],
    trainers: [
      { id: "bt-terrance", name: "Poké Fan Terrance", note: "Only after getting Rock Climb", sprite: "bt/11-pokemon-unbound-poke-fan-terrance-after-getting-rock-climb.webp", reward: "₽2,680",
        team: [{ mon: "sandslash-a", lv: 15 }] }
    ]
  }
];

window.BADGES = [
  { id: "leaf", name: "Leaf Badge", gym: "Dresco Town", leader: "Mirskle", type: "Fairy / Grass", color: "#5fb85a" },
  { id: "vision", name: "Vision Badge", gym: "Crater Town", leader: "Véga", type: "Dark", color: "#5a4a6e" },
  { id: "wings", name: "Wings Badge", gym: "Blizzard City", leader: "Alice", type: "Flying", color: "#8ab4e8" },
  { id: "fall", name: "Fall Badge", gym: "Fallshore City", leader: "Mel", type: "Normal (Inverse)", color: "#c9a26b" },
  { id: "battery", name: "Battery Badge", gym: "Dehara City", leader: "Galavan", type: "Electric", color: "#f2c230" },
  { id: "ring", name: "Ring Badge", gym: "Antisis City", leader: "Big Mo", type: "Fighting", color: "#c0392b" },
  { id: "swamp", name: "Swamp Badge", gym: "Polder Town", leader: "Tessy", type: "Water", color: "#2f80c9" },
  { id: "time", name: "Time Badge", gym: "Redwood Village", leader: "Benjamin", type: "Bug", color: "#8fae2a" }
];

window.TYPE_COLORS = {
  Normal: "#a8a77a", Fire: "#ee8130", Water: "#6390f0", Electric: "#d8b51c", Grass: "#7ac74c", Ice: "#69c6c3",
  Fighting: "#c22e28", Poison: "#a33ea1", Ground: "#d6b85a", Flying: "#8f7ee8", Psychic: "#f95587", Bug: "#a6b91a",
  Rock: "#b6a136", Ghost: "#735797", Dragon: "#6f35fc", Dark: "#705746", Steel: "#9a9ab8", Fairy: "#d685ad"
};

/* Free starter giveaways — badge tiers verified against unboundwiki.com "Useful NPCs" pages (Oct 2026).
   page = book page where the NPC appears in this guide. */
window.STARTERS = [
  { region: "Unova", npc: "Unova Starters Lady", mons: ["Snivy", "Tepig", "Oshawott"], where: "Route 5 – west-most house, just west of the Day Care (north of Crater Town)",
    tiers: [[0, 1], [4, 2], [7, 3]], a: "p6u31", page: 108, src: "https://unboundwiki.com/misc-info/useful-npcs/unova-starters-lady/" },
  { region: "Sinnoh", npc: "Sinnoh Starters Lady", mons: ["Turtwig", "Chimchar", "Piplup"], where: "Dehara City – house southeast of the Rift Cave entrance (open the inner doors)",
    tiers: [[0, 1], [6, 2], [8, 3]], a: "p17u89", page: 374, src: "https://unboundwiki.com/misc-info/useful-npcs/sinnoh-starters-lady/" },
  { region: "Alola", npc: "Alola Starters Lady", mons: ["Rowlet", "Litten", "Popplio"], where: "Seaport City – house west of the KBT Expressway entrance (woman with the pink umbrella)",
    tiers: [[0, 1], [7, 2], [8, 3]], a: "p31u84", page: 706, src: "https://unboundwiki.com/misc-info/useful-npcs/alola-starters-lady/" }
];
