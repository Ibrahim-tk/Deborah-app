import * as THREE from 'three';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import barkUrl from './assets/bark.jpg';
import barkNUrl from './assets/bark_n.jpg';
import barkOrmUrl from './assets/bark_orm.jpg';
import veinUrl from './assets/vein.jpg';
import petalUrl from './assets/petal.jpg';
import cardUrl from './assets/card.png';

const TEX={bark:barkUrl,barkN:barkNUrl,barkORM:barkOrmUrl,vein:veinUrl,petal:petalUrl,card:cardUrl};

/**
 * Mounts the Genesis tree into the DOM nodes rendered by <GenesisTree />.
 * els: {root, canvas, stage, caption, scrub, ages, play, next, replay, time}
 * Resolves to a dispose() function that stops the loop and frees GPU resources.
 */
export async function mountGenesisTree(els,{onReady}={}){
const CLEANUP=[];let DISPOSED=false,RAF=0;

/* ---------- helpers ---------- */
const V=(x,y,z=0)=>new THREE.Vector3(x,y,z);
const clamp01=x=>Math.max(0,Math.min(1,x));
const smooth=x=>{x=clamp01(x);return x*x*(3-2*x)};
const easeOut=x=>1-Math.pow(1-clamp01(x),3);
const lerp=(a,b,u)=>a+(b-a)*u;
let seed=20261030;
const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646};
const rr=(a,b)=>a+(b-a)*rnd();
const curve=(b,x)=>b.braid?smooth(x):easeOut(x);
const inverse=(b,a)=>{let lo=0,hi=1;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(curve(b,m)<a)lo=m;else hi=m}return hi};
const frontAt=(b,t)=>curve(b,(t-b.start)/(b.end-b.start));

/* Canopy envelope, in reference units (1 unit = 100 px of the 955 × 1647 artwork) */
function envelope(p){const cy=9.8+.12*p.x,dy=p.y-cy,ry=dy>0?5.9:4.4;return ((p.x-5.6)/5.9)**2+(dy/ry)**2+(p.z/3.2)**2}
function envGrad(p){const e=.05,a=envelope(p);return V((envelope(V(p.x+e,p.y,p.z))-a)/e,(envelope(V(p.x,p.y+e,p.z))-a)/e,(envelope(V(p.x,p.y,p.z+e))-a)/e).normalize()}

/* ---------- branch model: growth by division ---------- */
const branches=[];
function arcLengths(pts){const s=[0];for(let i=1;i<pts.length;i++)s.push(s[i-1]+pts[i].distanceTo(pts[i-1]));return s}
function makeBranch(o){o.s=arcLengths(o.pts);o.L=o.s.at(-1);o.kids=[];o.index=branches.length;branches.push(o);return o}
function sampleAt(b,a){const target=clamp01(a)*b.L;let i=1;while(i<b.s.length-1&&b.s[i]<target)i++;const u=clamp01((target-b.s[i-1])/Math.max(1e-6,b.s[i]-b.s[i-1]));
  return {p:b.pts[i-1].clone().lerp(b.pts[i],u),t:b.pts[i].clone().sub(b.pts[i-1]).normalize(),r:lerp(b.radii[i-1],b.radii[i],u)}}

/* Three stalks from the sprout braid into the trunk, then split into the three main limbs */
const spine=new THREE.CatmullRomCurve3([V(8.15,-0.8,0),V(7.85,1.4,.05),V(8.05,3.4,-.05),V(8.85,5.4,0),V(9.0,7.1,.05),V(8.72,8.7,0)],false,'centripetal');
const NS=3,TURNS=1.65,BRAID_N=110,zAxis=V(0,0,1);
const orbitAt=s=>.42*(1+.35*Math.exp(-s*11));
const strandRAt=s=>.37*(1+.3*Math.exp(-s*9))*(1-.35*s);
function braidPoint(s,theta,rad){const p=spine.getPointAt(s),T=spine.getTangentAt(s),N=T.clone().cross(zAxis).normalize(),B=N.clone().cross(T).normalize();return p.add(N.multiplyScalar(Math.cos(theta)*rad)).add(B.multiplyScalar(Math.sin(theta)*rad))}
const thetaAt=(s,i)=>Math.PI*2*TURNS*s+i*Math.PI*2/NS+.4;
const limbPaths=[
  [V(8.05,9.55,.35),V(7.0,9.85,.5),V(5.9,9.8,.6),V(4.8,9.55,.5)],
  [V(7.3,9.9,-.4),V(6.4,11.0,-.6),V(5.6,12.0,-.5)],
  [V(8.4,10.3,.5),V(8.1,11.8,.7),V(7.6,13.0,.6)]
];
const strands=[...Array(NS)].map((_,i)=>({i,top:braidPoint(1,thetaAt(1,i),orbitAt(1))})).sort((a,b)=>a.top.x-b.top.x);
const G1_END=.2,TRUNK_EXT=5;let braidFracSum=0;
strands.forEach(({i},rank)=>{
  const pts=[],radii=[];
  const spinePts=[];
  for(let k=0;k<=BRAID_N;k++){const s=k/BRAID_N;pts.push(braidPoint(s,thetaAt(s,i),orbitAt(s)));spinePts.push(spine.getPointAt(s));radii.push(strandRAt(s))}
  /* Intake: extend the trunk straight down by TRUNK_EXT so the base can sit at the screen bottom. */
  {const p0=pts[0],s0=spinePts[0],r0=radii[0];for(let k=1;k<=8;k++){const d=TRUNK_EXT*k/8;pts.unshift(V(p0.x,p0.y-d,p0.z));spinePts.unshift(V(s0.x,s0.y-d,s0.z));radii.unshift(r0)}}
  const braidLen=arcLengths(pts).at(-1),top=pts.at(-1),dir=spine.getTangentAt(1).lerp(top.clone().sub(pts.at(-3)).normalize(),.3).normalize(),shift=top.clone().sub(spine.getPointAt(1));
  const limb=new THREE.CatmullRomCurve3([top,top.clone().addScaledVector(dir,.9),...limbPaths[rank]],false,'centripetal');
  const n=Math.ceil(limb.getLength()/.12);
  for(let k=1;k<=n;k++){const u=k/n,q=limb.getPointAt(u);pts.push(q);spinePts.push(q.clone().sub(shift));radii.push(lerp(.62,.4,Math.pow(u,.8)))}
  const b=makeBranch({pts,spinePts,radii,start:0,end:G1_END,gen:1,sides:14,taper:.25,braid:true,azimuth:thetaAt(0,i)});
  b.braidFrac=braidLen/b.L;braidFracSum+=b.braidFrac;
});
const BRAID_FRAC=braidFracSum/NS;

/* Attractor points fill the canopy volume so the final twigs spread through it, not just around its rim */
const attractors=[];while(attractors.length<900){const p=V(rr(-.5,11.5),rr(5.4,16.6),rr(-3.2,3.2));if(envelope(p)<.85)attractors.push({p,used:0})}
function claim(from,dir,maxD,want){let best=null,bd=1e9;for(const a of attractors){if(a.used>1)continue;const d=a.p.clone().sub(from),l=d.length();if(l>maxD||l<.2)continue;const c=d.dot(dir)/l;if(c<-.15)continue;const score=Math.abs(l-want)*.8+(1.2-c)*1.6+a.used*1.5;if(score<bd){bd=score;best=a}}if(best)best.used++;return best}
/* Each tip forks: ×3 for the first divisions, ×2 then ×3 at the fine ends */
const FORK=[0,3,3,3,2,3],LEN=[0,2.5,1.65,1.05,.68,.4],DUR=[0,.1,.1,.095,.085,.08],SIDES=[0,10,8,6,5,4],TIPR=[0,.24,.15,.09,.055,.032];
/* Per-joint hand tuning for the fixed camera view. id = branch index (see the J debug view).
   offset: [x,y,z] shift at the joint, fading to 0 at the branch tip; rotation: degrees around the view axis;
   sink: multiplier on how far the base sinks behind its parent; collarScale: multiplier on collar length. */
const jointOverrides={};
/* screen-space (camera looks down -z) occupancy grid used to keep branches from running side by side */
const CELL=.4,GRID=new Map();
function gridAdd(b,pts,r){pts.forEach(p=>{const k=Math.floor(p.x/CELL)+','+Math.floor(p.y/CELL);if(!GRID.has(k))GRID.set(k,[]);GRID.get(k).push({b,x:p.x,y:p.y,r})})}
function overlapScore(pts,r,parent){let bad=0,tot=0;const from=Math.floor(pts.length*.3);
  for(let i=from;i<pts.length;i++){tot++;const p=pts[i],cx=Math.floor(p.x/CELL),cy=Math.floor(p.y/CELL);let hit=false;
    for(let dx=-1;dx<=1&&!hit;dx++)for(let dy=-1;dy<=1&&!hit;dy++){const c=GRID.get((cx+dx)+','+(cy+dy));if(!c)continue;
      for(const e of c){if(e.b===parent)continue;const ex=e.x-p.x,ey=e.y-p.y,lim=2*(r+e.r);if(ex*ex+ey*ey<lim*lim){hit=true;break}}}
    if(hit)bad++}
  return tot?bad/tot:0}
