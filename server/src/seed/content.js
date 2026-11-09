// Conteúdo real do catálogo (programação de novembro e dezembro de 2026 no Porto e em Braga).
// Fontes: páginas oficiais dos espaços (Casa da Música, Teatro Nacional São João, Batalha Centro
// de Cinema, Theatro Circo), Festival de Cannes e Agenda Cultural do Porto, consultadas a 9/11/2026.
// As imagens são capas gráficas do próprio projeto (não usamos fotografias com direitos de autor).
// Horas em UTC (Portugal continental está em UTC+0 em novembro e dezembro).

const cover = (name) => `/images/${name}.svg`;

const venues = [
  {
    slug: 'casa-da-musica', name: 'Casa da Música', type: 'Sala de concertos', city: 'Porto',
    address: 'Av. da Boavista 604-610, 4149-071 Porto', website: 'https://casadamusica.com',
    description: 'Sala de concertos do Porto, casa da Orquestra Sinfónica do Porto e do Remix Ensemble. Programa música clássica, contemporânea, jazz e outros géneros ao longo de todo o ano.',
    imageUrl: cover('cover-music'), featured: true
  },
  {
    slug: 'teatro-nacional-sao-joao', name: 'Teatro Nacional São João', type: 'Teatro', city: 'Porto',
    address: 'Praça da Batalha, 4000-102 Porto', website: 'https://www.tnsj.pt',
    description: 'Teatro nacional sediado no Porto, na Praça da Batalha. Produz e acolhe teatro, dança e coproduções internacionais, e gere também o Mosteiro de São Bento da Vitória.',
    imageUrl: cover('cover-venue'), featured: true
  },
  {
    slug: 'batalha-centro-de-cinema', name: 'Batalha Centro de Cinema', type: 'Cinema', city: 'Porto',
    address: 'Praça da Batalha 47, 4000-101 Porto', website: 'https://www.batalhacentrodecinema.pt',
    description: 'Cinema municipal do Porto instalado no antigo Cinema Batalha. Mostra estreias, ciclos, antestreias e cinema de autor, português e internacional.',
    imageUrl: cover('cover-cinema')
  },
  {
    slug: 'theatro-circo', name: 'Theatro Circo', type: 'Teatro', city: 'Braga',
    address: 'Av. da Liberdade 697, 4710-251 Braga', website: 'https://theatrocirco.com',
    description: 'Teatro histórico de Braga, com programação de música, teatro, dança, cinema e atividades para famílias e escolas.',
    imageUrl: cover('cover-north'), featured: true
  }
];

const artists = [
  {
    slug: 'marlene-monteiro-freitas', name: 'Marlene Monteiro Freitas', location: 'Lisboa', disciplines: ['Dança', 'Coreografia'],
    bio: 'Coreógrafa e intérprete nascida em Cabo Verde. Os seus espetáculos misturam dança, música e máscara. Em dezembro de 2026 apresenta Nôt no Theatro Circo, peça inspirada em As Mil e Uma Noites.',
    imageUrl: cover('cover-artist'), featured: true
  },
  {
    slug: 'victor-hugo-pontes', name: 'Victor Hugo Pontes', location: 'Porto', disciplines: ['Dança', 'Coreografia'],
    bio: 'Coreógrafo português. Com a Companhia Maior, formada por intérpretes mais velhos, criou A esta hora, na infância neva, peça em que dançam juntos corpos de várias idades.',
    imageUrl: cover('cover-art')
  },
  {
    slug: 'remix-ensemble', name: 'Remix Ensemble Casa da Música', location: 'Porto', disciplines: ['Música contemporânea'],
    bio: 'Agrupamento de música contemporânea da Casa da Música. No fim de 2026 leva ao Porto e a Braga um programa que junta Pierre Boulez e Frank Zappa, dirigido por Susanne Blumenthal.',
    imageUrl: cover('cover-music'), featured: true
  },
  {
    slug: 'tiago-guedes', name: 'Tiago Guedes', location: 'Portugal', disciplines: ['Cinema', 'Realização'],
    bio: 'Realizador português. O seu filme Aquí, inspirado na trilogia de Jesus de J. M. Coetzee, estreou na Cannes Première, no Festival de Cannes de 2026.',
    imageUrl: cover('cover-cinema'), featured: true
  },
  {
    slug: 'marta-pazos', name: 'Marta Pazos', location: 'Galiza', disciplines: ['Teatro', 'Encenação'],
    bio: 'Encenadora galega. Assina uma nova leitura do Auto da Barca do Inferno, de Gil Vicente, em coprodução do Teatro Nacional São João com o Centro Dramático Galego.',
    imageUrl: cover('cover-venue')
  },
  {
    slug: 'lambchop', name: 'Lambchop', location: 'Nashville, EUA', disciplines: ['Música'],
    bio: 'Banda norte-americana de Nashville liderada por Kurt Wagner. Apresenta em Braga o disco Punching the Clown, com influências de gospel, soul, jazz e country.',
    imageUrl: cover('cover-music')
  }
];

