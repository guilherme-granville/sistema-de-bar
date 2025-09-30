 // Elementos principais
 const tbody = document.getElementById('itemsTbody');
 const addItemBtn = document.getElementById('addItemBtn');
 const costsForm = document.getElementById('costsForm');
 const initialInvestmentEl = document.getElementById('initialInvestment');
 const dailyCostsEl = document.getElementById('dailyCosts');
 const monthlyCostsEl = document.getElementById('monthlyCosts');
 const dailyRevenueEl = document.getElementById('dailyRevenue');
 const monthlyRevenueEl = document.getElementById('monthlyRevenue');
 const dailyProfitEl = document.getElementById('dailyProfit');
 const monthlyProfitEl = document.getElementById('monthlyProfit');
 const breakEvenEl = document.getElementById('breakEven');
 const modal = document.getElementById('modal');
 const modalContent = document.getElementById('modalContent');
 const modalCloseBtn = document.getElementById('modalCloseBtn');

 // Carregar dados salvos ou iniciar vazios
 let itemsData = JSON.parse(localStorage.getItem('barPlannerItems')) || [];
let costData = JSON.parse(localStorage.getItem('barPlannerCosts')) || {
  energyCost: 5.00,
  waterCost: 3.00,
  internetCost: 150.00,
  cleaningCost: 20.00,
  numEmployees: 3,
  salaryPerEmployee: 80.00,
  operationalDays: 26,
  rentCost: 2000.00,
  proLabore: 3000.00,
  insuranceCost: 150.00,
  marketingCost: 500.00,
  maintenanceCost: 300.00,
  accountingCost: 400.00,
  otherFixedCosts: 200.00
};

 // Preencher formulário de custos com dados salvos
 Object.keys(costData).forEach(key => {
   const el = document.getElementById(key);
   if (el) el.value = costData[key];
 });

