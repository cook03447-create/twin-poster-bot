import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Поиск шрифта: в корне или в папке fonts
const fontInRoot = path.join(__dirname, 'Benzin-Bold.ttf');
const fontInFolder = path.join(__dirname, 'fonts', 'Benzin-Bold.ttf');
const fontPath = fs.existsSync(fontInRoot) ? fontInRoot : fontInFolder;
const benzinBold = fs.readFileSync(fontPath);

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "ВАШ_ТОКЕН_БОТА";
const PORT = process.env.PORT || 3000;

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

// Полный реестр топ-турниров из твоего плагина Фигмы с приоритетами
const TOURNAMENTS = [
  { id: "1970324836975847", key: "rpl", label: "🇷🇺 РПЛ", name: "Россия: Премьер-Лига", priority: 0 },
  { id: "1970324836975359", key: "epl", label: "🏴 АПЛ", name: "Англия: Премьер-Лига", priority: 1 },
  { id: "1970324836975689", key: "laliga", label: "🇪🇸 Ла Лига", name: "Испания: Ла Лига", priority: 2 },
  { id: "1970324836975721", key: "ligue1", label: "🇫🇷 Лига 1", name: "Франция: Лига 1", priority: 3 },
  { id: "1970324836975649", key: "bundesliga", label: "🇩🇪 Бундеслига", name: "Германия: Бундеслига", priority: 4 },
  { id: "1970324836978008", key: "italy-serie-a", label: "🇮🇹 Серия А", name: "Италия: Серия А", priority: 5 },
  { id: "1970324836980123", key: "ucl", label: "🏆 ЛЧ", name: "Лига Чемпионов УЕФА", priority: 6 },
  { id: "1970324836980121", key: "uel", label: "🏆 ЛЕ", name: "Лига Европы УЕФА", priority: 7 },
  { id: "1970324836991678", key: "uecl", label: "🏆 ЛК", name: "Лига Конференций УЕФА", priority: 8 },
  { id: "1970324836975098", key: "kpl", label: "🇰🇿 КПЛ", name: "Казахстан: Премьер-Лига", priority: 9 },
  { id: "1970324836979695", key: "cup-russia", label: "🇷🇺 Кубок России", name: "Россия: Кубок", priority: 10 },
  { id: "1970324836975366", key: "cup-england", label: "🏴 Кубок Англии", name: "Англия: Кубок (FA Cup)", priority: 11 },
  { id: "1970324836975690", key: "cup-spain", label: "🇪🇸 Кубок Испании", name: "Испания: Кубок (Copa del Rey)", priority: 12 },
  { id: "1970324836975652", key: "cup-germany", label: "🇩🇪 Кубок Германии", name: "Германия: Кубок (DFB-Pokal)", priority: 13 },
  { id: "1970324836978108", key: "cup-italy", label: "🇮🇹 Кубок Италии", name: "Италия: Кубок (Coppa Italia)", priority: 14 },
  { id: "1970324836975605", key: "primeira-liga", label: "🇵🇹 Примейра Лига", name: "Португалия: Примейра Лига", priority: 15 },
  { id: "1970324836975624", key: "super-lig-turkey", label: "🇹🇷 Суперлига", name: "Турция: Суперлига", priority: 16 },
  { id: "1970324836986742", key: "uefa-nations-league", label: "🏆 Лига Наций", name: "Лига Наций УЕФА", priority: 17 }
];

