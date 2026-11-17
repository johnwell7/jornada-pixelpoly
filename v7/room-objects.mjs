export const world = { width: 448, height: 320 };
export const floor = { x: 16, y: 116, w: 416, h: 192 };
export const start = { x: 196, y: 237 };
export const objects = [
  { id: 'shelf', x: 75, y: 143, box: { x: 35, y: 119, w: 80, h: 24 } },
  { id: 'bench', x: 211, y: 138, box: { x: 178, y: 119, w: 66, h: 19 } },
  { id: 'bed', x: 352, y: 226, box: { x: 305, y: 136, w: 95, h: 90 } },
  { id: 'lantern', x: 281, y: 155, box: { x: 267, y: 138, w: 28, h: 17 } },
  { id: 'plant', x: 150, y: 183, box: { x: 139, y: 163, w: 22, h: 20 } },
  { id: 'chest', x: 88, y: 265, box: { x: 61, y: 240, w: 54, h: 25 } }
];
export const targets = {
  window: { x: 211, y: 155, face: 'north', pose: 'look' },
  bed: { x: 346, y: 248, face: 'east', pose: 'sit' },
  rug: { x: 196, y: 242, face: 'south', pose: 'sit' },
  plant: { x: 176, y: 181, face: 'west', pose: 'look' }
};
