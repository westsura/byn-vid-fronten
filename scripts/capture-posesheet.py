"""Renders the soldier pose sheet on four terrain types. Run from repo root: python3 scripts/capture-posesheet.py"""
import subprocess, time, base64
from playwright.sync_api import sync_playwright
ROOT='dist'; OUT='docs/art/reference/'
srv=subprocess.Popen(['python3','-m','http.server','8767','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
try:
  with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.goto('http://localhost:8767/index.html'); pg.wait_for_timeout(1500)
    for zoom,name in [(1,'soldiers-1x.png'),(4,'soldiers-4x.png')]:
      data=pg.evaluate("""async(Z)=>{
        const {drawSoldier}=await import('/src/soldiers.js');
        const img=new Image(); img.src='/map.png'; await img.decode();
        // background patches in world coords: grass, road, dark field, dense vegetation
        const bgs=[['Gräs',300,560],['Väg',560,350],['Plöjt fält',420,700],['Tät vegetation',150,640]];
        const poses=[['Står',{},{}],['Går 1',{moving:true,stride:0},{}],['Går 2',{moving:true,stride:2.2},{}],['Ligger',{},{order:'Försvarar'}],['Kryper',{moving:true,stride:1},{order:'Försvarar'}],['Skjuter',{flash:.1},{}],['Utslagen',{hp:0},{}],['Chef',{role:'leader'},{}]];
        const cw=60, ch=44, lw=120, th=24;
        const c=document.createElement('canvas'); c.width=(lw+poses.length*cw)*Z; c.height=(th+bgs.length*2*ch)*Z;
        const g=c.getContext('2d'); g.scale(Z,Z); g.imageSmoothingEnabled=true;
        g.fillStyle='#151a17'; g.fillRect(0,0,c.width,c.height);
        g.font='10px system-ui'; g.fillStyle='#e7e9da';
        poses.forEach(([n],i)=>g.fillText(n,lw+i*cw+4,16));
        let row=0;
        for(const side of [0,1]) for(const [bn,bx,by] of bgs){
          const y0=th+row*ch; g.fillStyle='#e7e9da'; g.fillText((side?'Fiende':'Egen')+' · '+bn,4,y0+ch/2+3);
          poses.forEach(([n,m,s],i)=>{
            const x0=lw+i*cw; const sx=img.width/1200, sy=img.height/800;
            g.drawImage(img,bx*sx,by*sy,cw*sx,ch*sy,x0,y0,cw,ch);
            g.fillStyle='#18211724'; g.fillRect(x0,y0,cw,ch);
            const man={x:x0+cw/2-2,y:y0+ch/2,hp:100,angle:0,phase:0,stride:0,moving:false,flash:0,role:'rifleman',...m};
            const sq={side,routed:false,underFire:0,order:'Avvaktar',morale:100,...s};
            drawSoldier(g,man,sq,0,1.12);
          }); row++;
        }
        return c.toDataURL('image/png');}""", zoom)
      open(OUT+name,'wb').write(base64.b64decode(data.split(',')[1]))
    b.close()
finally: srv.kill()
