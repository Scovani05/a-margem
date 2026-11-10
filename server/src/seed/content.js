// Conteúdo real do catálogo: cultura portuguesa no outono/inverno de 2026 - discos novos,
// exposições e concertos de artistas portugueses. Fontes consultadas a 9/11/2026: Rimas e Batidas
// ("20 discos portugueses que vão sair até ao final do ano"), agenda musica.com.pt, Coliseu dos
// Recreios, MAAT, Museu do Fado, Casa Fernando Pessoa, RTP, Teatro Nacional São João, Theatro Circo
// e Batalha Centro de Cinema. Horas em UTC (Portugal continental está em UTC+0 nesta época).
//
// Imagens: fotografias reais dos edifícios e de objetos, com licença livre, alojadas no Wikimedia
// Commons (os créditos estão em imageCredits, no fim do ficheiro, e no README). Não usamos
// fotografias de pessoas nem capas de discos/cartazes, que têm direitos de autor.

const wm = (path, file, original = false) => (original
  ? `https://upload.wikimedia.org/wikipedia/commons/${path}/${file}`
  : `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${file}/1280px-${file}`);

const img = {
  coliseuPorto: wm('4/4a', 'Coliseu_do_Porto_-_Portugal_%2832759753402%29.jpg'),
  coliseuLisboa: wm('8/8d', 'Lisboa_-_Panorama_-_06_-_Vista_desde_el_Jard%C3%ADn_de_San_Pedro_de_Alc%C3%A1ntara_%28cropped%29_Coliseu.jpg', true),
  casaDaMusica: wm('d/d6', 'Casa_da_Musica_Porto_2018.jpg'),
  maat: wm('1/10', 'MAAT_building_%2829881354613%29.jpg'),
  maatNoite: wm('1/16', 'MAAT_night_perspective_building%282016%29_-_Amanda_Levete_%2844463379030%29.jpg'),
  museuFado: wm('5/56', 'Museu_do_Fado_-_Lisboa_-_Portugal_%2850733179817%29.jpg'),
  tnsj: wm('1/1f', 'Teatro_Nacional_Sao_Joao_in_Porto_%283%29.jpg'),
  theatroCirco: wm('0/09', 'Theatro_Circo_2025_15.jpg'),
  batalha: wm('b/b2', 'Cinema_Batalha_-_Porto_-_Portugal_%2832991530692%29.jpg'),
  pomar: wm('3/35', 'Atelier-Museu_J%C3%BAlio_Pomar.jpg'),
  pessoa: wm('8/88', 'Casa_Fernando_Pessoa_Fachada.jpg'),
  vinil: wm('4/4c', 'Groove_and_needle_in_close_embrace_from_beginning_to_end.jpg'),
  vinil2: wm('c/c1', 'Das_Vinyl_dreht_sich.jpg'),
  guitarra: wm('0/01', '2_Portuguese_guitars.jpg'),
  guitarra2: wm('9/9a', 'Portuguese_guitar_%2853631859481%29.jpg'),
  alfama: wm('0/07', 'Alfama_0001.jpg'),
  ribeira: wm('8/8f', 'Cais_da_Ribeira_in_Porto_%285%29.jpg'),
  macCcb: wm('8/87', 'MAC_CCB_Museu_de_Arte_Contempor%C3%A2nea_%2853875750868%29.jpg'),
  aulaMagna: wm('2/2c', 'Aula_Magna_da_Universidade_de_Lisboa_-_Portugal_%F0%9F%87%B5%F0%9F%87%B9_%2853886407323%29.jpg'),
  trindade: wm('1/18', 'Teatro_da_Trindade%2C_Lisboa_%2847709760741%29.jpg'),
  saDaBandeira: wm('e/ef', 'Teatro_Sa_da_Bandeira.jpg'),
  saoJorge: wm('3/32', 'Cinema_S%C3%A3o_Jorge.jpg', true),
  culturgest: wm('f/f5', 'Culturgest%2C_Edif%C3%ADcio-sede_da_Caixa_Geral_de_Dep%C3%B3sitos_01.jpg', true),
  serralves: wm('7/74', 'Museu_Serralves_exterior_%28Porto%29.jpg'),
  lello: wm('a/aa', 'Interior_view_of_Livraria_Lello_08.jpg')
};

const RIMAS = 'https://www.rimasebatidas.pt/20-discos-portugueses-que-vao-sair-ate-ao-final-do-ano/';

