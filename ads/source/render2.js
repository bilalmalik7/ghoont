// usage: node render2.js file.html W H DUR out.mp4 [stills t1,t2,...]
const { chromium } = require('playwright'); const fs=require('fs'); const {execSync}=require('child_process');
const [file,W,H,DUR,out,mode,ts]=process.argv.slice(2);
(async()=>{
  const b=await chromium.launch();
  const p=await b.newPage({viewport:{width:+W,height:+H},deviceScaleFactor:2});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('file://'+__dirname+'/'+file);
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(600);
  const dir=__dirname+'/fr_'+file.replace('.html','');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);
  const times= mode==='stills' ? ts.split(',').map(Number) : [...Array(Math.round(30*DUR)).keys()].map(i=>i/30);
  for(let i=0;i<times.length;i++){await p.evaluate(t=>window.seek(t),times[i]);await p.screenshot({path:`${dir}/f${String(i).padStart(4,'0')}.png`});}
  console.log('errors',JSON.stringify(errs));
  await b.close();
  if(mode==='stills'){
    execSync(`python3 -c "
from PIL import Image;import glob
fs=sorted(glob.glob('${dir}/f*.png'));ims=[Image.open(f) for f in fs];w=300;h=int(ims[0].height*w/ims[0].width)
c=Image.new('RGB',(len(ims)*(w+8),h),'white')
for i,im in enumerate(ims): c.paste(im.resize((w,h)),(i*(w+8),0))
c.save('${out}')"`);
  } else {
    execSync(`ffmpeg -y -loglevel error -framerate 30 -i ${dir}/f%04d.png -c:v libx264 -preset veryfast -crf 18 -pix_fmt yuv420p -movflags +faststart ${out}`);
    fs.rmSync(dir,{recursive:true,force:true});
  }
})();