const works = [
  {
    slug: 'aqui-tiago-guedes', title: 'Aquí', subtitle: 'Filme de Tiago Guedes (2026)', type: 'film', category: 'cinema', creator: 'Tiago Guedes',
    description: 'Simón conhece um rapaz, David, numa travessia por mar até uma terra sem nome. Com Inés, formam uma família pouco convencional, enquanto a sociedade tenta encaixar David nas suas regras. Com Albano Jerónimo, Patricia López Arnaiz e Manolo Solo. Coprodução Portugal–França, falada em espanhol.',
    officialUrl: 'https://www.festival-cannes.com/en/f/aqui/', imageUrl: cover('cover-cinema'), releasedAt: null, featured: true
  },
  {
    slug: 'punching-the-clown-lambchop', title: 'Punching the Clown', subtitle: 'Disco de Lambchop', type: 'album', category: 'musica', creator: 'Lambchop',
    description: 'Disco da banda de Kurt Wagner, apresentado ao vivo no Theatro Circo a 21 de novembro de 2026. Junta influências de gospel, soul, jazz e country.',
    officialUrl: 'https://theatrocirco.com/en/event/lambchop-en/', imageUrl: cover('cover-music'), releasedAt: null, featured: true
  },
  {
    slug: 'le-marteau-sans-maitre', title: 'Le marteau sans maître', subtitle: 'Pierre Boulez (1955)', type: 'creative-project', category: 'musica', creator: 'Pierre Boulez',
    description: 'Obra para voz e ensemble sobre poemas de René Char, estreada em 1955. Combina voz e instrumentos num mundo de timbres e ritmos em constante mudança. Interpretada pelo Remix Ensemble no Porto e em Braga em dezembro de 2026.',
    officialUrl: 'https://casadamusica.com/event/boulez-e-zappa/?selected_session=44156', imageUrl: cover('cover-book'), releasedAt: null
  },
  {
    slug: 'memorias-do-carcere-sergio-graciano', title: 'Memórias do Cárcere', subtitle: 'Filme de Sérgio Graciano (2026)', type: 'film', category: 'cinema', creator: 'Sérgio Graciano',
    description: 'Filme português de 2026 sobre Camilo Castelo Branco, em destaque no ciclo Cinema no Theatro, no Theatro Circo, em dezembro de 2026.',
    officialUrl: 'https://theatrocirco.com/en/programme/', imageUrl: cover('cover-photo'), releasedAt: null
  }
];

