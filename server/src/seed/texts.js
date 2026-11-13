// Textos completos de cada conteúdo (campo "body") e informação de bilhetes dos eventos.
// A "description" de content.js é o resumo curto; estes textos aparecem no corpo da ficha.
// Fontes consultadas a 9/11/2026: páginas oficiais dos espaços (Coliseu dos Recreios, Coliseu
// Porto Ageas, Casa da Música, MAAT, Museu do Fado, Atelier-Museu Júlio Pomar, Casa Fernando
// Pessoa, Theatro Circo, TNSJ, Batalha), New in Porto, Glam Magazine, RTP e Rimas e Batidas.

const events = {
  'linda-martini-coliseu-porto-2026': {
    body: 'Em 2006, os Linda Martini editaram Olhos de Mongol, o primeiro longa-duração, e ajudaram a definir o rock alternativo cantado em português da geração seguinte. Vinte anos depois, a banda de Lisboa volta ao disco de uma ponta à outra: as nove canções, tocadas pela ordem original.\n\nO concerto acontece no Coliseu Box, o formato mais pequeno e próximo do Coliseu Porto Ageas, e faz parte do ciclo SON Estrella Galicia. É uma boa oportunidade para ouvir de perto um disco que muitos conhecem de cor.',
    ticketInfo: 'Quarta-feira, 11 de novembro, às 21:00, no Coliseu Box (Coliseu Porto Ageas, Rua de Passos Manuel 137, Porto).\n\nBilhetes a 15 € em pré-venda e 20 € no dia do concerto, à venda na bilheteira do Coliseu e online em coliseu.pt.',
    ticketUrl: 'https://www.coliseu.pt/evento/20261111-linda-martini-son-estrella-galicia'
  },
  'luisa-sobral-cartas-de-desamor-casa-da-musica': {
    body: 'Cartas de Desamor é o oitavo álbum de Luísa Sobral e marca uma viragem: a cantautora aproxima-se da música tradicional portuguesa e junta às suas canções ritmos e percussões de cá. O single Felicidade dá o tom, construído à volta do adufe, o tambor quadrado da tradição portuguesa.\n\nO disco nasce de um período mais introspetivo e é apresentado como um recomeço criativo. Nos concertos de apresentação, Luísa Sobral toca percussão e diz poesia entre as canções.',
    ticketInfo: 'Segunda-feira, 16 de novembro, às 21:30, na Sala Suggia da Casa da Música (Porto).\n\nBilhetes de 25 € a 35 €, conforme a fila (A-L 35 €, M-U 30 €, UU-YY 25 €), à venda no site e na bilheteira da Casa da Música. O desconto Amigo é de 25%.',
    ticketUrl: 'https://casadamusica.com/event/luisa-sobral/'
  },
  'janeiro-reticencias-coliseu-lisboa': {
    body: 'Reticências é o novo álbum de janeiro, editado a 25 de setembro de 2026, com doze canções. Antes do disco saíram Cor Lá Fora, com Valter Lobo, e Canção da Revolta, com Meta.\n\nEste é o concerto de apresentação em Lisboa, no Coliseu Club, o espaço mais pequeno do Coliseu dos Recreios. No Porto, o disco é apresentado a 3 de dezembro no Hot Five.',
    ticketInfo: 'Quarta-feira, 18 de novembro, no Coliseu Club (Coliseu dos Recreios, Rua das Portas de Santo Antão 96, Lisboa). A hora não estava publicada à data da recolha: confirma no site do Coliseu.\n\nBilhetes na bilheteira do Coliseu dos Recreios e online em coliseulisboa.com e na BOL.',
    ticketUrl: 'https://coliseulisboa.bol.pt/'
  },
  'iolanda-coliseu-dos-recreios-2026': {
    body: 'É a estreia de IOLANDA no Coliseu de Lisboa. A cantora que levou Grito ao Festival Eurovisão da Canção de 2024 apresenta Quebranto, o disco que cruza pop urbana com fado e viola braguesa, e as canções que marcaram o seu percurso.\n\nO espetáculo usa um palco a 360 graus, com o público à volta, e conta a história de um disco que demorou cerca de um ano e meio a fazer. É recomendado a partir dos 6 anos; não é permitida a entrada a crianças com menos de 3.',
    ticketInfo: 'Segunda-feira, 7 de dezembro, às 21:00 (portas às 20:00), no Coliseu dos Recreios, Lisboa. Promotora: Everything is New.\n\nBilhetes de 18 € (galeria, de pé) a 35 € (1.ª plateia). À venda na bilheteira do Coliseu, FNAC, El Corte Inglés, Worten, Agência ABEP, coliseulisboa.com e BOL.',
    ticketUrl: 'https://coliseulisboa.com/eventos/iolanda/'
  },
  'rodrigo-leao-alma-mater-misty-fest': {
    body: 'Alma Mater é um dos discos mais conhecidos de Rodrigo Leão, editado há 26 anos. No Misty Fest de 2026, o compositor volta a tocá-lo na íntegra, com ensemble e coro.\n\nAs convidadas especiais são Adriana Calcanhotto, que cantou A Casa, e Lula Pena, que interpretou Pasión. Antes de Lisboa, o mesmo programa passa pela Casa da Música, no Porto, a 23 e 24 de novembro.',
    ticketInfo: 'Sexta-feira, 18 de dezembro, no Coliseu dos Recreios, Lisboa, em duas sessões: 18:00 (sessão extra, anunciada depois) e 21:00.\n\nBilhetes na bilheteira e no site do Coliseu dos Recreios. Os preços não estavam publicados nas fontes consultadas: confirma em coliseulisboa.com ou no site do Misty Fest.',
    ticketUrl: 'https://coliseulisboa.com/'
  },
  'pedro-cabrita-reis-sem-magoa-no-coracao-maat': {
    body: 'Para os 10 anos do MAAT, Pedro Cabrita Reis ocupa a Galeria Oval com quase 200 obras, muitas nunca mostradas: pintura, desenho e escultura, várias feitas de propósito para esta exposição. A curadoria é de João Pinharanda.\n\nO artista vai buscar referências à arte depois do Renascimento, da escultura à pintura de corte e aos gabinetes de curiosidades. O título vem de Hesíodo e da sua descrição da Idade de Ouro, um tempo em que se vivia sem sofrimento nem preocupações.',
    ticketInfo: 'Até 15 de fevereiro de 2027, na Galeria Oval do MAAT (Av. Brasília, Belém, Lisboa). O museu abre de quarta a segunda, das 10:00 às 19:00.\n\nO bilhete MAAT + Central Tejo custa 12 € e compra-se na bilheteira do museu ou online em maat.pt.',
    ticketUrl: 'https://www.maat.pt/en/event/pedro-cabrita-reis-without-sorrow-heart'
  },
  'venus-joana-vasconcelos-valentino-maat': {
    body: 'VENUS põe frente a frente a escultura de Joana Vasconcelos e a alta-costura de Valentino Garavani (1932-2026). A artista criou um percurso próprio nas Galerias 1 e 2 do MAAT, com obras conhecidas e peças novas, ao lado de cerca de 30 criações de Valentino.\n\nO projeto começou no PM23, em Roma, em janeiro de 2026, e foi adaptado aos espaços do MAAT para o programa dos 10 anos do museu.',
    ticketInfo: 'Até 22 de fevereiro de 2027, nas Galerias 1 e 2 do MAAT (Av. Brasília, Belém, Lisboa). O museu abre de quarta a segunda, das 10:00 às 19:00.\n\nO bilhete MAAT + Central Tejo custa 12 € e compra-se na bilheteira do museu ou online em maat.pt.',
    ticketUrl: 'https://www.maat.pt/en/news/venus-valentino-garavani-through-eyes-joana-vasconcelos-maat-october'
  },
  'tragedia-e-farsa-pomar-abrantes': {
    body: 'O ponto de partida é O Almoço do Trolha, uma das pinturas neorrealistas que Júlio Pomar fez nos anos 1940. Ao lado, Gabriel Abrantes pinta em 2026 um estafeta de entregas. Oito décadas separam os dois quadros, mas ambos falam de trabalho precário.\n\nA exposição reúne cerca de 100 pinturas e desenhos e pergunta o que mudou entre as esperanças de mudança social do século XX e as reivindicações de hoje. Faz parte do centenário de Júlio Pomar.',
    ticketInfo: 'De 5 de novembro de 2026 até ao fim de fevereiro de 2027, no Atelier-Museu Júlio Pomar (Rua do Vale 7, Lisboa). Abre de terça a domingo, das 10:00 às 13:00 e das 14:00 às 18:00.\n\nBilhete geral de 3 € (reduções a partir de 1,50 €; gratuito até aos 12 anos e para residentes em Lisboa aos domingos e feriados de manhã). À venda no museu ou online na BOL.',
    ticketUrl: 'https://atelierjuliopomar.bol.pt/'
  },
  'variacoes-para-carlos-paredes-museu-do-fado': {
    body: 'Carlos Paredes (1925-2004) deu à guitarra portuguesa uma voz própria, fora do acompanhamento do fado. Esta exposição do centenário reúne os seus instrumentos, discos, documentos e filmes para revisitar a vida e a obra do músico.\n\nA curadoria é de Ivan Dias e António Manuel Nunes. A exposição abriu em junho de 2025 e está nas últimas semanas.',
    ticketInfo: 'Até 30 de dezembro de 2026, no Museu do Fado (Largo do Chafariz de Dentro 1, Alfama, Lisboa). Abre de terça a domingo, das 10:00 às 18:00 (última entrada às 17:30).\n\nBilhete de 5 € (2,50 € dos 13 aos 25 anos; gratuito até aos 12). À venda apenas na bilheteira do museu ou online na BOL.',
    ticketUrl: 'https://www.museudofado.pt/exposicao/variacoes-para-carlos-paredes'
  },
  'a-arca-eterna-fernando-pessoa': {
    body: 'Quando morreu, em 1935, Fernando Pessoa deixou uma arca com milhares de papéis inéditos. A Arca Eterna conta como a sua lenda cresceu a partir dela, com edições, leituras e descobertas ao longo de quase um século.\n\nA curadoria é de Antonio Sáez Delgado, professor da Universidade de Évora. No fim do percurso, cada visitante pode montar a sua própria seleção portátil de textos e imagens.',
    ticketInfo: 'Até 10 de janeiro de 2027, na Casa Fernando Pessoa (Rua Coelho da Rocha 16, Campo de Ourique, Lisboa). Abre de terça a domingo, das 10:00 às 18:00.\n\nBilhetes na bilheteira da Casa ou antecipadamente na BOL. Há visitas guiadas em português aos sábados e domingos às 16:00.',
    ticketUrl: 'https://casafernandopessoa.bol.pt/'
  },
  'auto-da-barca-do-inferno-marta-pazos-tnsj': {
    body: 'O Auto da Barca do Inferno, de Gil Vicente, é um dos textos mais conhecidos do teatro português. Nesta versão, a encenadora galega Marta Pazos junta teatro, dança e artes visuais e procura a energia popular, crítica e satírica do original.\n\nA estrutura mantém-se: o Fidalgo, o Onzeneiro, o Parvo, o Sapateiro, o Frade e a Alcoviteira chegam a um cais onde o Anjo e o Diabo decidem o destino de cada alma. É uma coprodução do Teatro Nacional São João com o Centro Dramático Galego.',
    ticketInfo: 'De 12 de novembro a 13 de dezembro de 2026, no Teatro Nacional São João (Praça da Batalha, Porto). Cerca de 90 minutos, M/12.\n\nBilhetes de 10 € a 16 €, na bilheteira do TNSJ e online na BOL.',
    ticketUrl: 'https://www.bol.pt/Comprar/Bilhetes/182996-auto_da_barca_do_inferno_gil_vicente-teatro_nacional_sao_joao/'
  },
  'aqui-antestreia-batalha': {
    body: 'Aquí é o novo filme de Tiago Guedes, inspirado na trilogia de Jesus de J. M. Coetzee. Simón conhece um rapaz, David, numa travessia por mar até uma terra sem nome; com Inés, formam uma família pouco convencional, enquanto a sociedade tenta encaixar David nas suas regras.\n\nO filme estreou na secção Cannes Première do Festival de Cannes de 2026. É uma coprodução Portugal-França, falada em espanhol, com Albano Jerónimo, Patricia López Arnaiz e Manolo Solo.',
    ticketInfo: 'Terça-feira, 1 de dezembro, às 17:15, na Sala 1 do Batalha Centro de Cinema (Praça da Batalha 47, Porto). Legendado em português, M/14.\n\nBilhete de 5 €, na bilheteira do Batalha e online na BOL.',
    ticketUrl: 'https://batalhacentrocinema.bol.pt/Comprar/Bilhetes/182102/1966418/Sectores'
  },
  'not-marlene-monteiro-freitas-theatro-circo': {
    body: 'Nôt é uma peça de dança, música e teatro que se passa de noite, onde sonho e pesadelo, desejo e violência se confundem. Inspira-se em As Mil e Uma Noites, mas não adapta os contos: inventa a sua própria noite.\n\nCom humor e imagens inquietantes, Marlene Monteiro Freitas fala do poder de imaginar e de contar histórias como forma de resistir e sobreviver. A peça estreou no Festival de Avignon, em julho de 2025.',
    ticketInfo: 'Sexta-feira, 11 de dezembro, às 21:30, na Sala Principal do Theatro Circo (Braga). M/12.\n\nBilhete de 12 € (6 € com Cartão Pentágono), à venda na BOL e na Ticketline. Também é possível pedir reserva no site do Theatro Circo, válida só depois de confirmada por email.',
    ticketUrl: 'https://www.bol.pt/Comprar/Bilhetes/180725-not_marlene_monteiro_freitas-theatro_circo/Sessoes'
  },
  'hugo-sousa-aqui-entre-nos-aula-magna': {
    body: 'Aqui Entre Nós é o novo solo de stand-up de Hugo Sousa. O humorista fala da própria vida: histórias de família, relações, memórias, hábitos, diferenças entre gerações e os pequenos momentos embaraçosos do dia a dia.\n\nO espetáculo dura cerca de 60 minutos, sem intervalo, e é para maiores de 16 anos. Está em digressão pelo país.',
    ticketInfo: 'Próximas datas da digressão (M/16):\n\n15 nov · Lisboa, Aula Magna · 19:00 e 21:30 (últimos bilhetes) · 18 € a 27 €\n19 nov · Chaves, Centro Cultural de Chaves · 19:00 e 21:00 · 18 €\n20 e 21 nov · Guimarães, CAE São Mamede · 18 € a 22 €\n4 dez · Faro, Conservatório Regional do Algarve · 21:00 e 23:00 · 18 €\n5 dez · Évora, Auditório Nobre da Universidade de Évora · 17:00 e 21:00 · 18 €\n\nBilhetes na BOL (cada cidade tem a sua página). A sessão de Braga (13 nov) esgotou.',
    ticketUrl: 'https://www.bol.pt/Comprar/Bilhetes/179423-lisboa_hugo_sousa_aqui_entre_nos-aula_magna/'
  },
  'diogo-faro-massa-mae-trindade': {
    body: 'Em Massa Mãe, Diogo Faro faz o balanço das suas aventuras, dos podcasts às conversas com a avó, e volta às observações sobre a sociedade atual que marcam o seu humor.\n\nO espetáculo estreou primeiro no Porto e chega a Lisboa no fim do ano, ao Teatro da Trindade, no Chiado.',
    ticketInfo: 'ESGOTADO. Terça-feira, 15 de dezembro, às 21:00, no Teatro da Trindade (Largo da Trindade 7A, Chiado, Lisboa). Metro Baixa-Chiado.\n\nBilhetes de 14 € a 21 €, à venda na Ticketline e na bilheteira do teatro.',
    ticketUrl: 'https://www.ticketline.pt/en/evento/massa-mae-diogo-faro-104844'
  },
  'ana-garcia-martins-insuficiente-sa-da-bandeira': {
    body: 'Insuficiente é o novo solo de stand-up de Ana Garcia Martins. Fala dos sentimentos de inadequação, da autocrítica e da síndrome do impostor que a acompanham desde criança, mesmo quando a vida parece dizer o contrário.\n\nO espetáculo estava marcado para setembro e passou para dezembro; os bilhetes já comprados continuam válidos para as novas datas.',
    ticketInfo: 'Sexta, 18, e sábado, 19 de dezembro, às 21:00, na Sala Principal do Teatro Sá da Bandeira (Porto). M/16. À venda na Ticketline aparece só a sessão de 19.\n\nBilhetes de 15 € a 30 € (valor facial; a Ticketline acrescenta custos de operação), à venda na Ticketline.',
    ticketUrl: 'https://www.ticketline.pt/evento/ana-garcia-martins-insuficiente-105482'
  }
};

