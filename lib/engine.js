// lib/engine.js — общий движок: бренд-бук (голос+цвет+язык), рендер лендинга.
// Каждый бренд владеет СВОИМ набором карточек возможностей — никаких общих "изображений/видео" не по делу.

const UI = {
  ru: {
    navTools:'Возможности', navHow:'Как начать', navFaq:'Вопросы',
    tryBtn:'Попробовать', secondaryBtn:'Смотреть возможности',
    discountPrefix:'Скидка', discountMid:'по промокоду',
    leadWhat:'Что внутри', leadHow:'Без сложного старта', howTitle:'Три шага до результата',
    leadFaq:'Коротко о главном', faqTitle:'Вопросы перед стартом'
  },
  en: {
    navTools:'Capabilities', navHow:'How it works', navFaq:'FAQ',
    tryBtn:'Try it', secondaryBtn:'See capabilities',
    discountPrefix:'Discount', discountMid:'with code',
    leadWhat:'What\'s inside', leadHow:'No complicated setup', howTitle:'Three simple steps',
    leadFaq:'Quick answers', faqTitle:'Before you start'
  }
};

const BRANDS = {
  studyai:{
    name:'StudyAI', domain:'study24.ai', logo:'StudyAI', lang:'ru',
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
      tools:[{t:'Тексты',d:'Посты, письма, статьи и описания под любую задачу.'},
             {t:'Изображения',d:'Генерация и редактирование фото в один запрос.'},
             {t:'Видео',d:'Короткие ролики и оживление фото.'},
             {t:'Презентации',d:'Готовые слайды по вашей теме за минуты.'}],
      steps:[{t:'Выберите модель',d:'Под текст, фото, видео или презентацию.'},
             {t:'Опишите задачу',d:'Своими словами — без сложных промптов.'},
             {t:'Заберите результат',d:'Сравните варианты и используйте сразу.'}],
      stats:[{v:'90+',l:'нейросетей'},{v:'₽',l:'оплата из России'},{v:'RU',l:'без VPN'},{v:'1',l:'подписка вместо 10'}],
      faq:[{q:'Нужен ли VPN?',a:'Нет, StudyAI работает из России без VPN и зарубежной карты.'},
           {q:'Какие модели доступны?',a:'ChatGPT, Claude, Gemini и ещё 90+ моделей для текста, фото, видео и музыки.'},
           {q:'Можно попробовать бесплатно?',a:'Да, доступны бесплатные генерации перед подпиской.'}]
    }
  },
  kampus:{
    name:'Кэмп', domain:'kampslides.ru', logo:'Кэмп', lang:'ru',
    // Синий + белый — основная палитра. Лайм и чёрный — только маленькие акценты, не на больших плоскостях.
    vars:{acc:'#2F6FEB',acc2:'#0B47C4',ink:'#151A22',bg:'#fff',soft:'#EEF3FF',line:'#dbe6fb',mut:'#5a6478',
      heroBg:'linear-gradient(135deg,#2F6FEB,#1B4FCB)',heroInk:'#ffffff',accentMini:'#DFFF00',
      display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'16px'},
    voice:{
      eyebrow:'AI-помощник для прогрессивной учёбы',
      h1:'Учись быстрее. Разбирайся глубже.',
      sub:'Твой AI для учёбы — от задачи до готового результата: работы, презентации, разбор тем и подготовка к экзаменам.',
      cta:'Начать учиться',
      toolsTitle:'От задачи до готового результата',
      toolsDesc:'Выбираешь задачу — проходишь шаги — получаешь результат. Ты управляешь процессом.',
      finalTitle:'Работы, задачи, презентации — разберёмся вместе.',
      tools:[{t:'Учебные работы',d:'Рефераты, эссе и курсовые — от структуры до готового текста.'},
             {t:'Презентации',d:'Слайды к защите с нужными акцентами.'},
             {t:'AI-репетитор',d:'Разбор темы простыми словами, а не просто готовый ответ.'},
             {t:'Подготовка к экзамену',d:'Ключевые вопросы и объяснение сложных мест.'}],
      steps:[{t:'Выберите задачу',d:'Работа, презентация или разбор темы.'},
             {t:'Пройдите шаги',d:'AI ведёт вас от начала до результата.'},
             {t:'Заберите результат',d:'Проверьте и используйте.'}],
      stats:[{v:'24/7',l:'AI-репетитор'},{v:'PPTX',l:'презентации'},{v:'RU',l:'на русском'},{v:'1',l:'экосистема учёбы'}],
      faq:[{q:'Это просто доступ к нейросетям?',a:'Нет, Кэмп ведёт по шагам конкретную учебную задачу, а не просто даёт доступ к моделям.'},
           {q:'Можно сделать презентацию?',a:'Да, готовые PPTX-презентации — одна из ключевых задач.'},
           {q:'Поможет разобраться в теме?',a:'Да, AI-репетитор объясняет тему, а не только выдаёт готовый ответ.'}]
    }
  },
  avtor24:{
    name:'Автор24', domain:'avtor24.ru', logo:'Автор24', lang:'ru',
    // Фиолетовый + жёлтый (яркий акцент на кнопках/промо).
    vars:{acc:'#5B2A86',acc2:'#FFC928',ink:'#171123',bg:'#fff',soft:'#F5F0FA',line:'#e6dcf2',mut:'#5c5468',
      heroBg:'linear-gradient(135deg,#5B2A86,#3E1D63)',heroInk:'#ffffff',
      display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'12px'},
    voice:{
      eyebrow:'Проверенные эксперты. Реальный результат',
      h1:'Найдите эксперта для вашей учебной задачи.',
      sub:'8 000+ проверенных экспертов по 100+ предметам плюс AI-инструменты для текста и презентаций. Опишите задачу и получите результат.',
      cta:'Найти эксперта',
      toolsTitle:'Эксперты и AI-инструменты в одном месте',
      toolsDesc:'Живой специалист под сложную задачу — и быстрые AI-инструменты для текста и презентаций под рутину.',
      finalTitle:'Сложная работа? Разберитесь с ней вместе с экспертом.',
      // Автор24: AI-инструменты только текстовые + презентации — без изображений/видео.
      tools:[{t:'Курсовая и эссе',d:'Структура, введение и выводы по вашей теме.'},
             {t:'Презентация к защите',d:'Слайды с акцентами под выступление.'},
             {t:'Проверка и уникальность',d:'Вычитка и повышение оригинальности текста.'},
             {t:'Живой эксперт',d:'Для сложных задач — специалист с рейтингом и отзывами.'}],
      steps:[{t:'Опишите задачу',d:'Текст, презентация или сложная работа.'},
             {t:'Выберите способ',d:'AI-инструмент для рутины или эксперт для сложного.'},
             {t:'Получите результат',d:'Проверьте и сдайте.'}],
      stats:[{v:'8000+',l:'экспертов'},{v:'13 лет',l:'на рынке'},{v:'100+',l:'предметов'},{v:'★',l:'рейтинги и отзывы'}],
      faq:[{q:'Кто выполняет работу?',a:'Для сложных задач — живой проверенный эксперт по вашему предмету.'},
           {q:'Что умеют AI-инструменты?',a:'Быстро помогают с текстом и презентациями — для рутинных задач.'},
           {q:'Что если нужны правки?',a:'Эксперт дорабатывает результат, есть гарантия на заказ.'}]
    }
  },
  mystylus:{
    name:'MyStylus', domain:'mystylus.ai', logo:'MyStylus', lang:'en',
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
      tools:[{t:'Source research',d:'Find credible academic sources for your topic.'},
             {t:'Citations',d:'APA, MLA, Chicago and other formats, done right.'},
             {t:'Outlining',d:'Structure your paper before you start writing.'},
             {t:'AI editing',d:'Paraphrasing, feedback and polish for your draft.'}],
      steps:[{t:'Start your topic',d:'Describe your paper or research question.'},
             {t:'Build the draft',d:'Sources, outline and citations in one flow.'},
             {t:'Edit and submit',d:'Polish the draft and hand it in with confidence.'}],
      stats:[{v:'APA',l:'MLA, Chicago'},{v:'1',l:'workspace'},{v:'24/7',l:'AI editing'},{v:'∞',l:'revisions'}],
      faq:[{q:'Does it find real academic sources?',a:'Yes, MyStylus surfaces credible sources and helps analyze references.'},
           {q:'Which citation styles are supported?',a:'APA, MLA, Chicago and other common academic formats.'},
           {q:'Is this a human writer marketplace?',a:'No, MyStylus is an AI research and writing workspace, not a marketplace.'}]
    }
  },
  studybay:{
    name:'StudyBay', domain:'studybay.com', logo:'StudyBay', lang:'en',
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
      // StudyBay: только текстовые студенческие работы, без картинок/видео.
      tools:[{t:'Essay writing',d:'Well-structured essays on any topic.'},
             {t:'Coursework help',d:'Full support for term papers and assignments.'},
             {t:'Research papers',d:'In-depth research backed by real sources.'},
             {t:'Proofreading & editing',d:'Polish and unique-check before you submit.'}],
      steps:[{t:'Post your project',d:'Describe requirements and deadline.'},
             {t:'Compare experts',d:'Review offers, ratings and reviews.'},
             {t:'Get it done',d:'Receive your work on time, with revisions if needed.'}],
      stats:[{v:'5000+',l:'experts'},{v:'★',l:'ratings & reviews'},{v:'24/7',l:'support'},{v:'100%',l:'your choice'}],
      faq:[{q:'Who completes the work?',a:'A real vetted expert you choose yourself, not an AI generator.'},
           {q:'Can I compare experts?',a:'Yes, you review offers, ratings and reviews before choosing.'},
           {q:'What about revisions?',a:'Experts support revisions to meet your requirements.'}]
    }
  }
};

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

