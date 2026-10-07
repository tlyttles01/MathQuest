window.MathQuest = window.MathQuest || {};

MathQuest.BlockWorkspace = (() => {
  let blocks = [];
  let mode = "cross";
  let nextId = 0;
  let placedBlocks, emptyMessage, toolHelp;

  function init() {
    placedBlocks = document.getElementById("placedBlocks");
    emptyMessage = document.getElementById("emptyMessage");
    toolHelp = document.getElementById("toolHelp");
    render();
  }

  function setMode(nextMode) {
    mode = nextMode;
    document.querySelectorAll(".tool").forEach(button => { if (button.id !== "clearAll") button.classList.remove("active"); });
    const activeId = mode === "cross" ? "crossMode" : mode === "break" ? "breakMode" : "removeMode";
    document.getElementById(activeId).classList.add("active");
    toolHelp.textContent = mode === "cross" ? "Tap blocks to cross them out. Tap again to undo." : mode === "break" ? "Tap a ten rod to trade it for 10 ones." : "Tap a block to remove it from the workspace.";
  }

  function addBlock(type) {
    blocks.push({ id: ++nextId, type, crossed: false });
    render();
  }

  function clear() { blocks = []; render(); }

  function actOnBlock(block) {
    if (mode === "cross") { block.crossed = !block.crossed; render(); return; }
    if (mode === "remove") { blocks = blocks.filter(item => item.id !== block.id); render(); return; }
    if (mode === "break") {
      if (block.type !== "ten") { toolHelp.textContent = "Only a ten rod can be broken into ones."; return; }
      if (block.crossed) { toolHelp.textContent = "Uncross the ten first."; return; }
      blocks = blocks.filter(item => item.id !== block.id);
      for (let i = 0; i < 10; i++) blocks.push({ id: ++nextId, type: "one", crossed: false });
      toolHelp.textContent = "Nice! One ten became ten ones.";
      render();
    }
  }

  function render() {
    if (!placedBlocks) return;
    placedBlocks.innerHTML = "";
    if (blocks.length === 0) { emptyMessage.classList.remove("hidden"); placedBlocks.classList.add("hidden"); return; }
    emptyMessage.classList.add("hidden");
    placedBlocks.classList.remove("hidden");

    const tensGroup = document.createElement("div");
    const onesGroup = document.createElement("div");
    tensGroup.className = onesGroup.className = "block-group";

    blocks.forEach(block => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `math-block ${block.type}${block.crossed ? " crossed" : ""}`;
      button.textContent = block.type === "ten" ? "10" : "1";
      button.addEventListener("click", () => actOnBlock(block));
      (block.type === "ten" ? tensGroup : onesGroup).appendChild(button);
    });

    if (tensGroup.childElementCount) placedBlocks.appendChild(tensGroup);
    if (onesGroup.childElementCount) placedBlocks.appendChild(onesGroup);
  }

  return { init, addTen: () => addBlock("ten"), addOne: () => addBlock("one"), clear, setMode };
})();
