const gate = document.querySelector("#ageGate");
const confirmAge = document.querySelector("#confirmAge");
const rememberAge = document.querySelector("#rememberAge");

if (localStorage.getItem("prpl-age-confirmed") === "yes") {
  gate.classList.add("hidden");
}

confirmAge.addEventListener("click", () => {
  if (rememberAge && rememberAge.checked) {
    localStorage.setItem("prpl-age-confirmed", "yes");
  }
  gate.classList.add("hidden");
});

document.querySelectorAll("[data-product]").forEach((link) => {
  link.addEventListener("click", () => {
    const select = document.querySelector("#productInterest");
    if (select) select.value = link.dataset.product;
  });
});

const cart = new Map();
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const cartSummary = document.querySelector("#cartSummary");
const productInterest = document.querySelector("#productInterest");
const discountCodeInput = document.querySelector("#discountCode");
const discountStatus = document.querySelector("#discountStatus");
const estimatedSubtotal = document.querySelector("#estimatedSubtotal");
const estimatedDiscount = document.querySelector("#estimatedDiscount");
const estimatedTotal = document.querySelector("#estimatedTotal");
const checkoutPreferenceInputs = document.querySelectorAll("input[name='checkout_preference']");
const accountFields = document.querySelector("#accountFields");
const DISCOUNTS = {
  FREE30: { display: "Free30", percent: 30 },
};

function syncCheckoutPreference() {
  const wantsAccount = document.querySelector("input[name='checkout_preference']:checked")?.value === "account";
  if (accountFields) accountFields.hidden = !wantsAccount;
}

checkoutPreferenceInputs.forEach((input) => {
  input.addEventListener("change", syncCheckoutPreference);
});

syncCheckoutPreference();

function formatCad(value) {
  return `$${value.toLocaleString("en-CA", { minimumFractionDigits: value % 1 ? 2 : 0, maximumFractionDigits: 2 })} CAD`;
}

function getActiveDiscount() {
  const code = (discountCodeInput?.value || "").trim().toUpperCase();
  if (!code) return null;
  return DISCOUNTS[code] || null;
}

function syncDiscountStatus(discount, hasItems) {
  if (!discountStatus) return;

  if (!discountCodeInput?.value.trim()) {
    discountStatus.classList.remove("error");
    discountStatus.textContent = "Use code Free30 for 30% off eligible order inquiries.";
    return;
  }

  if (!discount) {
    discountStatus.classList.add("error");
    discountStatus.textContent = "That discount code is not active. Try Free30.";
    return;
  }

  discountStatus.classList.remove("error");
  discountStatus.textContent = hasItems
    ? `${discount.display} applied: ${discount.percent}% off this inquiry estimate.`
    : `${discount.display} is active. Add materials to see the discount.`;
}

function renderCart() {
  const entries = Array.from(cart.values());
  if (!entries.length) {
    cartItems.innerHTML = '<p class="empty-cart">No materials selected yet.</p>';
    cartTotal.textContent = "$0 CAD";
    cartSummary.value = "";
    if (estimatedSubtotal) estimatedSubtotal.value = "";
    if (estimatedDiscount) estimatedDiscount.value = "";
    if (estimatedTotal) estimatedTotal.value = "";
    syncDiscountStatus(getActiveDiscount(), false);
    return;
  }

  cartItems.innerHTML = entries.map((item) => `
    <div class="cart-line">
      <span>${item.qty} x ${item.name}</span>
      <strong>${formatCad(item.qty * item.price)}</strong>
      <button type="button" data-remove-cart="${item.name}">Remove</button>
    </div>
  `).join("");

  const subtotal = entries.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount = getActiveDiscount();
  const discountAmount = discount ? subtotal * (discount.percent / 100) : 0;
  const total = subtotal - discountAmount;
  cartTotal.textContent = formatCad(total);
  cartSummary.value = [
    ...entries.map((item) => `${item.qty} x ${item.name} - ${formatCad(item.qty * item.price)}`),
    `Subtotal: ${formatCad(subtotal)}`,
    ...(discount ? [`Discount ${discount.display} (${discount.percent}%): -${formatCad(discountAmount)}`] : []),
    `Estimated total: ${formatCad(total)}`,
  ].join("\n");
  if (estimatedSubtotal) estimatedSubtotal.value = formatCad(subtotal);
  if (estimatedDiscount) estimatedDiscount.value = discount ? `${discount.display}: -${formatCad(discountAmount)}` : "";
  if (estimatedTotal) estimatedTotal.value = formatCad(total);
  syncDiscountStatus(discount, true);
  if (productInterest && entries.length === 1) productInterest.value = entries[0].name;
}

if (discountCodeInput) {
  discountCodeInput.addEventListener("input", renderCart);
}

document.querySelectorAll("[data-add-product]").forEach((button) => {
  button.addEventListener("click", () => {
    const card = button.closest(".product-card");
    const qtyInput = card.querySelector("[data-qty]");
    const qty = Math.max(1, Number(qtyInput.value || 1));
    const name = button.dataset.addProduct;
    const price = Number(button.dataset.price || 0);
    const existing = cart.get(name);
    cart.set(name, { name, price, qty: (existing ? existing.qty : 0) + qty });
    renderCart();
    document.querySelector("#cartPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
});

cartItems.addEventListener("click", (event) => {
  const name = event.target.dataset.removeCart;
  if (!name) return;
  cart.delete(name);
  renderCart();
});

document.querySelectorAll("form[data-netlify='true']").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const status = form.querySelector(".form-status");
    const successUrl = form.getAttribute("action") || "/";
    const formData = new FormData(form);

    if (button) button.disabled = true;
    if (status) {
      status.classList.remove("error");
      status.textContent = "Submitting...";
    }

    try {
      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString(),
      });

      if (!response.ok) {
        throw new Error("Submission was not accepted.");
      }

      window.location.assign(successUrl);
    } catch (error) {
      if (status) {
        status.classList.add("error");
        status.textContent = "That did not submit. Please try again or contact us directly.";
      }
      if (button) button.disabled = false;
    }
  });
});