const venues = [
  {
    slug: 'coliseu-dos-recreios', name: 'Coliseu dos Recreios', type: 'Sala de espetáculos', city: 'Lisboa',
    address: 'Rua das Portas de Santo Antão 96, 1150-269 Lisboa', website: 'https://coliseulisboa.com',
    description: 'Uma das maiores salas de espetáculos de Lisboa, inaugurada em 1890. Recebe concertos, ópera, bailado e o tradicional circo de Natal.',
    imageUrl: img.coliseuLisboa, featured: true
  },
  {
    slug: 'coliseu-porto-ageas', name: 'Coliseu Porto Ageas', type: 'Sala de espetáculos', city: 'Porto',
    address: 'Rua de Passos Manuel 137, 4000-385 Porto', website: 'https://www.coliseu.pt',
    description: 'Sala histórica da Baixa do Porto, com fachada art déco. É um dos palcos principais para concertos de música portuguesa na cidade.',
    imageUrl: img.coliseuPorto, featured: true
  },
  {
    slug: 'casa-da-musica', name: 'Casa da Música', type: 'Sala de concertos', city: 'Porto',
    address: 'Av. da Boavista 604-610, 4149-071 Porto', website: 'https://casadamusica.com',
    description: 'Sala de concertos do Porto, projetada por Rem Koolhaas. Programa música clássica, contemporânea, jazz, pop e música portuguesa ao longo de todo o ano.',
    imageUrl: img.casaDaMusica, featured: true
  },
  {
    slug: 'maat', name: 'MAAT - Museu de Arte, Arquitetura e Tecnologia', type: 'Museu', city: 'Lisboa',
    address: 'Av. Brasília, Central Tejo, 1300-598 Lisboa', website: 'https://www.maat.pt',
    description: 'Museu da Fundação EDP à beira do Tejo, em Belém. Em 2026 celebra 10 anos com exposições de Pedro Cabrita Reis e Joana Vasconcelos.',
    imageUrl: img.maat, featured: true
  },
  {
    slug: 'museu-do-fado', name: 'Museu do Fado', type: 'Museu', city: 'Lisboa',
    address: 'Largo do Chafariz de Dentro 1, 1100-139 Lisboa', website: 'https://www.museudofado.pt',
    description: 'Museu dedicado ao fado e à guitarra portuguesa, em Alfama. Tem exposição permanente, exposições temporárias e uma escola de guitarra.',
    imageUrl: img.museuFado
  },
  {
    slug: 'atelier-museu-julio-pomar', name: 'Atelier-Museu Júlio Pomar', type: 'Museu', city: 'Lisboa',
    address: 'Rua do Vale 7, 1200-472 Lisboa', website: 'https://www.ateliermuseujuliopomar.pt',
    description: 'Antigo armazém transformado em museu por Álvaro Siza, onde se mostra a obra de Júlio Pomar em diálogo com artistas contemporâneos.',
    imageUrl: img.pomar
  },
  {
    slug: 'casa-fernando-pessoa', name: 'Casa Fernando Pessoa', type: 'Casa-museu', city: 'Lisboa',
    address: 'Rua Coelho da Rocha 16, 1250-088 Lisboa', website: 'https://www.casafernandopessoa.pt',
    description: 'Casa onde Fernando Pessoa viveu os últimos 15 anos da sua vida, em Campo de Ourique. Hoje é museu, biblioteca e centro de poesia.',
    imageUrl: img.pessoa
  },
  {
    slug: 'teatro-nacional-sao-joao', name: 'Teatro Nacional São João', type: 'Teatro', city: 'Porto',
    address: 'Praça da Batalha, 4000-102 Porto', website: 'https://www.tnsj.pt',
    description: 'Teatro nacional sediado no Porto, na Praça da Batalha. Produz e acolhe teatro, dança e coproduções internacionais.',
    imageUrl: img.tnsj
  },
  {
    slug: 'theatro-circo', name: 'Theatro Circo', type: 'Teatro', city: 'Braga',
    address: 'Av. da Liberdade 697, 4710-251 Braga', website: 'https://theatrocirco.com',
    description: 'Teatro histórico de Braga, com programação de música, teatro, dança e cinema.',
    imageUrl: img.theatroCirco
  },
  {
    slug: 'batalha-centro-de-cinema', name: 'Batalha Centro de Cinema', type: 'Cinema', city: 'Porto',
    address: 'Praça da Batalha 47, 4000-101 Porto', website: 'https://www.batalhacentrodecinema.pt',
    description: 'Cinema municipal do Porto instalado no antigo Cinema Batalha. Mostra estreias, ciclos e cinema português e de autor.',
    imageUrl: img.batalha
  },
  {
    slug: 'aula-magna', name: 'Aula Magna', type: 'Auditório', city: 'Lisboa',
    address: 'Alameda da Universidade, Edifício da Reitoria, 1649-004 Lisboa', website: 'https://www.ulisboa.pt',
    description: 'Grande auditório da Universidade de Lisboa, na Cidade Universitária. Recebe concertos, conferências e espetáculos de humor.',
    imageUrl: img.aulaMagna
  },
  {
    slug: 'teatro-da-trindade', name: 'Teatro da Trindade', type: 'Teatro', city: 'Lisboa',
    address: 'Largo da Trindade 7A, 1200-466 Lisboa', website: 'https://teatrotrindade.inatel.pt',
    description: 'Teatro histórico do Chiado, gerido pela Fundação INATEL, com teatro, música e stand-up.',
    imageUrl: img.trindade
  },
  {
    slug: 'teatro-sa-da-bandeira', name: 'Teatro Sá da Bandeira', type: 'Teatro', city: 'Porto',
    address: 'R. de Sá da Bandeira 108, 4000-427 Porto', website: 'https://teatrosadabandeira.pt',
    description: 'Um dos teatros mais antigos do Porto, na Baixa, com uma programação forte de stand-up comedy na Sala Principal e no Estúdio Latino.',
    imageUrl: img.saDaBandeira
  },
];

const artists = [
  {
    slug: 'ana-lua-caiano', name: 'Ana Lua Caiano', location: 'Lisboa', disciplines: ['Música', 'Eletrónica'],
    bio: 'Cantora e produtora que junta eletrónica e sons da música tradicional portuguesa. Lançou a 6 de novembro de 2026 o segundo álbum, Devagar Que A Vida É Curta, pela Glitterbeat Records.',
    imageUrl: img.vinil, featured: true
  },
  {
    slug: 'iolanda', name: 'IOLANDA', location: 'Portugal', disciplines: ['Música', 'Pop'],
    bio: 'Cantora que representou Portugal no Festival Eurovisão da Canção de 2024 com "Grito". O álbum Quebranto (outubro de 2026) cruza pop urbana com o fado e a viola braguesa. Atua no Coliseu dos Recreios a 7 de dezembro.',
    imageUrl: img.guitarra2, featured: true
  },
  {
    slug: 'benjamim', name: 'Benjamim', location: 'Lisboa', disciplines: ['Música', 'Canção'],
    bio: 'Músico e produtor português. Crónicas do Monte Zeus (setembro de 2026) é o quinto álbum e marca o regresso à canção depois do instrumental As Berlengas.',
    imageUrl: img.vinil2
  },
  {
    slug: 'linda-martini', name: 'Linda Martini', location: 'Lisboa', disciplines: ['Música', 'Rock'],
    bio: 'Banda rock de Lisboa, formada em 2003, uma das mais marcantes do rock alternativo cantado em português. Toca no Coliseu do Porto a 11 de novembro de 2026.',
    imageUrl: img.coliseuPorto, featured: true
  },
  {
    slug: 'bruno-pernadas', name: 'Bruno Pernadas', location: 'Lisboa', disciplines: ['Música', 'Jazz', 'Composição'],
    bio: 'Compositor, guitarrista e produtor que mistura jazz, pop e música do mundo. Tem concerto anunciado em Lisboa a 30 de novembro de 2026, na Casa Capitão.',
    imageUrl: img.casaDaMusica
  },
  {
    slug: 'pedro-cabrita-reis', name: 'Pedro Cabrita Reis', location: 'Lisboa', disciplines: ['Artes visuais', 'Escultura', 'Pintura'],
    bio: 'Artista nascido em Lisboa em 1956, com obra em escultura, pintura e desenho. Representou Portugal na Bienal de Veneza de 2003. No MAAT mostra quase 200 obras inéditas.',
    imageUrl: img.maatNoite, featured: true
  },
  {
    slug: 'joana-vasconcelos', name: 'Joana Vasconcelos', location: 'Lisboa', disciplines: ['Artes visuais', 'Escultura'],
    bio: 'Artista plástica de Lisboa conhecida pelas esculturas monumentais e pelo uso de têxteis e objetos do quotidiano. No MAAT cruza a sua obra com a alta-costura de Valentino.',
    imageUrl: img.maat
  },
  {
    slug: 'tiago-guedes', name: 'Tiago Guedes', location: 'Portugal', disciplines: ['Cinema', 'Realização'],
    bio: 'Realizador português. O seu filme Aquí, inspirado na trilogia de Jesus de J. M. Coetzee, estreou na Cannes Première, no Festival de Cannes de 2026.',
    imageUrl: img.batalha
  },
  {
    slug: 'marlene-monteiro-freitas', name: 'Marlene Monteiro Freitas', location: 'Lisboa', disciplines: ['Dança', 'Coreografia'],
    bio: 'Coreógrafa e intérprete nascida em Cabo Verde e radicada em Portugal. Em dezembro de 2026 apresenta Nôt no Theatro Circo, peça inspirada em As Mil e Uma Noites.',
    imageUrl: img.theatroCirco
  },
  {
    slug: 'hugo-sousa', name: 'Hugo Sousa', location: 'Portugal', disciplines: ['Comédia', 'Stand-up'],
    bio: 'Humorista português de stand-up. Em 2026 estreou Aqui Entre Nós, um solo sobre a vida, a família e as diferenças entre gerações.',
    imageUrl: img.aulaMagna
  },
  {
    slug: 'diogo-faro', name: 'Diogo Faro', location: 'Lisboa', disciplines: ['Comédia', 'Stand-up'],
    bio: 'Humorista português conhecido pelo stand-up de observação social. Massa Mãe é o seu novo solo, estreado no Porto em 2026.',
    imageUrl: img.trindade
  },
  {
    slug: 'ana-garcia-martins', name: 'Ana Garcia Martins', location: 'Lisboa', disciplines: ['Comédia', 'Stand-up', 'Escrita'],
    bio: 'Humorista e autora, conhecida pelo blogue A Pipoca Mais Doce. Insuficiente é o seu novo solo de stand-up.',
    imageUrl: img.saDaBandeira
  },
];