// Полная база логотипов из твоего плагина Фигмы (с актуальным Акроном 2023, Ливерпулем, ПСЖ)
const LOGO_MAP = {
  // ЕВРОКУБКИ
  "сабах баку": "Sabah_FC_(Azerbaijan).png", "сабах": "Sabah_FC_(Azerbaijan).png",
  "хапоэль беэр-шева": "Hapoel_Beer_Sheva.png", "хапоэль беэр шева": "Hapoel_Beer_Sheva.png",
  "буде-глимт": "Bodo-Glimt.png", "буде глимт": "FK_Bodø-Glimt_Logo.svg",
  "нек": "NEC_Nijmegen_logo.svg", "ласк": "LASK-Logo_2023.svg",
  "селтик": "Celtic_FC_crest.svg", "аек афины": "AEK_Athens_FC_logo.svg",
  "аек": "AEK_Athens_FC_logo.svg", "викинг": "Viking_FK_logo.svg",
  "динамо загреб": "GNK_Dinamo_Zagreb_logo.svg", "слован братислава": "SK_Slovan_Bratislava_logo.svg",
  "слован": "SK_Slovan_Bratislava_logo.svg", "галатасарай": "Galatasaray_Sports_Club_Logo.svg",
  "янг бойз": "BSC_Young_Boys_logo.svg", "ред булл зальцбург": "FC_Red_Bull_Salzburg_logo.svg",
  "зальцбург": "FC_Red_Bull_Salzburg_logo.svg", "спарта прага": "AC_Sparta_Prague_logo.svg",
  "спарта": "AC_Sparta_Prague_logo.svg", "мальме": "Malmö_FF_logo.svg",
  "црвена звезда": "FK_Crvena_zvezda_logo.svg", "бешикташ": "Besiktas_JK.svg",
  "орхус": "Aarhus_Gymnastikforening_logo.svg", "бенфика": "SL_Benfica_logo.svg",
  "лех познань": "Lech_Poznań_logo.svg", "лех": "Lech_Poznań_logo.svg",
  "андерлехт": "RSC_Anderlecht_logo.svg", "трабзонспор": "Trabzonspor_Amblemi.svg",
  "рапид вена": "SK_Rapid_Wien_logo.svg", "купс": "KuPS_logo.svg",
  "карабах": "Qarabag_FK_logo.svg", "лугано": "FC_Lugano_logo.svg",
  "копенгаген": "FC_København_logo.svg", "аякс": "AFC_Ajax_logo.svg",
  "брага": "SC_Braga_logo.svg", "гент": "KAA_Gent_logo.svg",
  "крайова": "CS_Universitatea_Craiova_logo.svg", "хетафе": "Getafe_CF_logo.svg",

  // РПЛ (с актуальным Акроном 2023 и Зенитом 2023)
  "акрон": "FC_Akron_Logo_2023.svg", "родина": "FC_Rodina_Logo.svg",
  "динамо махачкала": "FC_Dynamo_Makhachkala_Logo.svg", "махачкала": "FC_Dynamo_Makhachkala_Logo.svg",
  "зенит": "FC_Zenit_logo_2023.svg", "спартак москва": "FC_Spartak_Moscow_Logo.svg",
  "спартак": "FC_Spartak_Moscow_Logo.svg", "цска москва": "FC_CSKA_Moscow_Logo.svg",
  "цска": "FC_CSKA_Moscow_Logo.svg", "краснодар": "FC_Krasnodar_Logo.svg",
  "локомотив москва": "FC_Lokomotiv_Moscow_Logo.svg", "локомотив": "FC_Lokomotiv_Moscow_Logo.svg",
  "динамо москва": "FC_Dynamo_Moscow_Logo.svg", "динамо м": "FC_Dynamo_Moscow_Logo.svg",
  "ростов": "Rostov.svg", "факел": "Fakel_Voronezh_logo.svg",
  "оренбург": "FC_Orenburg_logo.svg", "ахмат": "FC_Akhmat_Grozny_Logo.svg",
  "рубин": "FC_Rubin_Kazan_logo.svg", "крылья советов": "FC_Krylia_Sovetov_Logo.svg",
  "крылья": "FC_Krylia_Sovetov_Logo.svg", "пари нн": "FC_Pari_Nizhny_Novgorod_logo.svg",
  "пари нижний новгород": "FC_Pari_Nizhny_Novgorod_logo.svg", "нижний новгород": "FC_Pari_Nizhny_Novgorod_logo.svg",
  "химки": "FC_Khimki_Logo.svg", "балтика": "FC_Baltika_Kaliningrad_logo.png",
  "сочи": "PFC_Sochi_logo.png", "урал": "FC_Ural_Sverdlovsk_Oblast_Logo.svg",

  // ФРАНЦИЯ (ПСЖ)
  "псж": "Paris_Saint-Germain_F.C..svg", "psg": "Paris_Saint-Germain_F.C..svg",
  "пари сен-жермен": "Paris_Saint-Germain_F.C..svg", "пари сен жермен": "Paris_Saint-Germain_F.C..svg",
  "марсель": "Olympique_de_Marseille_logo.svg", "монако": "AS_Monaco_FC_logo.svg",
  "лион": "Olympique_Lyonnais_logo.svg", "лилль": "Lille_OSC_2018_logo.svg",
  "ницца": "OGC_Nice_logo.svg", "ланс": "RC_Lens_logo.svg", "ренн": "Stade_Rennais_FC.svg",

  // АНГЛИЯ (Ливерпуль)
  "арсенал": "Arsenal_FC.svg", "челси": "FC_Chelsea_Logo.svg",
  "ливерпуль": "FC_Liverpool_Logo.svg", "liverpool": "FC_Liverpool_Logo.svg",
  "манчестер сити": "Manchester_City_FC.svg", "ман сити": "Manchester_City_FC.svg",
  "манчестер юнайтед": "Manchester_United_FC_crest.svg", "ман юнайтед": "Manchester_United_FC_crest.svg",
  "тоттенхэм": "Tottenham_Hotspur.svg", "тоттенхэм хотспур": "Tottenham_Hotspur.svg",
  "астон вилла": "Aston_Villa_FC_new_crest.svg", "ньюкасл": "Newcastle_United_Logo.svg",
  "брайтон": "Brighton_%26_Hove_Albion_logo.png", "борнмут": "AFC_Bournemouth_%282013%29.svg",
  "вест хэм": "West_Ham_United_FC_logo.svg", "фулхэм": "Fulham_FC_%28shield%29.svg",
  "брентфорд": "Brentford_FC_crest.svg", "кристал пэлас": "Crystal_Palace_FC_logo_%282022%29.svg",
  "вулверхэмптон": "Wolverhampton_Wanderers.svg", "эвертон": "Everton_FC_logo.svg",
  "ноттингем": "Nottingham_Forest_logo.svg",

  // ИСПАНИЯ
  "реал мадрид": "FC_Real_Madrid_Logo.svg", "барселона": "FC_Barcelona.svg",
  "атлетико": "FC_Atletico_Madrid_Logo.svg", "атлетик": "Athletic_Bilbao_logo.svg",
  "севилья": "Sevilla_FC_logo.svg", "валенсия": "Valencia_cf.svg",
  "вильярреал": "FC_Villarreal_Logo.svg", "реал сосьедад": "Real_Sociedad_logo.svg",
  "бетис": "Real_betis_logo.svg", "жирона": "Girona_FC_logo.svg",

  // ИТАЛИЯ
  "интер": "FC_Internazionale_Milano_2021.svg", "милан": "Logo_of_AC_Milan.svg",
  "ювентус": "Juventus_FC_2017_logo.svg", "наполи": "SSC_Napoli_2025_(white_and_azure).svg",
  "рома": "AS_Roma_logo_%282017%29.svg", "лацио": "SS_Lazio_badge.svg",
  "аталанта": "Atalanta_BC.svg", "фиорентина": "ACF_Fiorentina_2022.svg",
  "болонья": "Bologna_FC_1909_logo.svg", "комо": "Como_1907_logo.svg",

  // ГЕРМАНИЯ
  "бавария": "FC_Bayern_München_logo_%282017%29.svg", "боруссия дортмунд": "Borussia_Dortmund_logo.svg",
  "байер": "Bayer_04_Leverkusen_logo.svg", "рб лейпциг": "RB_Leipzig_2014_logo.svg",
  "айнтрахт": "Eintracht_Frankfurt_Logo.svg", "штутгарт": "VfB_Stuttgart_1893_Logo.svg",
  "фрайбург": "SC_Freiburg_logo.svg", "шальке": "FC_Schalke_04_Logo.svg"
};