const events = [
  {
    slug: 'auto-da-barca-do-inferno-marta-pazos-tnsj', title: 'Auto da Barca do Inferno', subtitle: 'Gil Vicente, encenação de Marta Pazos', category: 'teatro', venue: 'teatro-nacional-sao-joao',
    city: 'Porto', organizer: 'Teatro Nacional São João e Centro Dramático Galego', startsAt: '2026-11-12T19:00:00Z', endsAt: '2026-12-13T21:00:00Z',
    description: 'Nova leitura do texto de Gil Vicente que junta teatro, dança e artes visuais. As personagens chegam a um cais onde um Anjo e um Diabo decidem o destino de cada alma. Cerca de 90 minutos, M/12, bilhetes de 10 € a 16 €.',
    officialUrl: 'https://www.bol.pt/Comprar/Bilhetes/182996-auto_da_barca_do_inferno_gil_vicente-teatro_nacional_sao_joao/', imageUrl: cover('cover-venue'), featured: true
  },
  {
    slug: 'a-esta-hora-na-infancia-neva-theatro-circo', title: 'A esta hora, na infância neva', subtitle: 'Victor Hugo Pontes e Companhia Maior', category: 'teatro', venue: 'theatro-circo',
    city: 'Braga', organizer: 'Theatro Circo', startsAt: '2026-11-13T21:30:00Z', endsAt: null,
    description: 'Espetáculo de dança em que intérpretes de diferentes idades dançam juntos, dando destaque à expressividade dos corpos maduros. Sala Principal, M/12, 12 €.',
    officialUrl: 'https://theatrocirco.com/en/event/at-this-time-its-snowing-in-childhood/', imageUrl: cover('cover-art')
  },
  {
    slug: 'an-evening-with-lambchop-theatro-circo', title: 'An evening with Lambchop', subtitle: 'Apresentação de Punching the Clown', category: 'musica', venue: 'theatro-circo',
    city: 'Braga', organizer: 'Theatro Circo', startsAt: '2026-11-21T21:30:00Z', endsAt: null,
    description: 'Concerto de apresentação do disco Punching the Clown, com influências de gospel, soul, jazz e country. Sala Principal, M/6, 20 €.',
    officialUrl: 'https://theatrocirco.com/en/event/lambchop-en/', imageUrl: cover('cover-music'), featured: true
  },
  {
    slug: 'caterina-barbieri-eliane-radigue-onceim-theatro-circo', title: 'Caterina Barbieri & Éliane Radigue', subtitle: 'Contraponto, por ONCEIM', category: 'musica', venue: 'theatro-circo',
    city: 'Braga', organizer: 'Theatro Circo', startsAt: '2026-11-28T21:30:00Z', endsAt: null,
    description: 'O ensemble ONCEIM interpreta obras de Éliane Radigue (Occam Ocean) e uma nova criação de Caterina Barbieri. Ciclo Contraponto, Sala Principal, M/6, 12 €.',
    officialUrl: 'https://theatrocirco.com/en/event/contraponto-caterina-barbieri-eliane-radigue-en/', imageUrl: cover('cover-music')
  },
  {
    slug: 'aqui-antestreia-batalha', title: 'Aquí — antestreia', subtitle: 'Filme de Tiago Guedes', category: 'cinema', venue: 'batalha-centro-de-cinema',
    city: 'Porto', organizer: 'Batalha Centro de Cinema', startsAt: '2026-12-01T17:15:00Z', endsAt: null,
    description: 'Antestreia no Porto do novo filme de Tiago Guedes, depois da passagem pelo Festival de Cannes. Sala 1, falado em espanhol com legendas em português, M/14, 5 €.',
    officialUrl: 'https://batalhacentrocinema.bol.pt/Comprar/Bilhetes/182102/1966418/Sectores', imageUrl: cover('cover-cinema'), featured: true
  },
  {
    slug: 'boulez-e-zappa-casa-da-musica', title: 'Boulez e Zappa', subtitle: 'Remix Ensemble Casa da Música', category: 'musica', venue: 'casa-da-musica',
    city: 'Porto', organizer: 'Casa da Música', startsAt: '2026-12-02T19:30:00Z', endsAt: null,
    description: 'Le marteau sans maître, de Pierre Boulez, e The Perfect Stranger, de Frank Zappa. Remix Ensemble dirigido por Susanne Blumenthal, com a soprano Christina Bock. Bilhetes de 22 € a 26 €.',
    officialUrl: 'https://casadamusica.com/event/boulez-e-zappa/?selected_session=44156', imageUrl: cover('cover-music')
  },
  {
    slug: 'not-marlene-monteiro-freitas-theatro-circo', title: 'Nôt', subtitle: 'Marlene Monteiro Freitas', category: 'teatro', venue: 'theatro-circo',
    city: 'Braga', organizer: 'Theatro Circo', startsAt: '2026-12-11T21:30:00Z', endsAt: null,
    description: 'Espetáculo de dança inspirado em As Mil e Uma Noites, centrado na narração como forma de resistência. Sala Principal, M/12, 12 €.',
    officialUrl: 'https://theatrocirco.com/en/event/not-en/', imageUrl: cover('cover-art'), featured: true
  }
];