function fork(parent){
  const g=parent.gen;if(g>=6)return;
  const count=FORK[g],end=sampleAt(parent,1),T=end.t;
  const ref=Math.abs(T.y)<.9?V(0,1,0):V(1,0,0),base=ref.clone().cross(T).normalize();
  for(let k=0;k<count;k++){
    const a=k===0?1:rr(.8,.95),at=sampleAt(parent,a),lead=k===0;
    let best=null,bestScore=1e9;
    for(let attempt=0;attempt<(lead?2:7);attempt++){
      const ang=THREE.MathUtils.degToRad(lead?rr(4,14):rr(28,46));
      const perp=base.clone().applyAxisAngle(T,k*2.39996+rnd()*.7+parent.gen+attempt*1.37);
      const dir=at.t.clone().multiplyScalar(Math.cos(ang)).addScaledVector(perp,Math.sin(ang));
      const out=V(at.p.x-5.9,at.p.y-(9.8+.12*at.p.x-1.2),at.p.z*.5).normalize();
      dir.addScaledVector(out,.28).add(V(-.06,.12,0)).normalize();dir.z*=.7;dir.normalize();
      if(g>=2&&attempt===0){const target=claim(at.p,dir,LEN[g]*3.2,LEN[g]*1.9);if(target)dir.multiplyScalar(.45).addScaledVector(target.p.clone().sub(at.p).normalize(),.55).normalize()}
      const len=LEN[g]*(1+rr(-.17,.17)),n=Math.max(4,Math.ceil(len/(g<3?.13:.08)));
      const pts=[lead?at.p.clone():at.p.clone().addScaledVector(dir,-at.r*.9)];let p=at.p.clone();const d=dir.clone();if(!lead)pts.push(p.clone());
      for(let j=0;j<n;j++){
        d.add(V(rr(-.09,.09),rr(-.07,.09),rr(-.09,.09)));
        const horiz=1-Math.abs(d.y);d.y-=.03*horiz*(g<3?1:.6);
        const next=p.clone().addScaledVector(d.normalize(),len/n);
        if(envelope(next)>.9)d.addScaledVector(envGrad(next),-.6).normalize();
        if(next.y<6.2)d.y+=.12;
        p=p.addScaledVector(d.normalize(),len/n);pts.push(p.clone());
      }
      const sc=overlapScore(pts,TIPR[g],parent);
      if(sc<bestScore){bestScore=sc;best={pts,dir}}
      if(sc<=.12)break;
    }
    let pts=best.pts;
    const jid=branches.length,ov=jointOverrides[jid];
    if(ov){if(ov.rotation){const ang=THREE.MathUtils.degToRad(ov.rotation);pts=pts.map((q,i)=>i===0?q:q.clone().sub(at.p).applyAxisAngle(zAxis,ang).add(at.p))}
      if(ov.offset){const o=V(...ov.offset);pts=pts.map((q,i)=>q.clone().addScaledVector(o,1-i/(pts.length-1)))}}
    const rBase=lead?at.r*.97:Math.min(at.r*.75,TIPR[g]*1.25);
    const radii=pts.map((_,j)=>{const u=j/(pts.length-1);return Math.max(.008,lerp(rBase,TIPR[g]*.7,u))*(j<2?1.18:1)});
    const start=parent.start+(parent.end-parent.start)*inverse(parent,a)+rr(0,.012);
    const child=makeBranch({pts,radii,attach:at.p.clone(),attachA:a,isLead:lead,start,end:start+DUR[g],gen:g+1,sides:SIDES[g],taper:Math.min(.18,rBase*2+.03),parent,azimuth:k*2.39996+rnd()});
    parent.kids.push(child);gridAdd(child,pts,TIPR[g]);fork(child);
  }
}
branches.filter(b=>b.braid).forEach(b=>gridAdd(b,b.pts.slice(Math.floor(b.pts.length*.55)),.25));
branches.filter(b=>b.braid).forEach(fork);
/* Pipe model with a high exponent: a parent is only slightly thicker than what it carries */
const PIPE_N=2.7,TIP_R=.022,MIN_R=.016;
function pipe(b){if(b.rp)return b.rp;let acc=b.kids.length?0:Math.pow(TIP_R,PIPE_N);b.kids.forEach(k=>acc+=Math.pow(pipe(k),PIPE_N));return b.rp=Math.pow(acc,1/PIPE_N)}
branches.forEach(pipe);
branches.forEach(b=>{
  const tip=b.pts.at(-1),lead=b.kids.find(k=>k.attach&&k.attach.distanceTo(tip)<1e-3),rEnd=lead?pipe(lead):TIP_R*.75;
  if(b.braid){const nb=BRAID_N+1,topR=Math.max(strandRAt(1),b.rp*1.15);
    b.radii=b.pts.map((_,j)=>{if(j<nb){const s=j/BRAID_N;return lerp(strandRAt(s),topR,Math.pow(s,1.6))}const u=(j-nb+1)/(b.pts.length-nb);return Math.max(MIN_R,lerp(topR,rEnd,Math.pow(u,.8)))});
    return}
  b.radii=b.pts.map((_,j)=>{const u=j/(b.pts.length-1);return Math.max(MIN_R,lerp(b.rp,rEnd,u))*(j<2&&!b.isLead?1.12:1)});
  b.taper=Math.min(.18,b.rp*2+.03);
  if(b.gen>=5)b.radii=b.radii.map(r=>r*1.75);
});
const AWAY=V(0,0,-1);
branches.forEach(b=>{if(!b.parent)return;const P=b.parent,ov=jointOverrides[b.index]||{},pr=sampleAt(P,b.attachA).r;b.parentR=pr;
  if(b.isLead){P.continues=true;const ed=sampleAt(P,1).t;b.pts[0]=b.attach.clone().addScaledVector(ed,-pr*.6)}
  else{b.pts[0]=b.attach.clone().addScaledVector(AWAY,pr*1.75*(ov.sink??1));b.collar=true}
  b.s=arcLengths(b.pts);b.L=b.s.at(-1);
});
/* Keep the whole skeleton finished by the end of fine branching */
const lastEnd=Math.max(...branches.map(b=>b.end)),SCALE=lastEnd>.62?(.62-.12)/(lastEnd-.12):1;
branches.forEach(b=>{if(!b.braid){b.start=.12+(b.start-.12)*SCALE;b.end=.12+(b.end-.12)*SCALE}});
/* Each branch keeps thickening until everything it carries has grown */
function subtreeEnd(b){return b.subEnd??(b.subEnd=Math.max(b.end,...b.kids.map(subtreeEnd)))}
branches.forEach(subtreeEnd);

