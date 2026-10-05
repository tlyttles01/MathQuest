window.MathQuest = window.MathQuest || {};

MathQuest.MathEngine = (() => {
  const randomInt = (min, max) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  function subtractionProblem() {
    let a, b;
    do {
      a = randomInt(21, 59);
      b = randomInt(3, 9);
    } while ((a % 10) >= b);

    return {
      type: "subtract",
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      startValue: a,
      subtractValue: b,
      hint: `Build ${a}. If there are not enough ones, break one ten into 10 ones. Then cross out ${b} ones.`
    };
  }

  function breakTenProblem() {
    let a, b;
    do {
      a = randomInt(31, 69);
      b = randomInt(4, 9);
    } while ((a % 10) >= b);

    return {
      type: "breakTen",
      prompt: `${a} − ${b} = ?`,
      answer: a - b,
      startValue: a,
      subtractValue: b,
      hint: `Build ${a}, choose “Break a 10,” then tap a ten rod. Cross out ${b} ones.`
    };
  }

  function missingNumberProblem() {
    const total = randomInt(11, 19);
    const missing = total - 10;
    const useAddition = Math.random() < 0.5;

    if (useAddition) {
      const blankFirst = Math.random() < 0.5;
      return {
        type: "missing",
        prompt: blankFirst ? `□ + 10 = ${total}` : `10 + □ = ${total}`,
        answer: missing,
        hint: `What number joins 10 to make ${total}?`
      };
    }

    const minuend = randomInt(10, 19);
    const answer = randomInt(1, Math.min(9, minuend - 1));
    const result = minuend - answer;

    return {
      type: "missing",
      prompt: `${minuend} − □ = ${result}`,
      answer,
      hint: `What number can you take away from ${minuend} to leave ${result}?`
    };
  }

  function storyProblem() {
    let start, used;
    do {
      start = randomInt(21, 49);
      used = randomInt(3, 9);
    } while ((start % 10) >= used);

    return {
      type: "story",
      prompt: `The Knight found ${start} gems and used ${used}. How many gems are left?`,
      answer: start - used,
      startValue: start,
      subtractValue: used,
      hint: `Build ${start}. Break a ten if needed, then cross out ${used}.`
    };
  }

  function createProblem(skillKey) {
    switch (skillKey) {
      case "power":
        return breakTenProblem();
      case "guard":
        return missingNumberProblem();
      case "secondWind":
        return storyProblem();
      case "slash":
      default:
        return subtractionProblem();
    }
  }

  return { createProblem };
})();
