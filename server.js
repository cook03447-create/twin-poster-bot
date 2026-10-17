import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Поиск шрифта
const fontInRoot = path.join(__dirname, 'Benzin-Bold.ttf');
const fontInFolder = path.join(__dirname, 'fonts', 'Benzin-Bold.ttf');
const fontPath = fs.existsSync(fontInRoot) ? fontInRoot : fontInFolder;
const benzinBold = fs.readFileSync(fontPath);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "ВАШ_ТОКЕН_БОТА";
const PORT = process.env.PORT || 3000;

// 12 подложек
const BACKGROUNDS = {
  twin: {
    uel: 'https://i.postimg.cc/brWTqPVn/ueltwin.jpg',
    uecl: 'https://i.postimg.cc/brWTqPVj/uecltwin.jpg',
    ucl: 'https://i.postimg.cc/0jbngjfn/ucltwin.jpg',
    rpl: 'https://i.postimg.cc/hv6rKnyH/rpltwin.jpg',
    games: 'https://i.postimg.cc/GtHK0tKR/gamestwin.jpg'
  },
  leon: {
    uel: 'https://i.postimg.cc/mkJwT4pL/uelleon.jpg',
    uecl: 'https://i.postimg.cc/J0vqR8Y8/ueclleon.jpg',
    ucl: 'https://i.postimg.cc/d3pBJFHb/uclleon.jpg',
    rpl: 'https://i.postimg.cc/kGBsrGsJ/rplleon.jpg',
    games: 'https://i.postimg.cc/3Nd1MN1H/gamesleon.jpg',
    gamesars: 'https://i.postimg.cc/4ymPCyPR/gamesarsleon.jpg'
  },
  slott: {
    games: 'https://i.postimg.cc/L5nDd5Dp/gamesslott.jpg'
  }
};

const TOURNAMENTS = [
  { id: "1970324836975847", key: "rpl", label: "🇷🇺 РПЛ", priority: 0 },
  { id: "1970324836975359", key: "epl", label: "🏴 АПЛ", priority: 1 },
  { id: "1970324836975689", key: "laliga", label: "🇪🇸 Ла Лига", priority: 2 },
  { id: "1970324836975721", key: "ligue1", label: "🇫🇷 Лига 1", priority: 3 },
  { id: "1970324836975649", key: "bundesliga", label: "🇩🇪 Бундеслига", priority: 4 },
  { id: "1970324836978008", key: "italy-serie-a", label: "🇮🇹 Серия А", priority: 5 },
  { id: "1970324836980123", key: "ucl", label: "🏆 ЛЧ", priority: 6 },
  { id: "1970324836980121", key: "uel", label: "🏆 ЛЕ", priority: 7 },
  { id: "1970324836991678", key: "uecl", label: "🏆 ЛК", priority: 8 }
];

const TOP_EUROPE_LEAGUES = [
  { id: "1970324836975359", name: "epl" },
  { id: "1970324836975689", name: "laliga" },
  { id: "1970324836978008", name: "italy-serie-a" },
  { id: "1970324836975649", name: "bundesliga" },
  { id: "1970324836975721", name: "ligue1" }
];

