// app.js
// Base endpoint from the Fawaz Ahmed currency API via jsDelivr CDN.
// Using "latest" so we always get the newest published rates (daily updates).
const API_BASE = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies";

// --- Grab DOM elements ---
const amountInput = document.querySelector("#amount-input");
const fromSelect  = document.querySelector("#from-select");
const toSelect    = document.querySelector("#to-select");
const msg         = document.querySelector("#rate-msg");
const form        = document.querySelector("#converter-form");
const swapBtn     = document.querySelector("#swap-btn");

// --- Populate dropdowns ---
function populateSelect(selectEl, defaultCode){
  selectEl.innerHTML = ""; // clear
  for (const currCode in countryList){
    const opt = document.createElement("option");
    opt.value = currCode;
    opt.textContent = currCode;
    if (currCode === defaultCode) opt.selected = true;
    selectEl.appendChild(opt);
  }
}

populateSelect(fromSelect, "USD");
populateSelect(toSelect,   "LKR");

// --- Update flag helper ---
function updateFlag(selectEl){
  const code = selectEl.value; // e.g., "USD"
  const countryCode = countryList[code]; // e.g., "US"
  const img = selectEl.parentElement.querySelector("img");
  img.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
  img.alt = countryCode;
}

// Initialize flags once after populating
updateFlag(fromSelect);
updateFlag(toSelect);

// Change flags when user changes currency
fromSelect.addEventListener("change", e => updateFlag(e.target));
toSelect  .addEventListener("change", e => updateFlag(e.target));

// --- Swap currencies ---
swapBtn.addEventListener("click", () => {
  const tmp = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = tmp;
  updateFlag(fromSelect);
  updateFlag(toSelect);
  convert(); // auto refresh
});

// --- Fetch + convert ---
async function convert(){
  let amtVal = parseFloat(amountInput.value);
  if (isNaN(amtVal) || amtVal <= 0){
    amtVal = 1;
    amountInput.value = "1";
  }

  const from = fromSelect.value.toLowerCase(); // api uses lowercase codes
  const to   = toSelect.value.toLowerCase();

  // Endpoint returns a JSON object containing all to‑rates from the base currency.
  // Example: GET /usd.json → { "usd": { "lkr": 300.xx, "eur": ... } }
  const url = `${API_BASE}/${from}.json`;

  try {
    msg.textContent = "Loading...";
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Rates are nested under the base currency key.
    const rates = data[from];
    const rate = rates[to];
    if (rate === undefined){
      msg.textContent = "Rate unavailable.";
      return;
    }

    const finalAmount = amtVal * rate;
    // Format numbers
    const fmt = new Intl.NumberFormat(undefined, {maximumFractionDigits:4});
    msg.textContent = `${fmt.format(amtVal)} ${fromSelect.value} = ${fmt.format(finalAmount)} ${toSelect.value}`;
  } catch (err){
    console.error(err);
    msg.textContent = "Conversion failed. Check your connection.";
  }
}

// Run conversion when form submitted
form.addEventListener("submit", e => {
  e.preventDefault();
  convert();
});

// Also auto‑convert when page loads
window.addEventListener("DOMContentLoaded", convert);