const bgMemoryCache = new Map();
const logoMemoryCache = new Map();

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

app.get('/', (req, res) => res.send('Twin Poster Bot is running! 🚀'));

app.post('/webhook', async (req, res) => {
  res.status(200).send('OK');

  const update = req.body;
  if (!update) return;

  try {
    if (update.callback_query) {
      const query = update.callback_query;
      const chatId = query.message.chat.id;
      const tourKey = query.data.replace('twin_', '');

      await answerCallback(TELEGRAM_BOT_TOKEN, query.id);
      handlePosterGeneration(TELEGRAM_BOT_TOKEN, chatId, tourKey).catch(console.error);
    } else if (update.message && update.message.chat) {
      const chatId = update.message.chat.id;
      sendMainMenu(TELEGRAM_BOT_TOKEN, chatId).catch(console.error);
    }
  } catch (err) {
    console.error('Webhook error:', err);
  }
});

async function handlePosterGeneration(token, chatId, tourKey) {
  let statusMsgId = null;

  try {
    const initRes = await sendMessage(token, chatId, `⏳ [1/4] Подключаюсь к линии...`);
    statusMsgId = initRes?.result?.message_id;

    const result = await loadMatchesFromLine(tourKey);

    if (!result.matches || result.matches.length === 0) {
      await notifyUser(token, chatId, statusMsgId, `⚠️ На сегодня в выбранном турнире нет матчей в линии.\n\nПопробуйте «🇷🇺 РПЛ (Twin)» или «⚽️ Любые матчи дня (Twin)»!`);
      return;
    }

    await notifyUser(token, chatId, statusMsgId, `⏳ [2/4] Загружаю логотипы из базы...`);

    const top4 = result.matches.slice(0, 4);

    // Загрузка логотипов: СНАЧАЛА база плагина (Википедия), затем сайт БК
    await Promise.all(top4.map(async m => {
      const [l1, l2] = await Promise.all([
        getLogoWithPriority(m.team1, m.fallback1),
        getLogoWithPriority(m.team2, m.fallback2)
      ]);
      m.logo1 = l1;
      m.logo2 = l2;
    }));

    await notifyUser(token, chatId, statusMsgId, `⏳ [3/4] Рендерю постер HD (1280×1280)...`);

    const bgUrl = BACKGROUNDS.twin[tourKey] || BACKGROUNDS.twin.games;
    const bgDataUrl = await getCachedBg(bgUrl);

    const layout = h('div', {
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
          gap: '28px'
        }
      },
        ...top4.map(m => renderTwinMatchCard(m))
      )
    );

    const svg = await satori(layout, {
      width: 1280,
      height: 1280,
      fonts: [{ name: 'Benzin', data: benzinBold, weight: 700 }]
    });

    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1280 } });
    const pngBuffer = resvg.render().asPng();

    await notifyUser(token, chatId, statusMsgId, `⏳ [4/4] Отправляю файл...`);

    await sendDocument(token, chatId, pngBuffer, `twin_${tourKey}.png`);
    await deleteMessage(token, chatId, statusMsgId);

  } catch (err) {
    console.error('Ошибка в handlePosterGeneration:', err);
    await notifyUser(token, chatId, statusMsgId, `⚠️ Сбой при генерации: ${err.message || String(err)}`);
  }
}