const works = [
  {
    slug: 'devagar-que-a-vida-e-curta-ana-lua-caiano', title: 'Devagar Que A Vida É Curta', subtitle: 'Ana Lua Caiano (2026)', type: 'album', category: 'musica', creator: 'Ana Lua Caiano',
    description: 'Segundo álbum de Ana Lua Caiano, editado pela Glitterbeat Records. Mantém a mistura de eletrónica com a música tradicional portuguesa, agora com mais teclas, sopros e harmonias vocais.',
    officialUrl: RIMAS, imageUrl: img.vinil, releasedAt: '2026-11-06', featured: true
  },
  {
    slug: 'quebranto-iolanda', title: 'Quebranto', subtitle: 'IOLANDA (2026)', type: 'album', category: 'musica', creator: 'IOLANDA',
    description: 'Pop urbana contemporânea com raízes na música tradicional portuguesa, do fado à viola braguesa.',
    officialUrl: RIMAS, imageUrl: img.guitarra2, releasedAt: '2026-10-08', featured: true
  },
  {
    slug: 'cronicas-do-monte-zeus-benjamim', title: 'Crónicas do Monte Zeus', subtitle: 'Benjamim (2026)', type: 'album', category: 'musica', creator: 'Benjamim',
    description: 'Quinto álbum de estúdio de Benjamim, editado pela Discos Submarinos. Um regresso à escrita de canções depois do disco instrumental As Berlengas.',
    officialUrl: RIMAS, imageUrl: img.vinil2, releasedAt: '2026-09-18', featured: true
  },
  {
    slug: 'catedral-gotica-niagara', title: 'Catedral Gótica', subtitle: 'Niagara (2026)', type: 'album', category: 'musica', creator: 'Niagara',
    description: 'Novo disco do trio de música eletrónica Niagara, editado pela Príncipe Discos. Sucede a De Motu (2024).',
    officialUrl: RIMAS, imageUrl: img.vinil, releasedAt: '2026-10-23'
  },
  {
    slug: '333-ak-adrix', title: '333', subtitle: 'A.K.Adrix (2026)', type: 'album', category: 'musica', creator: 'A.K.Adrix',
    description: 'Primeiro álbum do produtor em cerca de seis anos, depois de Código de Barras. Edição da Príncipe Discos.',
    officialUrl: RIMAS, imageUrl: img.vinil2, releasedAt: '2026-10-23'
  },
  {
    slug: 'jardim-celeste-mokina', title: 'Jardim Celeste', subtitle: 'mokina (2026)', type: 'album', category: 'musica', creator: 'mokina',
    description: 'Álbum de estreia de mokina: indie pop etéreo com texturas de eletrónica, lo-fi, R&B e soul.',
    officialUrl: RIMAS, imageUrl: img.vinil, releasedAt: '2026-11-06'
  },
  {
    slug: 'musica-menor-mas-feliz-pedro-da-linha', title: 'Música Menor Mas Feliz', subtitle: 'Pedro da Linha (2026)', type: 'album', category: 'musica', creator: 'Pedro da Linha',
    description: 'Disco que junta batidas eletrónicas a referências da música tradicional portuguesa.',
    officialUrl: RIMAS, imageUrl: img.guitarra, releasedAt: '2026-10-02'
  },
  {
    slug: 'aqui-tiago-guedes', title: 'Aquí', subtitle: 'Filme de Tiago Guedes (2026)', type: 'film', category: 'cinema', creator: 'Tiago Guedes',
    description: 'Simón conhece um rapaz, David, numa travessia por mar até uma terra sem nome. Com Inés, formam uma família pouco convencional. Com Albano Jerónimo, Patricia López Arnaiz e Manolo Solo. Coprodução Portugal-França.',
    officialUrl: 'https://www.festival-cannes.com/en/f/aqui/', imageUrl: img.batalha, releasedAt: null
  }
];