const works = {
  'devagar-que-a-vida-e-curta-ana-lua-caiano': {
    body: 'O segundo álbum de Ana Lua Caiano saiu a 6 de novembro de 2026 pela editora alemã Glitterbeat Records. Mantém a assinatura da artista, que junta eletrónica a cantos e ritmos da música tradicional portuguesa, mas abre o som a mais teclas, sopros e harmonias vocais.\n\nO título resume o espírito do disco: abrandar sem perder a urgência. Está disponível nas plataformas de streaming e na página da editora.'
  },
  'quebranto-iolanda': {
    body: 'Quebranto, editado a 8 de outubro de 2026, é pop urbana contemporânea com raízes na música tradicional portuguesa. IOLANDA vai ao fado e à viola braguesa e traz esses sons para canções atuais.\n\nO disco é apresentado ao vivo no Coliseu dos Recreios a 7 de dezembro de 2026, num palco a 360 graus.'
  },
  'cronicas-do-monte-zeus-benjamim': {
    body: 'Crónicas do Monte Zeus é o quinto álbum de estúdio de Benjamim, editado a 18 de setembro de 2026 pela Discos Submarinos. Depois do instrumental As Berlengas, o músico regressa à canção, à voz e às letras em português.'
  },
  'catedral-gotica-niagara': {
    body: 'Os Niagara são um trio de música eletrónica de Lisboa. Catedral Gótica, editado a 23 de outubro de 2026 pela Príncipe Discos, sucede a De Motu (2024) e continua a explorar texturas e ritmos que fogem às pistas de dança convencionais.'
  },
  '333-ak-adrix': {
    body: 'A.K.Adrix é produtor e faz parte do universo da Príncipe Discos, a editora lisboeta ligada à música de dança feita nos subúrbios de Lisboa. 333 é o seu primeiro álbum em cerca de seis anos, depois de Código de Barras, e saiu a 23 de outubro de 2026.'
  },
  'jardim-celeste-mokina': {
    body: 'Jardim Celeste é o álbum de estreia de mokina, editado a 6 de novembro de 2026. É indie pop etéreo, com texturas de eletrónica, lo-fi, R&B e soul.'
  },
  'musica-menor-mas-feliz-pedro-da-linha': {
    body: 'Pedro da Linha é produtor e DJ. Em Música Menor Mas Feliz, editado a 2 de outubro de 2026, cruza batidas eletrónicas com referências da música tradicional portuguesa, numa linha que tem marcado parte da eletrónica feita em Portugal.'
  },
  'aqui-tiago-guedes': {
    body: 'Aquí é a adaptação livre de Tiago Guedes da trilogia de Jesus de J. M. Coetzee. O filme acompanha Simón e David, um rapaz que conhece numa travessia por mar até uma terra sem nome, e a família improvável que formam com Inés.\n\nEstreou na Cannes Première, no Festival de Cannes de 2026. No Porto, tem antestreia no Batalha Centro de Cinema a 1 de dezembro.'
  }
};