/* ---------- tube geometry with growth attributes ---------- */
function TubeBuilder(){Object.assign(this,{bi:[],pos:[],nor:[],uv:[],center:[],spine:[],arc:[],time:[],rad:[],idx:[],v:0})}
TubeBuilder.prototype.add=function(pts,radii,o){
  const n=pts.length,sides=o.sides,s=arcLengths(pts),L=s[n-1],UVS=2.6;
  const tg=pts.map((p,i)=>pts[Math.min(n-1,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize());
  let N=Math.abs(tg[0].y)<.9?V(0,1,0).cross(tg[0]).normalize():V(1,0,0).cross(tg[0]).normalize();
  const ring=Math.max(1,Math.round(2*Math.PI*radii[0]/UVS)),base=this.v,taper=Math.max(.02,o.taper/L);
  for(let i=0;i<n;i++){
    if(i>0){const ax=tg[i-1].clone().cross(tg[i]),l=ax.length();if(l>1e-6)N.applyAxisAngle(ax.normalize(),Math.asin(Math.min(1,l)))}
    const B=tg[i].clone().cross(N).normalize(),arc=o.arcMap?o.arcMap(i/(n-1)):s[i]/L;
    for(let j=0;j<=sides;j++){
      const a=j/sides*Math.PI*2,c=Math.cos(a),si=Math.sin(a),nx=N.x*c+B.x*si,ny=N.y*c+B.y*si,nz=N.z*c+B.z*si,r=radii[i];
      this.pos.push(pts[i].x+nx*r,pts[i].y+ny*r,pts[i].z+nz*r);this.nor.push(nx,ny,nz);this.uv.push(j/sides*ring,s[i]/UVS);
      this.center.push(pts[i].x,pts[i].y,pts[i].z);const sp=o.spinePts?o.spinePts[i]:pts[i];this.spine.push(sp.x,sp.y,sp.z);this.arc.push(arc);this.time.push(o.start,o.end,o.cont?-taper:taper,o.thickEnd);this.rad.push(r,o.braid?1:(o.twig?-1:0));this.bi.push(o.bi||0);
      if(i<n-1&&j<sides){const A=base+i*(sides+1)+j,Bi=A+sides+1;this.idx.push(A,Bi,A+1,A+1,Bi,Bi+1)}
    }
  }
  this.v+=n*(sides+1);
};
TubeBuilder.prototype.geometry=function(){
  const g=new THREE.BufferGeometry(),F=(a,n)=>new THREE.Float32BufferAttribute(a,n);
  g.setAttribute('position',F(this.pos,3));g.setAttribute('normal',F(this.nor,3));g.setAttribute('uv',F(this.uv,2));
  g.setAttribute('aCenter',F(this.center,3));g.setAttribute('aSpine',F(this.spine,3));g.setAttribute('aArc',F(this.arc,1));g.setAttribute('aTime',F(this.time,4));g.setAttribute('aRad',F(this.rad,2));g.setAttribute('aBranch',F(this.bi,1));
  g.setIndex(this.idx);return g;
};
/* Each branch lengthens on its own clock, oldest (lowest) first; children ride their parent's growth */
const BT=new Float32Array(1024*4);
const branchTex=new THREE.DataTexture(BT,1024,1,THREE.RGBAFormat,THREE.FloatType);branchTex.needsUpdate=true;
const ELONG=[null,[.16,.52,.33],[.2,.56,.8],[.26,.62,.88],[.32,.66,.86],[.42,.7,.9],[.5,.72,.94]];
const GPIVOT=V(8.4,0,0);
let AGE=0,GROW=0;function elong(b,t){return 1}
function keyedE(t){const K=[[0,.3],[.06,.33],[.1,.33],[.16,.33]];for(let i=1;i<K.length;i++)if(t<=K[i][0])return lerp(K[i-1][1],K[i][1],(t-K[i-1][0])/(K[i][0]-K[i-1][0]));return .33}
function updateBranchXforms(t){
  for(const b of branches){
    const e=elong(b,t);let sp=1,tp=V(0,0,0);const base=b.parent?b.attach:GPIVOT;
    if(b.parent){sp=b.parent.xs;tp=b.parent.xt}
    b.xs=sp*e;b.xt=tp.clone().addScaledVector(base,sp).addScaledVector(base,-b.xs);
    BT.set([b.xt.x,b.xt.y,b.xt.z,b.xs],b.index*4);
  }
  branchTex.needsUpdate=true;
}
const xform=(b,p)=>p.clone().multiplyScalar(b.xs).add(b.xt);
const wood=new TubeBuilder(),veins=new TubeBuilder();
function addCollars(){branches.forEach(b=>{if(!b.collar)return;const ov=jointOverrides[b.index]||{},cr=b.radii[2]??b.radii.at(-1),pr=b.parentR;
  const dir=b.pts[Math.min(3,b.pts.length-1)].clone().sub(b.attach).normalize(),len=pr*.6+1.75*cr*(ov.collarScale??1);
  const pts=[],radii=[];for(let i=0;i<=6;i++){const u=i/6;pts.push(b.attach.clone().addScaledVector(dir,-pr*.25+u*len));radii.push(lerp(pr*.92,cr,smooth(u)))}
  wood.add(pts,radii,{bi:b.index,sides:Math.max(6,b.sides+2),start:b.start,end:b.start+(b.end-b.start)*.25,taper:.05,thickEnd:b.subEnd,braid:false})})}
addCollars();
branches.forEach(b=>wood.add(b.pts,b.radii,{twig:b.gen>=5,cont:!!b.continues,bi:b.index,spinePts:b.spinePts,sides:b.sides,start:b.start,end:b.end,taper:b.taper,thickEnd:b.subEnd,braid:b.braid}));
{const pts=[],radii=[];for(let k=0;k<=80;k++){const s=k/80;pts.push(spine.getPointAt(s));radii.push(Math.max(.01,.56*(1+.35*Math.exp(-s*12))*(1-.2*s)*(1-.6*smooth((s-.95)/.05))))}
 wood.add(pts,radii,{sides:14,start:0,end:G1_END,taper:.6,thickEnd:.62,braid:true,arcMap:u=>u*BRAID_FRAC*.97});}
for(let i=0;i<NS;i++){const pts=[],radii=[],sps=[];for(let k=0;k<=BRAID_N;k++){const s=k/BRAID_N*.96;pts.push(braidPoint(s,thetaAt(s,i)+Math.PI/NS,orbitAt(s)*(1.06-.22*s)));sps.push(spine.getPointAt(s));radii.push(.04*(1+.4*Math.exp(-s*9)))}
 veins.add(pts,radii,{spinePts:sps,sides:6,start:0,end:G1_END,taper:.4,thickEnd:.62,braid:true,arcMap:u=>u*BRAID_FRAC*.96});}

/* ---------- renderer & scene ---------- */
const canvas=els.canvas;
const renderer=new THREE.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',preserveDrawingBuffer:false,alpha:true,premultipliedAlpha:false});
/* Intake: the canvas is ~3.5x the screen width, so render at 1x to keep the wind smooth. */renderer.setPixelRatio(1);renderer.toneMapping=THREE.NoToneMapping;
const scene=new THREE.Scene();
const sceneColor=()=>new THREE.Color(getComputedStyle(els.root).getPropertyValue('--scene').trim()||'#f7f5f1');
let bg=sceneColor();scene.background=bg;
{const mq=matchMedia('(prefers-color-scheme: dark)'),onScheme=()=>{bg=sceneColor()};mq.addEventListener('change',onScheme);CLEANUP.push(()=>mq.removeEventListener('change',onScheme))}
const camera=new THREE.OrthographicCamera(-1,1,1,-1,.1,200);camera.position.z=40;scene.add(camera);
scene.add(new THREE.HemisphereLight(0xfff6ea,0x9a7a62,1.8));
const key=new THREE.DirectionalLight(0xfff0dc,2.6);key.position.set(-6,10,8);camera.add(key);
const rim=new THREE.DirectionalLight(0xe8d6ff,.8);rim.position.set(6,6,-6);camera.add(rim);
const PIVOT=V(8.4,0,0),outer=new THREE.Group(),tree=new THREE.Group();outer.position.copy(PIVOT);tree.position.copy(PIVOT).negate();outer.add(tree);scene.add(outer);

const U={uBraid:{value:BRAID_FRAC},uT:{value:0},uAge:{value:0},uMerge:{value:new THREE.Vector3(1,1,1)},uCap:{value:new THREE.Vector3(1,1,1)},uPump:{value:0},uBT:{value:branchTex},uClock:{value:0},uSway:{value:.2},uGlow:{value:0},uFront:{value:-2},uCanopyGlow:{value:0},uGlowPass:{value:0},uDebug:{value:0},uSettle:{value:0},uTreeH:{value:4},uLean:{value:0},uFlutter:{value:0}};
const SWAY=`
uniform sampler2D uBT;uniform vec3 uMerge,uCap;uniform float uSettle,uTreeH,uLean,uFlutter;uniform float uPump;uniform float uDebug;uniform float uBraid,uT,uAge,uClock,uSway,uGlow,uFront,uCanopyGlow,uGlowPass;
vec3 sway(vec3 p){float hs=clamp(p.y/max(uTreeH,1.),0.,1.);vec3 st=vec3(uSettle*hs*hs*uTreeH*.025-uLean*hs*hs*uTreeH*.034,-uLean*hs*hs*hs*uTreeH*.012,uSettle*hs*hs*uTreeH*.01+uLean*hs*hs*uTreeH*.012);float h=max(p.y-4.5,0.)/11.;float a=uSway*h*h;
 return st+vec3(sin(uClock*1.05+p.x*.33+p.y*.17)*a*.34+sin(uClock*2.4+p.x*1.6+p.z)*a*.05,sin(uClock*1.6+p.x*.5)*a*.07,cos(uClock*.85+p.y*.3)*a*.16);}
float windSec(float tt){return (tt-.86)/.0175;}
float gust(float s){float w=s/8.;return .22*smoothstep(0.,.15,w)+exp(-pow((w-.36)/.11,2.))+.45*exp(-pow((w-.64)/.09,2.))+.12*smoothstep(.72,1.,w);}
float gustInt(float a,float b){float acc=0.;for(int i=0;i<10;i++){acc+=gust(mix(a,b,(float(i)+.5)/10.));}return acc*(b-a)/10.;}
vec3 curlF(vec3 p,float tm){
 float A=p.y*1.3+p.z*.7+tm,B=p.z*1.1+p.x*.9+tm*1.2,C=p.x*1.2+p.y*.8+tm*.8;
 return vec3(.8*cos(C)-1.1*cos(B),.7*cos(A)-1.2*cos(C),.9*cos(B)-1.3*cos(A));}
vec3 rotAxis(vec3 v,vec3 a,float ang){float c=cos(ang),s=sin(ang);return v*c+cross(a,v)*s+a*dot(a,v)*(1.-c);}
/* mass: heavier = drops sooner, follows the wind less; light petals lift and drift far */
vec3 windMotion(vec3 p0,float relSec,float m,float seed,float life,out float alpha,out float tau){
 float now=windSec(uT);tau=max(now-relSec,0.);alpha=1.;
 if(tau<=0.){alpha=1.;return vec3(0.);}
 float light=1./m;
 float D=gustInt(relSec,now);
 vec3 dir=normalize(vec3(-1.,-.15+(fract(seed*41.3)-.5)*.7,.22+(fract(seed*23.9)-.5)*.9));
 vec3 d=dir*D*2.6*(.45+.55*light/(1.+.25*light));
 float k=1.5*light,ty=tau-(1.-exp(-k*tau))/max(k,.05);
 d.y+=(.75*light*(.35+gust(now))-1.05*m)*ty*.55;
 vec3 q=p0*.3+d*.25+vec3(seed*7.,seed*3.,seed*5.);
 d+=curlF(q,tau*.8+seed*3.)*min(tau,3.5)*.85*(.45+.55*light);
 alpha=1.-smoothstep(life*.6,life,tau);
 return d;}
float dissolveFront(){return 18.-20.*clamp((windSec(uT)-4.4)/3.,0.,1.);}
float litAt(float y){return uGlow*(1.-smoothstep(uFront-.9,uFront+.35,y));}
float hash3(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float vnoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),
            mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
const PROJECT=`
vec4 mvPosition=vec4(transformed,1.);
#ifdef USE_INSTANCING
 mvPosition=instanceMatrix*mvPosition;
#endif
mvPosition.xyz=xf.xyz+xf.w*mvPosition.xyz;
mvPosition.xyz+=sway(mvPosition.xyz)+extraOffset;
mvPosition=modelViewMatrix*mvPosition;gl_Position=projectionMatrix*mvPosition;`;
const GLOW_OUT=`#include <dithering_fragment>
if(uDebug>.5)gl_FragColor=vec4(.88,.86,.8,1.);
if(uGlowPass>.5){vec3 e=totalEmissiveRadiance;if(any(isnan(e)))e=vec3(0.);gl_FragColor=vec4(min(e,vec3(16.)),1.);}`;

function woodShader(mat,isVein){
  mat.customProgramCacheKey=()=>'wood-'+isVein;
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);sh.uniforms.uVein={value:veinTex};
    sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
attribute vec3 aCenter;attribute vec3 aSpine;attribute float aBranch;attribute float aArc;attribute vec4 aTime;attribute vec2 aRad;varying float vY,vAge,vTwig;varying vec3 vC;${SWAY}`)
    .replace('#include <uv_vertex>',`#include <uv_vertex>
vec4 xf=vec4(0.,0.,0.,1.);
float gx=clamp((uT-aTime.x)/(aTime.y-aTime.x),0.,1.);
float g=aRad.y>.5?gx*gx*(3.-2.*gx):1.-pow(1.-gx,3.);
float mg=aBranch<2.5?max(uMerge.x,uMerge.y*smoothstep(uMerge.z,uMerge.z+.6,aSpine.y)):1.;float cp=1.;
g*=cp;
float tpz=abs(aTime.z);float gEff=aTime.z<0.?g*(1.+tpz):g;float behind=clamp((gEff-aArc)/tpz,0.,1.);float k=sqrt(max(0.,1.-(1.-behind)*(1.-behind)));
if(uT<=aTime.x)k=0.;
float ageY=clamp(uAge*1.7-mix(aSpine,aCenter,mg).y/17.*.7,0.,1.);ageY=ageY*ageY*(3.-2.*ageY);
float pullIn=aRad.y>.5?mix(mix(.62,1.,sqrt(ageY)),1.,smoothstep(uBraid*.88,uBraid,aArc)):1.;
vec3 cen=mix(aSpine,aCenter,mg*pullIn);
float carried=sqrt(smoothstep(aTime.x,aTime.w,uT));
float th=mix(.2,1.,carried)*mix(.6,1.,ageY)*(1.+.35*ageY*pow(1.-aArc,4.));
if(aRad.y>.5){float yw=-.6+uPump*3.6;float pumped=(1.-smoothstep(yw-1.,yw,cen.y))*uPump;
 th=mix(.12,1.,sqrt(ageY))*(1.+.55*ageY*ageY*pow(1.-clamp(aArc/max(uBraid,.01),0.,1.),6.))*(1.+.9*pumped*(1.-ageY));}
float rf=max(k*th,.02);
#ifdef USE_MAP
vMapUv.x*=rf;
#endif
#ifdef USE_NORMALMAP
vNormalMapUv.x*=rf;
#endif
#ifdef USE_AOMAP
vAoMapUv.x*=rf;
#endif
#ifdef USE_ROUGHNESSMAP
vRoughnessMapUv.x*=rf;
#endif
`)
    .replace('#include <begin_vertex>',`vec3 transformed=cen+(position-aCenter)*k*th${isVein?'*smoothstep(.75,1.,uAge)':''};vec3 extraOffset=vec3(0.);vY=cen.y;vC=aCenter;vAge=smoothstep(.04,.42,aRad.x*th);vTwig=aRad.y<-.5?1.:0.;`)
    .replace('#include <project_vertex>',PROJECT);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
uniform sampler2D uVein;varying float vY,vAge,vTwig;varying vec3 vC;${SWAY}`)
    .replace('#include <clipping_planes_fragment>',`#include <clipping_planes_fragment>
if(vY+(vnoise(vC*3.1)-.5)*.9>dissolveFront())discard;`)
    .replace('#include <color_fragment>',`#include <color_fragment>
${isVein?'':`float nv=vnoise(vC*.55)*.6+vnoise(vC*2.1)*.4;
diffuseColor.rgb*=mix(vec3(.86,.84,.86),vec3(1.1,1.02,.95),nv);
diffuseColor.rgb=mix(vec3(.3,.22,.18)*(.9+.2*nv),diffuseColor.rgb,.3+.7*vAge);
diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.9+vec3(.09,.065,.04),vTwig);`}`)
    .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
${isVein?'':'normal=normalize(mix(nonPerturbedNormal,normal,.15+.85*vAge*vAge));'}`)
    .replace('#include <emissivemap_fragment>',isVein?
`float lv=litAt(vY);totalEmissiveRadiance+=vec3(1.,.56,.13)*lv*(1.5+.6*sin(vY*2.6-uClock*2.2));`:
`float vm=texture2D(uVein,vMapUv).r;float lw=litAt(vY);
totalEmissiveRadiance+=vec3(1.,.52,.1)*(vm*vm*1.3*lw+vm*.35*uGlow*exp(-((vY-uFront)*(vY-uFront))/.49));`)
    .replace('#include <dithering_fragment>',GLOW_OUT);
  };
}

