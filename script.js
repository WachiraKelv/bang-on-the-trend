/* ===========================================
   Bang on the Trend - JavaScript
   =========================================== */

/* ---------- 1. YOUR BUSINESS SETTINGS (edit these!) ---------- */
const CONFIG = {
  whatsappNumber: "254701875985",        // Your number: country code + number, NO + or spaces
  currency: "KES",
  businessName: "Bang on the Trend"
};

/* ---------- 2. YOUR PRODUCTS ----------
   Add one line per product, using the EXACT file name from your images folder:

     item("file-name.jpg", "clothes", 2500),
     item("file-name.jpg", "shoes",   4500),

   - The product NAME is made automatically from the file name
     ("black-hoodie.jpg" becomes "Black Hoodie").
   - To use your own name instead, add it at the end:
     item("IMG_2041.jpg", "shoes", 4500, { name: "White Nike Sneakers" }),
   - To add a badge (New / Hot / Sale), add it too:
     item("black-hoodie.jpg", "clothes", 2500, { badge: "New" }),
*/
const CLOTH_SIZES = ["S", "M", "L", "XL"];
const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];

let nextId = 1;
function item(file, category, price, opts = {}) {
  const autoName = file
    .replace(/\.[^.]+$/, "")            // remove .jpg / .png
    .replace(/[-_]+/g, " ")             // dashes and underscores -> spaces
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    id: nextId++,
    name: opts.name || autoName,
    category,
    price,
    image: "images/" + file,
    badge: opts.badge || "",
    sizes: opts.sizes || (category === "shoes" ? SHOE_SIZES : CLOTH_SIZES)
  };
}

/* >>> PASTE / EDIT YOUR PRODUCTS BELOW THIS LINE <<< */
const products = [
  item("product-1.jpg",  "clothes", 1200),
  item("chromeheart.jpg",  "clothes", 3500),
  item("boxedshirt.jpg",  "clothes", 2800),
  item("chromeT.jpg",  "clothes", 2500),
  item("future.jpg",  "shoes",   4500),
  item("Airmax97.jpg",  "shoes",   3800),
  item("Clogs.jpg", "shoes", 2500),
  item("J4.jpg", "shoes", 2500)
];
/* >>> PASTE / EDIT YOUR PRODUCTS ABOVE THIS LINE <<< */

/* ---------- 3. Helpers & state ---------- */
const $ = (id) => document.getElementById(id);
const money = (n) => `${CONFIG.currency} ${n.toLocaleString()}`;

let currentFilter = "all";
let searchText = "";
let sortMode = "default";
let cart = loadCart();

function loadCart() {
  try { return JSON.parse(localStorage.getItem("bott_cart")) || []; }
  catch (e) { return []; }
}
function saveCart() {
  try { localStorage.setItem("bott_cart", JSON.stringify(cart)); } catch (e) {}
}

