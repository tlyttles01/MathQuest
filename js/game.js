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
  let pendingPowerTutorialSelection = false;
  let playMode = "adventure";
  let adventureSnapshot = null;
  let coinTrayState = [];
  let equationOperators = ["+", "+"];

  const SAVE_KEY =
    "mathQuestSaveV1";

  const crystalInfo = [
    {name:"Forest Crystal", icon:"🌿"},
    {name:"Earth Crystal", icon:"🪨"},
    {name:"Story Crystal", icon:"📖"},
    {name:"Coin Crystal", icon:"🪙"},
    {name:"Time Crystal", icon:"⏳"}
  ];

  let progress = {
    unlockedWorlds: 1,
    completedWorlds: [],
    crystals: [],
    resumeWorldIndex: 0,
    resumeBattleIndex: 0,
    hasStarted: false,
    powerTutorialSeen: false
  };
const skillInfo = {
    slash: {
      label: "⚔️ SWORD SLASH",
      effect: "2 damage · gain 1 Focus"
    },
    power: {
      label: "💥 POWER STRIKE",
      effect: "4 damage · costs 2 Focus"
    },
    guard: {
      label: "🛡️ GUARD",
      effect: "Block incoming attack · gain 1 Focus"
    }
  };

  const formatNumber = value =>
    Number.isInteger(value)
      ? String(value)
      : value.toFixed(1);


  function captureCombatSnapshot() {
    const state =
      MathQuest.Combat.state;

    return {
      heroId: state.heroId,
      level: state.level,
      xp: state.xp,
      xpToNext: state.xpToNext,
      heroMaxHp: state.heroMaxHp,
      score: state.score,
      powerStrikeUnlocked:
        state.powerStrikeUnlocked,
      focus: state.focus,
      maxFocus: state.maxFocus,
      skillStars: state.skillStars,
      starMilestones: [...state.starMilestones],
      merchantVisited: state.merchantVisited,
      purchasedItems: {...state.purchasedItems},
      counterShieldCharges: state.counterShieldCharges,
      secondChanceCharges: state.secondChanceCharges,
      worldIndex: state.worldIndex,
      battleIndex: state.battleIndex
    };
  }

  function restoreAdventureSnapshot() {
    if (!adventureSnapshot) {
      return false;
    }

    MathQuest.Combat.applySavedState(
      adventureSnapshot
    );

    return true;
  }

  function enterPracticeMode(worldIndex) {
    if (playMode !== "practice") {
      adventureSnapshot =
        captureCombatSnapshot();
    }

    playMode = "practice";

    if (
      !MathQuest.Combat.selectWorld(
        worldIndex
      )
    ) {
      return false;
    }

    battleComplete = false;
    locked = false;
    selectedSkill = "slash";

    $("victoryPanel").classList.add("hidden");
    $("chapterCompletePanel").classList.add("hidden");
    $("battleMessage").textContent =
      "PRACTICE";

    updateBattleIdentity();
    updateHud();
    newProblem();

    window.scrollTo({
      top:0,
      behavior:"smooth"
    });

    return true;
  }

  function returnToAdventure() {
    if (playMode !== "practice") {
      openAdventureHome();
      return;
    }

    restoreAdventureSnapshot();
    playMode = "adventure";

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

    $("victoryPanel").classList.add("hidden");
    $("chapterCompletePanel").classList.add("hidden");
    $("battleMessage").textContent =
      "YOUR TURN";

    updateBattleIdentity();
    updateHud();
    newProblem();

    openAdventureHome();
  }

  function normalizeProgress(raw = {}) {
    const completed =
      Array.isArray(raw.completedWorlds)
        ? raw.completedWorlds
            .map(Number)
            .filter(index =>
              Number.isInteger(index) &&
              index >= 0 &&
              index < MathQuest.Combat.worlds.length
            )
        : [];

    const crystals =
      Array.isArray(raw.crystals)
        ? raw.crystals
            .map(Number)
            .filter(index =>
              Number.isInteger(index) &&
              index >= 0 &&
              index < MathQuest.Combat.worlds.length
            )
        : [];

    const unlockedFromCompletion =
      completed.length
        ? Math.min(
            MathQuest.Combat.worlds.length,
            Math.max(...completed) + 2
          )
        : 1;

    return {
      unlockedWorlds:
        Math.min(
          MathQuest.Combat.worlds.length,
          Math.max(
            1,
            Number(raw.unlockedWorlds) || 1,
            unlockedFromCompletion
          )
        ),

      completedWorlds:
        [...new Set(completed)],

      crystals:
        [...new Set(crystals)],

      resumeWorldIndex:
        Math.min(
          MathQuest.Combat.worlds.length - 1,
          Math.max(0, Number(raw.resumeWorldIndex) || 0)
        ),

      resumeBattleIndex:
        Math.max(0, Number(raw.resumeBattleIndex) || 0),

      hasStarted:
        Boolean(raw.hasStarted),

      powerTutorialSeen:
        Boolean(raw.powerTutorialSeen)
    };
  }

  function loadSave() {
    try {
      const raw =
        localStorage.getItem(SAVE_KEY);

      if (!raw) {
        return null;
      }

      const saved =
        JSON.parse(raw);

      progress =
        normalizeProgress(
          saved.progress || {}
        );

      return saved;
    }
    catch (error) {
      console.warn(
        "Math Quest save could not be loaded.",
        error
      );

      return null;
    }
  }

  function saveGame(resumeWorldIndex, resumeBattleIndex) {
    if (playMode === "practice") {
      return;
    }

    const state =
      MathQuest.Combat.state;

    if (
      Number.isInteger(resumeWorldIndex)
    ) {
      progress.resumeWorldIndex =
        resumeWorldIndex;
    }

    if (
      Number.isInteger(resumeBattleIndex)
    ) {
      progress.resumeBattleIndex =
        resumeBattleIndex;
    }

    progress.hasStarted = true;

    const save = {
      version: 1,
      savedAt:
        new Date().toISOString(),

      hero: {
        heroId: state.heroId,
        level: state.level,
        xp: state.xp,
        xpToNext: state.xpToNext,
        heroMaxHp: state.heroMaxHp,
        score: state.score,
        powerStrikeUnlocked:
          state.powerStrikeUnlocked,

        focus:
          state.focus,

        maxFocus:
          state.maxFocus,

        skillStars:
          state.skillStars,

        starMilestones:
          [...state.starMilestones],

        merchantVisited:
          state.merchantVisited,

        purchasedItems:
          {...state.purchasedItems},

        counterShieldCharges:
          state.counterShieldCharges,

        secondChanceCharges:
          state.secondChanceCharges,

        worldIndex:
          progress.resumeWorldIndex,

        battleIndex:
          progress.resumeBattleIndex
      },

      progress
    };

    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(save)
      );
    }
    catch (error) {
      console.warn(
        "Math Quest save could not be written.",
        error
      );
    }

    renderAdventureHome();
  }

  function clearSave() {
    try {
      localStorage.removeItem(
        SAVE_KEY
      );
    }
    catch (error) {
      console.warn(
        "Math Quest save could not be cleared.",
        error
      );
    }

    progress =
      normalizeProgress({});
  }

  function markWorldComplete(worldIndex) {
    if (
      !progress.completedWorlds.includes(
        worldIndex
      )
    ) {
      progress.completedWorlds.push(
        worldIndex
      );
    }

    if (
      !progress.crystals.includes(
        worldIndex
      )
    ) {
      progress.crystals.push(
        worldIndex
      );
    }

    progress.unlockedWorlds =
      Math.min(
        MathQuest.Combat.worlds.length,
        Math.max(
          progress.unlockedWorlds,
          worldIndex + 2
        )
      );

    const nextWorld =
      Math.min(
        MathQuest.Combat.worlds.length - 1,
        worldIndex + 1
      );

    progress.resumeWorldIndex =
      nextWorld;

    progress.resumeBattleIndex =
      worldIndex <
        MathQuest.Combat.worlds.length - 1
        ? 0
        : MathQuest.Combat.worlds[
            worldIndex
          ].battles.length - 1;
  }

  function renderCrystalRow() {
    const row =
      $("homeCrystalRow");

    row.innerHTML = "";

    crystalInfo.forEach(
      (crystal, index) => {
        const earned =
          progress.crystals.includes(
            index
          );

        const item =
          document.createElement(
            "div"
          );

        item.className =
          `crystal-slot ${
            earned
              ? "earned"
              : "locked"
          }`;

        item.innerHTML =
          `
          <span class="crystal-slot-icon">
            ${earned
              ? crystal.icon
              : "◇"}
          </span>
          <small>${crystal.name}</small>
          `;

        row.appendChild(item);
      }
    );

    $("homeCrystalCount")
      .textContent =
        `${progress.crystals.length} / ${crystalInfo.length} crystals`;
  }

  function startAdventureAt(
    worldIndex,
    battleIndex = 0,
    preserveRun = false
  ) {
    playMode = "adventure";
    adventureSnapshot = null;

    const runSnapshot =
      preserveRun
        ? captureCombatSnapshot()
        : null;
    const safeWorld =
      Math.min(
        progress.unlockedWorlds - 1,
        Math.max(0, worldIndex)
      );

    MathQuest.Combat.selectWorld(
      safeWorld
    );

    MathQuest.Combat.state.battleIndex =
      Math.min(
        MathQuest.Combat.currentWorld()
          .battles.length - 1,
        Math.max(0, battleIndex)
      );

    MathQuest.Combat.resetBattle();

    if (
      runSnapshot &&
      runSnapshot.worldIndex === safeWorld
    ) {
      const state =
        MathQuest.Combat.state;

      state.skillStars =
        runSnapshot.skillStars || 0;

      state.starMilestones =
        Array.isArray(runSnapshot.starMilestones)
          ? [...runSnapshot.starMilestones]
          : [];

      state.merchantVisited =
        Boolean(runSnapshot.merchantVisited);

      state.purchasedItems =
        runSnapshot.purchasedItems
          ? {...runSnapshot.purchasedItems}
          : {};

      state.counterShieldCharges =
        runSnapshot.counterShieldCharges || 0;

      state.secondChanceCharges =
        runSnapshot.secondChanceCharges || 0;

      state.focus =
        Math.min(
          state.maxFocus,
          Math.max(
            1,
            runSnapshot.focus || 1
          )
        );
    }

    battleComplete = false;
    locked = false;
    selectedSkill = "slash";

    document
      .querySelectorAll(".skill")
      .forEach(button => {
        button.classList.toggle(
          "active",
          button.dataset.skill ===
            "slash"
        );
      });

    $("adventureHomePanel")
      .classList.add("hidden");

    $("storyIntroPanel")
      .classList.add("hidden");

    $("victoryPanel")
      .classList.add("hidden");

    $("chapterCompletePanel")
      .classList.add("hidden");

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

  function renderAdventureMap() {
    const grid =
      $("adventureMapGrid");

    grid.innerHTML = "";

    MathQuest.Combat.worlds.forEach(
      (world, index) => {
        const unlocked =
          index <
          progress.unlockedWorlds;

        const completed =
          progress.completedWorlds
            .includes(index);

        const button =
          document.createElement(
            "button"
          );

        button.type = "button";

        button.className =
          `map-world-card ${
            completed
              ? "completed"
              : unlocked
                ? "unlocked"
                : "locked"
          }`;

        button.disabled =
          !unlocked;

        button.innerHTML =
          `
          <span class="map-world-number">
            WORLD ${index + 1}
          </span>

          <span class="map-world-icon">
            ${
              completed
                ? crystalInfo[index].icon
                : unlocked
                  ? world.bossIcon
                  : "🔒"
            }
          </span>

          <strong>${world.name}</strong>

          <small>
            ${
              completed
                ? `${crystalInfo[index].name} recovered`
                : unlocked
                  ? world.description
                  : "Defeat the previous boss to unlock"
            }
          </small>

          <span class="map-world-status">
            ${
              completed
                ? "✓ Complete"
                : unlocked
                  ? "Enter World"
                  : "Locked"
            }
          </span>
          `;

        if (unlocked) {
          button.addEventListener(
            "click",
            () => {
              progress.resumeWorldIndex =
                index;

              progress.resumeBattleIndex =
                0;

              saveGame(
                index,
                0
              );

              startAdventureAt(
                index,
                0
              );
            }
          );
        }

        grid.appendChild(button);
      }
    );
  }

  function renderAdventureHome() {
    renderCrystalRow();
    renderAdventureMap();

    const hasSave =
      progress.hasStarted;

    $("continueAdventureBtn")
      .disabled =
        !hasSave;

    $("adventureHomeTitle").textContent =
      playMode === "practice"
        ? "Return to Adventure"
        : "The Crystal Quest";

    $("continueAdventureBtn")
      .textContent =
        playMode === "practice"
          ? "Return to Adventure"
          : hasSave
            ? `Continue: ${
                MathQuest.Combat.worlds[
                  progress.resumeWorldIndex
                ].name
              }`
            : "Continue Adventure";

    $("homeStatusText")
      .textContent =
        progress.crystals.length ===
        crystalInfo.length
          ? "All five crystals have been recovered!"
          : progress.crystals.length > 0
            ? `You have recovered ${progress.crystals.length} of the 5 learning crystals.`
            : "Recover the five learning crystals and restore the kingdom.";
  }

  function openAdventureHome() {
    renderAdventureHome();

    $("adventureHomePanel")
      .classList.remove("hidden");
  }

  function continueAdventure() {
    if (!progress.hasStarted) {
      return;
    }

    if (playMode === "practice") {
      returnToAdventure();
      return;
    }

    startAdventureAt(
      progress.resumeWorldIndex,
      progress.resumeBattleIndex,
      true
    );
  }

  function newAdventure() {
    playMode = "adventure";
    adventureSnapshot = null;
    clearSave();

    MathQuest.Combat.beginGame();

    progress.hasStarted =
      true;

    saveGame(0, 0);

    renderAdventureHome();

    $("adventureHomePanel")
      .classList.add("hidden");

    $("storyIntroPanel")
      .classList.remove("hidden");

    updateBattleIdentity();
    updateHud();
    newProblem();
  }

  const merchantCatalog = {
    healing: {
      cost: 1,
      label: "Healing Potion"
    },
    focus: {
      cost: 1,
      label: "Focus Potion"
    },
    counter: {
      cost: 2,
      label: "Counter Shield"
    },
    secondChance: {
      cost: 2,
      label: "Second Chance Charm"
    }
  };

  function awardSkillStarMilestone() {
    const state =
      MathQuest.Combat.state;

    const milestone =
      [3,5,7,10].find(
        value =>
          value === state.streak &&
          !state.starMilestones.includes(value)
      );

    if (!milestone) {
      return false;
    }

    state.starMilestones.push(
      milestone
    );

    state.skillStars++;

    return true;
  }

  function renderMerchant() {
    const state =
      MathQuest.Combat.state;

    $("merchantStars").textContent =
      state.skillStars;

    document
      .querySelectorAll("[data-item]")
      .forEach(card => {
        const itemId =
          card.dataset.item;

        const item =
          merchantCatalog[itemId];

        const button =
          card.querySelector(
            "[data-buy-item]"
          );

        const purchased =
          Boolean(
            state.purchasedItems[itemId]
          );

        let unavailableReason = "";

        if (
          itemId === "healing" &&
          state.heroHp >= state.heroMaxHp
        ) {
          unavailableReason =
            "HP is already full";
        }

        if (
          itemId === "focus" &&
          state.focus >= state.maxFocus
        ) {
          unavailableReason =
            "Focus is already full";
        }

        const affordable =
          state.skillStars >= item.cost;

        button.disabled =
          purchased ||
          !affordable ||
          Boolean(unavailableReason);

        if (purchased) {
          button.textContent =
            "Purchased ✓";
        }
        else if (unavailableReason) {
          button.textContent =
            unavailableReason;
        }
        else {
          button.textContent =
            `Buy · ${"🌟".repeat(item.cost)} ${item.cost}`;
        }

        card.classList.toggle(
          "purchased",
          purchased
        );
      });

    updateHud();
  }

  function showMerchant() {
    locked = true;

    $("merchantMessage").textContent =
      playMode === "practice"
        ? "Practice purchases are temporary and will disappear when you return to Adventure."
        : "Skill Stars reset when you move to the next world.";

    renderMerchant();

    $("merchantPanel")
      .classList.remove("hidden");
  }

  function buyMerchantItem(itemId) {
    const state =
      MathQuest.Combat.state;

    const item =
      merchantCatalog[itemId];

    if (
      !item ||
      state.purchasedItems[itemId] ||
      state.skillStars < item.cost
    ) {
      return;
    }

    if (
      itemId === "healing" &&
      state.heroHp >= state.heroMaxHp
    ) {
      return;
    }

    if (
      itemId === "focus" &&
      state.focus >= state.maxFocus
    ) {
      return;
    }

    state.skillStars -=
      item.cost;

    state.purchasedItems[itemId] =
      true;

    if (itemId === "healing") {
      const before =
        state.heroHp;

      state.heroHp =
        Math.min(
          state.heroMaxHp,
          state.heroHp + 5
        );

      $("merchantMessage").textContent =
        `❤️ Restored ${state.heroHp - before} HP.`;
    }
    else if (itemId === "focus") {
      const before =
        state.focus;

      state.focus =
        Math.min(
          state.maxFocus,
          state.focus + 2
        );

      $("merchantMessage").textContent =
        `⚡ Gained ${state.focus - before} Focus.`;
    }
    else if (itemId === "counter") {
      state.counterShieldCharges =
        1;

      $("merchantMessage").textContent =
        "🛡️ Your next correct Sword Slash will also Guard.";
    }
    else if (itemId === "secondChance") {
      state.secondChanceCharges =
        1;

      $("merchantMessage").textContent =
        "🍀 Your next wrong answer will not trigger an enemy attack.";
    }

    saveGame(
      state.worldIndex,
      state.battleIndex
    );

    renderMerchant();
  }

  function leaveMerchant() {
    const state =
      MathQuest.Combat.state;

    state.merchantVisited =
      true;

    saveGame(
      state.worldIndex,
      state.battleIndex
    );

    $("merchantPanel")
      .classList.add("hidden");

    locked = false;

    nextBattle();
  }

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

    $("skillStars").textContent =
      state.skillStars;

    const heldItems = [];

    if (state.counterShieldCharges > 0) {
      heldItems.push("🛡️ Counter Shield ready");
    }

    if (state.secondChanceCharges > 0) {
      heldItems.push("🍀 Second Chance ready");
    }

    $("itemStatus").textContent =
      heldItems.join(" · ");

    $("itemStatus").classList.toggle(
      "hidden",
      heldItems.length === 0
    );

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

    $("heroFocus").textContent =
      state.focus;

    $("heroMaxFocus").textContent =
      state.maxFocus;

    $("heroFocusBar").style.width =
      `${(state.focus / state.maxFocus) * 100}%`;

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
          ? "Normal question · block attack · +1 Focus"
          : "Unlocks later";

    const slashHint =
      document.querySelector(
        '[data-skill="slash"] small'
      );

    if (slashHint) {
      slashHint.textContent =
        "Normal question · 2 damage · +1 Focus";
    }

    const powerUnlocked =
      state.powerStrikeUnlocked;

    const hasPowerFocus =
      state.focus >= 2;

    $("powerSkill").disabled =
      !powerUnlocked ||
      !hasPowerFocus;

    $("powerSkill").classList.toggle(
      "locked",
      !powerUnlocked
    );

    $("powerSkill").classList.toggle(
      "needs-focus",
      powerUnlocked &&
      !hasPowerFocus
    );

    $("powerSkill")
      .querySelector("b")
      .textContent =
        !powerUnlocked
          ? "💥 Power Strike 🔒"
          : hasPowerFocus
            ? "💥 Power Strike"
            : "💥 Power Strike ⚡";

    $("powerSkill")
      .querySelector("small")
      .textContent =
        !powerUnlocked
          ? "Defeat the Goblin King to unlock"
          : hasPowerFocus
            ? "Harder question · 4 damage · costs 2 Focus"
            : `Need 2 Focus · you have ${state.focus}`;

    if (
      selectedSkill === "guard" &&
      !guardUnlocked
    ) {
      selectedSkill = "slash";
    }

    if (
      selectedSkill === "power" &&
      (
        !powerUnlocked ||
        !hasPowerFocus
      )
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
      playMode === "practice"
        ? `${world.label} · PRACTICE`
        : world.label;

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

    enterPracticeMode(
      worldIndex
    );
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

    if (
      skill === "power" &&
      !progress.powerTutorialSeen
    ) {
      pendingPowerTutorialSelection =
        true;

      $("powerTutorialOverlay")
        .classList.remove("hidden");

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

  function closePowerTutorial(usePowerStrike) {
    progress.powerTutorialSeen =
      true;

    saveGame(
      MathQuest.Combat.state.worldIndex,
      MathQuest.Combat.state.battleIndex
    );

    $("powerTutorialOverlay")
      .classList.add("hidden");

    const shouldSelectPower =
      usePowerStrike &&
      pendingPowerTutorialSelection &&
      !battleComplete &&
      !locked &&
      !$("powerSkill").disabled;

    pendingPowerTutorialSelection =
      false;

    if (shouldSelectPower) {
      selectedSkill = "power";

      document
        .querySelectorAll(".skill")
        .forEach(button => {
          button.classList.toggle(
            "active",
            button.dataset.skill === "power"
          );
        });

      newProblem();
    }
  }

  function coinFaceMarkup(coin) {
    const safeName =
      ["penny","nickel","dime","quarter"]
        .includes(coin.name)
        ? coin.name
        : "nickel";

    return `
      <img
        class="coin-image"
        src="coinImages/${safeName}.png?v=24"
        alt=""
        draggable="false"
      >
    `;
  }

  function createCoinElement(coin, side = "heads", interactive = false) {
    const el = document.createElement(interactive ? "button" : "div");
    if (interactive) el.type = "button";

    el.className = `coin coin-${coin.name}${interactive ? " tray-coin" : ""}`;
    el.setAttribute("aria-label", coin.name);
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
    const isLibrary =
      MathQuest.Combat.currentWorld().id ===
      "library";

    $("normalAnswerLabel").classList.toggle(
      "hidden",
      isTime ||
      isCoinTray ||
      isLibrary
    );
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
    else if (
      !isCoinTray &&
      !isLibrary
    ) {
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


  function setEquationOperator(index, operator) {
    const safeIndex =
      index === 1 ? 1 : 0;

    equationOperators[safeIndex] =
      operator === "-" ? "-" : "+";

    const suffix =
      safeIndex + 1;

    $(`equationPlus${suffix}`)
      .classList.toggle(
        "active",
        equationOperators[safeIndex] === "+"
      );

    $(`equationMinus${suffix}`)
      .classList.toggle(
        "active",
        equationOperators[safeIndex] === "-"
      );

    $(`equationPlus${suffix}`)
      .setAttribute(
        "aria-pressed",
        equationOperators[safeIndex] === "+"
          ? "true"
          : "false"
      );

    $(`equationMinus${suffix}`)
      .setAttribute(
        "aria-pressed",
        equationOperators[safeIndex] === "-"
          ? "true"
          : "false"
      );
  }

  function clearEquationBuilder() {
    $("equationLeft").value = "";
    $("equationMiddle").value = "";
    $("equationRight").value = "";
    $("equationResult").value = "";

    setEquationOperator(0, "+");
    setEquationOperator(1, "+");

    $("answerInput").value = "";
  }

  function configureEquationBuilder(problem) {
    const builder =
      problem.builder || {
        operands:[],
        operators:[]
      };

    const twoStep =
      selectedSkill === "power" ||
      builder.operands.length >= 3;

    $("equationBuilder")
      .classList.toggle(
        "two-step",
        twoStep
      );

    $("equationBuilderNote")
      .textContent =
        twoStep
          ? "Power Strike: build both steps from the story, then solve the equation."
          : "Build the math sentence from the story, then solve it.";

    clearEquationBuilder();

    requestAnimationFrame(
      () => $("equationLeft").focus()
    );
  }

  function syncEquationResult() {
    if (
      MathQuest.Combat.currentWorld().id !==
      "library"
    ) {
      return;
    }

    $("answerInput").value =
      $("equationResult").value;
  }

  function readEquationBuilder() {
    const builder =
      currentProblem.builder;

    if (!builder) {
      return {
        complete:true,
        correct:true
      };
    }

    const values = [
      Number.parseInt(
        $("equationLeft").value,
        10
      ),
      Number.parseInt(
        $("equationMiddle").value,
        10
      )
    ];

    if (
      builder.operands.length >= 3
    ) {
      values.push(
        Number.parseInt(
          $("equationRight").value,
          10
        )
      );
    }

    const result =
      Number.parseInt(
        $("equationResult").value,
        10
      );

    const complete =
      values.every(
        Number.isFinite
      ) &&
      Number.isFinite(result);

    if (!complete) {
      return {
        complete:false,
        correct:false
      };
    }

    let operandsCorrect =
      values.every(
        (value, index) =>
          value ===
          builder.operands[index]
      );

    if (
      builder.operands.length === 2 &&
      builder.operators[0] === "+" &&
      !operandsCorrect
    ) {
      operandsCorrect =
        values[0] === builder.operands[1] &&
        values[1] === builder.operands[0];
    }

    const operatorsCorrect =
      builder.operators.every(
        (operator, index) =>
          equationOperators[index] ===
          operator
      );

    return {
      complete:true,
      correct:
        operandsCorrect &&
        operatorsCorrect &&
        result ===
          currentProblem.answer
    };
  }

  function updateWorkspace(problem) {
    const world = MathQuest.Combat.currentWorld();
    const layout = $("learningLayout");
    const workspace = $("workspaceSide");
    const blocks = $("blockWorkspaceTools");
    const coins = $("coinWorkspaceTools");
    const equationBuilder = $("equationBuilderTools");

    layout.classList.remove("single-column-learning");
    workspace.classList.remove("hidden");
    blocks.classList.add("hidden");
    coins.classList.add("hidden");
    equationBuilder.classList.add("hidden");

    if (world.id === "woods" || world.id === "mines") {
      $("workspaceTitle").textContent = "Block Workspace";
      $("toolHelp").textContent = "Build, break apart, and cross out blocks whenever they help.";
      blocks.classList.remove("hidden");
      coinTrayState = [];
      return;
    }

    if (world.id === "library") {
      $("workspaceTitle").textContent = "Build the Problem";
      $("toolHelp").textContent = "Turn the story into a math sentence before you answer.";
      equationBuilder.classList.remove("hidden");
      coinTrayState = [];
      configureEquationBuilder(problem);
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

    // Visual money questions and clock questions do not need a workspace.
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

    const isEquationProblem =
      /___|[0-9]\s*[+\-]=?|=\s*[0-9_]/.test(
        currentProblem.prompt
      ) &&
      currentProblem.prompt.length <= 24;

    $("problem").classList.toggle(
      "equation-problem",
      isEquationProblem
    );

    $("problem").classList.toggle(
      "compact-problem",
      isEquationProblem &&
      currentProblem.prompt.length >= 12
    );

    $("problem").classList.toggle(
      "story-problem",
      !isEquationProblem &&
      currentProblem.prompt.length >= 26
    );

    $("problem").classList.toggle(
      "word-problem",
      world.id === "library"
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

    const earnedSkillStar =
      awardSkillStarMilestone();

    /*
      Sword Slash and Guard build Focus.
      Power Strike spends 2 Focus inside Combat.useSkill().
    */
    if (
      selectedSkill === "slash" ||
      selectedSkill === "guard"
    ) {
      MathQuest.Combat.gainFocus(1);
    }

    const state =
      MathQuest.Combat.state;

    let counterShieldUsed =
      false;

    if (
      selectedSkill === "slash" &&
      state.counterShieldCharges > 0
    ) {
      state.counterShieldCharges--;
      state.guardActive = true;
      counterShieldUsed = true;
    }

    const effect =
      MathQuest.Combat.useSkill(
        selectedSkill,
        hinted
      );

    $("feedback").textContent =
      (
        selectedSkill === "power"
          ? `✅ Correct! +${reward.points} score. Power Strike used 2 Focus.`
          : `✅ Correct! +${reward.points} score. +1 Focus.`
      ) +
      (
        earnedSkillStar
          ? " 🌟 Skill Star earned!"
          : ""
      ) +
      (
        counterShieldUsed
          ? " 🛡️ Counter Shield activated!"
          : ""
      );

    updateHud();
    updateSkillAvailability();

    if (effect.kind === "guard") {
      $("battleMessage").textContent =
        "GUARD!";

      await MathQuest.Animations.guardUp();
    }
    else if (effect.kind === "damage") {
      $("battleMessage").textContent =
        selectedSkill === "power"
          ? "POWER STRIKE!"
          : "SWORD SLASH!";

      await MathQuest.Animations.playerAttack(
        selectedSkill,
        effect.value
      );

      updateHud();
      updateSkillAvailability();

      if (
        MathQuest.Combat.state.enemyHp <= 0
      ) {
        showVictory();
        return;
      }
    }
    else if (effect.kind === "no-focus") {
      $("feedback").textContent =
        "You need 2 Focus to use Power Strike.";

      selectedSkill = "slash";
      updateSkillAvailability();
      locked = false;
      newProblem();
      return;
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

    saveGame(
      MathQuest.Combat.state.worldIndex,
      MathQuest.Combat.state.battleIndex
    );

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

    const state =
      MathQuest.Combat.state;

    if (
      state.battleIndex === 3 &&
      !state.merchantVisited
    ) {
      showMerchant();
      return;
    }

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

    saveGame(
      MathQuest.Combat.state.worldIndex,
      MathQuest.Combat.state.battleIndex
    );

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

    const completedWorldIndex =
      MathQuest.Combat.state.worldIndex;

    if (playMode === "adventure") {
      if (world.unlockPowerStrike) {
        MathQuest.Combat.unlockPowerStrike();
      }

      markWorldComplete(
        completedWorldIndex
      );

      saveGame(
        progress.resumeWorldIndex,
        progress.resumeBattleIndex
      );
    }

    $("chapterCompleteIcon").textContent =
      world.bossIcon;

    if ($("crystalAward")) {
      $("crystalAward").classList.toggle(
        "hidden",
        playMode === "practice"
      );
    }

    if (
      playMode === "adventure" &&
      $("crystalAwardGem")
    ) {
      $("crystalAwardGem").textContent =
        crystalInfo[
          completedWorldIndex
        ].icon;
    }

    if (
      playMode === "adventure" &&
      $("crystalAwardName")
    ) {
      $("crystalAwardName").textContent =
        crystalInfo[
          completedWorldIndex
        ].name;
    }

    $("chapterCompleteTitle").textContent =
      playMode === "practice"
        ? `${world.name} Practice Complete!`
        : world.completionTitle;

    $("chapterCompleteText").textContent =
      playMode === "practice"
        ? `You finished practicing ${world.name}. Your adventure progress was not changed.`
        : world.completionText;

    $("skillUnlockCard")
      .classList.toggle(
        "hidden",
        playMode === "practice" ||
        !world.unlockPowerStrike
      );

    $("chapterSummary").innerHTML =
      playMode === "practice"
        ? `
          <span class="reward-pill">
            🎯 Practice Complete
          </span>
          <span class="reward-pill">
            ⭐ Practice Score ${MathQuest.Combat.state.score}
          </span>
          `
        : `
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
      playMode === "practice"
        ? "Return to Adventure →"
        : hasNextWorld
          ? `Continue to ${MathQuest.Combat.worlds[
              MathQuest.Combat.state.worldIndex + 1
            ].name} →`
          : "Adventure Complete!";

    $("nextWorldBtn").disabled =
      playMode === "adventure" &&
      !hasNextWorld;

    $("restartChapterBtn").textContent =
      playMode === "practice"
        ? "Practice This World Again"
        : "Replay This World";

    $("chapterCompletePanel")
      .classList.remove("hidden");

    $("battleMessage").textContent =
      playMode === "practice"
        ? "PRACTICE COMPLETE!"
        : "WORLD CLEAR!";
  }

  function nextWorld() {
    $("chapterCompletePanel")
      .classList.add("hidden");

    if (playMode === "practice") {
      returnToAdventure();
      return;
    }

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

    if (playMode === "adventure") {
      saveGame(
        MathQuest.Combat.state.worldIndex,
        0
      );
    }

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

    saveGame(
      MathQuest.Combat.state.worldIndex,
      0
    );

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
    else if (
      MathQuest.Combat.currentWorld().id ===
      "library"
    ) {
      const equation =
        readEquationBuilder();

      if (!equation.complete) {
        $("feedback").textContent =
          "Build the whole math sentence first.";
        return;
      }

      isCorrect =
        equation.correct;
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
    else if (
      MathQuest.Combat.currentWorld().id ===
      "library"
    ) {
      $("feedback").textContent =
        "Not quite. Check the numbers and operation in your math sentence.";
    }
    else {
      $("feedback").textContent = `Not quite. The answer is ${currentProblem.answer}.`;
    }

    MathQuest.Combat.addWrong();

    if (
      MathQuest.Combat.state
        .secondChanceCharges > 0
    ) {
      MathQuest.Combat.state
        .secondChanceCharges--;

      $("feedback").textContent +=
        " 🍀 Second Chance! The enemy does not attack.";

      $("battleMessage").textContent =
        "SECOND CHANCE!";

      updateHud();

      setTimeout(
        newProblem,
        650
      );

      return;
    }

    enemyTurn().then(survived => {
      if (!survived) return;
      $("battleMessage").textContent = "YOUR TURN";
      setTimeout(newProblem, 550);
    });
  }

  function init() {
    MathQuest.BlockWorkspace.init();

    MathQuest.Combat.beginGame();

    const saved =
      loadSave();

    if (
      saved &&
      saved.hero &&
      progress.hasStarted
    ) {
      MathQuest.Combat.applySavedState({
        ...saved.hero,
        worldIndex:
          progress.resumeWorldIndex,
        battleIndex:
          progress.resumeBattleIndex
      });
    }

    updateBattleIdentity();
    updateHud();
    renderAdventureHome();

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
    $("equationPlus1").addEventListener(
      "click",
      () => setEquationOperator(0, "+")
    );

    $("equationMinus1").addEventListener(
      "click",
      () => setEquationOperator(0, "-")
    );

    $("equationPlus2").addEventListener(
      "click",
      () => setEquationOperator(1, "+")
    );

    $("equationMinus2").addEventListener(
      "click",
      () => setEquationOperator(1, "-")
    );

    $("equationClear").addEventListener(
      "click",
      clearEquationBuilder
    );

    $("equationResult").addEventListener(
      "input",
      syncEquationResult
    );

$("answerForm")
      .addEventListener(
        "submit",
        submitAnswer
      );

    document
      .querySelectorAll("[data-buy-item]")
      .forEach(button => {
        button.addEventListener(
          "click",
          () =>
            buyMerchantItem(
              button.dataset.buyItem
            )
        );
      });

    $("leaveMerchantBtn")
      .addEventListener(
        "click",
        leaveMerchant
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

    $("powerTutorialTryBtn")
      .addEventListener(
        "click",
        () => closePowerTutorial(true)
      );

    $("powerTutorialSkipBtn")
      .addEventListener(
        "click",
        () => closePowerTutorial(false)
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

          saveGame(0, 0);

          startAdventureAt(
            0,
            0
          );
        }
      );

    $("adventureMapBtn").addEventListener(
      "click",
      openAdventureHome
    );

    $("continueAdventureBtn").addEventListener(
      "click",
      continueAdventure
    );

    $("startAdventureBtn").addEventListener(
      "click",
      newAdventure
    );

    $("worldSelectBtn").addEventListener("click", openWorldSelect);
    $("closeWorldSelectBtn").addEventListener("click", closeWorldSelect);
    renderWorldSelect();

    newProblem();
  }

  init();
})();
