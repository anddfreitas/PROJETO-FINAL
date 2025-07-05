// Gerenciamento de relatórios
// TODO: Integrar com API REST

const sales = JSON.parse(localStorage.getItem("sales") || "[]")
const products = JSON.parse(localStorage.getItem("products") || "[]")

function loadReports() {
  loadTopProducts()
  updateSalesPeriod()
  loadLowStockProducts()
}

function loadTopProducts() {
  // TODO: Substituir por chamada à API
  // const response = await fetch('/api/reports/top-products');
  // const topProducts = await response.json();

  // Calcular produtos mais vendidos
  const productSales = {}

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (!productSales[item.productName]) {
        productSales[item.productName] = {
          name: item.productName,
          totalQuantity: 0,
          totalRevenue: 0,
        }
      }
      productSales[item.productName].totalQuantity += item.quantity
      productSales[item.productName].totalRevenue += item.quantity * item.unitPrice
    })
  })

  const topProducts = Object.values(productSales)
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10)

  const tbody = document.getElementById("topProductsBody")
  tbody.innerHTML = ""

  if (topProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">Nenhuma venda registrada</td></tr>'
    return
  }

  topProducts.forEach((product) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.totalQuantity}</td>
            <td>${formatCurrency(product.totalRevenue)}</td>
        `
    tbody.appendChild(row)
  })
}

function updateSalesPeriod() {
  const periodFilter = document.getElementById("periodFilter")
  const days = Number.parseInt(periodFilter.value)

  // TODO: Substituir por chamada à API
  // const response = await fetch(`/api/reports/sales-period?days=${days}`);
  // const periodData = await response.json();

  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)

  const periodSales = sales.filter((sale) => new Date(sale.date) >= cutoffDate)

  const totalSalesCount = periodSales.length
  const totalRevenue = periodSales.reduce((sum, sale) => sum + sale.total, 0)

  document.getElementById("totalSalesCount").textContent = totalSalesCount
  document.getElementById("totalRevenue").textContent = formatCurrency(totalRevenue)
}

function loadLowStockProducts() {
  // TODO: Substituir por chamada à API
  // const response = await fetch('/api/reports/low-stock');
  // const lowStockProducts = await response.json();

  const lowStockThreshold = 10
  const lowStockProducts = products.filter((product) => product.quantity <= lowStockThreshold)

  const tbody = document.getElementById("lowStockBody")
  tbody.innerHTML = ""

  if (lowStockProducts.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">Todos os produtos têm estoque adequado</td></tr>'
    return
  }

  lowStockProducts.forEach((product) => {
    const row = document.createElement("tr")
    const status = product.quantity === 0 ? "Sem estoque" : "Estoque baixo"
    const statusClass = product.quantity === 0 ? "status-low" : "status-low"

    row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
        `
    tbody.appendChild(row)
  })
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadReports()

  const periodFilter = document.getElementById("periodFilter")
  periodFilter.addEventListener("change", updateSalesPeriod)
})
