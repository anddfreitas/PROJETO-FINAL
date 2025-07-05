// Gerenciamento de produtos
// TODO: Integrar com API REST

let products = JSON.parse(localStorage.getItem("products") || "[]")
let categories = JSON.parse(localStorage.getItem("categories") || "[]")
let editingProductId = null

// Inicializar dados de exemplo se não existirem
if (products.length === 0) {
  products = [
    {
      id: 1,
      name: "Notebook Dell",
      category: "Eletrônicos",
      quantity: 15,
      price: 2500.0,
      dateCreated: "2024-01-15",
    },
    {
      id: 2,
      name: "Mouse Logitech",
      category: "Eletrônicos",
      quantity: 5,
      price: 89.9,
      dateCreated: "2024-01-16",
    },
  ]
  localStorage.setItem("products", JSON.stringify(products))
}

if (categories.length === 0) {
  categories = [
    { id: 1, name: "Eletrônicos" },
    { id: 2, name: "Roupas" },
    { id: 3, name: "Casa e Jardim" },
  ]
  localStorage.setItem("categories", JSON.stringify(categories))
}

function loadProducts() {
  // TODO: Substituir por chamada à API
  // const response = await fetch('/api/products');
  // products = await response.json();

  const tbody = document.getElementById("productsTableBody")
  tbody.innerHTML = ""

  products.forEach((product) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${product.id}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td>${formatCurrency(product.price)}</td>
            <td>${formatDate(product.dateCreated)}</td>
            <td class="action-buttons">
                <button class="btn btn-small btn-secondary" onclick="editProduct(${product.id})">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deleteProduct(${product.id})">Excluir</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function loadCategories() {
  const select = document.getElementById("productCategory")
  select.innerHTML = '<option value="">Selecione uma categoria</option>'

  categories.forEach((category) => {
    const option = document.createElement("option")
    option.value = category.name
    option.textContent = category.name
    select.appendChild(option)
  })
}

function openProductModal(productId = null) {
  editingProductId = productId
  const modal = document.getElementById("productModal")
  const modalTitle = document.getElementById("modalTitle")
  const form = document.getElementById("productForm")

  if (productId) {
    const product = products.find((p) => p.id === productId)
    modalTitle.textContent = "Editar Produto"
    document.getElementById("productName").value = product.name
    document.getElementById("productCategory").value = product.category
    document.getElementById("productQuantity").value = product.quantity
    document.getElementById("productPrice").value = product.price
  } else {
    modalTitle.textContent = "Novo Produto"
    form.reset()
  }

  modal.style.display = "block"
}

function closeProductModal() {
  document.getElementById("productModal").style.display = "none"
  editingProductId = null
}

function saveProduct(productData) {
  // TODO: Integrar com API
  // const response = await fetch('/api/products', {
  //     method: editingProductId ? 'PUT' : 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(productData)
  // });

  if (editingProductId) {
    const index = products.findIndex((p) => p.id === editingProductId)
    products[index] = { ...products[index], ...productData }
  } else {
    const newProduct = {
      id: Math.max(...products.map((p) => p.id), 0) + 1,
      ...productData,
      dateCreated: new Date().toISOString().split("T")[0],
    }
    products.push(newProduct)
  }

  localStorage.setItem("products", JSON.stringify(products))
  loadProducts()
  closeProductModal()
}

function editProduct(id) {
  openProductModal(id)
}

function deleteProduct(id) {
  if (confirm("Tem certeza que deseja excluir este produto?")) {
    // TODO: Integrar com API
    // await fetch(`/api/products/${id}`, { method: 'DELETE' });

    products = products.filter((p) => p.id !== id)
    localStorage.setItem("products", JSON.stringify(products))
    loadProducts()
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("pt-BR")
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadProducts()
  loadCategories()

  const productForm = document.getElementById("productForm")
  productForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const productData = {
      name: formData.get("name"),
      category: formData.get("category"),
      quantity: Number.parseInt(formData.get("quantity")),
      price: Number.parseFloat(formData.get("price")),
    }

    saveProduct(productData)
  })

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("productModal")
    if (e.target === modal) {
      closeProductModal()
    }
  })
})