const LOGO_MAP = {
  // ЕВРОКУБКИ
  "сабах баку": "Sabah_FC_(Azerbaijan).png", "сабах": "Sabah_FC_(Azerbaijan).png",
  "хапоэль беэр-шева": "Hapoel_Beer_Sheva.png", "буде-глимт": "FK_Bodø-Glimt_Logo.svg",
  "буде глимт": "FK_Bodø-Glimt_Logo.svg", "нек": "NEC_Nijmegen_logo.svg",
  "ласк": "LASK-Logo_2023.svg", "селтик": "Celtic_FC_crest.svg",
  "аек афины": "AEK_Athens_FC_logo.svg", "аек": "AEK_Athens_FC_logo.svg",
  "викинг": "Viking_FK_logo.svg", "динамо загреб": "GNK_Dinamo_Zagreb_logo.svg",
  "слован братислава": "SK_Slovan_Bratislava_logo.svg", "слован": "SK_Slovan_Bratislava_logo.svg",
  "галатасарай": "Galatasaray_Sports_Club_Logo.svg", "янг бойз": "BSC_Young_Boys_logo.svg",
  "ред булл зальцбург": "FC_Red_Bull_Salzburg_logo.svg", "зальцбург": "FC_Red_Bull_Salzburg_logo.svg",
  "спарта прага": "AC_Sparta_Prague_logo.svg", "мальме": "Malmö_FF_logo.svg",
  "црвена звезда": "FK_Crvena_zvezda_logo.svg", "бешикташ": "Besiktas_JK.svg",
  "орхус": "Aarhus_Gymnastikforening_logo.svg", "бенфика": "SL_Benfica_logo.svg",
  "лех познань": "Lech_Poznań_logo.svg", "лех": "Lech_Poznań_logo.svg",
  "андерлехт": "RSC_Anderlecht_logo.svg", "трабзонспор": "Trabzonspor_Amblemi.svg",
  "рапид вена": "SK_Rapid_Wien_logo.svg", "купс": "KuPS_logo.svg",
  "карабах": "Qarabag_FK_logo.svg", "лугано": "FC_Lugano_logo.svg",
  "копенгаген": "FC_København_logo.svg", "аякс": "AFC_Ajax_logo.svg",
  "брага": "SC_Braga_logo.svg", "гент": "KAA_Gent_logo.svg",
  "крайова": "CS_Universitatea_Craiova_logo.svg", "хетафе": "Getafe_CF_logo.svg",

  // РПЛ (Акрон 2023, Зенит 2023 и др.)
  "акрон": "FC_Akron_Logo_2023.svg", "родина": "FC_Rodina_Logo.svg",
  "динамо махачкала": "FC_Dynamo_Makhachkala_Logo.svg", "махачкала": "FC_Dynamo_Makhachkala_Logo.svg",
  "зенит": "FC_Zenit_logo_2023.svg", "спартак москва": "FC_Spartak_Moscow_Logo.svg",
  "спартак": "FC_Spartak_Moscow_Logo.svg", "цска москва": "FC_CSKA_Moscow_Logo.svg",
  "цска": "FC_CSKA_Moscow_Logo.svg", "краснодар": "FC_Krasnodar_Logo.svg",
  "локомотив москва": "FC_Lokomotiv_Moscow_Logo.svg", "локомотив": "FC_Lokomotiv_Moscow_Logo.svg",
  "динамо москва": "FC_Dynamo_Moscow_Logo.svg", "динамо м": "FC_Dynamo_Moscow_Logo.svg",
  "ростов": "Rostov.svg", "факел": "Fakel_Voronezh_logo.svg", "оренбург": "FC_Orenburg_logo.svg",
  "ахмат": "FC_Akhmat_Grozny_Logo.svg", "рубин": "FC_Rubin_Kazan_logo.svg",
  "крылья советов": "FC_Krylia_Sovetov_Logo.svg", "крылья": "FC_Krylia_Sovetov_Logo.svg",
  "пари нн": "FC_Pari_Nizhny_Novgorod_logo.svg", "пари нижний новгород": "FC_Pari_Nizhny_Novgorod_logo.svg",
  "химки": "FC_Khimki_Logo.svg", "балтика": "FC_Baltika_Kaliningrad_logo.png",

  // ФРАНЦИЯ (ПСЖ)
  "псж": "Paris_Saint-Germain_F.C..svg", "psg": "Paris_Saint-Germain_F.C..svg",
  "марсель": "Olympique_de_Marseille_logo.svg", "монако": "AS_Monaco_FC_logo.svg",
  "лион": "Olympique_Lyonnais_logo.svg", "страсбур": "Racing_Club_de_Strasbourg_Alsace_logo.svg",

  // АНГЛИЯ (Ливерпуль)
  "арсенал": "Arsenal_FC.svg", "челси": "FC_Chelsea_Logo.svg",
  "ливерпуль": "FC_Liverpool_Logo.svg", "liverpool": "FC_Liverpool_Logo.svg",
  "манчестер сити": "Manchester_City_FC.svg", "ман сити": "Manchester_City_FC.svg",
  "манчестер юнайтед": "Manchester_United_FC_crest.svg", "тоттенхэм": "Tottenham_Hotspur.svg",
  "астон вилла": "Aston_Villa_FC_new_crest.svg", "ньюкасл": "Newcastle_United_Logo.svg",
  "борнмут": "AFC_Bournemouth_%282013%29.svg", "кристал пэлас": "Crystal_Palace_FC_logo_%282022%29.svg",
  "брентфорд": "Brentford_FC_crest.svg", "эвертон": "Everton_FC_logo.svg",

  // ИСПАНИЯ
  "реал мадрид": "FC_Real_Madrid_Logo.svg", "барселона": "FC_Barcelona.svg",
  "атлетико": "FC_Atletico_Madrid_Logo.svg", "атлетико мадрид": "FC_Atletico_Madrid_Logo.svg",
  "эспаньол": "Rcd_espanyol_logo.svg", "вильярреал": "FC_Villarreal_Logo.svg",
  "реал сосьедад": "Real_Sociedad_logo.svg", "бетис": "Real_betis_logo.svg", "реал бетис": "Real_betis_logo.svg",

  // ИТАЛИЯ
  "интер": "FC_Internazionale_Milano_2021.svg", "милан": "Logo_of_AC_Milan.svg",
  "ювентус": "Juventus_FC_2017_logo.svg", "наполи": "SSC_Napoli_2025_(white_and_azure).svg",
  "рома": "AS_Roma_logo_%282017%29.svg", "аталанта": "Atalanta_BC.svg",
  "венеция": "Venezia_FC_2022_logo.svg", "комо": "Como_1907_logo.svg",

  // ГЕРМАНИЯ
  "бавария": "FC_Bayern_München_logo_%282017%29.svg", "боруссия дортмунд": "Borussia_Dortmund_logo.svg",
  "байер": "Bayer_04_Leverkusen_logo.svg", "рб лейпциг": "RB_Leipzig_2014_logo.svg",
  "вердер": "SV_Werder_Bremen_logo.svg", "вердер бремен": "SV_Werder_Bremen_logo.svg",
  "падерборн": "SC_Paderborn_07_logo.svg"
};