/* ---------- 4. Show products ---------- */
function renderProducts() {
  let list = products.filter((p) =>
    (currentFilter === "all" || p.category === currentFilter) &&
    p.name.toLowerCase().includes(searchText)
  );

  if (sortMode === "low")  list.sort((a, b) => a.price - b.price);
  if (sortMode === "high") list.sort((a, b) => b.price - a.price);

  $("noResults").hidden = list.length > 0;

  $("productGrid").innerHTML = list.map((p) => `
    <article class="card">
      <div class="card-img">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ""}
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'" />
      </div>
      <div class="card-body">
        <span class="card-cat">${p.category}</span>
        <h3>${p.name}</h3>
        <p class="price">${money(p.price)}</p>
        <div class="card-row">
          <select id="size-${p.id}" aria-label="Choose size">
            ${p.sizes.map((s) => `<option value="${s}">${s}</option>`).join("")}
          </select>
          <button class="add-btn" data-id="${p.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");
}

/* ---------- 5. Cart ---------- */
function addToCart(id) {
  const product = products.find((p) => p.id === id);
  const size = $(`size-${id}`).value;
  const existing = cart.find((i) => i.id === id && i.size === size);

  if (existing) existing.qty += 1;
  else cart.push({ id, size, qty: 1 });

  saveCart();
  renderCart();
  showToast(`${product.name} (size ${size}) added to cart`);
}

function changeQty(id, size, delta) {
  const item = cart.find((i) => i.id === id && i.size === size);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i !== item);
  saveCart();
  renderCart();
}

function removeItem(id, size) {
  cart = cart.filter((i) => !(i.id === id && i.size === size));
  saveCart();
  renderCart();
}

function renderCart() {
  const box = $("cartItems");
  let total = 0;
  let count = 0;

  // Drop anything in the cart that is no longer in the product list
  cart = cart.filter((i) => products.some((p) => p.id === i.id));

  if (cart.length === 0) {
    box.innerHTML = `<p class="empty-cart">Your cart is empty 🛍️<br/>Add something stylish!</p>`;
  } else {
    box.innerHTML = cart.map((item) => {
      const p = products.find((x) => x.id === item.id);
      total += p.price * item.qty;
      count += item.qty;
      return `
        <div class="cart-item">
          <div class="cart-thumb">
            <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'" />
          </div>
          <div class="cart-info">
            <strong>${p.name}</strong>
            <small>Size ${item.size} · ${money(p.price)}</small>
            <div class="qty">
              <button data-act="minus" data-id="${item.id}" data-size="${item.size}">−</button>
              <span>${item.qty}</span>
              <button data-act="plus" data-id="${item.id}" data-size="${item.size}">+</button>
            </div>
          </div>
          <button class="remove-btn" data-act="remove" data-id="${item.id}" data-size="${item.size}" aria-label="Remove">🗑</button>
        </div>`;
    }).join("");
  }

  saveCart();
  $("cartTotal").textContent = money(total);
  $("cartCount").textContent = count;
}

function openCart()  { $("cart").classList.add("open");    $("overlay").classList.add("show"); }
function closeCart() { $("cart").classList.remove("open"); $("overlay").classList.remove("show"); }

/* ---------- 6. Checkout via WhatsApp ---------- */
function checkout() {
  if (cart.length === 0) {
    showToast("Your cart is empty");
    return;
  }
  let total = 0;
  let message = `Hello ${CONFIG.businessName}! I would like to order:\n\n`;

  cart.forEach((item, i) => {
    const p = products.find((x) => x.id === item.id);
    const line = p.price * item.qty;
    total += line;
    message += `${i + 1}. ${p.name} (Size ${item.size}) x${item.qty} = ${money(line)}\n`;
  });

  message += `\nTotal: ${money(total)}\n\nPlease confirm availability and delivery.`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
}

/* ---------- 7. Contact form -> WhatsApp ---------- */
function sendContact(e) {
  e.preventDefault();
  const name = $("cName").value.trim();
  const phone = $("cPhone").value.trim();
  const msg = $("cMessage").value.trim();
  const text = `Hello ${CONFIG.businessName}!\nName: ${name}\nPhone: ${phone}\n\n${msg}`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank");
  e.target.reset();
  showToast("Opening WhatsApp...");
}

/* ---------- 8. Toast popup ---------- */
let toastTimer;
function showToast(text) {
  const t = $("toast");
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- 9. Connect everything (events) ---------- */
$("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  renderProducts();
});

$("searchInput").addEventListener("input", (e) => {
  searchText = e.target.value.toLowerCase().trim();
  renderProducts();
});

$("sortSelect").addEventListener("change", (e) => {
  sortMode = e.target.value;
  renderProducts();
});

$("productGrid").addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (btn) addToCart(Number(btn.dataset.id));
});

$("cartItems").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const size = btn.dataset.size;
  if (btn.dataset.act === "plus")   changeQty(id, size, 1);
  if (btn.dataset.act === "minus")  changeQty(id, size, -1);
  if (btn.dataset.act === "remove") removeItem(id, size);
});

$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);
$("overlay").addEventListener("click", closeCart);
$("checkoutBtn").addEventListener("click", checkout);
$("clearCart").addEventListener("click", () => { cart = []; saveCart(); renderCart(); });
$("contactForm").addEventListener("submit", sendContact);

$("menuBtn").addEventListener("click", () => $("nav").classList.toggle("open"));
$("nav").addEventListener("click", (e) => {
  if (e.target.tagName === "A") $("nav").classList.remove("open");
});

/* ---------- 10. Start ---------- */
$("year").textContent = new Date().getFullYear();
renderProducts();
renderCart();