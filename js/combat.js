window.MathQuest = window.MathQuest || {};

MathQuest.Combat = (() => {
  const worlds = [
    {
      id: "woods",
      name: "Whispering Woods",
      label: "WHISPERING WOODS",
      topic: "basic",
      bossName: "Goblin King",
      bossIcon: "👑",
      completionTitle: "Whispering Woods Cleared!",
      completionText: "You defeated the Goblin King.",
      nextWorldLabel: "Enter Breakstone Mines",
      unlockPowerStrike: true,
      battles: [
        { enemyName: "Tiny Slime", enemySprite: "🟢", enemyImage: "characterImages/tiny-slime.png", enemyMaxHp: 1, difficulty: 1, intent: { name: "Slime Bump", damage: 1, dangerous: false } },
        { enemyName: "Blue Slime", enemySprite: "🔵", enemyImage: "characterImages/blue-slime.png", enemyMaxHp: 2, difficulty: 1, intent: { name: "Bubble Bonk", damage: 1, dangerous: false } },
        { enemyName: "Forest Goblin", enemySprite: "👺", enemyImage: "characterImages/forest-goblin.png", enemyMaxHp: 4, difficulty: 1, intent: { name: "Wooden Club", damage: 1, dangerous: false } },
        { enemyName: "Moss Beetle", enemySprite: "🪲", enemyImage: "characterImages/moss-beetle.png", enemyMaxHp: 5, difficulty: 2, intent: { name: "Horn Tap", damage: 1, dangerous: false } },
        {
          enemyName: "Goblin Brute",
          enemySprite: "👹", enemyImage: "characterImages/goblin-brute.png",
          enemyMaxHp: 7,
          difficulty: 2,
          guardTutorial: true,
          intentCycle: [
            { name: "Club Swing", damage: 1, dangerous: false },
            { name: "Club Swing", damage: 1, dangerous: false },
            { name: "HEAVY SMASH", damage: 4, dangerous: true }
          ]
        },
        {
          enemyName: "Royal Goblin Guard",
          enemySprite: "🛡️", enemyImage: "characterImages/royal-goblin-guard.png",
          enemyMaxHp: 8,
          difficulty: 2,
          intentCycle: [
            { name: "Spear Jab", damage: 1, dangerous: false },
            { name: "Shield Bash", damage: 2, dangerous: false },
            { name: "Spear Jab", damage: 1, dangerous: false }
          ]
        },
        {
          enemyName: "Goblin King",
          enemySprite: "👑", enemyImage: "characterImages/goblin-king.png",
          enemyMaxHp: 10,
          difficulty: 2,
          intentCycle: [
            { name: "Royal Jab", damage: 1, dangerous: false },
            { name: "Crown Crash", damage: 2, dangerous: false },
            { name: "KING'S SMASH", damage: 4, dangerous: true }
          ]
        }
      ]
    },

    {
      id: "mines",
      name: "Breakstone Mines",
      label: "BREAKSTONE MINES",
      topic: "placeValue",
      bossName: "Stone Golem",
      bossIcon: "🪨",
      completionTitle: "Breakstone Mines Cleared!",
      completionText: "You shattered the Stone Golem.",
      nextWorldLabel: "World 3 Coming Soon",
      unlockPowerStrike: false,
      battles: [
        { enemyName: "Pebble Imp", enemySprite: "🪨", enemyImage: "characterImages/pebble-imp.png", enemyMaxHp: 4, difficulty: 1, intent: { name: "Pebble Toss", damage: 1, dangerous: false } },
        { enemyName: "Cave Bat", enemySprite: "🦇", enemyImage: "characterImages/cave-bat.png", enemyMaxHp: 5, difficulty: 1, intent: { name: "Wing Swipe", damage: 1, dangerous: false } },
        { enemyName: "Mine Goblin", enemySprite: "⛏️", enemyImage: "characterImages/mine-goblin.png", enemyMaxHp: 6, difficulty: 2, intent: { name: "Pick Tap", damage: 1, dangerous: false } },
        {
          enemyName: "Crystal Crawler",
          enemySprite: "💎", enemyImage: "characterImages/crystal-crawler.png",
          enemyMaxHp: 8,
          difficulty: 2,
          intentCycle: [
            { name: "Crystal Scratch", damage: 1, dangerous: false },
            { name: "Crystal Scratch", damage: 1, dangerous: false },
            { name: "SHARD BURST", damage: 3, dangerous: true }
          ]
        },
        {
          enemyName: "Rock Brute",
          enemySprite: "🗿", enemyImage: "characterImages/rock-brute.png",
          enemyMaxHp: 10,
          difficulty: 3,
          intentCycle: [
            { name: "Rock Punch", damage: 2, dangerous: false },
            { name: "Rock Punch", damage: 2, dangerous: false },
            { name: "BOULDER DROP", damage: 5, dangerous: true }
          ]
        },
        {
          enemyName: "Stone Sentinel",
          enemySprite: "🛡️", enemyImage: "characterImages/stone-sentinel.png",
          enemyMaxHp: 11,
          difficulty: 3,
          intentCycle: [
            { name: "Stone Jab", damage: 1, dangerous: false },
            { name: "Hammer Swing", damage: 2, dangerous: false },
            { name: "STONE CRUSH", damage: 4, dangerous: true }
          ]
        },
        {
          enemyName: "Stone Golem",
          enemySprite: "🪨", enemyImage: "characterImages/stone-golem.png",
          enemyMaxHp: 14,
          difficulty: 3,
          intentCycle: [
            { name: "Granite Fist", damage: 2, dangerous: false },
            { name: "Granite Fist", damage: 2, dangerous: false },
            { name: "EARTHQUAKE", damage: 5, dangerous: true }
          ]
        }
      ]
    }
  ];

  const state = {
    heroHp: 20,
    heroMaxHp: 20,
    enemyHp: 1,
    enemyMaxHp: 1,
    score: 0,
    streak: 0,
    worldIndex: 0,
    battleIndex: 0,
    turnNumber: 0,
    guardActive: false,
    powerStrikeUnlocked: false,
    heroId: "knight",
    level: 1,
    xp: 0,
    xpToNext: 100
  };

  function currentHero() {
    return MathQuest.Heroes.get(
      state.heroId
    );
  }

  const currentWorld = () => worlds[state.worldIndex];
  const currentBattle = () => currentWorld().battles[state.battleIndex];

  function currentIntent() {
    const battle = currentBattle();

    if (battle.intentCycle) {
      return battle.intentCycle[
        state.turnNumber % battle.intentCycle.length
      ];
    }

    return battle.intent;
  }

  function resetBattle() {
    const battle = currentBattle();

    state.enemyMaxHp = battle.enemyMaxHp;
    state.enemyHp = battle.enemyMaxHp;
    state.turnNumber = 0;
    state.guardActive = false;
  }

  function beginGame() {
    const hero =
      MathQuest.Heroes.get(state.heroId);

    state.heroMaxHp =
      hero.startingMaxHp;

    state.heroHp =
      state.heroMaxHp;
    state.score = 0;
    state.streak = 0;
    state.worldIndex = 0;
    state.battleIndex = 0;
    state.powerStrikeUnlocked = false;
    state.level = 1;
    state.xp = 0;
    state.xpToNext = 100;
    resetBattle();
  }

  function restartCurrentWorld() {
    state.heroHp = state.heroMaxHp;
    state.streak = 0;
    state.battleIndex = 0;
    resetBattle();
  }

  function beginNextWorld() {
    if (state.worldIndex >= worlds.length - 1) {
      return false;
    }

    state.worldIndex++;
    state.battleIndex = 0;

    // Start every world refreshed so practice isn't punished by attrition.
    state.heroHp = state.heroMaxHp;
    state.streak = 0;

    resetBattle();
    return true;
  }

  function addCorrect() {
    state.streak++;

    const points =
      10 +
      Math.min(state.streak - 1, 5) * 5;

    state.score += points;

    return {
      points
    };
  }

  function addXp(amount) {
    state.xp += amount;

    let leveledUp = false;
    let newLevel = state.level;

    while (state.xp >= state.xpToNext) {
      state.xp -= state.xpToNext;
      state.level++;
      newLevel = state.level;
      leveledUp = true;

      // Each level makes the Knight sturdier without
      // shortening the math practice by increasing damage.
      state.heroMaxHp += 2;
      state.heroHp = state.heroMaxHp;

      // Slightly larger requirement for the next level.
      state.xpToNext = 100 + (state.level - 1) * 25;
    }

    return {
      leveledUp,
      newLevel
    };
  }

  function getBattleXpReward() {
    const battle =
      currentBattle();

    /*
      Reward more XP for later battles and bosses,
      while keeping the first world tuned to reach
      Level 2 before World 2.
    */
    const baseXp =
      10;

    const difficultyBonus =
      (battle.difficulty - 1) * 3;

    const bossBonus =
      state.battleIndex ===
      currentWorld().battles.length - 1
        ? 18
        : 0;

    return (
      baseXp +
      difficultyBonus +
      bossBonus
    );
  }

  function addWrong() {
    state.streak = 0;
  }

  function useSkill(skill, hinted) {
    if (skill === "guard") {
      state.guardActive = true;

      return {
        kind: "guard",
        value: 0
      };
    }

    const baseDamage =
      skill === "power"
        ? 4
        : 2;

    const damage =
      hinted
        ? baseDamage * 0.75
        : baseDamage;

    state.enemyHp =
      Math.max(
        0,
        state.enemyHp - damage
      );

    return {
      kind: "damage",
      value: damage
    };
  }

  function enemyAttack() {
    const intent =
      currentIntent();

    if (state.guardActive) {
      state.guardActive = false;
      state.turnNumber++;

      return {
        blocked: true,
        damage: 0,
        intent
      };
    }

    state.heroHp =
      Math.max(
        0,
        state.heroHp - intent.damage
      );

    state.turnNumber++;

    return {
      blocked: false,
      damage: intent.damage,
      intent
    };
  }

  function unlockPowerStrike() {
    state.powerStrikeUnlocked = true;
  }

  function advanceBattle() {
    if (
      state.battleIndex >=
      currentWorld().battles.length - 1
    ) {
      return false;
    }

    state.battleIndex++;
    resetBattle();

    return true;
  }

  return {
    worlds,
    state,

    currentHero,
    currentWorld,
    currentBattle,
    currentIntent,

    beginGame,
    beginNextWorld,
    restartCurrentWorld,

    resetBattle,

    addCorrect,
    addXp,
    getBattleXpReward,
    addWrong,

    useSkill,
    enemyAttack,

    unlockPowerStrike,
    advanceBattle
  };
})();
