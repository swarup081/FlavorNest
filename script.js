// --- SUPABASE INITIALIZATION ---
const SUPABASE_URL = 'https://icvomirhadfqncpogtnq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljdm9taXJoYWRmcW5jcG9ndG5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MzUxNzMsImV4cCI6MjA3MzQxMTE3M30.o6fmCFUy_p54gk5XRPm9Lcj-b-8zMUV7skf19MLIc4U';
// We will define the client variable here, but initialize it later to prevent a race condition.
let supabaseClient;


// --- DATA ---
const menuData = [
    {
        id: 1,
        name: "Kesar Mawa Modak",
        description: "Classic steamed modaks with a rich filling of mawa, nuts, and fragrant saffron.",
        price: 150,
        unit: "6 Pieces",
        image: "https://images.placeholders.dev/?width=400&height=300&text=Modak&bgColor=%23F9EBE4&textColor=%236D4C41" // Replace with actual image URL
    },
    {
        id: 2,
        name: "Mama Roll",
        description: "A delightful savory roll packed with flavorful fillings, perfect for a snack.",
        price: 120,
        unit: "4 Pieces",
        image: "https://images.placeholders.dev/?width=400&height=300&text=Mama%20Roll&bgColor=%23F9EBE4&textColor=%236D4C41" // Replace with actual image URL
    },
    {
        id: 3,
        name: "Weekend Special Thali",
        description: "A complete, wholesome meal available only on weekends. Pre-orders open Thursday.",
        price: 250,
        unit: "Per Thali",
        image: "https://images.placeholders.dev/?width=400&height=300&text=Thali&bgColor=%23F9EBE4&textColor=%236D4C41" // Replace with actual image URL
    }
];

let cart = JSON.parse(localStorage.getItem('cart')) || {};

// --- DOM ELEMENTS ---
// These are safe to define here because they will be accessed inside the DOMContentLoaded listener
const menuContainer = document.getElementById('menu-items');
const cartModal = document.getElementById('cart-modal');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMessage = document.getElementById('empty-cart-message');
const cartSummary = document.getElementById('cart-summary');
const cartTotalEl = document.getElementById('cart-total');
const orderForm = document.getElementById('order-form');
const submitOrderBtn = document.getElementById('submit-order-button');
const toastEl = document.getElementById('toast');
const FLAVORNEST_WHATSAPP_NUMBER = "919401236978"; 

// --- FUNCTIONS ---

/**
 * Tracks an event by sending it to the Supabase analytics table.
 * @param {string} eventType - The type of event (e.g., 'add_to_cart').
 * @param {object} [details={}] - Additional details about the event.
 */
async function trackEvent(eventType, details = {}) {
    // Check if client is initialized before using it
    if (!supabaseClient) return;
    try {
        const { error } = await supabaseClient
            .from('analytics')
            .insert([{ event_type: eventType, details: details }]);
        if (error) throw error;
    } catch (error) {
        console.error('Error tracking event:', error.message);
    }
}

