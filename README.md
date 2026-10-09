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


## v21 realistic coin recognition

The Vault no longer prints 1¢ / 5¢ / 10¢ / 25¢ on the coins themselves. Coins now use custom U.S.-style illustrated faces with recognizable relative sizes, copper/silver coloring, portrait/reverse details, and mixed heads/tails. The internal values are unchanged, so the player must recognize the coin type instead of reading the answer from the coin.

This release also completes the interactive coin-tray workspace code used by the v20 money-removal questions.


## v22 coin recognition and word-problem layout

- Increased the visual size difference between nickel, dime, and quarter.
- Nickel now has a smooth edge; dime and quarter have clearly ridged edges.
- Silver tones and portrait scaling differ more so the coins are easier to recognize without printed cent values.
- Living Library word problems now wrap inside the question area instead of inheriting the one-line equation rule.
- Long story text uses a smaller responsive font and is bounded to the page width.


## v23 supplied coin artwork

The Vault now uses the user-provided pixel-art images for:
- penny
- nickel
- dime
- quarter

Half-dollar and dollar-coin artwork from the reference sheet are intentionally not used.

The coins no longer display generated cent values or generic SVG portraits. Their existing relative game sizes remain different so students can use the visual appearance and physical size cues to identify them.


## v24 layout + penny fixes

- Penny artwork is now copper-tinted while preserving the supplied pixel-art details.
- Long narrative prompts now wrap inside the question card instead of forcing horizontal overflow.
- Living Library word problems use a smaller responsive font and normal wrapping.
- Long Vault prompts such as "You have 65¢..." also wrap correctly.
- Only short equation-style prompts remain forced onto one line.


## v25 monster art

Added supplied pixel-art monster sprites for all 21 enemies in:
- Living Library
- The Vault
- Clocktower

The previous emoji placeholders have been replaced with image files in `characterImages/`.


## v26 transparent monster sprites

The 21 supplied monster sprites for Living Library, The Vault, and Clocktower now use transparent PNG backgrounds. The printed labels from the original sprite sheet are excluded from the individual assets.


## v27 Living Library improvements

- Rewrote Living Library story problems to use clearer, more natural wording.
- Added more distinct difficulty progression for one-step and two-step stories.
- Added a real Scratch Pad workspace to Living Library.
- Scratch Pad supports mouse, touch, and stylus drawing.
- Includes Draw, Erase, and Clear controls.
- Scratch work is never graded; it is only a solving aid.
- Word problems are explicitly constrained to the question column and wrap responsively.


## v28 Living Library equation builder

The drawing scratch pad has been removed.

Living Library now uses a structured equation builder:

`___  [ + / - ]  ___  =  ___`

Students can:
- enter the first number from the story
- choose addition or subtraction
- enter the second number
- solve the result

The result field automatically syncs to the normal answer field so the player does not need to type the answer twice.


## v29 adventure progression

Added the first full progression layer:

- Automatic local save data using browser localStorage
- Continue Adventure
- Start New Adventure
- Adventure Map
- Locked/unlocked world progression
- Five-crystal collection tracker
- Crystal reward after each world boss
- Completed-world status on the map
- Resume world/battle saved automatically
- Knight level, XP, max HP, score, and Power Strike unlock saved
- Practice mode remains available separately and can still jump to any world

Save data is device/browser-local for now. A future account/cloud-save system can replace the storage layer without changing the progression UI.


## v30 Living Library overhaul

- Removed the leftover Scratch Pad HTML and CSS completely.
- Expanded the Living Library to many more story templates.
- Added anti-repeat logic that avoids recently used story types.
- Normal word problems use `___ [ + / − ] ___ = ___`.
- Power Strike word problems use two-step builders: `___ [ + / − ] ___ [ + / − ] ___ = ___`.
- Living Library no longer shows a duplicate normal answer box.
- The game checks the numbers, chosen operation(s), and final result.


## v31 Focus system

Power Strike is no longer the obvious best action every turn.

- Knight has a 3-point Focus meter.
- Each battle starts with at least 1 Focus.
- Correct Sword Slash: 2 damage + 1 Focus.
- Correct Guard: blocks the incoming attack + 1 Focus.
- Power Strike: harder question, 4 damage, costs 2 Focus.
- Power Strike is disabled when Focus is below 2.
- Focus is shown beneath the Knight's XP bar.
- Focus is included in local save data.

This creates a simple rhythm:
`Slash / Guard -> build Focus -> Power Strike -> rebuild Focus`.


## v32 corrective build

This build specifically fixes the three reported regressions:

1. Removed all remaining Scratch Pad HTML/CSS. Living Library uses only the equation builder.
2. Fixed Focus gain so correct Sword Slash and Guard answers actually grant +1 Focus. Power Strike costs 2 Focus and is disabled below 2.
3. Restored a prominent World Complete flow with a crystal reward and an explicit `Continue to [Next World]` button.

A small `v32` badge appears above the world name so the deployed build can be verified immediately.


## v33 Power Strike polish

- Added a first-use Power Strike tutorial explaining Focus, harder questions, and 4-damage payoff.
- Fixed Living Library Power Strike so the two-step builder always shows four number boxes:
  `___ [op] ___ [op] ___ = ___`
- Expanded Power Strike word problems to include `+ -`, `- +`, `+ +`, and `- -` story structures.
- Added generation rules that strongly avoid problems where the final answer is the same as, or almost the same as, the starting amount.
- Power Strike tutorial is remembered in the local save so it does not repeat every session.


## v34 Practice isolation

Practice mode is now fully separate from Adventure progression.

- Entering Practice stores an in-memory snapshot of the current Adventure hero.
- Practice may temporarily gain XP, levels, HP, score, Focus, etc.
- None of those Practice changes are written to the Adventure save.
- Returning to Adventure restores the exact Adventure snapshot from before Practice.
- Practice world completion does not award crystals, unlock Adventure worlds, or permanently unlock skills.
- Practice completion now offers `Return to Adventure`.
- The HUD labels the current world with `PRACTICE` while in Practice Mode.


## v35 Mid-world merchant and Skill Stars

- Added Skill Stars earned from correct-answer streak milestones:
  - streak 3 -> +1 Skill Star
  - streak 5 -> +1
  - streak 7 -> +1
  - streak 10 -> +1
- Each milestone can pay out once per world.
- Skill Stars survive a broken streak but reset when a new world begins.
- A Traveling Merchant appears after Battle 4, before Battle 5.
- Merchant items:
  - Healing Potion (1 Star): restore 5 HP immediately
  - Focus Potion (1 Star): gain 2 Focus immediately
  - Counter Shield (2 Stars): next correct Sword Slash also blocks the enemy attack
  - Second Chance Charm (2 Stars): next wrong answer does not trigger an enemy attack
- Each shop item may be purchased once per world.
- Practice Mode gets its own temporary Skill Stars and shop purchases; they disappear when returning to Adventure.
- Adventure shop state is included in the local save.
