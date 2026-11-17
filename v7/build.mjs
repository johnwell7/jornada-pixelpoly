import { readFile, writeFile } from 'node:fs/promises';

export function bundle(index, css, sources) {
  const script = sources.map(source => source.replace(/^import .*;\n/gm,'').replace(/^export \{[^\n]+ from [^\n]+\n/gm,'').replace(/^export /gm,'')).join('\n');
  return index
    .replace('<link rel="stylesheet" href="room.css">', () => '<style>\n' + css + '</style>')
    .replace('<script type="module" src="game.mjs"></script>', () =>
      '<script type="module">\n' + script + '</script>');
}

const sources = ['room-objects.mjs','navigation.mjs','activities.mjs','behavior.mjs','art/palette.mjs','art/aliases.mjs','art/room.mjs','art/lamb.mjs','room-session.mjs','room-renderer.mjs','room-controls.mjs','room-interface.mjs','game.mjs'];
const read = file => readFile(new URL(file, import.meta.url), 'utf8');
const [index, css, ...modules] = await Promise.all(['index.html', 'room.css', ...sources].map(file => 
  file === 'art/aliases.mjs' ? 'const red = burgundy;\nconst w = wood;\n' : read(file)
));
await writeFile(new URL('Jornada_V7.html', import.meta.url), bundle(index, css, modules));
