export const ink = '#2b2029';
export const wood = ['#34252e','#48303a','#604047','#79504b','#9c664f','#be865d','#d7a46d'];
export const burgundy = ['#492e44','#62374d','#7c3f53','#9a5260','#b46566'];
export const gold = ['#956348','#be8754','#dfa96a','#f2c985'];

export function shape(g, color, points) {
  const min = Math.min(...points.map(p => p[1]));
  const max = Math.max(...points.map(p => p[1]));
  g.fillStyle = color;
  for (let y = min; y < max; y++) {
    const hits = [];
    const line = y + 0.5;
    points.forEach(([x1,y1], index) => {
      const [x2,y2] = points[(index + 1) % points.length];
      if ((line >= y1 && line < y2) || (line >= y2 && line < y1)) {
        hits.push(x1 + (x2 - x1) * (line - y1) / (y2 - y1));
      }
    });
    hits.sort((a,b) => a-b);
    for (let i = 0; i + 1 < hits.length; i += 2) {
      const left = Math.round(hits[i]);
      g.fillRect(left, y, Math.round(hits[i + 1]) - left, 1);
    }
  }
}

export function pixels(g, color, stamps) {
  g.fillStyle = color;
  for (const [x,y,w,h] of stamps) g.fillRect(x,y,w,h);
}

export function light(g, x, y, rx, ry, strength, tint) {
  g.save();
  g.globalCompositeOperation = 'screen';
  g.fillStyle = tint;
  const size = 4;
  for (let row = -ry; row < ry; row += size) {
    for (let col = -rx; col < rx; col += size) {
      const fade = 1 - (col / rx) ** 2 - (row / ry) ** 2;
      if (fade > 0) {
        g.globalAlpha = strength * Math.ceil(fade * 6) / 6;
        g.fillRect(x + col, y + row, size, size);
      }
    }
  }
  g.restore();
}
