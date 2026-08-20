// lib/engine.js — общий движок: темы брендов (голос+цвет по бренд-буку), ниши, рендер лендинга.

const BRANDS = {
  studyai:{
    name:'StudyAI', domain:'study24.ai', logo:'StudyAI',
    vars:{acc:'#146FE8',acc2:'#0754B8',ink:'#121826',bg:'#fff',soft:'#EAF4FF',line:'#d8e9fb',mut:'#5b6b85',
      heroBg:'linear-gradient(135deg,#EAF4FF,#f5faff)',heroInk:'#0d1a2e',
      display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'18px'},
    voice:{
      eyebrow:'90+ нейросетей в одном месте',
      h1:'Все нужные нейросети в одном месте.',
      sub:'Текст, фото, видео, музыка и презентации — работайте с ChatGPT, Claude, Gemini и другими моделями без десятка подписок и VPN.',
      cta:'Попробовать бесплатно',
      toolsTitle:'Один аккаунт вместо десятка подписок',
      toolsDesc:'90+ моделей под любую задачу — переключайтесь между ними в одном интерфейсе.',
      finalTitle:'Все нейросети — в одной подписке.',
      stats:[{v:'90+',l:'нейросетей'},{v:'₽',l:'оплата из России'},{v:'RU',l:'без VPN'},{v:'1',l:'подписка вместо 10'}],
      faq:[{q:'Нужен ли VPN?',a:'Нет, StudyAI работает из России без VPN и зарубежной карты.'},
           {q:'Какие модели доступны?',a:'ChatGPT, Claude, Gemini и ещё 90+ моделей для текста, фото, видео и музыки.'},
           {q:'Можно попробовать бесплатно?',a:'Да, доступны бесплатные генерации перед подпиской.'}]
    }
  },
  kampus:{
    name:'Кэмп', domain:'kampslides.ru', logo:'Кэмп',
    vars:{acc:'#DFFF00',acc2:'#171717',ink:'#171717',bg:'#fff',soft:'#F3F5F6',line:'#e6e8e9',mut:'#5c5c5c',
      heroBg:'linear-gradient(135deg,#171717,#171717)',heroInk:'#ffffff',
      display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'20px'},
    voice:{
      eyebrow:'AI-помощник для прогрессивной учёбы',
      h1:'Учись быстрее. Разбирайся глубже.',
      sub:'Твой AI для учёбы — от задачи до готового результата: работы, презентации, разбор тем и подготовка к экзаменам.',
      cta:'Начать учиться',
      toolsTitle:'От задачи до готового результата',
      toolsDesc:'Выбираешь задачу — проходишь шаги — получаешь результат. Ты управляешь процессом.',
      finalTitle:'Работы, задачи, презентации — разберёмся вместе.',
      stats:[{v:'24/7',l:'AI-репетитор'},{v:'PPTX',l:'презентации'},{v:'RU',l:'на русском'},{v:'1',l:'экосистема учёбы'}],
      faq:[{q:'Это просто доступ к нейросетям?',a:'Нет, Кэмп ведёт по шагам конкретную учебную задачу, а не просто даёт доступ к моделям.'},
           {q:'Можно сделать презентацию?',a:'Да, готовые PPTX-презентации — одна из ключевых задач.'},
           {q:'Поможет разобраться в теме?',a:'Да, AI-репетитор объясняет тему, а не только выдаёт готовый ответ.'}]
    }
  },
  avtor24:{
    name:'Автор24', domain:'avtor24.ru', logo:'Автор24',
    vars:{acc:'#5B2A86',acc2:'#FFC928',ink:'#111111',bg:'#fff',soft:'#F6F0FB',line:'#e9def4',mut:'#5c5468',
      heroBg:'linear-gradient(135deg,#5B2A86,#38205F)',heroInk:'#ffffff',
      display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'12px'},
    voice:{
      eyebrow:'Проверенные эксперты. Реальный результат',
      h1:'Найдите эксперта для вашей учебной задачи.',
      sub:'8 000+ проверенных экспертов по 100+ предметам. Опишите задачу, выберите специалиста и обсудите детали напрямую.',
      cta:'Найти эксперта',
      toolsTitle:'Прямая работа с реальным экспертом',
      toolsDesc:'Не нейросеть, а живой специалист — с рейтингом, отзывами и доработками при необходимости.',
      finalTitle:'Сложная работа? Разберитесь с ней вместе с экспертом.',
      stats:[{v:'8000+',l:'экспертов'},{v:'13 лет',l:'на рынке'},{v:'100+',l:'предметов'},{v:'★',l:'рейтинги и отзывы'}],
      faq:[{q:'Кто выполняет работу?',a:'Живой проверенный эксперт по вашему предмету, а не нейросеть.'},
           {q:'Можно выбрать специалиста самому?',a:'Да, вы сравниваете экспертов и выбираете подходящего.'},
           {q:'Что если нужны правки?',a:'Эксперт дорабатывает результат, есть гарантия на заказ.'}]
    }
  },
  mystylus:{
    name:'MyStylus', domain:'mystylus.ai', logo:'MyStylus',
    vars:{acc:'#181818',acc2:'#69C7EA',ink:'#181818',bg:'#fff',soft:'#FAF9F5',line:'#ece9e0',mut:'#5c5c5c',
      heroBg:'linear-gradient(135deg,#FAF9F5,#F5F5F2)',heroInk:'#181818',
      display:"'Fraunces',serif",body:"'Inter',sans-serif",radius:'10px'},
    voice:{
      eyebrow:'AI research & writing companion',
      h1:'Research smarter. Write with confidence.',
      sub:'From credible sources to citations and final draft — MyStylus takes your academic paper through the whole workflow in one workspace.',
      cta:'Start writing',
      toolsTitle:'From research to final draft',
      toolsDesc:'Sources, citations, outlining and editing — one workspace instead of ten scattered tools.',
      finalTitle:'Turn your sources into a stronger paper.',
      stats:[{v:'APA',l:'MLA, Chicago'},{v:'1',l:'workspace'},{v:'24/7',l:'AI editing'},{v:'∞',l:'revisions'}],
      faq:[{q:'Does it find real academic sources?',a:'Yes, MyStylus surfaces credible sources and helps analyze references.'},
           {q:'Which citation styles are supported?',a:'APA, MLA, Chicago and other common academic formats.'},
           {q:'Is this a human writer marketplace?',a:'No, MyStylus is an AI research and writing workspace, not a marketplace.'}]
    }
  },
  studybay:{
    name:'StudyBay', domain:'studybay.com', logo:'StudyBay',
    vars:{acc:'#55C779',acc2:'#29985A',ink:'#202124',bg:'#fff',soft:'#EAF9F0',line:'#d8f0e2',mut:'#4d6a5c',
      heroBg:'linear-gradient(135deg,#EAF9F0,#F5F7F6)',heroInk:'#16281f',
      display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'14px'},
    voice:{
      eyebrow:'Trusted expert marketplace',
      h1:'Get expert help with your assignment.',
      sub:'5,000+ experts across every subject. Post your project, compare offers, choose your expert and meet your deadline.',
      cta:'Find an expert',
      toolsTitle:'Choose your own expert',
      toolsDesc:'Compare offers, ratings and reviews — talk directly to the expert before you commit.',
      finalTitle:'Your deadline doesn\'t have to be stressful.',
      stats:[{v:'5000+',l:'experts'},{v:'★',l:'ratings & reviews'},{v:'24/7',l:'support'},{v:'100%',l:'your choice'}],
      faq:[{q:'Who completes the work?',a:'A real vetted expert you choose yourself, not an AI generator.'},
           {q:'Can I compare experts?',a:'Yes, you review offers, ratings and reviews before choosing.'},
           {q:'What about revisions?',a:'Experts support revisions to meet your requirements.'}]
    }
  }
};

