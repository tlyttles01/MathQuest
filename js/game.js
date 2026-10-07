window.MathQuest = window.MathQuest || {};

(() => {
  const $ = id => document.getElementById(id);

  let selectedSkill = "slash";
  let currentProblem = null;
  let hinted = false;
  let locked = false;
  let battleComplete = false;
  let guardTutorialSeen = false;
  let blocksVisible = false;

  const skillInfo = {
    slash: {
      label: "⚔️ SWORD SLASH",
      effect: "2 damage"
    },
    power: {
      label: "💥 POWER STRIKE",
      effect: "4 damage"
    },
    guard: {
      label: "🛡️ GUARD",
      effect: "Block incoming attack"
    }
  };

  const formatNumber = value =>
    Number.isInteger(value)
      ? String(value)
      : value.toFixed(1);

  function updateHud() {
    const state = MathQuest.Combat.state;

    $("heroHp").textContent =
      formatNumber(state.heroHp);

    $("heroMaxHp").textContent =
      state.heroMaxHp;

    $("enemyHp").textContent =
      formatNumber(state.enemyHp);

    $("enemyMaxHp").textContent =
      state.enemyMaxHp;

    $("score").textContent =
      state.score;

    $("streak").textContent =
      state.streak;

    $("heroHpBar").style.width =
      `${(state.heroHp / state.heroMaxHp) * 100}%`;

    $("enemyHpBar").style.width =
      `${(state.enemyHp / state.enemyMaxHp) * 100}%`;
  }

  function updateIntent() {
    const intent =
      MathQuest.Combat.currentIntent();

    const battle =
      MathQuest.Combat.currentBattle();

    $("intentName").textContent =
      intent.name;

    $("intentDamage").textContent =
      `💥 ${intent.damage} DAMAGE`;

    $("intentCard").classList.toggle(
      "danger",
      intent.dangerous
    );

    $("intentCard")
      .querySelector(".intent-title")
      .textContent =
        intent.dangerous
          ? "🚨 BIG ATTACK INCOMING"
          : "Enemy intent";

    if (selectedSkill === "guard") {
      $("effectLabel").textContent =
        `Block ${intent.damage} damage`;
    }

    if (
      battle.guardTutorial &&
      intent.dangerous &&
      !guardTutorialSeen
    ) {
      $("tutorialOverlay")
        .classList.remove("hidden");
    }
  }

  function updateSkillAvailability() {
    const state =
      MathQuest.Combat.state;

    const world =
      MathQuest.Combat.currentWorld();

    const battle =
      MathQuest.Combat.currentBattle();

    const guardUnlocked =
      world.id !== "woods" ||
      state.battleIndex >= 4;

    $("guardSkill").disabled =
      !guardUnlocked;

    $("guardSkill").classList.toggle(
      "locked",
      !guardUnlocked
    );

    $("guardSkill")
      .querySelector("b")
      .textContent =
        guardUnlocked
          ? "🛡️ Guard"
          : "🛡️ Guard 🔒";

    $("guardSkill")
      .querySelector("small")
      .textContent =
        guardUnlocked
          ? "Normal question · block incoming attack"
          : "Unlocks later";

    const powerUnlocked =
      state.powerStrikeUnlocked;

    $("powerSkill").disabled =
      !powerUnlocked;

    $("powerSkill").classList.toggle(
      "locked",
      !powerUnlocked
    );

    $("powerSkill")
      .querySelector("b")
      .textContent =
        powerUnlocked
          ? "💥 Power Strike"
          : "💥 Power Strike 🔒";

    $("powerSkill")
      .querySelector("small")
      .textContent =
        powerUnlocked
          ? "Challenge question · 4 damage"
          : "Defeat the Goblin King to unlock";

    if (
      selectedSkill === "guard" &&
      !guardUnlocked
    ) {
      selectedSkill = "slash";
    }

    if (
      selectedSkill === "power" &&
      !powerUnlocked
    ) {
      selectedSkill = "slash";
    }
  }

  function updateBattleIdentity() {
    const world =
      MathQuest.Combat.currentWorld();

    const battle =
      MathQuest.Combat.currentBattle();

    $("worldName").textContent =
      world.label;

    $("battleSubtitle").textContent =
      `Battle ${MathQuest.Combat.state.battleIndex + 1} of ${world.battles.length}`;

    $("enemyName").textContent =
      battle.enemyName;

    $("enemySprite").src =
      battle.enemyImage;

    $("enemySprite").alt =
      battle.enemyName;

    updateSkillAvailability();
    updateIntent();
  }

  function selectSkill(skill) {
    if (
      locked ||
      battleComplete
    ) {
      return;
    }

    const button =
      document.querySelector(
        `[data-skill="${skill}"]`
      );

    if (
      !button ||
      button.disabled
    ) {
      return;
    }

    selectedSkill =
      skill;

    document
      .querySelectorAll(".skill")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.skill === skill
        );
      });

    newProblem();
  }

  function newProblem() {
    if (battleComplete) {
      return;
    }

    hinted = false;
    locked = false;

    const world =
      MathQuest.Combat.currentWorld();

    const battle =
      MathQuest.Combat.currentBattle();

    currentProblem =
      MathQuest.MathEngine.createProblem({
        topic: world.topic,
        difficulty: battle.difficulty,
        skill: selectedSkill
      });

    $("skillName").textContent =
      skillInfo[selectedSkill].label;

    $("problem").textContent =
      currentProblem.prompt;

    $("answerInput").value = "";

    $("feedback").textContent = "";

    $("hintBox")
      .classList.add("hidden");

    $("effectLabel").textContent =
      selectedSkill === "guard"
        ? `Block ${MathQuest.Combat.currentIntent().damage} damage`
        : skillInfo[selectedSkill].effect;

    MathQuest.BlockWorkspace.clear();
    MathQuest.BlockWorkspace.setMode("cross");

    updateIntent();

    $("answerInput").focus();
  }

  function showHint() {
    if (
      locked ||
      battleComplete
    ) {
      return;
    }

    hinted = true;

    $("hintBox").textContent =
      currentProblem.hint;

    $("hintBox")
      .classList.remove("hidden");

    if (selectedSkill === "slash") {
      $("effectLabel").textContent =
        "1.5 damage (hint)";
    }

    if (selectedSkill === "power") {
      $("effectLabel").textContent =
        "3 damage (hint)";
    }

    if (selectedSkill === "guard") {
      $("effectLabel").textContent =
        "Guard (hint used)";
    }
  }

  function toggleBlocks() {
    blocksVisible =
      !blocksVisible;

    $("workspaceSection")
      .classList.toggle(
        "hidden",
        !blocksVisible
      );

    $("toggleBlocksBtn").textContent =
      blocksVisible
        ? "▲ Hide Blocks"
        : "🧱 Use Blocks";
  }

  async function enemyTurn() {
    const attack =
      MathQuest.Combat.enemyAttack();

    $("battleMessage").textContent =
      attack.blocked
        ? "BLOCKED!"
        : "ENEMY ATTACK";

    await MathQuest.Animations.enemyAttack(
      attack.damage,
      attack.blocked
    );

    updateHud();
    updateIntent();

    if (
      MathQuest.Combat.state.heroHp <= 0
    ) {
      $("battleMessage").textContent =
        "REST TIME";

      $("feedback").textContent +=
        " The Knight needs a rest. Try this battle again!";

      MathQuest.Combat.state.heroHp =
        MathQuest.Combat.state.heroMaxHp;

      MathQuest.Combat.resetBattle();

      updateHud();
      updateIntent();

      setTimeout(() => {
        battleComplete = false;
        $("battleMessage").textContent =
          "YOUR TURN";
        newProblem();
      }, 1400);

      return false;
    }

    return true;
  }

  async function handleCorrect() {
    const points =
      MathQuest.Combat.addCorrect();

    const effect =
      MathQuest.Combat.useSkill(
        selectedSkill,
        hinted
      );

    $("feedback").textContent =
      `✅ Correct! +${points} score.`;

    updateHud();

    if (effect.kind === "guard") {
      $("battleMessage").textContent =
        "GUARD!";

      await MathQuest.Animations.guardUp();
    }
    else {
      $("battleMessage").textContent =
        selectedSkill === "power"
          ? "POWER STRIKE!"
          : "SWORD SLASH!";

      await MathQuest.Animations.playerAttack(
        selectedSkill,
        effect.value
      );

      updateHud();

      if (
        MathQuest.Combat.state.enemyHp <= 0
      ) {
        showVictory();
        return;
      }
    }

    if (!await enemyTurn()) {
      return;
    }

    $("battleMessage").textContent =
      "YOUR TURN";

    setTimeout(
      newProblem,
      450
    );
  }

  async function handleWrong() {
    MathQuest.Combat.addWrong();

    $("feedback").textContent =
      `Not quite. The answer is ${currentProblem.answer}.`;

    if (!await enemyTurn()) {
      return;
    }

    $("battleMessage").textContent =
      "YOUR TURN";

    setTimeout(
      newProblem,
      550
    );
  }

  function showVictory() {
    battleComplete = true;
    locked = true;

    $("battleMessage").textContent =
      "VICTORY!";

    $("victoryText").textContent =
      `You defeated the ${MathQuest.Combat.currentBattle().enemyName}.`;

    $("battleRewards").innerHTML =
      `
      <span class="reward-pill">
        ⭐ Score ${MathQuest.Combat.state.score}
      </span>
      <span class="reward-pill">
        🔥 Streak ${MathQuest.Combat.state.streak}
      </span>
      `;

    $("victoryPanel")
      .classList.remove("hidden");

    $("nextBattleBtn").textContent =
      MathQuest.Combat.state.battleIndex ===
      MathQuest.Combat.currentWorld().battles.length - 1
        ? "Finish World"
        : "Next Battle";
  }

  function nextBattle() {
    $("victoryPanel")
      .classList.add("hidden");

    const advanced =
      MathQuest.Combat.advanceBattle();

    if (!advanced) {
      showWorldComplete();
      return;
    }

    battleComplete = false;
    locked = false;
    selectedSkill = "slash";

    document
      .querySelectorAll(".skill")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.skill === "slash"
        );
      });

    $("battleMessage").textContent =
      "YOUR TURN";

    updateBattleIdentity();
    updateHud();
    newProblem();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function showWorldComplete() {
    battleComplete = true;

    const world =
      MathQuest.Combat.currentWorld();

    if (world.unlockPowerStrike) {
      MathQuest.Combat.unlockPowerStrike();
    }

    $("chapterCompleteIcon").textContent =
      world.bossIcon;

    $("chapterCompleteTitle").textContent =
      world.completionTitle;

    $("chapterCompleteText").textContent =
      world.completionText;

    $("skillUnlockCard")
      .classList.toggle(
        "hidden",
        !world.unlockPowerStrike
      );

    $("chapterSummary").innerHTML =
      `
      <span class="reward-pill">
        ⭐ Score ${MathQuest.Combat.state.score}
      </span>
      <span class="reward-pill">
        🔥 Streak ${MathQuest.Combat.state.streak}
      </span>
      <span class="reward-pill">
        🏆 ${world.bossName} Defeated
      </span>
      `;

    const hasNextWorld =
      MathQuest.Combat.state.worldIndex <
      MathQuest.Combat.worlds.length - 1;

    $("nextWorldBtn").textContent =
      hasNextWorld
        ? world.nextWorldLabel
        : "More Worlds Coming Soon";

    $("nextWorldBtn").disabled =
      !hasNextWorld;

    $("chapterCompletePanel")
      .classList.remove("hidden");

    $("battleMessage").textContent =
      "WORLD CLEAR!";
  }

  function nextWorld() {
    $("chapterCompletePanel")
      .classList.add("hidden");

    const advanced =
      MathQuest.Combat.beginNextWorld();

    if (!advanced) {
      return;
    }

    battleComplete = false;
    locked = false;
    selectedSkill = "slash";

    document
      .querySelectorAll(".skill")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.skill === "slash"
        );
      });

    $("battleMessage").textContent =
      "YOUR TURN";

    updateBattleIdentity();
    updateHud();
    newProblem();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  function restartWorld() {
    $("chapterCompletePanel")
      .classList.add("hidden");

    MathQuest.Combat.restartCurrentWorld();

    battleComplete = false;
    locked = false;
    selectedSkill = "slash";

    document
      .querySelectorAll(".skill")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.skill === "slash"
        );
      });

    $("battleMessage").textContent =
      "YOUR TURN";

    updateBattleIdentity();
    updateHud();
    newProblem();
  }

  function closeGuardTutorial() {
    guardTutorialSeen = true;

    $("tutorialOverlay")
      .classList.add("hidden");

    selectSkill("guard");
  }

  function submitAnswer(event) {
    event.preventDefault();

    if (
      locked ||
      battleComplete
    ) {
      return;
    }

    const answer =
      Number.parseInt(
        $("answerInput").value,
        10
      );

    if (!Number.isFinite(answer)) {
      $("feedback").textContent =
        "Enter an answer first.";
      return;
    }

    locked = true;

    if (
      answer ===
      currentProblem.answer
    ) {
      handleCorrect();
    }
    else {
      handleWrong();
    }
  }

  function init() {
    MathQuest.BlockWorkspace.init();

    MathQuest.Combat.beginGame();

    updateBattleIdentity();
    updateHud();

    document
      .querySelectorAll(".skill")
      .forEach(button => {
        if (button.dataset.skill) {
          button.addEventListener(
            "click",
            () =>
              selectSkill(
                button.dataset.skill
              )
          );
        }
      });

    $("addTen")
      .addEventListener(
        "click",
        MathQuest.BlockWorkspace.addTen
      );

    $("addOne")
      .addEventListener(
        "click",
        MathQuest.BlockWorkspace.addOne
      );

    $("crossMode")
      .addEventListener(
        "click",
        () =>
          MathQuest.BlockWorkspace
            .setMode("cross")
      );

    $("breakMode")
      .addEventListener(
        "click",
        () =>
          MathQuest.BlockWorkspace
            .setMode("break")
      );

    $("removeMode")
      .addEventListener(
        "click",
        () =>
          MathQuest.BlockWorkspace
            .setMode("remove")
      );

    $("clearAll")
      .addEventListener(
        "click",
        MathQuest.BlockWorkspace.clear
      );

    $("hintBtn")
      .addEventListener(
        "click",
        showHint
      );

    $("toggleBlocksBtn")
      .addEventListener(
        "click",
        toggleBlocks
      );

    $("answerForm")
      .addEventListener(
        "submit",
        submitAnswer
      );

    $("nextBattleBtn")
      .addEventListener(
        "click",
        nextBattle
      );

    $("nextWorldBtn")
      .addEventListener(
        "click",
        nextWorld
      );

    $("restartChapterBtn")
      .addEventListener(
        "click",
        restartWorld
      );

    $("tutorialTryBtn")
      .addEventListener(
        "click",
        closeGuardTutorial
      );

    $("tutorialSkipBtn")
      .addEventListener(
        "click",
        closeGuardTutorial
      );

    newProblem();
  }

  init();
})();
