// ===== DATOS DE LA CAFETERÍA =====
const productos = [
  { id: 1, nombre: "Espresso",          desc: "Café intenso y aromático",        precio: 10, categoria: "caliente", emoji: "☕" },
  { id: 2, nombre: "Capuchino",         desc: "Espresso con leche espumada",     precio: 15, categoria: "caliente", emoji: "☕" },
  { id: 3, nombre: "Chocolate caliente",desc: "Cacao boliviano con leche",       precio: 14, categoria: "caliente", emoji: "🍫" },
  { id: 4, nombre: "Té de coca",        desc: "Infusión tradicional andina",     precio: 8,  categoria: "caliente", emoji: "🍵" },
  { id: 5, nombre: "Frappé de café",    desc: "Café helado con crema",           precio: 18, categoria: "fria",     emoji: "🥤" },
  { id: 6, nombre: "Limonada",          desc: "Natural, con hierbabuena",        precio: 12, categoria: "fria",     emoji: "🍋" },
  { id: 7, nombre: "Cheesecake",        desc: "Con salsa de frutos rojos",       precio: 20, categoria: "postre",   emoji: "🍰" },
  { id: 8, nombre: "Brownie",           desc: "Chocolate con nueces",            precio: 13, categoria: "postre",   emoji: "🧁" },
  { id: 9, nombre: "Medialuna",         desc: "Hojaldre de mantequilla",         precio: 7,  categoria: "postre",   emoji: "🥐" }
];

let carrito = [];

// ===== ELEMENTOS =====
const contProductos  = document.getElementById("productos");
const listaCarrito   = document.getElementById("carritoLista");
const totalCarrito   = document.getElementById("carritoTotal");
const seccionCafe    = document.getElementById("cafeteria");
const seccionStreaming = document.getElementById("streaming");
const modal          = document.getElementById("modal");
const modalIcono     = document.getElementById("modalIcono");
const modalTitulo    = document.getElementById("modalTitulo");
const modalTexto     = document.getElementById("modalTexto");

// ===== MENÚ MÓVIL =====
const nav = document.getElementById("nav");
document.getElementById("menuToggle").addEventListener("click", () => nav.classList.toggle("abierto"));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("abierto")));

// El enlace "Cafetería" del menú también abre el servicio
nav.querySelector('a[href="#cafeteria"]').addEventListener("click", mostrarCafeteria);

// ===== BOTONES DE SERVICIOS =====
document.querySelectorAll("[data-servicio]").forEach(boton => {
  boton.addEventListener("click", () => {
    const servicio = boton.dataset.servicio;

    if (servicio === "cafeteria") {
      mostrarCafeteria();
    } else if (servicio === "streaming") {
      mostrarStreaming();
    } else if (servicio === "panaderia") {
      abrirModal("🛠️", "En mantenimiento",
        "La panadería se encuentra en mantenimiento. ¡Vuelve pronto!");
    }
  });
});

function mostrarCafeteria() {
  seccionCafe.classList.remove("oculto");
  seccionCafe.scrollIntoView({ behavior: "smooth" });
}

function mostrarStreaming() {
  seccionStreaming.classList.remove("oculto");
  seccionStreaming.scrollIntoView({ behavior: "smooth" });
}

// ===== MODAL =====
function abrirModal(icono, titulo, texto) {
  modalIcono.textContent = icono;
  modalTitulo.textContent = titulo;
  modalTexto.textContent = texto;
  modal.classList.add("visible");
}
function cerrarModal() { modal.classList.remove("visible"); }

document.getElementById("modalCerrar").addEventListener("click", cerrarModal);
modal.addEventListener("click", e => { if (e.target === modal) cerrarModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") cerrarModal(); });

// ===== PRODUCTOS =====
function mostrarProductos(categoria = "todos") {
  const lista = categoria === "todos" ? productos : productos.filter(p => p.categoria === categoria);

  contProductos.innerHTML = lista.map(p => `
    <div class="producto">
      <div class="producto__emoji">${p.emoji}</div>
      <h4>${p.nombre}</h4>
      <small>${p.desc}</small>
      <div class="producto__precio">Bs ${p.precio.toFixed(2)}</div>
      <button class="btn" onclick="agregarAlCarrito(${p.id})">Agregar</button>
    </div>
  `).join("");
}

// Filtros
document.querySelectorAll(".filtro").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro").forEach(b => b.classList.remove("activo"));
    btn.classList.add("activo");
    mostrarProductos(btn.dataset.categoria);
  });
});

