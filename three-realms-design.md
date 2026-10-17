# Three Realms: Game Design Document (v2)

Pixel-art browser action RPG built from the Deepforest, Ruin, and Demon Kingdom maps. Single HTML file, no install. All names and story are placeholders to be replaced with the webtoon's real ones.

---

## What Is Playable
- 3 heroes (placeholders): Warrior (melee arc, Spin Slash), Mage (bolt, Frost Nova), Ranger (arrows, Arrow Volley). Dash with brief invulnerability, potions, critical hits.
- Real-time combat, procedurally generated dungeon rooms with waves, then a boss room, loot chest, and exit.
- Inventory (30 slots), equipment (weapon, armor, charm), 6 gear tiers, shop (buy/sell), quests, XP and levels (max 20), save/continue in the browser.
- Controls: WASD/arrows move, Space/J attack, L skill, K dash, R potion, E talk/open, I bag, Q quests, Esc menu. Touch buttons on phones. Mage/Ranger aim with the mouse, or auto-aim at the nearest foe.

---

## World Map

**"Three Kingdoms • One World"**

Three landmasses separated by ocean:
- **West** — Deepforest Kingdom (Forest Realm), surrounded by Serpent's Ocean
- **Center** — Ruin Kingdom (Dungeon Realm)
- **East** — Demon Base Kingdom (Hell Realm)

Named seas: Frostwind Ocean (north), Eternal Sea (center-east), Shadowdeep Ocean (southeast), Sunset Ocean (south), Serpent's Ocean (west).

---

## Kingdoms and Routes

### Deepforest Kingdom
*"The Heart of Nature, The Shield of Life"*

| Location | Type | Level |
|---|---|---|
| Deepforest Kingdom Capital | Town | — |
| Forest Outpost | Forest Location | lv 2 |
| Deep Forest Shrine | Deep Forest Location | lv 4 |
| Eastern Pass | Connection to Other Kingdom | lv 6 |

Route: Capital → Forest Outpost → Deep Forest Shrine → Eastern Pass → **Ruin Kingdom**

---

### Ruin Kingdom
*"Where the past sleeps, the dungeons awaken."*

| # | Location | Type | Level |
|---|---|---|---|
| — | Ruin Kingdom Capital | Town | — |
| 1 | The Shattered Keep | Ancient Dungeon | lv 8 |
| 2 | Forgotten Library | Deep Dungeon | lv 9 |
| 3 | The Hollow Gate | Dungeon | lv 10 |
| 4 | Iron Crypts | Dungeon | lv 11 |
| 5 | Sunken Ruins | Underwater Dungeon | lv 12 |
| 6 | The Broken Colossus | Ancient Ruins | lv 13 |

Connections: To Deepforest Kingdom (Eastern Pass, NW), To Demon Base Kingdom (NE — locked until all 6 relics collected), To Deep Forest (Naval Route, south), To Southern Kingdom (Trade Route, SE — not yet implemented).

Each of the 6 dungeon bosses drops one **Relic**. Collecting all 6 opens the gate to the Demon Base Kingdom.

---

### Demon Base Kingdom
*"Realm of the Fallen — Lava flows. Souls burn. The throne awaits."*

**Overworld route:**
Safe Camp (Entrance) → Demon Outposts (×5, guarding paths) → **Demon Castle**

The kingdom is a lava-and-ash wasteland. Roads are demon paths and bridges over rivers of lava. Demon Outposts guard all approach routes. Entry is from Ruin Kingdom (SW dashed path).

**Demon Castle — 10 Rooms + Throne Room:**

| Room # | Name | Description |
|---|---|---|
| 1 | Entrance Hall | Where you enter the castle |
| 2 | Dining Hall | Feasts for the demon lords |
| 3 | Storage | Supplies and treasures |
| 3 | Storage (east wing) | Mirror storage room |
| 4 | Barracks | Demon soldiers |
| 5 | Alchemy Lab | Dark experiments |
| 6 | Summoning Room | Summon creatures |
| 7 | Torture Chamber | Interrogation and torment |
| 8 | Armory | Weapons and armor |
| 9 | The Grand Hall | Ceremonies and gatherings |
| 10 | Throne Room | The Demon King's throne |

Completing all Demon Castle rooms ends the current content → "To be continued" screen.

---

## Characters

### Warrior
- **Role:** Frontline · Melee · High Defense
- **Description:** A battle-hardened fighter who protects allies and delivers powerful close-range attacks. Strong, disciplined, and always ready for combat.
- **Weapon:** Great Sword
- **Skills:** Spin Slash (placeholder)
- **Stats focus:** STR, DEF

### Mage
- **Role:** Ranged · Magic · High Damage
- **Description:** A gifted spellcaster who channels the power of magic. Flexible, intelligent, and capable of devastating attacks from a distance.
- **Weapon:** Magic Staff
- **Skills:** Magic Bolt, Frost Nova (placeholder)
- **Stats focus:** INT, MP

### Ranger
- **Role:** Ranged · Dexterity · High Mobility
- **Description:** A skilled archer who strikes from a distance with precision. Quick, agile, and at home in nature; masters of the wild.
- **Weapon:** Longbow
- **Skills:** Arrow Shot, Arrow Volley (placeholder)
- **Stats focus:** AGI, LUK