const bgMemoryCache = new Map();
const logoMemoryCache = new Map();
const userBrands = new Map();

function h(type, props = {}, ...children) {
  const p = props || {};
  const flatChildren = children.flat().filter(c => c !== null && c !== undefined && c !== false);
  return {
    type,
    props: {
      ...p,
      ...(flatChildren.length > 0 ? { children: flatChildren.length === 1 ? flatChildren[0] : flatChildren } : {})
    }
  };
}

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('Twin / Leon / Slott Poster Bot is alive! 🚀'));

app.post('/webhook', async (req, res) => {
  res.status(200).send('OK');

  const update = req.body;
  if (!update) return;

  try {
    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;
      const data = query.data;

      await answerCallback(TELEGRAM_BOT_TOKEN, query.id);

      if (data.startsWith('setbrand_')) {
        const brand = data.replace('setbrand_', '');
        userBrands.set(chatId, brand);
        await sendTournamentMenu(TELEGRAM_BOT_TOKEN, chatId, brand);
        return;
      }

      const [brand, tourKey] = data.split('_');
      handleTournamentGeneration(TELEGRAM_BOT_TOKEN, chatId, brand || 'twin', tourKey).catch(console.error);
    } 
    else if (update.message && update.message.chat) {
      const chatId = update.message.chat.id;
      const text = (update.message.text || '').trim();

      if (text === '/start') {
        await sendBrandSelection(TELEGRAM_BOT_TOKEN, chatId);
      } else {
        const currentBrand = userBrands.get(chatId) || 'twin';
        handleCustomTextMatches(TELEGRAM_BOT_TOKEN, chatId, currentBrand, text).catch(console.error);
      }
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }
});

async function sendBrandSelection(token, chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔷 Twin', callback_data: 'setbrand_twin' },
        { text: '🦁 Leon', callback_data: 'setbrand_leon' },
        { text: '🎰 Slott', callback_data: 'setbrand_slott' }
      ]
    ]
  };

  await sendMessage(token, chatId, '👋 Выберите бренд для генерации постеров:', keyboard);
}

async function sendTournamentMenu(token, chatId, brand) {
  const brandTitle = brand.toUpperCase();
  let buttons = [];

  if (brand === 'slott') {
    buttons = [
      [{ text: `⚽️ Матчи дня (${brandTitle})`, callback_data: `${brand}_games` }]
    ];
  } else {
    buttons = [
      [
        { text: `🟠 Лига Европы`, callback_data: `${brand}_uel` },
        { text: `🟢 Лига Конференций`, callback_data: `${brand}_uecl` }
      ],
      [
        { text: `⭐️ Лига Чемпионов`, callback_data: `${brand}_ucl` },
        { text: `🇷🇺 РПЛ (Тур)`, callback_data: `${brand}_rpl` }
      ],
      [
        { text: `⚽️ Матчи дня (Топ Европы)`, callback_data: `${brand}_games` }
      ]
    ];
  }

  const text = `🏆 Выбран бренд: *${brandTitle}*\n\nВыберите турнир или *пришлите список матчей текстом* (до 4 шт.), например:\n\nЛиверпуль - Челси\nБарселона - Реал Мадрид\nИнтер - Милан\nБавария - Боруссия`;
  await sendMessage(token, chatId, text, { inline_keyboard: buttons });
}

