// CrownMarket Application State
// CrownMarket Application State - use relative path for production/Vercel
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api' 
    : '/api';
let products = [];
let cart = [];
let currentUser = null;
let token = null;

// DOM Elements
const views = document.querySelectorAll('.view');
const authSection = document.getElementById('auth-section');
const cartBadge = document.getElementById('cart-badge');
const productsGrid = document.getElementById('products-grid');

// Init application
async function initApp() {
    // Load local storage data
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
        currentUser = JSON.parse(storedUser);
        token = storedToken;
    }

    setupRouting();
    updateNav();
    
    // Default route
    navigateTo('home');
    
    try {
        products = await apiGet('/products');
        renderProducts();
    } catch (e) {
        productsGrid.innerHTML = `<h2>Error loading products. Is the backend running?</h2>`;
    }
}

// Routing Mechanism
function setupRouting() {
    document.body.addEventListener('click', (e) => {
        const routeElement = e.target.closest('[data-route]');
        if (routeElement) {
            e.preventDefault();
            const route = routeElement.getAttribute('data-route');
            const dataId = routeElement.getAttribute('data-id');
            navigateTo(route, dataId);
        }
    });
}

function navigateTo(route, dataId = null) {
    views.forEach(view => {
        view.style.display = 'none';
        if (view.id === 'view-success') view.style.display = 'none';
        else view.classList.remove('active');
    });
    
    const targetView = document.getElementById(`view-${route}`);
    if (targetView) {
        if (route === 'success') {
            targetView.style.display = 'flex';
        } else {
            targetView.style.display = 'block';
            setTimeout(() => targetView.classList.add('active'), 10);
        }
    }

    if (route === 'home') renderProducts();
    if (route === 'details' && dataId) loadProductDetails(dataId);
    if (route === 'cart') renderCart();
}

// Navigation UI updates
function updateNav() {
    if (currentUser) {
        authSection.innerHTML = `
            <span class="text-secondary" style="color: var(--text-secondary)">Hi, ${currentUser.name}</span>
            <button id="logout-btn" class="flex items-center gap-2 btn btn-outline" style="padding: 0.5rem 1rem;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-out"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                Logout
            </button>
        `;
        document.getElementById('logout-btn').addEventListener('click', logout);
    } else {
        authSection.innerHTML = `
            <a href="#" data-route="login" class="flex items-center gap-2 btn btn-primary" style="padding: 0.5rem 1rem; display: inline-flex;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-log-in"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>
                Login
            </a>
        `;
    }
    updateCartCount();
}

// Rendering Products
function renderProducts() {
    if (products.length === 0) {
        productsGrid.innerHTML = `<h2>Loading products...</h2>`;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="card product-item" data-route="details" data-id="${product.id}">
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price.toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

// Product Details
async function loadProductDetails(id) {
    const container = document.getElementById('product-details-content');
    container.innerHTML = `<h2>Loading...</h2>`;
    
    try {
        const product = await apiGet(`/products/${id}`);
        container.innerHTML = `
            <div>
                <img src="${product.image}" alt="${product.name}" class="details-image">
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center;">
                <h1 style="font-size: 2.5rem; margin-bottom: 1rem;">${product.name}</h1>
                <p style="font-size: 2rem; font-weight: 700; color: var(--accent-color); margin-bottom: 1.5rem;">
                    $${product.price.toFixed(2)}
                </p>
                <p style="font-size: 1.1rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 2.5rem;">
                    ${product.description}
                </p>
                <button id="add-to-cart-btn" class="btn btn-primary flex items-center justify-center gap-2" style="padding: 1rem; font-size: 1.1rem;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                    Add to Cart
                </button>
            </div>
        `;
        
        document.getElementById('add-to-cart-btn').addEventListener('click', (e) => {
            addToCart(product);
            e.target.innerHTML = 'Added to Cart ✓';
            e.target.classList.remove('btn-primary');
            e.target.classList.add('btn-outline');
            setTimeout(() => {
                e.target.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg> Add to Cart';
                e.target.classList.remove('btn-outline');
                e.target.classList.add('btn-primary');
            }, 2000);
        });
    } catch (e) {
        container.innerHTML = `<h2>Product not found</h2>`;
    }
}

// Cart Management
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartCount();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartCount();
    renderCart(); // Re-render cart view
}

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (total > 0) {
        cartBadge.style.display = 'inline-block';
        cartBadge.textContent = total;
    } else {
        cartBadge.style.display = 'none';
    }
}