// Render menu items on page load
function renderMenu() {
    if (!menuContainer) return; // Defensive check
    menuContainer.innerHTML = menuData.map(item => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
            <img src="${item.image}" alt="${item.name}" class="w-full h-48 object-cover">
            <div class="p-6 flex flex-col flex-grow">
                <h3 class="text-2xl font-bold text-brand-secondary">${item.name}</h3>
                <p class="text-brand-text mt-2 flex-grow">${item.description}</p>
                <div class="mt-4 flex justify-between items-center">
                    <p class="text-xl font-bold text-brand-secondary">₹${item.price}</p>
                    <p class="text-sm text-gray-500">${item.unit}</p>
                </div>
                <div class="mt-6 w-full">
                    ${
                        cart[item.id]
                        ? `<div class="flex items-center justify-center">
                                <div class="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <button onclick="decreaseQuantity(${item.id})" class="px-4 py-2 text-brand-secondary hover:bg-brand-primary transition-colors font-bold">-</button>
                                    <span class="px-4 py-2 border-x border-gray-300 font-bold text-lg">${cart[item.id]}</span>
                                    <button onclick="increaseQuantity(${item.id})" class="px-4 py-2 text-brand-secondary hover:bg-brand-primary transition-colors font-bold">+</button>
                                </div>
                           </div>`
                        : `<button onclick="increaseQuantity(${item.id})" class="w-full btn btn-primary py-2 rounded-lg">Add to Cart</button>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}

// Add item to cart
function increaseQuantity(itemId) {
    if (cart[itemId]) {
        cart[itemId]++;
    } else {
        cart[itemId] = 1;
    }
    const item = menuData.find(p => p.id == itemId);
    trackEvent('add_to_cart', { item_name: item.name, item_id: item.id });
    updateCart();
    renderMenu();
    showToast();
}

function showToast() {
    toastEl.classList.remove('opacity-0', 'translate-y-10');
    setTimeout(() => {
        toastEl.classList.add('opacity-0', 'translate-y-10');
    }, 2000);
}

// Update cart UI
function updateCart() {
    let totalItems = 0;
    let totalPrice = 0;

    if (Object.keys(cart).length === 0) {
        emptyCartMessage.style.display = 'block';
        cartSummary.style.display = 'none';
        cartItemsContainer.innerHTML = ''; // Clear previous items
    } else {
        emptyCartMessage.style.display = 'none';
        cartSummary.style.display = 'block';
        cartItemsContainer.innerHTML = Object.keys(cart).map(itemId => {
            const item = menuData.find(p => p.id == itemId);
            if (!item) return ''; // Gracefully handle if item not found
            const quantity = cart[itemId];
            const itemTotal = item.price * quantity;
            totalItems += quantity;
            totalPrice += itemTotal;
            
            return `
                <div class="flex justify-between items-center text-brand-text">
                    <div>
                        <p class="font-semibold">${item.name}</p>
                        <p class="text-sm text-gray-500">₹${item.price}</p>
                    </div>
                    <div class="flex items-center">
                        <div class="flex items-center border border-gray-300 rounded-md overflow-hidden mr-4">
                            <button onclick="decreaseQuantity(${item.id})" class="px-2 py-1 text-brand-secondary hover:bg-brand-primary transition-colors">-</button>
                            <span class="px-3 py-1 border-x border-gray-300 font-semibold">${quantity}</span>
                            <button onclick="increaseQuantity(${item.id})" class="px-2 py-1 text-brand-secondary hover:bg-brand-primary transition-colors">+</button>
                        </div>
                        <span class="font-bold w-20 text-right">₹${itemTotal}</span>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    cartCount.innerText = totalItems;
    cartTotalEl.innerText = `₹${totalPrice}`;
    
    // Save cart to local storage
    localStorage.setItem('cart', JSON.stringify(cart));
}

function decreaseQuantity(itemId) {
    if (cart[itemId] > 1) {
        cart[itemId]--;
    } else {
        delete cart[itemId];
    }
    updateCart();
    renderMenu();
}

// Toggle cart modal
function toggleCartModal() {
    if (cartModal.classList.contains('invisible')) {
        cartModal.classList.remove('invisible', 'opacity-0');
        cartModal.querySelector('.modal-content').classList.remove('scale-95');
    } else {
        cartModal.classList.add('opacity-0');
        cartModal.querySelector('.modal-content').classList.add('scale-95');
        setTimeout(() => cartModal.classList.add('invisible'), 300);
    }
}

// Handle order submission
async function handleOrderSubmit(e) {
    e.preventDefault();

    // Double check that the client is initialized
    if (!supabaseClient) {
        alert('Connection to the database is not ready. Please try again in a moment.');
        return;
    }

    submitOrderBtn.disabled = true;
    submitOrderBtn.innerText = 'Processing...';

    const name = document.getElementById('customer-name').value;
    const address = document.getElementById('customer-address').value;

    try {
        const { data: customerData, error: customerError } = await supabaseClient
            .from('customers')
            .insert([{ name, address }])
            .select()
            .single();

        if (customerError) throw customerError;

        let totalPrice = 0;
        const orderItems = Object.keys(cart).map(itemId => {
            const item = menuData.find(p => p.id == itemId);
            const quantity = cart[itemId];
            totalPrice += item.price * quantity;
            return {
                menu_item_id: item.id,
                quantity: quantity,
                price: item.price
            };
        });

        const { data: orderData, error: orderError } = await supabaseClient
            .from('orders')
            .insert([{ customer_id: customerData.id, total_price: totalPrice }])
            .select()
            .single();

        if (orderError) throw orderError;

        const itemsToInsert = orderItems.map(item => ({ ...item, order_id: orderData.id }));
        const { error: orderItemsError } = await supabaseClient
            .from('order_items')
            .insert(itemsToInsert);

        if (orderItemsError) throw orderItemsError;

        trackEvent('place_order', { customer_name: name, total_price: totalPrice, order_id: orderData.id });

        let message = `Hi FlavorNest! I would like to place an order:\n\n(Order ID: ${orderData.id.substring(0, 8)})\n\n`;
        Object.keys(cart).forEach(itemId => {
            const item = menuData.find(p => p.id == itemId);
            const quantity = cart[itemId];
            message += `*${item.name}* (x${quantity}) - ₹${item.price * quantity}\n`;
        });
        message += `\n*Total: ₹${totalPrice}*\n\n`;
        message += `*My Details:*\n`;
        message += `Name: ${name}\n`;
        message += `Address/Pickup: ${address}\n\n`;
        message += `Please confirm my order. Thank you!`;

        const whatsappUrl = `https://wa.me/${FLAVORNEST_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        alert('Your order has been saved successfully!');
        cart = {};
        updateCart();
        renderMenu();
        orderForm.reset();
        toggleCartModal();

    } catch (error) {
        console.error('Error placing order:', error.message);
        alert('There was an error saving your order. Please try again or contact us directly.');
    } finally {
        submitOrderBtn.disabled = false;
        submitOrderBtn.innerText = 'Place Order via WhatsApp';
    }
}


// --- Autoscrolling reviews ---
function setupReviewAutoscroll() {
    const reviewsContainer = document.querySelector('#reviews .grid');
    if (!reviewsContainer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let scrollInterval;

    const startScrolling = () => {
        scrollInterval = setInterval(() => {
            const reviewWidth = reviewsContainer.children[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(reviewsContainer).gap) || 0;
            
            if (reviewsContainer.scrollLeft + reviewsContainer.clientWidth >= reviewsContainer.scrollWidth - 1) {
                reviewsContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                reviewsContainer.scrollBy({ left: reviewWidth + gap, behavior: 'smooth' });
            }
        }, 3000);
    };

    const stopScrolling = () => clearInterval(scrollInterval);

    reviewsContainer.addEventListener('mouseenter', stopScrolling);
    reviewsContainer.addEventListener('mouseleave', startScrolling);
    reviewsContainer.addEventListener('focusin', stopScrolling);
    reviewsContainer.addEventListener('focusout', startScrolling);
    
    startScrolling();
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // ** THE FIX IS HERE **
    // Initialize the Supabase client now that we are sure all external scripts are loaded.
    try {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (e) {
        console.error("Error initializing Supabase client:", e);
        alert("Could not connect to the database. Some features may not work.");
        // We still want to render the menu even if Supabase fails
    }

    // Now, run the functions to build the page
    renderMenu();
    updateCart();
    setupReviewAutoscroll();

    // Attach the form submit listener here
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
});

