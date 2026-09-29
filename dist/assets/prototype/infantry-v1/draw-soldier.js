/** Canvas2D adapter. Load manifest and PNG before drawing. Coordinates are world units.
 * Prototype: never choose redraw-required frames by default. No interpolation implied.
 */
export function drawSoldier(ctx, image, atlas, {role, state='ready', x, y, angle=0, scale=1, allowDraft=false}) {
  let frame=atlas.frames.find(f=>f.role===role&&f.state===state);
  if (!frame) throw new Error(`Unknown sprite: ${role}/${state}`);
  if(frame.review==='redraw-required'&&!allowDraft){
    const fallback=state.startsWith('crawl')?'prone':'ready';
    frame=atlas.frames.find(f=>f.role===role&&f.state===fallback);
  }
  const [sx,sy,sw,sh]=frame.rect, k=scale/frame.pixelsPerUnit;
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);
  ctx.drawImage(image,sx,sy,sw,sh,-frame.pivot[0]*k,-frame.pivot[1]*k,sw*k,sh*k);
  ctx.restore();return frame;
}