const events = [
  {
    slug: 'linda-martini-coliseu-porto-2026', title: 'Linda Martini', subtitle: '20 anos de Olhos de Mongol', category: 'musica', venue: 'coliseu-porto-ageas',
    city: 'Porto', organizer: 'Coliseu Porto Ageas', startsAt: '2026-11-11T21:00:00Z', endsAt: null,
    description: 'A banda lisboeta toca na íntegra Olhos de Mongol, o primeiro disco, 20 anos depois da edição. No Coliseu Box, o formato mais próximo do Coliseu do Porto.',
    officialUrl: 'https://www.coliseu.pt/evento/20261111-linda-martini-son-estrella-galicia', imageUrl: img.coliseuPorto, featured: true
  },
  {
    slug: 'luisa-sobral-cartas-de-desamor-casa-da-musica', title: 'Luísa Sobral - Cartas de Desamor', subtitle: 'Concerto', category: 'musica', venue: 'casa-da-musica',
    city: 'Porto', organizer: 'Casa da Música', startsAt: '2026-11-16T21:30:00Z', endsAt: null,
    description: 'Luísa Sobral apresenta Cartas de Desamor, o oitavo álbum, em que se aproxima da música tradicional portuguesa. Na Sala Suggia.',
    officialUrl: 'https://casadamusica.com/event/luisa-sobral/', imageUrl: img.casaDaMusica
  },
  {
    slug: 'janeiro-reticencias-coliseu-lisboa', title: 'janeiro - Reticências', subtitle: 'Uma nova versão de nós', category: 'musica', venue: 'coliseu-dos-recreios',
    city: 'Lisboa', organizer: 'Coliseu dos Recreios', startsAt: '2026-11-18T21:00:00Z', endsAt: null,
    description: 'janeiro apresenta em Lisboa Reticências, o novo álbum, no Coliseu Club do Coliseu dos Recreios.',
    officialUrl: 'https://coliseulisboa.com', imageUrl: img.coliseuLisboa
  },
  {
    slug: 'iolanda-coliseu-dos-recreios-2026', title: 'IOLANDA', subtitle: 'Apresentação de Quebranto', category: 'musica', venue: 'coliseu-dos-recreios',
    city: 'Lisboa', organizer: 'Coliseu dos Recreios', startsAt: '2026-12-07T21:00:00Z', endsAt: null,
    description: 'IOLANDA leva ao Coliseu dos Recreios as canções de Quebranto, o disco editado em outubro. Confirma o horário e os preços na bilheteira.',
    officialUrl: 'https://coliseulisboa.com', imageUrl: img.coliseuLisboa, featured: true
  },
  {
    slug: 'rodrigo-leao-alma-mater-misty-fest', title: 'Rodrigo Leão - Alma Mater', subtitle: 'Misty Fest', category: 'musica', venue: 'coliseu-dos-recreios',
    city: 'Lisboa', organizer: 'Misty Fest', startsAt: '2026-12-18T21:00:00Z', endsAt: null,
    description: 'Rodrigo Leão toca Alma Mater na íntegra, com ensemble, coro e as convidadas Adriana Calcanhotto e Lula Pena. Duas sessões, às 18:00 e às 21:00.',
    officialUrl: 'https://www.rodrigoleao.pt/en/rodrigo-leao-revisita-alma-mater-no-misty-fest-2026/', imageUrl: img.coliseuLisboa
  },
  {
    slug: 'pedro-cabrita-reis-sem-magoa-no-coracao-maat', title: 'Pedro Cabrita Reis - sem mágoa no coração', subtitle: 'Exposição no MAAT', category: 'artes-visuais', venue: 'maat',
    city: 'Lisboa', organizer: 'MAAT', startsAt: '2026-09-16T10:00:00Z', endsAt: '2027-02-15T19:00:00Z',
    description: 'Quase 200 obras, muitas nunca mostradas, entre pintura, desenho e escultura, feitas para a Galeria Oval do MAAT. Curadoria de João Pinharanda. O título vem de Hesíodo e da sua Idade de Ouro.',
    officialUrl: 'https://www.maat.pt/en/event/pedro-cabrita-reis-without-sorrow-heart', imageUrl: img.maatNoite, featured: true
  },
  {
    slug: 'venus-joana-vasconcelos-valentino-maat', title: 'VENUS - Valentino pelo olhar de Joana Vasconcelos', subtitle: 'Exposição no MAAT', category: 'artes-visuais', venue: 'maat',
    city: 'Lisboa', organizer: 'MAAT', startsAt: '2026-10-02T10:00:00Z', endsAt: '2027-02-22T19:00:00Z',
    description: 'Diálogo entre arte e alta-costura: obras de Joana Vasconcelos, antigas e novas, ao lado de cerca de 30 criações de Valentino Garavani. Faz parte dos 10 anos do MAAT.',
    officialUrl: 'https://www.maat.pt/en/news/venus-valentino-garavani-through-eyes-joana-vasconcelos-maat-october', imageUrl: img.maat, featured: true
  },
  {
    slug: 'tragedia-e-farsa-pomar-abrantes', title: 'Tragédia e Farsa', subtitle: 'Júlio Pomar e Gabriel Abrantes', category: 'artes-visuais', venue: 'atelier-museu-julio-pomar',
    city: 'Lisboa', organizer: 'Atelier-Museu Júlio Pomar', startsAt: '2026-11-05T10:00:00Z', endsAt: '2027-02-28T18:00:00Z',
    description: 'Cerca de 100 pinturas e desenhos que põem o neorrealismo de Júlio Pomar, dos anos 1940, a conversar com o olhar de Gabriel Abrantes sobre o trabalho precário de hoje - do trolha ao estafeta.',
    officialUrl: 'https://www.ateliermuseujuliopomar.pt', imageUrl: img.pomar
  },
  {
    slug: 'variacoes-para-carlos-paredes-museu-do-fado', title: 'Variações para Carlos Paredes', subtitle: 'Exposição no Museu do Fado', category: 'musica', venue: 'museu-do-fado',
    city: 'Lisboa', organizer: 'Museu do Fado', startsAt: '2025-06-07T10:00:00Z', endsAt: '2026-12-30T18:00:00Z',
    description: 'Exposição do centenário de Carlos Paredes, mestre da guitarra portuguesa: instrumentos, discos, documentos e filmes. Curadoria de Ivan Dias e António Manuel Nunes. Últimas semanas.',
    officialUrl: 'https://www.museudofado.pt/exposicao/variacoes-para-carlos-paredes', imageUrl: img.guitarra
  },
  {
    slug: 'a-arca-eterna-fernando-pessoa', title: 'A Arca Eterna: Fernando Pessoa e a Posteridade', subtitle: 'Exposição na Casa Fernando Pessoa', category: 'literatura', venue: 'casa-fernando-pessoa',
    city: 'Lisboa', organizer: 'Casa Fernando Pessoa', startsAt: '2025-11-27T10:00:00Z', endsAt: '2026-12-06T18:00:00Z',
    description: 'Como cresceu a lenda de Pessoa depois de 1935, a partir da famosa arca de inéditos. Curadoria de Antonio Sáez Delgado. Últimas semanas.',
    officialUrl: 'https://www.casafernandopessoa.pt/pt/cfp/visita/exposicao-temporaria/arca-eterna-fernando-pessoa-e-posteridade', imageUrl: img.pessoa
  },
  {
    slug: 'auto-da-barca-do-inferno-marta-pazos-tnsj', title: 'Auto da Barca do Inferno', subtitle: 'Gil Vicente, encenação de Marta Pazos', category: 'teatro', venue: 'teatro-nacional-sao-joao',
    city: 'Porto', organizer: 'Teatro Nacional São João e Centro Dramático Galego', startsAt: '2026-11-12T19:00:00Z', endsAt: '2026-12-13T21:00:00Z',
    description: 'Nova leitura do texto de Gil Vicente que junta teatro, dança e artes visuais. As personagens chegam a um cais onde um Anjo e um Diabo decidem o destino de cada alma. M/12, bilhetes de 10 € a 16 €.',
    officialUrl: 'https://www.tnsj.pt', imageUrl: img.tnsj
  },
  {
    slug: 'aqui-antestreia-batalha', title: 'Aquí - antestreia', subtitle: 'Filme de Tiago Guedes', category: 'cinema', venue: 'batalha-centro-de-cinema',
    city: 'Porto', organizer: 'Batalha Centro de Cinema', startsAt: '2026-12-01T17:15:00Z', endsAt: null,
    description: 'Antestreia no Porto do novo filme de Tiago Guedes, depois da passagem pelo Festival de Cannes. M/14, 5 €.',
    officialUrl: 'https://www.batalhacentrodecinema.pt', imageUrl: img.batalha
  },
  {
    slug: 'not-marlene-monteiro-freitas-theatro-circo', title: 'Nôt', subtitle: 'Marlene Monteiro Freitas', category: 'teatro', venue: 'theatro-circo',
    city: 'Braga', organizer: 'Theatro Circo', startsAt: '2026-12-11T21:30:00Z', endsAt: null,
    description: 'Espetáculo de dança inspirado em As Mil e Uma Noites, centrado na narração como forma de resistência. M/12, 12 €.',
    officialUrl: 'https://theatrocirco.com/en/event/not-en/', imageUrl: img.theatroCirco
  },
  {
    slug: 'hugo-sousa-aqui-entre-nos-aula-magna', title: 'Hugo Sousa - Aqui Entre Nós', subtitle: 'Stand-up comedy', category: 'comedia', venue: 'aula-magna',
    city: 'Lisboa', organizer: 'Aula Magna', startsAt: '2026-11-15T19:00:00Z', endsAt: null,
    description: 'O novo solo de stand-up de Hugo Sousa, feito de histórias de família, pequenos desastres do dia a dia e diferenças entre gerações. Duas sessões, às 19:00 e às 21:30.',
    officialUrl: 'https://www.agendalx.pt/events/event/aqui-entre-nos/', imageUrl: img.aulaMagna, featured: true
  },
  {
    slug: 'diogo-faro-massa-mae-trindade', title: 'Diogo Faro - Massa Mãe', subtitle: 'Stand-up comedy', category: 'comedia', venue: 'teatro-da-trindade',
    city: 'Lisboa', organizer: 'Teatro da Trindade', startsAt: '2026-12-15T21:00:00Z', endsAt: null,
    description: 'Diogo Faro faz o balanço das suas aventuras, dos podcasts às conversas com a avó, com o olhar sobre a sociedade que o tornou conhecido.',
    officialUrl: 'https://www.timeout.pt/lisboa/pt/coisas-para-fazer/massa-mae', imageUrl: img.trindade
  },
  {
    slug: 'ana-garcia-martins-insuficiente-sa-da-bandeira', title: 'Ana Garcia Martins - Insuficiente', subtitle: 'Stand-up comedy', category: 'comedia', venue: 'teatro-sa-da-bandeira',
    city: 'Porto', organizer: 'Teatro Sá da Bandeira', startsAt: '2026-12-18T21:00:00Z', endsAt: '2026-12-19T23:00:00Z',
    description: 'O novo solo de Ana Garcia Martins é sobre a sensação de não ser suficiente, a autocrítica e a síndrome do impostor. Duas noites, 18 e 19 de dezembro.',
    officialUrl: 'https://teatrosadabandeira.pt/evento/ana-garcia-martins-insuficiente/', imageUrl: img.saDaBandeira
  },
];

