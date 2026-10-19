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
      { mon: "articuno", method: "Static Legendary", time: "Post-game", rate: "–", lv: "TBD", note: "Wander around the spot near KBT Expressway" },
      { mon: "magearna-original", method: "Reward Pokémon", time: "–", rate: "–", lv: "TBD", note: "Reward for Mission #069: The National Pokédex" }
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
      { id: "fh-zygarde", name: "Zygarde Cell", where: "Top-left corner behind your neighbor's house" }
    ],
    trainers: [
      { id: "fh-rival", name: "Rival (First Round)", note: "Uses the starter strong against yours: you Beldum → he Gible; you Gible → he Larvitar; you Larvitar → he Beldum", sprite: "32", reward: "TBD",
        team: [{ mon: "beldum", lv: 10, alt: true }, { mon: "gible", lv: 10, alt: true }, { mon: "larvitar", lv: 10, alt: true }] },
      { id: "fh-grunt2", name: "Shadow Grunt", note: "North of Frozen Heights, past the Cut tree. She has Prof. Log's package.", sprite: "69", reward: "TBD",
        team: [{ mon: "snorunt", lv: 9 }] }
    ]
  },
  {
    id: "route-1", name: "Route 1", color: "#3d9a4f", sub: "Snowy Mountain Pass",
    wild: [
      { mon: "vanillite", method: "Long Grass", time: "Day & Night", rate: "49%", lv: "TBD" },
      { mon: "snorunt",   method: "Long Grass", time: "Day & Night", rate: "45%", lv: "TBD" },
      { mon: "delibird",  method: "Long Grass", time: "Day & Night", rate: "4%",  lv: "TBD" },
      { mon: "minior",    method: "Long Grass", time: "Day & Night", rate: "2%",  lv: "TBD" }
    ],
    items: [
      { id: "r1-ice-heal", name: "Ice Heal", where: "West side of the route on the highest ledge, between a grove of trees near a patch of long grass", img: "44" },
      { id: "r1-oran", name: "Oran Berry", hidden: true, where: "West side on the southern ledge, north of the Icicle Cave entrance, in a rock", img: "45" },
      { id: "r1-lucky-egg", name: "Lucky Egg", req: "Rock Climb", where: "East of the frozen pond, up a cliff", img: "r1/04-pokemon-unbound-lucky-egg.webp" },
      { id: "r1-zygarde", name: "Zygarde Cell", req: "Mission #070 (Dresco Town)", where: "Southwest of the frozen pond", img: "r1/05-pokemon-unbound-zygarde-cell-southwest-of-frozen-pond.webp" }
    ],
    trainers: []
  },
  {
    id: "bellin-town", name: "Bellin Town", color: "#d9502e", sub: "First town past home",
    wild: [
      { mon: "stunky",  method: "Gift Egg", time: "–", rate: "1 of 3", lv: "1", note: "Pokémon Egg Gentleman" },
      { mon: "skorupi", method: "Gift Egg", time: "–", rate: "1 of 3", lv: "1", note: "Pokémon Egg Gentleman" },
      { mon: "glameow", method: "Gift Egg", time: "–", rate: "1 of 3", lv: "1", note: "Pokémon Egg Gentleman" }
    ],
    items: [
      { id: "bt-heal-balls", name: "Heal Ball ×5", gift: true, where: "Speak to the man in the southwest house", img: "54" },
      { id: "bt-beast-balls", name: "Beast Ball ×15", gift: true, where: "Same man, only with the Randomizer difficulty modifier", img: "bt/03-pokemon-unbound-beast-balls-x15-gift-man-in-the-southwest-house.webp" },
      { id: "bt-tm97", name: "TM97 Frost Breath", req: "Rock Climb", where: "Near the northeast house, up a climbable wall", img: "bt/04-pokemon-unbound-tm97-frost-breath-requires-rock-climb-northeast-house.webp" },
      { id: "bt-tm56", name: "TM56 Hone Claws", gift: true, where: "Reward for Mission #067: The Food Thief (completed in Icicle Cave)" }
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
