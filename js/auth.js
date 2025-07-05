// Simulação de autenticação
// Em um sistema real, isso seria integrado com uma API de autenticação

function checkAuth() {
  const isLoggedIn = localStorage.getItem("isLoggedIn")
  const currentPage = window.location.pathname

  if (!isLoggedIn && !currentPage.includes("index.html") && currentPage !== "/") {
    window.location.href = "index.html"
    return false
  }

  if (isLoggedIn && (currentPage.includes("index.html") || currentPage === "/")) {
    window.location.href = "dashboard.html"
    return false
  }

  return true
}

function login(email, password) {
  // TODO: Integrar com API de autenticação
  // const response = await fetch('/api/auth/login', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ email, password })
  // });

  // Simulação de login (remover em produção)
  if (email === "admin@teste.com" && password === "123456") {
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userEmail", email)
    window.location.href = "dashboard.html"
    return true
  } else {
    alert("Credenciais inválidas!")
    return false
  }
}

function logout() {
  // TODO: Integrar com API para invalidar token
  // await fetch('/api/auth/logout', { method: 'POST' });

  localStorage.removeItem("isLoggedIn")
  localStorage.removeItem("userEmail")
  window.location.href = "index.html"
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()

  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const email = document.getElementById("email").value
      const password = document.getElementById("password").value
      login(email, password)
    })
  }
})
