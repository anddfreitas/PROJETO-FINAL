// Gerenciamento de vendas
// TODO: Integrar com API REST

let sales = JSON.parse(localStorage.getItem("sales") || "[]")
const products = JSON.parse(localStorage.getItem("products") || "[]")
let currentSaleItems = []

// Inicializar dados de exemplo se não existirem
if (sales.length === 0) {
  sales = [
    {
      id: 1,
      date: "2024-01-15T10:30:00",
      items: [{ productName: "Mouse Logitech", quantity: 2, unitPrice: 89.9 }],
      total: 179.8,
    },
    {
      id: 2,
      date: "2024-01-16T14:15:00",
      items: [{ productName: "Notebook Dell", quantity: 1, unitPrice: 2500.0 }],
      total: 2500.0,
    },
  ]
  localStorage.setItem("sales", JSON.stringify(sales))
}

function loadSales() {
  // TODO: Substituir por chamada à API
  // const response = await fetch('/api/sales');
  // sales = await response.json();

  const tbody = document.getElementById("salesTableBody")
  tbody.innerHTML = ""

  sales.forEach((sale) => {
    const row = document.createElement("tr")
    const itemsText = sale.items.map((item) => `${item.productName} (${item.quantity}x)`).join(", ")

    row.innerHTML = `
            <td>${sale.id}</td>
            <td>${formatDateTime(sale.date)}</td>
            <td>${itemsText}</td>
            <td>${formatCurrency(sale.total)}</td>
            <td class="action-buttons">
                <button class="btn btn-small btn-secondary" onclick="viewSale(${sale.id})">Ver Detalhes</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function loadProductsForSale() {
  const select = document.getElementById("saleProduct")
  select.innerHTML = '<option value="">Selecione um produto</option>'

  products.forEach((product) => {
    if (product.quantity > 0) {
      const option = document.createElement("option")
      option.value = product.id
      option.textContent = `${product.name} (Estoque: ${product.quantity})`
      option.dataset.price = product.price
      option.dataset.stock = product.quantity
      select.appendChild(option)
    }
  })
}

function openSaleModal() {
  currentSaleItems = []
  const modal = document.getElementById("saleModal")
  const form = document.getElementById("saleForm")

  form.reset()
  updateSaleItemsTable()
  updateSaleTotal()
  loadProductsForSale()

  modal.style.display = "block"
}

function closeSaleModal() {
  document.getElementById("saleModal").style.display = "none"
  currentSaleItems = []
}

function addSaleItem() {
  const productSelect = document.getElementById("saleProduct")
  const quantityInput = document.getElementById("saleQuantity")

  const productId = Number.parseInt(productSelect.value)
  const quantity = Number.parseInt(quantityInput.value)

  if (!productId || !quantity || quantity <= 0) {
    alert("Selecione um produto e informe uma quantidade válida.")
    return
  }

  const product = products.find((p) => p.id === productId)
  const selectedOption = productSelect.selectedOptions[0]
  const availableStock = Number.parseInt(selectedOption.dataset.stock)

  if (quantity > availableStock) {
    alert(`Quantidade indisponível. Estoque atual: ${availableStock}`)
    return
  }

  // Verificar se o produto já está na lista
  const existingItemIndex = currentSaleItems.findIndex((item) => item.productId === productId)

  if (existingItemIndex >= 0) {
    const totalQuantity = currentSaleItems[existingItemIndex].quantity + quantity
    if (totalQuantity > availableStock) {
      alert(`Quantidade total excede o estoque disponível: ${availableStock}`)
      return
    }
    currentSaleItems[existingItemIndex].quantity = totalQuantity
  } else {
    currentSaleItems.push({
      productId: productId,
      productName: product.name,
      quantity: quantity,
      unitPrice: product.price,
    })
  }

  updateSaleItemsTable()
  updateSaleTotal()

  // Limpar seleção
  productSelect.value = ""
  quantityInput.value = "1"
}

function removeSaleItem(index) {
  currentSaleItems.splice(index, 1)
  updateSaleItemsTable()
  updateSaleTotal()
}

function updateSaleItemsTable() {
  const tbody = document.getElementById("saleItemsBody")
  tbody.innerHTML = ""

  currentSaleItems.forEach((item, index) => {
    const row = document.createElement("tr")
    const subtotal = item.quantity * item.unitPrice

    row.innerHTML = `
            <td>${item.productName}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.unitPrice)}</td>
            <td>${formatCurrency(subtotal)}</td>
            <td>
                <button class="btn btn-small btn-danger" onclick="removeSaleItem(${index})">Remover</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function updateSaleTotal() {
  const total = currentSaleItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  document.getElementById("saleTotal").textContent = formatCurrency(total).replace("R$ ", "")
}

function saveSale() {
  if (currentSaleItems.length === 0) {
    alert("Adicione pelo menos um item à venda.")
    return
  }

  const total = currentSaleItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)

  // TODO: Integrar com API
  // const response = await fetch('/api/sales', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ items: currentSaleItems, total })
  // });

  const newSale = {
    id: Math.max(...sales.map((s) => s.id), 0) + 1,
    date: new Date().toISOString(),
    items: currentSaleItems.map((item) => ({
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    total: total,
  }

  sales.push(newSale)
  localStorage.setItem("sales", JSON.stringify(sales))

  // Atualizar estoque dos produtos
  currentSaleItems.forEach((item) => {
    const productIndex = products.findIndex((p) => p.id === item.productId)
    if (productIndex >= 0) {
      products[productIndex].quantity -= item.quantity
    }
  })
  localStorage.setItem("products", JSON.stringify(products))

  loadSales()
  closeSaleModal()
  alert("Venda realizada com sucesso!")
}

function viewSale(id) {
  const sale = sales.find((s) => s.id === id)
  if (!sale) return

  const itemsDetails = sale.items
    .map(
      (item) =>
        `${item.productName}: ${item.quantity}x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice)}`,
    )
    .join("\n")

  alert(
    `Detalhes da Venda #${sale.id}\n\nData: ${formatDateTime(sale.date)}\n\nItens:\n${itemsDetails}\n\nTotal: ${formatCurrency(sale.total)}`,
  )
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("pt-BR")
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadSales()

  const saleForm = document.getElementById("saleForm")
  saleForm.addEventListener("submit", (e) => {
    e.preventDefault()
    saveSale()
  })

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("saleModal")
    if (e.target === modal) {
      closeSaleModal()
    }
  })
})
