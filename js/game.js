window.MathQuest = window.MathQuest || {};

(() => {
  const $ = id => document.getElementById(id);

  let selectedSkill = "slash";
  let currentProblem = null;
  let hinted = false;
  let locked = false;
  let battleComplete = false;
  let guardTutorialSeen = false;
  let battleXpAnimating = false;
  let coinTrayState = [];
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
    const hero = MathQuest.Combat.currentHero();

    $("heroName").textContent =
      hero.name;

    $("heroSprite").src =
      hero.image;

    $("heroSprite").alt =
      hero.name;

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

    $("heroLevel").textContent =
      state.level;

    $("heroXp").textContent =
      state.xp;

    $("heroXpNext").textContent =
      state.xpToNext;

    $("heroHpBar").style.width =
      `${(state.heroHp / state.heroMaxHp) * 100}%`;

    $("heroXpBar").style.width =
      `${(state.xp / state.xpToNext) * 100}%`;

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

    const enemyWrap =
      $("enemySprite").parentElement;

    if (battle.enemyImage) {
      $("enemySprite").src =
        battle.enemyImage;
      $("enemySprite").alt =
        battle.enemyName;
      $("enemySprite").classList.remove(
        "emoji-enemy"
      );
      enemyWrap.removeAttribute(
        "data-emoji"
      );
    }
    else {
      $("enemySprite").removeAttribute(
        "src"
      );
      $("enemySprite").alt = "";
      $("enemySprite").classList.add(
        "emoji-enemy"
      );
      enemyWrap.dataset.emoji =
        battle.enemySprite || "❓";
    }

    updateSkillAvailability();
    updateIntent();
  }

  function renderWorldSelect() {
    const grid = $("worldSelectGrid");
    grid.innerHTML = "";

    MathQuest.Combat.worlds.forEach((world, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "world-card";
      button.innerHTML = `
        <span class="world-card-number">World ${index + 1}</span>
        <strong>${world.name}</strong>
        <small>${world.description}</small>
      `;
      button.addEventListener("click", () => chooseWorld(index));
      grid.appendChild(button);
    });
  }

  function openWorldSelect() {
    renderWorldSelect();
    $("worldSelectPanel").classList.remove("hidden");
  }

  function closeWorldSelect() {
    $("worldSelectPanel").classList.add("hidden");
  }

  function chooseWorld(worldIndex) {
    closeWorldSelect();

    if (!MathQuest.Combat.selectWorld(worldIndex)) {
      return;
    }

    battleComplete = false;
    locked = false;
    selectedSkill = "slash";

    document.querySelectorAll(".skill").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.skill === "slash"
      );
    });

    $("victoryPanel").classList.add("hidden");
    $("chapterCompletePanel").classList.add("hidden");
    $("battleMessage").textContent = "YOUR TURN";

    updateBattleIdentity();
    updateHud();
    newProblem();

    window.scrollTo({top:0,behavior:"smooth"});
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

  function coinFaceMarkup(coin, side = "heads") {
    const isHeads = side === "heads";

    if (coin.name === "penny") {
      return isHeads
        ? `
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" class="coin-rim"/>
            <circle cx="50" cy="50" r="41" class="coin-field"/>
            <text x="50" y="17" class="coin-microtext">IN GOD WE TRUST</text>
            <path class="coin-portrait" d="M57 27c-8 0-14 5-15 13-1 5 1 9 4 12-4 5-7 11-8 21h29c-1-8-4-15-9-20 4-3 6-7 6-12 0-8-3-14-7-14z"/>
            <path class="coin-detail" d="M42 47c4 2 9 2 14 0M45 57c6 3 11 3 16 1"/>
            <text x="22" y="82" class="coin-sideword">LIBERTY</text>
            <text x="70" y="82" class="coin-year">2024</text>
          </svg>`
        : `
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" class="coin-rim"/>
            <circle cx="50" cy="50" r="41" class="coin-field"/>
            <text x="50" y="17" class="coin-microtext">UNITED STATES OF AMERICA</text>
            <path class="coin-building" d="M30 64h40v8H30zM34 42h32v21H34zM30 40l20-13 20 13zM40 47v16M50 47v16M60 47v16"/>
            <text x="50" y="82" class="coin-reverseword">ONE CENT</text>
          </svg>`;
    }

    if (coin.name === "nickel") {
      return isHeads
        ? `
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" class="coin-rim"/>
            <circle cx="50" cy="50" r="41" class="coin-field"/>
            <text x="50" y="17" class="coin-microtext">IN GOD WE TRUST</text>
            <path class="coin-portrait" d="M54 24c-8 1-14 7-14 15 0 5 2 9 6 12-4 5-7 12-8 23h31c-1-9-4-16-10-22 4-4 6-8 6-13 0-9-4-15-11-15z"/>
            <path class="coin-detail" d="M42 45c5 2 10 2 15-1M46 55c6 3 12 3 17 0"/>
            <text x="26" y="82" class="coin-sideword">LIBERTY</text>
            <text x="70" y="82" class="coin-year">2024</text>
          </svg>`
        : `
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" class="coin-rim"/>
            <circle cx="50" cy="50" r="41" class="coin-field"/>
            <text x="50" y="17" class="coin-microtext">E PLURIBUS UNUM</text>
            <path class="coin-building" d="M26 66h48v7H26zM32 46h36v20H32zM29 44l21-14 21 14zM39 51v15M50 51v15M61 51v15"/>
            <text x="50" y="82" class="coin-reverseword">MONTICELLO</text>
          </svg>`;
    }

    if (coin.name === "dime") {
      return isHeads
        ? `
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" class="coin-rim ridged"/>
            <circle cx="50" cy="50" r="40" class="coin-field"/>
            <text x="50" y="17" class="coin-microtext">LIBERTY</text>
            <path class="coin-portrait" d="M57 25c-9 0-15 6-15 15 0 5 2 10 6 13-5 5-8 12-9 22h31c-1-9-4-16-10-21 4-4 6-9 6-14 0-9-3-15-9-15z"/>
            <path class="coin-detail" d="M44 45c5 2 10 2 15-1M47 56c6 3 11 3 16 0"/>
            <text x="67" y="82" class="coin-year">2024</text>
          </svg>`
        : `
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="47" class="coin-rim ridged"/>
            <circle cx="50" cy="50" r="40" class="coin-field"/>
            <path class="coin-torch" d="M47 30h6l-2 14 7 10-6 4v19h-4V58l-6-4 7-10z"/>
            <path class="coin-branch" d="M29 69c11-7 17-16 19-26M71 69c-11-7-17-16-19-26"/>
            <text x="50" y="18" class="coin-microtext">UNITED STATES OF AMERICA</text>
            <text x="50" y="84" class="coin-reverseword">ONE DIME</text>
          </svg>`;
    }

    return isHeads
      ? `
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="47" class="coin-rim ridged"/>
          <circle cx="50" cy="50" r="40" class="coin-field"/>
          <text x="50" y="17" class="coin-microtext">LIBERTY</text>
          <path class="coin-portrait" d="M55 23c-8 0-14 6-14 15 0 6 2 10 6 14-5 5-8 12-9 23h32c-1-10-5-17-11-22 4-4 6-9 6-15 0-9-4-15-10-15z"/>
          <path class="coin-detail" d="M43 45c5 2 10 2 15-1M46 56c6 3 12 3 17 0"/>
          <text x="68" y="82" class="coin-year">2024</text>
        </svg>`
      : `
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="47" class="coin-rim ridged"/>
          <circle cx="50" cy="50" r="40" class="coin-field"/>
          <text x="50" y="17" class="coin-microtext">UNITED STATES OF AMERICA</text>
          <path class="coin-eagle" d="M50 37c8-7 18-8 27-4-5 3-9 7-11 12 5 2 9 5 12 9-8 1-14 0-20-4-2 8-3 16-2 24H44c1-8 0-16-2-24-6 4-12 5-20 4 3-4 7-7 12-9-2-5-6-9-11-12 9-4 19-3 27 4z"/>
          <text x="50" y="84" class="coin-reverseword">QUARTER DOLLAR</text>
        </svg>`;
  }

  function createCoinElement(coin, side = "heads", interactive = false) {
    const el = document.createElement(interactive ? "button" : "div");
    if (interactive) el.type = "button";

    el.className = `coin coin-${coin.name}${interactive ? " tray-coin" : ""}`;
    el.setAttribute("aria-label", `${coin.name}, ${side}`);
    el.innerHTML = coinFaceMarkup(coin, side);
    return el;
  }

  function renderCoinVisual(visual) {
    const wrap = document.createElement("div");
    wrap.className = "coin-row";

    visual.coins.forEach((coin, index) => {
      const side = index % 2 === 0 ? "heads" : "tails";
      wrap.appendChild(createCoinElement(coin, side, false));
    });

    return wrap;
  }

  function renderClockVisual(visual) {
    const size = 240;
    const center = 120;
    const radius = 96;

    const minuteAngle =
      visual.minute * 6;

    const hourAngle =
      ((visual.hour % 12) * 30) +
      (visual.minute * 0.5);

    const handEnd = (angle, length) => {
      const radians =
        (angle - 90) *
        Math.PI / 180;

      return {
        x:
          center +
          Math.cos(radians) *
          length,

        y:
          center +
          Math.sin(radians) *
          length
      };
    };

    const minuteEnd =
      handEnd(
        minuteAngle,
        78
      );

    const hourEnd =
      handEnd(
        hourAngle,
        56
      );

    const numbers =
      Array.from(
        {length:12},
        (_,index) => {
          const number =
            index + 1;

          const angle =
            number * 30 - 90;

          const radians =
            angle *
            Math.PI / 180;

          const x =
            center +
            Math.cos(radians) *
            78;

          const y =
            center +
            Math.sin(radians) *
            78 +
            6;

          return `
            <text
              x="${x}"
              y="${y}"
              text-anchor="middle"
              class="clock-number"
            >${number}</text>
          `;
        }
      )
      .join("");

    const svg =
      document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );

    svg.setAttribute(
      "viewBox",
      `0 0 ${size} ${size}`
    );

    svg.setAttribute(
      "class",
      "clock-face"
    );

    svg.setAttribute(
      "role",
      "img"
    );

    svg.setAttribute(
      "aria-label",
      "Analog clock"
    );

    svg.innerHTML =
      `
      <circle
        cx="${center}"
        cy="${center}"
        r="${radius}"
        class="clock-ring"
      />

      ${numbers}

      <line
        x1="${center}"
        y1="${center}"
        x2="${hourEnd.x}"
        y2="${hourEnd.y}"
        class="clock-hand clock-hour"
      />

      <line
        x1="${center}"
        y1="${center}"
        x2="${minuteEnd.x}"
        y2="${minuteEnd.y}"
        class="clock-hand clock-minute"
      />

      <circle
        cx="${center}"
        cy="${center}"
        r="6"
        class="clock-center"
      />
      `;

    return svg;
  }

  function renderProblemVisual(problem) {
    const host =
      $("problemVisual");

    host.innerHTML = "";

    if (!problem.visual) {
      host.classList.add(
        "hidden"
      );
      return;
    }

    host.classList.remove(
      "hidden"
    );

    if (
      problem.visual.type ===
      "coins"
    ) {
      host.appendChild(
        renderCoinVisual(
          problem.visual
        )
      );
    }

    if (
      problem.visual.type ===
      "clock"
    ) {
      host.appendChild(
        renderClockVisual(
          problem.visual
        )
      );
    }
  }

  function updateAnswerMode(problem) {
    const isTime = problem.answerType === "time";
    const isCoinTray = problem.answerType === "coinTray";

    $("normalAnswerLabel").classList.toggle("hidden", isTime || isCoinTray);
    $("timeAnswerGroup").classList.toggle("hidden", !isTime);

    $("answerInput").value = "";
    $("timeHourInput").value = "";
    $("timeMinuteInput").value = "";

    $("submitAnswerBtn").textContent =
      isCoinTray
        ? "✅ SUBMIT COINS"
        : "⚔️ ATTACK";

    if (isTime) {
      $("timeHourInput").focus();
    }
    else if (!isCoinTray) {
      $("answerInput").focus();
    }
  }

  function renderCoinTray() {
    const active = $("coinTrayActive");
    const removed = $("coinTrayRemoved");
    active.innerHTML = "";
    removed.innerHTML = "";

    coinTrayState.forEach((item, index) => {
      const button = createCoinElement(item.coin, item.side, true);
      button.dataset.coinIndex = String(index);
      button.title = item.removed ? "Put this coin back" : "Give this coin away";
      button.addEventListener("click", () => {
        item.removed = !item.removed;
        renderCoinTray();
      });

      (item.removed ? removed : active).appendChild(button);
    });

    if (!active.children.length) {
      active.innerHTML = '<div class="coin-tray-empty">No coins left here.</div>';
    }
    if (!removed.children.length) {
      removed.innerHTML = '<div class="coin-tray-empty">Coins you give away will appear here.</div>';
    }
  }

  function updateWorkspace(problem) {
    const world = MathQuest.Combat.currentWorld();
    const layout = $("learningLayout");
    const workspace = $("workspaceSide");
    const blocks = $("blockWorkspaceTools");
    const coins = $("coinWorkspaceTools");

    layout.classList.remove("single-column-learning");
    workspace.classList.remove("hidden");
    blocks.classList.add("hidden");
    coins.classList.add("hidden");

    if (world.id === "woods" || world.id === "mines") {
      $("workspaceTitle").textContent = "Block Workspace";
      $("toolHelp").textContent = "Build, break apart, and cross out blocks whenever they help.";
      blocks.classList.remove("hidden");
      coinTrayState = [];
      return;
    }

    if (world.id === "vault" && problem.answerType === "coinTray") {
      $("workspaceTitle").textContent = "Coin Tray";
      $("toolHelp").textContent = "Look at the coins themselves. Tap coins to move them to your friend, then submit when you think the amount is right.";
      coins.classList.remove("hidden");
      coinTrayState = problem.coinTray.coins.map((coin, index) => ({
        coin,
        removed:false,
        side:index % 2 === 0 ? "heads" : "tails"
      }));
      renderCoinTray();
      return;
    }

    // Story problems, visual money questions, and clock questions do not need blocks.
    workspace.classList.add("hidden");
    layout.classList.add("single-column-learning");
    coinTrayState = [];
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

    $("problem").classList.toggle(
      "compact-problem",
      currentProblem.prompt.length >= 12
    );

    renderProblemVisual(
      currentProblem
    );

    updateAnswerMode(
      currentProblem
    );

    updateWorkspace(
      currentProblem
    );

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
    const reward =
      MathQuest.Combat.addCorrect();

    const effect =
      MathQuest.Combat.useSkill(
        selectedSkill,
        hinted
      );

    $("feedback").textContent =
      `✅ Correct! +${reward.points} score.`;

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

    const continueTurn = async () => {
      if (!await enemyTurn()) {
        return;
      }

      $("battleMessage").textContent =
        "YOUR TURN";

      setTimeout(
        newProblem,
        450
      );
    };

    await continueTurn();
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

  function wait(ms) {
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }

  async function animateBattleXp() {
    if (battleXpAnimating) {
      return;
    }

    battleXpAnimating = true;

    const state =
      MathQuest.Combat.state;

    const xpReward =
      MathQuest.Combat.getBattleXpReward();

    const startLevel =
      state.level;

    const startXp =
      state.xp;

    const startXpToNext =
      state.xpToNext;

    $("battleXpGain").textContent =
      `+${xpReward} XP`;

    $("battleXpLevel").textContent =
      startLevel;

    $("battleXpNumbers").textContent =
      `${startXp} / ${startXpToNext} XP`;

    $("battleXpFill").style.width =
      `${(startXp / startXpToNext) * 100}%`;

    $("battleXpMessage").textContent =
      "Battle complete — adding XP...";

    $("nextBattleBtn").disabled =
      true;

    $("nextBattleBtn").textContent =
      "Adding XP...";

    await wait(300);

    let remainingXp =
      xpReward;

    let currentLevel =
      startLevel;

    let currentXp =
      startXp;

    let currentXpToNext =
      startXpToNext;

    while (remainingXp > 0) {
      const needed =
        currentXpToNext -
        currentXp;

      const chunk =
        Math.min(
          remainingXp,
          needed
        );

      currentXp +=
        chunk;

      remainingXp -=
        chunk;

      $("battleXpNumbers").textContent =
        `${currentXp} / ${currentXpToNext} XP`;

      $("battleXpFill").style.width =
        `${(currentXp / currentXpToNext) * 100}%`;

      const animationTime =
        Math.max(
          450,
          Math.min(
            1100,
            chunk * 45
          )
        );

      await wait(animationTime);

      if (
        currentXp >=
        currentXpToNext
      ) {
        currentLevel++;

        $("battleXpMessage").textContent =
          `${MathQuest.Combat.currentHero().name} reached Level ${currentLevel}!`;

        $("battleXpFill")
          .classList.add(
            "level-flash"
          );

        await wait(650);

        $("battleXpFill")
          .classList.remove(
            "level-flash"
          );

        currentXp = 0;

        currentXpToNext =
          100 +
          (currentLevel - 1) * 25;

        $("battleXpLevel").textContent =
          currentLevel;

        $("battleXpNumbers").textContent =
          `0 / ${currentXpToNext} XP`;

        $("battleXpFill").style.width =
          "0%";

        await wait(300);
      }
    }

    const levelResult =
      MathQuest.Combat.addXp(
        xpReward
      );

    updateHud();

    $("battleXpLevel").textContent =
      state.level;

    $("battleXpNumbers").textContent =
      `${state.xp} / ${state.xpToNext} XP`;

    $("battleXpFill").style.width =
      `${(state.xp / state.xpToNext) * 100}%`;

    if (levelResult.leveledUp) {
      $("battleXpMessage").textContent =
        `Level ${state.level}! +2 Max HP and fully healed!`;
    }
    else {
      $("battleXpMessage").textContent =
        "XP added!";
    }

    $("nextBattleBtn").disabled =
      false;

    $("nextBattleBtn").textContent =
      MathQuest.Combat.state.battleIndex ===
      MathQuest.Combat.currentWorld().battles.length - 1
        ? "Finish World"
        : "Next Battle";

    battleXpAnimating =
      false;
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

    $("battleXpGain").textContent =
      `+${MathQuest.Combat.getBattleXpReward()} XP`;

    $("battleXpLevel").textContent =
      MathQuest.Combat.state.level;

    $("battleXpNumbers").textContent =
      `${MathQuest.Combat.state.xp} / ${MathQuest.Combat.state.xpToNext} XP`;

    $("battleXpFill").style.width =
      `${(MathQuest.Combat.state.xp / MathQuest.Combat.state.xpToNext) * 100}%`;

    $("battleXpMessage").textContent =
      "Battle XP ready!";

    $("nextBattleBtn").disabled =
      true;

    $("nextBattleBtn").textContent =
      "Adding XP...";

    $("victoryPanel")
      .classList.remove("hidden");

    animateBattleXp();
  }

  function nextBattle() {
    if (battleXpAnimating) {
      return;
    }

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

    if (locked || battleComplete) {
      return;
    }

    let isCorrect = false;

    if (currentProblem.answerType === "time") {
      const hour = Number.parseInt($("timeHourInput").value, 10);
      const minute = Number.parseInt($("timeMinuteInput").value, 10);

      if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
        $("feedback").textContent = "Enter the hour and minutes.";
        return;
      }

      isCorrect =
        hour === currentProblem.answer.hour &&
        minute === currentProblem.answer.minute;
    }
    else if (currentProblem.answerType === "coinTray") {
      const removedTotal = coinTrayState
        .filter(item => item.removed)
        .reduce((sum, item) => sum + item.coin.value, 0);

      const remainingTotal = coinTrayState
        .filter(item => !item.removed)
        .reduce((sum, item) => sum + item.coin.value, 0);

      isCorrect =
        removedTotal === currentProblem.coinTray.removeAmount &&
        remainingTotal === currentProblem.coinTray.targetRemaining;
    }
    else {
      const answer = Number.parseInt($("answerInput").value, 10);

      if (!Number.isFinite(answer)) {
        $("feedback").textContent = "Enter an answer first.";
        return;
      }

      isCorrect = answer === currentProblem.answer;
    }

    locked = true;

    if (isCorrect) {
      handleCorrect();
      return;
    }

    if (currentProblem.answerType === "time") {
      $("feedback").textContent =
        `Not quite. The correct time is ${currentProblem.answer.hour}:${String(currentProblem.answer.minute).padStart(2,"0")}.`;
    }
    else if (currentProblem.answerType === "coinTray") {
      $("feedback").textContent =
        "Not quite. Check which coins you gave away and try the next one.";
    }
    else {
      $("feedback").textContent = `Not quite. The answer is ${currentProblem.answer}.`;
    }

    MathQuest.Combat.addWrong();

    enemyTurn().then(survived => {
      if (!survived) return;
      $("battleMessage").textContent = "YOUR TURN";
      setTimeout(newProblem, 550);
    });
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

    $("timeHourInput")
      .addEventListener(
        "input",
        () => {
          if (
            $("timeHourInput")
              .value
              .length >= 2
          ) {
            $("timeMinuteInput")
              .focus();
          }
        }
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
$("beginJourneyBtn")
      .addEventListener(
        "click",
        () => {
          $("storyIntroPanel")
            .classList.add("hidden");

          $("answerInput").focus();
        }
      );

    $("worldSelectBtn").addEventListener("click", openWorldSelect);
    $("closeWorldSelectBtn").addEventListener("click", closeWorldSelect);
    renderWorldSelect();

    newProblem();
  }

  init();
})();
