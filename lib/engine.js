// lib/engine.js — общий движок: темы брендов, ниши, пресеты копирайта, рендер лендинга.

const BRANDS = {
  studyai:{name:'StudyAI',domain:'study24.ai',logo:'StudyAI',vars:{acc:'#7B61FF',acc2:'#B49BFF',ink:'#12101f',bg:'#fff',soft:'#f3f0ff',line:'#e7e2f7',mut:'#6b6580',heroBg:'linear-gradient(135deg,#efe9ff,#f7f4ff)',heroInk:'#1a1430',display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'18px'}},
  kampus:{name:'Кэмп',domain:'kampslides.ru',logo:'Кэмп',vars:{acc:'#4F46E5',acc2:'#8B85F0',ink:'#0f1222',bg:'#fff',soft:'#eef0fb',line:'#e3e5f5',mut:'#5a607a',heroBg:'linear-gradient(135deg,#e9ebff,#f4f5ff)',heroInk:'#141633',display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'14px'}},
  mystylus:{name:'MyStylus',domain:'mystylus.ai',logo:'MyStylus',vars:{acc:'#EC4899',acc2:'#F9A8D4',ink:'#1b0f18',bg:'#fff',soft:'#fdeef6',line:'#f6dced',mut:'#7a5a6c',heroBg:'linear-gradient(135deg,#ffe9f4,#fff4fa)',heroInk:'#2a0f22',display:"'Fraunces',serif",body:"'Inter',sans-serif",radius:'22px'}},
  studybay:{name:'StudyBay',domain:'studybay.com',logo:'StudyBay',vars:{acc:'#059669',acc2:'#6EE7B7',ink:'#0c1a14',bg:'#fff',soft:'#e9f8f1',line:'#d6efe4',mut:'#4d6a5c',heroBg:'linear-gradient(135deg,#e2f7ee,#f1fbf7)',heroInk:'#0c2a1e',display:"'Manrope',sans-serif",body:"'Inter',sans-serif",radius:'12px'}}
};

// Ниши + дефолтный копирайт (fallback, если нет Claude-ключа)
const NICHES = {
  sellers:{label:'Селлеры МП', h1:'Карточки, которые хочется открыть.', sub:'Фото, видео, инфографика и продающие тексты для маркетплейсов — в одном сервисе с нейросетями.',
    tools:[{t:'Карточка товара',d:'Обложка, слайд преимуществ и лайфстайл-визуал из одного фото.'},{t:'Фото и инфографика',d:'Серия изображений под требования площадки.'},{t:'Видео обзор',d:'Короткий рекламный ролик или оживлённое фото товара.'},{t:'Тексты и SEO',d:'Название, описание и ответы на отзывы.'}]},
  authors:{label:'Статейщики', h1:'Статья — от идеи до публикации.', sub:'Структура, рерайт, SEO и проверка фактов. Пишите быстрее, не теряя смысл.',
    tools:[{t:'Черновик за минуты',d:'Структура и тезисы под вашу тему.'},{t:'Рерайт и уникальность',d:'Переписать источник своими словами.'},{t:'SEO-оптимизация',d:'Заголовки, метатеги и ключи под трафик.'},{t:'Проверка фактов',d:'Быстрый ресёрч и аргументы со ссылками.'}]},
  creators:{label:'Криэйторы', h1:'Контент, который цепляет с первого кадра.', sub:'Сценарии, визуалы, озвучка и контент-план — весь контент для соцсетей в одном месте.',
    tools:[{t:'Сценарий Reels',d:'Хук, структура и текст под короткое видео.'},{t:'Визуалы для постов',d:'Обложки, карусели и иллюстрации в клик.'},{t:'Озвучка и субтитры',d:'Голос под ролик и авто-субтитры.'},{t:'Контент-план',d:'Идеи и рубрики на неделю под нишу.'}]},
  business:{label:'Презентации', h1:'Презентация, которая продаёт вашу идею.', sub:'Опишите задачу — ИИ выстроит логику, структуру и оформит слайды под деловую аудиторию.',
    tools:[{t:'Питч для инвестора',d:'Логика от рынка до юнит-экономики и ROI.'},{t:'Коммерческое предложение',d:'Убедительно, без воды, с нужными акцентами.'},{t:'Защита проекта',d:'Структура аргументов под руководство.'},{t:'Анализ рынка',d:'Конкурентный ландшафт и стратегия за минуты.'}]},
  students:{label:'Студенты', h1:'Учёба без бессонных ночей.', sub:'Рефераты, курсовые, презентации и проверка — всё под методичку и защиту.',
    tools:[{t:'Реферат и эссе',d:'Структура, введение и выводы по теме.'},{t:'Курсовая',d:'План, главы и оформление по методичке.'},{t:'Презентация к защите',d:'Слайды с акцентами под выступление.'},{t:'Проверка и антиплагиат',d:'Уникальность и вычитка перед сдачей.'}]},
  general:{label:'Универсальный', h1:'Нейросети для вашей задачи.', sub:'Тексты, изображения, видео и аналитика — в одном сервисе, без сложного старта.',
    tools:[{t:'Тексты',d:'Посты, письма, описания под задачу.'},{t:'Изображения',d:'Визуалы и иллюстрации в один запрос.'},{t:'Видео',d:'Короткие ролики и оживление фото.'},{t:'Аналитика',d:'Разбор данных и быстрые выводы.'}]}
};

