// Controle do sidebar responsivo
document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar")
  const sidebarToggle = document.getElementById("sidebarToggle")

  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active")
    })
  }

  // Fechar sidebar ao clicar fora (mobile)
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && sidebar.classList.contains("active")) {
        sidebar.classList.remove("active")
      }
    }
  })

  // Ajustar sidebar no redimensionamento da janela
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove("active")
    }
  })
})
