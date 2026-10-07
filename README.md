# Math Quest v8

## Major changes

- Knight now starts with 20 HP.
- Every world starts with full HP.
- Whispering Woods expanded from 5 battles to 7.
- Breakstone Mines added as World 2 with 7 battles.
- Power Strike unlocks after defeating the Goblin King and is usable in Breakstone Mines.
- Breakstone Mines focuses on:
  - tens and ones
  - place value
  - adding ones
  - subtracting without regrouping
  - breaking a ten / regrouping
- Power Strike in Breakstone Mines specifically favors harder break-a-ten subtraction questions.
- Guard remains available after it is introduced.
- World completion remains a popup over the battle screen.

## World 1 — Whispering Woods

1. Tiny Slime
2. Blue Slime
3. Forest Goblin
4. Moss Beetle
5. Goblin Brute
6. Royal Goblin Guard
7. Goblin King

Boss reward: Power Strike.

## World 2 — Breakstone Mines

1. Pebble Imp
2. Cave Bat
3. Mine Goblin
4. Crystal Crawler
5. Rock Brute
6. Stone Sentinel
7. Stone Golem

## Suggested commit

```text
feat: add Breakstone Mines and expand worlds to seven battles
```

## v9 character art

The generated pixel-art characters are now stored in:

```text
characterImages/
```

The Knight and all current Whispering Woods / Breakstone Mines enemies use these image assets instead of emoji battle sprites.


## v10 math skill behavior

Skills no longer choose a different math subject.

The current world determines the math topic:

- Sword Slash = normal version of the current world's math
- Guard = normal version of the current world's math
- Power Strike = harder version of the same math topic

### Breakstone Mines progression

Early:
- `27 = □ + 20`
- `40 + □ = 46`
- Challenge examples: `27 = 7 + □`

Middle:
- normal addition/subtraction without regrouping
- challenge questions cross a ten

Late:
- normal break-a-ten subtraction such as `42 - 7`
- Power Strike can ask two-digit regrouping such as `53 - 18`


## v11 layout

The lower learning area is now permanently split into two columns:

- Left: question, answer field, attack button, and hint.
- Right: always-visible block workspace.

The block workspace no longer collapses, so the player can see the full problem and manipulatives at the same time.


## v12 experience / leveling

Experience now has a gameplay purpose.

- Every correct answer gives **5 XP**.
- Level 2 requires **100 XP**.
- A perfect Sword Slash-only run through the 7 Whispering Woods battles is designed to land around the first level-up before entering World 2.
- Every level grants:
  - **+2 maximum HP**
  - **full heal**
- Damage does **not** increase on level-up so leveling does not reduce the amount of math practice.
- XP and level are shown beside the Knight with a visible XP bar.
- Level-up uses a dedicated popup celebration.


## v13 story / missing-number display

- Missing-number equations now use `___` instead of the square symbol.
- A short opening story now appears before the first battle.
- The story establishes the five learning crystals and the Knight's journey through:
  - Whispering Woods
  - Breakstone Mines
  - Living Library
  - The Vault
  - Clocktower


## v14 hero/class-ready structure

The story no longer treats the Knight as the only possible chosen hero.

The opening now explains that heroes from across the kingdom are searching for the five learning crystals, and that the adventure currently begins with the Knight.

A new file was added:

```text
js/heroes.js
```

Hero definitions now live there. The current Knight definition includes:

- hero id
- display name
- sprite image
- starting max HP
- unlock status
- description

The battle UI reads the active hero's name and image from this registry. This makes it much easier to add classes such as Mage or Ranger later without rebuilding the page layout.

The current active hero remains:

```text
knight
```

Future hero-specific mechanics can be layered onto this structure later.


## v15 post-battle XP

XP is no longer awarded on each correct answer.

- Correct answers still increase score and streak.
- XP is awarded only after an enemy is defeated.
- The Victory popup now includes an animated XP progress bar.
- The Next Battle button stays disabled until the XP animation completes.
- If the bar fills:
  - it visibly reaches 100%
  - a level-up message appears
  - the bar resets for the next level
  - the Knight receives +2 max HP and a full heal
- Later/harder battles award slightly more XP, and bosses receive an XP bonus.


## v16 XP timing

XP is now strictly a post-battle reward.

- Correct answers give score and streak only.
- Defeating an enemy opens the Victory popup.
- The XP bar then animates from its current value to the new value.
- Next Battle stays disabled until the animation finishes.
- Level-up happens inside that same XP animation instead of a separate level-up popup.
- Whispering Woods is tuned to reach Level 2 after defeating the Goblin King:
  - Battles 1–3: 10 XP each
  - Battles 4–6: 13 XP each
  - Goblin King: 31 XP
  - Total: 100 XP
- Level 2 still grants +2 maximum HP and a full heal.


## v17 equation layout

Longer fill-in-the-blank equations now stay on one line. Examples such as `27 = ___ + 20` automatically use a slightly smaller font instead of wrapping.


## v18 world selection and all five worlds

Choose World now allows direct practice in any area:

1. Whispering Woods — basic addition/subtraction
2. Breakstone Mines — place value/decomposition/regrouping
3. Living Library — story problems
4. The Vault — money
5. Clocktower — time

Each world has 7 battles. Later-world enemies use emoji placeholders until dedicated art is added. Choosing a later world restores full HP and enables Power Strike for focused practice.


## v19 visual money and clock questions

### The Vault
Money questions now show visual coin groups instead of text-only coin facts.

Examples:
- five nickel images -> `___ cents`
- mixed coin images for Power Strike challenge questions

Coins are rendered visually with their cent values.

### Clocktower
Clocktower questions now show an analog clock face.

The player types the time into two fields:

```text
[ hour ] : [ minutes ]
```

The colon is always shown, so the player never needs to type it.

Normal difficulty begins with hour/half-hour clocks, then adds quarter-hour and 5-minute increments. Power Strike uses the harder clock readings from the same world topic.


## v20 world-specific tools

- Whispering Woods and Breakstone Mines keep the base-10 block workspace.
- Living Library hides the block workspace so word problems have more room.
- The Vault uses an interactive coin tray for subtraction/give-away problems. The player taps coins to move them into a Give to your friend area, then submits the tray. No running total is displayed.
- Clocktower hides the block workspace and enlarges the analog clock. Power Strike now asks elapsed-time subtraction questions such as showing 7:45 and asking the player to subtract 15 minutes, with 7:30 as the answer.
- Later normal Vault battles can also use coin-removal problems; Power Strike always uses them.
