// api/agent.js — отдаёт HTML-страницу агента (клиент дёргает /api/generate и /api/deploy).
module.exports = (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(PAGE);
};

const PAGE = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Landing Agent</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#0a0c11;--panel:#12151d;--panel2:#1a1f2b;--line:#252c3a;--txt:#e8ebf2;--mut:#8892a6;--acc:#6d8cff;--acc2:#a78bfa;--ok:#34d399;--font:'Inter',sans-serif}
*{box-sizing:border-box}html,body{margin:0;height:100%;background:var(--bg);color:var(--txt);font-family:var(--font)}
button{font-family:inherit;cursor:pointer}input,select{font-family:inherit}
.app{display:grid;grid-template-columns:420px 1fr;height:100vh}
.side{background:var(--panel);border-right:1px solid var(--line);overflow-y:auto;display:flex;flex-direction:column}
.stage{background:#eef0f4;overflow-y:auto}
.hd{padding:18px 20px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:12px}
.badge{width:34px;height:34px;border-radius:10px;background:linear-gradient(135deg,var(--acc),var(--acc2));display:flex;align-items:center;justify-content:center;font-size:18px}
.hd b{font-size:15px}.hd .sub{font-size:11px;color:var(--mut)}
.form{padding:20px}
label.f{display:block;font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--mut);margin:16px 0 6px}label.f:first-child{margin-top:0}
.in{width:100%;background:var(--bg);border:1px solid var(--line);color:var(--txt);border-radius:10px;padding:11px 13px;font-size:14px;outline:none}
.in:focus{border-color:var(--acc)}select.in{appearance:none}
.run{width:100%;margin-top:22px;padding:14px;border-radius:11px;border:none;background:linear-gradient(135deg,var(--acc),var(--acc2));color:#fff;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px}
.run:hover{filter:brightness(1.08)}.run:disabled{opacity:.5;cursor:default}
.console{border-top:1px solid var(--line);padding:18px 20px;flex:1}.console h4{font-size:11px;text-transform:uppercase;letter-spacing:.6px;color:var(--mut);margin:0 0 14px}
.step{display:flex;gap:12px;padding:9px 0;position:relative}
.step .ico{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--line);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--mut);background:var(--bg)}
.step.run .ico{border-color:var(--acc);color:var(--acc);animation:pulse 1s infinite}.step.done .ico{border-color:var(--ok);background:var(--ok);color:#0a0c11}
.step .t{font-size:13px;font-weight:600}.step.wait .t{color:var(--mut)}.step .d{font-size:12px;color:var(--mut);margin-top:3px;line-height:1.45;white-space:pre-wrap;word-break:break-word}
.step:not(:last-child)::before{content:'';position:absolute;left:10.5px;top:31px;bottom:-9px;width:1.5px;background:var(--line)}.step.done:not(:last-child)::before{background:var(--ok)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.result{margin-top:16px;padding:14px;border:1px solid var(--ok);border-radius:11px;background:rgba(52,211,153,.07);display:none}.result.on{display:block}
.result .u{font-family:monospace;font-size:12px;color:var(--ok);word-break:break-all;margin-bottom:12px}
.dep{display:flex;gap:8px;align-items:center}.dep .suf{font-family:monospace;font-size:12px;color:var(--mut);white-space:nowrap}
.stbar{position:sticky;top:0;z-index:20;background:rgba(16,20,28,.92);color:#fff;padding:11px 20px;font-size:12px;display:flex;gap:14px;align-items:center}
.stbar .u{background:#0a0c11;border:1px solid #252c3a;border-radius:7px;padding:6px 11px;color:#8892a6;font-family:monospace;font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.empty{height:calc(100vh - 43px);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#9aa3b5;text-align:center;padding:40px}.empty .big{font-size:52px;margin-bottom:18px;opacity:.5}
#frame{border:none;width:100%;height:calc(100vh - 43px);background:#fff;display:none}
@media(max-width:900px){.app{grid-template-columns:1fr;grid-template-rows:auto 1fr}}
</style></head><body>
<div class="app">
<aside class="side">
<div class="hd"><div class="badge">◆</div><div><b>Landing Agent</b><div class="sub">бриф → живой лендинг за минуту</div></div></div>
<div class="form">
<label class="f">Партнёр (имя / канал)</label><input class="in" id="i_partner" placeholder="Академия контента Ани П.">
<label class="f">Сайт / канал — агент изучит</label><input class="in" id="i_url" placeholder="https://t.me/... (необязательно)">
<label class="f">Оффер</label><select class="in" id="i_product">
<option value="studyai">StudyAI — нейросети (RU)</option><option value="kampus">Кэмп — презентации (RU)</option>
<option value="mystylus">MyStylus — контент (INTL)</option><option value="studybay">StudyBay — учёба (US)</option>
<option value="avtor24">Автор24 — учёба + AI (RU)</option></select>
<label class="f">Реф-ссылка</label><input class="in" id="i_ref" value="https://studyai.one/?rid=0a9815c6bf60fb1d">
<label class="f">Промокод</label><input class="in" id="i_promo" value="PARTNER15">
<button class="run" id="run">▶ Запустить агента</button>
</div>
<div class="console"><h4>Ход работы агента</h4><div id="steps"></div>
<div class="result" id="result"><div class="u" id="resUrl"></div>
<label class="f" style="margin-top:0">Поддомен</label>
<div class="dep"><input class="in" id="i_domain" style="flex:1" placeholder="partner"><span class="suf" id="suf"></span></div>
<button class="run" id="deployBtn" style="margin-top:12px;padding:12px;font-size:14px">🚀 Выкатить на домен</button>
<button class="run" id="downloadBtn" style="margin-top:8px;padding:12px;font-size:14px;background:var(--panel2);color:var(--txt);border:1px solid var(--line)">📦 Скачать лендинг (HTML)</button>
<div id="depOut" style="font-size:12px;color:var(--mut);margin-top:10px;line-height:1.5"></div></div>
</div>
</aside>
<main class="stage">
<div class="stbar"><span style="color:#fff;font-weight:600">Превью</span><span class="u" id="pv">лендинг появится здесь</span></div>
<div class="empty" id="empty"><div class="big">◆</div><div><b>Заполни бриф и запусти агента</b><br>Он изучит партнёра, выберет нишу, напишет тексты, соберёт и выкатит лендинг.</div></div>
<iframe id="frame"></iframe>
</main></div>
<script>
const $=s=>document.querySelector(s);let cfg=null,lastHtml=null;
const BASE_BY_PRODUCT={studyai:'demo.study24.ai',kampus:'demo.kampus.ai',avtor24:'demo.avtor24.ru',mystylus:'demo.mystylus.ai',studybay:'demo.studybay.com'};
const STEPS=[['perceive','Разбираю бриф'],['research','Изучаю партнёра'],['write','Пишу копирайт'],['assemble','Собираю лендинг'],['deploy','Готов к выкату']];
function draw(st){$('#steps').innerHTML=STEPS.map((s,i)=>{const c=st[s[0]]||'wait';const ic=c==='done'?'✓':(c==='run'?'●':i+1);return '<div class="step '+c+'"><div class="ico">'+ic+'</div><div><div class="t">'+s[1]+'</div><div class="d" id="d_'+s[0]+'">'+(st['d_'+s[0]]||'')+'</div></div></div>'}).join('')}
function sleep(m){return new Promise(r=>setTimeout(r,m))}
async function run(){
 const brief={partner:$('#i_partner').value.trim(),url:$('#i_url').value.trim(),product:$('#i_product').value,ref:$('#i_ref').value.trim(),promo:$('#i_promo').value.trim()};
 $('#run').disabled=true;$('#result').classList.remove('on');const st={};draw(st);
 try{
  st.perceive='done';st.d_perceive=(brief.partner||'партнёр')+' · '+brief.product;draw(st);await sleep(300);
  st.research='run';draw(st);
  const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(brief)});
  const data=await r.json();if(data.error)throw new Error(data.error);
  cfg=data.config;lastHtml=data.html;
  st.research='done';st.d_research=data.ai?'ИИ изучил аудиторию и подобрал нишу':'Ниша по пресету (ИИ-ключ не задан)';
  st.write='done';st.d_write='H1: «'+cfg.h1+'»';draw(st);await sleep(300);
  st.assemble='run';draw(st);
  const fr=$('#frame');fr.srcdoc=lastHtml;$('#empty').style.display='none';fr.style.display='block';
  st.assemble='done';draw(st);await sleep(300);
  st.deploy='done';st.d_deploy='Нажми «Выкатить», чтобы опубликовать';draw(st);
  const slug=(brief.partner||'lp').toLowerCase().replace(/[^a-zа-я0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,24)||'lp';
  $('#i_domain').value=slug;$('#suf').textContent='.'+(BASE_BY_PRODUCT[cfg.brand]||'demo.vercel.app');$('#pv').textContent='превью · '+cfg.brand;
  $('#resUrl').textContent='Лендинг собран. Готов к публикации.';$('#result').classList.add('on');
 }catch(e){const cur=STEPS.find(s=>st[s[0]]==='run');if(cur){st[cur[0]]='wait';st['d_'+cur[0]]='Ошибка: '+e.message}draw(st)}
 $('#run').disabled=false;
}
async function deploy(){
 if(!lastHtml)return;const sub=$('#i_domain').value.trim()||'lp';const out=$('#depOut');const b=$('#deployBtn');
 b.disabled=true;out.textContent='Деплою на Vercel…';
 try{
  const r=await fetch('/api/deploy',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subdomain:sub,html:lastHtml,partner:$('#i_partner').value,niche:cfg.niche})});
  const d=await r.json();if(d.error)throw new Error(d.error);
  const live='https://'+d.url;out.innerHTML='✅ <a href="'+live+'" target="_blank" style="color:var(--ok)">'+live+'</a>';
  $('#resUrl').textContent=live;$('#pv').textContent=live;
 }catch(e){out.innerHTML='⚠️ '+e.message+'<br>Если VERCEL_TOKEN не задан — добавь его в env проекта.'}
 b.disabled=false;
}
function downloadHtml(){
 if(!lastHtml){return;}
 const slug=(cfg&&cfg.brand)||'landing';
 const blob=new Blob([lastHtml],{type:'text/html'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=url;a.download='lending-'+slug+'.html';
 document.body.appendChild(a);a.click();document.body.removeChild(a);
 URL.revokeObjectURL(url);
}
$('#run').onclick=run;$('#deployBtn').onclick=deploy;$('#downloadBtn').onclick=downloadHtml;
$('#i_product').onchange=()=>{const m={studyai:'https://studyai.one/?rid=0a9815c6bf60fb1d',kampus:'https://kampus.ai/?rid=xxx',mystylus:'https://mystylus.ai/?rid=xxx',studybay:'https://studybay.com/?rid=xxx',avtor24:'https://avtor24.ru/?ref=xxx'};$('#i_ref').value=m[$('#i_product').value]||''};
draw({});
</script></body></html>`;
