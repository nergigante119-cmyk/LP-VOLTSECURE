(() => {
  'use strict';
  const $ = (selector, root=document) => root.querySelector(selector);
  const $$ = (selector, root=document) => Array.from(root.querySelectorAll(selector));
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Menu mobile com estados acessíveis e fechamento ao navegar.
  const menuToggle = $('.menu-toggle');
  const nav = $('#menu-principal');
  function setMenu(open) {
    if (!menuToggle || !nav) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
  }
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
    $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setMenu(false); });
    document.addEventListener('click', (event) => { if (!nav.contains(event.target) && !menuToggle.contains(event.target)) setMenu(false); });
  }

  // Entrada suave sem ocultar o conteúdo quando JS está indisponível.
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reducedMotion && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-animated');
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -35px 0px', threshold: .08 });
    $$('.reveal').forEach(element => observer.observe(element));
  }

  // Pré-seleciona produto no formulário e leva o visitante ao orçamento.
  const quoteForm = $('#quote-form');
  $$('.choose-service').forEach(button => {
    button.addEventListener('click', () => {
      const select = $('#servico');
      if (select) select.value = button.dataset.service || '';
      const target = $('#orcamento');
      if (target) target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
      setTimeout(() => { if (select) select.focus({preventScroll: true}); }, reducedMotion ? 0 : 500);
    });
  });

  // Gera mensagem para o WhatsApp sem coletar ou transmitir dados pelo site.
  // O link curto de WhatsApp Business existente não garante pré-preenchimento,
  // por isso o visitante copia a mensagem e decide quando enviá-la.
  if (!quoteForm) return;
  const feedback = $('#quote-feedback');
  const prepared = $('#prepared-message');
  const preview = $('#message-preview');
  const copyButton = $('#copy-message');
  const contactLink = $('#open-whatsapp');
  const contactUrl = 'https://wa.me/message/CSXTN5VPTHPSF1';
  if (contactLink) contactLink.href = contactUrl;

  const sanitize = (value) => String(value || '').trim().replace(/[\r\n\t]+/g, ' ').slice(0, 700);
  function setStatus(message, error=false) {
    if (!feedback) return;
    feedback.textContent = message;
    feedback.classList.toggle('error', error);
  }
  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try { await navigator.clipboard.writeText(text); return true; } catch (_) { /* fallback */ }
    }
    try {
      preview.focus();
      preview.select();
      preview.setSelectionRange(0, preview.value.length);
      return document.execCommand('copy');
    } catch (_) { return false; }
  }
  quoteForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!quoteForm.checkValidity()) {
      setStatus('Preencha o serviço, o tipo de imóvel e a cidade ou bairro.', true);
      const invalid = $$('select,input,textarea', quoteForm).find(field => !field.checkValidity());
      if (invalid) invalid.focus();
      return;
    }
    const data = new FormData(quoteForm);
    const lines = [
      'Olá! Gostaria de solicitar um orçamento à VoltSecure.',
      '',
      '*Serviço:* ' + sanitize(data.get('servico')),
      '*Imóvel:* ' + sanitize(data.get('imovel')),
      '*Quantidade:* ' + sanitize(data.get('quantidade')),
      '*Prazo:* ' + sanitize(data.get('prazo')),
      '*Região:* ' + sanitize(data.get('local'))
    ];
    const details = sanitize(data.get('detalhes'));
    if (details) lines.push('*Detalhes:* ' + details);
    lines.push('', 'Podemos conversar sobre as opções e disponibilidade?');
    const message = lines.join('\n');
    if (!preview || !prepared) return;
    preview.value = message;
    prepared.hidden = false;
    const copied = await copyText(message);
    setStatus(copied ? 'Mensagem preparada e copiada. Agora abra o WhatsApp e cole no chat.' : 'Mensagem preparada. Toque em “Copiar mensagem” ou selecione o texto antes de abrir o WhatsApp.');
    prepared.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'nearest'});
  });
  if (copyButton) copyButton.addEventListener('click', async () => {
    if (!preview || !preview.value) return;
    const success = await copyText(preview.value);
    setStatus(success ? 'Mensagem copiada. Abra o WhatsApp e cole na conversa.' : 'Não foi possível copiar automaticamente. Selecione o texto e copie manualmente.', !success);
  });
})();
