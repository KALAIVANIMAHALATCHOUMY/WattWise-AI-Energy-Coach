const CEA_FACTOR_KG_PER_KWH = 0.70; // Rounded demo assumption; replace with the selected CEA database factor for a production analysis.
const DEMO = { home: 'Ananya’s home', kwh: 386, previousKwh: 420, source: 'Demo home · updated just now', mix: [34, 25, 18, 12, 11] };
// Set this to the deployed SAM API URL to enable Bedrock/Strands chat and server-side analysis.
const WATTWISE_API_URL = '';
const APPLIANCES = [
  { name: 'Cooling', icon: '❋', color: '#759b66', share: .34, label: 'AC · fans' },
  { name: 'Water heating', icon: '♨', color: '#bdd88b', share: .25, label: 'Geyser' },
  { name: 'Refrigeration', icon: '▣', color: '#eccf80', share: .18, label: 'Fridge' },
  { name: 'Water pump', icon: '◉', color: '#e7a47f', share: .12, label: 'Pump' },
  { name: 'Other', icon: '⌂', color: '#d9e5d4', share: .11, label: 'Lights & more' }
];
const TRANSLATIONS = {
  en: { cooling: 'Cooling is your largest estimated energy use at {share}% ({kwh} kWh this month). Try setting the AC to 24–26°C and using a fan alongside it. Your estimate is based on the uploaded or demo meter pattern, not appliance sensors.', bill: 'Your estimated monthly bill is ₹{bill}, based on a simple illustrative rate. Your actual bill depends on your state tariff, fixed charges and subsidies. The biggest modeled opportunity is {action}, at about ₹{saving}/month.', solar: 'Solar payback depends on your roof, local installer quote, net-metering rules and daytime use. WattWise does not have a verified quote for your home yet, so I can’t promise a payback. Check the PM Surya Ghar portal and get a site survey before deciding.', generic: 'Your estimated use is {kwh} kWh this month. The modeled top action is {action}, with potential savings near ₹{saving}/month. These are estimates from an aggregate meter pattern, so please verify the appliance labels and your utility tariff.' },
  hi: { cooling: 'आपके घर में अनुमानित रूप से सबसे अधिक ऊर्जा कूलिंग में लगती है: {share}% ({kwh} kWh इस महीने)। AC को 24–26°C पर रखें और साथ में पंखा चलाएँ। यह अनुमान मीटर पैटर्न पर आधारित है, अलग-अलग उपकरणों के सेंसर पर नहीं।', bill: 'आपका अनुमानित मासिक बिल ₹{bill} है। यह केवल एक उदाहरण दर पर आधारित है; वास्तविक बिल राज्य की दरों, शुल्क और सब्सिडी पर निर्भर करता है। सबसे बड़ा अनुमानित अवसर {action} है, लगभग ₹{saving}/माह।', solar: 'सोलर की लागत-वसूली छत, स्थानीय कीमत, नेट-मीटरिंग नियम और दिन के उपयोग पर निर्भर करती है। अभी आपके घर के लिए सत्यापित कोट उपलब्ध नहीं है, इसलिए मैं लागत-वसूली का वादा नहीं कर सकता। निर्णय से पहले साइट सर्वे कराएँ।', generic: 'इस महीने आपका अनुमानित उपयोग {kwh} kWh है। मॉडल के अनुसार सबसे अच्छा कदम {action} है, जिससे लगभग ₹{saving}/माह बच सकते हैं। मीटर पैटर्न से मिले अनुमान को उपयोगिता दर और उपकरणों से जाँचें।' },
  ta: { cooling: 'உங்கள் வீட்டில் மதிப்பிடப்பட்ட அதிக மின்சாரப் பயன்பாடு குளிரூட்டலுக்காக உள்ளது: {share}% ({kwh} kWh இந்த மாதம்). AC-ஐ 24–26°C-ல் வைத்து, விசிறியையும் பயன்படுத்திப் பாருங்கள். இந்த மதிப்பீடு மொத்த மீட்டர் தரவை அடிப்படையாகக் கொண்டது; தனி சாதன சென்சார்கள் அல்ல.', bill: 'உங்கள் மதிப்பிடப்பட்ட மாதாந்திர கட்டணம் ₹{bill}. இது எடுத்துக்காட்டு மின்கட்டண விகிதத்தைப் பயன்படுத்துகிறது; உண்மையான கட்டணம் மாநில விகிதம், நிலையான கட்டணம் மற்றும் மானியங்களைப் பொறுத்தது. அதிக வாய்ப்புள்ள மாற்றம் {action}, சுமார் ₹{saving}/மாதம்.', solar: 'சூரிய மின்சாரத்தின் முதலீட்டுத் திருப்பம் கூரை, உள்ளூர் விலை, நெட் மீட்டரிங் விதிகள் மற்றும் பகல் நேரப் பயன்பாட்டைப் பொறுத்தது. உங்கள் வீட்டிற்கான சரிபார்க்கப்பட்ட விலை எங்களிடம் இல்லை; ஆகவே திருப்பத்தை உறுதி செய்ய முடியாது. முடிவெடுக்கும் முன் தள ஆய்வு பெறுங்கள்.', generic: 'இந்த மாதம் உங்கள் மதிப்பிடப்பட்ட பயன்பாடு {kwh} kWh. மாதிரியில் சிறந்த மாற்றம் {action}; சுமார் ₹{saving}/மாதம் சேமிக்கலாம். இது மொத்த மீட்டர் தரவிலிருந்து கிடைக்கும் மதிப்பீடு என்பதால், சாதனங்களையும் மின்கட்டணத்தையும் சரிபார்க்கவும்.' }
};
let state = { ...DEMO };
const fmt = n => Math.round(n).toLocaleString('en-IN');
function money(n) { return `₹${fmt(n)}`; }
function monthlyBill(kwh) { return kwh * 5.65; } // Explicit illustrative blended rate, not an official tariff.
function actionsFor(kwh, shares) {
  const rate = 5.65;
  const ac = kwh * shares[0] / 100;
  const geyser = kwh * shares[1] / 100;
  const fridge = kwh * shares[2] / 100;
  return [
    { icon: '❋', tag: 'EASIEST WIN', title: 'Give your AC a gentler setting', text: 'Set it to 24–26°C and pair it with a fan. A small temperature change can reduce cooling energy.', saving: ac * .12 * rate, co2: ac * .12 * CEA_FACTOR_KG_PER_KWH, hint: 'About 12% less cooling energy' },
    { icon: '♨', tag: 'SHIFT THE TIME', title: 'Heat water before the evening rush', text: 'Use a timer to heat water earlier, then switch the geyser off. Never leave it unattended.', saving: geyser * .15 * rate, co2: geyser * .15 * CEA_FACTOR_KG_PER_KWH, hint: 'Modeled 15% lower geyser use' },
    { icon: '▣', tag: 'QUICK CHECK', title: 'Give your fridge room to breathe', text: 'Keep the rear vents clear and check that the door seal closes tightly.', saving: fridge * .08 * rate, co2: fridge * .08 * CEA_FACTOR_KG_PER_KWH, hint: 'Modeled 8% lower fridge use' }
  ].sort((a, b) => b.saving - a.saving);
}
function render() {
  const bill = monthlyBill(state.kwh);
  const shares = state.mix || DEMO.mix;
  const acts = actionsFor(state.kwh, shares);
  const potential = acts.reduce((sum, a) => sum + a.saving, 0);
  const co2 = state.kwh * CEA_FACTOR_KG_PER_KWH;
  document.getElementById('home-name').textContent = state.home;
  document.getElementById('sync-label').textContent = state.source;
  document.getElementById('usage-value').textContent = fmt(state.kwh);
  document.getElementById('donut-total').textContent = fmt(state.kwh);
  document.getElementById('bill-value').textContent = fmt(bill);
  document.getElementById('carbon-value').textContent = fmt(co2);
  document.getElementById('potential-value').textContent = fmt(potential);
  document.getElementById('banner-savings').textContent = money(potential);
  document.getElementById('donut').style.background = `conic-gradient(${APPLIANCES.map((a, i) => `${a.color} ${shares.slice(0, i).reduce((x,y)=>x+y,0)}% ${shares.slice(0,i+1).reduce((x,y)=>x+y,0)}%`).join(',')})`;
  document.getElementById('legend').innerHTML = APPLIANCES.map((a, i) => `<div class="legend-item"><i class="legend-dot" style="background:${a.color}"></i><span>${a.name}</span><strong>${fmt(state.kwh * shares[i] / 100)} kWh</strong></div>`).join('');
  document.getElementById('actions-grid').innerHTML = acts.map((a, i) => `<article class="action-card"><div class="action-top"><span class="action-icon">${a.icon}</span><span class="action-tag">${a.tag}</span></div><h3>${a.title}</h3><p>${a.text}</p><div class="action-bottom"><span class="save-amount">${money(a.saving)} <small>/ month</small></span><button class="action-btn" data-action="${i}">How to do it →</button></div></article>`).join('');
  document.querySelectorAll('.action-btn').forEach(button => button.addEventListener('click', () => toast(acts[button.dataset.action].hint + '. Savings are estimates, not a guarantee.')));
  drawBars(state.kwh);
}
function drawBars(kwh) {
  const target = document.getElementById('bar-chart');
  const base = [22, 34, 26, 38, 57, 86, 75, 48, 31, 38, 66, 49, 29, 19];
  target.innerHTML = base.map((value, i) => `<div class="bar-group ${i===5||i===6?'peak':''}"><i class="bar" style="height:${Math.max(6,value * Math.min(1.15,kwh/386))}%"></i><i class="bar" style="height:${Math.max(5,value*.72 * Math.min(1.15,kwh/386))}%"></i></div>`).join('');
}
function toast(message) { const t = document.getElementById('toast'); t.textContent = message; t.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 3600); }
function coachAnswer(question) {
  const q = question.toLowerCase(); const acts = actionsFor(state.kwh, state.mix || DEMO.mix); const top = acts[0];
  const lang = document.getElementById('language-select').value;
  const key = /solar|सोलर|சூரிய/.test(q) ? 'solar' : /bill|high|expensive|महंगा|बिल|கட்டணம்|அதிகம்/.test(q) ? 'bill' : /cool|ac|कूल|एसी|குளிர்|ஏசி/.test(q) ? 'cooling' : 'generic';
  const share = (state.mix || DEMO.mix)[0];
  const fills = { kwh: fmt(state.kwh), bill: fmt(monthlyBill(state.kwh)), share: share, action: top.title, saving: fmt(top.saving) };
  return TRANSLATIONS[lang][key].replace(/\{(\w+)\}/g, (_, name) => fills[name] ?? '');
}
async function answer(q) {
  const reply = document.getElementById('chat-reply'); reply.textContent = 'Thinking…'; reply.classList.add('visible');
  if (WATTWISE_API_URL) {
    try {
      const response = await fetch(`${WATTWISE_API_URL.replace(/\/$/, '')}/chat`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question: q, kwh_month: state.kwh, language: document.getElementById('language-select').value }) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Coach is unavailable');
      reply.textContent = data.answer; return;
    } catch (error) { reply.textContent = `Live coach unavailable: ${error.message}. Showing the local estimate instead. ` + coachAnswer(q); return; }
  }
  reply.textContent = coachAnswer(q);
}
function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 3) throw new Error('Please include a header and at least two readings.');
  const delimiter = lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map(s => s.trim().toLowerCase().replace(/["']/g, ''));
  const ti = headers.findIndex(h => /time|date|timestamp/.test(h));
  const pi = headers.findIndex(h => /power|watt|kw|load|reading/.test(h));
  if (ti < 0 || pi < 0) throw new Error('Could not find time and power columns. Use timestamp,power_w.');
  const rows = lines.slice(1).map(line => line.split(delimiter)).map(row => ({ time: new Date(row[ti]?.trim().replace(/["']/g,'')), power: Number(row[pi]?.trim().replace(/["']/g,'')) })).filter(r => !Number.isNaN(+r.time) && Number.isFinite(r.power));
  if (rows.length < 2) throw new Error('No valid timestamp and power readings found.');
  rows.sort((a,b) => a.time - b.time);
  const dtHours = (rows[rows.length - 1].time - rows[0].time) / (rows.length - 1) / 3600000;
  if (dtHours <= 0 || dtHours > 24) throw new Error('Readings need a regular interval of 24 hours or less.');
  const avg = rows.reduce((n,r)=>n+r.power,0)/rows.length;
  // Assume watts above 20 are W, otherwise kW. Extrapolate observed average to a 30-day month.
  const kW = avg > 20 ? avg / 1000 : avg;
  const observedDays = Math.max((rows.at(-1).time - rows[0].time)/86400000 + dtHours/24, dtHours/24);
  const monthly = Math.max(1, kW * 24 * 30);
  return { kwh: monthly, rows, observedDays, totalObserved: kW * dtHours * rows.length };
}
document.getElementById('upload-button').addEventListener('click', () => document.getElementById('csv-input').click());
document.getElementById('csv-input').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    const parsed = parseCsv(await file.text());
    state = { home: 'Your home', kwh: parsed.kwh, previousKwh: parsed.kwh, source: `${file.name} · ${parsed.rows.length} readings`, mix: [34,25,18,12,11] };
    render(); toast(`Analyzed ${parsed.rows.length} readings. Appliance shares are indicative estimates.`);
  } catch (error) { toast(error.message); }
  event.target.value = '';
});
document.getElementById('refresh-button').addEventListener('click', () => { state = {...DEMO}; render(); toast('Demo home analysis refreshed.'); });
document.getElementById('chat-form').addEventListener('submit', event => { event.preventDefault(); const input = document.getElementById('chat-input'); if (!input.value.trim()) return; answer(input.value.trim()); input.value = ''; });
document.querySelectorAll('.chat-prompts button').forEach(button => button.addEventListener('click', () => answer(button.textContent)));
document.querySelector('.banner-close').addEventListener('click', () => document.querySelector('.banner').remove());
render();
