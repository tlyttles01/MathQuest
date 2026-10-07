window.MathQuest=window.MathQuest||{};
MathQuest.MathEngine=(()=>{
  const r=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;
  function add1(){const a=r(1,8),b=r(1,9-a);return{prompt:`${a} + ${b} = ?`,answer:a+b,hint:`Start with ${a} and count up ${b} more.`}}
  function sub1(){const a=r(3,9),b=r(1,a-1);return{prompt:`${a} − ${b} = ?`,answer:a-b,hint:`Start with ${a} and take away ${b}.`}}
  function add2(){let a,b;do{a=r(5,14);b=r(2,9)}while(a+b>20);return{prompt:`${a} + ${b} = ?`,answer:a+b,hint:`Build ${a} if you want, then add ${b} more.`}}
  function sub2(){const a=r(10,20),b=r(2,Math.min(9,a-1));return{prompt:`${a} − ${b} = ?`,answer:a-b,hint:`Build ${a} if you want, then cross out ${b}.`}}
  function mixed(d){const add=Math.random()<.5;return d<=1?(add?add1():sub1()):(add?add2():sub2())}
  function createProblem(o={}){const d=o.difficulty||1;return mixed(o.skill==="power"?Math.min(2,d+1):d)}
  return{createProblem};
})();