/* ---------- lisianthus-style ruffled petals ---------- */
function petal(pos,uv,idx,{nu,nv,len,width,tilt,rot,ruffle,freq,cup,lift=0}){
  const v0=pos.length/3,c=Math.cos(rot),s=Math.sin(rot),ct=Math.cos(tilt),st=Math.sin(tilt);
  for(let i=0;i<=nv;i++)for(let j=0;j<=nu;j++){
    const v=i/nv,u=j/nu*2-1,w=width*Math.pow(Math.sin(Math.PI*Math.min(1,.12+v*.92)),.7)*(.35+.65*Math.min(1,v*1.6));
    let x=u*w,y=v*len,z=-cup*u*u*w*v+ruffle*Math.sin(u*freq+v*2.3+rot*3)*v*v*len;
    const yy=y*ct-z*st,zz=y*st+z*ct+lift;
    pos.push(x*c-yy*s,x*s+yy*c,zz);uv.push(j/nu,v);
    if(i<nv&&j<nu){const A=v0+i*(nu+1)+j,B=A+nu+1;idx.push(A,B,A+1,A+1,B,B+1)}
  }
}
function geo(pos,uv,idx){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g}
function flowerGeometry(){const pos=[],uv=[],idx=[];
  for(let k=0;k<5;k++)petal(pos,uv,idx,{nu:2,nv:2,len:1,width:.42,tilt:1.15,rot:k*Math.PI*2/5,ruffle:.07,freq:9,cup:.25});
  for(let k=0;k<3;k++)petal(pos,uv,idx,{nu:2,nv:1,len:.58,width:.3,tilt:.45,rot:k*Math.PI*2/3+.5,ruffle:.05,freq:7,cup:.5,lift:.05});
  return geo(pos,uv,idx)}
function leafGeometry(){const pos=[],uv=[],idx=[];
  petal(pos,uv,idx,{nu:12,nv:10,len:1,width:.46,tilt:0,rot:0,ruffle:.06,freq:16,cup:.35});return geo(pos,uv,idx)}
function cardGeometry(){const g=new THREE.PlaneGeometry(1,1);return g}

function bloomShader(mat,kind){
  mat.customProgramCacheKey=()=>'bloom-'+kind;
  mat.onBeforeCompile=sh=>{
    Object.assign(sh.uniforms,U);
    sh.vertexShader=sh.vertexShader.replace('#include <common>',`#include <common>
attribute vec4 aData;attribute float aBranch;varying float vOpen,vInner,vPetal,vPetalU;${SWAY}`)
    .replace('#include <begin_vertex>',`vec4 xf=vec4(0.,0.,0.,1.);
vec3 transformed=vec3(position);
${kind==='flower'?'xf=texelFetch(uBT,ivec2(int(aBranch+.5),0),0);':''}
float open=smoothstep(aData.x,aData.x+.03,uT);float appear=smoothstep(aData.x-.012,aData.x+.004,uT);
vOpen=open;vInner=aData.z;vPetal=uv.y;vPetalU=uv.x;
${kind==='flower'?'float r=length(position.xy);transformed.xy*=mix(.25,1.,open);transformed.z+=(1.-open)*r*1.1;':''}
vec3 ip=(instanceMatrix*vec4(0.,0.,0.,1.)).xyz;ip=xf.xyz+xf.w*ip;
float score=clamp(ip.y/17.,0.,1.)*.7+clamp((ip.x+1.)/11.,0.,1.)*.3;
float relSec=1.4+(1.-score)*3.6+fract(aData.w*7.13)*1.2;
float mass=mix(${kind==='leaf'?'.7,1.9':'.3,1.5'},fract(aData.w*13.7)),life=mix(2.4,5.2,fract(aData.w*29.3));
float alpha,tau;vec3 wd=windMotion(ip,relSec,mass,aData.w,life,alpha,tau);
float flut=uFlutter*(1.-step(.0001,tau));
transformed=rotAxis(transformed,vec3(1.,0.,0.),flut*sin(uClock*13.+aData.w*40.)*.35);
if(tau>0.){vec3 ax=normalize(vec3(fract(aData.w*3.1)-.5,fract(aData.w*5.7)-.5,fract(aData.w*9.3)-.5)+vec3(.001));
 float spin=(1.5+2.5/mass)*(fract(aData.w*17.)>.5?1.:-1.);
 transformed=rotAxis(transformed,ax,tau*spin+sin(tau*(6.+4./mass)+aData.w*20.)*.7);}
transformed*=mix(${kind==='leaf'?'1.':'.5'},1.,open)*appear*alpha;
vec3 extraOffset=wd;`)
    .replace('#include <project_vertex>',PROJECT);
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
varying float vOpen,vInner,vPetal,vPetalU;${SWAY}`)
    .replace('#include <color_fragment>',`#include <color_fragment>
${kind==='card'?'':`
vec3 magenta=vec3(1.08,.78,1.08),blue=vec3(.72,.78,1.18);
diffuseColor.rgb*=mix(magenta,blue,smoothstep(.25,1.,vPetal));
diffuseColor.rgb*=.86+.16*sin(vPetalU*${kind==='leaf'?'40.':'22.'}+vPetal*7.)*smoothstep(.2,1.,vPetal);
diffuseColor.rgb+=vec3(.1,.07,.13)*smoothstep(.82,1.,vPetal);
${kind==='flower'?'float heart=1.-smoothstep(.0,.16,vPetal);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.,.82,.42),heart*.85);':''}`}
diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.1,.88,1.04)+vec3(.06,.02,.05),uCanopyGlow*.6);`)
    .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
${kind==='flower'?'float nearB=smoothstep(.45,1.,vInner);totalEmissiveRadiance+=vec3(1.,.6,.16)*uCanopyGlow*nearB*(.32+.55*(1.-smoothstep(.0,.3,vPetal)));':''}`)
    .replace('#include <dithering_fragment>',GLOW_OUT);
  };
}

/* ---------- glowing points: sparks and canopy light ---------- */
function pointsMaterial(kind){
  return new THREE.ShaderMaterial({uniforms:{...U,uPx:{value:100}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
    vertexShader:`attribute vec2 aRnd;varying float vA;uniform float uPx;${SWAY}
void main(){vec3 p=position;float lit=litAt(p.y)*step(p.y,dissolveFront());
 ${kind==='spark'?`float tw=.5+.5*sin(uClock*(2.+aRnd.x*5.)+aRnd.y*30.);p.y+=fract(uClock*.08+aRnd.x)*.5;vA=lit*tw;float size=(.05+aRnd.y*.09);`
 :`vA=uCanopyGlow*(1.-smoothstep(uFront-1.5,uFront+.5,p.y))*.022*step(p.y,dissolveFront()-1.);float size=1.1+aRnd.y*1.4;`}
 vec4 mv=modelViewMatrix*vec4(p+sway(p),1.);gl_Position=projectionMatrix*mv;gl_PointSize=size*uPx;}`,
    fragmentShader:`varying float vA;void main(){float d=length(gl_PointCoord-.5);float a=${kind==='spark'?'smoothstep(.5,.05,d)':'pow(smoothstep(.5,0.,d),2.2)'};
 gl_FragColor=vec4(${kind==='spark'?'vec3(1.,.8,.35)*3.':'vec3(1.,.62,.2)'},a*vA);}`});
}

/* ---------- textures, materials, meshes ---------- */
const loader=new THREE.TextureLoader();let veinTex;
const [barkTex,barkN,barkORM,vTex,petalTex,cardTex]=await Promise.all([TEX.bark,TEX.barkN,TEX.barkORM,TEX.vein,TEX.petal,TEX.card].map(u=>loader.loadAsync(u)));
veinTex=vTex;barkTex.colorSpace=petalTex.colorSpace=cardTex.colorSpace=THREE.SRGBColorSpace;
for(const t of [barkTex,barkN,barkORM,veinTex,petalTex]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy())}

const woodMat=new THREE.MeshStandardMaterial({map:barkTex,normalMap:barkN,normalScale:new THREE.Vector2(1.5,1.5),aoMap:barkORM,aoMapIntensity:.75,roughnessMap:barkORM,roughness:1,color:0xfff0e2});
barkORM.channel=0;woodShader(woodMat,false);
const veinMat=new THREE.MeshStandardMaterial({color:0x3e2618,roughness:.85});woodShader(veinMat,true);
const woodMesh=new THREE.Mesh(wood.geometry(),woodMat),veinMesh=new THREE.Mesh(veins.geometry(),veinMat);
woodMesh.frustumCulled=veinMesh.frustumCulled=false;tree.add(woodMesh,veinMesh);

/* Flower clusters: a hanging dome of blooms at every final tip, lighter on top and deeper inside */
const flowers=[],cards=[];
const palette=()=>new THREE.Color().setHSL(rr(.73,.79),rr(.55,.75),rr(.66,.8));
let CUR_B=0,CUR_P=-1;const PUFFS=[];function pushBloom(list,p,normal,size,birth,shade,inner){
  const q=new THREE.Quaternion().setFromUnitVectors(zAxis,normal).multiply(new THREE.Quaternion().setFromAxisAngle(zAxis,rnd()*6.283));
  list.push({p,q,size,birth,inner,drift:rnd(),bi:CUR_B,pid:CUR_P,col:palette().multiplyScalar(shade)});
}
/* ---- Bloom layout in three layers, read from the fixed camera (looking down -z) ----
   first order  (trunk + gen 1-2 limbs): bare wood, with a few clean openings
   second order (gen 3-4 branches): clusters along the branch on short stalks, wood showing between them
   third order  (gen 5-6 twigs): bare for most of their length, a full puff at each tip */
