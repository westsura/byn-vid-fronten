const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map(),tools=[];const el=id=>{if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',hidden:false,style:{},classList:{add(){},remove(){},toggle(){}},addEventListener(){},setAttribute(){},getContext(){return {}},focus(){}});return elements.get(id)};
const sandbox={console,document:{getElementById:el,addEventListener(){},modelContext:{registerTool(t){tools.push(t)}}},Image:class{},performance:{now:()=>0},requestAnimationFrame(){},setTimeout(){},clearTimeout(){},Math,window:{},confirm:()=>true};vm.createContext(sandbox);vm.runInContext(fs.readFileSync('dist/soldiers.js','utf8'),sandbox);vm.runInContext(fs.readFileSync('dist/game.js','utf8'),sandbox);const run=s=>vm.runInContext(s,sandbox);
assert(run('squads.length')===6);assert(run('paused')===true);assert(run('pathTo(squads[0],755,290).length>0'));assert(run('blocked(444,160)'));run('select(0); issue(640,330); togglePause();');run('for(let i=0;i<200&&!ended;i++)update(.05)');assert(run('squads[0].x>200'));assert(run('squads.every(s=>!alive(s).length||!blocked(s.x,s.y))'));
run('reset(); squads[0].x=objective.x;squads[0].y=objective.y; squads.filter(s=>s.side).forEach(s=>s.men.forEach(m=>m.hp=0)); for(let i=0;i<410&&!ended;i++)update(.05)');assert(run('ended&&capture>=20'));run('reset();squads.filter(s=>!s.side).forEach(s=>s.men.forEach(m=>m.hp=0));update(.05)');assert(run('ended'));run('reset();elapsed=359.99;update(.05)');assert(run('ended'));run('reset()');assert(run('!ended&&elapsed===0&&paused&&alive(squads[0]).length===5'));
(async()=>{assert(tools.length===2);let s=await tools[1].execute({squad:0,x:640,y:330});assert(s.squads[0].order==='Förflyttar');await assert.rejects(()=>tools[1].execute({squad:8,x:640,y:330}));console.log('PASS: initialization, reachable path, building obstacle, movement, collision, win, loss, timeout, reset, registered action valid/invalid inputs.');})();

run('reset();defend();update(.05)');assert(run("soldierPose(squads[0].men[0],squads[0])==='prone'"));
run('reset();squads[0].underFire=2;update(.05)');assert(run("soldierPose(squads[0].men[0],squads[0])==='prone'"));
run('squads[0].underFire=0;squads[0].men[0].moving=false');assert(run("soldierPose(squads[0].men[0],squads[0])==='ready'"));
run('squads[0].men[0].hp=0');assert(run("soldierPose(squads[0].men[0],squads[0])==='fallen'"));
run('reset();squads.filter(s=>s.side).forEach(s=>s.men.forEach(m=>m.hp=0));issue(650,220);for(let i=0;i<2200&&!ended;i++)update(.05)');
assert(run('squads[0].men.every(m=>!blocked(m.x,m.y)&&dist(m,squads[0])<60)'), 'Soldiers must follow around buildings');
console.log('PASS: defensive posture, suppression posture, recovery, casualty pose, individual building navigation.');

run('reset();squads.filter(s=>s.side).forEach(s=>s.men.forEach(m=>m.hp=0));issue(500,165);for(let i=0;i<1800;i++)update(.05)');
assert(run('buildingAt(squads[0].x,squads[0].y)===buildings[0]'),'Squad enters house');
assert(run('squads[0].men.every(m=>buildingAt(m.x,m.y)===buildings[0])'),'All soldiers enter');
assert(run('squads[0].men.every(m=>!blocked(m.x,m.y))'),'No soldiers in walls');
assert(run('coverAt(squads[0].x,squads[0].y)===.78'),'Interior cover');
assert(run('!canWalk({x:420,y:160},{x:470,y:160})'),'Wall blocks walking');
assert(run('canWalk({x:510,y:240},{x:510,y:195})'),'Door allows walking');
assert(run('los({x:501.5,y:140},{x:501.5,y:80})'),'Window allows sight');
assert(run('!los({x:470,y:140},{x:470,y:80})'),'Solid wall blocks sight');
assert(run('!canWalk({x:501.5,y:140},{x:501.5,y:80})'),'Cannot walk through window');
run('mode="move";issue(650,330);for(let i=0;i<1800;i++)update(.05)');
assert(run('!buildingAt(squads[0].x,squads[0].y)&&squads[0].men.every(m=>!buildingAt(m.x,m.y)&&dist(m,squads[0])<60)'),'All soldiers exit through door');
console.log('PASS: house entry and exit for all soldiers, wall collisions, interior cover, window sight, solid wall occlusion.');

for(let h=0;h<6;h++){run(`reset();squads.filter(s=>s.side).forEach(s=>s.men.forEach(m=>m.hp=0));issue(buildings[${h}].midX,buildings[${h}].midY);for(let i=0;i<5000;i++)update(.05)`);assert(run(`squads[0].men.every(m=>buildingAt(m.x,m.y)===buildings[${h}])`),'House '+h+' must be reachable by all five soldiers');}
console.log('PASS: all six buildings reachable by entire group.');
