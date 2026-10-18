(() => {
'use strict';
const $ = (s) => document.querySelector(s);
const dataURL = './companies.json';
const START = Date.UTC(2026, 9, 17);
const FEATURED = ['NVDA','COST','DE','MSFT','JNJ','AMZN','WMT','ADBE','CAT','AVGO','UNH','GOOGL','HD','PEP','META','TSLA','JPM','V','KO','MCD','BRK.B','TMO','ORCL','INTC','XOM','DIS','NKE','CRM','AMAT','ABNB'];
const NOTES = {
  NVDA:'Its early reputation was built on making digital worlds look real.',
  COST:'Members pay to enter the bargain hunt.',
  DE:'Its most recognizable machines wear green and yellow.',
  MSFT:'A small software partnership began with a BASIC interpreter.',
  JNJ:'A consumer-health division was spun off from this older parent.',
  AMZN:'It started with books before building a cloud giant.',
  WMT:'A warehouse club shares a parent with this retailer.',
  ADBE:'A document format it developed became nearly universal.',
  CAT:'Its yellow machinery is at home on a mining site.',
  AVGO:'Its business spans chips and infrastructure software.',
  UNH:'A health insurer and a services arm share its umbrella.',
  GOOGL:'Its first product organized the web.',
  HD:'Orange aprons are a retail calling card.',
  PEP:'Its portfolio mixes soda and snack aisles.',
  META:'Its family includes a messaging app and a photo-sharing app.',
  TSLA:'Its charging network reaches beyond its own vehicles.',
  JPM:'Its name combines two long-standing banking legacies.',
  V:'It runs a payments network without being the bank on the card.',
  KO:'A red-and-white wordmark began in Atlanta.',
  MCD:'Two golden arches became a global sign.',
  'BRK.B':'An insurance float helped power its investment machine.',
  TMO:'Researchers know it for laboratory instruments.',
  ORCL:'A relational database was the original calling card.',
  INTC:'A decades-long shorthand for PC processors.',
  XOM:'Two oil names combined into one heavyweight.',
  DIS:'An animation studio became a parks-and-media empire.',
  NKE:'A simple swoosh turned into an icon of sport.',
  CRM:'The sales pipeline moved into the cloud.',
  AMAT:'Its machines help manufacture chips rather than design them.',
  ABNB:'The inventory is mostly other people’s homes.'
};
let rows=[], answers=[], answer=null, caseId='', day=0, state=null, suggestions=[], highlight=0;
const escapeHTML = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today = () => { const n=new Date(); return [n.getFullYear(),n.getMonth()+1,n.getDate()].map((v,i)=>i?String(v).padStart(2,'0'):String(v)).join('-'); };
function dayNumber(key){ const [y,m,d]=key.split('-').map(Number);return Math.max(0,Math.round((Date.UTC(y,m-1,d)-START)/86400000)); }
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function loadJSON(key, fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
function save(){try{localStorage.setItem('ii:v1:'+caseId,JSON.stringify(state))}catch{}}
function stats(){return loadJSON('ii:stats:v1',{played:0,wins:0,streak:0,best:0,dist:[0,0,0,0,0,0,0],last:''})}
function writeStats(s){try{localStorage.setItem('ii:stats:v1',JSON.stringify(s))}catch{}}
function getAnswer(d){const featured=FEATURED.map(sym=>rows.find(c=>c.symbol===sym)).filter(Boolean);const featuredBases=new Set(featured.map(c=>c.base));const rest=rows.filter(c=>!featuredBases.has(c.base)).filter((c,i,a)=>a.findIndex(x=>x.base===c.base)===i).sort((a,b)=>hash('INDEX-2026:'+a.symbol)-hash('INDEX-2026:'+b.symbol));answers=[...featured,...rest];return answers[d%answers.length]}
function evidence(c){const addedYear=parseInt(c.added.slice(0,4),10);const isHistoric=Number.isFinite(addedYear)&&addedYear<1980;return [
  {rank:'DEEP CUT',text:NOTES[c.symbol]||`Its earliest listed entry into the index dates to the ${Number.isFinite(addedYear)?Math.floor(addedYear/10)*10:'unknown'}s.`},
  {rank:'LOCATION',text:`Its headquarters are listed in ${c.state}.`},
  {rank:'VINTAGE',text:`Its first-listed founding year falls in the ${Math.floor(c.year/10)*10}s.`},
  {rank:'SECTOR',text:`Its GICS sector is ${c.sector}.`},
  {rank:'MAP PIN',text:`Look to ${c.city} for its listed headquarters.`},
  {rank:'BUSINESS',text:`Its GICS sub-industry is ${c.industry}.`},
  {rank:'GIVEAWAY',text:`Its ticker symbol is ${c.symbol}.`}
]}
function initDay(){const key=today();day=dayNumber(key);caseId=key;answer=getAnswer(day);const saved=loadJSON('ii:v1:'+key,null);state=(saved&&saved.answer===answer.symbol&&Array.isArray(saved.moves)&&saved.turn>=0&&saved.turn<7)?saved:{answer:answer.symbol,turn:0,moves:[],outcome:null};$('#edition').textContent='CASE #'+String(day+1).padStart(3,'0');$('#case-number').textContent=String(day+1).padStart(3,'0');$('#date-label').textContent=new Date().toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'}).toUpperCase();render()}
function feedback(company){const y=company.year===answer.year?'SAME LISTED YEAR':company.year<answer.year?'ANSWER FOUNDED LATER':'ANSWER FOUNDED EARLIER';return [{text:y,class:company.year===answer.year?'match':''},{text:company.state===answer.state?'SAME STATE':'DIFFERENT STATE',class:company.state===answer.state?'match':'miss'},{text:company.sector===answer.sector?'SAME SECTOR':'DIFFERENT SECTOR',class:company.sector===answer.sector?'match':'miss'}]}
function render(){const clues=evidence(answer);$('#case-count').textContent=String(state.turn+1).padStart(2,'0')+' / 07';$('#progress').innerHTML=clues.map((_,i)=>`<span class="${i===state.turn?'active':i<state.turn?'used':''}"></span>`).join('');$('#facts').innerHTML=clues.map((f,i)=> i<=state.turn?`<div class="fact open ${i===state.turn?'recent':''}"><span class="fact-num">${String(i+1).padStart(2,'0')}</span><div><div class="fact-top"><b>CLUE ${i+1}</b><small>${escapeHTML(f.rank)}</small></div><div class="fact-text">${escapeHTML(f.text)}</div></div></div>`:`<div class="fact locked"><span class="fact-num">${String(i+1).padStart(2,'0')}</span><span class="fact-text">[ FILE SEALED — ${7-i} LEFT ]</span></div>`).join('');
$('#guesses').innerHTML=state.moves.filter(m=>m.type==='guess').map((m,i)=>{const c=rows.find(x=>x.symbol===m.symbol);if(!c)return '';return `<div class="guess"><div class="guess-line"><strong>${String(i+1).padStart(2,'0')}. ${escapeHTML(c.name)}</strong><span>${escapeHTML(c.symbol)}</span></div><div class="feedback">${feedback(c).map(f=>`<span class="${f.class}">${escapeHTML(f.text)}</span>`).join('')}</div></div>`}).join('');
const done=!!state.outcome;$('#guess').disabled=done;$('.submit').disabled=done;$('#skip').disabled=done||state.turn===6;$('#giveup').disabled=done;$('#result').hidden=!done;clearSuggestions();
if(done){const won=state.outcome==='win';$('#result-flag').textContent=won?'POSITION FOUND / CASE CLOSED':'NO POSITION / CASE CLOSED';$('#result-title').textContent=won?'You found '+answer.base+'.':'It was '+answer.base+'.';$('#result-copy').textContent=won?`Solved on clue ${state.turn+1} of 7. ${answer.symbol} · ${answer.sector} · ${answer.city}, ${answer.state}.`:`${answer.symbol} · ${answer.sector} · ${answer.city}, ${answer.state}. New case at local midnight.`}
}
function record(outcome){state.outcome=outcome;save();const s=stats();if(s.last!==caseId){s.played++;if(outcome==='win'){s.wins++;s.streak++;s.best=Math.max(s.best,s.streak);s.dist[state.turn]=(s.dist[state.turn]||0)+1}else{s.streak=0}s.last=caseId;writeStats(s)}render()}
function clearSuggestions(){suggestions=[];$('#suggestions').innerHTML='';$('#suggestions').hidden=true;$('#guess').setAttribute('aria-expanded','false')}
function showSuggestions(){if(state.outcome)return;const q=$('#guess').value.trim().toLowerCase();if(!q){clearSuggestions();return}suggestions=rows.filter(c=>c.name.toLowerCase().includes(q)||c.base.toLowerCase().includes(q)||c.symbol.toLowerCase().includes(q)).sort((a,b)=>{const av=(a.symbol.toLowerCase().startsWith(q)?-3:0)+(a.name.toLowerCase().startsWith(q)?-2:0);const bv=(b.symbol.toLowerCase().startsWith(q)?-3:0)+(b.name.toLowerCase().startsWith(q)?-2:0);return av-bv||a.name.localeCompare(b.name)}).slice(0,7);highlight=0;$('#suggestions').innerHTML=suggestions.map((c,i)=>`<button type="button" role="option" aria-selected="${i===highlight}" class="suggestion ${i===highlight?'selected':''}" data-symbol="${escapeHTML(c.symbol)}"><span>${escapeHTML(c.name)}</span><small>${escapeHTML(c.symbol)}</small></button>`).join('');$('#suggestions').hidden=!suggestions.length;$('#guess').setAttribute('aria-expanded',String(!!suggestions.length))}
function guess(c){if(state.outcome)return;$('#validation').textContent='';if(state.moves.some(m=>m.symbol===c.symbol||m.base===c.base)){ $('#validation').textContent='Already on the tape. Try a different company.';return}state.moves.push({type:'guess',symbol:c.symbol,base:c.base});$('#guess').value='';if(c.base===answer.base){record('win');return}if(state.turn>=6){record('loss');return}state.turn++;save();render();$('#validation').textContent='Not the company. A new clue has been unsealed.'}
$('#guess').addEventListener('input',()=>{$('#validation').textContent='';showSuggestions()});$('#guess').addEventListener('keydown',e=>{if(!suggestions.length)return;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();highlight=(highlight+(e.key==='ArrowDown'?1:-1)+suggestions.length)%suggestions.length;[...$('#suggestions').children].forEach((n,i)=>{n.classList.toggle('selected',i===highlight);n.setAttribute('aria-selected',String(i===highlight))})}else if(e.key==='Escape'){clearSuggestions()}});
$('#suggestions').addEventListener('pointerdown',e=>{const b=e.target.closest('button[data-symbol]');if(!b)return;e.preventDefault();const c=rows.find(x=>x.symbol===b.dataset.symbol);if(c){$('#guess').value=c.name;clearSuggestions();$('#guess').focus()}});
$('#guess-form').addEventListener('submit',e=>{e.preventDefault();if(state.outcome)return;const q=$('#guess').value.trim().toLowerCase();const c=rows.find(x=>x.symbol.toLowerCase()===q||x.name.toLowerCase()===q)||suggestions[highlight];if(!c){$('#validation').textContent='Pick an S&P 500 company from the list first.';return}guess(c)});
$('#skip').addEventListener('click',()=>{if(state.outcome||state.turn>=6)return;state.moves.push({type:'skip'});state.turn++;save();render();$('#validation').textContent='Clue revealed. One slot spent.'});$('#giveup').addEventListener('click',()=>{if(state.outcome)return;if(!window.confirm('Surrender today’s case and reveal the company?'))return;record('loss')});
async function share(){const trace=state.moves.map(m=>m.type==='skip'?'🟨':m.base===answer.base?'🟩':'🟥').join('');const score=state.outcome==='win'?`${state.turn+1}/7`:'X/7';const text=`INDEX//INCOGNITO #${day+1} ${score}\n${trace}\n${location.href.split('?')[0]}`;try{await navigator.clipboard.writeText(text);$('#share-status').textContent='Copied to clipboard.'}catch{$('#share-status').textContent='Copy unavailable in this browser.'}}
$('#share').addEventListener('click',share);
function modal(type){const help=type==='help';$('#modal-kicker').textContent=help?'DESK NOTES / 01':'PERFORMANCE / 02';$('#modal-title').textContent=help?'HOW TO PLAY':'YOUR RECORD';if(help){$('#modal-body').innerHTML='<p>Uncover a mystery constituent from a frozen S&amp;P 500 snapshot. A new case opens every local midnight.</p><ol><li>Start with one clue. Search by company name or ticker and lock in a guess.</li><li>Wrong guesses reveal the next clue. Feedback compares the first-listed founding year, headquarters state and GICS sector.</li><li>Skip to see the next clue, but it costs a slot. Solve within seven clues; the seventh gives away the ticker.</li><li>Share your pattern without giving the name away. Your progress stays in this browser.</li></ol><p>Data is for a game, not for trading. Multi-class share listings count as the same company.</p>'}else{const s=stats();const pct=s.played?Math.round(s.wins/s.played*100):0;const max=Math.max(1,...s.dist);$('#modal-body').innerHTML=`<div class="stat-grid"><div><strong>${s.played}</strong><span>PLAYED</span></div><div><strong>${pct}%</strong><span>WIN RATE</span></div><div><strong>${s.streak}</strong><span>STREAK</span></div></div><p>BEST STREAK: ${s.best} &nbsp;·&nbsp; GUESS DISTRIBUTION</p><div class="distribution">${s.dist.map((n,i)=>`<div style="height:${Math.max(5,Math.round(n/max*75))}px;background:${n?'var(--lime)':'#384b34'}"><b>${i+1}</b></div>`).join('')}</div>`}$('#modal').hidden=false;$('#modal-close').focus()}
$('#help-btn').addEventListener('click',()=>modal('help'));$('#stats-btn').addEventListener('click',()=>modal('stats'));function closeModal(){$('#modal').hidden=true}$('#modal-close').addEventListener('click',closeModal);$('#modal-done').addEventListener('click',closeModal);$('#modal').addEventListener('click',e=>{if(e.target===$('#modal'))closeModal()});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#modal').hidden)closeModal()});
fetch(dataURL).then(r=>{if(!r.ok)throw Error('Data unavailable');return r.json()}).then(d=>{rows=d.companies;initDay();setInterval(()=>{if(today()!==caseId)initDay()},60000)}).catch(err=>{$('#facts').innerHTML='<div class="fact open">The case file could not load. Refresh to retry.</div>';console.error(err)});
})();
