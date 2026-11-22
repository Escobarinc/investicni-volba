// Formulář na landing page Investiční volba.
// Po odeslání se kontakt předá do CRM (crm.js) a zobrazí se odkaz na stažení PDF z atributu data-pdf.

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

  const btn = form.querySelector('button');
  btn.disabled = true;
  btn.textContent = 'Odesílám…';

  try {
    await window.IV_CRM.sendLead(lead);
  } catch (err) {
    console.error('Odeslání kontaktu do CRM selhalo', err);
  }

  form.hidden = true;
  thanks.hidden = false;
  thanks.querySelector('a').href = form.dataset.pdf;
  thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

form.addEventListener('input', (e) => {
  e.target.closest('.field')?.classList.remove('invalid');
});
