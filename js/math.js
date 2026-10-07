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

  function createProblem(options = {}) {
    const topic =
      options.topic || "basic";

    const difficulty =
      options.difficulty || 1;

    const skill =
      options.skill || "slash";

    /*
      Guard deliberately uses NORMAL questions.
      The combat decision is defensive, not a change
      in curriculum.

      Power Strike uses the same WORLD TOPIC but a
      harder challenge version.
    */
    const challenge =
      skill === "power";

    if (topic === "placeValue") {
      return createPlaceValueProblem(
        difficulty,
        challenge
      );
    }

    return createBasicProblem(
      difficulty,
      challenge
    );
  }

  return {
    createProblem
  };
})();
