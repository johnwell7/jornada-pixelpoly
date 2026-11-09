const catalog = [
  {
    id: 'liahona', name: 'Liahona', type: 'Equippable artifact', equipment: 'equipped',
    description: {
      pt: 'Uma esfera de latão encontrada ao amanhecer. Suas agulhas acompanharam uma família por caminhos desconhecidos, entre desertos, descobertas e a esperança de chegar a um novo lar.',
      en: 'A brass sphere found at dawn. Its needles accompanied a family along unknown paths, through deserts and discoveries, with the hope of reaching a new home.'
    },
    effect: 'Guidance',
    unlockCondition: 'existing-discovery',
    relatedScriptures: [
      ['1 Nephi 16:28–29', 'https://www.churchofjesuschrist.org/study/scriptures/bofm/1-ne/16?lang=eng&id=p28-p29#p28'],
      ['Alma 37:44–45', 'https://www.churchofjesuschrist.org/study/scriptures/bofm/alma/37?lang=eng&id=p44-p45#p44']
    ]
  },
  {
    id: 'david-harp', name: 'David’s Harp', type: 'Exploration artifact',
    description: {
      pt: 'Suas cordas acompanharam as mãos de um jovem pastor. Um dia, suas melodias chegaram aos ouvidos de um rei aflito e trouxeram paz onde antes havia inquietação.',
      en: 'Its strings accompanied the hands of a young shepherd. One day, its melodies reached the ears of a troubled king and brought peace where there had been unrest.'
    },
    effect: 'Melodies of Peace',
    unlockCondition: 'finish-exploration',
    exploration: {
      title: 'David plays for Saul',
      context: 'Saul’s servants looked for a musician. David came from tending sheep to serve the king, and Saul found relief when David played.',
      prompt: 'As you read, notice how David’s music changes the scene.'
    },
    relatedScriptures: [
      ['1 Samuel 16:14–23', '1SA,16,14,23'],
      ['Psalm 98:4–6', 'PSA,98,4,6']
    ]
  },
  {
    id: 'moses-staff', name: 'Moses’ Staff', type: 'Exploration artifact',
    description: {
      pt: 'Um simples cajado que acompanhou os passos de um pastor. Esteve diante de reis, atravessou desertos e foi erguido no momento em que um povo inteiro viu o mar se abrir.',
      en: 'A simple staff that accompanied a shepherd on his way. It stood before kings, crossed deserts, and was raised at the moment an entire people saw the sea part.'
    },
    effect: 'The Crossing',
    unlockCondition: 'finish-exploration',
    exploration: {
      title: 'A path through the sea',
      context: 'At the sea, the Israelites had the Egyptian army behind them. Moses was told to raise his staff, and the people crossed on dry ground.',
      prompt: 'As you read, compare what Moses is asked to do with what the people are asked to do.'
    },
    relatedScriptures: [
      ['Exodus 14:15–22', 'EXO,14,15,22'],
      ['Exodus 4:1–5', 'EXO,4,1,5']
    ]
  },
  {
    id: 'missionary-tag', name: 'Missionary Name Tag', type: 'Symbolic artifact', equipment: 'missionaryTagEquipped',
    description: {
      pt: 'Uma pequena placa preta que parece ter percorrido longas distâncias. Talvez tenha conhecido centenas de portas, muitos desconhecidos, a alegria de ver estranhos se tornarem grandes amigos e a dor de despedidas difíceis.',
      en: 'A small black name tag that seems to have traveled a long way. Perhaps it knew hundreds of doors, many strangers, the joy of seeing strangers become close friends, and the pain of difficult goodbyes.'
    },
    unlockCondition: 'finish-exploration',
    exploration: {
      title: 'Go and teach',
      context: 'After his resurrection, Jesus sends his disciples to teach people from all nations and promises to be with them. The name tag is a symbol of missionary service in Jornada.',
      prompt: 'As you read, notice what Jesus asks his disciples to share.'
    },
    relatedScriptures: [
      ['Matthew 28:16–20', 'MAT,28,16,20']
    ]
  }
];