// Ниши — задают только операционные блоки (сценарии/шаги), голос и позиционирование берутся из BRANDS[x].voice
const NICHES = {
  sellers:{label:'Селлеры МП',
    tools:[{t:'Карточка товара',d:'Обложка, слайд преимуществ и лайфстайл-визуал из одного фото.'},{t:'Фото и инфографика',d:'Серия изображений под требования площадки.'},{t:'Видео обзор',d:'Короткий рекламный ролик или оживлённое фото товара.'},{t:'Тексты и SEO',d:'Название, описание и ответы на отзывы.'}],
    steps:[{t:'Выберите задачу',d:'Карточка, фото, видео или текст.'},{t:'Опишите товар',d:'Добавьте фото или описание своими словами.'},{t:'Проверьте и используйте',d:'Сравните варианты и опубликуйте на площадке.'}]},
  authors:{label:'Статейщики',
    tools:[{t:'Черновик за минуты',d:'Структура и тезисы под вашу тему.'},{t:'Рерайт и уникальность',d:'Переписать источник своими словами.'},{t:'SEO-оптимизация',d:'Заголовки, метатеги и ключи под трафик.'},{t:'Проверка фактов',d:'Быстрый ресёрч и аргументы со ссылками.'}],
    steps:[{t:'Выберите тему',d:'Опишите задачу своими словами.'},{t:'Получите структуру',d:'Черновик, тезисы или готовый текст.'},{t:'Доработайте и публикуйте',d:'Отредактируйте и разместите материал.'}]},
  creators:{label:'Криэйторы',
    tools:[{t:'Сценарий Reels',d:'Хук, структура и текст под короткое видео.'},{t:'Визуалы для постов',d:'Обложки, карусели и иллюстрации в клик.'},{t:'Озвучка и субтитры',d:'Голос под ролик и авто-субтитры.'},{t:'Контент-план',d:'Идеи и рубрики на неделю под нишу.'}],
    steps:[{t:'Выберите формат',d:'Reels, пост, карусель или сценарий.'},{t:'Опишите идею',d:'Коротко — своими словами.'},{t:'Заберите готовый контент',d:'Используйте сразу или доработайте.'}]},
  business:{label:'Презентации',
    tools:[{t:'Питч для инвестора',d:'Логика от рынка до юнит-экономики и ROI.'},{t:'Коммерческое предложение',d:'Убедительно, без воды, с нужными акцентами.'},{t:'Защита проекта',d:'Структура аргументов под руководство.'},{t:'Анализ рынка',d:'Конкурентный ландшафт и стратегия за минуты.'}],
    steps:[{t:'Опишите задачу',d:'Кому и зачем нужна презентация.'},{t:'Получите структуру',d:'Логику и черновой текст слайдов.'},{t:'Оформите и защитите',d:'Доведите до финального вида.'}]},
  students:{label:'Студенты',
    tools:[{t:'Реферат и эссе',d:'Структура, введение и выводы по теме.'},{t:'Курсовая',d:'План, главы и оформление по методичке.'},{t:'Презентация к защите',d:'Слайды с акцентами под выступление.'},{t:'Проверка и антиплагиат',d:'Уникальность и вычитка перед сдачей.'}],
    steps:[{t:'Опишите задание',d:'Тема, требования, дедлайн.'},{t:'Получите результат',d:'Черновик, план или готовую работу.'},{t:'Проверьте и сдайте',d:'Доработайте под методичку.'}]},
  general:{label:'Универсальный',
    tools:[{t:'Тексты',d:'Посты, письма, описания под задачу.'},{t:'Изображения',d:'Визуалы и иллюстрации в один запрос.'},{t:'Видео',d:'Короткие ролики и оживление фото.'},{t:'Аналитика',d:'Разбор данных и быстрые выводы.'}],
    steps:[{t:'Выберите задачу',d:'Начните с нужного результата.'},{t:'Опишите запрос',d:'Своими словами.'},{t:'Заберите результат',d:'Сравните варианты и используйте.'}]}
};

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

