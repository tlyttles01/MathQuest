window.MathQuest = window.MathQuest || {};

MathQuest.MathEngine = (() => {
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  function choose(list) {
    return list[randomInt(0, list.length - 1)];
  }

  // -----------------------------
  // Whispering Woods: basic math
  // -----------------------------

  function singleDigitAddition() {
    const a = randomInt(1, 8);
    const b = randomInt(1, 9 - a);

    return {
      prompt: `${a} + ${b} = ?`,
      answer: a + b,
      hint: `Start with ${a} and count up ${b} more.`
    };
  }

  function singleDigitSubtraction() {
    const a = randomInt(3, 9);
    const b = randomInt(1, a - 1);

    return {
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      hint: `Start with ${a} and take away ${b}.`
    };
  }

  function withinTwentyAddition() {
    let a;
    let b;

    do {
      a = randomInt(5, 14);
      b = randomInt(2, 9);
    } while (a + b > 20);

    return {
      prompt: `${a} + ${b} = ?`,
      answer: a + b,
      hint: `Start with ${a} and add ${b} more.`
    };
  }

  function withinTwentySubtraction() {
    const a = randomInt(10, 20);
    const b = randomInt(2, Math.min(9, a - 1));

    return {
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      hint: `Start with ${a} and take away ${b}.`
    };
  }

  function createBasicProblem(difficulty, challenge) {
    // Power Strike always stays in the same world topic;
    // it simply asks a harder version.
    const effectiveDifficulty =
      challenge
        ? Math.min(2, difficulty + 1)
        : difficulty;

    const addition =
      Math.random() < 0.5;

    if (effectiveDifficulty <= 1) {
      return addition
        ? singleDigitAddition()
        : singleDigitSubtraction();
    }

    return addition
      ? withinTwentyAddition()
      : withinTwentySubtraction();
  }

  // --------------------------------
  // Breakstone Mines: place value
  // --------------------------------

  function normalDecomposition() {
    const tens = randomInt(2, 8) * 10;
    const ones = randomInt(1, 9);
    const total = tens + ones;

    const templates = [
      {
        prompt: `${total} = ___ + ${tens}`,
        answer: ones,
        hint: `What number do you add to ${tens} to make ${total}?`
      },
      {
        prompt: `${total} = ${tens} + ___`,
        answer: ones,
        hint: `${total} is ${tens} and how many more?`
      },
      {
        prompt: `${tens} + ___ = ${total}`,
        answer: ones,
        hint: `Count from ${tens} up to ${total}.`
      },
      {
        prompt: `___ + ${tens} = ${total}`,
        answer: ones,
        hint: `What number joins ${tens} to make ${total}?`
      }
    ];

    return choose(templates);
  }

  function challengeDecomposition() {
    const tens = randomInt(2, 8) * 10;
    const ones = randomInt(1, 9);
    const total = tens + ones;

    const templates = [
      {
        prompt: `${total} = ${ones} + ___`,
        answer: tens,
        hint: `${total} has ${ones} ones. What is the value of the tens?`
      },
      {
        prompt: `___ + ${ones} = ${total}`,
        answer: tens,
        hint: `What multiple of 10 joins ${ones} to make ${total}?`
      },
      {
        prompt: `${ones} + ___ = ${total}`,
        answer: tens,
        hint: `Think about the tens part of ${total}.`
      }
    ];

    return choose(templates);
  }

  function addWithoutRegrouping() {
    let a;
    let b;

    do {
      a = randomInt(21, 79);
      b = randomInt(1, 8);
    } while ((a % 10) + b >= 10);

    return {
      prompt: `${a} + ${b} = ?`,
      answer: a + b,
      hint: `Keep the tens the same and add ${b} to the ones.`
    };
  }

  function subtractWithoutRegrouping() {
    let a;
    let b;

    do {
      a = randomInt(21, 79);
      b = randomInt(1, 9);
    } while ((a % 10) < b);

    return {
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      hint: `The ones digit is large enough to subtract ${b} without breaking a ten.`
    };
  }

  function addAcrossTen() {
    let a;
    let b;

    do {
      a = randomInt(21, 69);
      b = randomInt(3, 9);
    } while ((a % 10) + b < 10);

    return {
      prompt: `${a} + ${b} = ?`,
      answer: a + b,
      hint: `Make the next ten first, then add what is left.`
    };
  }

  function subtractWithRegrouping() {
    let a;
    let b;

    do {
      a = randomInt(21, 79);
      b = randomInt(3, 9);
    } while ((a % 10) >= b);

    return {
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      hint: `Build ${a}. Break one ten into 10 ones, then cross out ${b} ones.`
    };
  }

  function twoDigitSubtractWithRegrouping() {
    let a;
    let b;

    do {
      a = randomInt(42, 89);
      b = randomInt(12, Math.min(39, a - 10));
    } while (
      (a % 10) >= (b % 10) ||
      Math.floor(a / 10) <= Math.floor(b / 10)
    );

    return {
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      hint: `Break one ten so you can subtract the ones first, then subtract the tens.`
    };
  }

  function createPlaceValueProblem(difficulty, challenge) {
    /*
      Difficulty 1:
        Normal: 27 = ___ + 20
        Challenge: 27 = 7 + ___

      Difficulty 2:
        Normal: 42 + 5 / 48 - 5 without regrouping
        Challenge: cross-a-ten addition/subtraction

      Difficulty 3:
        Normal: 42 - 7 / 53 - 8
        Challenge: 53 - 18 / 72 - 26
    */

    if (difficulty <= 1) {
      return challenge
        ? challengeDecomposition()
        : normalDecomposition();
    }

    if (difficulty === 2) {
      if (challenge) {
        return Math.random() < 0.5
          ? addAcrossTen()
          : subtractWithRegrouping();
      }

      return Math.random() < 0.5
        ? addWithoutRegrouping()
        : subtractWithoutRegrouping();
    }

    return challenge
      ? twoDigitSubtractWithRegrouping()
      : subtractWithRegrouping();
  }


  const recentStoryTemplates = [];

  function chooseStoryTemplate(templates) {
    const available =
      templates.filter(
        template =>
          !recentStoryTemplates.includes(
            template.id
          )
      );

    const pool =
      available.length
        ? available
        : templates;

    const template =
      choose(pool);

    recentStoryTemplates.push(
      template.id
    );

    while (
      recentStoryTemplates.length > 5
    ) {
      recentStoryTemplates.shift();
    }

    return template;
  }

  function makeStoryProblem(template, values) {
    const problem =
      template.build(values);

    problem.storyTemplateId =
      template.id;

    return problem;
  }

  function storyNormal(difficulty) {
    const easyTemplates = [
      {
        id:"apples-more",
        build:({a,b}) => ({
          prompt:`Mia has ${a} apples. Her friend gives her ${b} more apples. How many apples does Mia have now?`,
          answer:a+b,
          hint:`Mia gets more apples, so add ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"books-out",
        build:({a,b}) => ({
          prompt:`There are ${a} books on a shelf. ${b} books are checked out. How many books are still on the shelf?`,
          answer:a-b,
          hint:`Some books leave the shelf, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      },
      {
        id:"stickers-more",
        build:({a,b}) => ({
          prompt:`Ava has ${a} stickers. She earns ${b} more stickers. How many stickers does she have altogether?`,
          answer:a+b,
          hint:`She earns more, so add ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"birds-away",
        build:({a,b}) => ({
          prompt:`There are ${a} birds in a tree. ${b} birds fly away. How many birds are left?`,
          answer:a-b,
          hint:`Birds fly away, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      },
      {
        id:"cars-more",
        build:({a,b}) => ({
          prompt:`Noah has ${a} toy cars. He gets ${b} more for his birthday. How many toy cars does he have now?`,
          answer:a+b,
          hint:`He gets more cars, so add ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"crayons-give",
        build:({a,b}) => ({
          prompt:`A box has ${a} crayons. The teacher gives ${b} crayons to students. How many crayons are left in the box?`,
          answer:a-b,
          hint:`Crayons are taken from the box, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      },
      {
        id:"shells-more",
        build:({a,b}) => ({
          prompt:`Lily finds ${a} shells at the beach, then finds ${b} more. How many shells does she find in all?`,
          answer:a+b,
          hint:`Combine both groups of shells: ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"cookies-eaten",
        build:({a,b}) => ({
          prompt:`There are ${a} cookies on a plate. The family eats ${b}. How many cookies are left?`,
          answer:a-b,
          hint:`Cookies were eaten, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      }
    ];

    const mediumTemplates = [
      {
        id:"gems-chests",
        build:({a,b}) => ({
          prompt:`The Knight finds ${a} gems in one chest and ${b} gems in another. How many gems does he find altogether?`,
          answer:a+b,
          hint:`Combine the gems from both chests: ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"potions-used",
        build:({a,b}) => ({
          prompt:`The Knight carries ${a} potions. He uses ${b} of them. How many potions does he have left?`,
          answer:a-b,
          hint:`He uses some potions, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      },
      {
        id:"library-returned",
        build:({a,b}) => ({
          prompt:`The library has ${a} books on a cart. Students return ${b} more books. How many books are on the cart now?`,
          answer:a+b,
          hint:`More books are returned, so add ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"lanterns-broken",
        build:({a,b}) => ({
          prompt:`There are ${a} lanterns in the hall. ${b} lanterns go out. How many are still glowing?`,
          answer:a-b,
          hint:`Some lanterns go out, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      },
      {
        id:"runes-found",
        build:({a,b}) => ({
          prompt:`The Knight knows ${a} magic runes. He learns ${b} new runes. How many runes does he know now?`,
          answer:a+b,
          hint:`He learns more runes, so add ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"scrolls-given",
        build:({a,b}) => ({
          prompt:`A wizard has ${a} scrolls. He gives ${b} scrolls to the Knight. How many scrolls does the wizard have left?`,
          answer:a-b,
          hint:`He gives scrolls away, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      }
    ];

    const hardTemplates = [
      {
        id:"pages-added",
        build:({a,b}) => ({
          prompt:`A magic book has ${a} glowing pages. A spell reveals ${b} more pages. How many glowing pages are there now?`,
          answer:a+b,
          hint:`The spell adds pages, so add ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"keys-lost",
        build:({a,b}) => ({
          prompt:`The Library Guardian has ${a} golden keys. He loses ${b} of them. How many keys does he still have?`,
          answer:a-b,
          hint:`Keys are lost, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      },
      {
        id:"crystals-found",
        build:({a,b}) => ({
          prompt:`The Knight has collected ${a} crystal shards. He discovers ${b} more. How many crystal shards does he have now?`,
          answer:a+b,
          hint:`He discovers more shards, so add ${a} + ${b}.`,
          builder:{operands:[a,b],operators:["+"]}
        })
      },
      {
        id:"maps-shared",
        build:({a,b}) => ({
          prompt:`The map room holds ${a} maps. Explorers take ${b} maps with them. How many maps remain?`,
          answer:a-b,
          hint:`Maps are taken away, so subtract ${a} - ${b}.`,
          builder:{operands:[a,b],operators:["-"]}
        })
      }
    ];

    let templates;
    let a;
    let b;

    if (difficulty <= 1) {
      templates = easyTemplates;
      a = randomInt(6, 15);
      b = randomInt(2, Math.min(7, a - 1));
    }
    else if (difficulty === 2) {
      templates = mediumTemplates;
      a = randomInt(14, 30);
      b = randomInt(3, Math.min(12, a - 1));
    }
    else {
      templates = hardTemplates;
      a = randomInt(25, 50);
      b = randomInt(5, Math.min(20, a - 1));
    }

    return makeStoryProblem(
      chooseStoryTemplate(templates),
      {a,b}
    );
  }

  function storyChallenge(difficulty) {
    const templates = [
      {
        id:"torches-use-find",
        operators:["-","+"],
        build:({a,b,c}) => ({
          prompt:`The Knight starts with ${a} torches. He uses ${b} torches, then finds ${c} more. How many torches does he have now?`,
          answer:a-b+c,
          hint:`First subtract the torches he uses, then add the torches he finds.`,
          builder:{operands:[a,b,c],operators:["-","+"]}
        })
      },
      {
        id:"gems-find-spend",
        operators:["+","-"],
        build:({a,b,c}) => ({
          prompt:`The Knight has ${a} gems. He finds ${b} more, then spends ${c} gems at a shop. How many gems does he have left?`,
          answer:a+b-c,
          hint:`First add the gems he finds, then subtract the gems he spends.`,
          builder:{operands:[a,b,c],operators:["+","-"]}
        })
      },
      {
        id:"books-borrow-return",
        operators:["-","+"],
        build:({a,b,c}) => ({
          prompt:`The library has ${a} books. Students borrow ${b} books, then return ${c}. How many books are in the library now?`,
          answer:a-b+c,
          hint:`First subtract the borrowed books, then add the returned books.`,
          builder:{operands:[a,b,c],operators:["-","+"]}
        })
      },
      {
        id:"coins-find-give",
        operators:["+","-"],
        build:({a,b,c}) => ({
          prompt:`The Knight has ${a} coins. He finds ${b} more coins, then gives ${c} coins to a friend. How many coins does he have now?`,
          answer:a+b-c,
          hint:`Add the coins he finds, then subtract the coins he gives away.`,
          builder:{operands:[a,b,c],operators:["+","-"]}
        })
      },
      {
        id:"arrows-use-get",
        operators:["-","+"],
        build:({a,b,c}) => ({
          prompt:`An archer has ${a} arrows. She uses ${b} arrows, then receives ${c} new arrows. How many arrows does she have now?`,
          answer:a-b+c,
          hint:`Subtract the arrows used, then add the new arrows.`,
          builder:{operands:[a,b,c],operators:["-","+"]}
        })
      },
      {
        id:"stars-earn-lose",
        operators:["+","-"],
        build:({a,b,c}) => ({
          prompt:`A hero has ${a} stars. She earns ${b} more stars, then loses ${c}. How many stars does she have now?`,
          answer:a+b-c,
          hint:`Add the stars earned, then subtract the stars lost.`,
          builder:{operands:[a,b,c],operators:["+","-"]}
        })
      },
      {
        id:"scrolls-find-find",
        operators:["+","+"],
        build:({a,b,c}) => ({
          prompt:`The Knight finds ${a} scrolls in the library. He finds ${b} more in one room and ${c} more in another. How many scrolls does he have altogether?`,
          answer:a+b+c,
          hint:`All three groups are being combined. Add both times.`,
          builder:{operands:[a,b,c],operators:["+","+"]}
        })
      },
      {
        id:"potions-use-share",
        operators:["-","-"],
        build:({a,b,c}) => ({
          prompt:`The Knight has ${a} potions. He uses ${b} potions and gives ${c} potions to a friend. How many potions are left?`,
          answer:a-b-c,
          hint:`Both actions take potions away. Subtract twice.`,
          builder:{operands:[a,b,c],operators:["-","-"]}
        })
      },
      {
        id:"pages-read-read",
        operators:["-","-"],
        build:({a,b,c}) => ({
          prompt:`A book has ${a} pages left to read. The Knight reads ${b} pages in the morning and ${c} pages at night. How many pages are left?`,
          answer:a-b-c,
          hint:`Pages are read twice, so subtract both groups.`,
          builder:{operands:[a,b,c],operators:["-","-"]}
        })
      },
      {
        id:"runes-learn-learn",
        operators:["+","+"],
        build:({a,b,c}) => ({
          prompt:`A wizard knows ${a} runes. She learns ${b} new runes from one book and ${c} from another. How many runes does she know now?`,
          answer:a+b+c,
          hint:`She learns more both times, so add twice.`,
          builder:{operands:[a,b,c],operators:["+","+"]}
        })
      }
    ];

    const template =
      chooseStoryTemplate(
        templates
      );

    let a;
    let b;
    let c;
    let result;
    let attempts = 0;

    do {
      if (difficulty <= 1) {
        a = randomInt(10, 18);
        b = randomInt(2, 6);
        c = randomInt(2, 6);
      }
      else if (difficulty === 2) {
        a = randomInt(18, 32);
        b = randomInt(4, 10);
        c = randomInt(3, 9);
      }
      else {
        a = randomInt(28, 48);
        b = randomInt(6, 14);
        c = randomInt(5, 13);
      }

      if (template.operators[0] === "-" && b >= a) {
        b = Math.max(2, a - 4);
      }

      const afterFirst =
        template.operators[0] === "+"
          ? a + b
          : a - b;

      if (template.operators[1] === "-" && c >= afterFirst) {
        c = Math.max(2, afterFirst - 3);
      }

      result =
        template.operators[1] === "+"
          ? afterFirst + c
          : afterFirst - c;

      attempts++;
    }
    while (
      attempts < 20 &&
      (
        result <= 0 ||
        Math.abs(result - a) < 3
      )
    );

    return makeStoryProblem(
      template,
      {a,b,c}
    );
  }

  const coinTypes = {
    penny: {name:"penny", value:1, label:"1¢"},
    nickel: {name:"nickel", value:5, label:"5¢"},
    dime: {name:"dime", value:10, label:"10¢"},
    quarter: {name:"quarter", value:25, label:"25¢"}
  };

  function coinCopies(name, count) {
    const coin = coinTypes[name];
    return Array.from({length:count}, () => ({...coin}));
  }

  function buildCoinAmount(total) {
    let left = total;
    const coins = [];

    for (const name of ["quarter","dime","nickel","penny"]) {
      const coin = coinTypes[name];
      const count = Math.floor(left / coin.value);
      coins.push(...coinCopies(name, count));
      left -= count * coin.value;
    }

    return coins;
  }

  function moneyNormal(difficulty) {
    if (difficulty <= 1) {
      const coin = choose([
        coinTypes.penny,
        coinTypes.nickel,
        coinTypes.dime
      ]);
      const count = randomInt(2, 5);

      return {
        prompt: `How many cents?`,
        answer: coin.value * count,
        hint: `Each ${coin.name} is worth ${coin.value} cents. Count by ${coin.value}s.`,
        visual: {
          type: "coins",
          coins: Array.from({length:count}, () => ({...coin}))
        }
      };
    }

    if (difficulty === 2) {
      const coinA = choose([coinTypes.nickel, coinTypes.dime, coinTypes.quarter]);
      const coinB = choose([coinTypes.penny, coinTypes.nickel, coinTypes.dime]);
      const countA = randomInt(1, 3);
      const countB = randomInt(1, 3);
      const coins = [
        ...Array.from({length:countA}, () => ({...coinA})),
        ...Array.from({length:countB}, () => ({...coinB}))
      ];

      return {
        prompt: `How many cents altogether?`,
        answer: coins.reduce((sum, coin) => sum + coin.value, 0),
        hint: `Find the value of each coin, then add them together.`,
        visual: {type:"coins", coins}
      };
    }

    return moneyRemovalProblem(difficulty, false);
  }

  function moneyRemovalProblem(difficulty, challenge) {
    const examples = challenge
      ? [
          {start:85, remove:5},
          {start:75, remove:10},
          {start:90, remove:15},
          {start:100, remove:25},
          {start:65, remove:20}
        ]
      : [
          {start:55, remove:5},
          {start:60, remove:10},
          {start:75, remove:5},
          {start:80, remove:10}
        ];

    const selected = choose(examples);
    let coins = buildCoinAmount(selected.start - selected.remove);
    coins.push(...buildCoinAmount(selected.remove));

    // Mix the tray so the coin to remove is not always at the end.
    coins = coins
      .map(coin => ({coin, sort:Math.random()}))
      .sort((a,b) => a.sort - b.sort)
      .map(item => item.coin);

    return {
      prompt: `You have ${selected.start}¢, but you need to give your friend ${selected.remove}¢. Remove ${selected.remove}¢ from the tray.`,
      answerType: "coinTray",
      answer: selected.start - selected.remove,
      hint: `Move coin${selected.remove === 1 ? "" : "s"} worth ${selected.remove}¢ into the Give to your friend area.`,
      coinTray: {
        startingTotal: selected.start,
        removeAmount: selected.remove,
        targetRemaining: selected.start - selected.remove,
        coins
      }
    };
  }

  function moneyChallenge(difficulty) {
    return moneyRemovalProblem(difficulty, true);
  }

  function formatTime(hour, minute) {
    return `${hour}:${String(minute).padStart(2,"0")}`;
  }

  function clockProblem(hour, minute, hint) {
    return {
      prompt: `What time is it?`,
      answerType: "time",
      answer: {
        hour,
        minute
      },
      hint,
      visual: {
        type: "clock",
        hour,
        minute
      }
    };
  }

  function timeNormal(difficulty) {
    if (difficulty <= 1) {
      const hour = randomInt(1, 12);
      const minute = choose([0, 30]);

      return clockProblem(
        hour,
        minute,
        minute === 0
          ? `The minute hand points to 12, so it is exactly ${hour} o'clock.`
          : `The minute hand points to 6, which means 30 minutes past the hour.`
      );
    }

    if (difficulty === 2) {
      const hour = randomInt(1, 12);
      const minute = choose([0, 15, 30, 45]);

      return clockProblem(
        hour,
        minute,
        `The long hand tells the minutes. Count by 5s around the clock.`
      );
    }

    const hour = randomInt(1, 12);
    const minute = choose([5,10,15,20,25,30,35,40,45,50,55]);

    return clockProblem(
      hour,
      minute,
      `Read the hour hand first, then count the minute marks by 5s.`
    );
  }

  function subtractMinutes(hour, minute, amount) {
    let total = ((hour % 12) * 60) + minute - amount;
    while (total < 0) total += 12 * 60;

    let answerHour = Math.floor(total / 60) % 12;
    if (answerHour === 0) answerHour = 12;

    return {
      hour: answerHour,
      minute: total % 60
    };
  }

  function timeChallenge(difficulty) {
    const subtractAmount =
      difficulty <= 1
        ? 15
        : choose([15, 30]);

    const minuteChoices =
      difficulty <= 1
        ? [15,30,45]
        : [0,5,10,15,20,25,30,35,40,45,50,55];

    const hour = randomInt(1, 12);
    const minute = choose(minuteChoices);
    const answer = subtractMinutes(hour, minute, subtractAmount);

    return {
      prompt: `Subtract ${subtractAmount} minutes from the time on the clock. What time will it be?`,
      answerType: "time",
      answer,
      hint: `Move backward ${subtractAmount} minutes. Count backward by 5s around the clock.`,
      visual: {
        type: "clock",
        hour,
        minute
      }
    };
  }

  function createProblem(options = {}) {
    const topic = options.topic || "basic";
    const difficulty = options.difficulty || 1;
    const skill = options.skill || "slash";
    const challenge = skill === "power";

    if (topic === "placeValue") {
      return createPlaceValueProblem(difficulty, challenge);
    }
    if (topic === "story") {
      return challenge ? storyChallenge(difficulty) : storyNormal(difficulty);
    }
    if (topic === "money") {
      return challenge ? moneyChallenge(difficulty) : moneyNormal(difficulty);
    }
    if (topic === "time") {
      return challenge ? timeChallenge(difficulty) : timeNormal(difficulty);
    }

    return createBasicProblem(difficulty, challenge);
  }

  return {
    createProblem
  };
})();
