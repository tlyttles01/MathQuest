# Math Quest Starter

First playable vertical slice for the Knight.

## Included

- Knight vs. Training Slime
- First two battles use 1 HP enemies
- Later training battles use 3 HP enemies
- Sword Slash, Power Strike, Guard, Second Wind
- Knight passive: Fortitude
  - Every 3 correct answers grants 1 Armor
- Streak-based score
- Hints reduce skill effectiveness to 75%
- Base-10 workspace
  - +10 rod
  - +1 square
  - Cross out blocks
  - Break a ten rod into 10 individual ones
  - Remove blocks
  - Clear all
- No visible workspace total
- No database or Firebase yet

## Run it

The simplest option:

1. Extract the ZIP.
2. Open `index.html` in Chrome.

For development, running it through a tiny local web server is nicer because browser refresh behavior is more predictable.

If Python is installed:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Next milestone

After testing this battle loop with your daughter:

1. Adjust workspace interactions based on how she actually uses the blocks.
2. Add tutorial battles 1–3.
3. Add a short Whispering Woods run.
4. Add temporary upgrade choices.
5. Add the first boss.
6. Add Mage unlock and Focus.
7. Only then add Firebase persistence.
