import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/OrbitControls.js";

const game=document.querySelector("#game");
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x86b7d7);
scene.fog=new THREE.Fog(0x86b7d7,90,260);

const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,500);
camera.position.set(0,6,12);

const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.05;
game.appendChild(renderer.domElement);

const controls=new OrbitControls(camera,renderer.domElement);
controls.enabled=false;

scene.add(new THREE.HemisphereLight(0xd9efff,0x33422f,2.0));
const sun=new THREE.DirectionalLight(0xfff0d2,3.0);
sun.position.set(-55,90,35);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
sun.shadow.camera.left=-110;sun.shadow.camera.right=110;sun.shadow.camera.top=110;sun.shadow.camera.bottom=-110;
scene.add(sun);

const WORLD=190;
const ground=new THREE.Mesh(new THREE.PlaneGeometry(WORLD,WORLD),new THREE.MeshStandardMaterial({color:0x31533a,roughness:.92}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

function box(w,h,d,color,x,y,z,rot=0){
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.72,metalness:.08}));
  m.position.set(x,y,z);m.rotation.y=rot;m.castShadow=true;m.receiveShadow=true;scene.add(m);return m;
}
function cyl(r,h,color,x,y,z){
  const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.86,h,10),new THREE.MeshStandardMaterial({color,roughness:.85}));
  m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m;
}

const roads=[];
function road(x,z,w,d){const r=box(w,.08,d,0x2d3134,x,.03,z);roads.push({x,z,w,d});for(let a=-w/2+8;a<w/2;a+=12)box(.3,.02,1.1,0xf0d15a,x+a,.09,z);return r}
road(0,0,WORLD,11);road(0,0,11,WORLD);
for(let z=-70;z<=70;z+=28)road(0,z,WORLD,7);
for(let x=-70;x<=70;x+=28)road(x,0,7,WORLD);

const buildings=[];
for(let x=-82;x<=82;x+=14)for(let z=-70;z<=70;z+=14){
  if(Math.abs(x)<7||Math.abs(z)<7)continue;
  const h=7+Math.random()*30,w=8+Math.random()*5,d=8+Math.random()*5;
  const b=box(w,h,d,new THREE.Color().setHSL(.58,.12,.13+Math.random()*.12),x+(Math.random()-.5)*2,h/2,z+(Math.random()-.5)*2);
  buildings.push(b);
  for(let yy=3;yy<h-1;yy+=4)for(let xx=-w*.3;xx<=w*.3;xx+=w*.3){
    const win=box(1.1,.8,.06,0x8ca7b3,b.position.x+xx,yy,b.position.z-d/2-.04);
    win.castShadow=false;
  }
}

const palmMat=new THREE.MeshStandardMaterial({color:0x0d5c2e,roughness:.9});
function palm(x,z,s=1){
  const g=new THREE.Group();g.position.set(x,0,z);
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.22*s,.34*s,5*s,9),new THREE.MeshStandardMaterial({color:0x76502e,roughness:1}));
  trunk.position.y=2.5*s;trunk.castShadow=true;g.add(trunk);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4,leaf=new THREE.Mesh(new THREE.BoxGeometry(3.2*s,.16*s,.55*s),palmMat);
    leaf.position.set(Math.cos(a)*1.35*s,5.2*s,Math.sin(a)*1.35*s);leaf.rotation.y=-a;leaf.rotation.z=.12;leaf.castShadow=true;g.add(leaf);
  }
  scene.add(g);
}
for(let i=0;i<75;i++)palm((Math.random()-.5)*180,(Math.random()-.5)*145,.65+Math.random()*.65);

const water=box(32,.08,160,0x16779a,84,.01,0);
water.material.roughness=.22;water.material.metalness=.18;

function car(x,z,color,rot=0,traffic=false){
  const g=new THREE.Group();g.position.set(x,.65,z);g.rotation.y=rot;
  const body=new THREE.Mesh(new THREE.BoxGeometry(2.15,.62,4.5),new THREE.MeshStandardMaterial({color,roughness:.38,metalness:.45}));
  body.castShadow=true;g.add(body);
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(1.7,.62,2.0),new THREE.MeshStandardMaterial({color:0x263b48,roughness:.2,metalness:.25}));
  cabin.position.y=.55;cabin.castShadow=true;g.add(cabin);
  const wheelMat=new THREE.MeshStandardMaterial({color:0x090b0d,roughness:.9});
  for(const xx of [-1.05,1.05])for(const zz of [-1.55,1.55]){
    const w=new THREE.Mesh(new THREE.CylinderGeometry(.36,.36,.2,16),wheelMat);w.rotation.z=Math.PI/2;w.position.set(xx,-.35,zz);w.castShadow=true;g.add(w);
  }
  scene.add(g);return {g,traffic,speed:1.8+Math.random()*2};
}
const traffic=[];
const colors=[0x202b35,0xb83d2e,0xd5d7d8,0x2d5d82,0x6d4a2f,0xeeeeee];
for(let i=0;i<18;i++)traffic.push(car(-85+Math.random()*170,-5+Math.random()*10,colors[i%colors.length],Math.random()<.5?0:Math.PI,true));
for(let i=0;i<12;i++)traffic.push(car(-5+Math.random()*10,-80+Math.random()*160,colors[(i+2)%colors.length],Math.PI/2,true));

