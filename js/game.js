window.MathQuest = window.MathQuest || {};

(() => {
  const skills = {
    slash: {
      label: "⚔️ SWORD SLASH",
      effect: "2 damage"
    },
    power: {
      label: "💥 POWER STRIKE",
      effect: "3 damage"
    },
    guard: {
      label: "🛡️ GUARD",
      effect: "Block next attack"
    },
    secondWind: {
      label: "❤️ SECOND WIND",
      effect: "Heal 2 HP"
    }
  };

  let selectedSkill = "slash";
  let currentProblem = null;
  let hinted = false;
  let locked = false;

  const $ = id => document.getElementById(id);

  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function updateHud() {
    const state = MathQuest.Combat.state;

    $("heroHp").textContent = formatNumber(state.heroHp);
    $("enemyHp").textContent = formatNumber(state.enemyHp);
    $("enemyMaxHp").textContent = formatNumber(state.enemyMaxHp);
    $("score").textContent = state.score;
    $("streak").textContent = state.streak;
    $("armor").textContent = state.armor;

    $("heroHpBar").style.width = `${(state.heroHp / state.heroMaxHp) * 100}%`;
    $("enemyHpBar").style.width = `${(state.enemyHp / state.enemyMaxHp) * 100}%`;
  }

  function selectSkill(skillKey) {
    selectedSkill = skillKey;

    document.querySelectorAll(".skill-card").forEach(button => {
      button.classList.toggle("active", button.dataset.skill === skillKey);
    });

    newProblem();
  }

  function newProblem() {
    currentProblem = MathQuest.MathEngine.createProblem(selectedSkill);
    hinted = false;
    locked = false;

    $("skillName").textContent = skills[selectedSkill].label;
    $("effectLabel").textContent = skills[selectedSkill].effect;
    $("problem").textContent = currentProblem.prompt;
    $("answerInput").value = "";
    $("feedback").textContent = "";
    $("hintBox").classList.add("hidden");
    $("hintBox").textContent = "";
    $("victoryPanel").classList.add("hidden");

    MathQuest.BlockWorkspace.clear();
    MathQuest.BlockWorkspace.setMode("cross");

    $("answerInput").focus();
  }

  function showHint() {
    hinted = true;
    $("hintBox").textContent = currentProblem.hint;
    $("hintBox").classList.remove("hidden");

    if (selectedSkill === "slash") {
      $("effectLabel").textContent = "1.5 damage (hint)";
    } else if (selectedSkill === "power") {
      $("effectLabel").textContent = "2.25 damage (hint)";
    } else if (selectedSkill === "guard") {
      $("effectLabel").textContent = "75% shield strength";
    } else {
      $("effectLabel").textContent = "Heal 1.5 HP (hint)";
    }
  }

  function resolveEnemyTurn() {
    const attack = MathQuest.Combat.enemyAttack();

    if (attack.blocked) {
      return attack.reason === "guard"
        ? " 🛡️ Guard blocks the slime's attack!"
        : " 🛡️ Fortitude armor blocks the slime's attack!";
    }

    return " The slime attacks for 1 damage.";
  }

  function handleCorrect() {
    const gainedArmor = MathQuest.Combat.grantCorrect();
    const effect = MathQuest.Combat.useSkill(selectedSkill, hinted);

    let message = "✅ Correct! ";

    if (effect.kind === "damage") {
      message += `You deal ${formatNumber(effect.value)} damage.`;
    } else if (effect.kind === "guard") {
      message += "You raise your shield.";
    } else {
      message += `You restore ${formatNumber(effect.value)} HP.`;
    }

    if (gainedArmor) {
      message += " 🛡️ Fortitude grants 1 Armor!";
    }

    if (MathQuest.Combat.state.enemyHp <= 0) {
      $("battleMessage").textContent = "VICTORY!";
      $("victoryPanel").classList.remove("hidden");
      $("feedback").textContent = message;
      updateHud();
      return;
    }

    message += resolveEnemyTurn();
    $("feedback").textContent = message;
    updateHud();

    setTimeout(newProblem, 1150);
  }

  function handleWrong() {
    MathQuest.Combat.grantWrong();

    let message = `Not quite. The answer is ${currentProblem.answer}.`;
    message += resolveEnemyTurn();

    $("feedback").textContent = message;
    updateHud();

    setTimeout(newProblem, 1500);
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (locked) return;

    const value = Number.parseInt($("answerInput").value, 10);
    if (!Number.isFinite(value)) {
      $("feedback").textContent = "Enter an answer first.";
      return;
    }

    locked = true;

    if (value === currentProblem.answer) {
      handleCorrect();
    } else {
      handleWrong();
    }
  }

  function fightAgain() {
    MathQuest.Combat.advanceBattle();
    $("battleMessage").textContent = "YOUR TURN";
    updateHud();
    newProblem();
  }

  function init() {
    MathQuest.BlockWorkspace.init();
    MathQuest.Combat.resetBattle();
    updateHud();

    document.querySelectorAll(".skill-card").forEach(button => {
      button.addEventListener("click", () => selectSkill(button.dataset.skill));
    });

    $("addTen").addEventListener("click", MathQuest.BlockWorkspace.addTen);
    $("addOne").addEventListener("click", MathQuest.BlockWorkspace.addOne);
    $("crossMode").addEventListener("click", () => MathQuest.BlockWorkspace.setMode("cross"));
    $("breakMode").addEventListener("click", () => MathQuest.BlockWorkspace.setMode("break"));
    $("removeMode").addEventListener("click", () => MathQuest.BlockWorkspace.setMode("remove"));
    $("clearAll").addEventListener("click", MathQuest.BlockWorkspace.clear);

    $("hintBtn").addEventListener("click", showHint);
    $("answerForm").addEventListener("submit", submitAnswer);
    $("fightAgainBtn").addEventListener("click", fightAgain);

    newProblem();
  }

  init();
})();
