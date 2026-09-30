// Coordinates in manifest are relative to sourceRect, not the whole sheet.
export function drawSoldier(ctx, image, frame, x, y, heading, zoom = 1) {
  const [sx, sy, sw, sh] = frame.sourceRect;
  const s = zoom / frame.pixelsPerUnit;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading - frame.sourceForwardRadians);
  ctx.drawImage(image, sx, sy, sw, sh,
    -frame.pivot[0] * s, -frame.pivot[1] * s, sw * s, sh * s);
  ctx.restore();
}

export function muzzleWorld(frame, x, y, heading) {
  const a = heading - frame.sourceForwardRadians;
  const dx = (frame.muzzle[0] - frame.pivot[0]) / frame.pixelsPerUnit;
  const dy = (frame.muzzle[1] - frame.pivot[1]) / frame.pixelsPerUnit;
  return {x: x + Math.cos(a) * dx - Math.sin(a) * dy,
          y: y + Math.sin(a) * dx + Math.cos(a) * dy};
}
