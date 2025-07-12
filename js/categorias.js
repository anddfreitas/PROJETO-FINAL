// Gerenciamento de categorias via API REST
const API_URL = "https://20w8idv45f.execute-api.us-east-1.amazonaws.com/dev";
const token = localStorage.getItem("idToken");

let categories = [];
let editingCategoryId = null;

async function loadCategories() {
  try {
    const res = await fetch(`${API_URL}/categorias`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
      });

    if (!res.ok) throw new Error("Erro ao carregar categorias");
    categories = await res.json();
  } catch (error) {
    alert("Falha ao carregar categorias: " + error.message);
    categories = [];
  }

  const tbody = document.getElementById("categoriesTableBody");
  tbody.innerHTML = "";

  categories.forEach((category) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${category.categoryId}</td>
      <td>${category.name}</td>
      <td class="action-buttons">
        <button class="btn btn-small btn-secondary" onclick="editCategory('${category.categoryId}')">Editar</button>
        <button class="btn btn-small btn-danger" onclick="deleteCategory('${category.categoryId}')">Excluir</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function openCategoryModal(categoryId = null) {
  editingCategoryId = categoryId;
  const modal = document.getElementById("categoryModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("categoryForm");

  if (categoryId) {
    const category = categories.find((c) => c.categoryId === categoryId);
    modalTitle.textContent = "Editar Categoria";
    document.getElementById("categoryName").value = category ? category.name : "";
  } else {
    modalTitle.textContent = "Nova Categoria";
    form.reset();
  }

  modal.style.display = "block";
}

function closeCategoryModal() {
  document.getElementById("categoryModal").style.display = "none";
  editingCategoryId = null;
}

async function saveCategory(categoryData) {
  try {
    if (editingCategoryId) {
      // PUT - Atualizar categoria
      const response = await fetch(`${API_URL}/categorias`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ categoryId: editingCategoryId, ...categoryData }),
      });

      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao atualizar categoria: ${response.status} - ${errorText}`);
      }
    } else {
      // POST - Criar nova categoria
      // Para garantir id único, usamos timestamp. Pode ajustar para outra lógica.
      const newCategory = { categoryId: Date.now().toString(), ...categoryData };
      const response = await fetch(`${API_URL}/categorias`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) throw new Error("Erro ao criar categoria");
    }

    await loadCategories();
    closeCategoryModal();
  } catch (error) {
    alert("Falha ao salvar categoria: " + error.message);
  }
}

async function deleteCategory(categoryId) {
  // Verificar se a categoria está sendo usada por algum produto
  const productsRes = await fetch(`${API_URL}/produtos`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
      });
  const products = productsRes.ok ? await productsRes.json() : [];

  const categoryInUse = products.some((product) => product.categoryId === categoryId);

  if (categoryInUse) {
    alert("Esta categoria não pode ser excluída pois está sendo usada por produtos.");
    return;
  }

  if (confirm("Tem certeza que deseja excluir esta categoria?")) {
    try {
      const response = await fetch(`${API_URL}/categorias`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ categoryId }),
      });

      if (!response.ok) throw new Error("Erro ao excluir categoria");
      await loadCategories();
    } catch (error) {
      alert("Falha ao excluir categoria: " + error.message);
    }
  }
}

function editCategory(id) {
  openCategoryModal(id);
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  loadCategories();

  const categoryForm = document.getElementById("categoryForm");
  categoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const categoryData = {
      name: formData.get("name").trim(),
    };

    // Verificar se já existe uma categoria com o mesmo nome
    const existingCategory = categories.find(
      (c) => c.name.toLowerCase() === categoryData.name.toLowerCase() && c.categoryId !== editingCategoryId,
    );

    if (existingCategory) {
      alert("Já existe uma categoria com este nome.");
      return;
    }

    await saveCategory(categoryData);
  });

  // Fechar modal ao clicar fora
  window.addEventListener("click", (e) => {
    const modal = document.getElementById("categoryModal");
    if (e.target === modal) {
      closeCategoryModal();
    }
  });
});
