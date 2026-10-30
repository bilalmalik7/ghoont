/* =========================================================
   MOTION LAYER — GSAP + ScrollTrigger + Lenis + canvas droplets
   ========================================================= */

/* ---------- droplet physics (canvas) ---------- */
const FX = (()=>{
  const cv=$('#fx'), ctx=cv.getContext('2d'); let W,H,dpr; const ps=[]; let running=false;
  const size=()=>{dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)};
  size(); addEventListener('resize',size);
  function spawn(x,y,n=14,{spread=Math.PI*.9,up=-Math.PI/2,speed=[4,10],colour='#22B8E8'}={}){
    if(reduce) return;
    for(let i=0;i<n;i++){
      const a=up+(Math.random()-.5)*spread, v=speed[0]+Math.random()*(speed[1]-speed[0]);
      ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:2.5+Math.random()*5,life:1,c:colour});
    }
    if(!running){running=true;requestAnimationFrame(tick)}
  }
  function drop(p){
    // teardrop pointing along velocity
    const ang=Math.atan2(p.vy,p.vx), sp=Math.min(2.2,1+Math.hypot(p.vx,p.vy)/10);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(ang);ctx.globalAlpha=Math.max(0,p.life);
    ctx.beginPath();ctx.ellipse(0,0,p.r*sp,p.r,0,0,Math.PI*2);ctx.fillStyle=p.c;ctx.fill();
    ctx.beginPath();ctx.arc(p.r*.3,-p.r*.35,p.r*.32,0,Math.PI*2);ctx.fillStyle='rgba(255,255,255,.75)';ctx.fill();
    ctx.restore();
  }
  function tick(){
    ctx.clearRect(0,0,W,H);
    for(let i=ps.length-1;i>=0;i--){
      const p=ps[i]; p.vy+=.38; p.vx*=.99; p.x+=p.vx; p.y+=p.vy; p.life-=.012;
      if(p.y>H-4&&p.vy>0){p.vy*=-.32;p.vx*=.7;p.r*=.8} // tiny bounce on the floor
      if(p.life<=0||p.r<.8) ps.splice(i,1); else drop(p);
    }
    if(ps.length) requestAnimationFrame(tick); else {running=false;ctx.clearRect(0,0,W,H)}
  }
  return {spawn};
})();

/* click anywhere → splash + ring ripple */
addEventListener('pointerdown',e=>{
  if(reduce) return;
  if(e.target.closest('input,select,label')) return;
  FX.spawn(e.clientX,e.clientY,10,{speed:[3,8]});
  const r=document.createElement('span');r.className='ripple';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';
  document.body.appendChild(r);setTimeout(()=>r.remove(),800);
});

/* hero bottle: release after a drag → water sloshes out of the neck */
hero.addEventListener('pointerup',()=>{
  const r=hero.getBoundingClientRect();
  FX.spawn(r.left+r.width/2,r.top+r.height*.08,22,{speed:[5,12],spread:Math.PI*.7});
});