// Генерация по кнопкам турниров
async function handleTournamentGeneration(token, chatId, brand, tourKey) {
  let statusMsgId = null;

  try {
    const initRes = await sendMessage(token, chatId, `⏳ [1/4] Запрашиваю матчи из линии...`);
    statusMsgId = initRes?.result?.message_id;

    // Для Slott берем 8 матчей (2 колонки x 4 строки), для остальных 4-8
    const maxNeeded = brand === 'slott' ? 8 : (tourKey === 'rpl' || tourKey === 'ucl' ? 8 : 4);
    const matches = await fetchTournamentMatches(tourKey, maxNeeded);

    if (!matches || matches.length === 0) {
      await notifyUser(token, chatId, statusMsgId, `⚠️ На сегодня в выбранном турнире нет матчей в линии.\n\nПопробуйте «РПЛ» или пришлите список матчей текстом!`);
      return;
    }

    // Разбивка на постеры:
    // Slott: 1 постер на 8 матчей (2 колонки)
    // Twin / Leon: делим по 4 матча на постер
    let chunks = [];
    if (brand === 'slott') {
      chunks = [matches.slice(0, 8)];
    } else if ((tourKey === 'rpl' || tourKey === 'ucl') && matches.length > 4) {
      chunks = [matches.slice(0, 4), matches.slice(4, 8)];
    } else {
      chunks = [matches.slice(0, 4)];
    }

    await notifyUser(token, chatId, statusMsgId, `⏳ [2/4] Загружаю логотипы...`);

    for (let i = 0; i < chunks.length; i++) {
      const matchChunk = chunks[i];

      // Slott логотипы не нужны (по макету), для Twin и Leon загружаем
      if (brand !== 'slott') {
        await Promise.all(matchChunk.map(async m => {
          const [l1, l2] = await Promise.all([
            getLogoWikiFirst(m.team1, m.fallback1),
            getLogoWikiFirst(m.team2, m.fallback2)
          ]);
          m.logo1 = l1;
          m.logo2 = l2;
        }));
      }

      await notifyUser(token, chatId, statusMsgId, `⏳ [3/4] Рендерю постер ${brand.toUpperCase()} (${i + 1}/${chunks.length})...`);

      const pngBuffer = await renderPosterByBrand(brand, tourKey, matchChunk);
      const postFix = chunks.length > 1 ? `_part${i + 1}` : '';
      await sendDocument(token, chatId, pngBuffer, `${brand}_${tourKey}${postFix}.png`);
    }

    await deleteMessage(token, chatId, statusMsgId);

  } catch (err) {
    console.error('Generation error:', err);
    await notifyUser(token, chatId, statusMsgId, `⚠️ Сбой при генерации: ${err.message || String(err)}`);
  }
}

// Генерация по пользовательскому тексту
async function handleCustomTextMatches(token, chatId, brand, text) {
  let statusMsgId = null;

  try {
    const initRes = await sendMessage(token, chatId, `⏳ Ищу ваши матчи в линии букмекера...`);
    statusMsgId = initRes?.result?.message_id;

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean).slice(0, 4);
    if (lines.length === 0) return;

    const allSoccerEvents = await fetchAllActiveSoccer();
    const matchedList = [];
    const notFound = [];

    for (const line of lines) {
      const parts = line.split(/\s*(?:-|—|–|vs|против)\s*/i);
      if (parts.length < 2) continue;

      const userT1 = parts[0].trim();
      const userT2 = parts[1].trim();

      const foundEvent = findEventByTeams(allSoccerEvents, userT1, userT2);
      if (foundEvent) {
        matchedList.push(foundEvent);
      } else {
        notFound.push(`${userT1} — ${userT2}`);
      }
    }

    if (matchedList.length === 0) {
      await notifyUser(token, chatId, statusMsgId, `❌ Не удалось найти указанные матчи в линии БК.\n\nПроверьте названия команд.`);
      return;
    }

    await notifyUser(token, chatId, statusMsgId, `⏳ Найдено матчей: ${matchedList.length}. Загружаю логотипы...`);

    if (brand !== 'slott') {
      await Promise.all(matchedList.map(async m => {
        const [l1, l2] = await Promise.all([
          getLogoWikiFirst(m.team1, m.fallback1),
          getLogoWikiFirst(m.team2, m.fallback2)
        ]);
        m.logo1 = l1;
        m.logo2 = l2;
      }));
    }

    await notifyUser(token, chatId, statusMsgId, `⏳ Рендерю постер ${brand.toUpperCase()}...`);

    const pngBuffer = await renderPosterByBrand(brand, 'games', matchedList);
    await sendDocument(token, chatId, pngBuffer, `${brand}_custom_matches.png`);

    if (notFound.length > 0) {
      await sendMessage(token, chatId, `ℹ️ Не найдены в линии:\n• ${notFound.join('\n• ')}`);
    }

    await deleteMessage(token, chatId, statusMsgId);

  } catch (err) {
    console.error('Custom match error:', err);
    await notifyUser(token, chatId, statusMsgId, `⚠️ Ошибка: ${err.message || String(err)}`);
  }
}

function findEventByTeams(events, name1, name2) {
  const clean1 = cleanTeamName(name1);
  const clean2 = cleanTeamName(name2);

  for (const ev of events) {
    if (!ev.competitors || ev.competitors.length < 2) continue;
    const evT1 = cleanTeamName(ev.competitors[0].name);
    const evT2 = cleanTeamName(ev.competitors[1].name);

    const directMatch = (evT1.includes(clean1) || clean1.includes(evT1)) && (evT2.includes(clean2) || clean2.includes(evT2));
    const reverseMatch = (evT1.includes(clean2) || clean2.includes(evT1)) && (evT2.includes(clean1) || clean1.includes(evT2));

    if (directMatch || reverseMatch) {
      return parseSingleEvent(ev);
    }
  }
  return null;
}