// ===== CARRITO =====
function agregarAlCarrito(id) {
  const item = carrito.find(i => i.id === id);
  if (item) {
    item.cantidad++;
  } else {
    const prod = productos.find(p => p.id === id);
    carrito.push({ ...prod, cantidad: 1 });
  }
  actualizarCarrito();
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(i => i.id === id);
  if (!item) return;
  item.cantidad += cambio;
  if (item.cantidad <= 0) carrito = carrito.filter(i => i.id !== id);
  actualizarCarrito();
}

function actualizarCarrito() {
  if (carrito.length === 0) {
    listaCarrito.innerHTML = '<li class="vacio">Aún no agregaste productos.</li>';
  } else {
    listaCarrito.innerHTML = carrito.map(i => `
      <li>
        <span>${i.emoji} ${i.nombre}</span>
        <span class="cantidad">
          <button onclick="cambiarCantidad(${i.id}, -1)">−</button>
          ${i.cantidad}
          <button onclick="cambiarCantidad(${i.id}, 1)">+</button>
        </span>
      </li>
    `).join("");
  }
  const total = carrito.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  totalCarrito.textContent = `Bs ${total.toFixed(2)}`;
}

document.getElementById("btnVaciar").addEventListener("click", () => {
  carrito = [];
  actualizarCarrito();
});

document.getElementById("btnConfirmar").addEventListener("click", () => {
  if (carrito.length === 0) {
    abrirModal("🛒", "Carrito vacío", "Agrega al menos un producto antes de confirmar tu pedido.");
    return;
  }
  const total = carrito.reduce((suma, i) => suma + i.precio * i.cantidad, 0);
  abrirModal("✅", "¡Pedido confirmado!",
    `Tu pedido por Bs ${total.toFixed(2)} fue recibido. Estará listo en unos minutos.`);
  carrito = [];
  actualizarCarrito();
});

// ===== INICIO =====
mostrarProductos();

// ===== STREAMING (CRUNCHYROLL) =====
(function () {
    const menuToggle = document.getElementById("crMenuToggle");
    const mainNav = document.getElementById("crMainNav");
    const planModal = document.getElementById("planModal");
    const closeModalButton = document.getElementById("closeModal");
    const confirmButton = document.getElementById("confirmSimulation");
    const selectedPlanName = document.getElementById("selectedPlanName");
    const selectedPlanPrice = document.getElementById("selectedPlanPrice");
    const selectionStatus = document.getElementById("selectionStatus");

    let currentPlan = "";

    // Abre y cierra el menú de navegación en pantallas pequeñas.
    menuToggle.addEventListener("click", () => {
        const menuIsOpen = mainNav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(menuIsOpen));
        menuToggle.setAttribute("aria-label", menuIsOpen ? "Cerrar menú" : "Abrir menú");
    });

    // Cierra el menú móvil después de elegir una sección.
    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            mainNav.classList.remove("is-open");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Abrir menú");
        });
    });

    // Muestra la ventana de simulación con los datos del plan elegido.
    document.querySelectorAll(".choose-plan").forEach((button) => {
        button.addEventListener("click", () => {
            currentPlan = button.dataset.plan;
            const currentPrice = button.dataset.price;

            selectedPlanName.textContent = currentPlan;
            selectedPlanPrice.textContent = currentPrice;
            selectionStatus.textContent = "Has seleccionado " + currentPlan + ". Confirma la simulación en la ventana emergente.";
            planModal.hidden = false;
            closeModalButton.focus();
        });
    });

    // Cierra la ventana emergente y devuelve el foco al contenido.
    function closePlanModal() {
        planModal.hidden = true;
    }

    closeModalButton.addEventListener("click", closePlanModal);

    // Permite cerrar el modal haciendo clic en el fondo oscuro.
    planModal.addEventListener("click", (event) => {
        if (event.target === planModal) {
            closePlanModal();
        }
    });

    // También permite cerrar el modal con la tecla Escape.
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !planModal.hidden) {
            closePlanModal();
        }
    });

    // Confirma únicamente la selección de prueba: no hay pago ni registro real.
    confirmButton.addEventListener("click", () => {
        selectionStatus.textContent = "¡Listo! La selección de " + currentPlan + " se completó como simulación académica. No se realizó ningún pago.";
        closePlanModal();
        selectionStatus.scrollIntoView({ behavior: "smooth", block: "center" });
    });

    // Botón para volver a la página principal.
    document.getElementById("crVolver").addEventListener("click", () => {
        document.getElementById("streaming").classList.add("oculto");
        document.getElementById("servicios").scrollIntoView({ behavior: "smooth" });
    });
})();