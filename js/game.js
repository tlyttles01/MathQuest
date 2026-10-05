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
  let battleComplete = false;

  const $ = id => document.getElementById(id);

  function formatNumber(value) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function getSlashDamage() {
    return MathQuest.Combat.state.upgrades.blade ? 3 : 2;
  }

  function updateSkillLabels() {
    const slashButton = document.querySelector('[data-skill="slash"] span');
    if (slashButton) {
      slashButton.textContent = `Subtraction · ${getSlashDamage()} damage`;
    }

    const guardButton = document.querySelector('[data-skill="guard"] span');
    if (guardButton) {
      guardButton.textContent = MathQuest.Combat.state.upgrades.shield
        ? "Missing number · block 2"
        : "Missing number · block";
    }
  }

  function updateBattleIdentity() {
    const battle = MathQuest.Combat.currentBattle();
    $("battleSubtitle").textContent = `Battle ${battle.id} of ${MathQuest.Combat.battles.length}`;
    $("enemyName").textContent = battle.enemyName;
    $("enemySprite").textContent = battle.enemySprite;
    $("battleTip").textContent = battle.tip;
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

  function refreshEffectLabel() {
    if (selectedSkill === "slash") {
      $("effectLabel").textContent = `${getSlashDamage()} damage`;
    } else if (selectedSkill === "power") {
      $("effectLabel").textContent = "3 damage";
    } else if (selectedSkill === "guard") {
      $("effectLabel").textContent = MathQuest.Combat.state.upgrades.shield
        ? "Block next 2 attacks"
        : "Block next attack";
    } else {
      $("effectLabel").textContent = "Heal 2 HP";
    }
  }

  function selectSkill(skillKey) {
    if (battleComplete) return;

    selectedSkill = skillKey;

    document.querySelectorAll(".skill-card").forEach(button => {
      button.classList.toggle("active", button.dataset.skill === skillKey);
    });

    newProblem();
  }

  function newProblem() {
    if (battleComplete) return;

    currentProblem = MathQuest.MathEngine.createProblem(selectedSkill);
    hinted = false;
    locked = false;

    $("skillName").textContent = skills[selectedSkill].label;
    refreshEffectLabel();
    $("problem").textContent = currentProblem.prompt;
    $("answerInput").value = "";
    $("feedback").textContent = "";
    $("hintBox").classList.add("hidden");
    $("hintBox").textContent = "";

    MathQuest.BlockWorkspace.clear();
    MathQuest.BlockWorkspace.setMode("cross");

    $("answerInput").focus();
  }

  function showHint() {
    if (battleComplete || !currentProblem) return;

    hinted = true;
    $("hintBox").textContent = currentProblem.hint;
    $("hintBox").classList.remove("hidden");

    if (selectedSkill === "slash") {
      $("effectLabel").textContent = `${formatNumber(getSlashDamage() * 0.75)} damage (hint)`;
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
        ? " 🛡️ Guard blocks the enemy attack!"
        : " 🛡️ Fortitude armor blocks the enemy attack!";
    }

    return ` The ${MathQuest.Combat.currentBattle().enemyName} attacks for ${attack.damage} damage.`;
  }

  function showVictory(message) {
    battleComplete = true;
    locked = true;

    const reward = MathQuest.Combat.completeBattle();
    $("battleMessage").textContent = "VICTORY!";
    $("victoryTitle").textContent = "Victory!";
    $("victoryText").textContent = `You defeated the ${reward.enemyName}.`;
    $("battleRewards").innerHTML = `
      <span class="reward-pill">⭐ Score ${MathQuest.Combat.state.score}</span>
      <span class="reward-pill">🪙 +${reward.gold} Gold</span>
      <span class="reward-pill">🔥 Streak ${MathQuest.Combat.state.streak}</span>
    `;
    $("feedback").textContent = message;
    $("victoryPanel").classList.remove("hidden");

    if (!MathQuest.Combat.hasMoreBattles()) {
      $("fightAgainBtn").textContent = "Choose Upgrade";
    } else {
      $("fightAgainBtn").textContent = "Next Battle";
    }

    updateHud();
  }

  function handleCorrect() {
    const correct = MathQuest.Combat.grantCorrect();
    const effect = MathQuest.Combat.useSkill(selectedSkill, hinted);

    let message = `✅ Correct! +${correct.points} score. `;

    if (effect.kind === "damage") {
      message += `You deal ${formatNumber(effect.value)} damage.`;
    } else if (effect.kind === "guard") {
      message += MathQuest.Combat.state.upgrades.shield
        ? "Your reinforced shield is ready to block 2 attacks."
        : "You raise your shield.";
    } else {
      message += `You restore ${formatNumber(effect.value)} HP.`;
    }

    if (correct.gainedArmor) {
      message += " 🛡️ Fortitude grants 1 Armor!";
    }

    if (MathQuest.Combat.state.enemyHp <= 0) {
      showVictory(message);
      return;
    }

    message += resolveEnemyTurn();
    $("feedback").textContent = message;
    updateHud();

    if (MathQuest.Combat.state.heroHp <= 0) {
      $("battleMessage").textContent = "RUN OVER";
      $("feedback").textContent += " The Knight was defeated.";
      locked = true;
      return;
    }

    setTimeout(newProblem, 1150);
  }

  function handleWrong() {
    MathQuest.Combat.grantWrong();

    let message = `Not quite. The answer is ${currentProblem.answer}.`;
    message += resolveEnemyTurn();

    $("feedback").textContent = message;
    updateHud();

    if (MathQuest.Combat.state.heroHp <= 0) {
      $("battleMessage").textContent = "RUN OVER";
      $("feedback").textContent += " The Knight was defeated.";
      locked = true;
      return;
    }

    setTimeout(newProblem, 1500);
  }

  function submitAnswer(event) {
    event.preventDefault();
    if (locked || battleComplete) return;

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

  function nextStepAfterVictory() {
    $("victoryPanel").classList.add("hidden");

    if (MathQuest.Combat.hasMoreBattles()) {
      MathQuest.Combat.advanceBattle();
      battleComplete = false;
      $("battleMessage").textContent = "YOUR TURN";
      updateBattleIdentity();
      updateHud();
      newProblem();
      return;
    }

    $("upgradePanel").classList.remove("hidden");
    $("battleMessage").textContent = "REWARD";
  }

  function chooseUpgrade(key) {
    const result = MathQuest.Combat.chooseUpgrade(key);

    document.querySelectorAll(".upgrade-card").forEach(card => {
      card.classList.toggle("selected", card.dataset.upgrade === key);
      card.disabled = true;
    });

    $("upgradeResult").textContent = result;
    $("upgradeResult").classList.remove("hidden");
    $("continueRunBtn").classList.remove("hidden");

    updateSkillLabels();
    updateHud();
  }

  function continueRun() {
    $("upgradePanel").classList.add("hidden");
    $("battleMessage").textContent = "RUN COMPLETE";
    $("feedback").textContent =
      `Training complete! Run score: ${MathQuest.Combat.state.score}. Gold earned: ${MathQuest.Combat.state.runGold}. Next we'll build the rest of Whispering Woods.`;
  }

  function init() {
    MathQuest.BlockWorkspace.init();
    MathQuest.Combat.beginRun();
    updateBattleIdentity();
    updateHud();
    updateSkillLabels();

    document.querySelectorAll(".skill-card").forEach(button => {
      button.addEventListener("click", () => selectSkill(button.dataset.skill));
    });

    document.querySelectorAll(".upgrade-card").forEach(button => {
      button.addEventListener("click", () => chooseUpgrade(button.dataset.upgrade));
    });

    $("addTen").addEventListener("click", MathQuest.BlockWorkspace.addTen);
    $("addOne").addEventListener("click", MathQuest.BlockWorkspace.addOne);
    $("crossMode").addEventListener("click", () => MathQuest.BlockWorkspace.setMode("cross"));
    $("breakMode").addEventListener("click", () => MathQuest.BlockWorkspace.setMode("break"));
    $("removeMode").addEventListener("click", () => MathQuest.BlockWorkspace.setMode("remove"));
    $("clearAll").addEventListener("click", MathQuest.BlockWorkspace.clear);

    $("hintBtn").addEventListener("click", showHint);
    $("answerForm").addEventListener("submit", submitAnswer);
    $("fightAgainBtn").addEventListener("click", nextStepAfterVictory);
    $("continueRunBtn").addEventListener("click", continueRun);

    newProblem();
  }

  init();
})();