// Бриф → конфиг лендинга. Голос, тексты и карточки возможностей полностью принадлежат бренду.
function configFromPreset(brief){
  const brand=BRANDS[brief.product]?brief.product:'studyai';
  const b=BRANDS[brand], v=b.voice;
  return {brand, ref:brief.ref||'', promo:brief.promo||'PARTNER15', discount:brief.discount||'−15%',
    eyebrow:v.eyebrow, h1:v.h1, sub:v.sub, cta:v.cta,
    toolsTitle:v.toolsTitle, toolsDesc:v.toolsDesc,
    tools:v.tools, stats:v.stats, steps:v.steps, faq:v.faq,
    finalTitle:v.finalTitle};
}

function renderLanding(c, standalone){
  const b=BRANDS[c.brand]||BRANDS.studyai, v=b.vars, ref=esc(c.ref);
  const t=UI[b.lang]||UI.ru;
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
.hero h1{font-size:clamp(34px,5.5vw,60px);max-width:15ch;margin-bottom:20px}.hero p{font-size:18px;max-width:54ch;opacity:.9;margin-bottom:30px}
.hero .row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.promo{margin-top:34px;display:inline-flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:14px 18px;color:var(--ink)}
.promo .big{font-family:${v.display};font-weight:800;font-size:22px;color:var(--acc2)}.promo code{background:var(--soft);color:var(--ink);font-weight:700;padding:4px 10px;border-radius:8px;font-family:monospace}
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
  const tools=(c.tools||[]).map((x,i)=>`<div class="card"><span class="num">0${i+1}</span><h3>${esc(x.t)}</h3><p>${esc(x.d)}</p></div>`).join('');
  const stats=(c.stats||[]).map(s=>`<div class="s"><div class="v">${esc(s.v)}</div><div class="l">${esc(s.l)}</div></div>`).join('');
  const steps=(c.steps||[]).map((s,i)=>`<div class="st"><div class="n">${i+1}</div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p></div>`).join('');
  const faq=(c.faq||[]).map(f=>`<details class="q"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  const body=`<header><div class="wrap"><span class="logo">${esc(b.logo)}</span>
<nav><a href="#tools">${esc(t.navTools)}</a><a href="#how">${esc(t.navHow)}</a><a href="#faq">${esc(t.navFaq)}</a></nav>
<a class="btn" href="${ref}" target="_blank" rel="noopener">${esc(t.tryBtn)}</a></div></header>
<div class="hero"><div class="wrap"><span class="eyebrow">${esc(c.eyebrow)}</span><h1>${esc(c.h1)}</h1><p>${esc(c.sub)}</p>
<div class="row"><a class="btn" href="${ref}" target="_blank" rel="noopener">${esc(c.cta)} ↗</a><a class="btn ghost" href="#tools">${esc(t.secondaryBtn)}</a></div>
<div class="promo"><span class="big">${esc(c.discount)}</span><span>${esc(t.discountPrefix)} <code>${esc(c.promo)}</code> ${esc(t.discountMid)}</span></div></div></div>
<div class="wrap"><div class="stats">${stats}</div></div>
<section id="tools"><div class="wrap"><div class="lead">${esc(t.leadWhat)}</div><h2 class="h2">${esc(c.toolsTitle||'')}</h2>
<p class="desc">${esc(c.toolsDesc||'')}</p><div class="grid">${tools}</div></div></section>
<section class="steps" id="how"><div class="wrap"><div class="lead">${esc(t.leadHow)}</div><h2 class="h2">${esc(t.howTitle)}</h2><div class="stepgrid">${steps}</div></div></section>
<section id="faq"><div class="wrap"><div class="lead" style="text-align:center">${esc(t.leadFaq)}</div><h2 class="h2" style="text-align:center;margin:0 auto">${esc(t.faqTitle)}</h2><div class="faq">${faq}</div></div></section>
<section class="final"><div class="wrap"><h2 class="h2">${esc(c.finalTitle||'')}</h2>
<p class="desc">${esc(t.discountPrefix)} ${esc(c.discount)} ${esc(t.discountMid)} <b>${esc(c.promo)}</b>.</p><a class="btn" href="${ref}" target="_blank" rel="noopener">${esc(c.cta)} ↗</a></div></section>
<footer><div class="wrap"><span class="logo">${esc(b.logo)}</span><a href="${ref}" target="_blank" rel="noopener">${esc(b.domain)} ↗</a></div></footer>`;
  const fonts=`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap`;
  if(standalone)return `<!DOCTYPE html><html lang="${b.lang}"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.name)} — ${esc(c.h1)}</title><link href="${fonts}" rel="stylesheet"><style>${css}</style></head><body>${body}</body></html>`;
  return `<style>@import url('${fonts}');${css}</style>${body}`;
}

module.exports = { BRANDS, renderLanding, configFromPreset, esc };