const articles = [
  {
    slug: 'sete-discos-portugueses-para-este-outono', title: 'Sete discos portugueses para ouvir neste outono', subtitle: 'Música', category: 'musica',
    excerpt: 'Da eletrónica da Príncipe Discos ao pop com raízes de IOLANDA: os álbuns portugueses que marcam o fim de 2026.',
    body: 'O fim de 2026 está cheio de música portuguesa nova. Escolhemos sete discos já editados.\n\nAna Lua Caiano lançou a 6 de novembro Devagar Que A Vida É Curta, pela Glitterbeat, e no mesmo dia chegou Jardim Celeste, a estreia de mokina. Em outubro, IOLANDA editou Quebranto, que cruza pop urbana com fado e viola braguesa, e Pedro da Linha mostrou Música Menor Mas Feliz.\n\nA Príncipe Discos editou no mesmo dia, 23 de outubro, Catedral Gótica, dos Niagara, e 333, o regresso de A.K.Adrix. Em setembro, Benjamim voltou à canção com Crónicas do Monte Zeus.\n\nFonte: Rimas e Batidas, "20 discos portugueses que vão sair até ao final do ano".',
    imageUrl: img.vinil, featured: true, publishedAt: '2026-11-09T10:00:00Z'
  },
  {
    slug: 'exposicoes-em-lisboa-ate-fevereiro', title: 'Cinco exposições portuguesas para ver em Lisboa', subtitle: 'Artes visuais', category: 'artes-visuais',
    excerpt: 'Cabrita Reis e Joana Vasconcelos nos 10 anos do MAAT, Pomar e Abrantes, Carlos Paredes e Fernando Pessoa.',
    body: 'O MAAT faz 10 anos e celebra com duas exposições de artistas portugueses: Pedro Cabrita Reis mostra quase 200 obras inéditas em sem mágoa no coração (até 15 de fevereiro de 2027) e Joana Vasconcelos junta a sua obra à alta-costura de Valentino em VENUS (até 22 de fevereiro).\n\nNo Atelier-Museu Júlio Pomar, Tragédia e Farsa (desde 5 de novembro) põe o neorrealismo de Pomar ao lado da pintura de Gabriel Abrantes sobre o trabalho precário.\n\nCorre para as últimas semanas de duas exposições: A Arca Eterna, na Casa Fernando Pessoa, fecha a 6 de dezembro, e Variações para Carlos Paredes, no Museu do Fado, a 30 de dezembro.',
    imageUrl: img.maatNoite, featured: true, publishedAt: '2026-11-09T10:30:00Z'
  },
  {
    slug: 'concertos-portugueses-que-fecham-2026', title: 'Os concertos portugueses que fecham 2026', subtitle: 'Agenda', category: 'musica',
    excerpt: 'Linda Martini, Luísa Sobral, janeiro, IOLANDA e Rodrigo Leão nos coliseus e na Casa da Música.',
    body: 'Novembro abre no Porto com Linda Martini, que a 11 de novembro tocam na íntegra Olhos de Mongol, 20 anos depois, no Coliseu Box (15 € em pré-venda, à venda em coliseu.pt). A 16, Luísa Sobral apresenta Cartas de Desamor na Sala Suggia da Casa da Música, com bilhetes de 25 € a 35 € no site da Casa da Música.\n\nEm Lisboa, o Coliseu dos Recreios recebe janeiro com Reticências no Coliseu Club (18 de novembro), IOLANDA com as canções de Quebranto num palco a 360 graus (7 de dezembro, de 18 € a 35 €) e Rodrigo Leão com Alma Mater no Misty Fest (18 de dezembro, às 18:00 e às 21:00). Os bilhetes do Coliseu vendem-se na bilheteira, em coliseulisboa.com e na BOL.\n\nFora desta lista, Bruno Pernadas tem concerto anunciado em Lisboa a 30 de novembro, na Casa Capitão.\n\nAs horas e os preços podem mudar: confirma sempre na página de cada concerto, que está ligada em cada ficha.',
    imageUrl: img.coliseuPorto, publishedAt: '2026-11-09T11:00:00Z'
  },
  // Notícias (secção Revista): factos confirmados nas fontes indicadas no fim de cada texto.
  {
    slug: 'leffest-2026-abre-com-paper-tiger', title: 'LEFFEST abre a 20.ª edição com Paper Tiger, de James Gray', subtitle: 'Notícia', category: 'cinema',
    excerpt: 'O Lisboa Film Festival decorre até 15 de novembro, com mais de 150 filmes e a antestreia de Aquí, de Tiago Guedes.',
    body: 'O LEFFEST - Lisboa Film Festival abriu a 6 de novembro a sua 20.ª edição com Paper Tiger, de James Gray, um drama sobre dois irmãos apanhados num esquema com a máfia russa, com Adam Driver, Scarlett Johansson e Miles Teller. O festival dirigido por Paulo Branco decorre até 15 de novembro.\n\nSão mais de 150 filmes entre antestreias, filmes premiados e retrospetivas, no Cinema São Jorge, no Nimas, na Culturgest, no Teatro do Bairro e, pela primeira vez, numa sala do NOS Vasco da Gama.\n\nDo lado português, Tiago Guedes apresenta a antestreia de Aquí e é alvo de uma retrospetiva. Entre os convidados anunciados estão David Cronenberg, Albert Serra, Willem Dafoe, Abel Ferrara e o músico Dino d\'Santiago.\n\nFonte: Sábado, 6 de novembro de 2026.',
    imageUrl: img.saoJorge, featured: true, publishedAt: '2026-11-06T12:00:00Z'
  },
  {
    slug: 'fundo-de-fomento-cultural-um-milhao-internacionalizacao', title: 'Um milhão de euros para levar a cultura portuguesa lá fora', subtitle: 'Notícia', category: 'cultura-independente',
    excerpt: 'O Fundo de Fomento Cultural abriu candidaturas a 2 de novembro para festivais, digressões, residências e feiras no estrangeiro em 2027.',
    body: 'O Fundo de Fomento Cultural tem um milhão de euros para apoiar a internacionalização da cultura portuguesa em 2027. As candidaturas abriram a 2 de novembro e fecham a 4 de janeiro de 2027, no portal gov.pt.\n\nO apoio é a fundo perdido e cobre até 80% das despesas elegíveis, com um limite de 50 mil euros por candidatura. Podem candidatar-se entidades privadas com sede em Portugal e mais de um ano de atividade.\n\nEntram festivais, feiras, bienais, exposições, mercados internacionais, digressões, residências artísticas e encontros profissionais, desde que aconteçam no estrangeiro entre 1 de janeiro e 31 de dezembro de 2027. É preciso mostrar uma oportunidade concreta, como um convite ou um contrato de uma entidade estrangeira.\n\nFonte: AICEP / Portugal Global, 30 de outubro de 2026.',
    imageUrl: '/images/cover-art.svg', publishedAt: '2026-10-30T12:00:00Z'
  },
  {
    slug: 'doclisboa-2026-premios-manuel-mozos', title: 'Manuel Mozos vence a competição portuguesa do Doclisboa', subtitle: 'Notícia', category: 'cinema',
    excerpt: 'A Voz de Todos - Jornal do Fundão foi escolhido por unanimidade; João Pedro Rodrigues e João Rui Guerra da Mata ganharam o prémio de realização.',
    body: 'A 24.ª edição do Doclisboa anunciou os premiados a 24 de outubro. Na competição portuguesa, o prémio de melhor filme foi para A Voz de Todos - Jornal do Fundão, de Manuel Mozos, por unanimidade. O prémio do júri distinguiu Hipogeus, de Raul Domingues, e Povo e Poder, de Ico Costa, recebeu o prémio Escola - ETIC.\n\nNa competição internacional, o Grande Prémio foi para Car la Lune, de Éric Baudelaire. João Pedro Rodrigues e João Rui Guerra da Mata receberam o prémio de melhor realização por 13 Alfinetes.\n\nO público escolheu Os continuadores da revolução, de Pedro Neves, e Casa do Artista: Não é permitido envelhecer, de Solveig Nordlund. A 25.ª edição está marcada para 14 a 24 de outubro de 2027.\n\nFonte: RTP / Lusa, 24 de outubro de 2026.',
    imageUrl: img.culturgest, publishedAt: '2026-10-25T10:00:00Z'
  },
  {
    slug: 'serralves-anri-sala-holzer-lee-ufan-alice-neel', title: 'O que ver em Serralves até janeiro', subtitle: 'Notícia', category: 'artes-visuais',
    excerpt: 'Anri Sala chega à ala oeste do museu em novembro; Jenny Holzer, Lee Ufan e Alice Neel continuam até janeiro de 2027.',
    body: 'O Museu de Serralves, no Porto, recebe a partir de novembro uma instalação pensada para o espaço por Anri Sala, na ala oeste do museu, que fica até maio de 2027.\n\nContinuam abertas até janeiro de 2027 três exposições do programa deste ano: Wrong Answers, de Jenny Holzer, que se estende também à biblioteca; Lee Ufan, na casa e no parque; e Beautifully Imperfect, de Alice Neel, com microcoreografias de Vera Mantero em resposta às pinturas.\n\nNa Casa do Cinema Manoel de Oliveira, Manoel de Oliveira e o Cinema Português III olha para as últimas três décadas do realizador e fica até setembro de 2027.\n\nFonte: programação de Serralves para 2026, apresentada a 16 de dezembro de 2025 (DN / Lusa).',
    imageUrl: img.serralves, publishedAt: '2026-11-02T10:00:00Z'
  },
  {
    slug: 'lidia-jorge-premio-camoes-2026', title: 'Lídia Jorge vence o Prémio Camões 2026', subtitle: 'Notícia', category: 'literatura',
    excerpt: 'A autora de A Costa dos Murmúrios e Misericórdia recebe o maior prémio da língua portuguesa, no valor de 100 mil euros.',
    body: 'Lídia Jorge é a vencedora do Prémio Camões 2026, anunciado a 2 de julho. O júri decidiu por unanimidade. O prémio, o mais importante da literatura em língua portuguesa, vale 100 mil euros e é atribuído em conjunto por Portugal e pelo Brasil.\n\nA obra da escritora começa em 1980 com O Dia dos Prodígios e inclui O Cais das Merendas, Notícia da Cidade Silvestre, A Costa dos Murmúrios, Estuário e Misericórdia, que venceu vários prémios em Portugal e o Prix Médicis Étranger em França, em 2023.\n\n"É um prémio que se sabe que existe, mas ninguém imagina que vai ter", disse a autora.\n\nFonte: Diário de Notícias, 2 de julho de 2026.',
    imageUrl: img.lello, publishedAt: '2026-07-02T15:00:00Z'
  },
  {
    slug: 'goncalo-m-tavares-premio-formentor-2026', title: 'Gonçalo M. Tavares é o primeiro português a vencer o Prémio Formentor', subtitle: 'Notícia', category: 'literatura',
    excerpt: 'O prémio espanhol, no valor de 50 mil euros, distingue a "ousadia" de uma narrativa "alheia às tentações do óbvio".',
    body: 'Gonçalo M. Tavares venceu o Prémio Formentor das Letras 2026, atribuído pela fundação espanhola Formentor. É o primeiro escritor português a receber este prémio, no valor de 50 mil euros. A decisão do júri foi unânime e foi anunciada a 3 de março.\n\nSegundo a ata, o prémio reconhece a ousadia com que o autor construiu uma narrativa alheia às tentações do óbvio, numa tradição literária que conta o reverso da realidade.\n\nFonte: RTP / Lusa, 3 de março de 2026.',
    imageUrl: img.lello, publishedAt: '2026-03-03T12:00:00Z'
  }
];

