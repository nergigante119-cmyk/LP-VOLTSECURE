(()=>{'use strict';
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const yr=$('#year');if(yr)yr.textContent=new Date().getFullYear();
const toggle=$('#menu-toggle'),nav=$('#main-nav');
function menu(open){if(!toggle||!nav)return;nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');}
if(toggle&&nav){toggle.addEventListener('click',()=>menu(toggle.getAttribute('aria-expanded')!=='true'));$$('a',nav).forEach(a=>a.addEventListener('click',()=>menu(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){menu(false);toggle.focus();}});document.addEventListener('click',e=>{if(!toggle.contains(e.target)&&!nav.contains(e.target))menu(false);});}
const form=$('#quote-form');if(!form)return;
const service=$('#service-choice'),feedback=$('#form-feedback'),prepared=$('#prepared'),msg=$('#prepared-text');
$$('[data-quote-service]').forEach(el=>el.addEventListener('click',()=>{if(service){service.value=el.dataset.quoteService||'';$('#contact')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});setTimeout(()=>service.focus({preventScroll:true}),450);}}));
const clean=s=>String(s||'').replace(/[\r\n\t]+/g,' ').trim().slice(0,500);
const business='https://wa.me/message/CSXTN5VPTHPSF1';
const preview=()=>{const data=new FormData(form);const lines=['Olá! Gostaria de solicitar uma avaliação presencial para instalação com a VoltSecure.','','*Serviço:* '+clean(data.get('service')),'*Imóvel:* '+clean(data.get('property')),'*Cidade/bairro:* '+clean(data.get('region'))];const details=clean(data.get('notes'));if(details)lines.push('*Informações adicionais:* '+details);lines.push('','Podemos conversar sobre a visita e o orçamento?');return lines.join('\n');};
async function copy(str){if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(str);return true;}catch(e){}}try{msg.focus();msg.select();return document.execCommand('copy');}catch(e){return false;}}
form.addEventListener('submit',async e=>{e.preventDefault();if(!form.reportValidity())return;if(!prepared||!msg)return;const m=preview();msg.value=m;prepared.hidden=false;const copied=await copy(m);feedback.textContent=copied?'Mensagem copiada. Abra o WhatsApp e cole na conversa.':'Mensagem preparada. Selecione e copie o texto antes de abrir o WhatsApp.';prepared.scrollIntoView({block:'nearest',behavior:'smooth'});});
$('#copy-prepared')?.addEventListener('click',async()=>{const ok=await copy(msg.value);feedback.textContent=ok?'Texto copiado. Abra o WhatsApp para enviar.':'Selecione o texto acima e copie manualmente.';});
$('#direct-wa')?.setAttribute('href',business);
})();
