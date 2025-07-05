// Gerenciamento de categorias
// TODO: Integrar com API REST

let categories = JSON.parse(localStorage.getItem("categories") || "[]")
let editingCategoryId = null

// Inicializar dados de exemplo se não existirem
if (categories.length === 0) {
  categories = [
    { id: 1, name: "Eletrônicos" },
    { id: 2, name: "Roupas" },
    { id: 3, name: "Casa e Jardim" },
    { id: 4, name: "Livros" },
    { id: 5, name: "Esportes" },
  ]
  localStorage.setItem("categories", JSON.stringify(categories))
}

function loadCategories() {
  // TODO: Substituir por chamada à API
  // const response = await fetch('/api/categories');
  // categories = await response.json();

  const tbody = document.getElementById("categoriesTableBody")
  tbody.innerHTML = ""

  categories.forEach((category) => {
    const row = document.createElement("tr")
    row.innerHTML = `
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td class="action-buttons">
                <button class="btn btn-small btn-secondary" onclick="editCategory(${category.id})">Editar</button>
                <button class="btn btn-small btn-danger" onclick="deleteCategory(${category.id})">Excluir</button>
            </td>
        `
    tbody.appendChild(row)
  })
}

function openCategoryModal(categoryId = null) {
  editingCategoryId = categoryId
  const modal = document.getElementById("categoryModal")
  const modalTitle = document.getElementById("modalTitle")
  const form = document.getElementById("categoryForm")

  if (categoryId) {
    const category = categories.find((c) => c.id === categoryId)
    modalTitle.textContent = "Editar Categoria"
    document.getElementById("categoryName").value = category.name
  } else {
    modalTitle.textContent = "Nova Categoria"
    form.reset()
  }

  modal.style.display = "block"
}

function closeCategoryModal() {
  document.getElementById("categoryModal").style.display = "none"
  editingCategoryId = null
}

function saveCategory(categoryData) {
  // TODO: Integrar com API
  // const response = await fetch('/api/categories', {
  //     method: editingCategoryId ? 'PUT' : 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(categoryData)
  // });

  if (editingCategoryId) {
    const index = categories.findIndex((c) => c.id === editingCategoryId)
    categories[index] = { ...categories[index], ...categoryData }
  } else {
    const newCategory = {
      id: Math.max(...categories.map((c) => c.id), 0) + 1,
      ...categoryData,
    }
    categories.push(newCategory)
  }

  localStorage.setItem("categories", JSON.stringify(categories))
  loadCategories()
  closeCategoryModal()
}

function editCategory(id) {
  openCategoryModal(id)
}

function deleteCategory(id) {
  // Verificar se a categoria está sendo usada por algum produto
  const products = JSON.parse(localStorage.getItem("products") || "[]")
  const categoryInUse = products.some((product) => {
    const category = categories.find((c) => c.id === id)
    return product.category === category.name
  })

  if (categoryInUse) {
    alert("Esta categoria não pode ser excluída pois está sendo usada por produtos.")
    return
  }

  if (confirm("Tem certeza que deseja excluir esta categoria?")) {
    // TODO: Integrar com API
    // await fetch(`/api/categories/${id}`, { method: 'DELETE' });

    categories = categories.filter((c) => c.id !== id)
    localStorage.setItem("categories", JSON.stringify(categories))
    loadCategories()
  }
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadCategories()

  const categoryForm = document.getElementById("categoryForm")
  categoryForm.addEventListener("submit", (e) => {
    e.preventDefault()

    const formData = new FormData(e.target)
    const categoryData = {
      name: formData.get("name"),
    }

    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = categories.find(
      (c) => c.name.toLowerCase() === categoryData.name.toLowerCase() && c.id !== editingCategoryId,
    )

    if (existingCategory) {
      alert("Já existe uma categoria com este nome.")
      return
    }

    saveCategory(categoryData)
  })

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("categoryModal")
    if (e.target === modal) {
      closeCategoryModal()
    }
  })
})