const collections = [
  {
    slug: 'discos-portugueses-outono-2026', title: 'Discos portugueses do outono', description: 'Os álbuns portugueses editados entre setembro e novembro de 2026.',
    introduction: 'Eletrónica, canção, pop e tradição: sete discos novos feitos em Portugal.\n\nHá a eletrónica com raízes tradicionais de Ana Lua Caiano e de Pedro da Linha, a pop com fado e viola braguesa de IOLANDA, a canção de Benjamim, a estreia de mokina e dois discos da Príncipe Discos, dos Niagara e de A.K.Adrix. Todos saíram entre setembro e novembro de 2026 e estão nas plataformas de streaming.',
    coverImage: img.vinil2, featured: true,
    items: [['works', 'devagar-que-a-vida-e-curta-ana-lua-caiano'], ['works', 'quebranto-iolanda'], ['works', 'cronicas-do-monte-zeus-benjamim'], ['works', 'catedral-gotica-niagara'], ['works', '333-ak-adrix'], ['works', 'jardim-celeste-mokina'], ['works', 'musica-menor-mas-feliz-pedro-da-linha']]
  },
  {
    slug: 'exposicoes-lisboa-inverno-2026', title: 'Exposições em Lisboa neste inverno', description: 'Artistas e figuras da cultura portuguesa nos museus de Lisboa.',
    introduction: 'Do MAAT à Casa Fernando Pessoa, cinco exposições para ver antes que fechem.\n\nDuas fecham já em dezembro: A Arca Eterna, na Casa Fernando Pessoa (6 de dezembro), e Variações para Carlos Paredes, no Museu do Fado (30 de dezembro). As outras três ficam até fevereiro de 2027. Os bilhetes vão dos 3 € do Atelier-Museu Júlio Pomar aos 11 € do MAAT, e todos se compram no próprio museu ou online.',
    coverImage: img.maat, featured: true,
    items: [['events', 'pedro-cabrita-reis-sem-magoa-no-coracao-maat'], ['events', 'venus-joana-vasconcelos-valentino-maat'], ['events', 'tragedia-e-farsa-pomar-abrantes'], ['events', 'variacoes-para-carlos-paredes-museu-do-fado'], ['events', 'a-arca-eterna-fernando-pessoa']]
  },
  {
    slug: 'concertos-portugueses-fim-de-2026', title: 'Concertos portugueses até ao fim do ano', description: 'Música portuguesa ao vivo em Lisboa e no Porto, de novembro a dezembro.',
    introduction: 'Cinco noites de música feita cá, dos coliseus à Casa da Música.\n\nO roteiro começa no Porto, com os 20 anos de Olhos de Mongol dos Linda Martini e o disco mais tradicional de Luísa Sobral, e acaba em Lisboa, com janeiro, a estreia de IOLANDA no Coliseu e o regresso de Rodrigo Leão a Alma Mater. Em cada ficha está a data, a sala, o preço quando foi publicado e a ligação para comprar bilhetes.',
    coverImage: img.coliseuLisboa, featured: true,
    items: [['events', 'linda-martini-coliseu-porto-2026'], ['events', 'luisa-sobral-cartas-de-desamor-casa-da-musica'], ['events', 'janeiro-reticencias-coliseu-lisboa'], ['events', 'iolanda-coliseu-dos-recreios-2026'], ['events', 'rodrigo-leao-alma-mater-misty-fest']]
  },
  {
    slug: 'comedia-ate-ao-fim-do-ano-2026', title: 'Rir até ao fim do ano', description: 'Três solos de stand-up de humoristas portugueses, em Lisboa e no Porto.',
    introduction: 'Três humoristas, três solos novos, entre novembro e dezembro.\n\nHugo Sousa leva Aqui Entre Nós à Aula Magna a 15 de novembro, Diogo Faro traz Massa Mãe ao Teatro da Trindade a 15 de dezembro e Ana Garcia Martins apresenta Insuficiente no Teatro Sá da Bandeira, no Porto, a 18 e 19 de dezembro. Em cada ficha estão as horas, os preços e a ligação para comprar bilhetes.',
    coverImage: img.trindade, featured: true,
    items: [['events', 'hugo-sousa-aqui-entre-nos-aula-magna'], ['events', 'diogo-faro-massa-mae-trindade'], ['events', 'ana-garcia-martins-insuficiente-sa-da-bandeira']]
  },
];

