/* Shared, resolution-independent infantry renderer. Local +X is facing. */
import { soldierPose } from './sim.js';

// Muted uniform colours: 0 = olive/khaki (Soviet), 1 = field grey (German).
const PALETTES = [
  { coat: '#8a8b54', light: '#b9b887', dark: '#555b35', helmet: '#6d7943', rim: '#bbc18b', web: '#b2a479', pack: '#797552' },
  { coat: '#788079', light: '#a7aea0', dark: '#484f4c', helmet: '#626d64', rim: '#a7b1a0', web: '#5b5544', pack: '#5b665d' },
];

export function drawSoldier(g, m, s, time, scale = 1) {
  const pose=soldierPose(m,s),prone=pose==='prone',fallen=pose==='fallen';
  const p = PALETTES[s.nation ? (s.nation === 'de' ? 1 : 0) : s.side];
  const gait=m.moving?Math.sin((m.stride||0)+m.phase)*1.9:0;
  const kick=(m.flash||0)>0?-1.2:0;
  g.save();g.translate(m.x,m.y);g.rotate(m.angle);g.scale(scale,scale);
  g.lineCap='round';g.lineJoin='round';
  const oval=(x,y,rx,ry,c)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill()};
  const limb=(points,c,width)=>{g.strokeStyle='#22291ddd';g.lineWidth=width+1.4;g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();g.strokeStyle=c;g.lineWidth=width;g.stroke()};
  if(fallen){g.globalAlpha=.65;oval(-2,1,12,5,'#20231d55');limb([[-2,-2],[-8,-6],[-12,-5]],p.dark,3);limb([[-2,2],[-8,5],[-11,8]],p.dark,3);oval(0,0,6,4,p.coat);oval(5,1,3.7,3.5,p.helmet);limb([[7,7],[16,10]],'#4a4030',1.5);g.restore();return}
  oval(-1,2,prone?14:10,prone?6:7,'#131a1680');
  if(prone){
    limb([[-3,-2],[-9,-3-gait*.35],[-15,-5-gait*.35]],p.dark,3.3);
    limb([[-3,2],[-10,3+gait*.35],[-15,5+gait*.35]],p.coat,3.3);
    limb([[-15,-5-gait*.35],[-17,-5-gait*.35]],'#33372e',3);
    limb([[-15,5+gait*.35],[-17,5+gait*.35]],'#33372e',3);
  }else{
    limb([[-2,-2],[-5+gait,-3],[-8+gait,-3.5]],p.dark,3.5);
    limb([[-2,2],[-5-gait,3],[-8-gait,3.5]],p.coat,3.5);
    oval(-9+gait,-3.5,2.8,2,'#30382b');oval(-9-gait,3.5,2.8,2,'#30382b');
  }
  // Shoulders, rolled sleeves and equipment remain legible at map scale.
  oval(-1,0,prone?6.8:5.5,4.8,'#293023');oval(-.3,-.3,prone?6.3:5,4.3,p.coat);
  limb([[1,-3.4],[prone?6:4,-6],[9+kick,-1.5]],p.coat,2.8);
  limb([[1,3.4],[5,6],[11+kick,3]],p.coat,2.8);
  oval(8+kick,-1.4,1.5,1.4,'#c3aa83');oval(10+kick,3,1.5,1.4,'#c3aa83');
  g.fillStyle=p.web;g.fillRect(-3.4,-4,1.3,8);g.fillRect(-4,-3,7,1.2);
  oval(-4.2,0,3.2,3.8,p.dark);oval(-4.5,-.7,2.7,3,p.pack);
  g.fillStyle=p.web;g.fillRect(-5.4,-3,1,5);g.fillRect(-2,3.2,3,2.2);g.fillRect(-2,-5.4,3,2.2);
  // Wooden stock, steel receiver and long barrel.
  limb([[4+kick,2.2],[12+kick,2.2]],'#8f704b',2.4);
  limb([[10+kick,2.2],[19+kick,2.2]],'#353d39',1.5);
  g.strokeStyle='#adb1a0';g.lineWidth=.65;g.beginPath();g.moveTo(12+kick,1.5);g.lineTo(19+kick,1.5);g.stroke();
  oval(4.1,0,3.1,3.1,'#b99e72');
  oval(3.1,-.7,4.6,4.4,'#303b29');oval(3,-1,4.1,3.8,p.helmet);
  g.strokeStyle=p.rim;g.lineWidth=.9;g.beginPath();g.ellipse(2.7,-1.5,3.3,2.9,0,Math.PI,Math.PI*1.85);g.stroke();
  g.strokeStyle=p.dark;g.lineWidth=.55;g.beginPath();g.moveTo(0,-3);g.lineTo(5,1);g.moveTo(0,1);g.lineTo(5,-3);g.stroke();
  if(m.role==='leader'){g.strokeStyle='#e1d5a4';g.lineWidth=1;g.beginPath();g.moveTo(1,-2);g.lineTo(2,-3);g.lineTo(3,-2);g.stroke()}
  if((m.flash||0)>0){g.fillStyle='#ffe1a0';g.beginPath();g.moveTo(19,2);g.lineTo(24,-1);g.lineTo(23,2);g.lineTo(27,3);g.lineTo(22,4);g.lineTo(23,7);g.closePath();g.fill()}
  g.restore();
}
