// Dados mockados para o dashboard
// TODO: Substituir por chamadas reais à API

const dashboardData = {
  totalProducts: 0,
  monthSales: 0,
  lowStock: 0,
  totalCategories: 0,
  salesChart: [120, 150, 180, 200, 170, 190, 220], // Últimos 7 dias
}

function loadDashboardData() {
  // TODO: Fazer chamada real à API
  // const response = await fetch('/api/dashboard');
  // const data = await response.json();

  // Simulação com dados do localStorage
  const products = JSON.parse(localStorage.getItem("products") || "[]")
  const categories = JSON.parse(localStorage.getItem("categories") || "[]")
  const sales = JSON.parse(localStorage.getItem("sales") || "[]")

  dashboardData.totalProducts = products.length
  dashboardData.totalCategories = categories.length
  dashboardData.lowStock = products.filter((p) => p.quantity < 10).length

  // Calcular vendas do mês atual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date)
    return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear
  })

  dashboardData.monthSales = monthSales.reduce((total, sale) => total + sale.total, 0)

  updateDashboardUI()
}

function updateDashboardUI() {
  document.getElementById("totalProducts").textContent = dashboardData.totalProducts
  document.getElementById("monthSales").textContent = formatCurrency(dashboardData.monthSales)
  document.getElementById("lowStock").textContent = dashboardData.lowStock
  document.getElementById("totalCategories").textContent = dashboardData.totalCategories

  renderSalesChart()
}

function renderSalesChart() {
  const chartContainer = document.getElementById("salesChart")
  chartContainer.innerHTML = ""

  const maxValue = Math.max(...dashboardData.salesChart)

  dashboardData.salesChart.forEach((value, index) => {
    const bar = document.createElement("div")
    bar.className = "chart-bar"
    bar.style.height = `${(value / maxValue) * 100}%`
    bar.title = `Dia ${index + 1}: R$ ${value.toFixed(2)}`
    chartContainer.appendChild(bar)
  })
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Inicializar dashboard
document.addEventListener("DOMContentLoaded", () => {
  loadDashboardData()

  // Atualizar dados a cada 30 segundos (em produção, usar WebSocket ou polling menos frequente)
  setInterval(loadDashboardData, 30000)
})
