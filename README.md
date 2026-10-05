# Math Quest v2

This version adds the first actual roguelike progression loop.

## Battle sequence

### Battle 1 — Tiny Slime
- 1 HP
- One correct offensive answer wins immediately.
- Enemy cannot attack if defeated.

### Battle 2 — Blue Slime
- 2 HP
- Starts introducing multi-question combat.
- Good place to test Power Strike and breaking a ten.

### Battle 3 — Armored Slime
- 5 HP
- Longer battle.
- Guard and Fortitude matter.

## Knight

### Passive — Fortitude
Every 3 correct answers in a row grants 1 Armor.
Armor blocks the next enemy attack.

## Skills

- Sword Slash — subtraction
- Power Strike — break-a-ten subtraction
- Guard — missing-number problem, no damage
- Second Wind — word problem, heal 2 HP

Hints reduce the selected skill effect to 75%.

## Workspace

- +10 adds a ten rod.
- +1 adds a one square.
- Cross Out marks a block with an X without removing it.
- Break a 10 replaces one ten rod with 10 ones.
- Remove deletes a block.
- Clear All clears the workspace.
- No running total is shown.

## First upgrade choice

After Battle 3, choose one:

- Sharp Blade — Sword Slash +1 damage
- Reinforced Shield — Guard blocks 2 attacks
- Hearty Meal — +2 max HP and full heal

## Deploy to GitHub Pages

Keep these at the repository root:

```text
index.html
css/
js/
README.md
```

Commit and push to the same branch GitHub Pages is publishing.
