window.MathQuest = window.MathQuest || {};

MathQuest.Heroes = (() => {
  const heroes = {
    knight: {
      id: "knight",
      name: "Knight",
      image: "characterImages/knight.png",
      startingMaxHp: 26,
      unlocked: true,
      description: "A defensive fighter who reads enemy attacks, blocks big hits, and turns perfect Guards into powerful counters."
    }

    /*
      Future heroes can be added here without rewriting the battle UI.

      Example:

      mage: {
        id: "mage",
        name: "Mage",
        image: "characterImages/mage.png",
        startingMaxHp: 16,
        unlocked: false,
        description: "Builds Focus with correct answers in a row."
      },

      ranger: {
        id: "ranger",
        name: "Ranger",
        image: "characterImages/ranger.png",
        startingMaxHp: 18,
        unlocked: false,
        description: "Builds combos for powerful precision attacks."
      }
    */
  };

  function get(heroId) {
    return heroes[heroId] || heroes.knight;
  }

  function all() {
    return Object.values(heroes);
  }

  return {
    heroes,
    get,
    all
  };
})();
