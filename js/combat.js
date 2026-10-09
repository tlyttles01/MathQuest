window.MathQuest = window.MathQuest || {};

MathQuest.Combat = (() => {
  const worlds = [
    {
      id:"woods", name:"Whispering Woods", label:"WHISPERING WOODS", topic:"basic",
      description:"Addition and subtraction basics",
      bossName:"Goblin King", bossIcon:"👑",
      completionTitle:"Whispering Woods Cleared!",
      completionText:"You defeated the Goblin King and recovered the Forest Crystal.",
      nextWorldLabel:"Enter Breakstone Mines", unlockPowerStrike:true, crystalName:"Forest Crystal",
      battles:[
        {enemyName:"Tiny Slime",enemyImage:"characterImages/tiny-slime.png",enemyMaxHp:6,difficulty:1,role:"Skirmisher",roleText:"Low health · steady attacks",intent:{name:"Slime Bump",damage:2,dangerous:false}},
        {enemyName:"Blue Slime",enemyImage:"characterImages/blue-slime.png",enemyMaxHp:7,difficulty:1,role:"Skirmisher",roleText:"Quick attacks · low health",intentCycle:[
          {name:"Bubble Bonk",damage:2,dangerous:false},{name:"Bubble Bonk",damage:2,dangerous:false},{name:"Bubble Pop",damage:3,dangerous:false}]},
        {enemyName:"Forest Goblin",enemyImage:"characterImages/forest-goblin.png",enemyMaxHp:9,difficulty:1,role:"Trickster",roleText:"Attack strength changes each turn",intentCycle:[
          {name:"Wooden Club",damage:2,dangerous:false},{name:"Sneaky Jab",damage:3,dangerous:false},{name:"Quick Kick",damage:2,dangerous:false}]},
        {enemyName:"Moss Beetle",enemyImage:"characterImages/moss-beetle.png",enemyMaxHp:12,difficulty:2,role:"Tank",roleText:"More health · lighter attacks",intent:{name:"Horn Tap",damage:2,dangerous:false}},
        {enemyName:"Goblin Brute",enemyImage:"characterImages/goblin-brute.png",enemyMaxHp:14,difficulty:2,role:"Heavy Hitter",roleText:"Watch for its huge third attack",guardTutorial:true,intentCycle:[
          {name:"Club Swing",damage:2,dangerous:false},{name:"Club Swing",damage:2,dangerous:false},{name:"HEAVY SMASH",damage:6,dangerous:true}]},
        {enemyName:"Royal Goblin Guard",enemyImage:"characterImages/royal-goblin-guard.png",enemyMaxHp:16,difficulty:2,role:"Tank",roleText:"Tough defense · mixed attacks",intentCycle:[
          {name:"Spear Jab",damage:2,dangerous:false},{name:"Shield Bash",damage:3,dangerous:false},{name:"Spear Jab",damage:2,dangerous:false}]},
        {enemyName:"Goblin King",enemyImage:"characterImages/goblin-king.png",enemyMaxHp:22,difficulty:2,role:"Boss",roleText:"Learn the pattern and time your Guard",intentCycle:[
          {name:"Royal Jab",damage:2,dangerous:false},{name:"Crown Crash",damage:3,dangerous:false},{name:"KING'S SMASH",damage:7,dangerous:true}]}
      ]
    },
    {
      id:"mines", name:"Breakstone Mines", label:"BREAKSTONE MINES", topic:"placeValue",
      description:"Place value, decomposing, and regrouping",
      bossName:"Stone Golem", bossIcon:"🪨",
      completionTitle:"Breakstone Mines Cleared!",
      completionText:"You shattered the Stone Golem and recovered the Earth Crystal.",
      nextWorldLabel:"Enter Living Library", unlockPowerStrike:false, crystalName:"Earth Crystal",
      battles:[
        {enemyName:"Pebble Imp",enemyImage:"characterImages/pebble-imp.png",enemyMaxHp:9,difficulty:1,role:"Skirmisher",roleText:"Low health · quick stone tosses",intent:{name:"Pebble Toss",damage:2,dangerous:false}},
        {enemyName:"Cave Bat",enemyImage:"characterImages/cave-bat.png",enemyMaxHp:10,difficulty:1,role:"Trickster",roleText:"Its damage changes from turn to turn",intentCycle:[
          {name:"Wing Swipe",damage:2,dangerous:false},{name:"Dive Bite",damage:3,dangerous:false},{name:"Wing Swipe",damage:2,dangerous:false}]},
        {enemyName:"Mine Goblin",enemyImage:"characterImages/mine-goblin.png",enemyMaxHp:12,difficulty:2,role:"Skirmisher",roleText:"Steady pressure",intent:{name:"Pick Tap",damage:3,dangerous:false}},
        {enemyName:"Crystal Crawler",enemyImage:"characterImages/crystal-crawler.png",enemyMaxHp:14,difficulty:2,role:"Heavy Hitter",roleText:"Shard Burst is the danger turn",intentCycle:[
          {name:"Crystal Scratch",damage:2,dangerous:false},{name:"Crystal Scratch",damage:2,dangerous:false},{name:"SHARD BURST",damage:6,dangerous:true}]},
        {enemyName:"Rock Brute",enemyImage:"characterImages/rock-brute.png",enemyMaxHp:17,difficulty:3,role:"Heavy Hitter",roleText:"Slow, predictable, powerful",intentCycle:[
          {name:"Rock Punch",damage:3,dangerous:false},{name:"Rock Punch",damage:3,dangerous:false},{name:"BOULDER DROP",damage:7,dangerous:true}]},
        {enemyName:"Stone Sentinel",enemyImage:"characterImages/stone-sentinel.png",enemyMaxHp:19,difficulty:3,role:"Tank",roleText:"High health with a dangerous finisher",intentCycle:[
          {name:"Stone Jab",damage:2,dangerous:false},{name:"Hammer Swing",damage:3,dangerous:false},{name:"STONE CRUSH",damage:6,dangerous:true}]},
        {enemyName:"Stone Golem",enemyImage:"characterImages/stone-golem.png",enemyMaxHp:27,difficulty:3,role:"Boss",roleText:"Huge health · devastating Earthquake",intentCycle:[
          {name:"Granite Fist",damage:3,dangerous:false},{name:"Granite Fist",damage:3,dangerous:false},{name:"EARTHQUAKE",damage:7,dangerous:true}]}
      ]
    },
    {
      id:"library", name:"Living Library", label:"LIVING LIBRARY", topic:"story",
      description:"Story problems and choosing the operation",
      bossName:"The Great Book", bossIcon:"📕",
      completionTitle:"Living Library Cleared!",
      completionText:"You closed the Great Book and recovered the Story Crystal.",
      nextWorldLabel:"Enter The Vault", unlockPowerStrike:false, crystalName:"Story Crystal",
      battles:[
        {enemyName:"Letter Sprite",enemyImage:"characterImages/letter-sprite.png",enemyMaxHp:9,difficulty:1,role:"Skirmisher",roleText:"Quick magical attacks",intent:{name:"Letter Flick",damage:2,dangerous:false}},
        {enemyName:"Bookworm",enemyImage:"characterImages/bookworm.png",enemyMaxHp:11,difficulty:1,role:"Tank",roleText:"Sturdy but not very dangerous",intent:{name:"Page Nibble",damage:2,dangerous:false}},
        {enemyName:"Possessed Book",enemyImage:"characterImages/possessed-book.png",enemyMaxHp:13,difficulty:2,role:"Trickster",roleText:"Alternates light and stronger attacks",intentCycle:[
          {name:"Page Slap",damage:2,dangerous:false},{name:"Flying Cover",damage:4,dangerous:false},{name:"Page Slap",damage:2,dangerous:false}]},
        {enemyName:"Ink Blob",enemyImage:"characterImages/ink-blob.png",enemyMaxHp:14,difficulty:2,role:"Heavy Hitter",roleText:"Ink Burst is the danger turn",intentCycle:[
          {name:"Ink Splash",damage:2,dangerous:false},{name:"Ink Splash",damage:2,dangerous:false},{name:"INK BURST",damage:6,dangerous:true}]},
        {enemyName:"Riddle Raven",enemyImage:"characterImages/riddle-raven.png",enemyMaxHp:16,difficulty:2,role:"Trickster",roleText:"Unpredictable pecks",intentCycle:[
          {name:"Riddle Peck",damage:2,dangerous:false},{name:"Riddle Peck",damage:4,dangerous:false},{name:"Feather Flick",damage:2,dangerous:false}]},
        {enemyName:"Library Guardian",enemyImage:"characterImages/library-guardian.png",enemyMaxHp:20,difficulty:3,role:"Heavy Hitter",roleText:"Guard the Shelf Slam",intentCycle:[
          {name:"Book Bash",damage:3,dangerous:false},{name:"Book Bash",damage:3,dangerous:false},{name:"SHELF SLAM",damage:7,dangerous:true}]},
        {enemyName:"The Great Book",enemyImage:"characterImages/the-great-book.png",enemyMaxHp:28,difficulty:3,role:"Boss",roleText:"Long fight · dangerous every third turn",intentCycle:[
          {name:"Page Storm",damage:3,dangerous:false},{name:"Flying Chapter",damage:4,dangerous:false},{name:"FINAL CHAPTER",damage:7,dangerous:true}]}
      ]
    },
    {
      id:"vault", name:"The Vault", label:"THE VAULT", topic:"money",
      description:"Coins, counting money, and money problems",
      bossName:"Piggy Bank", bossIcon:"🐷",
      completionTitle:"The Vault Cleared!",
      completionText:"You cracked the Piggy Bank and recovered the Coin Crystal.",
      nextWorldLabel:"Enter Clocktower", unlockPowerStrike:false, crystalName:"Coin Crystal",
      battles:[
        {enemyName:"Copper Coin",enemyImage:"characterImages/copper-coin.png",enemyMaxHp:9,difficulty:1,role:"Skirmisher",roleText:"Fast but fragile",intent:{name:"Coin Ping",damage:2,dangerous:false}},
        {enemyName:"Coin Mimic",enemyImage:"characterImages/coin-mimic.png",enemyMaxHp:11,difficulty:1,role:"Trickster",roleText:"Alternates bites and feints",intentCycle:[
          {name:"Coin Bite",damage:2,dangerous:false},{name:"Mimic Chomp",damage:4,dangerous:false},{name:"Fake Out",damage:2,dangerous:false}]},
        {enemyName:"Treasure Goblin",enemyImage:"characterImages/treasure-goblin.png",enemyMaxHp:13,difficulty:2,role:"Skirmisher",roleText:"Steady bag swings",intent:{name:"Bag Swing",damage:3,dangerous:false}},
        {enemyName:"Silver Scarab",enemyImage:"characterImages/silver-scarab.png",enemyMaxHp:15,difficulty:2,role:"Heavy Hitter",roleText:"Coin Shower is the danger turn",intentCycle:[
          {name:"Silver Scratch",damage:2,dangerous:false},{name:"Silver Scratch",damage:2,dangerous:false},{name:"COIN SHOWER",damage:6,dangerous:true}]},
        {enemyName:"Vault Guard",enemyImage:"characterImages/vault-guard.png",enemyMaxHp:18,difficulty:2,role:"Tank",roleText:"High health · steady damage",intent:{name:"Lock Bash",damage:3,dangerous:false}},
        {enemyName:"Golden Mimic",enemyImage:"characterImages/golden-mimic.png",enemyMaxHp:21,difficulty:3,role:"Heavy Hitter",roleText:"Watch for Jackpot Crash",intentCycle:[
          {name:"Gold Bite",damage:3,dangerous:false},{name:"Gold Bite",damage:3,dangerous:false},{name:"JACKPOT CRASH",damage:7,dangerous:true}]},
        {enemyName:"Piggy Bank",enemyImage:"characterImages/piggy-bank.png",enemyMaxHp:29,difficulty:3,role:"Boss",roleText:"Tough shell · massive Bank Breaker",intentCycle:[
          {name:"Coin Toss",damage:3,dangerous:false},{name:"Golden Bounce",damage:4,dangerous:false},{name:"BANK BREAKER",damage:7,dangerous:true}]}
      ]
    },
    {
      id:"clocktower", name:"Clocktower", label:"CLOCKTOWER", topic:"time",
      description:"Reading clocks and elapsed time",
      bossName:"Time Wizard", bossIcon:"🧙",
      completionTitle:"Clocktower Cleared!",
      completionText:"You broke the Time Wizard's spell and recovered the Time Crystal.",
      nextWorldLabel:"Adventure Complete", unlockPowerStrike:false, crystalName:"Time Crystal",
      battles:[
        {enemyName:"Clock Sprite",enemyImage:"characterImages/clock-sprite.png",enemyMaxHp:10,difficulty:1,role:"Skirmisher",roleText:"Fast ticking attacks",intent:{name:"Tick",damage:2,dangerous:false}},
        {enemyName:"Minute Bat",enemyImage:"characterImages/minute-bat.png",enemyMaxHp:11,difficulty:1,role:"Trickster",roleText:"Changes attack strength quickly",intentCycle:[
          {name:"Minute Swipe",damage:2,dangerous:false},{name:"Minute Dive",damage:4,dangerous:false},{name:"Minute Swipe",damage:2,dangerous:false}]},
        {enemyName:"Hour Hound",enemyImage:"characterImages/hour-hound.png",enemyMaxHp:14,difficulty:2,role:"Tank",roleText:"Sturdy with steady bites",intent:{name:"Hour Bite",damage:3,dangerous:false}},
        {enemyName:"Pendulum Phantom",enemyImage:"characterImages/pendulum-phantom.png",enemyMaxHp:16,difficulty:2,role:"Heavy Hitter",roleText:"Time Swing lands every third turn",intentCycle:[
          {name:"Pendulum Tap",damage:2,dangerous:false},{name:"Pendulum Tap",damage:2,dangerous:false},{name:"TIME SWING",damage:6,dangerous:true}]},
        {enemyName:"Gear Golem",enemyImage:"characterImages/gear-golem.png",enemyMaxHp:19,difficulty:2,role:"Tank",roleText:"Lots of health · steady pressure",intent:{name:"Gear Grind",damage:3,dangerous:false}},
        {enemyName:"Clockwork Knight",enemyImage:"characterImages/clockwork-knight.png",enemyMaxHp:22,difficulty:3,role:"Heavy Hitter",roleText:"Guard the Second Hand",intentCycle:[
          {name:"Clock Jab",damage:3,dangerous:false},{name:"Clock Jab",damage:3,dangerous:false},{name:"SECOND HAND",damage:7,dangerous:true}]},
        {enemyName:"Time Wizard",enemyImage:"characterImages/time-wizard.png",enemyMaxHp:30,difficulty:3,role:"Boss",roleText:"The hardest pattern in the adventure",intentCycle:[
          {name:"Time Bolt",damage:3,dangerous:false},{name:"Clock Warp",damage:4,dangerous:false},{name:"TIME FREEZE",damage:8,dangerous:true}]}
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
    xpToNext: 100,
    focus: 1,
    maxFocus: 3,
    skillStars: 0,
    starMilestones: [],
    merchantVisited: false,
    purchasedItems: {},
    healingPotions: 0,
    focusPotions: 0,
    counterShields: 0,
    secondChanceCharms: 0,
    counterShieldArmed: false,
    secondChanceArmed: false,
    counterReady: false,
    damageReduction: 0
  };

  function resetWorldResources() {
    state.skillStars = 0;
    state.starMilestones = [];
    state.merchantVisited = false;
    state.purchasedItems = {};
    state.healingPotions = 0;
    state.focusPotions = 0;
    state.counterShields = 0;
    state.secondChanceCharms = 0;
    state.counterShieldArmed = false;
    state.secondChanceArmed = false;
  }

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
    state.counterReady = false;
    state.damageReduction = 0;
    state.focus = 1;
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
    state.focus = 1;
    state.maxFocus = 3;
    resetWorldResources();
    resetBattle();
  }


  function applySavedState(saved) {
    const hero =
      MathQuest.Heroes.get(state.heroId);

    state.heroId =
      saved.heroId || "knight";

    state.level =
      Math.max(1, Number(saved.level) || 1);

    state.xp =
      Math.max(0, Number(saved.xp) || 0);

    state.xpToNext =
      Math.max(
        100,
        Number(saved.xpToNext) ||
        (100 + (state.level - 1) * 25)
      );

    state.heroMaxHp =
      Math.max(
        hero.startingMaxHp,
        Number(saved.heroMaxHp) ||
        (hero.startingMaxHp + (state.level - 1) * 3)
      );

    state.heroHp =
      state.heroMaxHp;

    state.score =
      Math.max(0, Number(saved.score) || 0);

    state.streak = 0;

    state.worldIndex =
      Math.min(
        worlds.length - 1,
        Math.max(0, Number(saved.worldIndex) || 0)
      );

    state.battleIndex =
      Math.min(
        currentWorld().battles.length - 1,
        Math.max(0, Number(saved.battleIndex) || 0)
      );

    state.powerStrikeUnlocked =
      Boolean(saved.powerStrikeUnlocked) ||
      state.worldIndex > 0;

    state.maxFocus =
      Math.max(
        3,
        Number(saved.maxFocus) || 3
      );

    state.focus =
      Math.min(
        state.maxFocus,
        Math.max(
          1,
          Number(saved.focus) || 1
        )
      );

    state.skillStars =
      Math.max(
        0,
        Number(saved.skillStars) || 0
      );

    state.starMilestones =
      Array.isArray(saved.starMilestones)
        ? saved.starMilestones
            .map(Number)
            .filter(value =>
              [3,5,7,10].includes(value)
            )
        : [];

    state.merchantVisited =
      Boolean(saved.merchantVisited);

    state.purchasedItems =
      saved.purchasedItems &&
      typeof saved.purchasedItems === "object"
        ? {...saved.purchasedItems}
        : {};

    state.healingPotions =
      Math.max(0, Number(saved.healingPotions) || 0);

    state.focusPotions =
      Math.max(0, Number(saved.focusPotions) || 0);

    state.counterShields =
      Math.max(
        0,
        Number(saved.counterShields) ||
        Number(saved.counterShieldCharges) ||
        0
      );

    state.secondChanceCharms =
      Math.max(
        0,
        Number(saved.secondChanceCharms) ||
        Number(saved.secondChanceCharges) ||
        0
      );

    state.counterShieldArmed =
      Boolean(saved.counterShieldArmed);

    state.secondChanceArmed =
      Boolean(saved.secondChanceArmed);

    resetBattle();
  }

  function restartCurrentWorld() {
    state.heroHp = state.heroMaxHp;
    state.streak = 0;
    state.battleIndex = 0;
    resetWorldResources();
    resetBattle();
  }

  function selectWorld(worldIndex) {
    if (worldIndex < 0 || worldIndex >= worlds.length) {
      return false;
    }

    state.worldIndex = worldIndex;
    state.battleIndex = 0;
    state.heroHp = state.heroMaxHp;
    state.streak = 0;
    resetWorldResources();

    if (worldIndex > 0) {
      state.powerStrikeUnlocked = true;
    }

    resetBattle();
    return true;
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
    resetWorldResources();

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

      // Each level adds 3 max HP without
      // shortening the math practice by increasing damage.
      state.heroMaxHp += 3;
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

  function canUsePowerStrike() {
    return (
      state.powerStrikeUnlocked &&
      state.focus >= 2
    );
  }

  function gainFocus(amount = 1) {
    state.focus =
      Math.min(
        state.maxFocus,
        state.focus + amount
      );

    return state.focus;
  }

  function spendFocus(amount = 2) {
    if (state.focus < amount) {
      return false;
    }

    state.focus -= amount;
    return true;
  }

  function useSkill(skill, hinted) {
    if (skill === "guard") {
      state.guardActive = true;

      return {
        kind: "guard",
        value: 0
      };
    }

    if (
      skill === "power" &&
      !spendFocus(2)
    ) {
      return {
        kind: "no-focus",
        value: 0
      };
    }

    if (skill === "shieldBash") {
      state.damageReduction = 2;

      const baseDamage = 2;
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
        value: damage,
        braced: true
      };
    }

    let baseDamage =
      skill === "power"
        ? 6
        : 3;

    let counterUsed =
      false;

    if (
      skill === "slash" &&
      state.counterReady
    ) {
      baseDamage += 2;
      state.counterReady = false;
      counterUsed = true;
    }

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
      value: damage,
      counterUsed
    };
  }

  function enemyAttack() {
    const intent =
      currentIntent();

    if (state.guardActive) {
      state.guardActive = false;

      if (intent.dangerous) {
        state.counterReady = true;
      }

      state.turnNumber++;

      return {
        blocked: true,
        damage: 0,
        intent,
        counterReady:
          state.counterReady
      };
    }

    const reduction =
      Math.max(
        0,
        state.damageReduction
      );

    state.damageReduction = 0;

    const damage =
      Math.max(
        0,
        intent.damage - reduction
      );

    state.heroHp =
      Math.max(
        0,
        state.heroHp - damage
      );

    state.turnNumber++;

    return {
      blocked: damage === 0,
      damage,
      reducedBy: reduction,
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
    applySavedState,
    selectWorld,
    beginNextWorld,
    restartCurrentWorld,

    resetBattle,
    resetWorldResources,

    addCorrect,
    addXp,
    getBattleXpReward,
    addWrong,

    useSkill,
    enemyAttack,

    canUsePowerStrike,
    gainFocus,
    spendFocus,

    unlockPowerStrike,
    advanceBattle
  };
})();