const player=new THREE.Group();
const torso=box(0.85,1.25,.52,0x4b6f93,0,.9,0);
torso.parent=player;
const head=new THREE.Mesh(new THREE.SphereGeometry(.34,16,12),new THREE.MeshStandardMaterial({color:0xd19a72,roughness:.9}));
head.position.y=1.75;head.castShadow=true;head.parent=player;
const legs=box(.55,.95,.42,0x25354a,0,.08,0);legs.parent=player;
player.position.set(0,0,30);scene.add(player);

const marker=new THREE.Mesh(new THREE.TorusGeometry(2.4,.14,12,32),new THREE.MeshStandardMaterial({color:0xffc84d,emissive:0xff8c00,emissiveIntensity:2}));
marker.rotation.x=Math.PI/2;marker.position.set(52,.2,-34);scene.add(marker);
const beam=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,9,10),new THREE.MeshBasicMaterial({color:0xffc84d,transparent:true,opacity:.28}));
beam.position.set(52,4.5,-34);scene.add(beam);

let inCar=null, money=0, hp=100, complete=false;
const input={x:0,y:0,run:false};
let yaw=0,pitch=.18,lastX=0,lastY=0,looking=false;

function nearest(){
 let best=null,bd=4;
 for(const c of traffic){const d=Math.hypot(c.g.position.x-player.position.x,c.g.position.z-player.position.z);if(d<bd){bd=d;best=c}}
 return best;
}
function toggleCar(){
 if(inCar){inCar=null;player.visible=true;toast("Vehicle exited");return}
 const c=nearest();if(c){inCar=c;player.visible=false;toast("Vehicle entered");}
}
function doAction(){
 if(!complete&&Math.hypot(player.position.x-52,player.position.z+34)<7){
   complete=true;money+=1500;
   document.querySelector("#missionTitle").textContent="MISSION COMPLETE";
   document.querySelector("#missionText").textContent="+$1,500 · Free roam unlocked";
   marker.visible=false;beam.visible=false;toast("Mission complete");
 }
}
function toast(t){const e=document.querySelector("#toast");e.textContent=t;e.style.opacity=1;clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.opacity=0,1800)}

function update(dt){
 let mx=input.x,my=input.y,l=Math.hypot(mx,my);
 if(l>.05){
   mx/=Math.max(1,l);my/=Math.max(1,l);
   const sp=(inCar?15:5)*(input.run?1.6:1);
   const dx=Math.cos(yaw)*mx+Math.sin(yaw)*my;
   const dz=-Math.sin(yaw)*mx+Math.cos(yaw)*my;
   const target=inCar?inCar.g:player;
   target.position.x+=dx*sp*dt;target.position.z+=dz*sp*dt;
   target.position.x=THREE.MathUtils.clamp(target.position.x,-91,91);
   target.position.z=THREE.MathUtils.clamp(target.position.z,-76,76);
   target.rotation.y=Math.atan2(dx,dz);
 }
 if(inCar){player.position.copy(inCar.g.position);player.position.y=0}
 for(const c of traffic)if(c!==inCar&&c.traffic){
   c.g.position.z+=Math.cos(c.g.rotation.y)*c.speed*dt;
   c.g.position.x+=Math.sin(c.g.rotation.y)*c.speed*dt;
   if(c.g.position.x>96)c.g.position.x=-96;if(c.g.position.x<-96)c.g.position.x=96;
   if(c.g.position.z>80)c.g.position.z=-80;if(c.g.position.z<-80)c.g.position.z=80;
 }
 document.querySelector("#money").textContent="$"+money.toLocaleString();
 document.querySelector("#health").style.width=hp+"%";
 marker.rotation.z+=dt*1.5;
}