const DEFAULT_STATS=[{v:'90+',l:'нейросетей'},{v:'₽',l:'оплата из России'},{v:'RU',l:'без VPN'},{v:'5 мин',l:'до результата'}];
const DEFAULT_STEPS=[{t:'Выберите задачу',d:'Начните с нужного результата.'},{t:'Опишите запрос',d:'Своими словами или загрузите материалы.'},{t:'Проверьте и используйте',d:'Сравните варианты и заберите результат.'}];
const DEFAULT_FAQ=[{q:'Нужен ли VPN?',a:'Нет, сервис доступен из России без VPN и зарубежной карты.'},{q:'Нужно ли уметь писать промпты?',a:'Нет, начните с обычного описания задачи.'},{q:'Есть ли бесплатный доступ?',a:'Да, можно попробовать перед оплатой подписки.'}];

function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

// Собрать конфиг из брифа по пресетам (fallback без ИИ)
function configFromPreset(brief){
  const brand=BRANDS[brief.product]?brief.product:'studyai';
  const niche=NICHES[brief.niche]?brief.niche:'general';
  const n=NICHES[niche];
  return {brand,niche,ref:brief.ref||'',promo:brief.promo||'PARTNER15',discount:brief.discount||'−15%',
    eyebrow:brief.partner?('для аудитории «'+brief.partner+'»'):'нейросети в одном сервисе',
    h1:n.h1,sub:n.sub,cta:'Попробовать бесплатно',
    toolsTitle:'Ваш AI-отдел под задачу',toolsDesc:'Под каждую задачу — свой инструмент. Один аккаунт вместо десятка подписок.',
    tools:n.tools,stats:DEFAULT_STATS,steps:DEFAULT_STEPS,faq:DEFAULT_FAQ,
    finalTitle:'Соберите первый результат сегодня.'};
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
header{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.82);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
header .wrap{display:flex;align-items:center;gap:20px;height:64px}.logo{font-family:${v.display};font-weight:800;font-size:19px;color:var(--acc)}
nav{display:flex;gap:22px;margin-left:20px}nav a{font-size:14px;color:var(--mut)}nav a:hover{color:var(--ink)}
header .btn{margin-left:auto;padding:10px 18px;font-size:14px}@media(max-width:720px){nav{display:none}}
.hero{background:${v.heroBg};color:${v.heroInk};padding:70px 0 60px}
.eyebrow{display:inline-block;font-size:13px;font-weight:600;color:var(--acc);background:#fff;padding:6px 14px;border-radius:20px;border:1px solid var(--line);margin-bottom:22px}
.hero h1{font-size:clamp(34px,5.5vw,60px);max-width:14ch;margin-bottom:20px}.hero p{font-size:18px;max-width:52ch;color:var(--mut);margin-bottom:30px}
.hero .row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.promo{margin-top:34px;display:inline-flex;align-items:center;gap:14px;background:#fff;border:1px solid var(--line);border-radius:var(--radius);padding:14px 18px}
.promo .big{font-family:${v.display};font-weight:800;font-size:22px;color:var(--acc)}.promo code{background:var(--soft);color:var(--acc);font-weight:700;padding:4px 10px;border-radius:8px;font-family:monospace}
.stats{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.stats .s{padding:28px 22px;border-right:1px solid var(--line)}.stats .s:last-child{border-right:none}
.stats .v{font-family:${v.display};font-weight:800;font-size:30px;color:var(--acc)}.stats .l{font-size:14px;color:var(--mut);margin-top:4px}
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
.final{background:${v.heroBg};text-align:center}.final .h2{margin:0 auto 16px}.final .desc{margin:0 auto 26px}
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
<section id="tools"><div class="wrap"><div class="lead">${esc(nlabel)}</div><h2 class="h2">${esc(c.toolsTitle||'Ваш AI-отдел под задачу')}</h2>
<p class="desc">${esc(c.toolsDesc||'Под каждую задачу — свой инструмент.')}</p><div class="grid">${tools}</div></div></section>
<section class="steps" id="how"><div class="wrap"><div class="lead">Без сложного старта</div><h2 class="h2">Три шага до результата</h2><div class="stepgrid">${steps}</div></div></section>
<section id="faq"><div class="wrap"><div class="lead" style="text-align:center">Коротко о главном</div><h2 class="h2" style="text-align:center;margin:0 auto">Вопросы перед стартом</h2><div class="faq">${faq}</div></div></section>
<section class="final"><div class="wrap"><h2 class="h2">${esc(c.finalTitle||'Соберите первый результат сегодня.')}</h2>
<p class="desc">Скидка ${esc(c.discount)} по промокоду <b>${esc(c.promo)}</b>.</p><a class="btn" href="${ref}" target="_blank" rel="noopener">${esc(c.cta)} ↗</a></div></section>
<footer><div class="wrap"><span class="logo">${esc(b.logo)}</span><a href="${ref}" target="_blank" rel="noopener">${esc(b.domain)} ↗</a></div></footer>`;
  const fonts=`https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@700;800&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap`;
  if(standalone)return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(b.name)} — ${esc(c.h1)}</title><link href="${fonts}" rel="stylesheet"><style>${css}</style></head><body>${body}</body></html>`;
  return `<style>@import url('${fonts}');${css}</style>${body}`;
}

module.exports = { BRANDS, NICHES, renderLanding, configFromPreset, esc };
