"""Captures reference screenshots with Playwright (Chromium). Run from repo root: python3 scripts/capture-refshots.py"""
import subprocess, time, base64, json
from playwright.sync_api import sync_playwright
ROOT='dist'; OUT='docs/art/reference/'
srv=subprocess.Popen(['python3','-m','http.server','8766','-d',ROOT],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
def canvas_png(pg,path):
    data=pg.evaluate("document.getElementById('map').toDataURL('image/png')")
    open(path,'wb').write(base64.b64decode(data.split(',')[1]))
info={}
try:
  with sync_playwright() as p:
    b=p.chromium.launch()
    for (w,h) in [(1366,768),(1920,1080),(1500,1000)]:
        pg=b.new_page(viewport={'width':w,'height':h}); pg.goto('http://localhost:8766/index.html'); pg.wait_for_timeout(1200)
        pg.click('#begin')
        pg.evaluate("""async()=>{const sim=await import('/src/sim.js');sim.select(0);sim.issue(640,330);sim.select(1);sim.issue(600,420);sim.select(2);sim.issue(640,600);sim.select(0);
          for(let i=0;i<1300;i++)sim.update(0.05);sim.state.paused=true;sim.hooks.changed();}""")
        pg.wait_for_timeout(400)
        box=pg.locator('#map').bounding_box(); info[f'{w}x{h}']={'canvas_css_width':box['width'],'scale':box['width']/1200}
        pg.screenshot(path=OUT+f'screen-{w}x{h}-battle.png')
        if (w,h)==(1500,1000):
            canvas_png(pg,OUT+'canvas-native-battle.png')
            pg.locator('#squads').screenshot(path=OUT+'panel-squads-current.png')
            pg.locator('aside').screenshot(path=OUT+'panel-sidebar-current.png')
        pg.close()
    # House 0 occupied + soldier pose sheet, rendered at native 1200x800
    pg=b.new_page(viewport={'width':1500,'height':1000}); pg.goto('http://localhost:8766/index.html'); pg.wait_for_timeout(1200); pg.click('#begin')
    pg.evaluate("""async()=>{const sim=await import('/src/sim.js');const s=sim.state;s.squads.filter(q=>q.side).forEach(q=>q.men.forEach(m=>m.hp=0));
      sim.select(0);sim.issue(501,169);for(let i=0;i<1800;i++)sim.update(0.05);s.paused=true;s.started=false;sim.hooks.changed();}""")
    pg.wait_for_timeout(300); canvas_png(pg,OUT+'canvas-house0-occupied.png')
    # pose sheet: one squad of each side, standing / walking / prone / fallen
    pg.evaluate("""async()=>{const sim=await import('/src/sim.js');sim.reset();const s=sim.state;s.started=false;s.paused=true;
      const place=(q,x,y)=>{q.x=x;q.y=y;q.men.forEach((m,i)=>{m.x=x+i*34;m.y=y;m.angle=0;m.moving=false;m.hp=100})};
      const [a,b,c,e1,e2,e3]=s.squads;
      place(a,480,300); a.order='Avvaktar';
      place(b,480,380); b.men.forEach(m=>{m.moving=true;m.stride=m.phase}); b.path=[{x:900,y:380}];
      place(c,480,460); c.order='Försvarar';
      place(e1,480,540); e1.visible=true;
      place(e2,480,620); e2.visible=true; e2.order='Försvarar';
      place(e3,480,700); e3.visible=true; e3.men.forEach(m=>m.hp=0); c.men[4].hp=0; a.men[2].flash=0.1;
      s.selected=5; }""")
    pg.wait_for_timeout(300); canvas_png(pg,OUT+'canvas-pose-sheet.png')
    b.close()
finally: srv.kill()
print(json.dumps(info))