function cleanTeamName(name) {
  return String(name).toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/(хк|hc|фк|пфк|fc|pfc|cf|cd|ud|rcd|sd|us|as|ssc|ac)\b/gi, '')
    .replace(/[^a-zа-я0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseSingleEvent(ev) {
  let rawTime = ev.kickoff || ev.startTime || ev.date || Date.now();
  if (!isNaN(rawTime) && String(rawTime).length === 10) rawTime = parseInt(rawTime) * 1000;
  const d = new Date(rawTime);
  const timeStr = d.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });
  const [timeH, timeM] = timeStr.split(':');

  let p1 = '1.85', x = '3.50', p2 = '4.20';
  if (ev.markets) {
    for (const m of ev.markets) {
      let fH = false, fD = false, fA = false;
      let t1 = p1, tx = x, t2 = p2;
      if (m.runners) {
        for (const r of m.runners) {
          if (r.tags?.includes('HOME')) { t1 = Number(r.price).toFixed(2); fH = true; }
          if (r.tags?.includes('DRAW')) { tx = Number(r.price).toFixed(2); fD = true; }
          if (r.tags?.includes('AWAY')) { t2 = Number(r.price).toFixed(2); fA = true; }
        }
        if (fH && fA) {
          p1 = t1; x = fD ? tx : '-'; p2 = t2;
          break;
        }
      }
    }
  }

  return {
    team1: ev.competitors[0].name.toUpperCase(),
    team2: ev.competitors[1].name.toUpperCase(),
    time: timeStr,
    timeH,
    timeM,
    timestamp: Number(rawTime),
    p1, x, p2,
    fallback1: ev.competitors[0].logo || ev.competitors[0].imageUrl || null,
    fallback2: ev.competitors[1].logo || ev.competitors[1].imageUrl || null
  };
}

// Запрос матчей с гарантией уникальности команд
async function fetchTournamentMatches(tourKey, maxNeeded = 4) {
  const API_HEADERS = {
    "accept": "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
    "x-app-skin": "twin",
    "x-requested-uri": "/ru-ru/top/soccer",
    "Referer": "https://4278.info/"
  };

  let rawEvents = [];

  try {
    if (tourKey === 'games') {
      const requests = TOP_EUROPE_LEAGUES.map(league =>
        fetch(`https://4278.info/api-2/betline/events/all?ctag=ru-RU-7da6p&hideClosed=true&flags=reg,urlv2,orn2,cn,mm2,rrc,nodup,cmg&league_id=${league.id}`, {
          headers: API_HEADERS
        }).then(r => r.json()).then(j => (j.events || []).map(e => ({ ...e, leagueKey: league.name }))).catch(() => [])
      );

      const results = await Promise.all(requests);
      rawEvents = results.flat();
    } else {
      const targetTournament = TOURNAMENTS.find(t => t.key === tourKey);
      if (!targetTournament) return [];

      const url = `https://4278.info/api-2/betline/events/all?ctag=ru-RU-7da6p&hideClosed=true&flags=reg,urlv2,orn2,cn,mm2,rrc,nodup,cmg&league_id=${targetTournament.id}`;
      const res = await fetch(url, { headers: API_HEADERS });
      if (res.ok) {
        const json = await res.json();
        rawEvents = json?.events || [];
      }
    }
  } catch (e) {
    console.error('Fetch tournament error:', e);
    return [];
  }

  const list = [];
  const seenTeams = new Set(); // Гарантирует, что ни одна команда не встретится дважды!

  for (const ev of rawEvents) {
    if (!ev.competitors || ev.competitors.length < 2) continue;
    if (ev?.league?.virtual === true || ev?.sport?.virtual === true) continue;

    const t1 = ev.competitors[0].name;
    const t2 = ev.competitors[1].name;
    if (!t1 || !t2) continue;

    if (/\bsrl\b/i.test(t1) || /\bsrl\b/i.test(t2)) continue;
    if (/\([a-zа-я0-9_\s]+\)/i.test(t1) || /\([a-zа-я0-9_\s]+\)/i.test(t2)) continue;

    // ПРОВЕРКА УНИКАЛЬНОСТИ: исключаем повторы одной команды (чтобы не было двух Оренбургов)
    const norm1 = cleanTeamName(t1);
    const norm2 = cleanTeamName(t2);
    if (seenTeams.has(norm1) || seenTeams.has(norm2)) continue;

    const parsed = parseSingleEvent(ev);
    if (parsed) {
      seenTeams.add(norm1);
      seenTeams.add(norm2);
      list.push(parsed);
    }

    if (list.length >= maxNeeded) break;
  }

  list.sort((a, b) => a.timestamp - b.timestamp);
  return list;
}

