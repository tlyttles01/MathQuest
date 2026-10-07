window.MathQuest = window.MathQuest || {};

MathQuest.MathEngine = (() => {
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

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
    let a, b;
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

  function tensAndOnes() {
    const tens = randomInt(2, 8);
    const ones = randomInt(1, 9);
    const total = tens * 10 + ones;

    if (Math.random() < 0.5) {
      return {
        prompt: `${tens} tens + ${ones} ones = ?`,
        answer: total,
        hint: `${tens} tens means ${tens * 10}. Add ${ones} ones.`
      };
    }

    return {
      prompt: `${total} = ? tens and ${ones} ones`,
      answer: tens,
      hint: `Look at the tens digit in ${total}.`
    };
  }

  function addTensAndOnes() {
    const a = randomInt(21, 59);
    const b = randomInt(1, 9);

    return {
      prompt: `${a} + ${b} = ?`,
      answer: a + b,
      hint: `Build ${a} with tens and ones, then add ${b} ones.`
    };
  }

  function subtractWithoutRegrouping() {
    let a, b;
    do {
      a = randomInt(21, 79);
      b = randomInt(1, 9);
    } while ((a % 10) < b);

    return {
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      hint: `Build ${a}. You can subtract ${b} ones without breaking a ten.`
    };
  }

  function subtractWithRegrouping() {
    let a, b;
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

  function createBasicProblem(difficulty) {
    const addition = Math.random() < 0.5;

    if (difficulty <= 1) {
      return addition
        ? singleDigitAddition()
        : singleDigitSubtraction();
    }

    return addition
      ? withinTwentyAddition()
      : withinTwentySubtraction();
  }

  function createPlaceValueProblem(difficulty, skill) {
    if (skill === "power") {
      return subtractWithRegrouping();
    }

    if (difficulty <= 1) {
      return tensAndOnes();
    }

    if (difficulty === 2) {
      return Math.random() < 0.5
        ? addTensAndOnes()
        : subtractWithoutRegrouping();
    }

    return subtractWithRegrouping();
  }

  function createProblem(options = {}) {
    const topic = options.topic || "basic";
    const difficulty = options.difficulty || 1;
    const skill = options.skill || "slash";

    if (topic === "placeValue") {
      return createPlaceValueProblem(difficulty, skill);
    }

    return createBasicProblem(
      skill === "power"
        ? Math.min(2, difficulty + 1)
        : difficulty
    );
  }

  return {
    createProblem
  };
})();
