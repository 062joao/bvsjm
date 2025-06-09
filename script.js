// Equipment data
const equipmentData = [
  { referencia: "401020", equipamento: "ESFIGNOMANOMETRO ANEROIDE MANUAL", id: 1 },
  { referencia: "401021", equipamento: "ESTETOSCÓPIO", id: 2 },
  { referencia: "401027", equipamento: "OXÍMETRO", id: 3 },
  { referencia: "401022", equipamento: "ESFIGNOMANOMETRO DIGITAL", id: 4 },
  { referencia: "401026", equipamento: "MONITOR PARÂMETROS VITAIS HE 6000", id: 5 },
  { referencia: "401050", equipamento: "MONITOR PARÂMETROS VITAIS HE 50", id: 6 },
  { referencia: "401024", equipamento: "TERMÔMETRO DIGITAL", id: 7 },
  { referencia: "401023", equipamento: "TERMÔMETRO DIGITAL INFRAVERMELHOS", id: 8 },
  { referencia: "404024", equipamento: "LANTERNA OBSERVAÇÃO", id: 9 },
  { referencia: "401025", equipamento: "GLICÔMETRO", id: 10 },
  { referencia: "404011", equipamento: "PALHETAS DX", id: 11 },
  { referencia: "404001", equipamento: "ANCETAS DX", id: 12 },
  { referencia: "403001", equipamento: "COMPRESSAS 5X5", id: 13 },
  { referencia: "403017", equipamento: "TUBO OROFARÍNGEO PEDIÁTRICO TAMANHO 000", id: 14 },
  { referencia: "405018", equipamento: "TUBO OROFARÍNGEO PEDIÁTRICO TAMANHO 00", id: 15 },
  { referencia: "405019", equipamento: "TUBO OROFARÍNGEO PEDIÁTRICO TAMANHO 0", id: 16 },
  { referencia: "405020", equipamento: "TUBO OROFARÍNGEO PEDIÁTRICO TAMANHO 1", id: 17 },
  { referencia: "405012", equipamento: "TUBO OROFARÍNGEO ADULTO TAMANHO 1.5", id: 18 },
  { referencia: "405013", equipamento: "TUBO OROFARÍNGEO ADULTO TAMANHO 2", id: 19 },
  { referencia: "405014", equipamento: "TUBO OROFARÍNGEO ADULTO TAMANHO 3", id: 20 },
  { referencia: "405015", equipamento: "TUBO OROFARÍNGEO ADULTO TAMANHO 4", id: 21 },
  { referencia: "405016", equipamento: "TUBO OROFARÍNGEO ADULTO TAMANHO 5", id: 22 },
  { referencia: "---", equipamento: "Tubos nasofaríngeos descartáveis (tamanhos variados)", id: 23 },
  { referencia: "405007", equipamento: "POCKET MASK", id: 24 },
  { referencia: "405021", equipamento: "INSUFLADOR MANUAL ADULTO C/ BALONETE", id: 25 },
  { referencia: "405028", equipamento: "FILTRO INSUFLADOR ADULTO", id: 26 },
  { referencia: "405024", equipamento: "MÁSCARA INSUFLADOR ADULTO TAMANHO 4", id: 27 },
  { referencia: "405025", equipamento: "MÁSCARA INSUFLADOR ADULTO TAMANHO 5", id: 28 },
  { referencia: "----", equipamento: "Tubo conexão", id: 29 },
  { referencia: "405001", equipamento: "MÁSCARAS SIMPLES O2 ADULTO", id: 30 },
  { referencia: "405002", equipamento: "MÁSCARAS ALTO DÉBITO O2 ADULTO", id: 31 },
  { referencia: "405003", equipamento: "CANULAS O2 ADULTO", id: 32 },
  { referencia: "405022", equipamento: "INSUFLADOR MANUAL PEDIÁTRICO C/ BALONETE", id: 33 },
  { referencia: "405028", equipamento: "FILTRO INSUFLADOR PEDIÁTRICO", id: 34 },
  { referencia: "405027", equipamento: "MÁSCARA INSUFLADOR PEDIÁTRICO TAMANHO 2", id: 35 },
  { referencia: "405023", equipamento: "MÁSCARA INSUFLADOR PEDIÁTRICO TAMANHO 3", id: 36 },
  { referencia: "---", equipamento: "Tubo conexão", id: 37 },
  { referencia: "405004", equipamento: "MÁSCARAS SIMPLES O2 PEDIÁTRICO", id: 38 },
  { referencia: "405005", equipamento: "MÁSCARA ALTO DÉBITO O2 PEDIÁTRICO", id: 39 },
  { referencia: "405006", equipamento: "CANULA NASAL PEDIÁTRICO", id: 40 },
  { referencia: "405009", equipamento: "SACOS VÔMITO", id: 41 },
  { referencia: "404025", equipamento: "CONTENTOR CORTANTES", id: 42 },
  { referencia: "---", equipamento: "GARRAFA ÁGUA 250ML", id: 43 },
  { referencia: "---", equipamento: "COPOS PLÁSTICO", id: 44 },
  { referencia: "---", equipamento: "PACOTES AÇÚCAR", id: 45 },
  { referencia: "404019", equipamento: "COBERTURA ISOTÉRMICA PRATA/DOURADO", id: 46 },
  { referencia: "401037", equipamento: "TESOURA", id: 47 }
  // ADICIONAR CASO PRECISE
];

