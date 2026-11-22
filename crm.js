/* Investiční volba — napojení na CLARIX CRM (měření návštěv a poptávky z formulářů).
 * Klíč webu je z CRM: Weby a měření. Měřicí kód se načte při každé návštěvě. */
(() => {
  'use strict';
  const CRM = { origin: 'https://clarix-crm.onrender.com', key: 'uo0kpF62LD-5RCHJ' };
  if (!document.getElementById('crm-t')) {
    const t = document.createElement('script');
    t.id = 'crm-t';
    t.async = true;
    t.src = `${CRM.origin}/api/t.js?k=${encodeURIComponent(CRM.key)}`;
    document.head.appendChild(t);
  }
  // Odeslání poptávky: přes měřicí kód (spáruje návštěvu s leadem), a když se nenačetl, přímo.
  async function sendLead(data) {
    if (window.clarixTrack?.lead) {
      const r = await window.clarixTrack.lead(data);
      if (r && r.error) throw new Error(r.error);
      return r;
    }
    const q = new URLSearchParams(location.search);
    const u = {};
    ['source', 'medium', 'campaign', 'content', 'term'].forEach((k) => { u[k] = q.get('utm_' + k) || ''; });
    const body = {
      ...data, k: CRM.key, u, p: location.pathname, h: location.host, lp: location.pathname,
      rf: document.referrer || '', gc: q.get('gclid') || '', fc: q.get('fbclid') || '',
      dv: innerWidth < 768 ? 'm' : innerWidth < 1100 ? 't' : 'd',
    };
    const r = await fetch(CRM.origin + '/api/t/lead', {
      method: 'POST', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify(body),
    }).then((x) => x.json());
    if (r && r.error) throw new Error(r.error);
    return r;
  }
  window.IV_CRM = { sendLead };
})();
