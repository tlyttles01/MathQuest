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


  function storyNormal(difficulty) {
    if (difficulty <= 1) {
      const a = randomInt(2, 9), b = randomInt(1, 7);
      return Math.random() < 0.5
        ? {prompt:`Mia has ${a} apples. She gets ${b} more. How many apples does she have?`,answer:a+b,hint:`She gets more, so add ${a} + ${b}.`}
        : {prompt:`There are ${a+b} books. ${b} are checked out. How many are left?`,answer:a,hint:`Some were taken away, so subtract.`};
    }
    const a = randomInt(8,20), b = randomInt(2,9);
    return Math.random() < 0.5
      ? {prompt:`The Knight found ${a} gems and then found ${b} more. How many gems now?`,answer:a+b,hint:`The amount grows, so add.`}
      : {prompt:`A shelf had ${a+b} books. ${b} fell off. How many remain?`,answer:a,hint:`Books were removed, so subtract.`};
  }

  function storyChallenge(difficulty) {
    if (difficulty <= 1) {
      const a=randomInt(5,12), b=randomInt(2,8);
      return {prompt:`A chest has ${a} red gems and ${b} blue gems. How many gems are in the chest?`,answer:a+b,hint:`Combine both groups.`};
    }
    const start=randomInt(12,25), used=randomInt(3,8), found=randomInt(2,6);
    return {prompt:`The Knight had ${start} torches. He used ${used}, then found ${found}. How many now?`,answer:start-used+found,hint:`Subtract what was used, then add what was found.`};
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