*All three characters are placeholders. Replace names, stats, skills, and sprites with the webtoon's real heroes.*

---

## Enemies

### Regular Enemies

| Name | Notes |
|---|---|
| Slime | Basic enemy |
| Goblin | Armed with dagger |
| Wolf | Fast melee |
| Skeleton Warrior | Armed with sword and shield |
| Spider | Large arachnid |
| Bandit | Cloaked, dual daggers |
| Plant Monster | Tentacled carnivorous plant |
| Rock Golem | Heavy, high HP |

Each enemy type has small-form variants (mini versions for swarms).

### Bosses (Optional / Per Dungeon)

| Name | Notes |
|---|---|
| Forest Guardian | Antlered tree-spirit boss |
| Dungeon Lord | Armored knight with red cape |
| Sea Serpent | Large blue dragon-serpent |
| Sand Golem | Golden armored golem |

---

## Objects & Interactables

| Object | Behavior |
|---|---|
| Treasure Chest | Opens to give loot |
| Barrel | Breakable |
| Crate | Breakable |
| Campfire | Rest / restore HP |
| Signpost | Read for hints |
| Door | Enter / exit rooms |
| Teleport | Portal (blue glowing arch) |
| Save Point | Save game progress |

---

## Collectibles & Resources

| Item | Type |
|---|---|
| Herb | Crafting material |
| Crystal | Crafting material |
| Ore | Crafting material |
| Wood | Crafting material |
| Fish | Food / quest item |
| Mushroom | Food / crafting |
| Gold | Currency |
| Gem | Rare currency / upgrade |
| Health Potion | Consumable |
| Mana Potion | Consumable |
| Quest Item | Scroll |
| Key | Opens locked doors |

---

## Environment Props

Trees, Bush/Flower, Rock, Ruins, Fence, Lantern, Tent, Bridge.

---

## HUD & UI Elements

### Gameplay HUD (top bar)
- Player portrait + HP/MP bars + Level indicator (bottom-left)
- Current location name + enemy count (center-top)
- Quick slot keys K / L, Gold amount, Settings gear (top-right)
- Skill hotbar: Q (potion), 1–4 (skills), I (inventory), M (map), Pause

### Minimap
- Shows current region with color-coded markers (red = enemy, gold = quest, blue = player)
- Zoom in/out buttons

### Quest Tracker (right panel)
- Main Quest (gold diamond icon) + active step
- Side Quest ×2 (blue diamond icons) + progress counters (e.g. 3/10, 2/5)

### Menu Icons
Character, Inventory, Skills, Quests, Map, Settings

### Character / Status Window
- Portrait, Level, Name, Class
- HP / MP bars
- Stats: STR, AGI, INT, DEF, LUK
- Placeholder character name in HUD: **Rai** (Warrior, Lv.12)

### Inventory
- Grid layout, tabs: All / Use / Equip / Material / Quest
- Capacity counter (e.g. 32/100)
- Gold display

### Equipment Screen
- Slots: Weapon, Armor, Boots, Ring
- Item card: name, rarity, ATK range, stat bonuses, flavor text
- Example item: *Silver Sword — Weapon · Rare — ATK 45–58, +12 STR, +8 AGI*

### Dialogue Box
- NPC portrait + name plate + speech text
- Placeholder NPC shown: **Elena**

### Notification / Pop-up
- Item received banner (bottom-right)
- "You found: Gold ×150" chest notification

### Pause Menu
Resume / Inventory / Skills / Quests / Settings / Return to Title

### Skill Effect Examples
- Slash (Warrior) — red crescent arc
- Fireball (Mage) — blue arcane burst
- Arrow Shot (Ranger) — green arrow trail

### Status Effects
Poison · Burn · Freeze · Stun · Heal

### Quick Slot & Potions
Keys Q / W / E / R with potion icons and stack counts.

---

## Placeholders to Replace
- Princess Elara → real story character
- Demon Base Kingdom name
- The six relic names (one per Ruin dungeon boss)
- All NPC names: Sylva, Brin, Mira, Kael, Voss, Orin
- Boss names and taunts
- Quest text
- Warrior / Mage / Ranger: replace with the webtoon's real heroes (names, stats, skills, sprites)
- HUD placeholder name "Rai" and NPC "Elena"

---

## Still Needed from the Author
1. ~~Demon Base Kingdom map (locations and routes).~~ **Done — see Demon Base Kingdom section above.**
2. Real character names, story, and character art or references.
3. Which heroes are playable and what each can do.
4. Boss names and attack patterns for all 6 Ruin dungeons + Demon Castle rooms.
5. Story/quest text for each region.

---

## Ideas for Next Versions
- Party swapping between the three heroes
- More enemy types per region (tie enemy species to biome)
- Town upgrades
- Side quests per location
- Boss patterns from the webtoon
- Music tracks per kingdom
- Real art in place of generated pixel sprites
- Implement Southern Kingdom (Trade Route) teased on Ruin map
- Naval route from Ruin Kingdom to Deep Forest