async function fetchAllActiveSoccer() {
  const API_HEADERS = {
    "accept": "application/json, text/plain, */*",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
    "Referer": "https://4278.info/"
  };

  const allLeagueIds = TOURNAMENTS.map(t => t.id);
  const requests = allLeagueIds.map(id =>
    fetch(`https://4278.info/api-2/betline/events/all?ctag=ru-RU-7da6p&hideClosed=true&flags=reg,urlv2,orn2,cn,mm2,rrc,nodup,cmg&league_id=${id}`, {
      headers: API_HEADERS
    }).then(r => r.json()).then(j => j.events || []).catch(() => [])
  );

  const results = await Promise.all(requests);
  return results.flat();
}

// -------------------------------------------------------------
// РЕНДЕР ПО БРЕНДАМ (TWIN / LEON / SLOTT)
// -------------------------------------------------------------

async function renderPosterByBrand(brand, tourKey, matches) {
  const bgUrl = BACKGROUNDS[brand]?.[tourKey] || BACKGROUNDS[brand]?.games || BACKGROUNDS.twin.games;
  const bgDataUrl = await getCachedBg(bgUrl);

  let layout;
  if (brand === 'leon') {
    layout = createLeonLayout(tourKey, matches, bgDataUrl);
  } else if (brand === 'slott') {
    layout = createSlottLayout(matches, bgDataUrl);
  } else {
    layout = createTwinLayout(matches, bgDataUrl);
  }

  const svg = await satori(layout, {
    width: 1280,
    height: 1280,
    fonts: [{ name: 'Benzin', data: benzinBold, weight: 700 }]
  });

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1280 } });
  return resvg.render().asPng();
}

// 1. ДИЗАЙН TWIN (карточки слева, компактная белая плашка кэфов)
function createTwinLayout(matches, bgDataUrl) {
  return h('div', {
    style: {
      display: 'flex',
      width: '1280px',
      height: '1280px',
      backgroundImage: `url(${bgDataUrl})`,
      backgroundSize: '1280px 1280px',
      position: 'relative',
      fontFamily: 'Benzin'
    }
  },
    h('div', {
      style: {
        position: 'absolute',
        left: '80px',
        top: '480px',
        width: '640px',
        display: 'flex',
        flexDirection: 'column',
        gap: '38px' // Увеличенный зазор, чтобы бейдж времени не накладывался на карточку сверху
      }
    },
      ...matches.map(m => renderTwinCard(m))
    )
  );
}

function renderTwinCard(m) {
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      width: '640px'
    }
  },
    // Бейдж времени
    h('div', {
      style: {
        position: 'absolute',
        top: '-15px',
        right: '24px',
        backgroundColor: '#18a0fb',
        color: '#ffffff',
        padding: '3px 12px',
        borderRadius: '4px',
        fontSize: '15px',
        fontWeight: 'bold',
        zIndex: 10
      }
    }, m.time),

    // Верхняя тёмная часть
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(10, 22, 55, 0.85)',
        border: '1.5px solid rgba(56, 189, 248, 0.45)',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        borderBottomRightRadius: '10px',
        padding: '14px 20px',
        gap: '16px',
        width: '100%'
      }
    },
      h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
        m.logo1 ? h('img', { src: m.logo1, style: { width: '46px', height: '46px', objectFit: 'contain' } }) : null,
        (m.logo1 && m.logo2) ? h('span', {
          style: { color: '#ffffff', fontSize: '15px', fontWeight: 'bold', opacity: 0.75, margin: '0 2px' }
        }, 'x') : null,
        m.logo2 ? h('img', { src: m.logo2, style: { width: '46px', height: '46px', objectFit: 'contain' } }) : null
      ),

      h('div', { style: { display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, gap: '4px' } },
        h('span', { style: { fontSize: '21px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#ffffff' } }, m.team1),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '21px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } },
          h('span', { style: { color: '#18a0fb' } }, 'VS'),
          h('span', { style: { color: '#ffffff' } }, m.team2)
        )
      )
    ),

    // Нижняя компактная плашка кэфов (360px)
    h('div', {
      style: {
        display: 'flex',
        width: '360px',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        color: '#000000',
        borderBottomLeftRadius: '10px',
        borderBottomRightRadius: '10px',
        padding: '7px 16px',
        fontSize: '23px',
        fontWeight: 'bold'
      }
    },
      h('span', null, m.p1),
      h('span', { style: { color: '#cbd5e1', fontWeight: 'normal' } }, '|'),
      h('span', null, m.x !== '-' ? m.x : '3.40'),
      h('span', { style: { color: '#cbd5e1', fontWeight: 'normal' } }, '|'),
      h('span', null, m.p2)
    )
  );
}