// Constants
const ALERT_DAYS_AHEAD = 30; // days before minimum stock or expiration to alert

// State
let inventory = [];
let sortDescending = true; // default sort referencia descending

// Load from localStorage or init
function loadInventory() {
  const saved = localStorage.getItem('ph_stock_inventory');
  if (saved) {
    try {
      inventory = JSON.parse(saved);
    } catch {
      inventory = [];
    }
  }
  // Merge equipmentData with inventory state to ensure all equipment present
  equipmentData.forEach(eq => {
    if (!inventory.some(item => item.referencia === eq.referencia && item.equipamento === eq.equipamento)) {
      inventory.push({
        referencia: eq.referencia,
        equipamento: eq.equipamento,
        quantidade: 0,
        validade: "",
        mediaMensal: 0,
        id: eq.id,
      });
    }
  });
}

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem('ph_stock_inventory', JSON.stringify(inventory));
  showSaveMessage();
  updateAlerts();
}

// Calculate minimum stock based on average consumption monthly, warning 30 days ahead
// Minimum stock is average monthly usage * (alert days / 30) rounded up
function calcMinStock(avgMonthly) {
  return Math.ceil((avgMonthly * ALERT_DAYS_AHEAD) / 30);
}

// Check expiration date for an item, returns true if expired or near expiry within alert days
function expirationStatus(validade) {
  if (!validade) return "Sem data";
  const now = new Date();
  const expDate = new Date(validade + "T23:59:59"); // treat end of day as expiry
  const diffMs = expDate - now;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "Expirado";
  if (diffDays <= ALERT_DAYS_AHEAD) return "A expirar (" + diffDays + "d)";
  return "Válido";
}

