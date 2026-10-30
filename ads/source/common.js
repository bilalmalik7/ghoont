/* shared helpers for GHOONT ads — deterministic, seekable */
const MARKS={
  day:[["8 AM","Good morning"],["10 AM","Keep going"],["12 PM","Halfway soon"],["2 PM","Don't stop"],["4 PM","Almost there"],["6 PM","Last push"],["8 PM","Done!"]],
  roza:[["Iftar","Bismillah"],["Maghrib","Slowly"],["Isha","Keep sipping"],["Taraweeh","Refresh"],["Midnight","Almost"],["Sehri","Done!"]]
};
let _bid=0;
function bottle({colour='#22B8E8',liquid,mode='day',labels=true,level=1,ink='#0A1A33',body=.3,id}={}){
  liquid=liquid||colour;const b=id||('b'+(++_bid));const top=118,bot=478;const y=top+(1-level)*(bot-top);const M=MARKS[mode];let mk='';
  if(labels)M.forEach((m,i)=>{const my=top+i*(bot-top)/(M.length-1);mk+=`<g class="mk" data-i="${i}"><line x1="112" y1="${my}" x2="168" y2="${my}" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/><text x="166" y="${my-6}" text-anchor="end" font-family="Unbounded" font-weight="700" font-size="12.5" fill="${ink}">${m[0]}</text><text x="36" y="${my+4}" font-family="DM Sans" font-weight="700" font-size="11" fill="${ink}" opacity=".7">${m[1]}</text></g>`});
  return `<svg viewBox="0 0 200 520" style="overflow:visible;width:100%;height:100%"><defs><clipPath id="${b}c"><rect x="24" y="96" width="152" height="408" rx="44"/></clipPath><linearGradient id="${b}g" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".16" stop-color="#fff" stop-opacity=".6"/><stop offset=".28" stop-color="#fff" stop-opacity="0"/><stop offset=".86" stop-color="#fff" stop-opacity="0"/><stop offset=".92" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient><linearGradient id="${b}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
  <path d="M150 52 C 210 60 205 150 176 170" stroke="${colour}" stroke-width="9" fill="none" stroke-linecap="round"/>
  <rect x="62" y="20" width="76" height="52" rx="14" fill="${colour}"/><rect x="62" y="20" width="76" height="52" rx="14" fill="#000" opacity=".14"/><rect x="88" y="6" width="24" height="20" rx="6" fill="${colour}"/><rect x="54" y="66" width="92" height="30" rx="10" fill="${colour}"/><rect x="60" y="70" width="20" height="22" rx="6" fill="#fff" opacity=".25"/>
  <rect x="24" y="96" width="152" height="408" rx="44" fill="#fff" fill-opacity="${body}" stroke="${colour}" stroke-width="5"/>
  <g clip-path="url(#${b}c)"><g class="liq" transform="translate(0,${y})"><g class="wv"><path d="M-200 0 Q-150 -10 -100 0 T0 0 T100 0 T200 0 T300 0 T400 0 V600 H-200Z" fill="${liquid}" opacity=".93"/></g><g class="wv2"><path d="M-200 6 Q-150 -4 -100 6 T0 6 T100 6 T200 6 T300 6 T400 6 V600 H-200Z" fill="${liquid}" opacity=".5"/></g><rect x="-200" y="0" width="600" height="600" fill="url(#${b}l)"/></g>${mk}</g>
  <rect x="24" y="96" width="152" height="408" rx="44" fill="url(#${b}g)"/></svg>`;
}
function setLevel(root,level){const l=root.querySelector('.liq');if(l)l.setAttribute('transform',`translate(0,${118+(1-level)*360})`)}

/* seeded random */
let _seed=11;const rnd=()=>{_seed=(_seed*16807)%2147483647;return _seed/2147483647};

/* particle bursts drawn analytically from time t */
const FX={bursts:[],cv:null,ctx:null,W:0,H:0,
  init(W,H){this.W=W;this.H=H;this.cv=document.getElementById('fx');this.cv.width=W*2;this.cv.height=H*2;this.ctx=this.cv.getContext('2d');this.ctx.scale(2,2)},
  burst(t0,x,y,n,{speed=[300,700],spread=2.4,up=-Math.PI/2,colours=['#22B8E8','#ffffff'],g=1500,life=1.3,size=[4,12]}={}){
    for(let i=0;i<n;i++){const a=up+(rnd()-.5)*spread,v=speed[0]+rnd()*(speed[1]-speed[0]);this.bursts.push({t0,x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:size[0]+rnd()*(size[1]-size[0]),c:colours[Math.floor(rnd()*colours.length)],g,life})}},
  draw(t){const c=this.ctx;c.clearRect(0,0,this.W,this.H);
    for(const p of this.bursts){const d=t-p.t0;if(d<0||d>p.life)continue;const x=p.x+p.vx*d,y=p.y+p.vy*d+.5*p.g*d*d,vy=p.vy+p.g*d;
      c.globalAlpha=Math.min(1,(1-d/p.life)*1.6);c.save();c.translate(x,y);c.rotate(Math.atan2(vy,p.vx));
      c.beginPath();c.ellipse(0,0,p.r*1.5,p.r,0,0,Math.PI*2);c.fillStyle=p.c;c.fill();
      c.beginPath();c.arc(p.r*.35,-p.r*.3,p.r*.3,0,Math.PI*2);c.fillStyle='rgba(255,255,255,.7)';c.fill();c.restore()}
    c.globalAlpha=1}
};

/* film grain: pre-baked noise tiles, picked per frame */
const GRAIN={tiles:[],el:null,
  init(){this.el=document.getElementById('grain');for(let k=0;k<6;k++){const cv=document.createElement('canvas');cv.width=cv.height=256;const x=cv.getContext('2d');const im=x.createImageData(256,256);
    for(let i=0;i<im.data.length;i+=4){const v=rnd()*255;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=22}x.putImageData(im,0,0);this.tiles.push(cv.toDataURL())}},
  draw(t){if(this.el)this.el.style.backgroundImage=`url(${this.tiles[Math.floor(t*24)%this.tiles.length]})`}
};

const _css=document.createElement('style');
_css.textContent=`.wv{animation:w 2.4s linear infinite}.wv2{animation:w 3.6s linear infinite reverse}@keyframes w{to{transform:translateX(200px)}}
#grain{position:absolute;inset:0;pointer-events:none;z-index:50;mix-blend-mode:overlay;opacity:.9}
#fx{position:absolute;inset:0;pointer-events:none;z-index:40;width:100%;height:100%}`;
document.head.appendChild(_css);

function wireSeek(tl,extra){
  window.seek=t=>{tl.seek(t,false);document.getAnimations().forEach(a=>{a.pause();a.currentTime=t*1000});FX.draw(t);GRAIN.draw(t);extra&&extra(t)};
}