const MAINSEG=[];
branches.forEach(b=>{if(b.gen>2)return;for(let j=1;j<b.pts.length;j++){const braidPart=b.braid&&j<=BRAID_N;MAINSEG.push({a:b.pts[j-1],b:b.pts[j],r:b.radii[j]+(braidPart?.5:0)})}});
function segD(p,sg,xy){const ax=sg.a.x,ay=sg.a.y,az=xy?0:sg.a.z,bx=sg.b.x-ax,by=sg.b.y-ay,bz=xy?0:sg.b.z-az,px=p.x-ax,py=p.y-ay,pz=xy?0:p.z-az;
  const t=Math.max(0,Math.min(1,(px*bx+py*by+pz*bz)/Math.max(1e-9,bx*bx+by*by+bz*bz)));const dx=px-bx*t,dy=py-by*t,dz=pz-bz*t;return Math.sqrt(dx*dx+dy*dy+dz*dz)}
/* 3-5 openings in the lower and middle crown where main limbs read as clean wood */
const OPEN=[];
{const cands=MAINSEG.filter(sg=>sg.b.y>7&&sg.b.y<11.6&&sg.r<.5).map(sg=>sg.b).sort(()=>rnd()-.5);
 for(const c of cands){if(OPEN.length>=2)break;if(Math.hypot(c.x-8.7,c.y-8.8)>3.4&&OPEN.every(o=>Math.hypot(o.x-c.x,o.y-c.y)>2.2))OPEN.push(c)}}
const OPENSEG=MAINSEG.filter(sg=>OPEN.some(o=>Math.hypot(sg.b.x-o.x,sg.b.y-o.y)<1.1));
function blocked(p,pad){
  for(const sg of MAINSEG){if(Math.abs(sg.b.y-p.y)>2||Math.abs(sg.b.x-p.x)>2)continue;if(segD(p,sg,false)<1.5*sg.r+pad)return true}
  for(const sg of OPENSEG){if(segD(p,sg,true)<3*sg.r+.12+pad)return true}
  return false}
const clumpNoise=p=>.95+.35*Math.sin(p.x*1.3+Math.sin(p.y*1.7))*Math.cos(p.y*1.1+p.z*.9);
const stalks=new TubeBuilder();
/* one puff: flowers bunched around c, opening away from the branch (dir) and upward */
function puff(c,dir,R,count,birth,b,root){
  CUR_P=PUFFS.length;PUFFS.push({c:c.clone(),n:0});
  const inner=clamp01(1-Math.sqrt(envelope(c)));let placed=0;
  for(let i=0;i<count*1.6&&placed<count;i++){
    const n=V(rr(-1,1),rr(-1,1),rr(-1,1)).normalize().addScaledVector(dir,.7).add(V(0,.25,0)).normalize();
    const p=c.clone().addScaledVector(n,R*Math.cbrt(rr(.08,1)));if(blocked(p,.08))continue;
    const dn=clamp01(1-p.distanceTo(root)/(R*2.2)),near=rnd()<.2+.4*dn?Math.min(1,lerp(.6,1,dn)+rnd()*.15):Math.pow(clamp01(1-p.distanceTo(root)/(R*1.4)),1.5),shade=(.82+.3*(n.y*.5+.5))*(1-.18*inner)*(n.z<-.2?.85:1);
    CUR_B=b.index;pushBloom(flowers,p,n.clone().add(V(0,.2,.45)).normalize(),rr(.2,.28),birth+rr(0,.03),shade,near);placed++}
  PUFFS[CUR_P].n=placed;CUR_P=-1;return placed}
const PENDING_STALKS=[];
function stalk(from,to,b,birth){PENDING_STALKS.push({from,to,b,birth,pid:PUFFS.length-1})}
function buildStalk(from,to,b,birth){const pts=[],radii=[];for(let i=0;i<=3;i++){pts.push(from.clone().lerp(to,i/3));radii.push(lerp(.022,.012,i/3))}
  stalks.add(pts,radii,{bi:b.index,sides:4,start:birth-.035,end:birth-.005,taper:.02,thickEnd:birth,braid:false,twig:true})}
/* second order: alternating upper / outer clusters along the branch, sparse at the base, full toward the end */
for(const b of branches.filter(b=>b.gen===3||b.gen===4)){
  let d=.15*b.L,k=0;
  while(d<b.L*.97){
    const u=d/b.L,Rc=rr(.2,.27)*(.85+.3*u),sm=sampleAt(b,u),t=sm.t;
    if(rnd()<lerp(.7,1,u)*Math.min(1,clumpNoise(sm.p)+.2)){
      const up=V(0,1,0).addScaledVector(t,-t.y).normalize(),outw=sm.p.clone().sub(V(5.6,10.6,0));outw.addScaledVector(t,-outw.dot(t));outw.normalize();
      const side=(k%2?up.clone().lerp(outw,.3):outw.clone().lerp(up,.35));side.z=Math.min(side.z,.12);if(side.y<.05)side.y=.05;side.normalize();
      const stalkLen=Rc*rr(.5,1),base=sm.p.clone().addScaledVector(side,sm.r*.6),tipS=sm.p.clone().addScaledVector(side,sm.r+stalkLen),c=tipS.clone().addScaledVector(side,Rc*.55);
      if(!blocked(c,Rc*.6)){const birth=Math.min(.7,Math.max(b.end+.04,.6)+rr(0,.06));
        if(puff(c,side,Rc,Math.round(rr(18,24)*clumpNoise(c)),birth,b,tipS)>3){stalk(base,tipS,b,birth);k++}}
    }
    d+=2*Rc*(1+lerp(1.1,.55,u));
  }
}
/* junction spurs: a few short stalks with blossom clumps off the main limbs, so the fork area isn't bald */
for(const b of branches.filter(b=>b.gen<=3)){
  const a0=b.braid?b.braidFrac+.02:.05,a1=b.braid?1:(b.gen===3?.6:.85);
  for(let d=a0*b.L;d<a1*b.L;d+=rr(.34,.52)){
    const a=d/b.L,sm=sampleAt(b,a);const nearJ=Math.hypot(sm.p.x-8.4,sm.p.y-9.2)<3.4;if(sm.p.y<7||sm.p.y>12.5||(!nearJ&&rnd()>(b.gen===3?.5:.9)))continue;
    const t=sm.t,up=V(0,1,0).addScaledVector(t,-t.y).normalize(),side=up.clone().addScaledVector(V(rr(-1,1),rr(-.3,.5),rr(-.6,.2)),.7);side.addScaledVector(t,-side.dot(t));side.z=Math.min(side.z,.15);side.normalize();
    const Rc=rr(.22,.3),tipS=sm.p.clone().addScaledVector(side,sm.r+.03),c=tipS.clone().addScaledVector(side,Rc*.7);
    if(OPENSEG.some(sg=>segD(c,sg,true)<3*sg.r+.12))continue;
    const birth=rr(.6,.68);let placed=0;CUR_P=PUFFS.length;PUFFS.push({c:c.clone(),n:0,fill:true});
    for(let i=0;i<30&&placed<Math.round(rr(13,18));i++){const n=V(rr(-1,1),rr(-1,1),rr(-1,1)).normalize().addScaledVector(side,.7).add(V(0,.25,0)).normalize();
      const p=c.clone().addScaledVector(n,Rc*Math.cbrt(rr(.08,1)));if(segD(p,{a:sampleAt(b,Math.max(0,a-.05)).p,b:sampleAt(b,Math.min(1,a+.05)).p,r:0},false)<sm.r*1.15)continue;
      CUR_B=b.index;pushBloom(flowers,p,n.clone().add(V(0,.2,.45)).normalize(),rr(.18,.25),birth+rr(0,.03),.95,clamp01(1-p.distanceTo(tipS)/(Rc*1.6)));placed++}
    PUFFS[CUR_P].n=placed;CUR_P=-1;
  }
}
/* third order: bare twigs, one full puff at every tip, at most one small side cluster in the last quarter */
for(const b of branches.filter(b=>b.gen>=5)){
  const tipT=b.start+(b.end-b.start)*inverse(b,.9);
  if(b.gen===6){const tip=b.pts.at(-1),dir=tip.clone().sub(b.pts.at(-2)).normalize(),Rt=rr(.34,.44)*clumpNoise(tip);
    puff(tip.clone().addScaledVector(dir,Rt*1.05),dir,Rt,Math.round(rr(30,38)*Math.min(1.15,clumpNoise(tip))),tipT+rr(.01,.03),b,tip)}
  if(rnd()<.85){const u=rr(.76,.95),sm=sampleAt(b,u);const side=sm.t.clone().cross(V(0,0,1)).normalize();if(side.y<0)side.negate();side.add(V(0,.3,0)).normalize();
    const tipS=sm.p.clone().addScaledVector(side,sm.r+.07),c=tipS.clone().addScaledVector(side,.09);
    if(!blocked(c,.15)){const birth=Math.max(tipT,.6)+rr(0,.05);if(puff(c,side,.2,Math.round(rr(10,13)),birth,b,tipS)>2)stalk(sm.p,tipS,b,birth)}}
}
function bloomMesh(list,geometry,material){
  const g=geometry.clone(),data=new Float32Array(list.length*4),mesh=new THREE.InstancedMesh(g,material,list.length),m=new THREE.Matrix4();
  list.forEach((f,i)=>{m.compose(f.p,f.q,V(f.size,f.size,f.size));mesh.setMatrixAt(i,m);mesh.setColorAt(i,f.col);data.set([f.birth,f.birth,f.inner,f.drift],i*4)});
  g.setAttribute('aData',new THREE.InstancedBufferAttribute(data,4));g.setAttribute('aBranch',new THREE.InstancedBufferAttribute(new Float32Array(list.map(f=>f.bi||0)),1));mesh.frustumCulled=false;return mesh;
}
const flowerMat=new THREE.MeshStandardMaterial({map:petalTex,side:THREE.DoubleSide,roughness:.55,color:0xffffff});bloomShader(flowerMat,'flower');
const cardMat=new THREE.MeshStandardMaterial({map:cardTex,side:THREE.DoubleSide,roughness:.8,alphaTest:.5,color:0xffffff});bloomShader(cardMat,'card');
/* ---- Break the crown into separate masses ----
   Cluster the puffs into a handful of lobes (seen from the camera), clear a band of sky along the
   borders between lobes, roughen each lobe's outline, and give each lobe its own size, density and light. */