// Generate alerts for items low on stock or close to expiry
function generateAlerts() {
  let alerts = [];
  const now = new Date();
  inventory.forEach(item => {
    const minStock = calcMinStock(item.mediaMensal);
    if (item.quantidade < minStock) {
      alerts.push(⚠️ Stock baixo para <strong>${item.equipamento}</strong>. Mínimo requerido: ${minStock}, em stock: ${item.quantidade}`);
    }
    if (item.validade) {
      const expDate = new Date(item.validade + "T23:59:59");
      const diffMs = expDate - now;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) {
        alerts.push(`❌ Material <strong>${item.equipamento}</strong> está Expirado desde ${item.validade}`);
      } else if (diffDays <= ALERT_DAYS_AHEAD) {
        alerts.push(`⚠️ Material <strong>${item.equipamento}</strong> com validade próxima em ${item.validade} (${diffDays} dias)`);
      }
    }
  });
  return alerts;
}

// Update alerts panel
function updateAlerts() {
  const alertList = document.getElementById('alerts-list');
  alertList.innerHTML = "";
  const alerts = generateAlerts();
  if (alerts.length === 0) {
    const li = document.createElement('li');
    li.textContent = "Sem alertas de stock baixo ou validade próxima.";
    li.className = "success";
    alertList.appendChild(li);
    return;
  }
  alerts.forEach(alert => {
    const li = document.createElement('li');
    li.innerHTML = alert;
    alertList.appendChild(li);
  });
}

// Normalize referencia for sorting (numeric or fallback)
function normalizeRef(ref) {
  // Remove non-digits to interpret numeric refs
  const digits = ref.replace(/\D/g,'');
  if (digits === '') return -Infinity;
  return parseInt(digits);
}

// Build row for each equipment item
function buildTableRow(item, index) {
  const tr = document.createElement('tr');
  // Calculate min stock now
  const minStock = calcMinStock(item.mediaMensal);

  // Status logic
  const expStatus = expirationStatus(item.validade);
  let statusClass = "";
  if (expStatus === "Expirado") statusClass = "expired";
  else if (expStatus.startsWith("A expirar")) statusClass = "alert";
  if (item.quantidade < minStock) statusClass = "stock-low";

  tr.className = statusClass;

  // Reference
  let tdRef = document.createElement('td');
  tdRef.textContent = item.referencia;
  tr.appendChild(tdRef);

  // Equipment Name
  let tdEq = document.createElement('td');
  tdEq.textContent = item.equipamento;
  tdEq.style.textAlign = 'left';
  tr.appendChild(tdEq);

  // Quantity in stock (input)
  let tdQt = document.createElement('td');
  let inputQt = document.createElement('input');
  inputQt.type = 'number';
  inputQt.min = "0";
  inputQt.value = item.quantidade;
  inputQt.setAttribute('aria-label', `Quantidade em stock para ${item.equipamento}`);
  inputQt.addEventListener('change', (e) => {
    const val = parseInt(e.target.value);
    inventory[index].quantidade = isNaN(val) || val < 0 ? 0 : val;
    saveInventory();
    renderTable();
  });
  tdQt.appendChild(inputQt);
  tr.appendChild(tdQt);

  // Expiration date (input)
  let tdVal = document.createElement('td');
  let inputVal = document.createElement('input');
  inputVal.type = 'date';
  inputVal.value = item.validade || "";
  inputVal.setAttribute('aria-label', `Data de validade para ${item.equipamento}`);
  inputVal.addEventListener('change', (e) => {
    inventory[index].validade = e.target.value;
    saveInventory();
    renderTable();
  });
  tdVal.appendChild(inputVal);
  tr.appendChild(tdVal);


  // Monthly average consumption (input)
  let tdAvg = document.createElement('td');
  let inputAvg = document.createElement('input');
  inputAvg.type = 'number';
  inputAvg.min = "0";
  inputAvg.value = item.mediaMensal;
  inputAvg.setAttribute('aria-label', `Média de consumo mensal para ${item.equipamento}`);
  inputAvg.addEventListener('change', e => {
   const val = parseInt(e.target.value);
    inventory[index].mediaMensal = isNaN(val) || val < 0 ? 0 : val;
    saveInventory();
    renderTable();
  }); // <-- Esta chave e parêntese fecham a função anônima e o addEventListener
  tdAvg.appendChild(inputAvg); // Adiciona o input ao td
  tr.appendChild(tdAvg); // Adiciona o td à linha da tabela
} // <-- Esta chave fecha a função buildTableRow (se for a última coisa dentro dela)