const artists = {
  'ana-lua-caiano': {
    body: 'Ana Lua Caiano é cantora, compositora e produtora de Lisboa. Constrói as canções sozinha em palco, com voz, teclas, percussões e eletrónica, e vai buscar cantos, ritmos e instrumentos à música tradicional portuguesa.\n\nO segundo álbum, Devagar Que A Vida É Curta, saiu a 6 de novembro de 2026 pela Glitterbeat Records, editora alemã dedicada a música de várias partes do mundo.'
  },
  iolanda: {
    body: 'IOLANDA representou Portugal no Festival Eurovisão da Canção de 2024 com Grito. A sua música junta pop urbana e tradição portuguesa.\n\nEm outubro de 2026 editou Quebranto e a 7 de dezembro estreia-se no Coliseu dos Recreios, em Lisboa.'
  },
  benjamim: {
    body: 'Benjamim é músico, compositor e produtor. Com cinco álbuns de estúdio, é uma das vozes da canção pop em português da última década. Crónicas do Monte Zeus (setembro de 2026) marca o regresso às canções depois do disco instrumental As Berlengas.'
  },
  'linda-martini': {
    body: 'Os Linda Martini formaram-se em Lisboa em 2003 e tornaram-se uma das bandas mais importantes do rock alternativo cantado em português. O primeiro longa-duração, Olhos de Mongol, saiu em 2006.\n\nA 11 de novembro de 2026, no Coliseu Box (Porto), celebram os 20 anos desse disco tocando-o na íntegra.'
  },
  'bruno-pernadas': {
    body: 'Bruno Pernadas é compositor, guitarrista e produtor de Lisboa. A sua música passa pelo jazz, pela pop, pela música de filmes e por sons de várias partes do mundo, quase sempre com arranjos ricos e muitos músicos em palco.\n\nTem concerto anunciado em Lisboa a 30 de novembro de 2026, na Casa Capitão; confirma a hora e os bilhetes na agenda do espaço.'
  },
  'pedro-cabrita-reis': {
    body: 'Pedro Cabrita Reis nasceu em Lisboa em 1956 e é um dos artistas portugueses mais reconhecidos internacionalmente. Trabalha com escultura, pintura, desenho e instalação, muitas vezes com materiais de construção e de uso comum. Representou Portugal na Bienal de Veneza de 2003.\n\nNo MAAT, em sem mágoa no coração, mostra quase 200 obras inéditas até 15 de fevereiro de 2027.'
  },
  'joana-vasconcelos': {
    body: 'Joana Vasconcelos é artista plástica de Lisboa, conhecida pelas esculturas monumentais, pelo uso de têxteis, croché e objetos do quotidiano e pela forma como mistura artesanato português e arte contemporânea.\n\nNo MAAT, a exposição VENUS cruza a sua obra com a alta-costura de Valentino, até 22 de fevereiro de 2027.'
  },
  'tiago-guedes': {
    body: 'Tiago Guedes é realizador português, autor de filmes como A Herdade (2019). Aquí, inspirado na trilogia de Jesus de J. M. Coetzee, estreou na Cannes Première do Festival de Cannes de 2026 e tem antestreia no Porto a 1 de dezembro, no Batalha.'
  },
  'marlene-monteiro-freitas': {
    body: 'Marlene Monteiro Freitas nasceu em Cabo Verde e vive em Portugal. As suas peças juntam dança, música, máscara e um forte trabalho de expressão facial, e circulam pelos principais festivais internacionais.\n\nNôt, inspirada em As Mil e Uma Noites, estreou no Festival de Avignon em 2025 e chega ao Theatro Circo, em Braga, a 11 de dezembro de 2026.'
  },
  'hugo-sousa': {
    body: 'Hugo Sousa é humorista de stand-up. Em Aqui Entre Nós, o solo que estreou em 2026 e anda em digressão pelo país, transforma em comédia a própria vida, a família e as diferenças entre gerações.\n\nPróximas datas: Lisboa (Aula Magna, 15 nov), Chaves (19 nov), Guimarães (CAE São Mamede, 20 e 21 nov), Faro (4 dez) e Évora (5 dez).'
  },
  'diogo-faro': {
    body: 'Diogo Faro é humorista e um dos nomes do stand-up português que mais junta comédia e comentário social. Massa Mãe, o novo solo, estreou no Porto e chega ao Teatro da Trindade, em Lisboa, a 15 de dezembro de 2026 (sessão esgotada).'
  },
  'ana-garcia-martins': {
    body: 'Ana Garcia Martins é humorista e autora, conhecida pelo blogue A Pipoca Mais Doce. Em Insuficiente, o novo solo de stand-up, fala de autocrítica e da síndrome do impostor.\n\nApresenta-o no Teatro Sá da Bandeira, no Porto, a 18 e 19 de dezembro de 2026.'
  }
};

