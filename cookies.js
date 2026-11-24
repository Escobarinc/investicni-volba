/* Investiční volba – lišta souhlasu s cookies (Nastavení soukromí), záložka a odkaz „Nastavení cookies“.
   Nepovinné technologie až po souhlasu, analytické a marketingové zvlášť; ukládá verzi, kategorie a čas.
   Odmítnutí nijak neomezuje formuláře ani stažení PDF. */
(() => {
  'use strict';
  const KEY = 'iv-cookies', VERZE = '2026-11-24', PLATNOST = 365 * 864e5;
  // Jen skutečně nasazené technologie: název, poskytovatel, účel, doba platnosti.
  const INVENTAR = {
    nezbytne: [
      ['iv-cookies', 'Investiční volba (9394 Group s.r.o.)', 'Uložení vaší volby souhlasu (verze textu, kategorie a čas rozhodnutí).', '12 měsíců (lokální úložiště prohlížeče)'],
      ['Hosting Render', 'Render Services, Inc.', 'Doručení stránek a technické záznamy serveru. Neukládá cookies.', 'podle pravidel poskytovatele'],
    ],
    analyticke: [
      ['clx_v', 'CLARIX CRM (9394 Group s.r.o.)', 'Rozpoznání opakované návštěvy pro statistiku návštěvnosti.', 'do smazání nebo odvolání souhlasu (lokální úložiště)'],
      ['clx_ft', 'CLARIX CRM (9394 Group s.r.o.)', 'Zdroj návštěvy a vstupní stránka (např. kampaň), měření zobrazení, kliknutí a posunu stránky.', 'do zavření prohlížeče (úložiště relace)'],
    ],
    marketingove: [],
  };
  const read = () => {
    try {
      const c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!c || c.verze !== VERZE || Date.now() - Date.parse(c.cas) > PLATNOST) return null;
      return c;
    } catch (e) { return null; }
  };
  const wipe = () => {
    try { localStorage.removeItem('clx_v'); sessionStorage.removeItem('clx_ft'); } catch (e) { /* nic */ }
  };
  const apply = (c, prev) => {
    window.ivConsent = c;
    if (prev && prev.analyticke && !(c && c.analyticke)) { wipe(); location.reload(); return; }
    if (c && c.analyticke && typeof window.loadCrmTracking === 'function') window.loadCrmTracking();
    document.dispatchEvent(new CustomEvent('iv:consent', { detail: c }));
  };
  const save = (a, m) => {
    const prev = window.ivConsent;
    const c = { verze: VERZE, nezbytne: true, analyticke: !!a, marketingove: !!m, cas: new Date().toISOString() };
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) { /* nic */ }
    apply(c, prev);
  };
  const rows = (list) => list.length
    ? `<table class="ck-tech"><thead><tr><th>Název</th><th>Poskytovatel</th><th>Účel</th><th>Doba platnosti</th></tr></thead><tbody>${list.map((r) => `<tr>${r.map((v) => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`
    : '<p class="ck-none">Na webu zatím nepoužíváme žádnou technologii této kategorie.</p>';
  const cat = (id, title, text) => `<div class="ck-cat"><div class="ck-cat-head">${id === 'nezbytne'
    ? '<span class="ck-always">Vždy aktivní</span>'
    : `<label class="ck-switch"><input type="checkbox" data-ck="${id}"><i aria-hidden="true"></i><span class="sr-only">Povolit: ${title}</span></label>`}<div><b>${title}</b><small>${text}</small></div></div><details class="ck-details"><summary>Seznam technologií</summary>${rows(INVENTAR[id])}</details></div>`;
  const LINKS = `<a href="zasady-cookies.html">Zásadách používání cookies</a> a <a href="zasady-ochrany-osobnich-udaju.html">Zásadách ochrany osobních údajů</a>`;

  const bar = document.createElement('section');
  bar.className = 'ck-bar'; bar.hidden = true;
  bar.setAttribute('role', 'dialog'); bar.setAttribute('aria-labelledby', 'ck-title');
  bar.innerHTML = `<div class="ck-inner">
    <div class="ck-l1"><h2 id="ck-title">Nastavení soukromí</h2><p>Pro fungování webu používáme nezbytné technologie. S vaším souhlasem také měříme návštěvnost, abychom web mohli zlepšovat. Podrobnosti najdete v ${LINKS}.</p></div>
    <div class="ck-l2" hidden><div class="ck-grid">${cat('nezbytne', 'Nezbytné', 'Fungování webu a uložení vaší volby. Bez souhlasu, jen v nezbytném rozsahu.')}${cat('analyticke', 'Analytické', 'Měření návštěvnosti a používání stránek. Pouze se souhlasem.')}${cat('marketingove', 'Marketingové', 'Měření účinnosti reklam. Zatím nepoužíváme.')}</div><p class="ck-docs">Podrobnosti v ${LINKS}.</p></div>
    <div class="ck-actions"><button type="button" class="ck-btn" data-ck-act="none">Odmítnout vše</button><button type="button" class="ck-btn" data-ck-act="settings">Nastavení</button><button type="button" class="ck-btn" data-ck-act="save" hidden>Uložit nastavení</button><button type="button" class="ck-btn" data-ck-act="all">Přijmout vše</button></div>
    <button type="button" class="ck-handle" aria-label="Skrýt nastavení soukromí" hidden></button></div>`;
  const tab = document.createElement('button');
  tab.type = 'button'; tab.className = 'ck-tab'; tab.hidden = true; tab.setAttribute('aria-label', 'Nastavení cookies');
  tab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-3.5-3A3 3 0 0 1 14 5.5 3 3 0 0 1 12 3z"/><circle cx="8.5" cy="10.5" r=".9"/><circle cx="12" cy="15.5" r=".9"/><circle cx="16" cy="13" r=".9"/></svg>Cookies';
  document.body.append(bar, tab);

  const $ = (s) => bar.querySelector(s);
  const layer = (two) => { $('.ck-l2').hidden = !two; $('[data-ck-act="settings"]').hidden = two; $('[data-ck-act="save"]').hidden = !two; };
  const open = (two) => {
    const c = window.ivConsent || {};
    bar.querySelectorAll('[data-ck]').forEach((b) => { b.checked = !!c[b.dataset.ck]; });
    layer(!!two); $('.ck-handle').hidden = !window.ivConsent;
    bar.hidden = false; tab.hidden = true;
    requestAnimationFrame(() => bar.classList.add('is-open'));
  };
  const close = () => { bar.classList.remove('is-open'); setTimeout(() => { bar.hidden = true; tab.hidden = false; }, 250); };

  bar.addEventListener('click', (e) => {
    if (e.target.closest('.ck-handle')) { close(); return; }
    const act = e.target.closest('[data-ck-act]')?.dataset.ckAct;
    if (!act) return;
    if (act === 'settings') { layer(true); return; }
    if (act === 'all') save(true, true);
    else if (act === 'none') save(false, false);
    else save($('[data-ck="analyticke"]').checked, $('[data-ck="marketingove"]').checked);
    close();
  });
  tab.addEventListener('click', () => open(true));
  document.addEventListener('click', (e) => { if (e.target.closest('[data-open-cookies]')) { e.preventDefault(); open(true); } });

  // Přehled technologií na stránce Zásady cookies (i v okně nad landing page – legal-modal.js).
  window.ivFillInventory = (root) => {
    const inv = (root || document).querySelector('[data-ck-inventory]');
    if (inv) inv.innerHTML = [['nezbytne', 'Nezbytné'], ['analyticke', 'Analytické'], ['marketingove', 'Marketingové']]
      .map(([k, t]) => `<h3>${t}</h3>${rows(INVENTAR[k])}`).join('');
  };
  window.ivFillInventory();

  const c = read();
  if (c) { apply(c, null); tab.hidden = false; } else { window.ivConsent = null; open(false); }
})();