const articles = [
  {
    slug: 'sete-propostas-para-o-fim-de-2026-entre-porto-e-braga', title: 'Sete propostas para o fim de 2026 entre o Porto e Braga', subtitle: 'Guia', category: 'cultura-independente',
    excerpt: 'Teatro, dança, cinema e música contemporânea: uma seleção da programação de novembro e dezembro nos dois lados do Minho e do Douro.',
    body: 'Novembro e dezembro trazem programação forte ao Porto e a Braga. Reunimos sete propostas, todas com ligação para a página oficial.\n\nNo Porto, o Teatro Nacional São João estreia a 12 de novembro o Auto da Barca do Inferno encenado por Marta Pazos, em cena até 13 de dezembro. A 1 de dezembro, o Batalha Centro de Cinema mostra em antestreia Aquí, de Tiago Guedes, e no dia seguinte a Casa da Música junta Boulez e Zappa num programa do Remix Ensemble.\n\nEm Braga, o Theatro Circo abre com A esta hora, na infância neva, de Victor Hugo Pontes e da Companhia Maior (13 de novembro), recebe Lambchop (21 de novembro) e o ensemble ONCEIM com música de Caterina Barbieri e Éliane Radigue (28 de novembro). A 11 de dezembro, Marlene Monteiro Freitas apresenta Nôt.\n\nAs datas e os preços podem mudar: confirma sempre na página do espaço antes de saíres.',
    imageUrl: cover('cover-collection'), featured: true, publishedAt: '2026-11-09T10:00:00Z'
  },
  {
    slug: 'boulez-e-zappa-no-porto-e-em-braga', title: 'Boulez e Zappa, o mesmo programa no Porto e em Braga', subtitle: 'Música contemporânea', category: 'musica',
    excerpt: 'O Remix Ensemble toca Le marteau sans maître e The Perfect Stranger na Casa da Música a 2 de dezembro e no Theatro Circo a 4 de dezembro.',
    body: 'Pierre Boulez e Frank Zappa parecem vir de mundos diferentes, mas cruzaram-se: em 1984, Boulez dirigiu música de Zappa. É esse encontro que o Remix Ensemble Casa da Música revisita, sob a direção de Susanne Blumenthal.\n\nDe um lado está Le marteau sans maître, obra de Boulez para voz e ensemble sobre poemas de René Char. Do outro, The Perfect Stranger, em que Zappa leva a irreverência do rock para o contexto orquestral.\n\nO programa passa pela Casa da Música a 2 de dezembro, com a soprano Christina Bock, e pelo Theatro Circo a 4 de dezembro, no ciclo Contraponto.',
    imageUrl: cover('cover-music'), featured: true, publishedAt: '2026-11-09T10:30:00Z'
  },
  {
    slug: 'gil-vicente-segundo-marta-pazos', title: 'Gil Vicente segundo Marta Pazos', subtitle: 'Teatro', category: 'teatro',
    excerpt: 'O Auto da Barca do Inferno volta ao palco do Teatro Nacional São João numa coprodução com o Centro Dramático Galego.',
    body: 'O Auto da Barca do Inferno é um dos textos mais conhecidos do teatro português. A encenadora galega Marta Pazos propõe uma leitura que junta teatro, dança e artes visuais e que procura a energia popular, crítica e satírica do original.\n\nA estrutura mantém-se: Fidalgo, Onzeneiro, Parvo, Sapateiro, Frade e Alcoviteira chegam a um cais onde o Anjo e o Diabo decidem o destino de cada alma.\n\nO espetáculo, coproduzido pelo Teatro Nacional São João e pelo Centro Dramático Galego, está em cena no Porto de 12 de novembro a 13 de dezembro de 2026.',
    imageUrl: cover('cover-venue'), publishedAt: '2026-11-09T11:00:00Z'
  }
];

