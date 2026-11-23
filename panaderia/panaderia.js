
const WHATSAPP_NUMBER = "591XXXXXXXXX";

const products = [
    {
        id: 1,
        name: "Pan artesanal",
        category: "panes",
        description: "Pan fresco, corteza dorada y miga suave.",
        price: 5,
        image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 2,
        name: "Croissant",
        category: "panes",
        description: "Hojaldre crujiente y delicioso.",
        price: 8,
        image: "https://images.unsplash.com/photo-1623334044303-241021148842?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 3,
        name: "Torta de chocolate",
        category: "tortas",
        description: "Bizcocho húmedo con cobertura de chocolate.",
        price: 15,
        image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 4,
        name: "Torta personalizada",
        category: "tortas",
        description: "Ideal para cumpleaños y ocasiones especiales.",
        price: 120,
        image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 5,
        name: "Cupcakes",
        category: "postres",
        description: "Bizcochos pequeños con crema y decoración.",
        price: 8,
        image: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=85"
    },
    {
        id: 6,
        name: "Brownie",
        category: "postres",
        description: "Postre de chocolate suave y delicioso.",
        price: 10,
        image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=800&q=85"
    }
];

let cart = [];

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

function showProducts(category = "todos") {
    const filtered = category === "todos"
        ? products
        : products.filter(p => p.category === category);

    productGrid.innerHTML = filtered.map(product => `
        <article class="product-card">
            <img src="${product.image}" alt="${product.name}">

            <div class="product-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>

                <div class="product-bottom">
                    <span class="price">Bs ${product.price}</span>

                    <button class="add-btn"
                        onclick="addToCart(${product.id})">
                        + Agregar
                    </button>
                </div>
            </div>
        </article>
    `).join("");
}

function addToCart(id) {
    const existing = cart.find(item => item.id === id);

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({ id: id, quantity: 1 });
    }

    updateCart();
}

function changeQuantity(id, amount) {
    const item = cart.find(p => p.id === id);

    if (!item) return;

    item.quantity += amount;

    if (item.quantity <= 0) {
        cart = cart.filter(p => p.id !== id);
    }

    updateCart();
}

function updateCart() {
    let total = 0;
    let quantityTotal = 0;

    if (cart.length === 0) {
        cartItems.innerHTML =
            '<p class="empty">Tu carrito está vacío.</p>';
    } else {
        cartItems.innerHTML = cart.map(item => {
            const product = products.find(p => p.id === item.id);
            const subtotal = product.price * item.quantity;

            total += subtotal;
            quantityTotal += item.quantity;

            return `
                <div class="cart-row">
                    <span>${product.name}</span>

                    <div class="quantity-controls">
                        <button onclick="changeQuantity(${item.id}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQuantity(${item.id}, 1)">+</button>
                    </div>

                    <strong>Bs ${subtotal}</strong>
                </div>
            `;
        }).join("");
    }

    cartTotal.textContent = "Bs " + total;
    cartCount.textContent = "(" + quantityTotal + ")";
}

document.querySelectorAll(".filters button").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".filters button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");
        showProducts(button.dataset.filter);
    });
});

document.getElementById("orderForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("customerName").value.trim();
    const phone = document.getElementById("customerPhone").value.trim();
    const notes = document.getElementById("orderNotes").value.trim();
    const message = document.getElementById("formMessage");

    if (cart.length === 0) {
        message.textContent = "Primero agrega productos al carrito.";
        return;
    }

    let total = 0;

    const details = cart.map(item => {
        const product = products.find(p => p.id === item.id);
        const subtotal = product.price * item.quantity;

        total += subtotal;

        return `${product.name} x${item.quantity} - Bs ${subtotal}`;
    });

    const order = `
Hola, quiero realizar un pedido en Dulce Aroma.

Nombre: ${name}
Contacto: ${phone}

Productos:
${details.join("\n")}

Total: Bs ${total}

Detalles: ${notes}
`;

    if (WHATSAPP_NUMBER === "591XXXXXXXXX") {
        message.textContent = "Configura tu número de WhatsApp en panaderia.js.";
        return;
    }

    const url = "https://wa.me/" + WHATSAPP_NUMBER +
        "?text=" + encodeURIComponent(order);

    window.open(url, "_blank", "noopener,noreferrer");

    message.textContent = "Se abrió WhatsApp con tu pedido.";
});

showProducts();
updateCart();
