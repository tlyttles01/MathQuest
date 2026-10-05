window.MathQuest = window.MathQuest || {};

MathQuest.BlockWorkspace = (() => {
  let blocks = [];
  let nextId = 1;
  let mode = "cross";

  let placedBlocks;
  let emptyMessage;
  let toolHelp;

  function init() {
    placedBlocks = document.getElementById("placedBlocks");
    emptyMessage = document.getElementById("emptyMessage");
    toolHelp = document.getElementById("toolHelp");
    render();
  }

  function setMode(nextMode) {
    mode = nextMode;

    document.querySelectorAll(".tool-btn").forEach(btn => {
      if (btn.id === "clearAll") return;
      btn.classList.remove("active");
    });

    const map = {
      cross: "crossMode",
      break: "breakMode",
      remove: "removeMode"
    };

    document.getElementById(map[nextMode]).classList.add("active");

    if (nextMode === "cross") {
      toolHelp.textContent = "Tap blocks to cross them out. Tap again to undo.";
    } else if (nextMode === "break") {
      toolHelp.textContent = "Tap a ten rod to trade it for 10 ones.";
    } else {
      toolHelp.textContent = "Tap a block to remove it from the workspace.";
    }
  }

  function add(type) {
    blocks.push({
      id: nextId++,
      type,
      crossed: false
    });
    render();
  }

  function clear() {
    blocks = [];
    render();
  }

  function breakTen(block) {
    if (block.type !== "ten") {
      toolHelp.textContent = "Only a ten rod can be broken into ones.";
      return;
    }

    if (block.crossed) {
      toolHelp.textContent = "Uncross the ten before breaking it apart.";
      return;
    }

    blocks = blocks.filter(item => item.id !== block.id);

    for (let i = 0; i < 10; i++) {
      blocks.push({
        id: nextId++,
        type: "one",
        crossed: false
      });
    }

    toolHelp.textContent = "Nice! One ten became ten ones.";
    render(true);
  }

  function actOnBlock(block) {
    if (mode === "cross") {
      block.crossed = !block.crossed;
      render();
      return;
    }

    if (mode === "remove") {
      blocks = blocks.filter(item => item.id !== block.id);
      render();
      return;
    }

    if (mode === "break") {
      breakTen(block);
    }
  }

  function makeButton(block) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `math-block ${block.type}${block.crossed ? " crossed" : ""}`;
    button.textContent = block.type === "ten" ? "10" : "1";

    const action =
      mode === "cross"
        ? (block.crossed ? "Uncross" : "Cross out")
        : mode === "break"
        ? "Break"
        : "Remove";

    button.setAttribute("aria-label", `${action} ${block.type === "ten" ? "ten" : "one"} block`);
    button.addEventListener("click", () => actOnBlock(block));

    return button;
  }

  function render(justBroke = false) {
    if (!placedBlocks || !emptyMessage) return;

    placedBlocks.innerHTML = "";

    if (blocks.length === 0) {
      emptyMessage.classList.remove("hidden");
      placedBlocks.classList.add("hidden");
      return;
    }

    emptyMessage.classList.add("hidden");
    placedBlocks.classList.remove("hidden");

    const tensGroup = document.createElement("div");
    tensGroup.className = "block-group";

    const onesGroup = document.createElement("div");
    onesGroup.className = "block-group";

    blocks.forEach(block => {
      const button = makeButton(block);
      if (justBroke && block.type === "one") {
        button.classList.add("break-flash");
      }
      (block.type === "ten" ? tensGroup : onesGroup).appendChild(button);
    });

    if (tensGroup.childElementCount) placedBlocks.appendChild(tensGroup);
    if (onesGroup.childElementCount) placedBlocks.appendChild(onesGroup);
  }

  return {
    init,
    addTen: () => add("ten"),
    addOne: () => add("one"),
    clear,
    setMode
  };
})();
