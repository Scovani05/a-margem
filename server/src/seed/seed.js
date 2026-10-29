require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize, User, Category, Event, Work, Artist, Venue, Article, Collection, CollectionItem, ContentRelation
} = require('../models');

const demo = { isDemo: true };
const daysFromNow = (days, hour = 19) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
};
const cover = (name) => `/images/${name}.svg`;

async function ensure(model, where, defaults) {
  const [row] = await model.findOrCreate({ where, defaults });
  return row;
}

async function seed() {
  await sequelize.authenticate();

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (process.env.ADMIN_PASSWORD.length < 12) throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    const [admin] = await User.findOrCreate({
      where: { email: process.env.ADMIN_EMAIL.trim().toLowerCase() },
      defaults: { name: 'Equipa editorial', email: process.env.ADMIN_EMAIL.trim().toLowerCase(), passwordHash, role: 'admin' }
    });
    if (admin.role !== 'admin') await admin.update({ role: 'admin' });
  }

  const categoryRows = await Promise.all([
    ['Música', 'musica', 'Sons, discos e projetos independentes.', '#d8e87a', 'music-2'],
    ['Cinema', 'cinema', 'Filmes, salas e outras imagens em movimento.', '#f2a18a', 'clapperboard'],
    ['Fotografia', 'fotografia', 'Olhares, séries e práticas fotográficas.', '#c3b4ed', 'camera'],
    ['Artes visuais', 'artes-visuais', 'Exposições, objetos e práticas visuais.', '#82c8bd', 'shapes'],
    ['Literatura', 'literatura', 'Livros, escrita e edição independente.', '#f2cd79', 'book-open'],
    ['Teatro', 'teatro', 'Palco, performance e artes ao vivo.', '#eea47b', 'drama'],
    ['Cultura independente', 'cultura-independente', 'Iniciativas locais e espaços autónomos.', '#a8c2ee', 'sparkles']
  ].map(([name, slug, description, color, icon], sortOrder) => ensure(Category, { slug }, { name, slug, description, color, icon, sortOrder })));
  const categories = Object.fromEntries(categoryRows.map((item) => [item.slug, item]));

  const venues = await Promise.all([
    ensure(Venue, { slug: 'casa-do-ensaio-demo' }, { name: 'Casa do Ensaio — exemplo', slug: 'casa-do-ensaio-demo', type: 'Espaço cultural', description: 'Ficha demonstrativa de um espaço cultural independente. Os dados não correspondem a uma organização real.', city: 'Porto', imageUrl: cover('cover-venue'), published: true, featured: true, ...demo }),
    ensure(Venue, { slug: 'sala-do-rio-demo' }, { name: 'Sala do Rio — exemplo', slug: 'sala-do-rio-demo', type: 'Sala de cinema', description: 'Ficha demonstrativa de uma sala de cinema de bairro. Informação fictícia para desenvolvimento.', city: 'Braga', imageUrl: cover('cover-cinema'), published: true, ...demo }),
    ensure(Venue, { slug: 'oficina-baixa-demo' }, { name: 'Oficina da Baixa — exemplo', slug: 'oficina-baixa-demo', type: 'Galeria e oficina', description: 'Ficha demonstrativa de um espaço de criação visual. Informação fictícia para desenvolvimento.', city: 'Porto', imageUrl: cover('cover-art'), published: true, ...demo })
  ]);

  const artists = await Promise.all([
    ensure(Artist, { slug: 'lia-do-norte-demo' }, { name: 'Lia do Norte — exemplo', slug: 'lia-do-norte-demo', bio: 'Perfil demonstrativo de uma artista multidisciplinar. Esta biografia é fictícia e serve para ilustrar o formato da plataforma.', location: 'Porto', disciplines: ['Música', 'Performance'], imageUrl: cover('cover-artist'), links: {}, published: true, featured: true, ...demo }),
    ensure(Artist, { slug: 'tomas-faria-demo' }, { name: 'Tomás Faria — exemplo', slug: 'tomas-faria-demo', bio: 'Perfil fictício para mostrar como a plataforma pode apresentar um criador emergente e as suas práticas.', location: 'Braga', disciplines: ['Fotografia'], imageUrl: cover('cover-photo'), links: {}, published: true, featured: true, ...demo }),
    ensure(Artist, { slug: 'duo-entrelinhas-demo' }, { name: 'Duo Entrelinhas — exemplo', slug: 'duo-entrelinhas-demo', bio: 'Um perfil de exemplo para ilustrar colaborações artísticas. Não representa um projeto real.', location: 'Porto', disciplines: ['Cinema', 'Artes visuais'], imageUrl: cover('cover-film'), links: {}, published: true, ...demo })
  ]);

  const works = await Promise.all([
    ensure(Work, { slug: 'mapa-de-silencios-demo' }, { title: 'Mapa de silêncios — exemplo', slug: 'mapa-de-silencios-demo', subtitle: 'Projeto musical demonstrativo', description: 'Um registo de exemplo para mostrar como uma obra pode ligar-se a artistas, categorias e recomendações. Todos os elementos são fictícios.', type: 'album', categoryId: categories.musica.id, creator: artists[0].name, imageUrl: cover('cover-music'), releasedAt: '2026-01-01', featured: true, published: true, ...demo }),
    ensure(Work, { slug: 'a-luz-entre-predios-demo' }, { title: 'A luz entre prédios — exemplo', slug: 'a-luz-entre-predios-demo', subtitle: 'Curta-metragem demonstrativa', description: 'Descrição fictícia usada para demonstrar a página de uma obra audiovisual.', type: 'film', categoryId: categories.cinema.id, creator: artists[2].name, imageUrl: cover('cover-film'), releasedAt: '2026-01-01', featured: true, published: true, ...demo }),
    ensure(Work, { slug: 'caderno-de-margem-demo' }, { title: 'Caderno de margem — exemplo', slug: 'caderno-de-margem-demo', subtitle: 'Livro de artista demonstrativo', description: 'Texto de exemplo para um livro ou edição independente. Os dados não descrevem uma publicação existente.', type: 'book', categoryId: categories.literatura.id, creator: 'Edição demonstrativa', imageUrl: cover('cover-book'), releasedAt: '2026-01-01', published: true, ...demo }),
    ensure(Work, { slug: 'linhas-de-passagem-demo' }, { title: 'Linhas de passagem — exemplo', slug: 'linhas-de-passagem-demo', subtitle: 'Série fotográfica demonstrativa', description: 'Ficha fictícia para ilustrar a descoberta de projetos fotográficos.', type: 'photography', categoryId: categories.fotografia.id, creator: artists[1].name, imageUrl: cover('cover-photo'), featured: true, published: true, ...demo })
  ]);

  const events = await Promise.all([
    ensure(Event, { slug: 'escuta-atenta-demo' }, { title: 'Escuta atenta — evento de demonstração', slug: 'escuta-atenta-demo', subtitle: 'Sessão musical fictícia', description: 'Evento inteiramente demonstrativo. Data, espaço e programa são fictícios e não devem ser usados como informação de agenda.', categoryId: categories.musica.id, venueId: venues[0].id, venueName: venues[0].name, city: 'Porto', organizer: 'Exemplo editorial', imageUrl: cover('cover-music'), startsAt: daysFromNow(8), endsAt: daysFromNow(8, 22), officialUrl: null, status: 'upcoming', featured: true, published: true, ...demo }),
    ensure(Event, { slug: 'janela-aberta-demo' }, { title: 'Janela aberta — evento de demonstração', slug: 'janela-aberta-demo', subtitle: 'Projeção fictícia', description: 'Evento inteiramente demonstrativo. A data e os detalhes não representam uma sessão real.', categoryId: categories.cinema.id, venueId: venues[1].id, venueName: venues[1].name, city: 'Braga', organizer: 'Exemplo editorial', imageUrl: cover('cover-cinema'), startsAt: daysFromNow(13), status: 'upcoming', published: true, ...demo }),
    ensure(Event, { slug: 'atelier-aberto-demo' }, { title: 'Ateliê aberto — evento de demonstração', slug: 'atelier-aberto-demo', subtitle: 'Encontro fictício de artes visuais', description: 'Evento de demonstração para ilustrar a agenda local. Informação inteiramente fictícia.', categoryId: categories['artes-visuais'].id, venueId: venues[2].id, venueName: venues[2].name, city: 'Porto', organizer: 'Exemplo editorial', imageUrl: cover('cover-art'), startsAt: daysFromNow(21), status: 'upcoming', published: true, ...demo })
  ]);

  const articles = await Promise.all([
    ensure(Article, { slug: 'o-que-escutamos-quando-a-cidade-abranda-demo' }, { title: 'O que escutamos quando a cidade abranda', slug: 'o-que-escutamos-quando-a-cidade-abranda-demo', subtitle: 'Ensaio demonstrativo', excerpt: 'Um texto de exemplo sobre escuta, ritmo urbano e a procura de espaços para estar.', body: 'Este ensaio é conteúdo demonstrativo e não descreve uma investigação publicada.\n\nNa cidade imaginada deste texto, escutar é também reparar no que costuma ficar em segundo plano: uma sala vazia, uma pausa entre sons, a atenção partilhada por desconhecidos.\n\nEste formato permite publicar ensaios originais depois de a equipa editorial verificar as fontes e obter as permissões necessárias.', categoryId: categories.musica.id, authorName: 'Redação À Margem — exemplo', imageUrl: cover('cover-music'), status: 'published', featured: true, publishedAt: new Date(), ...demo }),
    ensure(Article, { slug: 'um-guia-para-olhar-devagar-demo' }, { title: 'Um guia para olhar devagar', slug: 'um-guia-para-olhar-devagar-demo', subtitle: 'Guia demonstrativo', excerpt: 'Uma estrutura de guia para exposições, fotografia e percursos visuais.', body: 'Conteúdo inteiramente fictício para demonstrar a página de um artigo.\n\nUm guia editorial pode reunir contexto, sugestões de visita e ligações para fontes oficiais. Antes de publicar uma versão real, cada informação e imagem deverá ser verificada.', categoryId: categories.fotografia.id, authorName: 'Redação À Margem — exemplo', imageUrl: cover('cover-photo'), status: 'published', featured: true, publishedAt: new Date(), ...demo }),
    ensure(Article, { slug: 'espacos-pequenos-ideias-grandes-demo' }, { title: 'Espaços pequenos, ideias grandes', slug: 'espacos-pequenos-ideias-grandes-demo', subtitle: 'Reportagem demonstrativa', excerpt: 'Uma peça de exemplo sobre a estrutura editorial dedicada a espaços independentes.', body: 'Esta peça é um exemplo de desenvolvimento. Não contém declarações, entrevistas ou factos sobre organizações reais.\n\nUma reportagem publicada deverá identificar as fontes, confirmar os dados e incluir apenas imagens autorizadas.', categoryId: categories['cultura-independente'].id, authorName: 'Redação À Margem — exemplo', imageUrl: cover('cover-venue'), status: 'published', publishedAt: new Date(), ...demo })
  ]);

  const collections = await Promise.all([
    ensure(Collection, { slug: 'primeiras-descobertas-demo' }, { title: 'Primeiras descobertas', slug: 'primeiras-descobertas-demo', description: 'Uma coleção de demonstração para mostrar como recomendações editoriais se podem ligar.', introduction: 'Os itens desta lista são todos exemplos fictícios. Substitui-os por conteúdo verificado antes de publicar a plataforma.', coverImage: cover('cover-collection'), featured: true, published: true, ...demo }),
    ensure(Collection, { slug: 'norte-em-ensaio-demo' }, { title: 'Norte em ensaio — exemplo', slug: 'norte-em-ensaio-demo', description: 'Coleção de exemplo com obras, espaços e artistas demonstrativos.', introduction: 'Seleção ilustrativa da navegação por coleções.', coverImage: cover('cover-north'), featured: true, published: true, ...demo })
  ]);

  for (const [collection, entries] of [[collections[0], [['works', works[0].id], ['articles', articles[0].id], ['artists', artists[0].id], ['events', events[0].id]]], [collections[1], [['venues', venues[1].id], ['works', works[1].id], ['artists', artists[1].id]]]]) {
    for (const [contentType, contentId] of entries) await ensure(CollectionItem, { collectionId: collection.id, contentType, contentId }, { collectionId: collection.id, contentType, contentId, sortOrder: entries.findIndex((entry) => entry[0] === contentType && entry[1] === contentId) });
  }

  const relatedLinks = [
    [articles[0], 'articles', 'works', works[0]],
    [articles[0], 'articles', 'artists', artists[0]],
    [articles[0], 'articles', 'venues', venues[0]],
    [articles[0], 'articles', 'events', events[0]],
    [works[0], 'works', 'artists', artists[0]],
    [events[0], 'events', 'artists', artists[0]],
    [collections[1], 'collections', 'articles', articles[1]]
  ];
  for (const [source, sourceType, targetType, target] of relatedLinks) {
    await ensure(ContentRelation, { sourceType, sourceId: source.id, targetType, targetId: target.id }, {
      sourceType, sourceId: source.id, targetType, targetId: target.id,
      sortOrder: relatedLinks.findIndex((entry) => entry[0] === source && entry[2] === targetType && entry[3] === target)
    });
  }

  console.log('Seed complete. The cultural catalogue records are fictional and carry the demonstration label.');
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
}).finally(() => sequelize.close());
