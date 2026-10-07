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

  function moneyNormal(difficulty) {
    if (difficulty <= 1) {
      return choose([
        {prompt:`1 nickel = ___ cents`,answer:5,hint:`A nickel is worth 5 cents.`},
        {prompt:`1 dime = ___ cents`,answer:10,hint:`A dime is worth 10 cents.`},
        {prompt:`1 quarter = ___ cents`,answer:25,hint:`A quarter is worth 25 cents.`},
        {prompt:`3 pennies = ___ cents`,answer:3,hint:`Each penny is 1 cent.`}
      ]);
    }
    const q=randomInt(0,2), d=randomInt(0,3), n=randomInt(0,2);
    return {prompt:`${q} quarter${q===1?"":"s"}, ${d} dime${d===1?"":"s"}, ${n} nickel${n===1?"":"s"} = ___ cents`,answer:q*25+d*10+n*5,hint:`Quarter = 25, dime = 10, nickel = 5.`};
  }

  function moneyChallenge(difficulty) {
    if (difficulty <= 1) {
      const total=choose([15,20,25,30,35,40]);
      return {prompt:`A dime is 10¢. How many more cents are needed to make ${total}¢?`,answer:total-10,hint:`Find the difference between ${total} and 10.`};
    }
    const price=randomInt(20,70), paid=choose([75,100]);
    return {prompt:`An item costs ${price}¢. You pay ${paid}¢. How many cents should you get back?`,answer:paid-price,hint:`Subtract the price from the amount paid.`};
  }

  function formatTime(hour, minute) {
    return `${hour}:${String(minute).padStart(2,"0")}`;
  }

  function timeNormal(difficulty) {
    if (difficulty <= 1) {
      const hour=randomInt(1,12), minute=choose([0,30]);
      return {prompt:`The clock shows ${formatTime(hour,minute)}. What hour is it?`,answer:hour,hint:`Look at the hour number.`};
    }
    const hour=randomInt(1,11), minute=choose([0,15,30,45]);
    return {prompt:`It is ${formatTime(hour,minute)}. How many minutes past the hour?`,answer:minute,hint:`Use the minutes after the colon.`};
  }

  function timeChallenge(difficulty) {
    if (difficulty <= 1) {
      const hour=randomInt(1,11);
      return {prompt:`It is ${formatTime(hour,30)}. How many minutes until ${formatTime(hour+1,0)}?`,answer:30,hint:`Half an hour is 30 minutes.`};
    }
    const hour=randomInt(1,9), startMinute=choose([0,15,30]), elapsed=choose([30,45,60]);
    let total=hour*60+startMinute+elapsed;
    let endHour=Math.floor(total/60);
    if (endHour>12) endHour-=12;
    return {prompt:`It is ${formatTime(hour,startMinute)}. ${elapsed} minutes pass. What is the new hour?`,answer:endHour,hint:`Move forward ${elapsed} minutes and track when the hour changes.`};
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