const LOBES=(()=>{
  const pts=PUFFS.map((p,i)=>({x:p.c.x,y:p.c.y,w:p.n,i})).filter(p=>p.w>0);
  const K=7,cen=[];const mid={x:pts.reduce((a,p)=>a+p.x,0)/pts.length,y:pts.reduce((a,p)=>a+p.y,0)/pts.length};
  let far=pts.reduce((a,p)=>Math.hypot(p.x-mid.x,p.y-mid.y)>Math.hypot(a.x-mid.x,a.y-mid.y)?p:a);cen.push({x:far.x,y:far.y});
  while(cen.length<K){let best=null,bd=-1;for(const p of pts){const d=Math.min(...cen.map(c=>Math.hypot(p.x-c.x,p.y-c.y)));if(d>bd){bd=d;best=p}}cen.push({x:best.x,y:best.y})}
  for(let it=0;it<14;it++){const acc=cen.map(()=>({x:0,y:0,w:0}));
    for(const p of pts){let k=0,bd=1e9;cen.forEach((c,j)=>{const d=Math.hypot(p.x-c.x,p.y-c.y);if(d<bd){bd=d;k=j}});acc[k].x+=p.x*p.w;acc[k].y+=p.y*p.w;acc[k].w+=p.w}
    acc.forEach((a,j)=>{if(a.w>0){cen[j].x=a.x/a.w;cen[j].y=a.y/a.w}})}
  const L=cen.map(c=>({x:c.x,y:c.y,ds:[],dens:rr(.72,1),shade:rr(.9,1.08),ph:rr(0,6.28)}));
  pts.forEach(p=>{const d=L.map(l=>Math.hypot(p.x-l.x,p.y-l.y));const k=d.indexOf(Math.min(...d));L[k].ds.push(d[k])});
  L.forEach(l=>{l.ds.sort((a,b)=>a-b);l.R=l.ds.length?l.ds[Math.floor(l.ds.length*.88)]:1});
  return L})();
function lobeOf(p){let k=0,d1=1e9,d2=1e9;LOBES.forEach((l,j)=>{const d=Math.hypot(p.x-l.x,p.y-l.y);if(d<d1){d2=d1;d1=d;k=j}else if(d<d2)d2=d});return {k,d1,d2}}
const GAP=.62;
function inGap(p){const {k,d1,d2}=lobeOf(p),l=LOBES[k],a=Math.atan2(p.y-l.y,p.x-l.x);
  const rim=l.R*(.88+.18*Math.sin(a*3+l.ph)+.1*Math.sin(a*5+l.ph*2));
  return (d2-d1)<GAP||d1>rim}
{const keepPuff=PUFFS.map((pf,i)=>{if(!pf.n)return false;if(pf.fill||!inGap(pf.c))return true;
   const {k,d1}=lobeOf(pf.c),l=LOBES[k];
   /* a few stray tufts at the edges and small clumps hanging below a lobe */
   if(pf.c.y<l.y-l.R*.7&&d1<l.R*1.35&&rnd()<.35)return true;
   return rnd()<.07});
 const kept=flowers.filter(f=>{if(f.pid<0)return true;if(!keepPuff[f.pid])return false;
   const {k}=lobeOf(f.p),l=LOBES[k];if(rnd()>l.dens)return false;
   /* each lobe lit from above: brighter crown, darker underside, so masses separate */
   const dy=clamp01(((f.p.y-l.y)/(l.R||1))*.5+.5);f.col.multiplyScalar(l.shade*(.78+.34*dy));return true});
 flowers.length=0;kept.forEach(f=>flowers.push(f));}
/* Mature flush: the outer twigs push a little further out and open a last ring of blooms,
   so the crown grows from its edges during the mature step */
{const first=flowers.length;
 for(const b of branches.filter(b=>b.gen===6)){
   const tip=b.pts.at(-1),dir=tip.clone().sub(b.pts.at(-2)).normalize(),{k,d1,d2}=lobeOf(tip),l=LOBES[k];
   if(d1<l.R*.55||(d2-d1)<GAP*.9)continue;
   const rad=V(tip.x-l.x,tip.y-l.y,0).normalize(),out=dir.clone().addScaledVector(rad,.9).normalize();out.z*=.5;out.normalize();
   const ext=rr(.35,.6),Rp=rr(.28,.38),end=tip.clone().addScaledVector(out,ext),c=end.clone().addScaledVector(out,Rp*.6);
   if(blocked(c,Rp*.5))continue;
   const p2=lobeOf(c);if((p2.d2-p2.d1)<GAP*.8)continue;
   const birth=rr(.652,.7);
   if(puff(c,out,Rp,Math.round(rr(16,22)),birth,b,end)>4)stalk(tip,end,b,birth);
 }
 for(let i=first;i<flowers.length;i++){const f=flowers[i],{k}=lobeOf(f.p),l=LOBES[k],dy=clamp01(((f.p.y-l.y)/(l.R||1))*.5+.5);f.col.multiplyScalar(l.shade*(.8+.32*dy))}}
tree.add(bloomMesh(flowers,flowerGeometry(),flowerMat));
{const cnt=new Map();flowers.forEach(f=>cnt.set(f.pid,(cnt.get(f.pid)||0)+1));PENDING_STALKS.forEach(st=>{const pf=PUFFS[st.pid];if((cnt.get(st.pid)||0)>=6&&pf){const end=st.to.clone().lerp(pf.c,.7);buildStalk(st.from,end,st.b,st.birth)}})}
const stalkMesh=new THREE.Mesh(stalks.geometry(),woodMat);stalkMesh.frustumCulled=false;tree.add(stalkMesh);

/* Leaves: one ruffled purple leaf rides every growing tip, then folds away as the tip divides */
const LEAF=[0,.62,.55,.5,.44,.38,.33].map(v=>v*1.15);let PUMP=0,MALL=1,TWON=1;
/* twirl: new growth above the shoot height is braided; the shoot itself stays a single stem */
const H0=(()=>{const gs=smooth(.05/G1_END);return spine.getPointAt(Math.min(1,gs/BRAID_FRAC)).y})();
const mergeAt=(y,ay,a,bf)=>Math.max(MALL,TWON*smooth((y-H0)/.6))*lerp(lerp(.62,1,Math.sqrt(ay)),1,smooth((a-bf*.88)/(bf*.12)));
const CC=V(5.6,10.6,0);
const leaves=[];
/* nine leaves in the twirl's spiral: three tip leaves plus six along the new twisted growth */
{const gS=smooth(.05/G1_END),gT=smooth(.071/G1_END),firstKid=Math.min(...branches.filter(b=>b.gen===2).map(b=>b.start));
 for(let k=0;k<6;k++){const b=branches[k%3];leaves.push({b,spiral:true,at:lerp(gS,gT,(k+1)/7),foldAt:.07+k*.002,size:LEAF[1]*.8,roll:rr(-.5,.5),tilt:rr(.9,1.15)})}}
branches.forEach(b=>{
  let foldAt=b.kids.length?Math.min(...b.kids.map(k=>k.start)):b.start+(b.end-b.start)*inverse(b,.9)+.02;
  if(b.gen>=5)foldAt=Math.max(foldAt,.635+rr(0,.02));
  const tip=b.pts.at(-1),outer=clamp01((Math.sqrt(envelope(tip))-.45)/.5),outDir=tip.clone().sub(CC).setZ(tip.z*1.5).normalize();
  const base=b.gen===1?2:b.gen<=3?4:b.gen===4?4:8,per=b.gen===1?2:Math.max(1,Math.round(base*lerp(.6,1.4,outer)));
  const seg=2/Math.max(2,b.pts.length-1);
  for(let j=0;j<per;j++){const az=b.azimuth+j*2.39996,rand=V(Math.cos(az),rr(-.2,.4),Math.sin(az)).normalize();
    const back=j===0?0:rr(0,seg),lp0=sampleAt(b,1-back).p,keep=b.gen>=5&&j%4===1&&back<=.25&&!blocked(lp0,.1)&&!inGap(lp0);
    leaves.push({b,foldAt:keep?9:foldAt,back,size:LEAF[b.gen]*rr(.82,1.08)*(j?.9:1),roll:rr(-.6,.6),tilt:b.braid?rr(.85,1.0):rr(.45,.95),
      side:b.braid?V(Math.cos(b.azimuth),.05,Math.sin(b.azimuth)*.35).normalize():rand.lerp(outDir,.55).normalize()});}
});
const leafMat=new THREE.MeshStandardMaterial({map:petalTex,side:THREE.DoubleSide,roughness:.5,color:0xffffff});bloomShader(leafMat,'leaf');
const leafMesh=bloomMesh(leaves.map(l=>({p:V(),q:new THREE.Quaternion(),size:1,birth:-1,inner:0,drift:1,col:new THREE.Color().setHSL(rr(.74,.79),.62,.55)})),leafGeometry(),leafMat);
tree.add(leafMesh);
/* Subtle fluff: small, muted grey-violet leaflets along second- and third-order wood so it isn't bare */
{const fluff=[],Yv=V(0,1,0);
 for(const b of branches.filter(b=>b.gen>=3)){
   for(let d=b.L*.15;d<b.L*.95;d+=rr(.1,.16)){
     if(rnd()>.6)continue;
     const a=d/b.L,sm=sampleAt(b,a);
     const side=sm.t.clone().cross(V(rr(-1,1),rr(-1,1),rr(-1,1))).normalize();if(side.y<-.5)side.y*=-.5;side.normalize();
     const p=sm.p.clone().addScaledVector(side,sm.r*1.1);
     if(OPENSEG.some(sg=>segD(p,sg,true)<3*sg.r+.12))continue;
     const dir=side.clone().multiplyScalar(.75).addScaledVector(sm.t,.55).normalize();
     const q=new THREE.Quaternion().setFromUnitVectors(Yv,dir).multiply(new THREE.Quaternion().setFromAxisAngle(Yv,rr(0,6.28)));
     const birth=Math.max(b.start+(b.end-b.start)*inverse(b,a)+.02,.5)+rr(0,.04);
     fluff.push({p,q,size:rr(.15,.24),birth,inner:0,drift:rnd(),bi:b.index,col:new THREE.Color().setHSL(rr(.72,.78),rr(.14,.26),rr(.34,.46))});
   }
 }
 tree.add(bloomMesh(fluff,leafGeometry(),leafMat));}
