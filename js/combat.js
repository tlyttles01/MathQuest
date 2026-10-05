window.MathQuest = window.MathQuest || {};

MathQuest.Combat = (() => {
  const battles = [
    {
      id: 1,
      enemyName: "Tiny Slime",
      enemySprite: "🟢",
      enemyMaxHp: 1,
      enemyDamage: 1,
      goldReward: 3,
      tip: "Battle 1 is a quick win: defeat the Tiny Slime with one correct attack."
    },
    {
      id: 2,
      enemyName: "Blue Slime",
      enemySprite: "🔵",
      enemyMaxHp: 2,
      enemyDamage: 1,
      goldReward: 5,
      tip: "Battle 2 may take more than one problem. Try Power Strike and practice breaking a ten."
    },
    {
      id: 3,
      enemyName: "Armored Slime",
      enemySprite: "🛡️",
      enemyMaxHp: 5,
      enemyDamage: 1,
      goldReward: 8,
      tip: "Battle 3 is longer. Use Guard to block attacks and build a streak for Fortitude armor."
    }
  ];

  const state = {
    heroHp: 10,
    heroMaxHp: 10,
    enemyHp: 1,
    enemyMaxHp: 1,
    streak: 0,
    score: 0,
    runGold: 0,
    armor: 0,
    correctSinceArmor: 0,
    guardBlocks: 0,
    battleIndex: 0,
    upgrades: {
      blade: false,
      shield: false,
      meal: false
    }
  };

  function currentBattle() {
    return battles[state.battleIndex];
  }

  function resetCurrentBattle() {
    const battle = currentBattle();
    state.enemyMaxHp = battle.enemyMaxHp;
    state.enemyHp = battle.enemyMaxHp;
    state.guardBlocks = 0;
  }

  function beginRun() {
    state.heroHp = state.heroMaxHp;
    state.enemyHp = 1;
    state.enemyMaxHp = 1;
    state.streak = 0;
    state.score = 0;
    state.runGold = 0;
    state.armor = 0;
    state.correctSinceArmor = 0;
    state.guardBlocks = 0;
    state.battleIndex = 0;
    resetCurrentBattle();
  }

  function grantCorrect() {
    state.streak += 1;
    const points = 10 + Math.min(state.streak - 1, 5) * 5;
    state.score += points;
    state.correctSinceArmor += 1;

    let gainedArmor = false;
    if (state.correctSinceArmor >= 3) {
      state.correctSinceArmor = 0;
      state.armor += 1;
      gainedArmor = true;
    }

    return { gainedArmor, points };
  }

  function grantWrong() {
    state.streak = 0;
    state.correctSinceArmor = 0;
  }

  function enemyAttack() {
    const battle = currentBattle();

    if (state.guardBlocks > 0) {
      state.guardBlocks -= 1;
      return { blocked: true, reason: "guard" };
    }

    if (state.armor > 0) {
      state.armor -= 1;
      return { blocked: true, reason: "armor" };
    }

    state.heroHp = Math.max(0, state.heroHp - battle.enemyDamage);
    return { blocked: false, damage: battle.enemyDamage };
  }

  function useSkill(skillKey, hinted) {
    if (skillKey === "guard") {
      const baseBlocks = state.upgrades.shield ? 2 : 1;
      state.guardBlocks = baseBlocks;
      return { kind: "guard", value: hinted ? 0.75 : baseBlocks };
    }

    if (skillKey === "secondWind") {
      const heal = hinted ? 1.5 : 2;
      state.heroHp = Math.min(state.heroMaxHp, state.heroHp + heal);
      return { kind: "heal", value: heal };
    }

    let baseDamage = skillKey === "power" ? 3 : 2;
    if (skillKey === "slash" && state.upgrades.blade) {
      baseDamage += 1;
    }

    const damage = hinted ? baseDamage * 0.75 : baseDamage;
    state.enemyHp = Math.max(0, state.enemyHp - damage);
    return { kind: "damage", value: damage };
  }

  function completeBattle() {
    const battle = currentBattle();
    state.runGold += battle.goldReward;
    return {
      gold: battle.goldReward,
      score: state.score,
      battleNumber: battle.id,
      enemyName: battle.enemyName
    };
  }

  function hasMoreBattles() {
    return state.battleIndex < battles.length - 1;
  }

  function advanceBattle() {
    if (!hasMoreBattles()) return false;
    state.battleIndex += 1;
    resetCurrentBattle();
    return true;
  }

  function chooseUpgrade(key) {
    if (key === "blade") {
      state.upgrades.blade = true;
      return "Sharp Blade equipped: Sword Slash now deals +1 damage.";
    }

    if (key === "shield") {
      state.upgrades.shield = true;
      return "Reinforced Shield equipped: Guard now blocks 2 attacks.";
    }

    if (key === "meal") {
      state.upgrades.meal = true;
      state.heroMaxHp += 2;
      state.heroHp = state.heroMaxHp;
      return "Hearty Meal consumed: maximum HP increased by 2 and HP restored.";
    }

    return "";
  }

  return {
    battles,
    state,
    beginRun,
    currentBattle,
    resetCurrentBattle,
    grantCorrect,
    grantWrong,
    enemyAttack,
    useSkill,
    completeBattle,
    hasMoreBattles,
    advanceBattle,
    chooseUpgrade
  };
})();
