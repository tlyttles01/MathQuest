window.MathQuest = window.MathQuest || {};

MathQuest.MathEngine = (() => {
  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function singleDigitAddition() {
    const a = randomInt(1, 8);
    const b = randomInt(1, 9 - a);
    return { prompt: `${a} + ${b} = ?`, answer: a + b, hint: `Start with ${a} and count up ${b} more.` };
  }

  function singleDigitSubtraction() {
    const a = randomInt(3, 9);
    const b = randomInt(1, a - 1);
    return { prompt: `${a} − ${b} = ?`, answer: a - b, hint: `Start with ${a} and take away ${b}.` };
  }

  function withinTwentyAddition() {
    let a, b;
    do { a = randomInt(5, 14); b = randomInt(2, 9); } while (a + b > 20);
    return { prompt: `${a} + ${b} = ?`, answer: a + b, hint: `Start with ${a} and add ${b} more.` };
  }

  function withinTwentySubtraction() {
    const a = randomInt(10, 20);
    const b = randomInt(2, Math.min(9, a - 1));
    return { prompt: `${a} − ${b} = ?`, answer: a - b, hint: `Start with ${a} and take away ${b}.` };
  }

  function createProblem(options = {}) {
    const difficulty = options.difficulty || 1;
    const addition = Math.random() < 0.5;
    if (difficulty <= 1) return addition ? singleDigitAddition() : singleDigitSubtraction();
    return addition ? withinTwentyAddition() : withinTwentySubtraction();
  }

  return { createProblem };
})();
