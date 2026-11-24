// Formulář na landing page Investiční volba.
// Po odeslání se kontakt předá do CRM (crm.js). Odkaz na PDF (data-pdf) se ukáže jen, když CRM poptávku přijme.

const form = document.getElementById('leadForm');
const thanks = document.getElementById('thanks');

const rules = {
  name: (v) => v.trim().length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
  phone: (v) => !v.trim() || v.replace(/[^\d]/g, '').length >= 9,
};

function validate() {
  let ok = true;
  for (const [field, test] of Object.entries(rules)) {
    const input = form.elements[field];
    const valid = test(input.value);
    input.closest('.field').classList.toggle('invalid', !valid);
    if (!valid) ok = false;
  }
  return ok;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validate()) {
    form.querySelector('.invalid input')?.focus();
    return;
  }

  const answers = [...form.querySelectorAll('select')]
    .map((s) => `${s.getAttribute('aria-label')}: ${s.value || '—'}`)
    .join('\n');

  const lead = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    phone: form.elements.phone.value.trim(),
    consent: true,
    formular: form.dataset.formular,
    message: answers,
  };

  const btn = form.querySelector('button[type="submit"]');
  const btnHtml = btn.innerHTML;
  btn.disabled = true;
  btn.textContent = 'Odesílám…';
  showError('');

  // PDF a poděkování jen tehdy, když CRM poptávku opravdu přijme. Jinak zůstane vyplněný formulář a hláška.
  try {
    if (!window.IV_CRM?.sendLead) throw new Error('crm.js se nenačetl');
    await window.IV_CRM.sendLead(lead);
  } catch (err) {
    console.error('Odeslání kontaktu do CRM selhalo', err);
    btn.disabled = false;
    btn.innerHTML = btnHtml;
    showError('Odeslání se nepovedlo. Zkuste to prosím znovu, nebo nám napište na <a href="mailto:info@investicnivolba.cz">info@investicnivolba.cz</a>.');
    return;
  }

  form.hidden = true;
  thanks.hidden = false;
  thanks.querySelector('a').href = form.dataset.pdf;
  thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

function showError(html) {
  let box = form.querySelector('.form-error');
  if (!box) {
    box = document.createElement('p');
    box.className = 'form-error';
    box.setAttribute('role', 'alert');
    form.querySelector('button[type="submit"]').insertAdjacentElement('afterend', box);
  }
  box.innerHTML = html;
  box.hidden = !html;
}

form.addEventListener('input', (e) => {
  e.target.closest('.field')?.classList.remove('invalid');
});