// Salvar custos no localStorage
function saveCosts() {
  costData.energyCost = safeNumber(document.getElementById('energyCost').value);
  costData.waterCost = safeNumber(document.getElementById('waterCost').value);
  costData.internetCost = safeNumber(document.getElementById('internetCost').value);
  costData.cleaningCost = safeNumber(document.getElementById('cleaningCost').value);
  costData.numEmployees = safeNumber(document.getElementById('numEmployees').value);
  costData.salaryPerEmployee = safeNumber(document.getElementById('salaryPerEmployee').value);
  costData.operationalDays = safeNumber(document.getElementById('operationalDays').value) || 26;
  costData.rentCost = safeNumber(document.getElementById('rentCost').value);
  costData.proLabore = safeNumber(document.getElementById('proLabore').value);
  costData.insuranceCost = safeNumber(document.getElementById('insuranceCost').value);
  costData.marketingCost = safeNumber(document.getElementById('marketingCost').value);
  costData.maintenanceCost = safeNumber(document.getElementById('maintenanceCost').value);
  costData.accountingCost = safeNumber(document.getElementById('accountingCost').value);
  costData.otherFixedCosts = safeNumber(document.getElementById('otherFixedCosts').value);
  localStorage.setItem('barPlannerCosts', JSON.stringify(costData));
}

 // Adicionar nova linha na tabela
 function addItemRow(data = {}) {
   const rowIndex = tbody.children.length;
   const item = data.item || '';
   const category = data.category || 'Bebidas';
   const qty = data.qty || 100;
   const buyPrice = data.buyPrice || 3.00;
   const sellPrice = data.sellPrice || 6.00;
   const minStock = data.minStock || 20;
   const maxStock = data.maxStock || 200;
   const avgSales = data.avgSales || 30;

   const row = tbody.insertRow();
   row.dataset.index = rowIndex;
   itemsData[rowIndex] = { item, category, qty, buyPrice, sellPrice, minStock, maxStock, avgSales };

   row.innerHTML = `
     <td><button class="btn-danger" onclick="removeRow(${rowIndex})">Remover</button></td>
     <td><input type="text" value="${item}"></td>
     <td><input type="text" value="${category}"></td>
     <td><input type="number" min="0" step="1" value="${qty}"></td>
     <td><input type="number" min="0" step="0.01" value="${buyPrice.toFixed(2)}"></td>
     <td><input type="number" min="0" step="0.01" value="${sellPrice.toFixed(2)}"></td>
     <td class="costTotal">0,00</td>
     <td><input type="number" min="0" step="1" value="${minStock}"></td>
     <td><input type="number" min="0" step="1" value="${maxStock}"></td>
     <td><input type="number" min="0" step="1" value="${avgSales}"></td>
     <td class="margin">-</td>
     <td class="stockAlert">OK</td>
     <td><button class="btn-primary" onclick="showDetails(${rowIndex})">Ver Detalhes</button></td>
   `;

   // Eventos de input para atualizar
   row.querySelectorAll('input').forEach(input => {
     input.addEventListener('input', debounce(() => {
       const idx = parseInt(row.dataset.index);
       itemsData[idx] = {
         item: row.cells[1].querySelector('input').value,
         category: row.cells[2].querySelector('input').value,
         qty: safeNumber(row.cells[3].querySelector('input').value),
         buyPrice: safeNumber(row.cells[4].querySelector('input').value),
         sellPrice: safeNumber(row.cells[5].querySelector('input').value),
         minStock: safeNumber(row.cells[7].querySelector('input').value),
         maxStock: safeNumber(row.cells[8].querySelector('input').value),
         avgSales: safeNumber(row.cells[9].querySelector('input').value)
       };
       localStorage.setItem('barPlannerItems', JSON.stringify(itemsData));
       updateCalculations();
     }, 300));
   });
 }

 // Remover linha
 function removeRow(index) {
   tbody.deleteRow(index);
   itemsData.splice(index, 1);
   localStorage.setItem('barPlannerItems', JSON.stringify(itemsData));
   updateCalculations();
   refreshTableIndices();
 }

 // Atualizar índices das linhas após remoção
 function refreshTableIndices() {
   Array.from(tbody.children).forEach((row, i) => {
     row.dataset.index = i;
     row.querySelector('button.btn-danger').setAttribute('onclick', `removeRow(${i})`);
     row.querySelector('button.btn-primary').setAttribute('onclick', `showDetails(${i})`);
   });
 }

 // Carregar itens salvos
 itemsData.forEach(addItemRow);
 if (itemsData.length === 0) {
   addItemRow({ item: 'Cerveja Skol 600ml', category: 'Bebidas', qty: 100, buyPrice: 3.00, sellPrice: 6.00, minStock: 20, maxStock: 200, avgSales: 30 });
 }

 // Evento para adicionar novo item
 addItemBtn.addEventListener('click', () => addItemRow());

 // Eventos para custos
 costsForm.addEventListener('input', debounce(() => {
   saveCosts();
   updateCalculations();
 }, 500));

 // Mostrar detalhes no modal
 function showDetails(index) {
   const data = itemsData[index];
   if (!data) return;

  const qty = safeNumber(data.qty);
  const buyPrice = safeNumber(data.buyPrice);
  const sellPrice = safeNumber(data.sellPrice);
  const avgSales = safeNumber(data.avgSales);
  const operationalDays = safeNumber(costData.operationalDays) || 26;

  const margin = sellPrice > 0 && buyPrice > 0 ? ((sellPrice - buyPrice) / buyPrice * 100) : 0;
  const dailyRevenue = avgSales * sellPrice;
  const monthlyRevenue = dailyRevenue * operationalDays;
  const costPerItem = qty * buyPrice;
  const profitPerItem = (sellPrice - buyPrice);
  const dailyProfit = (sellPrice - buyPrice) * avgSales;
  const monthlyProfit = dailyProfit * operationalDays;

  modalContent.innerHTML = `
    <p><strong>Nome do Item:</strong> ${data.item}</p>
    <p><strong>Categoria:</strong> ${data.category}</p>
    <p><strong>Quantidade Inicial:</strong> ${qty}</p>
    <p><strong>Preço de Compra:</strong> R$ ${formatNumber(buyPrice)}</p>
    <p><strong>Preço de Venda:</strong> R$ ${formatNumber(sellPrice)}</p>
    <p><strong>Custo Total do Estoque:</strong> R$ ${formatNumber(costPerItem)}</p>
    <p><strong>Margem de Lucro:</strong> ${formatNumber(margin)}%</p>
    <p><strong>Vendas Médias por Dia:</strong> ${avgSales} unidades</p>
    <p><strong>Lucro por Item Vendido:</strong> R$ ${formatNumber(profitPerItem)}</p>
    <p><strong>Receita Diária Estimada:</strong> R$ ${formatNumber(dailyRevenue)}</p>
    <p><strong>Receita Mensal Estimada:</strong> R$ ${formatNumber(monthlyRevenue)}</p>
    <p><strong>Lucro Diário Estimado:</strong> R$ ${formatNumber(dailyProfit)}</p>
    <p><strong>Lucro Mensal Estimado:</strong> R$ ${formatNumber(monthlyProfit)}</p>
    <p><strong>Status Estoque:</strong> ${qty <= data.minStock ? 'Baixo (Repor)' : 'OK'}</p>
  `;
   modal.style.display = 'flex';
   modal.setAttribute('aria-hidden', 'false');
 }

 // Fechar modal
 modalCloseBtn.addEventListener('click', () => {
   modal.style.display = 'none';
   modal.setAttribute('aria-hidden', 'true');
 });
 modal.addEventListener('click', e => {
   if (e.target === modal) {
     modal.style.display = 'none';
     modal.setAttribute('aria-hidden', 'true');
   }
 });