const mini=document.querySelector("#map"),mc=mini.getContext("2d");
function minimap(){
 mc.fillStyle="#10191c";mc.fillRect(0,0,116,116);
 mc.strokeStyle="#3d474b";mc.lineWidth=2;
 for(let x=-90;x<=90;x+=14){mc.beginPath();mc.moveTo((x+95)*.61,0);mc.lineTo((x+95)*.61,116);mc.stroke()}
 for(let z=-76;z<=76;z+=14){mc.beginPath();mc.moveTo(0,(z+80)*.74);mc.lineTo(116,(z+80)*.74);mc.stroke()}
 mc.fillStyle="#7a858c";for(const b of buildings){const x=(b.position.x+95)*.61,z=(b.position.z+80)*.74;mc.fillRect(x-2,z-2,5,5)}
 if(!complete){mc.fillStyle="#ffc84d";mc.beginPath();mc.arc((52+95)*.61,(-34+80)*.74,3,0,7);mc.fill()}
 const p=inCar?inCar.g.position:player.position;mc.fillStyle="#fff";mc.beginPath();mc.arc((p.x+95)*.61,(p.z+80)*.74,3.2,0,7);mc.fill();
}

function cameraUpdate(){
 const target=inCar?inCar.g.position:player.position;
 const dist=inCar?9:7.5;
 const desired=new THREE.Vector3(
   target.x-Math.sin(yaw)*dist,
   target.y+3.2+pitch*2,
   target.z-Math.cos(yaw)*dist
 );
 camera.position.lerp(desired,.14);
 camera.lookAt(target.x+Math.sin(yaw)*3,target.y+1.1,target.z+Math.cos(yaw)*3);
}
let last=performance.now();
function loop(t){const dt=Math.min(.05,(t-last)/1000);last=t;update(dt);cameraUpdate();minimap();renderer.render(scene,camera);requestAnimationFrame(loop)}
requestAnimationFrame(loop);

const stick=document.querySelector("#stick"),knob=document.querySelector("#knob");
function setStick(e){const r=stick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),m=55,d=Math.hypot(dx,dy),q=d>m?m/d:1,x=dx*q,y=dy*q;input.x=x/m;input.y=y/m;knob.style.transform=`translate(${x}px,${y}px)`}
stick.addEventListener("pointerdown",e=>{stick.setPointerCapture(e.pointerId);stick._id=e.pointerId;setStick(e)});
stick.addEventListener("pointermove",e=>{if(e.pointerId===stick._id)setStick(e)});
function endStick(e){if(e.pointerId===stick._id){input.x=input.y=0;knob.style.transform=""}}
stick.addEventListener("pointerup",endStick);stick.addEventListener("pointercancel",endStick);

const look=document.querySelector("#look");
look.addEventListener("pointerdown",e=>{look.setPointerCapture(e.pointerId);looking=true;lastX=e.clientX;lastY=e.clientY});
look.addEventListener("pointermove",e=>{if(!looking)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;yaw-=dx*.008;pitch=THREE.MathUtils.clamp(pitch-dy*.004,-.2,.55)});
look.addEventListener("pointerup",()=>looking=false);look.addEventListener("pointercancel",()=>looking=false);

document.querySelector("#action").addEventListener("pointerdown",doAction);
document.querySelector("#car").addEventListener("pointerdown",toggleCar);
const run=document.querySelector("#run");
run.addEventListener("pointerdown",()=>input.run=true);run.addEventListener("pointerup",()=>input.run=false);run.addEventListener("pointercancel",()=>input.run=false);
addEventListener("keydown",e=>{if(e.key==="w"||e.key==="ArrowUp")input.y=-1;if(e.key==="s"||e.key==="ArrowDown")input.y=1;if(e.key==="a"||e.key==="ArrowLeft")input.x=-1;if(e.key==="d"||e.key==="ArrowRight")input.x=1;if(e.key==="Shift")input.run=true;if(e.key==="e")toggleCar()});
addEventListener("keyup",e=>{if(["w","s","ArrowUp","ArrowDown"].includes(e.key))input.y=0;if(["a","d","ArrowLeft","ArrowRight"].includes(e.key))input.x=0;if(e.key==="Shift")input.run=false});
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2))});
setTimeout(()=>{const i=document.querySelector("#intro");i.style.opacity=0;setTimeout(()=>i.remove(),1000)},2600);
addEventListener("error",e=>{const x=document.querySelector("#error");x.style.display="block";x.textContent="GAME ERROR\n"+e.message});
addEventListener("unhandledrejection",e=>{const x=document.querySelector("#error");x.style.display="block";x.textContent="GAME ERROR\n"+e.reason});