const collections = [
  {
    slug: 'dezembro-no-porto-2026', title: 'Dezembro no Porto', description: 'Teatro, cinema e música contemporânea para fechar 2026 no Porto.',
    introduction: 'Uma seleção curta da programação de dezembro nas salas do Porto, com o Auto da Barca do Inferno ainda em cena.',
    coverImage: cover('cover-collection'), featured: true,
    items: [['events', 'auto-da-barca-do-inferno-marta-pazos-tnsj'], ['events', 'aqui-antestreia-batalha'], ['events', 'boulez-e-zappa-casa-da-musica'], ['works', 'aqui-tiago-guedes']]
  },
  {
    slug: 'theatro-circo-fim-de-2026', title: 'Theatro Circo no fim de 2026', description: 'Dança e música no Theatro Circo, em Braga, entre novembro e dezembro.',
    introduction: 'Quatro noites no Theatro Circo, da dança de Victor Hugo Pontes e de Marlene Monteiro Freitas à música de Lambchop e do ONCEIM.',
    coverImage: cover('cover-north'), featured: true,
    items: [['events', 'a-esta-hora-na-infancia-neva-theatro-circo'], ['events', 'an-evening-with-lambchop-theatro-circo'], ['events', 'caterina-barbieri-eliane-radigue-onceim-theatro-circo'], ['events', 'not-marlene-monteiro-freitas-theatro-circo']]
  }
];

// Ligações "relacionados" (origem → destino), por slug.
const relations = [
  ['events', 'auto-da-barca-do-inferno-marta-pazos-tnsj', 'artists', 'marta-pazos'],
  ['events', 'a-esta-hora-na-infancia-neva-theatro-circo', 'artists', 'victor-hugo-pontes'],
  ['events', 'an-evening-with-lambchop-theatro-circo', 'artists', 'lambchop'],
  ['events', 'an-evening-with-lambchop-theatro-circo', 'works', 'punching-the-clown-lambchop'],
  ['events', 'aqui-antestreia-batalha', 'artists', 'tiago-guedes'],
  ['events', 'aqui-antestreia-batalha', 'works', 'aqui-tiago-guedes'],
  ['events', 'boulez-e-zappa-casa-da-musica', 'artists', 'remix-ensemble'],
  ['events', 'boulez-e-zappa-casa-da-musica', 'works', 'le-marteau-sans-maitre'],
  ['events', 'not-marlene-monteiro-freitas-theatro-circo', 'artists', 'marlene-monteiro-freitas'],
  ['works', 'aqui-tiago-guedes', 'artists', 'tiago-guedes'],
  ['works', 'punching-the-clown-lambchop', 'artists', 'lambchop'],
  ['articles', 'boulez-e-zappa-no-porto-e-em-braga', 'events', 'boulez-e-zappa-casa-da-musica'],
  ['articles', 'boulez-e-zappa-no-porto-e-em-braga', 'works', 'le-marteau-sans-maitre'],
  ['articles', 'gil-vicente-segundo-marta-pazos', 'events', 'auto-da-barca-do-inferno-marta-pazos-tnsj'],
  ['articles', 'gil-vicente-segundo-marta-pazos', 'artists', 'marta-pazos'],
  ['articles', 'sete-propostas-para-o-fim-de-2026-entre-porto-e-braga', 'collections', 'dezembro-no-porto-2026'],
  ['articles', 'sete-propostas-para-o-fim-de-2026-entre-porto-e-braga', 'collections', 'theatro-circo-fim-de-2026']
];

module.exports = { venues, artists, works, events, articles, collections, relations };
