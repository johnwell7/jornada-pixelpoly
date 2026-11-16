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
  bed: { x: 335, y: 248, face: 'east', pose: 'sit' }
};

const radius = 6;
export function walkable(x, y) {
  return x >= floor.x + radius && x <= floor.x + floor.w - radius &&
    y >= floor.y + radius && y <= floor.y + floor.h - radius &&
    !objects.some(({ box: b }) => x > b.x - radius && x < b.x + b.w + radius &&
      y > b.y - radius && y < b.y + b.h + radius);
}
function crossesBox(a, b, box) {
  let enter = 0;
  let exit = 1;
  for (const [origin, delta, low, high] of [
    [a.x, b.x-a.x, box.x-radius, box.x+box.w+radius],
    [a.y, b.y-a.y, box.y-radius, box.y+box.h+radius]
  ]) {
    if (delta === 0) {
      if (origin <= low || origin >= high) return false;
    } else {
      const from = (low-origin)/delta, to = (high-origin)/delta;
      enter = Math.max(enter, Math.min(from,to));
      exit = Math.min(exit, Math.max(from,to));
      if (enter >= exit) return false;
    }
  }
  return enter < exit;
}
export function clearSegment(a,b) {
  return walkable(a.x,a.y) && walkable(b.x,b.y) &&
    !objects.some(({ box }) => crossesBox(a,b,box));
}

const grid = 8;
const columns = Math.floor(floor.w / grid) + 1;
const rows = Math.floor(floor.h / grid) + 1;
const point = id => ({ x: floor.x + id % columns * grid, y: floor.y + Math.floor(id / columns) * grid });
const nodes = Array.from({ length: columns * rows }, (_, id) => point(id));
const neighbours = [[1,0],[-1,0],[0,1],[0,-1]];
const distance = (a,b) => Math.hypot(a.x-b.x, a.y-b.y);

function nearestNode(p, connected) {
  let best = -1;
  let bestDistance = Infinity;
  nodes.forEach((node, id) => {
    const d = distance(p, node);
    if (d < bestDistance && walkable(node.x, node.y) && (!connected || clearSegment(p, node))) {
      best = id;
      bestDistance = d;
    }
  });
  return best;
}

export function findPath(origin, destination) {
  if (clearSegment(origin, destination)) return [destination];
  const from = nearestNode(origin, true);
  const exact = walkable(destination.x, destination.y);
  const to = nearestNode(destination, exact);
  if (from < 0 || to < 0) return [];
  const previous = new Int32Array(nodes.length).fill(-1);
  const queue = [from];
  previous[from] = from;
  for (let cursor = 0; cursor < queue.length && previous[to] < 0; cursor++) {
    const id = queue[cursor];
    const col = id % columns;
    const row = Math.floor(id / columns);
    for (const [dx,dy] of neighbours) {
      const x = col + dx, y = row + dy;
      const next = y * columns + x;
      if (x < 0 || x >= columns || y < 0 || y >= rows || previous[next] >= 0) continue;
      if (!clearSegment(nodes[id], nodes[next])) continue;
      previous[next] = id;
      queue.push(next);
    }
  }
  if (previous[to] < 0) return [];
  const route = [];
  for (let id = to; id !== from; id = previous[id]) route.push(nodes[id]);
  route.push(nodes[from]);
  route.reverse();
  if (exact) route.push(destination);

  const path = [];
  let at = origin;
  for (let i = 0; i < route.length;) {
    let next = i;
    while (next + 1 < route.length && clearSegment(at, route[next + 1])) next++;
    at = route[next];
    path.push(at);
    i = next + 1;
  }
  return path;
}

export function createLamb() {
  return { ...start, face: 'south', pose: 'idle', elapsed: 0, distance: 0, path: [], target: null };
}
function setPose(lamb, pose) {
  if (lamb.pose !== pose) {
    lamb.pose = pose;
    lamb.elapsed = 0;
    if (pose === 'walk') lamb.distance = 0;
  }
}
export function go(lamb, destination, target = null) {
  lamb.path = findPath(lamb, destination);
  lamb.target = lamb.path.length ? target : null;
  return lamb.path.length > 0;
}

function move(lamb, dx, dy) {
  if (Math.abs(dx) > Math.abs(dy) * 0.85) lamb.face = dx < 0 ? 'west' : 'east';
  else if (dy) lamb.face = dy < 0 ? 'north' : 'south';
  setPose(lamb, 'walk');
  lamb.distance += Math.hypot(dx, dy);
  lamb.x += dx;
  lamb.y += dy;
}

export function step(lamb, dt, input = { x: 0, y: 0 }) {
  lamb.elapsed += dt;
  const budget = 70 * dt;
  if (input.x || input.y) {
    lamb.path = [];
    lamb.target = null;
    const length = Math.hypot(input.x, input.y);
    const dx = input.x * budget / length, dy = input.y * budget / length;
    const x = walkable(lamb.x + dx, lamb.y) ? dx : 0;
    const y = walkable(lamb.x + x, lamb.y + dy) ? dy : 0;
    if (x || y) move(lamb, x, y);
    else if (lamb.pose === 'walk') setPose(lamb, 'settle');
    return null;
  }

  if (lamb.path.length) {
    let remaining = budget;
    while (remaining > 0 && lamb.path.length) {
      const next = lamb.path[0];
      const d = distance(lamb, next);
      if (d > 0.0001) {
        const amount = Math.min(remaining, d);
        move(lamb, (next.x - lamb.x) / d * amount, (next.y - lamb.y) / d * amount);
        remaining -= amount;
      }
      if (d <= 0.0001 || distance(lamb, next) <= 0.0001) lamb.path.shift();
    }
    if (lamb.path.length) return null;
    const arrival = lamb.target;
    lamb.target = null;
    if (arrival) {
      lamb.face = targets[arrival].face;
      setPose(lamb, targets[arrival].pose);
    } else setPose(lamb, 'settle');
    return arrival;
  }
  if (lamb.pose === 'walk') setPose(lamb, 'settle');
  if (lamb.pose === 'settle' && lamb.elapsed >= 0.15) setPose(lamb, 'idle');
  return null;
}

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export function follow(camera, lamb, view, dt) {
  const x = clamp(lamb.x - view.width / 2, 0, world.width - view.width);
  const y = clamp(lamb.y - view.height * 0.64, 0, world.height - view.height);
  const amount = dt === Infinity ? 1 : 1 - Math.exp(-7 * dt);
  camera.x = clamp(camera.x + (x - camera.x) * amount, 0, world.width - view.width);
  camera.y = clamp(camera.y + (y - camera.y) * amount, 0, world.height - view.height);
}
export function orderAt(y) {
  return [...objects, { id: 'lamb', y }].sort((a,b) => a.y - b.y).map(({ id }) => id);
}