export const artifacts = [...catalog.map(entry => ({
  ...entry,
  model: `assets/artifacts/${entry.id}.svg`,
  inventoryImage: `assets/artifacts/${entry.id}-inventory.png`,
  presentation: `assets/artifacts/${entry.id}.png`
})),
  {"id": "vestes-sacerdotais", "name": "Vestes Sacerdotais", "type": "Vestimenta", "description": {"pt": "Quando Moisés vestiu Aarão diante da congregação, apertou a faixa e pôs o peitoral sobre seu peito. Ali, em doze pedras, iam com ele os nomes das tribos de Israel."}, "unlockCondition": "finish-exploration", "exploration": {"title": "A investidura de Aarão", "context": "Leia como Moisés vestiu Aarão diante da congregação.", "prompt": "Observe a ordem em que as peças são colocadas."}, "relatedScriptures": [["Levítico 8:6–9", "LEV,8,6,9"], ["Êxodo 28:15–21", "EXO,28,15,21"]], "inventoryImage": "assets/bitpoly/priestly/portrait.webp", "presentation": "assets/bitpoly/priestly/portrait.webp", "equipment": "outfit"},
  {"id": "serpente-de-bronze", "name": "Serpente de Bronze", "type": "Artefato", "description": {"pt": "Moisés ergueu a serpente acima do acampamento. Naquele trecho da travessia, os feridos levantaram os olhos para a haste e viveram."}, "unlockCondition": "finish-exploration", "exploration": {"title": "A haste no acampamento", "context": "Acompanhe esse trecho da travessia de Israel.", "prompt": "Observe o que Moisés faz e a ação dos feridos."}, "relatedScriptures": [["Números 21:4–9", "NUM,21,4,9"]], "inventoryImage": "assets/artifacts/serpente-de-bronze/02_inventario.png", "presentation": "assets/artifacts/serpente-de-bronze/01_descoberta.png"},
  {"id": "cantico-de-moises", "name": "Cântico de Moisés", "type": "Pergaminho", "description": {"pt": "Moisés escreveu o cântico e o ensinou ao povo naquele mesmo dia. As palavras que começaram numa página seguiram viagem na voz de Israel."}, "unlockCondition": "finish-exploration", "exploration": {"title": "Um cântico para Israel", "context": "Leia quando o cântico foi escrito e ensinado.", "prompt": "Observe por que as palavras deveriam permanecer na memória do povo."}, "relatedScriptures": [["Deuteronômio 31:19–22", "DEU,31,19,22"]], "inventoryImage": "assets/artifacts/cantico-de-moises/02_inventario.png", "presentation": "assets/artifacts/cantico-de-moises/01_descoberta.png", "scroll": true},
  {
    id: 'tunica-de-jose',
    name: 'Túnica de José',
    type: 'Vestimenta',
    description: {pt: 'Jacó deu a José uma túnica especial. Ao verem o presente e a preferência do pai, seus irmãos passaram a odiá-lo.'},
    unlockCondition: 'finish-exploration',
    exploration: {
      title: 'A túnica que Jacó deu a José',
      context: 'Leia sobre a túnica que José recebeu do pai e a reação de seus irmãos.',
      prompt: 'Observe o que o presente revela sobre a relação entre José e sua família.'
    },
    relatedScriptures: [['Gênesis 37:3–4','GEN,37,3,4']],
    inventoryImage: 'assets/bitpoly/tunic/portrait.webp',
    presentation: 'assets/bitpoly/tunic/portrait.webp',
    equipment: 'outfit'
  },
  {
    id: 'pequeno-pastor-de-davi',
    name: 'Traje do Pequeno Pastor de Davi',
    type: 'Vestimenta',
    description: {pt: 'Antes de enfrentar Golias, Davi cuidava das ovelhas de seu pai. Ao falar com Saul, recordou as vezes em que protegeu o rebanho e confiou no Senhor para enfrentar o próximo perigo.'},
    unlockCondition: 'finish-exploration',
    exploration: {
      title: 'Davi protege o rebanho',
      context: 'Leia o que Davi contou a Saul sobre seu trabalho como pastor.',
      prompt: 'Observe como Davi relaciona o cuidado com as ovelhas ao desafio que estava diante dele.'
    },
    relatedScriptures: [['1 Samuel 17:34–37','1SA,17,34,37']],
    inventoryImage: 'assets/artifacts/pequeno-pastor-de-davi/skin.png',
    presentation: 'assets/artifacts/pequeno-pastor-de-davi/skin.png',
    equipment: 'outfit'
  }
];

// Keep Liahona on the original save flags. New artifacts have their own record.
export function artifactStatus(state, entry) {
  if (entry.id === 'liahona') return state.found ? 'stored' : 'unknown';
  return state.artifactDiscoveries?.[entry.id] ?? 'unknown';
}

export function restoreArtifactDiscoveries(state, raw) {
  const saved = raw?.artifactDiscoveries;
  const entries = artifacts.flatMap(entry => {
    if (entry.unlockCondition !== 'finish-exploration') return [];
    const status = saved?.[entry.id];
    return status === 'revealed' || status === 'stored' ? [[entry.id, status]] : [];
  });
  const artifactDiscoveries = Object.fromEntries(entries);
  return {
    ...state,
    artifactDiscoveries,
    outfit: artifacts.some(entry => entry.equipment === 'outfit' && entry.id === raw?.outfit && artifactDiscoveries[entry.id] === 'stored') ? raw.outfit : null,
    missionaryTagEquipped: artifactDiscoveries['missionary-tag'] === 'stored' && raw?.missionaryTagEquipped === true
  };
}