// Ligações "relacionados" (origem → destino), por slug.
const relations = [
  ['articles', 'sete-discos-portugueses-para-este-outono', 'artists', 'ana-lua-caiano'],
  ['articles', 'sete-discos-portugueses-para-este-outono', 'artists', 'iolanda'],
  ['articles', 'sete-discos-portugueses-para-este-outono', 'artists', 'benjamim'],
  ['articles', 'concertos-portugueses-que-fecham-2026', 'artists', 'linda-martini'],
  ['articles', 'concertos-portugueses-que-fecham-2026', 'artists', 'iolanda'],
  ['articles', 'exposicoes-em-lisboa-ate-fevereiro', 'artists', 'pedro-cabrita-reis'],
  ['articles', 'exposicoes-em-lisboa-ate-fevereiro', 'artists', 'joana-vasconcelos'],
  ['articles', 'leffest-2026-abre-com-paper-tiger', 'artists', 'tiago-guedes'],
  ['events', 'linda-martini-coliseu-porto-2026', 'artists', 'linda-martini'],
  ['events', 'iolanda-coliseu-dos-recreios-2026', 'artists', 'iolanda'],
  ['events', 'iolanda-coliseu-dos-recreios-2026', 'works', 'quebranto-iolanda'],
  ['events', 'pedro-cabrita-reis-sem-magoa-no-coracao-maat', 'artists', 'pedro-cabrita-reis'],
  ['events', 'venus-joana-vasconcelos-valentino-maat', 'artists', 'joana-vasconcelos'],
  ['events', 'aqui-antestreia-batalha', 'artists', 'tiago-guedes'],
  ['events', 'aqui-antestreia-batalha', 'works', 'aqui-tiago-guedes'],
  ['events', 'not-marlene-monteiro-freitas-theatro-circo', 'artists', 'marlene-monteiro-freitas'],
  ['works', 'devagar-que-a-vida-e-curta-ana-lua-caiano', 'artists', 'ana-lua-caiano'],
  ['works', 'quebranto-iolanda', 'artists', 'iolanda'],
  ['works', 'cronicas-do-monte-zeus-benjamim', 'artists', 'benjamim'],
  ['works', 'aqui-tiago-guedes', 'artists', 'tiago-guedes'],
  ['articles', 'sete-discos-portugueses-para-este-outono', 'collections', 'discos-portugueses-outono-2026'],
  ['articles', 'sete-discos-portugueses-para-este-outono', 'works', 'devagar-que-a-vida-e-curta-ana-lua-caiano'],
  ['articles', 'exposicoes-em-lisboa-ate-fevereiro', 'collections', 'exposicoes-lisboa-inverno-2026'],
  ['articles', 'exposicoes-em-lisboa-ate-fevereiro', 'events', 'pedro-cabrita-reis-sem-magoa-no-coracao-maat'],
  ['articles', 'concertos-portugueses-que-fecham-2026', 'collections', 'concertos-portugueses-fim-de-2026'],
  ['articles', 'concertos-portugueses-que-fecham-2026', 'events', 'iolanda-coliseu-dos-recreios-2026'],
  ['events', 'hugo-sousa-aqui-entre-nos-aula-magna', 'artists', 'hugo-sousa'],
  ['events', 'diogo-faro-massa-mae-trindade', 'artists', 'diogo-faro'],
  ['events', 'ana-garcia-martins-insuficiente-sa-da-bandeira', 'artists', 'ana-garcia-martins'],
];

