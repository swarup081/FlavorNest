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
const menuContainer = document.getElementById('menu-items');
const cartModal = document.getElementById('cart-modal');
const cartCount = document.getElementById('cart-count');
const cartItemsContainer = document.getElementById('cart-items-container');
const emptyCartMessage = document.getElementById('empty-cart-message');
const cartSummary = document.getElementById('cart-summary');
const cartTotalEl = document.getElementById('cart-total');
const orderForm = document.getElementById('order-form');
const toastEl = document.getElementById('toast');
const FLAVORNEST_WHATSAPP_NUMBER = "911234567890"; // IMPORTANT: Replace with her actual WhatsApp number

// --- FUNCTIONS ---

// Render menu items on page load
function renderMenu() {
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
        cartItemsContainer.innerHTML = '';
    } else {
        emptyCartMessage.style.display = 'none';
        cartSummary.style.display = 'block';
        cartItemsContainer.innerHTML = Object.keys(cart).map(itemId => {
            const item = menuData.find(p => p.id == itemId);
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
orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('customer-name').value;
    //const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;

    let message = `Hi FlavorNest! I would like to place an order:\n\n`;
    let totalPrice = 0;

    Object.keys(cart).forEach(itemId => {
        const item = menuData.find(p => p.id == itemId);
        const quantity = cart[itemId];
        message += `*${item.name}* (x${quantity}) - ₹${item.price * quantity}\n`;
        totalPrice += item.price * quantity;
    });
    
    message += `\n*Total: ₹${totalPrice}*\n\n`;
    message += `*My Details:*\n`;
    message += `Name: ${name}\n`;
   // message += `Phone: ${phone}\n`;
    message += `Address/Pickup: ${address}\n\n`;
    message += `Please confirm my order. Thank you!`;

    const whatsappUrl = `https://wa.me/${9401236978}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    
    // Clear cart and form after submission
    cart = {};
    updateCart();
    orderForm.reset();
    toggleCartModal();
});


// --- Autoscrolling reviews ---
function setupReviewAutoscroll() {
    const reviewsContainer = document.querySelector('#reviews .grid');
    if (!reviewsContainer || reviewsContainer.children.length < 2) return;

    let scrollInterval;

    const startScrolling = () => {
        scrollInterval = setInterval(() => {
            // Check if the user has manually scrolled
            if (reviewsContainer.dataset.manualScroll) return;

            const reviewWidth = reviewsContainer.children[0].offsetWidth;
            const gap = parseInt(window.getComputedStyle(reviewsContainer).gap) || 0;
            
            // If near the end, loop back to the start
            if (reviewsContainer.scrollLeft + reviewsContainer.clientWidth >= reviewsContainer.scrollWidth - 1) {
                reviewsContainer.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                reviewsContainer.scrollBy({ left: reviewWidth + gap, behavior: 'smooth' });
            }
        }, 3000);
    };

    const stopScrolling = () => {
        clearInterval(scrollInterval);
    };

    reviewsContainer.addEventListener('mouseenter', stopScrolling);
    reviewsContainer.addEventListener('mouseleave', startScrolling);
    
    // Stop autoscroll if user interacts with the scrollbar
    let scrollTimeout;
    reviewsContainer.addEventListener('scroll', () => {
        reviewsContainer.dataset.manualScroll = 'true';
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            delete reviewsContainer.dataset.manualScroll;
        }, 5000); // Resume autoscroll after 5s of inactivity
    }, { passive: true });

    startScrolling();
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    updateCart();
    setupReviewAutoscroll();
});