function renderCart() {
    const container = document.getElementById('cart-content-container');
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 40vh;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 1.5rem;"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
                <h2 style="margin-bottom: 1rem;">Your cart is empty</h2>
                <a href="#" class="btn btn-primary" data-route="home">Start Shopping</a>
            </div>
        `;
        return;
    }

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let html = `
        <div class="card" style="padding: 2rem;">
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    cart.forEach(item => {
        html += `
            <tr>
                <td data-label="Product" style="display: flex; align-items: center; gap: 1rem;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; border-radius: 0.5rem; object-fit: cover;">
                    <span style="font-weight: 500;">${item.name}</span>
                </td>
                <td data-label="Price">$${item.price.toFixed(2)}</td>
                <td data-label="Quantity">${item.quantity}</td>
                <td data-label="Total" style="font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</td>
                <td style="text-align: right;">
                    <button class="btn-danger remove-item-btn" data-id="${item.id}" style="padding: 0.5rem; border-radius: 0.5rem;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                </td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
            
            <div class="cart-total">
                <span style="color: var(--text-secondary); font-size: 1.2rem; margin-right: 1rem;">Subtotal:</span>
                <span style="color: var(--accent-color);">$${totalPrice.toFixed(2)}</span>
            </div>
            
            <div id="checkout-error" style="color: var(--danger); margin-top: 1rem; text-align: right; display: none;"></div>
            
            <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
                <button id="checkout-btn" class="btn btn-primary" style="padding: 1rem 2rem; font-size: 1.1rem;">
                    ${currentUser ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
            </div>
        </div>
    `;

    container.innerHTML = html;

    // Attach cart events
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.currentTarget.getAttribute('data-id'));
            removeFromCart(id);
        });
    });

    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);
}

// Authentication & Checkout logic
async function handleCheckout() {
    if (!currentUser) {
        navigateTo('login');
        return;
    }
    
    const btn = document.getElementById('checkout-btn');
    const errDiv = document.getElementById('checkout-error');
    errDiv.style.display = 'none';
    btn.textContent = 'Processing...';
    btn.disabled = true;

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    try {
        await apiPost('/orders', { items: cart, totalPrice }, true);
        cart = []; // clear cart
        updateCartCount();
        navigateTo('success');
    } catch (e) {
        errDiv.textContent = 'Checkout failed. Please try again.';
        errDiv.style.display = 'block';
    } finally {
        btn.textContent = 'Proceed to Checkout';
        btn.disabled = false;
    }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errDiv = document.getElementById('login-error');
    
    errDiv.style.display = 'none';
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
        const res = await apiPost('/auth/login', { email, password });
        currentUser = res.user;
        token = res.token;
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('token', token);
        updateNav();
        document.getElementById('login-form').reset();
        navigateTo('home');
    } catch (e) {
        errDiv.textContent = e.error || 'Failed to login';
        errDiv.style.display = 'block';
    } finally {
        btn.textContent = 'Log In';
        btn.disabled = false;
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errDiv = document.getElementById('register-error');
    
    errDiv.style.display = 'none';
    btn.textContent = 'Creating account...';
    btn.disabled = true;

    try {
        await apiPost('/auth/register', { name, email, password });
        // auto-login after register
        const res = await apiPost('/auth/login', { email, password });
        currentUser = res.user;
        token = res.token;
        localStorage.setItem('user', JSON.stringify(currentUser));
        localStorage.setItem('token', token);
        updateNav();
        document.getElementById('register-form').reset();
        navigateTo('home');
    } catch (e) {
        errDiv.textContent = e.error || 'Failed to register';
        errDiv.style.display = 'block';
    } finally {
        btn.textContent = 'Sign Up';
        btn.disabled = false;
    }
});

function logout() {
    currentUser = null;
    token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    updateNav();
    navigateTo('home');
}

// Base API helpers
async function apiGet(endpoint) {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) throw new Error('API Error');
    return res.json();
}

async function apiPost(endpoint, data, useAuth = false) {
    const headers = { 'Content-Type': 'application/json' };
    if (useAuth && token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data)
    });
    
    const resData = await res.json();
    if (!res.ok) throw resData;
    return resData;
}

// Start App
initApp();
