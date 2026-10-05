window.MathQuest = window.MathQuest || {};

MathQuest.Combat = (() => {
  const state = {
    heroHp: 10,
    heroMaxHp: 10,
    enemyHp: 1,
    enemyMaxHp: 1,
    streak: 0,
    score: 0,
    armor: 0,
    correctSinceArmor: 0,
    shielded: false,
    battleNumber: 1
  };

  function resetBattle() {
    state.heroHp = 10;
    state.enemyMaxHp = state.battleNumber <= 2 ? 1 : 3;
    state.enemyHp = state.enemyMaxHp;
    state.streak = 0;
    state.armor = 0;
    state.correctSinceArmor = 0;
    state.shielded = false;
  }

  function grantCorrect() {
    state.streak += 1;
    state.score += 10 + Math.min(state.streak - 1, 5) * 5;
    state.correctSinceArmor += 1;

    let gainedArmor = false;
    if (state.correctSinceArmor >= 3) {
      state.correctSinceArmor = 0;
      state.armor += 1;
      gainedArmor = true;
    }

    return gainedArmor;
  }

  function grantWrong() {
    state.streak = 0;
    state.correctSinceArmor = 0;
  }

  function enemyAttack() {
    if (state.shielded) {
      state.shielded = false;
      return { blocked: true, reason: "guard" };
    }

    if (state.armor > 0) {
      state.armor -= 1;
      return { blocked: true, reason: "armor" };
    }

    state.heroHp = Math.max(0, state.heroHp - 1);
    return { blocked: false, damage: 1 };
  }

  function useSkill(skillKey, hinted) {
    if (skillKey === "guard") {
      state.shielded = true;
      return { kind: "guard", value: hinted ? 0.75 : 1 };
    }

    if (skillKey === "secondWind") {
      const heal = hinted ? 1.5 : 2;
      state.heroHp = Math.min(state.heroMaxHp, state.heroHp + heal);
      return { kind: "heal", value: heal };
    }

    const baseDamage = skillKey === "power" ? 3 : 2;
    const damage = hinted ? baseDamage * 0.75 : baseDamage;

    state.enemyHp = Math.max(0, state.enemyHp - damage);
    return { kind: "damage", value: damage };
  }

  function advanceBattle() {
    state.battleNumber += 1;
    resetBattle();
  }

  return {
    state,
    resetBattle,
    grantCorrect,
    grantWrong,
    enemyAttack,
    useSkill,
    advanceBattle
  };
})();