// 2. ДИЗАЙН LEON (по твоему референсу: КРАСНАЯ полоса кэфов, время вертикально 14/30)
function createLeonLayout(tourKey, matches, bgDataUrl) {
  // Для "Матчей дня" карточки встают СПРАВА (слева футболист Салах!), для РПЛ - слева
  const isGames = tourKey === 'games' || tourKey === 'gamesars';
  const leftPos = isGames ? '650px' : '80px';
  const topPos = isGames ? '160px' : '450px';

  return h('div', {
    style: {
      display: 'flex',
      width: '1280px',
      height: '1280px',
      backgroundImage: `url(${bgDataUrl})`,
      backgroundSize: '1280px 1280px',
      position: 'relative',
      fontFamily: 'Benzin'
    }
  },
    h('div', {
      style: {
        position: 'absolute',
        left: leftPos,
        top: topPos,
        width: '560px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }
    },
      ...matches.map(m => renderLeonCard(m))
    )
  );
}

function renderLeonCard(m) {
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      borderRadius: '12px',
      overflow: 'hidden'
    }
  },
    // Верхняя темная часть
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'rgba(25, 25, 25, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        padding: '12px 18px',
        gap: '16px'
      }
    },
      // Время вертикально (14 над 30)
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: 'bold',
          lineHeight: '1.1',
          color: '#ffffff',
          minWidth: '40px',
          borderRight: '1px solid rgba(255, 255, 255, 0.15)',
          paddingRight: '12px'
        }
      },
        h('span', null, m.timeH || '18'),
        h('span', null, m.timeM || '00')
      ),

      // Команды со своими логотипами в 2 строки
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
          overflow: 'hidden'
        }
      },
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
          m.logo1 ? h('img', { src: m.logo1, style: { width: '28px', height: '28px', objectFit: 'contain' } }) : null,
          h('span', { style: { fontSize: '18px', fontWeight: 'bold', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, m.team1)
        ),
        h('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
          m.logo2 ? h('img', { src: m.logo2, style: { width: '28px', height: '28px', objectFit: 'contain' } }) : null,
          h('span', { style: { fontSize: '18px', fontWeight: 'bold', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, m.team2)
        )
      )
    ),

    // Нижняя ФИРМЕННАЯ КРАСНАЯ плашка кэфов Leon
    h('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#e51b24', // Фирменный красный Leon
        color: '#ffffff',
        borderBottomLeftRadius: '12px',
        borderBottomRightRadius: '12px',
        padding: '6px 12px',
        fontSize: '21px',
        fontWeight: 'bold'
      }
    },
      h('span', null, m.p1),
      h('span', { style: { color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'normal' } }, '|'),
      h('span', null, m.x !== '-' ? m.x : '3.40'),
      h('span', { style: { color: 'rgba(255, 255, 255, 0.4)', fontWeight: 'normal' } }, '|'),
      h('span', null, m.p2)
    )
  );
}

// 3. ДИЗАЙН SLOTT (по твоему референсу: 2 КОЛОНКИ ПО 4 МАТЧА, всего 8 матчей, матовое стекло, без логотипов)
function createSlottLayout(matches, bgDataUrl) {
  const col1 = matches.slice(0, 4);
  const col2 = matches.slice(4, 8);

  return h('div', {
    style: {
      display: 'flex',
      width: '1280px',
      height: '1280px',
      backgroundImage: `url(${bgDataUrl})`,
      backgroundSize: '1280px 1280px',
      position: 'relative',
      fontFamily: 'Benzin'
    }
  },
    // Колонка 1
    h('div', {
      style: {
        position: 'absolute',
        left: '140px',
        top: '380px',
        width: '470px',
        display: 'flex',
        flexDirection: 'column',
        gap: '26px'
      }
    },
      ...col1.map(m => renderSlottCard(m))
    ),

    // Колонка 2
    h('div', {
      style: {
        position: 'absolute',
        left: '670px',
        top: '380px',
        width: '470px',
        display: 'flex',
        flexDirection: 'column',
        gap: '26px'
      }
    },
      ...col2.map(m => renderSlottCard(m))
    )
  );
}

function renderSlottCard(m) {
  return h('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
    }
  },
    // Верхняя часть (светлое матовое стекло)
    h('div', {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(215, 230, 255, 0.9)', // Светло-голубой Slott
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        padding: '12px 18px'
      }
    },
      // Команды в 2 строки без логотипов
      h('div', {
        style: {
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflow: 'hidden',
          flex: 1
        }
      },
        h('span', { style: { fontSize: '18px', fontWeight: 'bold', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, m.team1),
        h('span', { style: { fontSize: '18px', fontWeight: 'bold', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, m.team2)
      ),

      // Время справа вертикальным бейджем
      h('div', {
        style: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          color: '#1e293b',
          fontSize: '14px',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '8px'
        }
      }, m.time)
    ),

    // Нижняя плашка кэфов (градиент Slott)
    h('div', {
      style: {
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
        color: '#ffffff',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
        padding: '6px 12px',
        fontSize: '20px',
        fontWeight: 'bold'
      }
    },
      h('span', null, m.p1),
      h('span', { style: { color: 'rgba(255, 255, 255, 0.4)' } }, '|'),
      h('span', null, m.x !== '-' ? m.x : '3.40'),
      h('span', { style: { color: 'rgba(255, 255, 255, 0.4)' } }, '|'),
      h('span', null, m.p2)
    )
  );
}

