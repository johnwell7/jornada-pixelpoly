import { readFile, writeFile } from 'node:fs/promises';

export function bundle(index, css, sources) {
  const script = sources.map(source => source.replace(/^import .*;\n/gm,'').replace(/^export /gm,'')).join('\n');
  return index
    .replace('<link rel="stylesheet" href="room.css">', () => '<style>\n' + css + '</style>')
    .replace('<script type="module" src="game.mjs"></script>', () =>
      '<script type="module">\n' + script + '</script>');
}

const sources = ['navigation.mjs','activities.mjs','behavior.mjs','art/assets.mjs','art/room.mjs','art/lamb.mjs','game.mjs'];
const read = file => readFile(new URL(file, import.meta.url), 'utf8');
const image = async (file,type) => 'data:image/'+type+';base64,'+
  (await readFile(new URL(file,import.meta.url))).toString('base64');
const assets = 'const roomSource = '+JSON.stringify(await image('art/refuge.webp','webp'))+
  ';\nconst lambSource = '+JSON.stringify(await image('art/lamb-sprite.png','png'))+';\n';
const [index,css,...modules]=await Promise.all(['index.html','room.css',...sources].map(file=>
  file==='art/assets.mjs' ? assets : read(file)
));
await writeFile(new URL('Jornada_V7.html', import.meta.url), bundle(index, css, modules));
