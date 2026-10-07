window.MathQuest=window.MathQuest||{};
MathQuest.Combat=(()=>{
 const battles=[
  {id:1,enemyName:"Tiny Slime",enemySprite:"🟢",enemyMaxHp:1,difficulty:1,tip:"Start simple. One correct answer defeats this enemy.",intent:{name:"Slime Bump",damage:1,dangerous:false}},
  {id:2,enemyName:"Blue Slime",enemySprite:"🔵",enemyMaxHp:2,difficulty:1,tip:"This slime can survive a hit. Keep your streak going.",intent:{name:"Bubble Bonk",damage:1,dangerous:false}},
  {id:3,enemyName:"Forest Goblin",enemySprite:"👺",enemyMaxHp:4,difficulty:1,tip:"Power Strike is unlocked. It asks a harder question but hits much harder.",intent:{name:"Wooden Club",damage:1,dangerous:false}},
  {id:4,enemyName:"Goblin Brute",enemySprite:"👹",enemyMaxHp:7,difficulty:2,tip:"Watch the enemy intent. Guard is useful when a big attack is coming.",intent:{name:"HEAVY SMASH",damage:4,dangerous:true},guardTutorial:true},
  {id:5,enemyName:"Goblin King",enemySprite:"👑",enemyMaxHp:10,difficulty:2,tip:"Boss battle! Use normal attacks, challenge attacks, and Guard when needed.",intentCycle:[{name:"Royal Jab",damage:1,dangerous:false},{name:"Crown Crash",damage:2,dangerous:false},{name:"KING'S SMASH",damage:4,dangerous:true}]}
 ];
 const state={heroHp:10,heroMaxHp:10,enemyHp:1,enemyMaxHp:1,score:0,streak:0,battleIndex:0,turnNumber:0,guardActive:false};
 const currentBattle=()=>battles[state.battleIndex];
 const currentIntent=()=>{const b=currentBattle();return b.intentCycle?b.intentCycle[state.turnNumber%b.intentCycle.length]:b.intent};
 function resetBattle(){const b=currentBattle();state.enemyMaxHp=b.enemyMaxHp;state.enemyHp=b.enemyMaxHp;state.turnNumber=0;state.guardActive=false}
 function beginChapter(){state.heroHp=state.heroMaxHp;state.score=0;state.streak=0;state.battleIndex=0;resetBattle()}
 function addCorrect(){state.streak++;const p=10+Math.min(state.streak-1,5)*5;state.score+=p;return p}
 function addWrong(){state.streak=0}
 function useSkill(skill,hinted){if(skill==="guard"){state.guardActive=true;return{kind:"guard",value:0}}const base=skill==="power"?4:2,damage=hinted?base*.75:base;state.enemyHp=Math.max(0,state.enemyHp-damage);return{kind:"damage",value:damage}}
 function enemyAttack(){const intent=currentIntent();if(state.guardActive){state.guardActive=false;state.turnNumber++;return{blocked:true,damage:0,intent}}state.heroHp=Math.max(0,state.heroHp-intent.damage);state.turnNumber++;return{blocked:false,damage:intent.damage,intent}}
 function advanceBattle(){if(state.battleIndex>=battles.length-1)return false;state.battleIndex++;resetBattle();return true}
 return{battles,state,currentBattle,currentIntent,beginChapter,resetBattle,addCorrect,addWrong,useSkill,enemyAttack,advanceBattle};
})();