const API_URL = "https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev";
const token = localStorage.getItem("idToken");

async function loadReports() {
  await Promise.all([loadTopProducts(), updateSalesPeriod(), loadLowStockProducts()]);
}

async function loadTopProducts() {
  try {
    const res = await fetch(`${API_URL}/vendas`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
      });

    if (!res.ok) throw new Error("Erro ao buscar vendas");
    const sales = await res.json();

    // Calcular produtos mais vendidos
    const productSales = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productSales[item.productName]) {
          productSales[item.productName] = {
            name: item.productName,
            totalQuantity: 0,
            totalRevenue: 0,
          };
        }
        productSales[item.productName].totalQuantity += item.quantity;
        productSales[item.productName].totalRevenue += item.quantity * item.unitPrice;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    const tbody = document.getElementById("topProductsBody");
    tbody.innerHTML = "";

    if (topProducts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3">Nenhuma venda registrada</td></tr>';
      return;
    }

    topProducts.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.totalQuantity}</td>
        <td>${formatCurrency(product.totalRevenue)}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos mais vendidos:", err);
  }
}

async function updateSalesPeriod() {
  try {
    const days = Number.parseInt(document.getElementById("periodFilter").value);

    const res = await fetch(`${API_URL}/vendas`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
      });

    if (!res.ok) throw new Error("Erro ao buscar vendas");
    const sales = await res.json();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const periodSales = sales.filter(sale => new Date(sale.dateTime || sale.date) >= cutoffDate);

    const totalSalesCount = periodSales.length;
    const totalRevenue = periodSales.reduce((sum, sale) => sum + (sale.totalValue || 0), 0);

    document.getElementById("totalSalesCount").textContent = totalSalesCount;
    document.getElementById("totalRevenue").textContent = formatCurrency(totalRevenue);
  } catch (err) {
    console.error("Erro ao atualizar vendas do período:", err);
  }
}

async function loadLowStockProducts() {
  try {
    const res = await fetch(`${API_URL}/produtos`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
      });

    if (!res.ok) throw new Error("Erro ao buscar produtos");
    const products = await res.json();

    const lowStockThreshold = 10;
    const lowStockProducts = products.filter(product => product.quantity <= lowStockThreshold);

    const tbody = document.getElementById("lowStockBody");
    tbody.innerHTML = "";

    if (lowStockProducts.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4">Todos os produtos têm estoque adequado</td></tr>';
      return;
    }

    lowStockProducts.forEach(product => {
      const status = product.quantity === 0 ? "Sem estoque" : "Estoque baixo";
      const statusClass = product.quantity === 0 ? "status-zero" : "status-low";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.name}</td>
        <td>${product.category || "-"}</td>
        <td>${product.quantity}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos com estoque baixo:", err);
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadReports();

  document.getElementById("periodFilter").addEventListener("change", updateSalesPeriod);
});