// Собрать конфиг из брифа: ГОЛОС берём из бренда (обязательно), операционные блоки — из ниши.
function configFromPreset(brief){
  const brand=BRANDS[brief.product]?brief.product:'studyai';
  const b=BRANDS[brand], v=b.voice;
  const niche=NICHES[brief.niche]?brief.niche:'general';
  const n=NICHES[niche];
  return {brand,niche,ref:brief.ref||'',promo:brief.promo||'PARTNER15',discount:brief.discount||'−15%',
    eyebrow:v.eyebrow, h1:v.h1, sub:v.sub, cta:v.cta,
    toolsTitle:v.toolsTitle, toolsDesc:v.toolsDesc,
    tools:n.tools, stats:v.stats, steps:n.steps, faq:v.faq,
    finalTitle:v.finalTitle};
}

function renderLanding(c, standalone){
  const b=BRANDS[c.brand]||BRANDS.studyai, v=b.vars, ref=esc(c.ref);
  const nlabel=(NICHES[c.niche]||{label:c.niche}).label;
  const css=`:root{--acc:${v.acc};--acc2:${v.acc2};--ink:${v.ink};--bg:${v.bg};--soft:${v.soft};--line:${v.line};--mut:${v.mut};--radius:${v.radius}}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:${v.body};color:var(--ink);background:var(--bg);line-height:1.5;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:${v.display};line-height:1.1;letter-spacing:-.02em}a{text-decoration:none;color:inherit}
.wrap{max-width:1100px;margin:0 auto;padding:0 22px}
.btn{display:inline-flex;align-items:center;gap:8px;background:var(--acc);color:#fff;font-weight:600;padding:14px 24px;border-radius:calc(var(--radius) - 4px);font-size:15px;transition:.2s;border:none;cursor:pointer}
.btn:hover{filter:brightness(1.08);transform:translateY(-1px)}.btn.ghost{background:transparent;color:var(--ink);border:1px solid var(--line)}
header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.86);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;gap:20px;height:64px}.logo{font-family:${v.display};font-weight:800;font-size:19px;color:var(--acc)}
nav{display:flex;gap:22px;margin-left:20px}nav a{font-size:14px;color:var(--mut)}nav a:hover{color:var(--ink)}
header .btn{margin-left:auto;padding:10px 18px;font-size:14px}@media(max-width:720px){nav{display:none}}
.hero{background:${v.heroBg};color:${v.heroInk};padding:70px 0 60px}
.eyebrow{display:inline-block;font-size:13px;font-weight:600;color:var(--acc);background:#fff;padding:6px 14px;border-radius:20px;border:1px solid var(--line);margin-bottom:22px}
.hero h1{font-size:clamp(34px,5.5vw,60px);max-width:15ch;margin-bottom:20px}.hero p{font-size:18px;max-width:54ch;opacity:.88;margin-bottom:30px}
.hero .row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.promo{margin-top:34px;display:inline-flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:14px 18px;color:var(--ink)}
.promo .big{font-family:${v.display};font-weight:800;font-size:22px;color:var(--acc)}.promo code{background:var(--soft);color:var(--ink);font-weight:700;padding:4px 10px;border-radius:8px;font-family:monospace}
.stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.stats .s{padding:28px 22px;border-right:1px solid var(--line)}.stats .s:last-child{border-right:none}
.stats .v{font-family:${v.display};font-weight:800;font-size:28px;color:var(--acc)}.stats .l{font-size:13px;color:var(--mut);margin-top:4px}
@media(max-width:720px){.stats{grid-template-columns:repeat(2,1fr)}.stats .s:nth-child(2){border-right:none}}
section{padding:72px 0}.lead{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--acc);margin-bottom:12px}
.h2{font-size:clamp(26px,4vw,40px);max-width:20ch;margin-bottom:14px}.desc{font-size:17px;color:var(--mut);max-width:58ch}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:40px}
.card{background:var(--soft);border:1px solid var(--line);border-radius:var(--radius);padding:28px;transition:.2s}
.card:hover{transform:translateY(-3px);box-shadow:0 12px 30px rgba(0,0,0,.06)}.card .num{font-family:monospace;font-size:13px;color:var(--acc);font-weight:700}
.card h3{font-size:21px;margin:10px 0 8px}.card p{color:var(--mut);font-size:15px}@media(max-width:720px){.grid{grid-template-columns:1fr}}
.steps{background:var(--soft)}.stepgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:44px}
.st{padding-top:16px}.st .n{font-family:${v.display};font-weight:800;font-size:15px;color:#fff;background:var(--acc);width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.st h3{font-size:20px;margin-bottom:8px}.st p{color:var(--mut);font-size:15px}@media(max-width:720px){.stepgrid{grid-template-columns:1fr}}
.faq{max-width:760px;margin:40px auto 0}details.q{border-bottom:1px solid var(--line);padding:20px 0}
details.q summary{list-style:none;cursor:pointer;font-weight:600;font-size:17px;display:flex;justify-content:space-between}
details.q summary::-webkit-details-marker{display:none}details.q summary::after{content:'+';color:var(--acc);font-size:22px}details.q[open] summary::after{content:'−'}
details.q p{color:var(--mut);margin-top:12px;font-size:15px}
.final{background:${v.heroBg};color:${v.heroInk};text-align:center}.final .h2{margin:0 auto 16px;color:inherit}.final .desc{margin:0 auto 26px;color:inherit;opacity:.85}
footer{border-top:1px solid var(--line);padding:40px 0;color:var(--mut);font-size:14px}footer .wrap{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px}`;
  const tools=(c.tools||[]).map((t,i)=>`<div class="card"><span class="num">0${i+1}</span><h3>${esc(t.t)}</h3><p>${esc(t.d)}</p></div>`).join('');
  const stats=(c.stats||[]).map(s=>`<div class="s"><div class="v">${esc(s.v)}</div><div class="l">${esc(s.l)}</div></div>`).join('');
  const steps=(c.steps||[]).map((s,i)=>`<div class="st"><div class="n">${i+1}</div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>`).join('');
  const faq=(c.faq||[]).map(f=>`<details class="q"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const body=`<header><div class="wrap"><span class="logo">${esc(b.logo)}</span>
<nav><a href="#tools">Возможности</a><a href="#how">Как начать</a><a href="#faq">Вопросы</a></nav>
<a class="btn" href="${ref}" target="_blank" rel="noopener">Попробовать</a></div></header>
<div class="hero"><div class="wrap"><span class="eyebrow">${esc(c.eyebrow)}</span><h1>${esc(c.h1)}</h1><p>${esc(c.sub)}</p>
<div class="row"><a class="btn" href="${ref}" target="_blank" rel="noopener">${esc(c.cta)} ↗</a><a class="btn ghost" href="#tools">Смотреть возможности</a></div>
<div class="promo"><span class="big">${esc(c.discount)}</span><span>Промокод <code>${esc(c.promo)}</code> в личном кабинете</span></div></div></div>
<div class="wrap"><div class="stats">${stats}</div></div>
<section id="tools"><div class="wrap"><div class="lead">${esc(nlabel)}</div><h2 class="h2">${esc(c.toolsTitle||'')}</h2>
<p class="desc">${esc(c.toolsDesc||'')}</p><div class="grid">${tools}</div></div></section>
<section class="steps" id="how"><div class="wrap"><div class="lead">Без сложного старта</div><h2 class="h2">Три шага до результата</h2><div class="stepgrid">${steps}</div></div></section>
<section id="faq"><div class="wrap"><div class="lead" style="text-align:center">Коротко о главном</div><h2 class="h2" style="text-align:center;margin:0 auto">Вопросы перед стартом</h2><div class="faq">${faq}</div></div></section>
<section class="final"><div class="wrap"><h2 class="h2">${esc(c.finalTitle||'')}</h2>
<p class="desc">Скидка ${esc(c.discount)} по промокоду <b>${esc(c.promo)}</b>.</p><a class="btn" href="${ref}" target="_blank" rel="noopener">${esc(c.cta)} ↗</a></div></section>
<footer><div class="wrap"><span class="logo">${esc(b.logo)}</span><a href="${ref}" target="_blank" rel="noopener">${esc(b.domain)} ↗</a></div></footer>`;
  const fonts=`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap`;
  if(standalone)return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.name)} — ${esc(c.h1)}</title><link href="${fonts}" rel="stylesheet"><style>${css}</style></head><body>${body}</body></html>`;
  return `<style>@import url('${fonts}');${css}</style>${body}`;
}

module.exports = { BRANDS, NICHES, renderLanding, configFromPreset, esc };
