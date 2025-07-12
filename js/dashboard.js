const API_BASE = "https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev";

const dashboardData = {
  totalProducts: 0,
  monthSales: 0,
  lowStock: 0,
  totalCategories: 0,
  salesChart: [0, 0, 0, 0, 0, 0, 0], // Últimos 7 dias
};

async function loadDashboardData() {
  try {
    // Buscar produtos
    const produtosRes = await fetch(`${API_BASE}/produtos`);
    const products = produtosRes.ok ? await produtosRes.json() : [];

    // Buscar categorias
    const categoriasRes = await fetch(`${API_BASE}/categorias`);
    const categories = categoriasRes.ok ? await categoriasRes.json() : [];

    // Buscar vendas
    const vendasRes = await fetch(`${API_BASE}/vendas`);
    const sales = vendasRes.ok ? await vendasRes.json() : [];

    dashboardData.totalProducts = products.length;
    dashboardData.totalCategories = categories.length;
    dashboardData.lowStock = products.filter(p => p.quantity < 10).length;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthSales = sales.filter(sale => {
      const saleDate = new Date(sale.dateTime || sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    dashboardData.monthSales = monthSales.reduce((total, sale) => total + (sale.totalValue || 0), 0);

    // Montar gráfico de vendas últimos 7 dias
    const salesChart = Array(7).fill(0);
    const now = new Date();

    sales.forEach(sale => {
      const saleDate = new Date(sale.dateTime || sale.date);
      const diffDays = Math.floor((now - saleDate) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        salesChart[6 - diffDays] += sale.totalValue || 0; // Último dia no índice 6
      }
    });

    dashboardData.salesChart = salesChart;

    updateDashboardUI();
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
  }
}

function updateDashboardUI() {
  document.getElementById("totalProducts").textContent = dashboardData.totalProducts;
  document.getElementById("monthSales").textContent = formatCurrency(dashboardData.monthSales);
  document.getElementById("lowStock").textContent = dashboardData.lowStock;
  document.getElementById("totalCategories").textContent = dashboardData.totalCategories;

  renderSalesChart();
}

function renderSalesChart() {
  const chartContainer = document.getElementById("salesChart");
  chartContainer.innerHTML = "";

  const maxValue = Math.max(...dashboardData.salesChart);

  dashboardData.salesChart.forEach((value, index) => {
    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = maxValue ? `${(value / maxValue) * 100}%` : "0%";
    bar.title = `Dia ${index + 1}: ${formatCurrency(value)}`;
    chartContainer.appendChild(bar);
  });
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Inicializar dashboard
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData();

  // Atualizar dados a cada 30 segundos (em produção, usar WebSocket ou polling menos frequente)
  setInterval(loadDashboardData, 30000);
});
