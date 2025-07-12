const API_URL = "https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev/produtos";
const CATEGORIES_API_URL = "https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev/categorias";

let products = [];
let editingProductId = null;

async function loadProducts() {
  try {
    const response = await fetch(API_URL);
    products = await response.json();

    const tbody = document.getElementById("productsTableBody");
    tbody.innerHTML = "";

    products.forEach((product) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${product.productId}</td>
        <td>${product.name}</td>
        <td>${product.category}</td>
        <td>${product.quantity}</td>
        <td>${formatCurrency(product.price)}</td>
        <td>${formatDate(product.createdAt)}</td>
        <td class="action-buttons">
            <button class="btn btn-small btn-secondary" onclick="editProduct('${product.productId}')">Editar</button>
            <button class="btn btn-small btn-danger" onclick="deleteProduct('${product.productId}')">Excluir</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Erro ao carregar produtos:", err);
    alert("Erro ao carregar produtos.");
  }
}

async function loadCategories() {
  try {
    const response = await fetch(CATEGORIES_API_URL);
    categories = await response.json();

    const select = document.getElementById("productCategory");
    select.innerHTML = '<option value="">Selecione uma categoria</option>';

    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar categorias:", err);
    alert("Erro ao carregar categorias.");
  }
}

function openProductModal(productId = null) {
  editingProductId = productId;
  const modal = document.getElementById("productModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("productForm");

  if (productId) {
    const product = products.find((p) => p.productId === productId);
    modalTitle.textContent = "Editar Produto";
    document.getElementById("productName").value = product.name;
    document.getElementById("productCategory").value = product.category;
    document.getElementById("productQuantity").value = product.quantity;
    document.getElementById("productPrice").value = product.price;
  } else {
    modalTitle.textContent = "Novo Produto";
    form.reset();
  }

  modal.style.display = "block";
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none";
  editingProductId = null;
}

async function saveProduct(productData) {
  try {
    if (editingProductId) {
      // PUT
      const response = await fetch(API_URL, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: editingProductId, ...productData }),
      });

      if (!response.ok) throw new Error("Erro ao atualizar produto");
    } else {
      // POST
      const newProduct = {
        ...productData,
        productId: generateUniqueId(),
        createdAt: new Date().toISOString(),
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
      });

      if (!response.ok) throw new Error("Erro ao cadastrar produto");
    }

    await loadProducts();
    closeProductModal();
  } catch (err) {
    console.error("Erro ao salvar produto:", err);
    alert("Falha ao salvar produto.");
  }
}

function editProduct(productId) {
  openProductModal(productId);
}

async function deleteProduct(productId) {
  if (!confirm("Tem certeza que deseja excluir este produto?")) return;

  try {
    const response = await fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });

    if (!response.ok) throw new Error("Erro ao excluir produto");

    await loadProducts();
  } catch (err) {
    console.error("Erro ao excluir produto:", err);
    alert("Falha ao excluir produto.");
  }
}

function generateUniqueId() {
  return "prod-" + Math.random().toString(36).substr(2, 9);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR");
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();
  loadCategories();

  const productForm = document.getElementById("productForm");
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      quantity: parseInt(formData.get("quantity")),
      price: parseFloat(formData.get("price")),
    };

    saveProduct(productData);
  });

  window.addEventListener("click", (e) => {
    const modal = document.getElementById("productModal");
    if (e.target === modal) {
      closeProductModal();
    }
  });
});
