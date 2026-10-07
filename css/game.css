window.MathQuest = window.MathQuest || {};

(() => {
    const $ = id => document.getElementById(id);

    let selectedSkill = "slash";
    let currentProblem = null;
    let hinted = false;
    let locked = false;
    let battleComplete = false;
    let guardTutorialSeen = false;

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

    function formatNumber(value) {
        return Number.isInteger(value)
            ? String(value)
            : value.toFixed(1);
    }

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

        /*
         * Guard tutorial
         *
         * Do not show it simply because Battle 4 started.
         * Wait until the Brute is actually preparing
         * its first dangerous attack.
         */
        if (
            battle.guardTutorial &&
            intent.dangerous &&
            !guardTutorialSeen
        ) {
            $("tutorialOverlay")
                .classList.remove("hidden");
        }
    }

    function updateBattleIdentity() {
        const battle =
            MathQuest.Combat.currentBattle();

        $("battleSubtitle").textContent =
            `Battle ${battle.id} of ${MathQuest.Combat.battles.length}`;

        $("enemyName").textContent =
            battle.enemyName;

        $("enemySprite").textContent =
            battle.enemySprite;

        $("battleTip").textContent =
            battle.tip;

        updateIntent();

        /*
         * Power Strike unlocks in Battle 3.
         */
        const powerUnlocked =
            battle.id >= 3;

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
                    : "Unlocks in Battle 3";

        /*
         * Guard unlocks in Battle 4.
         */
        const guardUnlocked =
            battle.id >= 4;

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

        /*
         * If a selected skill is not yet available,
         * fall back to Sword Slash.
         */
        if (
            !powerUnlocked &&
            selectedSkill === "power"
        ) {
            selectedSkill = "slash";
        }

        if (
            !guardUnlocked &&
            selectedSkill === "guard"
        ) {
            selectedSkill = "slash";
        }
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

        const battle =
            MathQuest.Combat.currentBattle();

        currentProblem =
            MathQuest.MathEngine.createProblem({
                difficulty:
                    battle.difficulty,

                skill:
                    selectedSkill
            });

        $("skillName").textContent =
            skillInfo[selectedSkill].label;

        $("problem").textContent =
            currentProblem.prompt;

        $("answerInput").value =
            "";

        $("feedback").textContent =
            "";

        $("hintBox")
            .classList.add("hidden");

        if (selectedSkill === "guard") {
            $("effectLabel").textContent =
                `Block ${MathQuest.Combat.currentIntent().damage} damage`;
        }
        else {
            $("effectLabel").textContent =
                skillInfo[selectedSkill].effect;
        }

        MathQuest.BlockWorkspace.clear();

        MathQuest.BlockWorkspace
            .setMode("cross");

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

    async function enemyTurn() {
        const attack =
            MathQuest.Combat.enemyAttack();

        $("battleMessage").textContent =
            attack.blocked
                ? "BLOCKED!"
                : "ENEMY ATTACK";

        await MathQuest.Animations
            .enemyAttack(
                attack.damage,
                attack.blocked
            );

        updateHud();

        /*
         * Enemy turn advances the intent cycle.
         *
         * Calling updateIntent here shows what
         * the enemy plans to do NEXT.
         */
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

        /*
         * Guard
         */
        if (
            effect.kind === "guard"
        ) {
            $("battleMessage").textContent =
                "GUARD!";

            await MathQuest.Animations
                .guardUp();
        }

        /*
         * Attack
         */
        else {
            $("battleMessage").textContent =
                selectedSkill === "power"
                    ? "POWER STRIKE!"
                    : "SWORD SLASH!";

            await MathQuest.Animations
                .playerAttack(
                    selectedSkill,
                    effect.value
                );

            updateHud();

            /*
             * Enemy is defeated before
             * getting its turn.
             */
            if (
                MathQuest.Combat.state.enemyHp <= 0
            ) {
                showVictory();
                return;
            }
        }

        /*
         * Enemy survived.
         * It now performs its displayed intent.
         */
        const survived =
            await enemyTurn();

        if (!survived) {
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

        /*
         * Wrong answer means the player's action
         * fails and the enemy gets its turn.
         */
        const survived =
            await enemyTurn();

        if (!survived) {
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

        if (
            MathQuest.Combat.state.battleIndex ===
            MathQuest.Combat.battles.length - 1
        ) {
            $("nextBattleBtn").textContent =
                "Finish Chapter";
        }
        else {
            $("nextBattleBtn").textContent =
                "Next Battle";
        }
    }

    function nextBattle() {
        $("victoryPanel")
            .classList.add("hidden");

        const advanced =
            MathQuest.Combat.advanceBattle();

        if (!advanced) {
            showChapterComplete();
            return;
        }

        battleComplete = false;
        locked = false;

        /*
         * Default back to Sword Slash
         * at the beginning of each battle.
         */
        selectedSkill =
            "slash";

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

    function showChapterComplete() {
        battleComplete = true;

        $("chapterSummary").innerHTML =
            `
            <span class="reward-pill">
                ⭐ Final Score ${MathQuest.Combat.state.score}
            </span>

            <span class="reward-pill">
                🔥 Final Streak ${MathQuest.Combat.state.streak}
            </span>

            <span class="reward-pill">
                🏆 Goblin King Defeated
            </span>
            `;

        $("chapterCompletePanel")
            .classList.remove("hidden");

        $("battleMessage").textContent =
            "CHAPTER CLEAR!";
    }

    function restartChapter() {
        $("chapterCompletePanel")
            .classList.add("hidden");

        MathQuest.Combat.beginChapter();

        battleComplete = false;
        locked = false;

        selectedSkill =
            "slash";

        guardTutorialSeen =
            false;

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
        guardTutorialSeen =
            true;

        $("tutorialOverlay")
            .classList.add("hidden");

        /*
         * Automatically select Guard after
         * teaching the player why it exists.
         */
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

        if (
            !Number.isFinite(answer)
        ) {
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

        MathQuest.Combat.beginChapter();

        updateBattleIdentity();
        updateHud();

        /*
         * Skills
         */
        document
            .querySelectorAll(".skill")
            .forEach(button => {

                if (
                    button.dataset.skill
                ) {
                    button.addEventListener(
                        "click",
                        () =>
                            selectSkill(
                                button.dataset.skill
                            )
                    );
                }
            });

        /*
         * Base-10 workspace
         */
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

        /*
         * Math controls
         */
        $("hintBtn")
            .addEventListener(
                "click",
                showHint
            );

        $("answerForm")
            .addEventListener(
                "submit",
                submitAnswer
            );

        /*
         * Battle progression
         */
        $("nextBattleBtn")
            .addEventListener(
                "click",
                nextBattle
            );

        $("restartChapterBtn")
            .addEventListener(
                "click",
                restartChapter
            );

        /*
         * Guard tutorial
         */
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