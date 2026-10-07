window.MathQuest = window.MathQuest || {};

MathQuest.Animations = (() => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function restartClass(element, className) {
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  async function showDamage(target, amount, blocked = false) {
    const element = document.getElementById(target === "enemy" ? "enemyDamagePop" : "heroDamagePop");
    element.textContent = blocked ? "BLOCKED!" : `-${amount}`;
    element.style.color = blocked ? "#335da8" : "#b91c1c";
    element.classList.remove("hidden");
    restartClass(element, "pop");
    await wait(620);
    element.classList.add("hidden");
    element.classList.remove("pop");
  }

  async function playerAttack(kind, damage) {
    const hero = document.getElementById("heroSprite");
    const enemy = document.getElementById("enemySprite");
    const effect = document.getElementById(kind === "power" ? "powerEffect" : "slashEffect");

    restartClass(hero, "hero-lunge");
    await wait(180);

    effect.classList.remove("hidden");
    restartClass(effect, kind === "power" ? "power-pop" : "slash-pop");
    restartClass(enemy, "hit-shake");
    restartClass(enemy, "flash");

    await showDamage("enemy", damage);

    effect.classList.add("hidden");
    hero.classList.remove("hero-lunge");
    enemy.classList.remove("hit-shake", "flash");
  }

  async function enemyAttack(damage, blocked) {
    const enemy = document.getElementById("enemySprite");
    const hero = document.getElementById("heroSprite");
    const shield = document.getElementById("shieldFlash");

    restartClass(enemy, "enemy-lunge");
    await wait(180);

    if (blocked) {
      shield.classList.remove("hidden");
      restartClass(shield, "shield-pop");
      await showDamage("hero", 0, true);
      shield.classList.add("hidden");
    } else {
      restartClass(hero, "hit-shake");
      restartClass(hero, "flash");
      await showDamage("hero", damage);
      hero.classList.remove("hit-shake", "flash");
    }

    enemy.classList.remove("enemy-lunge");
  }

  async function guardUp() {
    const shield = document.getElementById("shieldFlash");
    shield.classList.remove("hidden");
    restartClass(shield, "shield-pop");
    await wait(500);
    shield.classList.add("hidden");
  }

  return { playerAttack, enemyAttack, guardUp, wait };
})();
