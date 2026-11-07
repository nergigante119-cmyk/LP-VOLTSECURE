(()=>{
  'use strict';
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const BUSINESS_URL = 'https://wa.me/message/CSXTN5VPTHPSF1';
  // Opcional: preencher com o NÚMERO VERIFICADO do WhatsApp Business, apenas dígitos (ex.: 5511999999999).
  // Com o número, a mensagem abre preenchida diretamente na conversa da empresa.
  // Sem ele, o site copia o texto e abre o link Business existente, sem inventar um telefone.
  const WHATSAPP_NUMBER = '';
  const validNumber = /^55\d{10,11}$/.test(WHATSAPP_NUMBER);
  const reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const scrollBehavior = reducedMotion ? 'auto' : 'smooth';

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
  const toggle = $('#menu-toggle');
  const nav = $('#main-nav');
  function menu(open) {
    if (!toggle || !nav) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', () => menu(toggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach(link => link.addEventListener('click', () => menu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && nav.classList.contains('open')) { menu(false); toggle.focus(); }
    });
    document.addEventListener('click', event => {
      if (!toggle.contains(event.target) && !nav.contains(event.target)) menu(false);
    });
  }

  const form = $('#quote-form');
  if (!form) return;
  const service = $('#service-choice');
  const prepared = $('#prepared');
  const textarea = $('#prepared-text');
  const feedback = $('#form-feedback');
  const submitButton = $('button[type="submit"]', form);

  if (validNumber && submitButton) submitButton.textContent = 'Abrir WhatsApp com a mensagem pronta ↗';
  $$('[data-quote-service]').forEach(button => button.addEventListener('click', () => {
    if (!service) return;
    service.value = button.dataset.quoteService || '';
    const section = $('#contact');
    if (section) section.scrollIntoView({ behavior: scrollBehavior, block: 'start' });
    setTimeout(() => service.focus({ preventScroll: true }), reducedMotion ? 0 : 450);
  }));

  const clean = value => String(value || '').replace(/[\r\n\t]+/g, ' ').trim().slice(0, 500);
  const makeMessage = () => {
    const data = new FormData(form);
    const lines = [
      'Olá! Gostaria de solicitar uma avaliação presencial com a VoltSecure.',
      '',
      '*Serviço:* ' + clean(data.get('service')),
      '*Imóvel:* ' + clean(data.get('property')),
      '*Cidade/bairro:* ' + clean(data.get('region'))
    ];
    const notes = clean(data.get('notes'));
    if (notes) lines.push('*Detalhes:* ' + notes);
    lines.push('', 'Podemos conversar sobre a visita e o orçamento?');
    return lines.join('\n');
  };
  function showPrepared(text) {
    if (!prepared || !textarea) return;
    textarea.value = text;
    prepared.hidden = false;
    prepared.scrollIntoView({ behavior: scrollBehavior, block: 'nearest' });
  }
  function copySynchronously(text) {
    if (!textarea) return false;
    textarea.value = text;
    textarea.focus();
    textarea.select();
    try { return document.execCommand('copy'); } catch (_) { return false; }
  }
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) {}
    }
    return copySynchronously(text);
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const text = makeMessage();
    showPrepared(text);
    if (validNumber) {
      const url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(text);
      if (wa) wa.href = url;
      window.open(url, '_blank', 'noopener,noreferrer');
      if (feedback) feedback.textContent = 'A mensagem está pronta. Se o navegador bloquear a nova aba, use o botão “Abrir conversa” abaixo.';
      return;
    }
    const copied = copySynchronously(text);
    window.open(BUSINESS_URL, '_blank', 'noopener,noreferrer');
    if (feedback) feedback.textContent = copied
      ? 'Solicitação copiada. Cole na conversa da VoltSecure e envie pelo WhatsApp.'
      : 'Conversa aberta. Copie a mensagem abaixo e cole no WhatsApp.';
  });

  $('#copy-prepared')?.addEventListener('click', async () => {
    const success = await copyText(textarea?.value || '');
    if (feedback) feedback.textContent = success ? 'Solicitação copiada. Cole na conversa da VoltSecure.' : 'Selecione o texto e copie manualmente.';
  });
  const wa = $('#direct-wa');
  if (wa) wa.href = BUSINESS_URL;
})();
