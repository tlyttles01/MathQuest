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
    powerTutorialSeen: false,
    skipLearningDemos: false,
    worldDemosSeen: []
  };
const skillInfo = {
    slash:{label:"⚔️ BASIC SKILL",effect:"Roll dice after solving"},
    power:{label:"💥 POWER SKILL",effect:"Harder question · stronger dice rule"},
    guard:{label:"🛡️ DEFENSE",effect:"Roll dice for defense"},
    shieldBash:{label:"✨ TACTIC",effect:"Use your class tactic"}
  };

  let pendingDice = null;


  const formatNumber = value =>
    Number.isInteger(value)
      ? String(value)
      : value.toFixed(1);


  function currentHero() {
    return MathQuest.Combat.currentHero();
  }

  function selectHero(heroId) {
    const hero =
      MathQuest.Combat.setHero(heroId);

    document.body.dataset.hero =
      hero.id;

    document
      .querySelectorAll(".hero-choice")
      .forEach(button => {
        const selected =
          button.dataset.heroId === hero.id;

        button.classList.toggle(
          "selected",
          selected
        );

        const badge =
          button.querySelector(
            ".hero-slot-badge"
          );

        if (selected && !badge) {
          const newBadge =
            document.createElement("span");
          newBadge.className =
            "hero-slot-badge";
          newBadge.textContent =
            "SELECTED";
          button.prepend(newBadge);
        }
        else if (!selected && badge) {
          badge.remove();
        }
      });

    $("heroTipIcon").textContent =
      hero.emoji;

    $("heroTipEyebrow").textContent =
      `WHAT MAKES THE ${hero.name.toUpperCase()} DIFFERENT?`;

    $("heroTipIdentity").textContent =
      hero.identity;

    $("heroTipDescription").textContent =
      hero.description;

    $("heroTipDice").textContent =
      `🎲 ${hero.diceLabel}`;

    $("heroTipResource").textContent =
      `${hero.resourceIcon} ${hero.resourceName} powers rerolls`;

    $("heroTipPower").textContent =
      `💥 Power skill costs 2 ${hero.resourceName}`;

    updateHud();
    updateSkillAvailability();

    if (progress.hasStarted) {
      saveGame(
        MathQuest.Combat.state.worldIndex,
        MathQuest.Combat.state.battleIndex
      );
    }

    return hero;
  }

  function rollDie(sides) {
    return (
      Math.floor(
        Math.random() * sides
      ) + 1
    );
  }

  function createDiceForHero(heroId) {
    if (heroId === "mage") {
      return Array.from(
        {length:4},
        () => ({
          value:rollDie(4),
          sides:4,
          selected:false
        })
      );
    }

    if (heroId === "cleric") {
      return Array.from(
        {length:3},
        (_, index) => ({
          value:rollDie(4),
          sides:4,
          selected:false,
          assignment:[
            "attack",
            "heal",
            "shield"
          ][index]
        })
      );
    }

    if (heroId === "rogue") {
      return Array.from(
        {length:2},
        () => ({
          value:rollDie(6),
          sides:6,
          selected:false
        })
      );
    }

    return Array.from(
      {length:3},
      () => ({
        value:rollDie(6),
        sides:6,
        selected:false
      })
    );
  }

  function selectedDice() {
    if (!pendingDice) {
      return [];
    }

    return pendingDice.dice
      .map((die,index) => ({
        ...die,
        index
      }))
      .filter(die => die.selected);
  }

  function dieFaceMarkup(value, sides) {
    const pipMap = {
      1:[5],
      2:[1,9],
      3:[1,5,9],
      4:[1,3,7,9],
      5:[1,3,5,7,9],
      6:[1,3,4,6,7,9]
    };

    const active =
      new Set(
        pipMap[
          Math.max(
            1,
            Math.min(6, value)
          )
        ] || [5]
      );

    return `
      <span class="die-face die-face-d${sides}" aria-hidden="true">
        ${Array.from({length:9}, (_,i) =>
          `<span class="die-pip slot-${i+1}${active.has(i+1) ? " on" : ""}"></span>`
        ).join("")}
      </span>
      <span class="die-sr">${value} on a d${sides}</span>
    `;
  }

  function renderDicePanel() {
    if (!pendingDice) {
      return;
    }

    const hero =
      currentHero();

    $("diceTitle").textContent =
      `${hero.name} · ${
        hero.skills[selectedSkill].name
      }`;

    $("diceInstruction").textContent =
      getDiceInstruction(
        hero.id,
        selectedSkill
      );

    const state =
      MathQuest.Combat.state;

    const battle =
      MathQuest.Combat.currentBattle();

    const intent =
      MathQuest.Combat.currentIntent();

    $("diceHeroName").textContent =
      hero.name;

    $("diceHeroHp").textContent =
      state.heroHp;

    $("diceHeroMaxHp").textContent =
      state.heroMaxHp;

    $("diceHeroHpBar").style.width =
      `${Math.max(0, Math.min(100, (state.heroHp / state.heroMaxHp) * 100))}%`;

    $("diceEnemyName").textContent =
      battle.enemyName;

    $("diceEnemyHp").textContent =
      state.enemyHp;

    $("diceEnemyMaxHp").textContent =
      state.enemyMaxHp;

    $("diceEnemyHpBar").style.width =
      `${Math.max(0, Math.min(100, (state.enemyHp / state.enemyMaxHp) * 100))}%`;

    $("diceIncomingDamage").textContent =
      `${intent.damage} DAMAGE`;

    $("diceIncomingName").textContent =
      intent.name;

    $("diceIncomingCard").classList.toggle(
      "danger",
      Boolean(intent.dangerous)
    );

    const tray =
      $("diceTray");

    tray.innerHTML = "";

    tray.className =
      `dice-tray dice-tray-${hero.id}`;

    const primaryPanel =
      document.createElement("section");

    primaryPanel.className =
      "dice-zone dice-zone-primary";

    const primaryHeading =
      document.createElement("div");

    primaryHeading.className =
      "dice-zone-heading";

    const primaryTitle =
      document.createElement("strong");

    const primaryNote =
      document.createElement("small");

    if (hero.id === "knight") {
      primaryTitle.textContent =
        selectedSkill === "guard"
          ? "🛡️ GUARD DICE"
          : selectedSkill === "power"
            ? "💥 POWER STRIKE DICE"
            : "⚔️ ATTACK DICE";

      primaryNote.textContent =
        selectedSkill === "guard"
          ? "Choose one d6 for dedicated block."
          : selectedSkill === "power"
            ? "Choose two d6. The Knight lowers the shield to swing harder."
            : "Choose the d6 that powers your attack.";
    }
    else if (hero.id === "mage") {
      primaryTitle.textContent =
        "🔮 ARCANE DICE";

      primaryNote.textContent =
        "Choose two dice to build the spell.";
    }
    else if (hero.id === "rogue") {
      primaryTitle.textContent =
        "🗡️ SAFE ROLL";

      primaryNote.textContent =
        "Your first two dice are safe. Extra dice are the risk.";
    }
    else {
      primaryTitle.textContent =
        "✨ BLESSING DICE";

      primaryNote.textContent =
        "Tap each die to choose where its power goes.";
    }

    primaryHeading.append(
      primaryTitle,
      primaryNote
    );

    primaryPanel.appendChild(
      primaryHeading
    );

    const primaryDice =
      document.createElement("div");

    primaryDice.className =
      "dice-zone-dice";

    pendingDice.dice.forEach(
      (die,index) => {
        const button =
          document.createElement(
            "button"
          );

        button.type = "button";

        const rogueRisk =
          hero.id === "rogue" &&
          die.pushed;

        button.className =
          `game-die ${
            die.selected
              ? "selected"
              : ""
          } ${
            die.assignment
              ? `assigned-${die.assignment}`
              : ""
          } ${
            rogueRisk
              ? "risk-die"
              : ""
          }`;

        button.innerHTML =
          `
          ${
            rogueRisk
              ? '<span class="die-risk-label">PUSH</span>'
              : ""
          }
          ${dieFaceMarkup(
            die.value,
            die.sides
          )}
          <span class="die-type">d${die.sides}</span>
          ${
            die.assignment
              ? `<small>${die.assignment.toUpperCase()}</small>`
              : ""
          }
          `;

        button.addEventListener(
          "click",
          () => handleDieClick(index)
        );

        primaryDice.appendChild(
          button
        );
      }
    );

    primaryPanel.appendChild(
      primaryDice
    );

    tray.appendChild(
      primaryPanel
    );

    const secondaryPanel =
      document.createElement("section");

    secondaryPanel.className =
      "dice-zone dice-zone-secondary";

    if (hero.id === "knight") {
      const heading =
        document.createElement("div");

      heading.className =
        "dice-zone-heading";

      heading.innerHTML =
        `
        <strong>🛡️ SHIELD DIE</strong>
        <small>Armor is automatic on normal attacks.</small>
        `;

      secondaryPanel.appendChild(
        heading
      );

      if (selectedSkill === "power") {
        secondaryPanel.innerHTML +=
          `
          <div class="class-mechanic-card shield-lowered">
            <div class="mechanic-icon">⚔️</div>
            <strong>SHIELD LOWERED</strong>
            <span>Power Strike gives up the d3 Shield Die for a stronger two-die attack.</span>
          </div>
          `;
      }
      else if (selectedSkill === "guard") {
        secondaryPanel.innerHTML +=
          `
          <div class="class-mechanic-card">
            <div class="mechanic-icon">🛡️</div>
            <strong>FULL GUARD</strong>
            <span>Guard uses your chosen d6 instead of the smaller Shield Die.</span>
          </div>
          `;
      }
      else {
        secondaryPanel.innerHTML +=
          `
          <div class="shield-die-window">
            ${dieFaceMarkup(
              pendingDice.shieldDie,
              3
            )}
            <div>
              <strong>${pendingDice.shieldDie} BLOCK</strong>
              <span>d3 · automatic this round</span>
            </div>
          </div>
          `;
      }
    }
    else if (hero.id === "mage") {
      secondaryPanel.innerHTML =
        `
        <div class="dice-zone-heading">
          <strong>📜 SPELL FORMULA</strong>
          <small>Your selected pair changes meaning with the spell.</small>
        </div>
        <div class="class-mechanic-card mage-formula-card">
          <div class="mechanic-icon">🔮</div>
          <strong id="mageFormulaPreview">Choose two arcane dice</strong>
          <span>Add, multiply, subtract, or split the same pair.</span>
        </div>
        `;
    }
    else if (hero.id === "rogue") {
      const pushedDice =
        pendingDice.dice.filter(
          die => die.pushed
        );

      secondaryPanel.innerHTML =
        `
        <div class="dice-zone-heading">
          <strong>🎲 PUSH YOUR LUCK</strong>
          <small>Every extra die is optional. A pushed 1 busts the action.</small>
        </div>
        <div class="class-mechanic-card rogue-risk-card ${
          pendingDice.busted
            ? "busted"
            : ""
        }">
          <div class="mechanic-icon">${
            pendingDice.busted
              ? "💥"
              : "🎯"
          }</div>
          <strong>${
            pendingDice.busted
              ? "BUST!"
              : `${pushedDice.length} RISK DICE ADDED`
          }</strong>
          <span>${
            pendingDice.busted
              ? "The enemy gets the turn."
              : "Hold now, or add another d6."
          }</span>
        </div>
        `;
    }
    else {
      const totals =
        {attack:0,heal:0,shield:0};

      pendingDice.dice.forEach(
        die => {
          totals[die.assignment] +=
            die.value;
        }
      );

      secondaryPanel.innerHTML =
        `
        <div class="dice-zone-heading">
          <strong>⚖️ ALLOCATION</strong>
          <small>Every die has a job before the turn resolves.</small>
        </div>
        <div class="cleric-allocation-grid">
          <div><span>⚔️</span><strong>${totals.attack}</strong><small>Attack</small></div>
          <div><span>❤️</span><strong>${totals.heal}</strong><small>Heal</small></div>
          <div><span>🛡️</span><strong>${totals.shield}</strong><small>Shield</small></div>
        </div>
        `;
    }

    tray.appendChild(
      secondaryPanel
    );

    $("dicePushBtn")
      .classList.toggle(
        "hidden",
        hero.id !== "rogue"
      );

    $("diceRerollBtn")
      .classList.toggle(
        "hidden",
        hero.id === "rogue" ||
        hero.id === "cleric"
      );

    $("clericAssignmentHelp")
      .classList.toggle(
        "hidden",
        hero.id !== "cleric"
      );

    const selected =
      selectedDice();

    $("diceRerollBtn").disabled =
      selected.length !== 1 ||
      MathQuest.Combat.state.focus < 1;

    $("dicePushBtn").disabled =
      pendingDice.busted ||
      pendingDice.dice.length >= 4;

    $("diceResolveBtn").disabled =
      !canResolveDice(
        hero.id,
        selectedSkill
      );

    $("diceResolveBtn").textContent =
      hero.id === "rogue" &&
      !pendingDice.busted
        ? "Hold & Resolve"
        : pendingDice.busted
          ? "Bust — Enemy Turn"
          : "Resolve Action";

    $("diceMath").textContent =
      describeDiceOutcome(
        hero.id,
        selectedSkill
      );

    $("diceMessage").textContent =
      pendingDice.message || "";

    if (hero.id === "mage") {
      const preview =
        document.getElementById(
          "mageFormulaPreview"
        );

      if (preview) {
        preview.textContent =
          $("diceMath").textContent ||
          "Choose two arcane dice";
      }
    }
  }

  function getDiceInstruction(heroId, skill) {
    if (heroId === "knight") {
      return skill === "power"
        ? "Choose TWO dice. Add them for Power Strike damage."
        : skill === "guard"
          ? "Choose ONE die. Its value becomes your block."
          : skill === "shieldBash"
            ? "Choose ONE die. Block its value and deal half as damage."
            : "Choose ONE die. Its value becomes Sword Slash damage.";
    }

    if (heroId === "mage") {
      return skill === "power"
        ? "Choose TWO dice. Multiply them for Fireball damage."
        : skill === "guard"
          ? "Choose TWO dice. Their difference + 2 becomes Barrier block."
          : skill === "shieldBash"
            ? "Choose TWO dice. High die blocks; low die deals damage."
            : "Choose TWO dice. Add them for Arcane Bolt damage.";
    }

    if (heroId === "rogue") {
      return "You can HOLD now, or Push Your Luck for another d6. Rolling a 1 on a pushed die busts the action.";
    }

    return "Assign every die to Attack, Heal, or Shield. Tap a die to cycle its assignment.";
  }

  function handleDieClick(index) {
    if (!pendingDice) {
      return;
    }

    const hero =
      currentHero();

    if (hero.id === "cleric") {
      const order =
        ["attack","heal","shield"];

      const die =
        pendingDice.dice[index];

      const current =
        order.indexOf(
          die.assignment
        );

      die.assignment =
        order[
          (current + 1) %
          order.length
        ];

      renderDicePanel();
      return;
    }

    if (hero.id === "rogue") {
      return;
    }

    const die =
      pendingDice.dice[index];

    const limit =
      selectedSkill === "power" ||
      hero.id === "mage"
        ? 2
        : 1;

    if (!die.selected) {
      const selected =
        selectedDice();

      if (selected.length >= limit) {
        pendingDice.dice.forEach(
          item => {
            item.selected = false;
          }
        );
      }
    }

    die.selected =
      !die.selected;

    renderDicePanel();
  }

  function canResolveDice(heroId, skill) {
    if (!pendingDice) {
      return false;
    }

    if (pendingDice.busted) {
      return true;
    }

    if (heroId === "rogue") {
      return true;
    }

    if (heroId === "cleric") {
      return pendingDice.dice.every(
        die => Boolean(die.assignment)
      );
    }

    const count =
      selectedDice().length;

    if (heroId === "mage") {
      return count === 2;
    }

    return skill === "power"
      ? count === 2
      : count === 1;
  }

  function describeDiceOutcome(heroId, skill) {
    if (!pendingDice) {
      return "";
    }

    if (pendingDice.busted) {
      return "💥 BUST! The pushed die was a 1.";
    }

    const picked =
      selectedDice().map(
        die => die.value
      );

    if (heroId === "knight") {
      const passiveBlock =
        pendingDice.shieldDie || 0;

      if (
        skill === "power" &&
        picked.length === 2
      ) {
        return `${picked[0]} + ${picked[1]} = ${picked[0] + picked[1]} damage · Shield Die sacrificed`;
      }

      if (picked.length === 1) {
        if (skill === "guard") {
          return `${picked[0]} block`;
        }

        if (skill === "shieldBash") {
          return `${Math.ceil(picked[0] / 2)} damage + ${picked[0] + passiveBlock} total block (${picked[0]} bash + ${passiveBlock} shield die)`;
        }

        return `${picked[0]} damage${
          MathQuest.Combat.state.counterReady
            ? " + 2 Counter"
            : ""
        } · 🛡️ ${passiveBlock} auto-block`;
      }
    }

    if (
      heroId === "mage" &&
      picked.length === 2
    ) {
      const high =
        Math.max(...picked);
      const low =
        Math.min(...picked);

      if (skill === "power") {
        return `${picked[0]} × ${picked[1]} = ${picked[0] * picked[1]} damage`;
      }

      if (skill === "guard") {
        return `${high} − ${low} + 2 = ${high - low + 2} block`;
      }

      if (skill === "shieldBash") {
        return `${low} damage + ${high} block`;
      }

      return `${picked[0]} + ${picked[1]} = ${picked[0] + picked[1]} damage`;
    }

    if (heroId === "rogue") {
      const total =
        pendingDice.dice.reduce(
          (sum,die) =>
            sum + die.value,
          0
        );

      return `${pendingDice.dice.map(d => d.value).join(" + ")} = ${total}${
        skill === "power"
          ? " (+3 Backstab)"
          : ""
      }`;
    }

    if (heroId === "cleric") {
      const totals =
        {attack:0,heal:0,shield:0};

      pendingDice.dice.forEach(
        die => {
          totals[die.assignment] +=
            die.value;
        }
      );

      return `⚔️ ${totals.attack}   ❤️ ${totals.heal}   🛡️ ${totals.shield}`;
    }

    return "Choose your dice.";
  }

  function rerollSelectedDie() {
    if (
      !pendingDice ||
      MathQuest.Combat.state.focus < 1
    ) {
      return;
    }

    const selected =
      selectedDice();

    if (selected.length !== 1) {
      pendingDice.message =
        "Select exactly one die to reroll.";
      renderDicePanel();
      return;
    }

    MathQuest.Combat.spendFocus(1);

    const die =
      pendingDice.dice[
        selected[0].index
      ];

    die.value =
      rollDie(die.sides);

    die.selected =
      false;

    pendingDice.message =
      "Rerolled! Choose your dice again.";

    updateHud();
    renderDicePanel();
  }

  function roguePush() {
    if (
      !pendingDice ||
      currentHero().id !== "rogue" ||
      pendingDice.dice.length >= 4 ||
      pendingDice.busted
    ) {
      return;
    }

    const value =
      rollDie(6);

    pendingDice.dice.push({
      value,
      sides:6,
      selected:false,
      pushed:true
    });

    if (value === 1) {
      pendingDice.busted =
        true;

      pendingDice.message =
        "You pushed too far and rolled a 1!";
    }
    else {
      pendingDice.message =
        `You pushed and rolled ${value}. Hold or risk another die.`;
    }

    renderDicePanel();
  }

  function introDie(value, sides, extraClass = "") {
    const pipMap = {
      1:[5],
      2:[1,9],
      3:[1,5,9],
      4:[1,3,7,9],
      5:[1,3,5,7,9],
      6:[1,3,4,6,7,9]
    };

    const active =
      new Set(
        pipMap[value] || [5]
      );

    return `
      <span class="intro-die ${extraClass}" aria-label="d${sides} showing ${value}">
        ${Array.from({length:9}, (_,i) =>
          `<span class="intro-pip ${active.has(i+1) ? "on" : ""}"></span>`
        ).join("")}
        <small>d${sides}</small>
      </span>
    `;
  }

  function renderClassIntro() {
    const hero = currentHero();

    $("storyHeroName").textContent =
      hero.name;

    $("storyIntroTitle").textContent =
      `${hero.name}'s Journey`;

    $("classIntroTitle").textContent =
      hero.name.toUpperCase();

    $("classIntroTagline").textContent =
      hero.identity;

    $("classIntroHeroArt").src =
      hero.image.includes("?")
        ? hero.image
        : `${hero.image}?v=57`;

    $("classIntroHeroArt").alt =
      hero.name;

    const visual =
      $("classIntroVisual");

    if (hero.id === "knight") {
      visual.innerHTML = `
        <section class="class-intro-card intro-attack-card">
          <div class="class-intro-card-title">⚔️ ATTACK DICE</div>
          <div class="intro-dice-row">
            ${introDie(2,6)}
            ${introDie(4,6)}
            ${introDie(6,6)}
          </div>
          <strong>PICK 1 d6</strong>
          <span>That number = your damage.</span>
        </section>

        <section class="class-intro-card intro-shield-card featured">
          <div class="class-intro-card-title">🛡️ SHIELD DIE</div>
          <div class="intro-shield-demo">
            ${introDie(2,3,"shield-intro-die")}
            <b>=</b>
            <div><strong>2 BLOCK</strong><span>Automatic on normal attacks!</span></div>
          </div>
          <span class="intro-kid-callout">Your shield helps EVERY normal attack.</span>
        </section>

        <section class="class-intro-card intro-power-card">
          <div class="class-intro-card-title">💥 POWER STRIKE</div>
          <div class="intro-dice-row compact">
            ${introDie(5,6)}
            <b>+</b>
            ${introDie(6,6)}
          </div>
          <strong>BIG DAMAGE</strong>
          <span class="intro-danger-note">🚫 No Shield Die this turn.</span>
        </section>
      `;
    }
    else if (hero.id === "mage") {
      visual.innerHTML = `
        <section class="class-intro-card intro-mage-card">
          <div class="class-intro-card-title">🔮 ARCANE DICE</div>
          <div class="intro-dice-row">
            ${introDie(1,4)}
            ${introDie(2,4)}
            ${introDie(3,4)}
            ${introDie(4,4)}
          </div>
          <strong>ROLL 4 d4</strong>
          <span>Then pick 2 dice.</span>
        </section>

        <section class="class-intro-card featured intro-formula-card">
          <div class="class-intro-card-title">✨ YOUR SPELL CHANGES THE RULE</div>
          <div class="intro-formula-list">
            <div><span>✨ Bolt</span><b>3 + 4 = 7</b></div>
            <div><span>🔥 Fireball</span><b>3 × 4 = 12</b></div>
            <div><span>❄️ Barrier</span><b>4 − 3 + 2 = 3</b></div>
          </div>
          <span class="intro-kid-callout">Same dice. Different magic!</span>
        </section>
      `;
    }
    else if (hero.id === "rogue") {
      visual.innerHTML = `
        <section class="class-intro-card intro-safe-card">
          <div class="class-intro-card-title">🗡️ SAFE ROLL</div>
          <div class="intro-dice-row">
            ${introDie(4,6)}
            ${introDie(5,6)}
          </div>
          <strong>START WITH 2 d6</strong>
          <span>You can stop here and attack.</span>
        </section>

        <section class="class-intro-card featured intro-risk-card">
          <div class="class-intro-card-title">🎲 PUSH YOUR LUCK</div>
          <div class="intro-dice-row compact">
            ${introDie(4,6)}
            ${introDie(5,6)}
            ${introDie(3,6,"risk-intro-die")}
          </div>
          <strong>ADD ANOTHER d6</strong>
          <span>More dice = bigger move.</span>
        </section>

        <section class="class-intro-card intro-bust-card">
          <div class="class-intro-card-title">💥 BUT WATCH OUT!</div>
          <div class="intro-dice-row compact">
            ${introDie(1,6,"bust-intro-die")}
          </div>
          <strong>ROLL A 1 WHILE PUSHING?</strong>
          <span class="intro-danger-note">BUST! The enemy gets the turn.</span>
        </section>
      `;
    }
    else {
      visual.innerHTML = `
        <section class="class-intro-card intro-cleric-card">
          <div class="class-intro-card-title">✨ BLESSING DICE</div>
          <div class="intro-dice-row">
            ${introDie(2,4)}
            ${introDie(3,4)}
            ${introDie(4,4)}
          </div>
          <strong>ROLL 3 d4</strong>
          <span>Every die gets a job.</span>
        </section>

        <section class="class-intro-card featured intro-assign-card">
          <div class="class-intro-card-title">👆 TAP EACH DIE</div>
          <div class="intro-assignment-row">
            <div>${introDie(2,4)}<b>⚔️ ATTACK</b></div>
            <div>${introDie(3,4)}<b>❤️ HEAL</b></div>
            <div>${introDie(4,4)}<b>🛡️ SHIELD</b></div>
          </div>
          <span class="intro-kid-callout">You choose where the power goes.</span>
        </section>

        <section class="class-intro-card intro-together-card">
          <div class="class-intro-card-title">🌟 ALL AT ONCE</div>
          <div class="intro-cleric-result">⚔️ 2 &nbsp; ❤️ 3 &nbsp; 🛡️ 4</div>
          <strong>ATTACK + HEAL + BLOCK</strong>
          <span>One turn can do all three.</span>
        </section>
      `;
    }
  }


  function demoTen(label = "10") {
    return `
      <span class="world-demo-ten" aria-label="ten block">
        ${Array.from({length:10}, () => "<i></i>").join("")}
        <b>${label}</b>
      </span>
    `;
  }

  function demoOne(crossed = false) {
    return `
      <span class="world-demo-one ${crossed ? "crossed" : ""}" aria-label="one block">1</span>
    `;
  }

  function demoCoin(image, name, extraClass = "") {
    return `
      <span class="world-demo-coin ${extraClass}">
        <img src="coinImages/${image}?v=57" alt="${name}">
        <small>${name}</small>
      </span>
    `;
  }

  function renderWorldDemo(worldIndex) {
    const world =
      MathQuest.Combat.worlds[worldIndex];

    $("worldDemoName").textContent =
      world.name.toUpperCase();

    const visual =
      $("worldDemoVisual");

    if (world.id === "woods") {
      $("worldDemoTitle").textContent =
        "BUILD IT. CROSS IT OUT.";

      $("worldDemoSubtitle").textContent =
        "Blocks turn the numbers into something you can see.";

      visual.innerHTML = `
        <section class="world-demo-step">
          <span class="world-demo-step-number">1</span>
          <strong>BUILD 14</strong>
          <div class="world-demo-block-row">
            ${demoTen()}
            ${demoOne()}${demoOne()}${demoOne()}${demoOne()}
          </div>
          <small>1 ten + 4 ones</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step featured">
          <span class="world-demo-step-number">2</span>
          <strong>14 − 3</strong>
          <div class="world-demo-block-row">
            ${demoTen()}
            ${demoOne(true)}${demoOne(true)}${demoOne(true)}${demoOne()}
          </div>
          <small>Tap 3 ones to cross them out.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step result">
          <span class="world-demo-step-number">3</span>
          <strong>11 LEFT</strong>
          <div class="world-demo-answer">14 − 3 = 11</div>
          <small>The blocks help you check your thinking.</small>
        </section>
      `;
    }
    else if (world.id === "mines") {
      $("worldDemoTitle").textContent =
        "BREAK A TEN WHEN YOU NEED ONES.";

      $("worldDemoSubtitle").textContent =
        "Regrouping is just trading 1 ten for 10 ones.";

      visual.innerHTML = `
        <section class="world-demo-step">
          <span class="world-demo-step-number">1</span>
          <strong>32 − 7</strong>
          <div class="world-demo-block-row compact-blocks">
            ${demoTen()}${demoTen()}${demoTen()}
            ${demoOne()}${demoOne()}
          </div>
          <small>Only 2 ones — not enough to take away 7.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step featured">
          <span class="world-demo-step-number">2</span>
          <strong>BREAK 1 TEN</strong>
          <div class="world-demo-trade">
            ${demoTen("10")}
            <b>→</b>
            <span class="world-demo-ten-ones">10 ONES</span>
          </div>
          <small>Now you have 2 tens and 12 ones.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step result">
          <span class="world-demo-step-number">3</span>
          <strong>TAKE AWAY 7</strong>
          <div class="world-demo-answer">32 − 7 = 25</div>
          <small>Breaking a ten makes the subtraction possible.</small>
        </section>
      `;
    }
    else if (world.id === "library") {
      $("worldDemoTitle").textContent =
        "TURN THE STORY INTO MATH.";

      $("worldDemoSubtitle").textContent =
        "Find the numbers, choose the sign, then solve.";

      visual.innerHTML = `
        <section class="world-demo-step story-demo-card">
          <span class="world-demo-step-number">1</span>
          <strong>READ THE STORY</strong>
          <div class="world-demo-story">
            Maya has <b>8</b> books.<br>
            She finds <b>5 more</b>.
          </div>
          <small>“More” is a clue that the amount grows.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step featured">
          <span class="world-demo-step-number">2</span>
          <strong>BUILD IT</strong>
          <div class="world-demo-equation-builder">
            <span>8</span><b>+</b><span>5</span><b>=</b><span>?</span>
          </div>
          <small>Put the story's numbers into the math sentence.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step result">
          <span class="world-demo-step-number">3</span>
          <strong>SOLVE</strong>
          <div class="world-demo-answer">8 + 5 = 13</div>
          <small>The equation should match what happened in the story.</small>
        </section>
      `;
    }
    else if (world.id === "vault") {
      $("worldDemoTitle").textContent =
        "MOVE THE COINS — DON'T GUESS THE TOTAL.";

      $("worldDemoSubtitle").textContent =
        "Look at each coin, then move only the amount the problem asks for.";

      visual.innerHTML = `
        <section class="world-demo-step coin-demo-wide">
          <span class="world-demo-step-number">1</span>
          <strong>YOU HAVE 35¢</strong>
          <div class="world-demo-coin-tray">
            ${demoCoin("quarter.png","Quarter")}
            ${demoCoin("dime.png","Dime")}
          </div>
          <small>Recognize the coins by their pictures.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step featured coin-demo-wide">
          <span class="world-demo-step-number">2</span>
          <strong>GIVE AWAY 10¢</strong>
          <div class="world-demo-coin-move">
            <div><span>YOUR TRAY</span>${demoCoin("quarter.png","Quarter")}</div>
            <b>→</b>
            <div><span>FRIEND</span>${demoCoin("dime.png","Dime","moved")}</div>
          </div>
          <small>Tap a coin to move it. Tap again to put it back.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step result">
          <span class="world-demo-step-number">3</span>
          <strong>25¢ LEFT</strong>
          <div class="world-demo-answer">35¢ − 10¢ = 25¢</div>
          <small>No running total is shown — you do the coin thinking.</small>
        </section>
      `;
    }
    else {
      $("worldDemoTitle").textContent =
        "READ THE CLOCK FIRST.";

      $("worldDemoSubtitle").textContent =
        "The short hand tells the hour. The long hand tells the minutes.";

      visual.innerHTML = `
        <section class="world-demo-step clock-demo-wide">
          <span class="world-demo-step-number">1</span>
          <strong>LOOK AT THE HANDS</strong>
          <div class="world-demo-clock" aria-label="clock showing 3:30">
            <span class="demo-clock-mark mark-12">12</span>
            <span class="demo-clock-mark mark-3">3</span>
            <span class="demo-clock-mark mark-6">6</span>
            <span class="demo-clock-mark mark-9">9</span>
            <i class="demo-hour-hand"></i>
            <i class="demo-minute-hand"></i>
            <b></b>
          </div>
          <small>Short hand near 3. Long hand on 6.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step featured">
          <span class="world-demo-step-number">2</span>
          <strong>LONG HAND = MINUTES</strong>
          <div class="world-demo-clock-key"><span>6</span><b>=</b><span>30 minutes</span></div>
          <small>Each big number is 5 minutes.</small>
        </section>

        <div class="world-demo-arrow">→</div>

        <section class="world-demo-step result">
          <span class="world-demo-step-number">3</span>
          <strong>3:30</strong>
          <div class="world-demo-answer">Hour 3 · Minutes 30</div>
          <small>Read the picture before doing any time math.</small>
        </section>
      `;
    }
  }

  function shouldShowWorldDemo(worldIndex) {
    return (
      playMode === "adventure" &&
      !progress.skipLearningDemos &&
      !progress.worldDemosSeen.includes(worldIndex)
    );
  }

  function showWorldDemo(worldIndex) {
    if (!shouldShowWorldDemo(worldIndex)) {
      return false;
    }

    renderWorldDemo(worldIndex);

    $("worldDemoSkipCheckbox").checked = false;

    $("worldDemoPanel")
      .classList.remove("hidden");

    return true;
  }

  function finishWorldDemo() {
    const worldIndex =
      MathQuest.Combat.state.worldIndex;

    if (
      !progress.worldDemosSeen.includes(worldIndex)
    ) {
      progress.worldDemosSeen.push(worldIndex);
    }

    if ($("worldDemoSkipCheckbox").checked) {
      progress.skipLearningDemos = true;
    }

    $("worldDemoPanel")
      .classList.add("hidden");

    saveGame(
      MathQuest.Combat.state.worldIndex,
      MathQuest.Combat.state.battleIndex
    );
  }

  function showClassIntro() {
    renderClassIntro();

    $("skipLearningDemosCheckbox").checked =
      false;

    $("storyIntroPanel")
      .classList.add("hidden");

    $("classIntroPanel")
      .classList.remove("hidden");
  }

  function beginFirstBattleAfterIntro() {
    if ($("skipLearningDemosCheckbox").checked) {
      progress.skipLearningDemos = true;
    }

    $("classIntroPanel")
      .classList.add("hidden");

    saveGame(0, 0);

    startAdventureAt(
      0,
      0
    );
  }

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
      healingPotions: state.healingPotions,
      focusPotions: state.focusPotions,
      counterShields: state.counterShields,
      secondChanceCharms: state.secondChanceCharms,
      counterShieldArmed: state.counterShieldArmed,
      secondChanceArmed: state.secondChanceArmed,
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
        Boolean(raw.powerTutorialSeen),

      skipLearningDemos:
        Boolean(raw.skipLearningDemos),

      worldDemosSeen:
        Array.isArray(raw.worldDemosSeen)
          ? [...new Set(
              raw.worldDemosSeen
                .map(Number)
                .filter(value =>
                  Number.isInteger(value) &&
                  value >= 0 &&
                  value < MathQuest.Combat.worlds.length
                )
            )]
          : []
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

        healingPotions:
          state.healingPotions,

        focusPotions:
          state.focusPotions,

        counterShields:
          state.counterShields,

        secondChanceCharms:
          state.secondChanceCharms,

        counterShieldArmed:
          state.counterShieldArmed,

        secondChanceArmed:
          state.secondChanceArmed,

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

      state.healingPotions =
        runSnapshot.healingPotions || 0;

      state.focusPotions =
        runSnapshot.focusPotions || 0;

      state.counterShields =
        runSnapshot.counterShields || 0;

      state.secondChanceCharms =
        runSnapshot.secondChanceCharms || 0;

      state.counterShieldArmed =
        Boolean(runSnapshot.counterShieldArmed);

      state.secondChanceArmed =
        Boolean(runSnapshot.secondChanceArmed);

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

    if (
      MathQuest.Combat.state.battleIndex === 0
    ) {
      showWorldDemo(safeWorld);
    }

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
        ? "RETURN TO ADVENTURE"
        : "SELECT YOUR HERO";

    $("continueAdventureBtn")
      .textContent =
        playMode === "practice"
          ? "Return to Adventure"
          : hasSave
            ? `CONTINUE: ${
                MathQuest.Combat.worlds[
                  progress.resumeWorldIndex
                ].name.toUpperCase()
              }`
            : "CONTINUE ADVENTURE";

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

    renderClassIntro();

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
      label: "Energy Tonic"
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

    const energyCard =
      document.querySelector(
        '[data-item="focus"]'
      );

    if (energyCard) {
      energyCard.querySelector("p").textContent =
        `Keep it and gain 2 ${currentHero().resourceName} whenever you choose.`;
    }

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

    const state =
      MathQuest.Combat.state;

    const hpBefore =
      state.heroHp;

    state.heroHp =
      Math.min(
        state.heroMaxHp,
        state.heroHp + 10
      );

    const campfireHeal =
      state.heroHp - hpBefore;

    $("merchantMessage").textContent =
      (
        campfireHeal > 0
          ? `🔥 Campfire rest restored ${campfireHeal} HP. `
          : "🔥 You're already at full HP. "
      ) +
      (
        playMode === "practice"
          ? "Practice purchases are temporary and will disappear when you return to Adventure."
          : "Skill Stars reset when you move to the next world."
      );

    saveGame(
      state.worldIndex,
      state.battleIndex
    );

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

    state.skillStars -= item.cost;
    state.purchasedItems[itemId] = true;

    if (itemId === "healing") {
      state.healingPotions++;
      $("merchantMessage").textContent =
        "❤️ Healing Potion added to your items. Use it whenever you need HP.";
    }
    else if (itemId === "focus") {
      state.focusPotions++;
      $("merchantMessage").textContent =
        `⚡ Energy Tonic added to your items. Save it for when you need ${currentHero().resourceName}.`;
    }
    else if (itemId === "counter") {
      state.counterShields++;
      $("merchantMessage").textContent =
        "🛡️ Counter Shield added to your items. Arm it when you want Slash + Guard.";
    }
    else if (itemId === "secondChance") {
      state.secondChanceCharms++;
      $("merchantMessage").textContent =
        "🍀 Second Chance Charm added to your items. Arm it before a risky question.";
    }

    saveGame(state.worldIndex, state.battleIndex);
    renderMerchant();
    renderBattleInventory();
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

  function renderBattleInventory() {
    const state = MathQuest.Combat.state;

    const itemDefs = [
      ["useHealingPotionBtn", "healingPotionCount", state.healingPotions,
        state.healingPotions <= 0 || state.heroHp >= state.heroMaxHp || locked || battleComplete],
      ["useFocusPotionBtn", "focusPotionCount", state.focusPotions,
        state.focusPotions <= 0 || state.focus >= state.maxFocus || locked || battleComplete],
      ["useCounterShieldBtn", "counterShieldCount", state.counterShields,
        state.counterShields <= 0 || locked || battleComplete],
      ["useSecondChanceBtn", "secondChanceCount", state.secondChanceCharms,
        state.secondChanceCharms <= 0 || locked || battleComplete]
    ];

    const hasItems =
      itemDefs.some(item => item[2] > 0) ||
      state.counterShieldArmed ||
      state.secondChanceArmed;

    $("battleInventory").classList.toggle("hidden", !hasItems);

    itemDefs.forEach(([buttonId, countId, quantity, disabled]) => {
      const button = $(buttonId);
      $(countId).textContent = `×${quantity}`;
      button.classList.toggle("hidden", quantity <= 0);
      button.disabled = disabled;
    });

    $("useCounterShieldBtn").classList.toggle("armed", state.counterShieldArmed);
    $("useSecondChanceBtn").classList.toggle("armed", state.secondChanceArmed);

    $("useCounterShieldBtn").querySelector("small").textContent =
      state.counterShieldArmed
        ? "ARMED — next damaging skill also blocks"
        : "Arm it, then use a damaging skill";

    $("useSecondChanceBtn").querySelector("small").textContent =
      state.secondChanceArmed
        ? "ARMED — your next wrong answer is protected"
        : "Arm it before a tough question";

    $("useFocusPotionBtn")
      .querySelector("small")
      .textContent =
        `Gain 2 ${currentHero().resourceName}`;
  }

  function useBattleItem(itemId) {
    if (locked || battleComplete) return;

    const state = MathQuest.Combat.state;

    if (itemId === "healing" && state.healingPotions > 0) {
      if (state.heroHp >= state.heroMaxHp) {
        $("inventoryMessage").textContent = "Your HP is already full.";
        return;
      }

      const before = state.heroHp;
      state.healingPotions--;
      state.heroHp = Math.min(state.heroMaxHp, state.heroHp + 5);
      $("inventoryMessage").textContent =
        `❤️ Healing Potion restored ${state.heroHp - before} HP.`;
    }
    else if (itemId === "focus" && state.focusPotions > 0) {
      if (state.focus >= state.maxFocus) {
        $("inventoryMessage").textContent = `${currentHero().resourceName} is already full.`;
        return;
      }

      const before = state.focus;
      state.focusPotions--;
      state.focus = Math.min(state.maxFocus, state.focus + 2);
      $("inventoryMessage").textContent =
        `⚡ Energy Tonic restored ${state.focus - before} ${currentHero().resourceName}.`;
    }
    else if (
      itemId === "counter" &&
      (state.counterShields > 0 || state.counterShieldArmed)
    ) {
      state.counterShieldArmed = !state.counterShieldArmed;
      $("inventoryMessage").textContent =
        state.counterShieldArmed
          ? "🛡️ Counter Shield armed. It will wait until you land a correct Sword Slash."
          : "🛡️ Counter Shield put away. It was not used.";
    }
    else if (
      itemId === "secondChance" &&
      (state.secondChanceCharms > 0 || state.secondChanceArmed)
    ) {
      state.secondChanceArmed = !state.secondChanceArmed;
      $("inventoryMessage").textContent =
        state.secondChanceArmed
          ? "🍀 Second Chance armed. It will wait until you miss a question."
          : "🍀 Second Chance put away. It was not used.";
    }

    saveGame(state.worldIndex, state.battleIndex);
    updateHud();
    updateSkillAvailability();
  }

  function updateHud() {
    const state = MathQuest.Combat.state;
    const hero = MathQuest.Combat.currentHero();

    document.body.dataset.hero =
      hero.id;

    $("heroName").textContent =
      hero.name;

    const heroWrap =
      $("heroSpriteWrap");

    if (hero.image) {
      $("heroSprite").src =
        hero.image;

      $("heroSprite").alt =
        hero.name;

      $("heroSprite").classList.remove(
        "hidden"
      );

      heroWrap.removeAttribute(
        "data-hero-emoji"
      );
    }
    else {
      $("heroSprite").classList.add(
        "hidden"
      );

      heroWrap.dataset.heroEmoji =
        hero.emoji;
    }

    $("heroResourceIcon").textContent =
      hero.resourceIcon;

    $("heroResourceName").textContent =
      hero.resourceName;

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

    const activeItems = [];

    if (state.counterShieldArmed) {
      activeItems.push("🛡️ Counter Shield ARMED");
    }

    if (state.secondChanceArmed) {
      activeItems.push("🍀 Second Chance ARMED");
    }

    $("itemStatus").textContent =
      activeItems.join(" · ");

    $("itemStatus").classList.toggle(
      "hidden",
      activeItems.length === 0
    );

    renderBattleInventory();

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

    $("counterStatus").textContent =
      hero.id === "knight"
        ? (
            state.counterReady
              ? "⚔️ COUNTER READY — next Sword Slash +2 damage"
              : "Counter not ready"
          )
        : hero.diceLabel;

    $("counterStatus").classList.toggle(
      "ready",
      hero.id === "knight" &&
      state.counterReady
    );

    const tacticCopy = {
      knight:{
        icon:"🛡️",
        title:"Knight Tactic: Counter",
        text:"Fully block a dangerous attack to ready Counter. Your next Sword Slash gets +2 damage."
      },
      mage:{
        icon:"🔮",
        title:"Mage Tactic: Combine",
        text:"Choose two dice. Different spells add, multiply, subtract, or split those same dice."
      },
      rogue:{
        icon:"🎲",
        title:"Rogue Tactic: Push Your Luck",
        text:"Hold a safe roll or push for another d6. A 1 on a pushed die busts the action."
      },
      cleric:{
        icon:"✨",
        title:"Cleric Tactic: Allocate",
        text:"Assign every die to Attack, Heal, or Shield. Your selected skill boosts one part of the allocation."
      }
    }[hero.id];

    $("classTacticsIcon").textContent =
      tacticCopy.icon;

    $("classTacticsTitle").textContent =
      tacticCopy.title;

    $("classTacticsText").textContent =
      tacticCopy.text;

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
        getEffectSummary(
          currentHero().id,
          "guard"
        );
    }

    if (
      battle.guardTutorial &&
      intent.dangerous &&
      !guardTutorialSeen
    ) {
      $("guardTutorialAttackName").textContent =
        intent.name;

      $("guardTutorialDamage").textContent =
        intent.damage;

      const hero =
        currentHero();

      $("guardTutorialTitle").textContent =
        hero.skills.guard.name;

      $("guardTutorialCopy").textContent =
        hero.id === "knight"
          ? "Solve Guard, then choose enough block to stop the hit. Fully blocking a dangerous attack readies Counter."
          : `Solve ${hero.skills.guard.name}, then use your dice to make enough block to stop the hit.`;

      $("tutorialOverlay")
        .classList.remove("hidden");
    }
  }

  function updateSkillAvailability() {
    const state =
      MathQuest.Combat.state;

    const world =
      MathQuest.Combat.currentWorld();

    const hero =
      currentHero();

    const guardUnlocked =
      world.id !== "woods" ||
      state.battleIndex >= 2;

    const powerUnlocked =
      state.powerStrikeUnlocked;

    const hasPowerResource =
      state.focus >= 2;

    const tacticUnlocked =
      state.powerStrikeUnlocked ||
      world.id !== "woods";

    const configs = [
      {
        key:"slash",
        button:
          document.querySelector(
            '[data-skill="slash"]'
          ),
        unlocked:true
      },
      {
        key:"power",
        button:$("powerSkill"),
        unlocked:
          powerUnlocked &&
          hasPowerResource
      },
      {
        key:"guard",
        button:$("guardSkill"),
        unlocked:guardUnlocked
      },
      {
        key:"shieldBash",
        button:$("shieldBashSkill"),
        unlocked:tacticUnlocked
      }
    ];

    configs.forEach(config => {
      const skill =
        hero.skills[config.key];

      config.button.disabled =
        !config.unlocked;

      config.button.classList.toggle(
        "locked",
        !config.unlocked
      );

      config.button
        .querySelector("b")
        .textContent =
          `${skill.icon} ${skill.name}${
            config.unlocked
              ? ""
              : " 🔒"
          }`;

      let detail =
        skill.normal;

      if (
        config.key === "power" &&
        !powerUnlocked
      ) {
        detail =
          "Defeat the Goblin King to unlock";
      }
      else if (
        config.key === "power" &&
        !hasPowerResource
      ) {
        detail =
          `Need 2 ${hero.resourceName} · you have ${state.focus}`;
      }
      else if (
        config.key === "guard" &&
        !guardUnlocked
      ) {
        detail =
          "Unlocks at Battle 3";
      }
      else if (
        config.key === "shieldBash" &&
        !tacticUnlocked
      ) {
        detail =
          "Unlocks after Whispering Woods";
      }

      config.button
        .querySelector("small")
        .textContent =
          detail;
    });

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
        !hasPowerResource
      )
    ) {
      selectedSkill = "slash";
    }

    if (
      selectedSkill === "shieldBash" &&
      !tacticUnlocked
    ) {
      selectedSkill = "slash";
    }
  }

  function updateBattleIdentity() {
    const world =
      MathQuest.Combat.currentWorld();

    const battle =
      MathQuest.Combat.currentBattle();

    const battleStage =
      $("battleStage");

    const worldVisuals = {
      woods:{
        background:"assets/backgrounds/whispering-woods-battle.png",
        foreground:"assets/foregrounds/woods-foreground.png"
      },
      mines:{
        background:"assets/backgrounds/breakstone-mines-battle.png",
        foreground:"assets/foregrounds/mines-foreground.png"
      },
      library:{
        background:"assets/backgrounds/living-library-battle.png",
        foreground:"assets/foregrounds/library-foreground.png"
      },
      vault:{
        background:"assets/backgrounds/vault-battle.png",
        foreground:"assets/foregrounds/vault-foreground.png"
      },
      clocktower:{
        background:"assets/backgrounds/clocktower-battle.png",
        foreground:"assets/foregrounds/clocktower-foreground.png"
      }
    };

    const visual =
      worldVisuals[world.id] ||
      worldVisuals.woods;

    const backgroundUrl =
      new URL(
        `${visual.background}?v=57`,
        document.baseURI
      ).href;

    const foregroundUrl =
      new URL(
        `${visual.foreground}?v=57`,
        document.baseURI
      ).href;

    /*
      Set the actual battle background directly instead of relying only
      on a custom-property URL. This prevents path-resolution/cache
      failures from silently falling back to the dark panel.
    */
    battleStage.style.backgroundImage =
      `linear-gradient(180deg,rgba(3,7,13,.08),rgba(3,7,13,.18)), url("${backgroundUrl}")`;

    battleStage.style.setProperty(
      "--battle-bg",
      `url("${backgroundUrl}")`
    );

    battleStage.style.setProperty(
      "--battle-fg",
      `url("${foregroundUrl}")`
    );

    battleStage.dataset.world =
      world.id;

    document.body.dataset.world =
      world.id;

    $("worldName").textContent =
      playMode === "practice"
        ? `${world.label} · PRACTICE`
        : world.label;

    $("battleSubtitle").textContent =
      `Battle ${MathQuest.Combat.state.battleIndex + 1} of ${world.battles.length}`;

    $("enemyName").textContent =
      battle.enemyName;

    $("enemyRole").textContent =
      `${battle.role || "Fighter"} · ${battle.roleText || ""}`;

    const enemyWrap =
      $("enemySprite").parentElement;

    if (battle.enemyImage) {
      $("enemySprite").src =
        `${battle.enemyImage}?v=57`;
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

      const hero =
        currentHero();

      $("powerTutorialTitle").textContent =
        hero.skills.power.name;

      $("powerTutorialOverlay")
        .querySelector(".eyebrow")
        .textContent =
          `${hero.name.toUpperCase()} POWER SKILL`;

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
        src="coinImages/${safeName}.png?v=57"
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

  function getEffectSummary(heroId, skill) {
    const summaries = {
      knight:{
        slash:"1d6 damage + d3 block",
        power:"2d6 damage · no shield",
        guard:"1d6 block",
        shieldBash:"½ d6 damage + d6+d3 block"
      },
      mage:{
        slash:"Add 2d4 → damage",
        power:"Multiply 2d4 → damage",
        guard:"Difference +2 → block",
        shieldBash:"Low die damage + high die block"
      },
      rogue:{
        slash:"Dice total → damage",
        power:"Dice total +3 → damage",
        guard:"Highest die +2 → block",
        shieldBash:"High die damage + low die block"
      },
      cleric:{
        slash:"Attack total +1",
        power:"Attack total +3",
        guard:"Shield total +2",
        shieldBash:"Heal total +2"
      }
    };

    return (
      summaries[heroId] &&
      summaries[heroId][skill]
    ) || "Roll dice after solving";
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

    const hero =
      currentHero();

    const selectedHeroSkill =
      hero.skills[selectedSkill];

    $("skillName").textContent =
      `${selectedHeroSkill.icon} ${selectedHeroSkill.name.toUpperCase()}`;

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
      getEffectSummary(
        hero.id,
        selectedSkill
      );

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

    $("effectLabel").textContent =
      "Hint used · dice result will be reduced by 25%";
  }

  async function enemyTurn() {
    const attack =
      MathQuest.Combat.enemyAttack();

    if (
      attack.blocked &&
      attack.counterReady
    ) {
      $("battleMessage").textContent =
        "BLOCKED — COUNTER READY!";

      $("feedback").textContent +=
        " ⚔️ Perfect Guard! Your next Sword Slash gets +2 damage.";
    }
    else if (attack.blocked) {
      $("battleMessage").textContent =
        "BLOCKED!";
    }
    else if (attack.reducedBy > 0) {
      $("battleMessage").textContent =
        "BRACED!";

      $("feedback").textContent +=
        ` 🛡️ Shield Bash reduced the hit by ${attack.reducedBy}.`;
    }
    else {
      $("battleMessage").textContent =
        "ENEMY ATTACK";
    }

    await MathQuest.Animations.enemyAttack(
      attack.damage,
      attack.blocked
    );

    updateHud();
    updateIntent();
    updateSkillAvailability();

    if (
      MathQuest.Combat.state.heroHp <= 0
    ) {
      $("battleMessage").textContent =
        "REST TIME";

      $("feedback").textContent +=
        ` ${currentHero().name} needs a rest. Try this battle again!`;

      MathQuest.Combat.state.heroHp =
        MathQuest.Combat.state.heroMaxHp;

      MathQuest.Combat.resetBattle();

      updateHud();
      updateIntent();
      updateSkillAvailability();

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

    if (selectedSkill !== "power") {
      MathQuest.Combat.gainFocus(1);
    }

    const hero =
      currentHero();

    pendingDice = {
      dice:
        createDiceForHero(
          hero.id
        ),
      shieldDie:
        (
          hero.id === "knight" &&
          selectedSkill !== "guard" &&
          selectedSkill !== "power"
        )
          ? rollDie(3)
          : null,
      busted:false,
      message:
        earnedSkillStar
          ? `✅ Correct! +${reward.points} score. 🌟 Skill Star earned!`
          : `✅ Correct! +${reward.points} score. Now use your dice.`
    };

    $("feedback").textContent =
      pendingDice.message;

    updateHud();
    updateSkillAvailability();

    $("dicePanel")
      .classList.remove("hidden");

    renderDicePanel();
  }

  async function resolveDiceAction() {
    if (
      !pendingDice ||
      !canResolveDice(
        currentHero().id,
        selectedSkill
      )
    ) {
      return;
    }

    const hero =
      currentHero();

    const state =
      MathQuest.Combat.state;

    if (pendingDice.busted) {
      $("dicePanel")
        .classList.add("hidden");

      pendingDice = null;

      $("feedback").textContent =
        "💥 Bust! You chose to push your luck, so the enemy gets the turn.";

      if (!await enemyTurn()) {
        return;
      }

      $("battleMessage").textContent =
        "YOUR TURN";

      setTimeout(
        newProblem,
        450
      );

      return;
    }

    if (
      selectedSkill === "power" &&
      !MathQuest.Combat.spendFocus(2)
    ) {
      pendingDice.message =
        `You need 2 ${hero.resourceName}.`;

      renderDicePanel();
      return;
    }

    let damage = 0;
    let block = 0;
    let heal = 0;
    let actionText = "";

    const picked =
      selectedDice().map(
        die => die.value
      );

    if (hero.id === "knight") {
      const shieldDie =
        pendingDice.shieldDie || 0;

      if (selectedSkill === "power") {
        damage =
          picked[0] +
          picked[1];

        actionText =
          `Power Strike: ${picked[0]} + ${picked[1]} = ${damage} damage. Shield lowered — no Shield Die this round.`;
      }
      else if (selectedSkill === "guard") {
        block = picked[0];

        actionText =
          `Guard: ${block} block.`;
      }
      else if (selectedSkill === "shieldBash") {
        block =
          picked[0] +
          shieldDie;

        damage =
          Math.ceil(
            picked[0] / 2
          );

        actionText =
          `Shield Bash: ${damage} damage + ${block} total block (${picked[0]} Bash + ${shieldDie} Shield Die).`;
      }
      else {
        damage =
          picked[0];

        block +=
          shieldDie;

        if (state.counterReady) {
          damage += 2;
          state.counterReady = false;
          actionText =
            `Counter Slash: ${picked[0]} + 2 = ${damage} damage. Shield Die adds ${shieldDie} block.`;
        }
        else {
          actionText =
            `Sword Slash: ${damage} damage. Shield Die adds ${shieldDie} block.`;
        }
      }
    }
    else if (hero.id === "mage") {
      const high =
        Math.max(...picked);
      const low =
        Math.min(...picked);

      if (selectedSkill === "power") {
        damage =
          picked[0] *
          picked[1];

        actionText =
          `Fireball: ${picked[0]} × ${picked[1]} = ${damage} damage.`;
      }
      else if (selectedSkill === "guard") {
        block =
          high - low + 2;

        actionText =
          `Ice Barrier: ${high} − ${low} + 2 = ${block} block.`;
      }
      else if (selectedSkill === "shieldBash") {
        damage = low;
        block = high;

        actionText =
          `Spellweave: ${damage} damage + ${block} block.`;
      }
      else {
        damage =
          picked[0] +
          picked[1];

        actionText =
          `Arcane Bolt: ${picked[0]} + ${picked[1]} = ${damage} damage.`;
      }
    }
    else if (hero.id === "rogue") {
      const values =
        pendingDice.dice.map(
          die => die.value
        );

      const total =
        values.reduce(
          (sum,value) =>
            sum + value,
          0
        );

      const high =
        Math.max(...values);

      const low =
        Math.min(...values);

      if (selectedSkill === "power") {
        damage =
          total + 3;

        actionText =
          `Backstab: ${total} + 3 = ${damage} damage.`;
      }
      else if (selectedSkill === "guard") {
        block =
          high + 2;

        actionText =
          `Dodge: ${high} + 2 = ${block} block.`;
      }
      else if (selectedSkill === "shieldBash") {
        damage = high;
        block = low;

        actionText =
          `Feint: ${damage} damage + ${block} block.`;
      }
      else {
        damage = total;

        actionText =
          `Quick Strike: ${values.join(" + ")} = ${damage} damage.`;
      }
    }
    else if (hero.id === "cleric") {
      const totals =
        {attack:0,heal:0,shield:0};

      pendingDice.dice.forEach(
        die => {
          totals[die.assignment] +=
            die.value;
        }
      );

      damage =
        totals.attack;
      heal =
        totals.heal;
      block =
        totals.shield;

      if (selectedSkill === "power") {
        damage += 3;
      }
      else if (selectedSkill === "guard") {
        block += 2;
      }
      else if (selectedSkill === "shieldBash") {
        heal += 2;
      }
      else {
        damage += 1;
      }

      actionText =
        `Cleric allocation: ⚔️ ${damage} · ❤️ ${heal} · 🛡️ ${block}.`;
    }

    if (hinted) {
      damage =
        Math.floor(
          damage * 0.75
        );

      block =
        Math.floor(
          block * 0.75
        );

      heal =
        Math.floor(
          heal * 0.75
        );

      actionText +=
        " Hint penalty applied.";
    }

    let counterShieldUsed =
      false;

    if (
      damage > 0 &&
      state.counterShieldArmed &&
      state.counterShields > 0
    ) {
      state.counterShields--;
      state.counterShieldArmed =
        false;
      state.guardActive = true;
      counterShieldUsed = true;
    }

    if (damage > 0) {
      MathQuest.Combat.dealDamage(
        damage
      );
    }

    if (block > 0) {
      MathQuest.Combat.addBlock(
        block
      );
    }

    if (heal > 0) {
      const actualHeal =
        MathQuest.Combat.healHero(
          heal
        );

      if (actualHeal !== heal) {
        actionText +=
          ` Restored ${actualHeal} HP.`;
      }
    }

    if (counterShieldUsed) {
      actionText +=
        " Counter Shield will block the enemy attack.";
    }

    $("feedback").textContent =
      `🎲 ${actionText}`;

    $("dicePanel")
      .classList.add("hidden");

    pendingDice = null;

    updateHud();
    updateSkillAvailability();

    saveGame(
      state.worldIndex,
      state.battleIndex
    );

    if (damage > 0) {
      $("battleMessage").textContent =
        hero.skills[selectedSkill]
          .name.toUpperCase();

      await MathQuest.Animations.playerAttack(
        selectedSkill === "power"
          ? "power"
          : "slash",
        damage
      );

      updateHud();

      if (state.enemyHp <= 0) {
        showVictory();
        return;
      }
    }
    else if (block > 0) {
      $("battleMessage").textContent =
        "DEFENSE READY!";

      await MathQuest.Animations.guardUp();
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

    const state =
      MathQuest.Combat.state;

    const hpBefore =
      state.heroHp;

    state.heroHp =
      Math.min(
        state.heroMaxHp,
        state.heroHp + 2
      );

    const recoveredHp =
      state.heroHp - hpBefore;
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
              ${
          recoveredHp > 0
            ? `<span class="reward-pill">❤️ +${recoveredHp} HP</span>`
            : `<span class="reward-pill">❤️ Full HP</span>`
        }
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

    showWorldDemo(
      MathQuest.Combat.state.worldIndex
    );

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
      MathQuest.Combat.state.secondChanceArmed &&
      MathQuest.Combat.state.secondChanceCharms > 0
    ) {
      MathQuest.Combat.state.secondChanceCharms--;
      MathQuest.Combat.state.secondChanceArmed = false;

      $("feedback").textContent +=
        " 🍀 Second Chance! The enemy does not attack.";

      $("battleMessage").textContent =
        "SECOND CHANCE!";

      saveGame(
        MathQuest.Combat.state.worldIndex,
        MathQuest.Combat.state.battleIndex
      );

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

    $("useHealingPotionBtn").addEventListener("click", () => useBattleItem("healing"));
    $("useFocusPotionBtn").addEventListener("click", () => useBattleItem("focus"));
    $("useCounterShieldBtn").addEventListener("click", () => useBattleItem("counter"));
    $("useSecondChanceBtn").addEventListener("click", () => useBattleItem("secondChance"));

    $("diceRerollBtn")
      .addEventListener(
        "click",
        rerollSelectedDie
      );

    $("dicePushBtn")
      .addEventListener(
        "click",
        roguePush
      );

    $("diceResolveBtn")
      .addEventListener(
        "click",
        resolveDiceAction
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
        showClassIntro
      );

    $("classIntroStartBtn")
      .addEventListener(
        "click",
        beginFirstBattleAfterIntro
      );

    $("worldDemoStartBtn")
      .addEventListener(
        "click",
        finishWorldDemo
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

    document
      .querySelectorAll(".hero-choice")
      .forEach(button => {
        button.addEventListener(
          "click",
          () =>
            selectHero(
              button.dataset.heroId
            )
        );
      });

    selectHero(
      MathQuest.Combat.state.heroId
    );

    $("worldSelectBtn").addEventListener("click", openWorldSelect);
    $("closeWorldSelectBtn").addEventListener("click", closeWorldSelect);

    $("campfirePracticeBtn").addEventListener(
      "click",
      () => {
        $("adventureHomePanel").classList.add("hidden");
        openWorldSelect();
      }
    );

    $("campfireMapBtn").addEventListener(
      "click",
      () => {
        $("campfireMapSection").classList.toggle("hidden");
      }
    );

    $("closeCampfireMapBtn").addEventListener(
      "click",
      () => $("campfireMapSection").classList.add("hidden")
    );

    renderWorldSelect();

    newProblem();
  }

  init();
})();