// Créditos das fotografias (Wikimedia Commons).
const imageCredits = [
  ['Cinema São Jorge', 'Miguel Teixeira', 'CC BY-SA 2.0'],
  ['Culturgest (edifício-sede da CGD)', 'GualdimG', 'CC BY-SA 4.0'],
  ['Museu de Serralves', 'theginjaninja1979', 'CC BY-SA 2.0'],
  ['Livraria Lello (interior)', 'John Samuel', 'CC BY-SA 4.0'],
  ['Coliseu do Porto', 'Vitor Oliveira', 'CC BY-SA 2.0'],
  ['Coliseu dos Recreios (vista de São Pedro de Alcântara)', 'Xosema', 'CC BY-SA 4.0'],
  ['Casa da Música', 'I.shevtsov', 'CC BY-SA 4.0'],
  ['MAAT (dia e noite)', 'Pedro Ribeiro Simões', 'CC BY 2.0'],
  ['Museu do Fado', 'Vitor Oliveira', 'CC BY-SA 2.0'],
  ['Teatro Nacional São João', 'Krzysztof Golik', 'CC BY-SA 4.0'],
  ['Theatro Circo', 'Joseolgon', 'CC BY 4.0'],
  ['Cinema Batalha', 'Vitor Oliveira', 'CC BY-SA 2.0'],
  ['Atelier-Museu Júlio Pomar', 'GualdimG', 'CC BY-SA 4.0'],
  ['Casa Fernando Pessoa', 'José Frade', 'CC BY-SA 4.0'],
  ['Disco de vinil (agulha)', 'Franz van Duns', 'CC BY-SA 4.0'],
  ['Disco de vinil a girar', 'Sulamith Sallmann', 'CC BY-SA 4.0'],
  ['Duas guitarras portuguesas', 'TenIslands', 'Domínio público'],
  ['Guitarra portuguesa', 'Šarūnas Burdulis', 'CC BY-SA 2.0'],
  ['Aula Magna da Universidade de Lisboa', 'Vitor Oliveira', 'CC BY-SA 2.0'],
  ['Teatro da Trindade', 'pedrik', 'CC BY 2.0'],
  ['Teatro Sá da Bandeira', 'Nikolai Ormazablev', 'CC BY 2.0'],
];

// Junta a cada conteúdo o texto completo e a informação de bilhetes (texts.js).
const texts = require('./texts');
for (const [list, key] of [[events, 'events'], [works, 'works'], [artists, 'artists'], [venues, 'venues']]) {
  for (const item of list) Object.assign(item, texts[key][item.slug] || {});
}

module.exports = { venues, artists, works, events, articles, collections, relations, imageCredits };