const Y=V(0,1,0),m4=new THREE.Matrix4(),tmpQ=new THREE.Quaternion(),tmpQ2=new THREE.Quaternion();
let T_NOW=0;
function spineSample(b,a){if(!b.spineB)b.spineB={pts:b.spinePts,radii:b.radii,s:arcLengths(b.spinePts),L:arcLengths(b.spinePts).at(-1)};return sampleAt(b.spineB,a).p}
function updateLeaves(t,S){
  let any=false;
  leaves.forEach((l,i)=>{
    const b=l.b,g=frontAt(b,t);
    const grow=l.spiral?smooth((g-l.at)/.02):smooth((t-b.start)/.025),fold=smooth((t-l.foldAt)/.03),sz=l.size*grow*(1-fold);
    if(sz<1e-3||t<=b.start||(l.spiral&&g<l.at)){m4.makeScale(1e-4,1e-4,1e-4);m4.setPosition(0,-50,0);leafMesh.setMatrixAt(i,m4);return}
    any=true;
    const a=l.spiral?l.at:Math.max(.02,g-l.back);let at=sampleAt(b,a);
    if(b.spinePts){const sp=spineSample(b,a),ay=smooth(AGE*1.7-at.p.y/17*.7),M=mergeAt(sp.y,ay,a,b.braidFrac);if(M<1)at.p.lerp(sp,1-M)}
    let side=l.side;
    if(l.spiral){const sp=spineSample(b,a);side=at.p.clone().sub(sp);side.y=0;if(side.lengthSq()<1e-6)side=V(Math.cos(b.azimuth+a*20),0,Math.sin(b.azimuth+a*20));side.normalize()}
    const axis=at.t.clone().cross(side);if(axis.lengthSq()<1e-4)axis.set(1,0,0);axis.normalize();
    const dir=at.t.clone().applyAxisAngle(axis,l.tilt+fold*1.3+(b.gen===1&&!l.spiral?.18*smooth(T_NOW/.06):0));
    tmpQ.setFromUnitVectors(Y,dir);tmpQ2.setFromAxisAngle(Y,l.roll);tmpQ.multiply(tmpQ2);
    let lp=at.p,boost=1;
    if(b.gen===1&&!l.spiral){const hs=V(l.side.x,0,l.side.z).normalize();lp=at.p.clone().addScaledVector(hs,.07*smooth(T_NOW/.06));boost=(1+.15*smooth(T_NOW/.06))*(1+.3*smooth((PUMP-.8)/.2))}
    const ls=Math.max(1e-4,sz*boost);m4.compose(lp,tmpQ,V(ls,ls,ls));leafMesh.setMatrixAt(i,m4);
  });
  leafMesh.instanceMatrix.needsUpdate=true;leafMesh.visible=any;
}

function pointCloud(list,kind){const g=new THREE.BufferGeometry(),pos=[],rn=[];list.forEach(p=>{pos.push(p.x,p.y,p.z);rn.push(rnd(),rnd())});
  g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aRnd',new THREE.Float32BufferAttribute(rn,2));
  const pts=new THREE.Points(g,pointsMaterial(kind));pts.frustumCulled=false;tree.add(pts);return pts}
const sparkPts=[];
for(let i=0;i<220;i++){const s=rnd()*.95,k=i%NS;sparkPts.push(braidPoint(s,thetaAt(s,k)+Math.PI/NS+rr(-.12,.12),orbitAt(s)*(1.12-.22*s)))}
branches.filter(b=>b.gen<=3).forEach(b=>{for(let i=0;i<(b.gen===1?24:b.gen===2?5:1);i++){const s=sampleAt(b,rr(b.braid?b.braidFrac:0,.95));sparkPts.push(s.p.add(V(rr(-1,1),rr(-1,1),rr(-1,1)).normalize().multiplyScalar(s.r*1.05)))}});
const sparks=pointCloud(sparkPts,'spark');
const sandPts=[];
branches.forEach(b=>{const n=Math.max(2,Math.ceil(b.L*b.radii[0]*130));for(let i=0;i<n;i++){const s=sampleAt(b,rnd()),r=V(rr(-1,1),rr(-1,1),rr(-1,1)).normalize();sandPts.push(s.p.addScaledVector(r,s.r*(b.braid?1.05:1)))}});
const sandMat=new THREE.ShaderMaterial({uniforms:{...U,uPx:{value:100}},transparent:true,depthWrite:false,
  vertexShader:`attribute vec2 aRnd;varying float vA;varying vec3 vCol;uniform float uPx;${SWAY}
void main(){vec3 p=position;float relSec=4.4+3.*clamp((18.-p.y)/20.,0.,1.)+aRnd.x*.25;
 float mass=mix(.8,2.2,aRnd.y),life=mix(1.8,3.4,fract(aRnd.x*31.7)),alpha,tau;
 vec3 wd=windMotion(p,relSec,mass,aRnd.x,life,alpha,tau);
 vA=step(.0001,tau)*alpha;p+=wd;
 vCol=mix(vec3(.2,.13,.09),vec3(.4,.28,.19),fract(aRnd.y*7.3))*(.85+.3*fract(aRnd.x*13.1));
 vec4 mv=modelViewMatrix*vec4(p+sway(position),1.);gl_Position=projectionMatrix*mv;gl_PointSize=(.035+aRnd.y*.05)*uPx;}`,
  fragmentShader:`varying float vA;varying vec3 vCol;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(vCol,vA*smoothstep(.5,.2,d));}`});
const sandGeo=new THREE.BufferGeometry(),sp=[],sr=[];sandPts.forEach(p=>{sp.push(p.x,p.y,p.z);sr.push(rnd(),rnd())});
sandGeo.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));sandGeo.setAttribute('aRnd',new THREE.Float32BufferAttribute(sr,2));
const sand=new THREE.Points(sandGeo,sandMat);sand.frustumCulled=false;tree.add(sand);
const lightPts=[];branches.filter(b=>b.gen>=2&&b.gen<=4).forEach(b=>{if(b.gen<4||rnd()<.35)lightPts.push(sampleAt(b,rr(.3,1)).p.add(V(0,0,-.4)))});
const canopyLight=pointCloud(lightPts,'light');

