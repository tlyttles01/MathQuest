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