const venues = {
  'coliseu-dos-recreios': {
    body: 'Inaugurado em 1890, o Coliseu dos Recreios é uma das maiores salas de Lisboa e um palco histórico de concertos, ópera, bailado e do circo de Natal. Além da sala principal, tem o Coliseu Club, um espaço mais pequeno para concertos próximos.\n\nBilheteira: no próprio Coliseu, em coliseulisboa.com e na BOL; para vários espetáculos, também na FNAC, El Corte Inglés, Worten e Agência ABEP.'
  },
  'coliseu-porto-ageas': {
    body: 'O Coliseu do Porto abriu em 1941, na Rua de Passos Manuel, com uma fachada art déco que é uma das imagens da Baixa. Recebeu ao longo de décadas grandes nomes portugueses e internacionais e hoje tem também o Coliseu Box, um formato mais intimista.\n\nBilheteira: no Coliseu e online em coliseu.pt.'
  },
  'casa-da-musica': {
    body: 'Projetada pelo arquiteto Rem Koolhaas e inaugurada em 2005, a Casa da Música é a principal sala de concertos do Porto e casa da Orquestra Sinfónica do Porto e do Remix Ensemble. A Sala Suggia é a maior; a Sala 2 recebe concertos mais pequenos.\n\nBilheteira: no edifício da Casa da Música e online em casadamusica.com.'
  },
  maat: {
    body: 'O MAAT, Museu de Arte, Arquitetura e Tecnologia, abriu em 2016 em Belém. Junta o edifício ondulado desenhado por Amanda Levete, à beira do Tejo, e a antiga Central Tejo, uma central elétrica do início do século XX.\n\nAbre de quarta a segunda, das 10:00 às 19:00. O bilhete MAAT + Central Tejo custa 12 € e compra-se no museu ou em maat.pt.'
  },
  'museu-do-fado': {
    body: 'Em Alfama, o Museu do Fado conta a história da canção de Lisboa desde o século XIX, com instrumentos, discos, cartazes e gravações. Tem também uma escola de guitarra portuguesa e um centro de documentação.\n\nAbre de terça a domingo, das 10:00 às 18:00. Bilhete de 5 €, à venda só na bilheteira do museu ou na BOL.'
  },
  'atelier-museu-julio-pomar': {
    body: 'O Atelier-Museu Júlio Pomar ocupa um antigo armazém na Rua do Vale, transformado pelo arquiteto Álvaro Siza. Mostra a obra de Júlio Pomar (1926-2018) em diálogo com artistas de várias gerações.\n\nAbre de terça a domingo, das 10:00 às 13:00 e das 14:00 às 18:00. Bilhete de 3 €, no museu ou na BOL.'
  },
  'casa-fernando-pessoa': {
    body: 'Fernando Pessoa viveu os últimos 15 anos da sua vida neste prédio de Campo de Ourique. Hoje a casa é museu, biblioteca de poesia e centro cultural, com exposições, leituras e oficinas.\n\nAbre de terça a domingo, das 10:00 às 18:00. Bilhetes na bilheteira ou na BOL; visitas guiadas em português aos sábados e domingos às 16:00.'
  },
  'teatro-nacional-sao-joao': {
    body: 'O Teatro Nacional São João, na Praça da Batalha, é um dos teatros nacionais portugueses. Produz e acolhe teatro, dança e coproduções internacionais e gere também o Teatro Carlos Alberto e o Mosteiro de São Bento da Vitória.\n\nBilheteira: no teatro e online na BOL.'
  },
  'theatro-circo': {
    body: 'O Theatro Circo abriu em 1915 na Avenida da Liberdade, em Braga, e é uma das salas históricas do Norte. Programa música, teatro, dança, cinema e atividades para famílias e escolas.\n\nBilheteira: no teatro e online na BOL; alguns espetáculos estão também na Ticketline.'
  },
  'batalha-centro-de-cinema': {
    body: 'O antigo Cinema Batalha, um edifício modernista dos anos 1940, reabriu como Batalha Centro de Cinema, o cinema municipal do Porto. Mostra estreias, ciclos, antestreias, cinema português e de autor, e tem várias salas.\n\nBilheteira: no cinema e online na BOL.'
  },
  'aula-magna': {
    body: 'A Aula Magna é o grande auditório da Universidade de Lisboa, no edifício da Reitoria, na Cidade Universitária. É uma das salas grandes da cidade para concertos, conferências e espetáculos de stand-up.\n\nOs bilhetes dos espetáculos vendem-se normalmente na BOL e nos pontos de venda habituais.'
  },
  'teatro-da-trindade': {
    body: 'O Teatro da Trindade abriu em 1867 no Chiado e é gerido pela Fundação INATEL. Programa teatro, música, espetáculos para famílias e stand-up comedy.\n\nBilheteira: no teatro e na Ticketline. Fica perto do metro Baixa-Chiado.'
  },
  'teatro-sa-da-bandeira': {
    body: 'O Teatro Sá da Bandeira, na Baixa do Porto, é um dos teatros mais antigos da cidade. Hoje tem uma das programações de stand-up comedy mais fortes do Porto, na Sala Principal e no Estúdio Latino.\n\nBilheteira: no teatro e na Ticketline.'
  }
};

module.exports = { events, works, artists, venues };
