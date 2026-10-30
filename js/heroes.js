window.MathQuest = window.MathQuest || {};

MathQuest.Heroes = (() => {
  const heroes = {
    knight: {
      id:"knight",
      name:"Knight",
      image:"characterImages/knight.png",
      emoji:"🛡️",
      startingMaxHp:30,
      unlocked:true,
      resourceName:"Focus",
      resourceIcon:"⚡",
      diceLabel:"Roll 3d6 · choose your die",
      description:"A tactical defender. Roll 3d6, choose the right die, and turn perfect Guards into Counters.",
      identity:"Choose. Defend. Counter.",
      skills:{
        slash:{name:"Sword Slash",icon:"⚔️",normal:"Choose 1 die for damage.",power:false},
        power:{name:"Power Strike",icon:"💥",normal:"Choose 2 dice and add them.",power:true},
        guard:{name:"Guard",icon:"🛡️",normal:"Choose 1 die for block.",power:false},
        shieldBash:{name:"Shield Bash",icon:"🛡️⚔️",normal:"Choose 1 die: block it and deal half.",power:false}
      }
    },
    mage: {
      id:"mage",
      name:"Mage",
      image:null,
      emoji:"🧙‍♀️",
      startingMaxHp:26,
      unlocked:true,
      resourceName:"Mana",
      resourceIcon:"🔷",
      diceLabel:"Roll 4d4 · combine two dice",
      description:"A spellcaster who combines dice. Add for steady magic, multiply for explosive Fireballs, or subtract to shape a Barrier.",
      identity:"Combine. Calculate. Cast.",
      skills:{
        slash:{name:"Arcane Bolt",icon:"✨",normal:"Choose 2 dice and add them.",power:false},
        power:{name:"Fireball",icon:"🔥",normal:"Choose 2 dice and multiply them.",power:true},
        guard:{name:"Ice Barrier",icon:"❄️",normal:"Choose 2 dice. Difference + 2 becomes block.",power:false},
        shieldBash:{name:"Spellweave",icon:"🔮",normal:"Choose 2 dice: high = block, low = damage.",power:false}
      }
    },
    rogue: {
      id:"rogue",
      name:"Rogue",
      image:null,
      emoji:"🥷",
      startingMaxHp:28,
      unlocked:true,
      resourceName:"Edge",
      resourceIcon:"🎯",
      diceLabel:"Roll 2d6 · hold or push your luck",
      description:"A risk-taker. Keep the roll you have or push for another die. Roll a 1 while pushing and the action busts.",
      identity:"Push. Risk. Cash out.",
      skills:{
        slash:{name:"Quick Strike",icon:"🗡️",normal:"Use the total of your dice.",power:false},
        power:{name:"Backstab",icon:"🎯",normal:"Use the total + 3 damage.",power:true},
        guard:{name:"Dodge",icon:"💨",normal:"Highest die + 2 becomes block.",power:false},
        shieldBash:{name:"Feint",icon:"🃏",normal:"High die = damage, low die = block.",power:false}
      }
    },
    cleric: {
      id:"cleric",
      name:"Cleric",
      image:null,
      emoji:"✨",
      startingMaxHp:29,
      unlocked:true,
      resourceName:"Spirit",
      resourceIcon:"🌟",
      diceLabel:"Roll 3d4 · assign every die",
      description:"A flexible support hero. Assign each die to Attack, Heal, or Shield, then resolve all three together.",
      identity:"Allocate. Protect. Sustain.",
      skills:{
        slash:{name:"Smite",icon:"☀️",normal:"+1 to your Attack total.",power:false},
        power:{name:"Radiant Burst",icon:"🌠",normal:"+3 to Attack. Costs 2 Spirit.",power:true},
        guard:{name:"Sanctuary",icon:"🕊️",normal:"+2 to your Shield total.",power:false},
        shieldBash:{name:"Blessing",icon:"💛",normal:"+2 to your Heal total.",power:false}
      }
    }
  };

  function get(heroId) {
    return heroes[heroId] || heroes.knight;
  }

  function all() {
    return Object.values(heroes);
  }

  return {heroes,get,all};
})();