const hasGSAP = typeof gsap!=='undefined' && typeof ScrollTrigger!=='undefined';
if(hasGSAP){
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  let lenis=null;
  if(typeof Lenis!=='undefined' && !reduce){
    lenis=new Lenis({lerp:.09,anchors:{offset:-20}});
    lenis.on('scroll',ScrollTrigger.update);
    gsap.ticker.add(t=>lenis.raf(t*1000));
    gsap.ticker.lagSmoothing(0);
  }

  /* ---------- intro: a drop falls, splashes, water floods the screen ---------- */
  const intro=$('#intro');
  const word=$('#iword'); word.innerHTML=[...CONFIG.brand].map(c=>`<span>${c}</span>`).join('');
  const finish=()=>{document.body.classList.add('ready');gsap.set(intro,{display:'none'});lenis&&lenis.start();ScrollTrigger.refresh()};
  if(reduce){ finish(); }
  else{
    lenis&&lenis.stop();
    const tl=gsap.timeline({onComplete:finish});
    tl.to('.idrop',{y:innerHeight/2+40,duration:.75,ease:'power2.in'})
      .to('.idrop',{scaleY:.4,scaleX:1.6,transformOrigin:'50% 100%',duration:.08})
      .add(()=>FX.spawn(innerWidth/2,innerHeight/2+110,30,{speed:[5,13],spread:Math.PI*.95}))
      .to('.idrop',{opacity:0,duration:.1})
      .to('.iwater',{height:'100%',duration:.9,ease:'power3.inOut'},'-=.05')
      .to(word,{opacity:1,duration:.01},'-=.35')
      .from('#iword span',{yPercent:120,opacity:0,stagger:.05,duration:.5,ease:'back.out(2)'},'-=.35')
      .to(intro,{yPercent:-100,duration:.9,ease:'power4.inOut'},'+=.35')
      .add(()=>document.body.classList.add('ready'),'-=.6');
    $('#skipIntro').addEventListener('click',()=>tl.progress(1));
  }

  /* ---------- hero parallax as you scroll away ---------- */
  gsap.to('.hero-stage',{yPercent:18,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero .wrap > div:first-child',{yPercent:-10,opacity:.2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.marquee .track',{x:'-=300',ease:'none',scrollTrigger:{trigger:'.marquee',start:'top bottom',end:'bottom top',scrub:true}});

  /* ---------- magnetic buttons ---------- */
  if(matchMedia('(hover:hover)').matches){
    $$('.hero .btn, nav .btn, .order .btn-wa').forEach(b=>{
      const xTo=gsap.quickTo(b,'x',{duration:.4,ease:'power3'}), yTo=gsap.quickTo(b,'y',{duration:.4,ease:'power3'});
      b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();xTo((e.clientX-r.left-r.width/2)*.3);yTo((e.clientY-r.top-r.height/2)*.4)});
      b.addEventListener('pointerleave',()=>{xTo(0);yTo(0)});
    });
  }

  /* ---------- the day in a bottle: pinned, scroll-scrubbed ---------- */
  const story=$('#story'), sb=$('#storyBottle');
  sb.insertAdjacentHTML('afterbegin',bottleSVG({colour:'#22B8E8',level:1}));
  const sLiq=$('.liq',sb); sLiq.style.transition='none';
  const sSvg=$('svg',sb);
  const CAPS=[
    ["Fill it up.","The day starts with a full bottle on your desk."],
    ["First line down.","Your morning chai doesn't count. Keep sipping."],
    ["Lunch break.","Halfway is close. Have a few sips before you eat."],
    ["Feeling slow after lunch?","Have some water before the next cup of tea."],
    ["Almost there.","Only two lines left. You've got this."],
    ["Last push before Maghrib.","Finish this line before the sun goes down."],
    ["Empty bottle. Full day.","Shabash! That's 2 litres in one day."]
  ];
  $('#captions').innerHTML=CAPS.map(c=>`<div class="cap"><h3>${c[0]}</h3><p>${c[1]}</p></div>`).join('');
  const caps=$$('#captions .cap'); caps[0].classList.add('on');
  const skyAt=gsap.utils.interpolate(['#CFEFFF','#A8E3FA','#8FD8F7','#BFE6F2','#FFD08A','#FF9A63','#2B2A5E']);
  const hill1At=gsap.utils.interpolate(['#9ADCF3','#86D4F0','#7BCDEB','#9CD3D9','#F2B36F','#E0714A','#1E1D45']);
  const hill2At=gsap.utils.interpolate(['#6CC8EA','#57BCE3','#4CB4DE','#6FB9C4','#E39554','#C2523A','#15143A']);
  const inkAt=gsap.utils.interpolate(['#0A1A33','#0A1A33','#0A1A33','#0A1A33','#0A1A33','#2A1020','#FFFFFF']);
  const sunG=$('#sunG'), moonG=$('#moonG');
  let lastIdx=0;
  const fmtTime=h=>{const H=Math.floor(h),M=Math.floor((h-H)*60/5)*5;const hh=H%12||12;return `${hh}:${String(M).padStart(2,'0')} ${H<12?'AM':'PM'}`};
  function renderStory(p){
    const h=8+p*12;
    $('#storyTime').textContent=fmtTime(Math.min(h,20));
    sLiq.style.transform=`translateY(${118+p*(478-118)}px)`;
    $$('.mk',sb).forEach((m,i)=>m.classList.toggle('done',i/6<p-.001));
    const sky=skyAt(p); story.style.setProperty('--sky',sky); story.style.color=inkAt(p);
    $('#hill1').setAttribute('fill',hill1At(p)); $('#hill2').setAttribute('fill',hill2At(p));
    // sun along the quadratic arc, sinking at the end
    const t=Math.min(1,p*1.02), x=(1-t)**2*60+2*(1-t)*t*500+t*t*940, y=(1-t)**2*560+2*(1-t)*t*(-160)+t*t*560;
    sunG.setAttribute('transform',`translate(${x},${y})`); sunG.style.opacity=p>.95?String(Math.max(0,(1-p)*20)):'1';
    moonG.setAttribute('transform','translate(820,120)'); moonG.style.opacity=String(Math.max(0,(p-.88)*8));
    const L=p*2; $('#storyL').textContent=`${L.toFixed(1)} / 2.0 L`; $('#storyBar').style.width=(p*100)+'%';
    const idx=Math.min(6,Math.floor(p*6+.02));
    if(idx!==lastIdx){
      caps.forEach((c,i)=>c.classList.toggle('on',i===idx));
      if(idx>lastIdx) sip();
      lastIdx=idx;
    }
  }
  function sip(){
    gsap.timeline()
      .to(sSvg,{rotation:-22,transformOrigin:'50% 40%',duration:.22,ease:'power2.out'})
      .add(()=>{const r=sb.getBoundingClientRect();FX.spawn(r.left+r.width/2-10,r.top+r.height*.06,12,{up:-Math.PI*.7,spread:Math.PI*.5,speed:[4,9]})})
      .to(sSvg,{rotation:0,duration:.7,ease:'elastic.out(1,.4)'});
    gsap.fromTo('#gulp',{scale:.4,opacity:.9},{scale:2,opacity:0,duration:.8,ease:'power2.out'});
  }
  renderStory(0);
  ScrollTrigger.create({
    trigger:story,start:'top top',end:()=>'+='+innerHeight*3.2,pin:true,scrub:true,anticipatePin:1,
    onUpdate:self=>renderStory(self.progress)
  });

  /* ---------- section headings: words rise in ---------- */
  $$('.sec-head h2, .garmi h2, .roza h2, .order h2').forEach(h=>{
    const parts=h.innerHTML.split(/(<br>|<em[^>]*>.*?<\/em>|\s+)/).filter(Boolean);
    h.innerHTML=parts.map(t=>/^\s+$/.test(t)?' ':t==='<br>'?t:`<span style="display:inline-block;overflow:hidden;vertical-align:top"><span class="w" style="display:inline-block">${t}</span></span>`).join('');
    gsap.from($$('.w',h),{yPercent:110,rotate:6,duration:.8,ease:'power4.out',stagger:.05,scrollTrigger:{trigger:h,start:'top 85%'}});
  });

  /* ---------- products: bottles drop in and bounce ---------- */
  $$('.prod .stage').forEach((s,i)=>{
    gsap.from(s.firstElementChild,{y:-120,rotate:-14,opacity:0,duration:1.1,ease:'bounce.out',delay:i*.12,scrollTrigger:{trigger:s,start:'top 80%'}});
  });

  /* ---------- garmi: sun swells with scroll ---------- */
  gsap.fromTo('.garmi .sun',{scale:.6},{scale:1.25,ease:'none',scrollTrigger:{trigger:'.garmi',start:'top bottom',end:'bottom top',scrub:true}});

  /* ---------- roza: moon rises ---------- */
  gsap.from('.roza .moon',{y:200,opacity:0,ease:'none',scrollTrigger:{trigger:'.roza',start:'top bottom',end:'top 30%',scrub:true}});

  /* ---------- phones fan out ---------- */
  gsap.from('.ad-row .phone',{y:120,rotate:i=>[-10,0,10][i],opacity:0,stagger:.12,duration:1,ease:'power3.out',scrollTrigger:{trigger:'.ad-row',start:'top 80%'}});

  /* keep pin math right once fonts land */
  document.fonts && document.fonts.ready.then(()=>ScrollTrigger.refresh());
}else{
  document.body.classList.add('ready');
  $('#intro').style.display='none';
}
