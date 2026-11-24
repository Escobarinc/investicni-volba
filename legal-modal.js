/* Landing page: právní dokumenty (ochrana údajů, cookies, podmínky) se otevírají v okně nad stránkou,
   návštěvník tak neopustí formulář. Bez JavaScriptu fungují odkazy dál jako běžné stránky. */
(() => {
  'use strict';
  const DOCS = /(^|\/)(zasady-ochrany-osobnich-udaju|zasady-cookies|podminky-pouzivani)\.html$/;
  const cache = {};

  const box = document.createElement('div');
  box.className = 'lm-backdrop';
  box.hidden = true;
  box.innerHTML = `<div class="lm-dialog" role="dialog" aria-modal="true" aria-labelledby="lm-title" tabindex="-1">
      <div class="lm-head"><h2 id="lm-title"></h2><button type="button" class="lm-close" aria-label="Zavřít">×</button></div>
      <div class="lm-body legal"></div>
    </div>`;
  document.body.appendChild(box);
  const dialog = box.querySelector('.lm-dialog');
  const body = box.querySelector('.lm-body');
  const title = box.querySelector('#lm-title');
  let lastFocus = null;

  const close = () => {
    box.hidden = true;
    document.documentElement.classList.remove('lm-open');
    if (lastFocus) lastFocus.focus();
  };

  async function show(url) {
    lastFocus = document.activeElement;
    title.textContent = 'Načítám…';
    body.innerHTML = '';
    box.hidden = false;
    document.documentElement.classList.add('lm-open');
    dialog.focus();
    try {
      if (!cache[url]) {
        const html = await fetch(url).then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); });
        cache[url] = new DOMParser().parseFromString(html, 'text/html');
      }
      const doc = cache[url];
      const wrap = doc.querySelector('.legal .wrap').cloneNode(true);
      wrap.querySelector('.legal__back')?.remove();
      const h1 = wrap.querySelector('h1');
      title.textContent = h1 ? h1.textContent : '';
      h1?.remove();
      body.innerHTML = wrap.innerHTML;
      body.scrollTop = 0;
      if (typeof window.ivFillInventory === 'function') window.ivFillInventory(body);
    } catch (e) {
      location.href = url; // když se okno nepodaří načíst, otevře se dokument jako stránka
    }
  }

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href]');
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const url = new URL(a.getAttribute('href'), location.href);
    if (url.origin !== location.origin || !DOCS.test(url.pathname)) return;
    e.preventDefault();
    // Odkaz z cookie lišty: lišta zůstane otevřená pod oknem.
    show(url.href);
  });
  box.addEventListener('click', (e) => { if (e.target === box || e.target.closest('.lm-close')) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !box.hidden) close(); });
})();