// -------------------------------------------------------------
// КЭШ И ЗАГРУЗКА ИЗОБРАЖЕНИЙ
// -------------------------------------------------------------

async function getCachedBg(url) {
  if (bgMemoryCache.has(url)) return bgMemoryCache.get(url);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = await res.arrayBuffer();
    const mime = url.endsWith('.jpg') || url.endsWith('.jpeg') ? 'image/jpeg' : 'image/png';
    const dataUrl = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`;
    bgMemoryCache.set(url, dataUrl);
    return dataUrl;
  } catch (e) {
    throw new Error(`Не удалось загрузить фон постера (${e.message})`);
  }
}

// Тройной поиск по Википедии (Commons -> RuWiki -> EnWiki, как в твоем плагине)
async function getLogoWikiFirst(teamName, bookmakerLogoUrl) {
  const cacheKey = String(teamName).toLowerCase().trim();
  if (logoMemoryCache.has(cacheKey)) return logoMemoryCache.get(cacheKey);

  const raw = cacheKey.replace(/ё/g, 'е');
  const clean = raw.replace(/(хк|hc|фк|пфк|fc|pfc|cf|cd|ud|rcd|sd|us|as|ssc|ac)\b/gi, '').replace(/[^a-zа-я0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  let fileName = null;
  for (const key in LOGO_MAP) {
    const k = key.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean === k) { fileName = LOGO_MAP[key]; break; }
  }

  if (!fileName) {
    for (const key in LOGO_MAP) {
      const k = key.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.includes(k) || k.includes(clean)) { fileName = LOGO_MAP[key]; break; }
    }
  }

  // 1. Поиск по Википедии (Commons -> RuWiki -> EnWiki)
  if (fileName) {
    const safeName = encodeURIComponent(fileName);
    const endpoints = [
      `https://commons.wikimedia.org/wiki/Special:FilePath/${safeName}?width=160`,
      `https://ru.wikipedia.org/wiki/Special:FilePath/${safeName}?width=160`,
      `https://en.wikipedia.org/wiki/Special:FilePath/${safeName}?width=160`
    ];

    for (const url of endpoints) {
      try {
        const wRes = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' }
        });
        if (wRes.ok) {
          const buf = await wRes.arrayBuffer();
          if (buf.byteLength > 200) {
            const dataUrl = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
            logoMemoryCache.set(cacheKey, dataUrl);
            return dataUrl;
          }
        }
      } catch (e) {}
    }
  }

  // 2. Фоллбэк на сайт букмекера
  if (bookmakerLogoUrl) {
    try {
      let finalFbUrl = bookmakerLogoUrl.startsWith('/') ? `https://4278.info${bookmakerLogoUrl}` : bookmakerLogoUrl;
      const fbRes = await fetch(finalFbUrl, {
        headers: { "User-Agent": "Mozilla/5.0", "Referer": "https://4278.info/" }
      });
      if (fbRes.ok) {
        const buf = await fbRes.arrayBuffer();
        const dataUrl = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
        logoMemoryCache.set(cacheKey, dataUrl);
        return dataUrl;
      }
    } catch (e) {}
  }

  return null;
}

// -------------------------------------------------------------
// СЛУЖЕБНЫЕ МЕТОДЫ TELEGRAM
// -------------------------------------------------------------

async function sendMessage(token, chatId, text, replyMarkup = null) {
  const body = { chat_id: chatId, text, parse_mode: 'Markdown' };
  if (replyMarkup) body.reply_markup = replyMarkup;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await res.json();
}

async function answerCallback(token, callbackQueryId) {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}

async function notifyUser(token, chatId, messageId, text) {
  if (messageId) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId, text })
      });
      const data = await res.json();
      if (data && data.ok) return;
    } catch (_) {}
  }
  await sendMessage(token, chatId, text).catch(() => {});
}

async function deleteMessage(token, chatId, messageId) {
  if (!messageId) return;
  await fetch(`https://api.telegram.org/bot${token}/deleteMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, message_id: messageId })
  }).catch(() => {});
}

async function sendDocument(token, chatId, pngBuffer, filename) {
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('document', new Blob([pngBuffer], { type: 'image/png' }), filename);

  const res = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
    method: 'POST',
    body: form
  });

  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API sendDocument: ${data.description}`);
}

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