function renderTwinMatchCard(m) {
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
        top: '-13px',
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
          style: {
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: 'bold',
            opacity: 0.75,
            margin: '0 2px'
          }
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

    // Нижняя белая плашка кэфов (компактная)
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

// Загрузка матчей: строгая фильтрация по белому списку TOURNAMENTS (как в плагине)
async function loadMatchesFromLine(targetTourKey) {
  const targetTournament = TOURNAMENTS.find(t => t.key === targetTourKey);
  const targetId = targetTournament?.id;

  let url = `https://4278.info/api-2/betline/events/all?ctag=ru-RU-7da6p&hideClosed=true&flags=reg,urlv2,orn2,cn,mm2,rrc,nodup,cmg`;
  if (targetId) url += `&league_id=${encodeURIComponent(targetId)}`;

  let rawEvents = [];
  try {
    const res = await fetch(url, {
      headers: {
        "accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0",
        "x-app-skin": "twin",
        "x-requested-uri": "/ru-ru/top/soccer",
        "Referer": "https://4278.info/"
      }
    });
    if (res.ok) {
      const json = await res.json();
      rawEvents = json?.events || [];
    }
  } catch (e) {
    return { matches: [], debug: `Сбой сети БК: ${e.message}` };
  }

  const list = [];

  for (const ev of rawEvents) {
    if (!ev.competitors || ev.competitors.length < 2) continue;

    const t1 = ev.competitors[0].name;
    const t2 = ev.competitors[1].name;
    if (!t1 || !t2) continue;

    // Исключаем виртуальный спорт и SRL
    if (ev?.league?.virtual === true || ev?.sport?.virtual === true) continue;
    if (/\bsrl\b/i.test(t1) || /\bsrl\b/i.test(t2)) continue;

    // Исключаем американский/австралийский футбол и регби
    const sportName = (ev.league?.sport?.name || ev.sport?.name || '').toLowerCase();
    if (sportName.includes('америк') || sportName.includes('австрал') || sportName.includes('регби')) continue;

    // Определение турнира строго по базе плагина
    const matchedTour = getTournamentFromEvent(ev);

    if (targetTourKey !== 'games') {
      if (!matchedTour || matchedTour.key !== targetTourKey) continue;
    } else {
      // Для "Матчей дня" берем ТОЛЬКО официальные турниры из белого списка TOURNAMENTS!
      if (!matchedTour) continue;
    }

    let rawTime = ev.kickoff || ev.startTime || ev.date || Date.now();
    if (!isNaN(rawTime) && String(rawTime).length === 10) rawTime = parseInt(rawTime) * 1000;
    const d = new Date(rawTime);
    const timeStr = d.toLocaleTimeString('ru-RU', { timeZone: 'Europe/Moscow', hour: '2-digit', minute: '2-digit' });

    let p1 = '1.85', x = '3.50', p2 = '4.20';
    let hasResult = false;

    if (ev.markets) {
      for (const m of ev.markets) {
        if (m.runners) {
          for (const r of m.runners) {
            if (r.tags?.includes('HOME')) p1 = Number(r.price).toFixed(2);
            if (r.tags?.includes('DRAW')) x = Number(r.price).toFixed(2);
            if (r.tags?.includes('AWAY')) p2 = Number(r.price).toFixed(2);
          }
          hasResult = true;
          break;
        }
      }
    }

    if (!hasResult) continue;

    list.push({
      team1: t1.toUpperCase(),
      team2: t2.toUpperCase(),
      time: timeStr,
      timestamp: Number(rawTime),
      priority: matchedTour ? matchedTour.priority : 99,
      p1, x, p2,
      fallback1: ev.competitors[0].logo || ev.competitors[0].imageUrl || null,
      fallback2: ev.competitors[1].logo || ev.competitors[1].imageUrl || null
    });
  }

  // Сортируем: сначала самые статусные лиги, затем по времени
  list.sort((a, b) => a.priority !== b.priority ? a.priority - b.priority : a.timestamp - b.timestamp);

  return { matches: list, debug: `Найдено в линии: ${list.length}` };
}

// Определение турнира из твоего плагина Фигмы
function getTournamentFromEvent(event) {
  const candidates = [
    event?.league?.url,
    event?.league?.urlv2,
    event?.league?.id,
    event?.league?.uid,
    event?.url
  ].filter(Boolean).map(v => String(v).trim().toLowerCase());

  for (const tournament of TOURNAMENTS) {
    if (candidates.some(v => v === tournament.id || v.includes(tournament.id))) {
      return tournament;
    }
  }

  const leagueName = String(event?.league?.name || "").trim().toLowerCase();
  const urlText = candidates.join(" ");

  if (/^(?:россия:\s*)?премьер-?лига$/i.test(leagueName) || (/\/russia\//i.test(urlText) && /\/premier-league(?:\/|$)/i.test(urlText))) return TOURNAMENTS.find(t => t.key === "rpl") || null;
  if (/^(?:испания:\s*)?(?:ла\s*лига|laliga)$/i.test(leagueName) || /\/laliga(?:\/|$)/i.test(urlText)) return TOURNAMENTS.find(t => t.key === "laliga") || null;
  if (/^(?:англия:\s*)?премьер-?лига$/i.test(leagueName) || (/\/england\//i.test(urlText) && /\/premier-league(?:\/|$)/i.test(urlText))) return TOURNAMENTS.find(t => t.key === "epl") || null;
  if (/^(?:франция:\s*)?лига\s*1$/i.test(leagueName) || /\/ligue-1(?:\/|$)/i.test(urlText)) return TOURNAMENTS.find(t => t.key === "ligue1") || null;
  if (/^(?:германия:\s*)?бундеслига$/i.test(leagueName) || /\/bundesliga(?:\/|$)/i.test(urlText)) return TOURNAMENTS.find(t => t.key === "bundesliga") || null;
  if (/^(?:италия:\s*)?italy-serie-a$/i.test(leagueName) || /\/serie-a(?:\/|$)/i.test(urlText)) return TOURNAMENTS.find(t => t.key === "italy-serie-a") || null;
  if (/\/uefa-champions-league(?:\/|$)/i.test(urlText)) return TOURNAMENTS.find(t => t.key === "ucl") || null;
  if (/\/uefa-europa-league(?:\/|$)/i.test(urlText)) return TOURNAMENTS.find(t => t.key === "uel") || null;
  if (/\/uefa-europa-conference-league(?:\/|$)/i.test(urlText)) return TOURNAMENTS.find(t => t.key === "uecl") || null;
  if (/\/uefa-nations-league(?:\/|$)/i.test(urlText)) return TOURNAMENTS.find(t => t.key === "uefa-nations-league") || null;

  return null;
}

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

// Загрузка логотипов с приоритетом: 1. База плагина (LOGO_MAP) -> 2. Сайт БК
async function getLogoWithPriority(teamName, bookmakerLogoUrl) {
  const cacheKey = String(teamName).toLowerCase().trim();
  if (logoMemoryCache.has(cacheKey)) return logoMemoryCache.get(cacheKey);

  // Очистка названия от приставок (как в твоем плагине Фигмы)
  const raw = cacheKey.replace(/ё/g, 'е');
  const clean = raw.replace(/(хк|hc|фк|пфк|fc|pfc|cf|cd|ud|rcd|sd|us|as|ssc|ac)\b/gi, '').replace(/[^a-zа-я0-9]/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. ПРИОРИТЕТ: Ищем в базе LOGO_MAP из твоего плагина (обновленные актуальные гербы)
  let fileName = null;
  for (const key in LOGO_MAP) {
    const k = key.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    if (clean === k) {
      fileName = LOGO_MAP[key];
      break;
    }
  }

  if (!fileName) {
    for (const key in LOGO_MAP) {
      const k = key.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]/g, ' ').replace(/\s+/g, ' ').trim();
      if (clean.includes(k) || k.includes(clean)) {
        fileName = LOGO_MAP[key];
        break;
      }
    }
  }

  if (fileName) {
    try {
      const directWikiThumb = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=160`;
      const wRes = await fetch(directWikiThumb, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0.0.0' }
      });
      if (wRes.ok) {
        const buf = await wRes.arrayBuffer();
        const dataUrl = `data:image/png;base64,${Buffer.from(buf).toString('base64')}`;
        logoMemoryCache.set(cacheKey, dataUrl);
        return dataUrl;
      }
    } catch (e) {}
  }

  // 2. ЗАПАСНОЙ ВАРИАНТ: Логотип букмекера (если в базе LOGO_MAP клуба нет)
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

async function sendMainMenu(token, chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🟠 Лига Европы (Twin)', callback_data: 'twin_uel' },
        { text: '🟢 Лига Конференций (Twin)', callback_data: 'twin_uecl' }
      ],
      [
        { text: '⭐️ Лига Чемпионов (Twin)', callback_data: 'twin_ucl' },
        { text: '🇷🇺 РПЛ (Twin)', callback_data: 'twin_rpl' }
      ],
      [
        { text: '⚽️ Любые матчи дня (Twin)', callback_data: 'twin_games' }
      ]
    ]
  };

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '🏆 Выберите турнир для генерации постера Twin (HD 1280×1280):',
      reply_markup: keyboard
    })
  });
}

async function answerCallback(token, callbackQueryId) {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}

async function sendMessage(token, chatId, text) {
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  return await res.json();
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