// Debounce para otimizar performance
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

// Função para formatar números e tratar NaN
function formatNumber(value, decimals = 2) {
  if (isNaN(value) || value === null || value === undefined) {
    return '0,00';
  }
  return parseFloat(value).toFixed(decimals).replace('.', ',');
}

// Função para tratar valores numéricos
function safeNumber(value) {
  const num = parseFloat(value);
  return isNaN(num) ? 0 : num;
}

 // Atualizar todos os cálculos
 function updateCalculations() {
   let totalInvestment = 0;
   let dailyRevenueGlobal = 0;
   let totalAvgSales = 0;
   const rows = tbody.querySelectorAll('tr');

  rows.forEach(row => {
    const qty = safeNumber(row.cells[3].querySelector('input').value);
    const buyPrice = safeNumber(row.cells[4].querySelector('input').value);
    const sellPrice = safeNumber(row.cells[5].querySelector('input').value);
    const minStock = safeNumber(row.cells[7].querySelector('input').value);
    const avgSales = safeNumber(row.cells[9].querySelector('input').value);

     // Custo total
     const totalCost = qty * buyPrice;
     row.cells[6].textContent = formatNumber(totalCost);
     totalInvestment += totalCost;

     // Margem
     const marginPercent = sellPrice > 0 && buyPrice > 0 ? formatNumber(((sellPrice - buyPrice) / buyPrice * 100)) : '-';
     row.cells[10].textContent = marginPercent;

     // Destaques
     row.classList.remove('highlight-high-cost', 'highlight-low-margin', 'highlight-min-stock');
     if (buyPrice > 500) row.classList.add('highlight-high-cost');
     if (marginPercent !== '-' && parseFloat(marginPercent) < 50) row.classList.add('highlight-low-margin');
     if (qty <= minStock && qty > 0) row.classList.add('highlight-min-stock');

     // Alerta estoque
     row.cells[11].textContent = qty <= minStock ? 'Repor' : 'OK';

     // Soma receitas
     if (sellPrice > 0 && avgSales > 0) {
       dailyRevenueGlobal += sellPrice * avgSales;
       totalAvgSales += avgSales;
     }
   });

  // Custos operacionais - usando safeNumber para evitar NaN
  const energy = safeNumber(costData.energyCost);
  const water = safeNumber(costData.waterCost);
  const internet = safeNumber(costData.internetCost);
  const cleaning = safeNumber(costData.cleaningCost);
  const numEmployees = safeNumber(costData.numEmployees);
  const salaryPerEmployee = safeNumber(costData.salaryPerEmployee);
  const operationalDays = safeNumber(costData.operationalDays) || 26; // Default para 26 dias
  const rent = safeNumber(costData.rentCost);
  const proLabore = safeNumber(costData.proLabore);
  const insurance = safeNumber(costData.insuranceCost);
  const marketing = safeNumber(costData.marketingCost);
  const maintenance = safeNumber(costData.maintenanceCost);
  const accounting = safeNumber(costData.accountingCost);
  const otherFixed = safeNumber(costData.otherFixedCosts);

  // Custos diários (energia, água, limpeza, salários)
  const internetDaily = internet / 30;
  const dailyVariableCosts = energy + water + internetDaily + cleaning + (numEmployees * salaryPerEmployee);
  
  // Custos mensais fixos (aluguel, pró-labore, seguro, etc.)
  const monthlyFixedCosts = rent + proLabore + insurance + marketing + maintenance + accounting + otherFixed;
  
  // Custos totais - evitando divisão por zero
  const dailyCosts = dailyVariableCosts + (operationalDays > 0 ? monthlyFixedCosts / operationalDays : 0);
  const monthlyCosts = dailyCosts * operationalDays;
   const monthlyRevenue = dailyRevenueGlobal * operationalDays;
   const monthlyProfit = monthlyRevenue - monthlyCosts;
   const dailyProfit = dailyRevenueGlobal - dailyCosts;
   
   // Cálculo seguro do break-even
   let breakEven = 0;
   if (totalAvgSales > 0 && dailyRevenueGlobal > 0) {
     const avgPricePerItem = dailyRevenueGlobal / totalAvgSales;
     if (avgPricePerItem > 0) {
       breakEven = Math.ceil(dailyCosts / avgPricePerItem);
     }
   }

  // Atualizar resumo usando formatNumber
  initialInvestmentEl.textContent = formatNumber(totalInvestment);
  document.getElementById('dailyVariableCosts').textContent = formatNumber(dailyVariableCosts);
  document.getElementById('monthlyFixedCosts').textContent = formatNumber(monthlyFixedCosts);
  dailyCostsEl.textContent = formatNumber(dailyCosts);
  monthlyCostsEl.textContent = formatNumber(monthlyCosts);
  dailyRevenueEl.textContent = formatNumber(dailyRevenueGlobal);
  monthlyRevenueEl.textContent = formatNumber(monthlyRevenue);
  dailyProfitEl.textContent = formatNumber(dailyProfit);
  monthlyProfitEl.textContent = formatNumber(monthlyProfit);
  breakEvenEl.textContent = breakEven || 0;

  // Atualizar breakdown detalhado usando formatNumber
  document.getElementById('energyDaily').textContent = formatNumber(energy);
  document.getElementById('waterDaily').textContent = formatNumber(water);
  document.getElementById('internetDaily').textContent = formatNumber(internetDaily);
  document.getElementById('cleaningDaily').textContent = formatNumber(cleaning);
  document.getElementById('salariesDaily').textContent = formatNumber(numEmployees * salaryPerEmployee);
  document.getElementById('totalDailyVariable').textContent = formatNumber(dailyVariableCosts);
  
  document.getElementById('rentMonthly').textContent = formatNumber(rent);
  document.getElementById('proLaboreMonthly').textContent = formatNumber(proLabore);
  document.getElementById('insuranceMonthly').textContent = formatNumber(insurance);
  document.getElementById('marketingMonthly').textContent = formatNumber(marketing);
  document.getElementById('maintenanceMonthly').textContent = formatNumber(maintenance);
  document.getElementById('accountingMonthly').textContent = formatNumber(accounting);
  document.getElementById('otherMonthly').textContent = formatNumber(otherFixed);
  document.getElementById('totalMonthlyFixed').textContent = formatNumber(monthlyFixedCosts);

   updateCharts(totalInvestment, monthlyProfit, itemsData);
 }

 // Atualizar gráficos
 let investmentChart, marginChart;

 function updateCharts(investment, profit, items) {
   const ctxInvestment = document.getElementById('investmentChart').getContext('2d');
   const ctxMargin = document.getElementById('marginChart').getContext('2d');

   if (investmentChart) investmentChart.destroy();
   if (marginChart) marginChart.destroy();

  investmentChart = new Chart(ctxInvestment, {
    type: 'bar',
    data: {
      labels: ['Investimento Inicial', 'Lucro Mensal Estimado'],
      datasets: [{
        label: 'R$',
        data: [investment, profit],
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',
          'rgba(118, 75, 162, 0.8)'
        ],
        borderColor: [
          'rgba(102, 126, 234, 1)',
          'rgba(118, 75, 162, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: true,
          labels: {
            font: {
              family: 'Inter',
              size: 12
            }
          }
        },
        tooltip: { 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(102, 126, 234, 0.8)',
          borderWidth: 1,
          callbacks: { 
            label: (context) => `R$ ${context.parsed.y.toFixed(2).replace('.', ',')}` 
          } 
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              family: 'Inter'
            },
            callback: function(value) {
              return 'R$ ' + value.toLocaleString('pt-BR');
            }
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Inter'
            }
          }
        }
      }
    }
  });

  const margins = items.map(i => i.sellPrice > i.buyPrice ? ((i.sellPrice - i.buyPrice) / i.buyPrice * 100) : 0).sort((a, b) => b - a);
  const productLabels = items.map((item, index) => `Produto ${index + 1}`).sort((a, b) => {
    const indexA = parseInt(a.split(' ')[1]) - 1;
    const indexB = parseInt(b.split(' ')[1]) - 1;
    const marginA = items[indexA] ? ((items[indexA].sellPrice - items[indexA].buyPrice) / items[indexA].buyPrice * 100) : 0;
    const marginB = items[indexB] ? ((items[indexB].sellPrice - items[indexB].buyPrice) / items[indexB].buyPrice * 100) : 0;
    return marginB - marginA;
  });
  
  marginChart = new Chart(ctxMargin, {
    type: 'bar',
    data: {
      labels: productLabels,
      datasets: [{
        label: 'Margem (%)',
        data: margins,
        backgroundColor: margins.map((margin, index) => {
          const alpha = 0.6 + (index * 0.1);
          return `rgba(102, 126, 234, ${Math.min(alpha, 0.9)})`;
        }),
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { 
          display: false 
        },
        tooltip: { 
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: 'white',
          bodyColor: 'white',
          borderColor: 'rgba(102, 126, 234, 0.8)',
          borderWidth: 1,
          callbacks: { 
            label: (context) => `${context.parsed.x.toFixed(1).replace('.', ',')}%` 
          } 
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            font: {
              family: 'Inter'
            },
            callback: function(value) {
              return value + '%';
            }
          }
        },
        y: {
          grid: {
            display: false
          },
          ticks: {
            font: {
              family: 'Inter',
              size: 10
            }
          }
        }
      }
    }
  });
 }

 // Inicializar cálculos
 updateCalculations();