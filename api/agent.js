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
<label class="f">Логотип (необязательно)</label><input type="file" id="i_logo" accept="image/*" class="in" style="padding:8px 13px"><div id="logoStatus" style="font-size:11px;color:var(--mut);margin-top:4px"></div>
<label class="f">Сайт / канал — агент изучит (цвета и стиль)</label><input class="in" id="i_url" placeholder="https://t.me/... (необязательно)">
<label class="f">Реф. структуры (необязательно, если отличается от первого)</label><input class="in" id="i_url2" placeholder="можно взять композицию с другого сайта">
<label class="f">Оффер</label><select class="in" id="i_product">
<option value="studyai">StudyAI — нейросети (RU)</option><option value="kampus">Кэмп — презентации (RU)</option>
<option value="mystylus">MyStylus — контент (INTL)</option><option value="studybay">StudyBay — учёба (US)</option>
<option value="avtor24">Автор24 — учёба + AI (RU)</option></select>
<label class="f">Реф-ссылка</label><input class="in" id="i_ref" value="https://studyai.one/?rid=0a9815c6bf60fb1d">
<label class="f">Промокод</label><input class="in" id="i_promo" value="PARTNER15">
<label class="f">Пожелания (необязательно)</label><textarea class="in" id="i_wishes" rows="2" style="resize:vertical" placeholder="Например: сделай акцент на скорости, упомяни студентов техвузов"></textarea>
<label class="f">Что НЕ писать (необязательно)</label><textarea class="in" id="i_exclusions" rows="2" style="resize:vertical" placeholder="Например: не упоминать конкурентов, не писать про цену"></textarea>
<button class="run" id="run">▶ Запустить агента</button>
<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line)">
<label class="f" style="margin-top:0">Или загрузи готовый HTML</label>
<input type="file" id="i_upload" accept=".html,text/html" class="in" style="padding:8px 13px">
</div>
</div>
<div class="console"><h4>Ход работы агента</h4><div id="steps"></div>
<div class="result" id="result"><div class="u" id="resUrl"></div>
<label class="f" style="margin-top:0">Поддомен</label>
<div class="dep"><input class="in" id="i_domain" style="flex:1" placeholder="partner"><span class="suf" id="suf"></span></div>
<button class="run" id="deployBtn" style="margin-top:12px;padding:12px;font-size:14px">🚀 Выкатить на домен</button>
<button class="run" id="downloadBtn" style="margin-top:8px;padding:12px;font-size:14px;background:var(--panel2);color:var(--txt);border:1px solid var(--line)">📦 Скачать лендинг (HTML)</button>
<button class="run" id="zipBtn" style="margin-top:8px;padding:12px;font-size:14px;background:var(--panel2);color:var(--txt);border:1px solid var(--line)">🗂 Скачать .zip (файлы отдельно)</button>
<div id="depOut" style="font-size:12px;color:var(--mut);margin-top:10px;line-height:1.5"></div>
<div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line)">
<label class="f" style="margin-top:0">Внести правку словами</label>
<textarea class="in" id="i_edit" rows="2" style="resize:vertical" placeholder="Например: сделай кнопку зелёной, убери блок FAQ, подвинь картинку влево"></textarea>
<button class="run" id="editBtn" style="margin-top:8px;padding:11px;font-size:13px">✏️ Применить правку</button>
<button class="run" id="undoBtn" disabled style="margin-top:8px;padding:9px;font-size:12px;background:var(--panel2);color:var(--txt);border:1px solid var(--line)">↩ Отменить правку</button>
<div id="editOut" style="font-size:12px;color:var(--mut);margin-top:8px;line-height:1.5"></div>
</div></div>
</div>
<div class="console" style="flex:0"><h4>📚 Библиотека лендингов</h4><div id="libList"></div></div>
</aside>
<main class="stage">
<div class="stbar"><span style="color:#fff;font-weight:600">Превью</span><span class="u" id="pv">лендинг появится здесь</span></div>
<div class="empty" id="empty"><div class="big">◆</div><div><b>Заполни бриф и запусти агента</b><br>Он изучит партнёра, выберет нишу, напишет тексты, соберёт и выкатит лендинг.</div></div>
<iframe id="frame"></iframe>
</main></div>
<script>
const $=s=>document.querySelector(s);let cfg=null,lastHtml=null,logoDataUrl=null,editHistory=[];
const BASE_BY_PRODUCT={studyai:'demo.study24.ai',kampus:'demo.kampus.ai',avtor24:'demo.avtor24.ru',mystylus:'demo.mystylus.ai',studybay:'demo.studybay.com'};
const STEPS=[['perceive','Разбираю бриф'],['research','Изучаю партнёра'],['write','Пишу копирайт'],['assemble','Собираю лендинг'],['deploy','Готов к выкату']];
function draw(st){$('#steps').innerHTML=STEPS.map((s,i)=>{const c=st[s[0]]||'wait';const ic=c==='done'?'✓':(c==='run'?'●':i+1);return '<div class="step '+c+'"><div class="ico">'+ic+'</div><div><div class="t">'+s[1]+'</div><div class="d" id="d_'+s[0]+'">'+(st['d_'+s[0]]||'')+'</div></div></div>'}).join('')}
function sleep(m){return new Promise(r=>setTimeout(r,m))}
async function run(){
 const brief={partner:$('#i_partner').value.trim(),url:$('#i_url').value.trim(),url2:$('#i_url2').value.trim(),product:$('#i_product').value,ref:$('#i_ref').value.trim(),promo:$('#i_promo').value.trim(),wishes:$('#i_wishes').value.trim(),exclusions:$('#i_exclusions').value.trim(),logoDataUrl:logoDataUrl||undefined};
 $('#run').disabled=true;$('#result').classList.remove('on');const st={};draw(st);
 try{
  st.perceive='done';st.d_perceive=(brief.partner||'партнёр')+' · '+brief.product;draw(st);await sleep(300);
  st.research='run';draw(st);
const r=await fetch('/api/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(brief)});
const raw=await r.text();
let data;

try{
  data=JSON.parse(raw);
}catch(_){
  throw new Error(raw||('HTTP '+r.status));
}

if(!r.ok||data.error){
  throw new Error(data.error||('HTTP '+r.status));
}

cfg=data.config;lastHtml=data.html;
  st.research='done';
  if(data.siteAnalysis&&(data.siteAnalysis.acc||data.siteAnalysis.acc2)){
    const m=data.siteAnalysis.method==='vision'?'Посмотрел на сайт':'Прочитал код сайта';
    st.d_research=m+': цвета '+[data.siteAnalysis.acc,data.siteAnalysis.acc2].filter(Boolean).join(', ')+(data.siteAnalysis.mood?' · стиль: '+data.siteAnalysis.mood:'')+' — применил к лендингу';
  }else if(brief.url){
    st.d_research='Сайт не удалось проанализировать — использую тему бренда';
  }else{
    st.d_research='Сайт не указан — использую тему бренда';
  }
  st.write='done';st.d_write='H1: «'+cfg.h1+'»';draw(st);await sleep(300);
  st.assemble='run';draw(st);
  const fr=$('#frame');fr.srcdoc=lastHtml;$('#empty').style.display='none';fr.style.display='block';
  fr.onload=()=>{try{fr.contentWindow.scrollTo(0,0)}catch(_){}};
  st.assemble='done';draw(st);await sleep(300);
  st.deploy='done';st.d_deploy='Нажми «Выкатить», чтобы опубликовать';draw(st);
  const slug=(brief.partner||'lp').toLowerCase().replace(/[^a-zа-я0-9]+/gi,'-').replace(/^-|-$/g,'').slice(0,24)||'lp';
  $('#i_domain').value=slug;$('#suf').textContent='.'+(BASE_BY_PRODUCT[cfg.brand]||'demo.vercel.app');$('#pv').textContent='превью · '+cfg.brand;
  $('#resUrl').textContent='Лендинг собран. Готов к публикации.';$('#result').classList.add('on');
  editHistory=[];$('#undoBtn').disabled=true;
  libAdd({id:Date.now()+'-'+Math.random().toString(36).slice(2),partner:brief.partner,product:brief.product,ts:Date.now(),html:lastHtml,cfg:cfg});
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
function uploadHtml(e){
 const file=e.target.files&&e.target.files[0];if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{
  lastHtml=reader.result;cfg=cfg||{brand:'custom',niche:'general'};
  const fr=$('#frame');fr.srcdoc=lastHtml;$('#empty').style.display='none';fr.style.display='block';
  fr.onload=()=>{try{fr.contentWindow.scrollTo(0,0)}catch(_){}};
  $('#pv').textContent='загруженный HTML: '+file.name;
  $('#resUrl').textContent='Загружен свой HTML. Можно вносить правки, скачать или выкатить.';
  $('#result').classList.add('on');
 };
 reader.readAsText(file);
}
async function applyEdit(){
 if(!lastHtml){$('#editOut').textContent='Сначала запусти агента или загрузи HTML.';return;}
 const instruction=$('#i_edit').value.trim();if(!instruction)return;
 const btn=$('#editBtn'),out=$('#editOut');btn.disabled=true;out.textContent='Вношу правку…';
 try{
  const r=await fetch('/api/edit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html:lastHtml,instruction})});
  const raw=await r.text();let d;try{d=JSON.parse(raw)}catch(_){throw new Error(raw||('HTTP '+r.status))}
  if(!r.ok||d.error)throw new Error(d.error||('HTTP '+r.status));
  editHistory.push(lastHtml);if(editHistory.length>10)editHistory.shift();$('#undoBtn').disabled=false;
  lastHtml=d.html;
  const fr=$('#frame');fr.srcdoc=lastHtml;
  fr.onload=()=>{try{fr.contentWindow.scrollTo(0,0)}catch(_){}};
  out.textContent='✅ Правка применена.';
  $('#i_edit').value='';
 }catch(e){out.textContent='⚠️ '+e.message}
 btn.disabled=false;
}
function undoEdit(){
 if(!editHistory.length)return;
 lastHtml=editHistory.pop();
 const fr=$('#frame');fr.srcdoc=lastHtml;
 fr.onload=()=>{try{fr.contentWindow.scrollTo(0,0)}catch(_){}};
 $('#undoBtn').disabled=editHistory.length===0;
 $('#editOut').textContent='↩ Правка отменена.';
}
function onLogoUpload(e){
 const file=e.target.files&&e.target.files[0];if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{logoDataUrl=reader.result;$('#logoStatus').textContent='Логотип загружен: '+file.name};
 reader.readAsDataURL(file);
}
// --- Минимальный ZIP-архиватор (без сжатия, метод store) — без внешних зависимостей ---
function crc32(buf){
 if(!crc32.table){const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++){c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1)}t[n]=c}crc32.table=t}
 let crc=0^(-1);
 for(let i=0;i<buf.length;i++){crc=(crc>>>8)^crc32.table[(crc^buf[i])&0xFF]}
 return (crc^(-1))>>>0;
}
function makeZip(files){
 const enc=new TextEncoder();let localParts=[],centralParts=[],offset=0;
 for(const f of files){
  const nameBytes=enc.encode(f.name),data=(typeof f.data==='string')?enc.encode(f.data):f.data;
  const crc=crc32(data),size=data.length;
  const local=new Uint8Array(30+nameBytes.length+size),dv=new DataView(local.buffer);
  dv.setUint32(0,0x04034b50,true);dv.setUint16(4,20,true);dv.setUint16(6,0,true);dv.setUint16(8,0,true);
  dv.setUint16(10,0,true);dv.setUint16(12,0x21,true);dv.setUint32(14,crc,true);dv.setUint32(18,size,true);
  dv.setUint32(22,size,true);dv.setUint16(26,nameBytes.length,true);dv.setUint16(28,0,true);
  local.set(nameBytes,30);local.set(data,30+nameBytes.length);localParts.push(local);
  const central=new Uint8Array(46+nameBytes.length),cdv=new DataView(central.buffer);
  cdv.setUint32(0,0x02014b50,true);cdv.setUint16(4,20,true);cdv.setUint16(6,20,true);cdv.setUint16(8,0,true);
  cdv.setUint16(10,0,true);cdv.setUint16(12,0,true);cdv.setUint16(14,0x21,true);cdv.setUint32(16,crc,true);
  cdv.setUint32(20,size,true);cdv.setUint32(24,size,true);cdv.setUint16(28,nameBytes.length,true);
  cdv.setUint16(30,0,true);cdv.setUint16(32,0,true);cdv.setUint16(34,0,true);cdv.setUint16(36,0,true);
  cdv.setUint32(38,0,true);cdv.setUint32(42,offset,true);central.set(nameBytes,46);centralParts.push(central);
  offset+=local.length;
 }
 const centralSize=centralParts.reduce((a,b)=>a+b.length,0),centralOffset=offset;
 const end=new Uint8Array(22),edv=new DataView(end.buffer);
 edv.setUint32(0,0x06054b50,true);edv.setUint16(8,files.length,true);edv.setUint16(10,files.length,true);
 edv.setUint32(12,centralSize,true);edv.setUint32(16,centralOffset,true);
 const all=[...localParts,...centralParts,end],total=all.reduce((a,b)=>a+b.length,0),out=new Uint8Array(total);
 let p=0;for(const part of all){out.set(part,p);p+=part.length}
 return out;
}
function splitHtmlForZip(html){
 let css='',js='',out=html;
 out=out.replace(/<style>([\\s\\S]*?)<\\/style>/gi,(m,c)=>{css+=c+'\\n';return '<link rel="stylesheet" href="styles.css">'});
 out=out.replace(/<script>([\\s\\S]*?)<\\/script>/gi,(m,c)=>{js+=c+'\\n';return '<script src="script.js"><'+'/script>'});
 return {html:out,css,js};
}
function downloadZip(){
 if(!lastHtml)return;
 const {html,css,js}=splitHtmlForZip(lastHtml);
 const zipBytes=makeZip([{name:'index.html',data:html},{name:'styles.css',data:css||'/* стили */'},{name:'script.js',data:js||'// скрипты'}]);
 const blob=new Blob([zipBytes],{type:'application/zip'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='lending-'+((cfg&&cfg.brand)||'landing')+'.zip';
 document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}
// --- Библиотека лендингов (localStorage, до 20 последних) ---
function libLoad(){try{return JSON.parse(localStorage.getItem('landing_agent_library')||'[]')}catch(_){return []}}
function libSaveAll(list){try{localStorage.setItem('landing_agent_library',JSON.stringify(list.slice(0,20)))}catch(_){}}
function libAdd(entry){const list=libLoad();list.unshift(entry);libSaveAll(list);renderLibrary()}
function libDelete(id){libSaveAll(libLoad().filter(e=>e.id!==id));renderLibrary()}
function renderLibrary(){
 const list=libLoad(),el=$('#libList');
 if(!list.length){el.innerHTML='<div style="color:var(--mut);font-size:12px">Пока пусто — здесь появятся собранные лендинги.</div>';return}
 el.innerHTML=list.map(e=>'<div style="padding:10px;border:1px solid var(--line);border-radius:8px;margin-bottom:8px">'+
  '<div style="font-size:13px;font-weight:600">'+(e.partner||'Без имени')+'</div>'+
  '<div style="font-size:11px;color:var(--mut)">'+e.product+' · '+new Date(e.ts).toLocaleString('ru')+'</div>'+
  '<div style="display:flex;gap:6px;margin-top:6px">'+
  '<button data-id="'+e.id+'" class="lib-open" style="flex:1;padding:6px;font-size:11px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--txt)">Открыть</button>'+
  '<button data-id="'+e.id+'" class="lib-del" style="padding:6px 10px;font-size:11px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:#ff6b6b">✕</button></div></div>').join('');
 el.querySelectorAll('.lib-open').forEach(btn=>btn.onclick=()=>{
  const entry=libLoad().find(e=>e.id===btn.dataset.id);if(!entry)return;
  cfg=entry.cfg;lastHtml=entry.html;editHistory=[];$('#undoBtn').disabled=true;
  const fr=$('#frame');fr.srcdoc=lastHtml;$('#empty').style.display='none';fr.style.display='block';
  fr.onload=()=>{try{fr.contentWindow.scrollTo(0,0)}catch(_){}};
  $('#pv').textContent='из библиотеки: '+(entry.partner||entry.product);
  $('#resUrl').textContent='Загружено из библиотеки.';$('#result').classList.add('on');
 });
 el.querySelectorAll('.lib-del').forEach(btn=>btn.onclick=()=>libDelete(btn.dataset.id));
}
$('#run').onclick=run;$('#deployBtn').onclick=deploy;$('#downloadBtn').onclick=downloadHtml;
$('#i_upload').onchange=uploadHtml;$('#editBtn').onclick=applyEdit;
$('#i_logo').onchange=onLogoUpload;$('#zipBtn').onclick=downloadZip;$('#undoBtn').onclick=undoEdit;
renderLibrary();
$('#i_product').onchange=()=>{const m={studyai:'https://studyai.one/?rid=0a9815c6bf60fb1d',kampus:'https://kampus.ai/?rid=xxx',mystylus:'https://mystylus.ai/?rid=xxx',studybay:'https://studybay.com/?rid=xxx',avtor24:'https://avtor24.ru/?ref=xxx'};$('#i_ref').value=m[$('#i_product').value]||''};
draw({});
</script></body></html>`;
