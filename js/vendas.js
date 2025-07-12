let sales = [];
let currentSaleItems = [];
let products = [];
let editingSaleId = null;

async function fetchSalesFromAPI() {
  try {
    const res = await fetch("https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev/vendas");
    const data = await res.json();
    sales = data;
  } catch (err) {
    alert("Erro ao carregar vendas.");
    console.error(err);
  }
}

async function fetchProductsFromAPI() {
  try {
    const res = await fetch("https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev/produtos");
    const data = await res.json();
    products = data;
  } catch (err) {
    alert("Erro ao carregar produtos.");
    console.error(err);
  }
}

async function loadSales() {
  await fetchSalesFromAPI();

  const tbody = document.getElementById("salesTableBody");
  tbody.innerHTML = "";

  sales.forEach((sale) => {
    const row = document.createElement("tr");
    const itemsText = sale.items.map((item) => `${item.productName} (${item.quantity}x)`).join(", ");

    row.innerHTML = `
      <td>${sale.saleId}</td>
      <td>${formatDateTime(sale.dateTime)}</td>
      <td>${itemsText}</td>
      <td>${formatCurrency(sale.totalValue)}</td>
      <td class="action-buttons">
        <button class="btn btn-small btn-secondary" onclick="editSale('${sale.saleId}')">Editar</button>
        <button class="btn btn-small btn-danger" onclick="deleteSale('${sale.saleId}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function loadProductsForSale() {
  const select = document.getElementById("saleProduct");
  select.innerHTML = '<option value="">Selecione um produto</option>';

  products.forEach((product) => {
    if (product.quantity > 0) {
      const option = document.createElement("option");
      option.value = product.productId;
      option.textContent = `${product.name} (Estoque: ${product.quantity})`;
      option.dataset.price = product.price;
      option.dataset.stock = product.quantity;
      select.appendChild(option);
    }
  });
}

function openSaleModal() {
  const modal = document.getElementById("saleModal");
  const form = document.getElementById("saleForm");

  if (!editingSaleId) {
    // Se não estiver editando, limpa a lista para nova venda
    currentSaleItems = [];
    form.reset();
  }

  updateSaleItemsTable();
  updateSaleTotal();
  loadProductsForSale();

  modal.style.display = "block";
}

function closeSaleModal() {
  document.getElementById("saleModal").style.display = "none";
  currentSaleItems = [];
  editingSaleId = null;
}

function addSaleItem() {
  const productSelect = document.getElementById("saleProduct");
  const quantityInput = document.getElementById("saleQuantity");

  const productId = productSelect.value;
  const quantity = Number.parseInt(quantityInput.value);

  if (!productId || !quantity || quantity <= 0) {
    alert("Selecione um produto e informe uma quantidade válida.");
    return;
  }

  const product = products.find((p) => p.productId === productId);
  const availableStock = product.quantity;

  if (quantity > availableStock) {
    alert(`Quantidade indisponível. Estoque atual: ${availableStock}`);
    return;
  }

  const existingItemIndex = currentSaleItems.findIndex((item) => item.productId === productId);

  if (existingItemIndex >= 0) {
    const totalQuantity = currentSaleItems[existingItemIndex].quantity + quantity;
    if (totalQuantity > availableStock) {
      alert(`Quantidade total excede o estoque disponível: ${availableStock}`);
      return;
    }
    currentSaleItems[existingItemIndex].quantity = totalQuantity;
  } else {
    currentSaleItems.push({
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
    });
  }

  updateSaleItemsTable();
  updateSaleTotal();

  productSelect.value = "";
  quantityInput.value = "1";
}

function removeSaleItem(index) {
  currentSaleItems.splice(index, 1);
  updateSaleItemsTable();
  updateSaleTotal();
}

function updateSaleItemsTable() {
  const tbody = document.getElementById("saleItemsBody");
  tbody.innerHTML = "";

  currentSaleItems.forEach((item, index) => {
    const subtotal = item.quantity * item.unitPrice;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.unitPrice)}</td>
      <td>${formatCurrency(subtotal)}</td>
      <td>
        <button class="btn btn-small btn-danger" onclick="removeSaleItem(${index})">Remover</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function updateSaleTotal() {
  const total = currentSaleItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  document.getElementById("saleTotal").textContent = formatCurrency(total).replace("R$ ", "");
}

async function saveSale() {
  if (currentSaleItems.length === 0) {
    alert("Adicione pelo menos um item à venda.");
    return;
  }

  const total = currentSaleItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const sale = {
    saleId: editingSaleId || crypto.randomUUID(),
    dateTime: new Date().toISOString(),
    items: currentSaleItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    totalValue: total,
  };

  const method = editingSaleId ? "PUT" : "POST";

  try {
    const res = await fetch("https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev/vendas", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sale),
    });

    if (!res.ok) throw new Error("Erro ao salvar venda");

    await loadSales();
    closeSaleModal();
    alert("Venda " + (editingSaleId ? "atualizada" : "realizada") + " com sucesso!");
  } catch (err) {
    alert("Erro ao salvar venda.");
    console.error(err);
  } finally {
    editingSaleId = null;
  }
}

function viewSale(saleId) {
  const sale = sales.find((s) => s.saleId === saleId);
  if (!sale) return;

  const itemsDetails = sale.items
    .map((item) => `${item.productName}: ${item.quantity}x ${formatCurrency(item.unitPrice)} = ${formatCurrency(item.quantity * item.unitPrice)}`)
    .join("\n");

  alert(
    `Detalhes da Venda\n\nData: ${formatDateTime(sale.dateTime)}\n\nItens:\n${itemsDetails}\n\nTotal: ${formatCurrency(sale.totalValue)}`
  );
}

function editSale(saleId) {
  editingSaleId = saleId;
  const sale = sales.find((s) => s.saleId === saleId);
  if (!sale) return;

  currentSaleItems = sale.items.map((item) => ({
    productId: products.find((p) => p.name === item.productName)?.productId || "",
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice
  }));

  openSaleModal();
  updateSaleItemsTable();
  updateSaleTotal();

  // Não remova do array local, a atualização é pelo backend
}

async function deleteSale(saleId) {
  if (!confirm("Tem certeza que deseja excluir esta venda?")) return;

  try {
    const res = await fetch(`https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev/vendas?saleId=${encodeURIComponent(saleId)}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Erro ao excluir venda");

    alert("Venda excluída com sucesso!");
    await loadSales();
  } catch (err) {
    alert("Erro ao excluir venda.");
    console.error(err);
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDateTime(dateString) {
  return new Date(dateString).toLocaleString("pt-BR");
}

document.addEventListener("DOMContentLoaded", async () => {
  await fetchProductsFromAPI();
  await loadSales();

  const saleForm = document.getElementById("saleForm");
  saleForm.addEventListener("submit", (e) => {
    e.preventDefault();
    saveSale();
  });

  window.addEventListener("click", (e) => {
    const modal = document.getElementById("saleModal");
    if (e.target === modal) {
      closeSaleModal();
    }
  });
});
