window.MathQuest=window.MathQuest||{};
(()=>{
 const $=id=>document.getElementById(id);
 let selectedSkill="slash",currentProblem=null,hinted=false,locked=false,battleComplete=false,guardTutorialSeen=false;
 const skillInfo={slash:{label:"⚔️ SWORD SLASH",effect:"2 damage"},power:{label:"💥 POWER STRIKE",effect:"4 damage"},guard:{label:"🛡️ GUARD",effect:"Block incoming attack"}};
 const fmt=v=>Number.isInteger(v)?String(v):v.toFixed(1);

 function updateHud(){
  const s=MathQuest.Combat.state;
  $("heroHp").textContent=fmt(s.heroHp);$("heroMaxHp").textContent=s.heroMaxHp;
  $("enemyHp").textContent=fmt(s.enemyHp);$("enemyMaxHp").textContent=s.enemyMaxHp;
  $("score").textContent=s.score;$("streak").textContent=s.streak;
  $("heroHpBar").style.width=`${(s.heroHp/s.heroMaxHp)*100}%`;
  $("enemyHpBar").style.width=`${(s.enemyHp/s.enemyMaxHp)*100}%`;
 }

 function updateIntent(){
  const i=MathQuest.Combat.currentIntent();
  $("intentName").textContent=i.name;
  $("intentDamage").textContent=`💥 ${i.damage} DAMAGE`;
  $("intentCard").classList.toggle("danger",i.dangerous);
  $("intentCard").querySelector(".intent-title").textContent=i.dangerous?"🚨 BIG ATTACK INCOMING":"Enemy intent";
  if(selectedSkill==="guard")$("effectLabel").textContent=`Block ${i.damage} damage`;
 }

 function updateBattleIdentity(){
  const b=MathQuest.Combat.currentBattle();
  $("battleSubtitle").textContent=`Battle ${b.id} of ${MathQuest.Combat.battles.length}`;
  $("enemyName").textContent=b.enemyName;$("enemySprite").textContent=b.enemySprite;$("battleTip").textContent=b.tip;
  updateIntent();

  const powerUnlocked=b.id>=3;
  $("powerSkill").disabled=!powerUnlocked;$("powerSkill").classList.toggle("locked",!powerUnlocked);
  $("powerSkill").querySelector("b").textContent=powerUnlocked?"💥 Power Strike":"💥 Power Strike 🔒";
  $("powerSkill").querySelector("small").textContent=powerUnlocked?"Challenge question · 4 damage":"Unlocks in Battle 3";

  const guardUnlocked=b.id>=4;
  $("guardSkill").disabled=!guardUnlocked;$("guardSkill").classList.toggle("locked",!guardUnlocked);
  $("guardSkill").querySelector("b").textContent=guardUnlocked?"🛡️ Guard":"🛡️ Guard 🔒";
  $("guardSkill").querySelector("small").textContent=guardUnlocked?"Normal question · block incoming attack":"Unlocks later";

  if(!powerUnlocked&&selectedSkill==="power")selectedSkill="slash";
  if(!guardUnlocked&&selectedSkill==="guard")selectedSkill="slash";
  if(b.guardTutorial&&!guardTutorialSeen)$("tutorialOverlay").classList.remove("hidden");
 }

 function selectSkill(skill){
  if(locked||battleComplete)return;
  const btn=document.querySelector(`[data-skill="${skill}"]`);
  if(!btn||btn.disabled)return;
  selectedSkill=skill;
  document.querySelectorAll(".skill").forEach(b=>b.classList.toggle("active",b.dataset.skill===skill));
  newProblem();
 }

 function newProblem(){
  if(battleComplete)return;
  hinted=false;locked=false;
  const b=MathQuest.Combat.currentBattle();
  currentProblem=MathQuest.MathEngine.createProblem({difficulty:b.difficulty,skill:selectedSkill});
  $("skillName").textContent=skillInfo[selectedSkill].label;
  $("problem").textContent=currentProblem.prompt;
  $("answerInput").value="";$("feedback").textContent="";$("hintBox").classList.add("hidden");
  $("effectLabel").textContent=selectedSkill==="guard"?`Block ${MathQuest.Combat.currentIntent().damage} damage`:skillInfo[selectedSkill].effect;
  MathQuest.BlockWorkspace.clear();MathQuest.BlockWorkspace.setMode("cross");
  updateIntent();$("answerInput").focus();
 }

 function showHint(){
  if(locked||battleComplete)return;
  hinted=true;$("hintBox").textContent=currentProblem.hint;$("hintBox").classList.remove("hidden");
  if(selectedSkill==="slash")$("effectLabel").textContent="1.5 damage (hint)";
  if(selectedSkill==="power")$("effectLabel").textContent="3 damage (hint)";
  if(selectedSkill==="guard")$("effectLabel").textContent="Guard (hint used)";
 }

 async function enemyTurn(){
  const a=MathQuest.Combat.enemyAttack();
  $("battleMessage").textContent=a.blocked?"BLOCKED!":"ENEMY ATTACK";
  await MathQuest.Animations.enemyAttack(a.damage,a.blocked);
  updateHud();updateIntent();

  if(MathQuest.Combat.state.heroHp<=0){
    $("battleMessage").textContent="REST TIME";
    $("feedback").textContent+=" The Knight needs a rest. Try this battle again!";
    MathQuest.Combat.state.heroHp=MathQuest.Combat.state.heroMaxHp;
    MathQuest.Combat.resetBattle();updateHud();
    setTimeout(()=>{battleComplete=false;$("battleMessage").textContent="YOUR TURN";newProblem()},1400);
    return false;
  }
  return true;
 }

 async function correct(){
  const points=MathQuest.Combat.addCorrect();
  const effect=MathQuest.Combat.useSkill(selectedSkill,hinted);
  $("feedback").textContent=`✅ Correct! +${points} score.`;
  updateHud();

  if(effect.kind==="guard"){
    $("battleMessage").textContent="GUARD!";
    await MathQuest.Animations.guardUp();
  }else{
    $("battleMessage").textContent=selectedSkill==="power"?"POWER STRIKE!":"SWORD SLASH!";
    await MathQuest.Animations.playerAttack(selectedSkill,effect.value);
    updateHud();
    if(MathQuest.Combat.state.enemyHp<=0){showVictory();return;}
  }

  if(!await enemyTurn())return;
  $("battleMessage").textContent="YOUR TURN";
  setTimeout(newProblem,450);
 }

 async function wrong(){
  MathQuest.Combat.addWrong();
  $("feedback").textContent=`Not quite. The answer is ${currentProblem.answer}.`;
  if(!await enemyTurn())return;
  $("battleMessage").textContent="YOUR TURN";
  setTimeout(newProblem,550);
 }

 function showVictory(){
  battleComplete=true;locked=true;
  $("battleMessage").textContent="VICTORY!";
  $("victoryText").textContent=`You defeated the ${MathQuest.Combat.currentBattle().enemyName}.`;
  $("battleRewards").innerHTML=`<span class="reward-pill">⭐ Score ${MathQuest.Combat.state.score}</span><span class="reward-pill">🔥 Streak ${MathQuest.Combat.state.streak}</span>`;
  $("victoryPanel").classList.remove("hidden");
  $("nextBattleBtn").textContent=MathQuest.Combat.state.battleIndex===MathQuest.Combat.battles.length-1?"Finish Chapter":"Next Battle";
 }

 function nextBattle(){
  $("victoryPanel").classList.add("hidden");
  if(!MathQuest.Combat.advanceBattle()){showChapterComplete();return;}
  battleComplete=false;locked=false;selectedSkill="slash";
  document.querySelectorAll(".skill").forEach(b=>b.classList.toggle("active",b.dataset.skill==="slash"));
  $("battleMessage").textContent="YOUR TURN";
  updateBattleIdentity();updateHud();newProblem();
  window.scrollTo({top:0,behavior:"smooth"});
 }

 function showChapterComplete(){
  battleComplete=true;
  $("chapterSummary").innerHTML=`<span class="reward-pill">⭐ Final Score ${MathQuest.Combat.state.score}</span><span class="reward-pill">🔥 Final Streak ${MathQuest.Combat.state.streak}</span><span class="reward-pill">🏆 Goblin King Defeated</span>`;
  $("chapterCompletePanel").classList.remove("hidden");
  $("battleMessage").textContent="CHAPTER CLEAR!";
 }

 function restartChapter(){
  $("chapterCompletePanel").classList.add("hidden");
  MathQuest.Combat.beginChapter();
  battleComplete=false;locked=false;selectedSkill="slash";guardTutorialSeen=false;
  document.querySelectorAll(".skill").forEach(b=>b.classList.toggle("active",b.dataset.skill==="slash"));
  $("battleMessage").textContent="YOUR TURN";
  updateBattleIdentity();updateHud();newProblem();
 }

 function closeTutorial(){
  guardTutorialSeen=true;
  $("tutorialOverlay").classList.add("hidden");
  selectSkill("guard");
 }

 function submit(e){
  e.preventDefault();
  if(locked||battleComplete)return;
  const a=Number.parseInt($("answerInput").value,10);
  if(!Number.isFinite(a)){$("feedback").textContent="Enter an answer first.";return;}
  locked=true;
  a===currentProblem.answer?correct():wrong();
 }

 function init(){
  MathQuest.BlockWorkspace.init();MathQuest.Combat.beginChapter();updateBattleIdentity();updateHud();

  document.querySelectorAll(".skill").forEach(b=>b.addEventListener("click",()=>selectSkill(b.dataset.skill)));
  $("addTen").addEventListener("click",MathQuest.BlockWorkspace.addTen);
  $("addOne").addEventListener("click",MathQuest.BlockWorkspace.addOne);
  $("crossMode").addEventListener("click",()=>MathQuest.BlockWorkspace.setMode("cross"));
  $("breakMode").addEventListener("click",()=>MathQuest.BlockWorkspace.setMode("break"));
  $("removeMode").addEventListener("click",()=>MathQuest.BlockWorkspace.setMode("remove"));
  $("clearAll").addEventListener("click",MathQuest.BlockWorkspace.clear);
  $("hintBtn").addEventListener("click",showHint);
  $("answerForm").addEventListener("submit",submit);
  $("nextBattleBtn").addEventListener("click",nextBattle);
  $("restartChapterBtn").addEventListener("click",restartChapter);
  $("tutorialTryBtn").addEventListener("click",closeTutorial);
  $("tutorialSkipBtn").addEventListener("click",closeTutorial);

  newProblem();
 }
 init();
})();