/* ---------- post: selective bloom ---------- */
const bloomComposer=new EffectComposer(renderer);bloomComposer.renderToScreen=false;
bloomComposer.addPass(new RenderPass(scene,camera));
const bloomPass=new UnrealBloomPass(new THREE.Vector2(512,512),.6,.45,.12);bloomComposer.addPass(bloomPass);
const finalComposer=new EffectComposer(renderer,new THREE.WebGLRenderTarget(4,4,{type:THREE.HalfFloatType,samples:4}));finalComposer.addPass(new RenderPass(scene,camera));
finalComposer.addPass(new ShaderPass(new THREE.ShaderMaterial({uniforms:{tDiffuse:{value:null},bloomTexture:{value:bloomComposer.renderTarget2.texture}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform sampler2D tDiffuse,bloomTexture;varying vec2 vUv;void main(){vec4 b=texture2D(tDiffuse,vUv);vec3 bl=texture2D(bloomTexture,vUv).rgb;if(any(isnan(bl))||any(isinf(bl)))bl=vec3(0.);gl_FragColor=vec4(b.rgb+bl,clamp(b.a+max(bl.r,max(bl.g,bl.b)),0.,1.));}'}),'tDiffuse'));
finalComposer.addPass(new OutputPass());
const black=new THREE.Color(0);

/* ---------- framing, timeline, interaction ---------- */
let W=1,H=1,ready=false;
function resize(){const r=canvas.getBoundingClientRect();W=Math.max(1,r.width);H=Math.max(1,r.height);renderer.setSize(W,H,false);bloomComposer.setSize(W,H);finalComposer.setSize(W,H);if(ready)render()}
{const ro=new ResizeObserver(resize);ro.observe(canvas);CLEANUP.push(()=>ro.disconnect())}resize();

const STAGES=[
 ['Sprout',0,'A single young stem opens three purple leaves.'],
 ['Shoot',.06,'The stem grows taller, still one slender branch.'],
 ['Twirl',.1,'A second stem spirals up around the first, which thickens from the root up.'],
 ['Sapling',.16,'The braided stem climbs upward, carrying its first leaves at the tip.'],
 ['Growing',.3,'Girth climbs from the root, then the stem splits into limbs and nine new shoots.'],
 ['Branching out',.46,'The thickening rises again, then the tips divide twice: eighty-one shoots.'],
 ['Fine branching',.62,'Hundreds of fine twigs form, crowded with leaves.'],
 ['Mature tree',.72,'The outer twigs reach further and a last flush of blooms widens the crown.'],
 ['Gold bloom',.86,'Light climbs from the roots through the grooves into the flowers.'],
 ['Wind study',1,'Wind from the top right swirls the blossoms away, then the tree dissolves from the top down like sand.']];
const agesEl=els.ages;agesEl.innerHTML='';
const scrub=els.scrub,playBtn=els.play,stageEl=els.stage,capEl=els.caption,timeEl=els.time;
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const HOLD=1.6;
let t=0,stage=0,anim=null,autoplay=false,holdLeft=HOLD,yaw=0,targetYaw=0,drag=null,last=performance.now(),clock=0;
STAGES.forEach(([n],i)=>{const b=document.createElement('button');b.textContent=n;b.onclick=()=>goTo(i,true);agesEl.append(b)});
function goTo(i,user){
  i=Math.max(0,Math.min(STAGES.length-1,i));if(user)autoplay=false;
  if(i!==stage&&!reduce.matches){const from=t,to=STAGES[i][1];anim={from,to,start:performance.now(),dur:i===STAGES.length-1?8000:Math.min(3000,Math.max(1500,(to-from)*20000))};stage=i}
  else{anim=null;stage=i;t=STAGES[i][1]}
  holdLeft=HOLD;sync();if(ready)render();
}
function sync(){
  const st=STAGES[stage];
  if(stageEl.textContent!==st[0]){stageEl.textContent=st[0];capEl.textContent=st[2]}
  [...agesEl.children].forEach((b,i)=>b.setAttribute('aria-current',i===stage));
  scrub.value=t;scrub.style.setProperty('--p',(t*100)+'%');
  playBtn.textContent=autoplay?'Pause':(stage>=STAGES.length-1?'Replay':'Play steps');
  nextBtn.disabled=stage>=STAGES.length-1||!!anim;
  timeEl.textContent=`Step ${stage+1} of ${STAGES.length}`;
}
const nextBtn=els.next;
scrub.oninput=()=>{autoplay=false;anim=null;t=+scrub.value;let i=0;STAGES.forEach((st,k)=>{if(t>=st[1]-1e-6)i=k});stage=i;sync();if(ready)render()};
playBtn.onclick=()=>{if(stage>=STAGES.length-1&&!anim){goTo(0);autoplay=true}else autoplay=!autoplay;holdLeft=HOLD*.5;sync()};
nextBtn.onclick=()=>{autoplay=false;goTo(stage+1)};
els.replay.onclick=()=>{goTo(0);autoplay=!reduce.matches;sync()};
/* Final framing: bounding box of the full-grown tree including leaves and flowers, fitted once with ~10% margin */
const FIT=(()=>{const bb=new THREE.Box3();
  branches.forEach(b=>b.pts.forEach((p,j)=>{bb.expandByPoint(p.clone().addScalar(b.radii[j]));bb.expandByPoint(p.clone().addScalar(-b.radii[j]))}));
  flowers.forEach(f=>{bb.expandByPoint(f.p.clone().addScalar(f.size));bb.expandByPoint(f.p.clone().addScalar(-f.size))});
  leaves.forEach(l=>{const p=sampleAt(l.b,l.spiral?l.at:Math.max(.02,1-(l.back||0))).p;bb.expandByPoint(p.clone().addScalar(l.size));bb.expandByPoint(p.clone().addScalar(-l.size))});
  bb.min.y=Math.max(bb.min.y,-TRUNK_EXT-.2);
  const c=bb.getCenter(V()),sz=bb.getSize(V());return {c,w:sz.x,h:sz.y}})();
let FIT_H=null;
camera.position.set(FIT.c.x,FIT.c.y,FIT.c.z+40);
const controls=new OrbitControls(camera,canvas);
controls.target.copy(FIT.c);controls.enableZoom=false;controls.enablePan=false;controls.enableDamping=true;controls.dampingFactor=.08;
controls.minPolarAngle=controls.maxPolarAngle=Math.PI/2;controls.minAzimuthAngle=-Math.PI/12;controls.maxAzimuthAngle=Math.PI/12;controls.update();
canvas.tabIndex=0;canvas.addEventListener('keydown',e=>{const d=e.key==='ArrowLeft'?-.15:e.key==='ArrowRight'?.15:0;if(!d)return;
  const off=camera.position.clone().sub(controls.target).applyAxisAngle(V(0,1,0),d);camera.position.copy(controls.target).add(off);controls.update()});
{const onKey=e=>{if((e.key===' '||e.key==='Enter')&&(e.target===els.root||e.target===canvas)){e.preventDefault();nextBtn.click()}};els.root.addEventListener('keydown',onKey);CLEANUP.push(()=>els.root.removeEventListener('keydown',onKey))};

function frame(now){
  if(DISPOSED)return;
  const raw=(now-last)/1000,dt=Math.min(.05,raw);last=now;
  if(!document.hidden){
    if(anim){const p=clamp01((now-anim.start)/anim.dur),e=1-Math.pow(1-p,3)*(1-.0*p);t=lerp(anim.from,anim.to,e);if(p>=1){anim=null;t=STAGES[stage][1];holdLeft=HOLD;if(stage<=6)settleAt=now}sync()}
    else if(autoplay){holdLeft-=Math.min(raw,.5);if(holdLeft<=0){if(stage<STAGES.length-1)goTo(stage+1);else{autoplay=false;sync()}}}
    camDt=dt;if(settleAt>=0){const tau=(now-settleAt)/1000;U.uSettle.value=reduce.matches?0:Math.exp(-tau*2.6)*Math.sin(tau*6.5);if(tau>3){settleAt=-1;U.uSettle.value=0}}
    if(!reduce.matches)clock+=dt;
    controls.update();render();
  }
  RAF=requestAnimationFrame(frame);
}
/* Story time → growth time: hold the sapling, then let divisions continue */
const KEYS=[[0,.036],[.06,.05],[.1,.071],[.16,.1],[.2,.1],[.3,.235],[.35,.235],[.46,.43],[.5,.43],[.62,.645],[.72,.72]];
const AGEK=[[0,0],[.06,.05],[.1,.1],[.16,.16],[.2,.24],[.3,.3],[.35,.42],[.46,.48],[.5,.62],[.62,.72],[.72,.86],[.86,1]];
const GROWK=[[0,0],[.237,0],[.3,1/3],[.388,1/3],[.46,2/3],[.548,2/3],[.62,1],[.72,1]];
const SKEYS=[[0,.3],[.06,.33],[.12,.38],[.28,.5],[.44,.66],[.62,.86],[.72,1]];
function keyed(K,t){if(t>=K.at(-1)[0])return K.at(-1)[1];for(let i=1;i<K.length;i++){const [t1,v1]=K[i],[t0,v0]=K[i-1];if(t<=t1)return lerp(v0,v1,(t-t0)/(t1-t0))}return K[0][1]}
function growthTime(t){if(t>=.72)return t;for(let i=1;i<KEYS.length;i++){const [t1,u1]=KEYS[i],[t0,u0]=KEYS[i-1];if(t<=t1)return lerp(u0,u1,(t-t0)/(t1-t0))}return t}
let camDt=0,settleAt=-1,CAM=null;
/* Final framing (full-grown tree) and the old sprout close-up, computed once per viewport shape */
function computeFraming(){
  const aspect=W/H,fullH=Math.max(16.7,9.9/aspect);
  const fin={h:fullH,right:9.55,cy:-.15+fullH/2};
  const closeH=5,close={h:closeH,right:9.55-.9*(1-closeH/fullH)};
  const startH=lerp(fin.h,close.h,.2),startRight=lerp(fin.right,close.right,.2);
  const start={h:startH,right:startRight,cy:-.13*startH+startH/2};   /* trunk base ~13% above the bottom edge */
  CAM={fin,start};
}
const growthValue=t=>smooth(clamp01(t/.72));
function gustJS(s){const w=s/8,e=x=>Math.exp(-x*x);return .22*smooth(w/.15)+e((w-.36)/.11)+.45*e((w-.64)/.09)+.12*smooth((w-.72)/.28)}
const DEBUG={on:false,layer:null,
  toggle(v){if(!false)return;this.on=v??!this.on;if(this.on){this.build();console.table(branches.filter(b=>b.parent).map(b=>({id:b.index,parent:b.parent.index,attach:b.attach.toArray().map(v=>+v.toFixed(2)).join(', '),parentR:+b.parentR.toFixed(3),childR:+(b.radii[2]??b.radii[0]).toFixed(3),lead:b.isLead})))}else if(this.layer){this.layer.remove();this.layer=null}},
  build(){this.layer?.remove();const L=document.createElement('div');L.style.cssText='position:absolute;inset:0;pointer-events:none;font:9px/1 monospace;color:#ffcf5a';canvas.parentElement.append(L);this.layer=L;
    this.marks=branches.filter(b=>b.parent).map(b=>{const m=document.createElement('span');m.textContent=b.index;m.style.cssText='position:absolute;transform:translate(-50%,-50%);text-shadow:0 0 2px #000';L.append(m);return {m,p:b.attach}})},
  place(){if(!this.marks)return;const r=canvas.getBoundingClientRect();this.marks.forEach(({m,p})=>{const v=p.clone().project(camera);m.style.left=((v.x+1)/2*r.width)+'px';m.style.top=((1-v.y)/2*r.height)+'px'})}};
if(false)document.addEventListener('keydown',e=>{if(e.key==='j'||e.key==='J')DEBUG.toggle()});
function render(){
  const u=growthTime(t),S=1,age=keyed(AGEK,t);AGE=age;GROW=keyed(GROWK,t);T_NOW=t;
  MALL=smooth((t-.1)/.06);TWON=smooth((t-.06)/.004);
  PUMP=smooth((t-.06)/.04);
  U.uMerge.value.set(MALL,TWON,H0);U.uPump.value=PUMP;updateBranchXforms(t);
  outer.scale.setScalar(S);
  U.uT.value=u;U.uAge.value=age;U.uClock.value=clock;
  const ws=(t-.86)/.0175,gw=ws<=0?0:gustJS(ws);
  U.uSway.value=reduce.matches?0:.2+.75*gw;
  U.uLean.value=ws<=0?0:(.35*smooth(ws/1.4)+.65*gw)*(1-smooth((ws-4.4)/3));
  U.uFlutter.value=reduce.matches?0:smooth(ws/1.)*(.5+.5*gw);
  U.uGlow.value=smooth((t-.73)/.05);U.uFront.value=lerp(-1.5,18,smooth((t-.73)/.11));U.uCanopyGlow.value=smooth((t-.79)/.06);
  updateLeaves(u,S);
  const aspect=W/H;if(FIT_H===null)FIT_H=Math.max(FIT.h,FIT.w/aspect)*1.1;
  const viewH=FIT_H,viewW=viewH*aspect;
  U.uTreeH.value=lerp(2.5,16,smooth(t/.62));
  camera.left=-viewW/2;camera.right=viewW/2;camera.bottom=-FIT.h/2-.05;camera.top=camera.bottom+viewH;camera.updateProjectionMatrix();
  const px=H*renderer.getPixelRatio()/viewH*S;sparks.material.uniforms.uPx.value=px;sandMat.uniforms.uPx.value=px;sand.visible=t>.895;canopyLight.material.uniforms.uPx.value=px;
  if(DEBUG.on){[leafMesh,sparks,canopyLight,sand,veinMesh,...tree.children.filter(o=>o.isInstancedMesh&&o!==leafMesh)].forEach(o=>o.visible=false);
    U.uDebug.value=1;scene.background=new THREE.Color(.05,.05,.07);renderer.render(scene,camera);DEBUG.place();return}
  U.uDebug.value=0;veinMesh.visible=true;tree.children.forEach(o=>{if(o.isInstancedMesh&&o!==leafMesh)o.visible=true});
  const sv=sand.visible;sand.visible=false;U.uGlowPass.value=1;scene.background=black;bloomComposer.render();sand.visible=sv;
  U.uGlowPass.value=0;scene.background=null;renderer.setClearColor(0,0);finalComposer.render();
}
onReady?.();ready=true;
sync();RAF=requestAnimationFrame(frame);
/* Intake: progress 0..1 maps onto Sprout..Gold bloom (wind study excluded). */
const api=()=>dispose();api.setProgress=p=>goTo(Math.round(clamp01(p)*8));api.wind=()=>goTo(9);
return api;
function dispose(){
  DISPOSED=true;cancelAnimationFrame(RAF);CLEANUP.forEach(f=>f());controls.dispose();
  scene.traverse(o=>{o.geometry?.dispose();const m=o.material;(Array.isArray(m)?m:m?[m]:[]).forEach(mm=>{Object.values(mm).forEach(v=>{if(v&&v.isTexture)v.dispose()});mm.dispose()})});
  [barkTex,barkN,barkORM,veinTex,petalTex,cardTex,branchTex].forEach(t=>t?.dispose());
  bloomComposer.dispose();finalComposer.dispose();renderer.dispose();agesEl.innerHTML='';
};
}
