// THESAGEMODE — vanilla JS frontend
const STORAGE_KEY = "thesagemode_state_v2";

const MENU = [
   { id: "nasi-goreng", name: "Nasi Goreng Special", desc: "Telur, sayur & udang.", price: 35000, image: "images/nasi-goreng.jpg", category: "makanan", badge: "Best Seller", available: 12, discount: 15, oldPrice: 40000 },
  { id: "mie-goreng", name: "Mie Goreng Ayam", desc: "Mie & ayam pilihan.", price: 32000, image: "images/mie-goreng.jpg", category: "makanan", available: 8, discount: 15, oldPrice: 38000 },
  { id: "mie-rebus", name: "Mie Rebus Spesial", desc: "Mie,Sayuran & telur.", price: 20000, image: "images/mie-rebus.jpg", category: "makanan", available: 7, discount: 20, oldPrice: 25000 },
  { id: "kwetiau-goreng", name: "Kwetiau Goreng Spesial", desc: "Kwetiau,sayuran & Telur.", price: 21500, image: "images/Kwetiau goreng.jpg", category: "makanan", available: 7, discount: 14, oldPrice: 25000 },
  { id: "ayam-goreng", name: "Ayam Goreng Crispy", desc: "Renyah & juicy.", price: 28000, image: "images/ayam-goreng.jpg", category: "makanan", available: 10, discount: 20, oldPrice: 35000 },
  { id: "mendoan", name: "Mendoan Tempe", desc: "Tempe mendoan renyah & Gurih", price: 10000, image: "images/mendoan.jpg", category: "makanan", available: 15 },
  { id: "jus-alpukat", name: "Jus Alpukat Cream", desc: "Segar,kaya serat & creamy.", price: 22000, image: "images/jus-alpukat.jpg", category: "minuman", badge: "Favorit", available: 6, discount: 10, oldPrice: 25000 },
  { id: "es-teh", name: "Es Teh Lemon", desc: "Teh, lemon, mint.", price: 12000, image: "images/es-teh.jpg", category: "minuman", available: 20, discount: 25, oldPrice: 16000 },
  { id: "kopi", name: "Kopi Latte Art", desc: "Espresso premium.", price: 25000, image: "images/kopi.jpg", category: "minuman" },
  { id: "air", name: "Air Mineral", desc: "Segar & menyegarkan.", price: 5000, image: "images/air putih.jpg", category: "minuman" },
];

function loadState(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}
function saveState(s){ localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }
function getState(){
  return Object.assign({ name:"", table:"", cart:[] }, loadState());
}
function setState(patch){
  const s = getState(); const next = Object.assign(s, patch); saveState(next); return next;
}
function formatPrice(n){ return "Rp " + n.toLocaleString("id-ID"); }
function toast(msg){
  const el = document.getElementById("toast"); if(!el) return alert(msg);
  el.textContent = msg; el.hidden = false;
  clearTimeout(window.__t); window.__t = setTimeout(()=>{el.hidden=true;}, 1800);
}

/* ---------- LANDING ---------- */
if (document.body.classList.contains("landing-page")) {
  const s = getState();
  document.getElementById("name").value = s.name;
  document.getElementById("table").value = s.table;

  document.getElementById("customer-form").addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const table = document.getElementById("table").value.trim();
    if(!name){ alert("Silakan masukkan nama Anda"); return; }
    if(!table){ alert("Silakan masukkan nomor meja"); return; }
    setState({ name, table });
    location.href = "menu.html";
  });
}

/* ---------- MENU ---------- */
if (document.body.classList.contains("menu-page")) {
  const s = getState();
  document.getElementById("ci-name").textContent = s.name || "Tamu";
  document.getElementById("ci-table").textContent = s.table || "—";

  const discounts = MENU.filter(m=>m.discount);
  function discountCardHTML(d){
    return `
    <div class="discount-card">
      <img src="${d.image}" alt="${d.name}"/>
      <span class="avail-tag">Available: ${d.available}</span>
      <div class="discount-body">
        <p class="discount-name">${d.name}</p>
        <div class="discount-price-row">
          <div>
            <span class="disc-tag">${d.discount}%</span>
            <span class="old-price">${formatPrice(d.oldPrice)}</span>
            <div class="new-price">${formatPrice(d.price)}</div>
          </div>
          <button class="order-btn" data-id="${d.id}">Order</button>
        </div>
      </div>
    </div>`;
  }
  document.getElementById("discount-row").innerHTML = discounts.map(discountCardHTML).join("");

  // See all
  const discountSheet = document.getElementById("discount-sheet");
  document.getElementById("see-all-btn").addEventListener("click", ()=>{
    document.getElementById("discount-all").innerHTML = discounts.map(discountCardHTML).join("");
    discountSheet.hidden = false;
  });
  document.getElementById("discount-close").addEventListener("click", ()=>discountSheet.hidden=true);
  discountSheet.querySelector(".sheet-backdrop").addEventListener("click", ()=>discountSheet.hidden=true);

  // Countdown timer
  let total = 12*3600 + 10*60 + 9;
  const timerEl = document.getElementById("timer");
  setInterval(()=>{
    total = total>0 ? total-1 : 12*3600;
    const h=Math.floor(total/3600), m=Math.floor((total%3600)/60), sec=total%60;
    timerEl.textContent = [h,m,sec].map(v=>String(v).padStart(2,"0")).join(" : ");
  }, 1000);

  // Render menu grid
  let activeCat = "all";
  let search = "";
  const grid = document.getElementById("menu-grid");
  function qtyOf(id){ return (getState().cart.find(c=>c.id===id)||{}).quantity||0; }
  function render(){
    const items = MENU.filter(m=>{
      const c = activeCat==="all"||m.category===activeCat;
      const q = m.name.toLowerCase().includes(search) || m.desc.toLowerCase().includes(search);
      return c && q;
    });
    grid.innerHTML = items.length ? items.map(m=>{
      const inCart = qtyOf(m.id);
      const ctrl = inCart>0
        ? `<span class="qty-stepper" data-id="${m.id}"><button type="button" data-dec="${m.id}">−</button><span class="qv">${inCart}</span><button type="button" data-inc="${m.id}">+</button></span>`
        : `<button class="add-btn" data-id="${m.id}" aria-label="tambah">+</button>`;
      return `
      <div class="menu-card">
        <img src="${m.image}" alt="${m.name}" loading="lazy"/>
        <p class="menu-name">${m.name}</p>
        <p class="menu-desc">${m.desc}</p>
        <div class="menu-foot">
          <span class="menu-price">${formatPrice(m.price)}</span>
          ${ctrl}
        </div>
      </div>`;
    }).join("") : `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px 0">Tidak ada menu ditemukan</p>`;
  }
  render();
  updateCartBadge();

  document.querySelectorAll(".cat-chip").forEach(b=>{
    b.addEventListener("click", ()=>{
      document.querySelectorAll(".cat-chip").forEach(x=>x.classList.remove("active"));
      b.classList.add("active");
      activeCat = b.dataset.cat;
      render();
    });
  });
  document.getElementById("search").addEventListener("input",(e)=>{ search=e.target.value.toLowerCase(); render(); });

  grid.addEventListener("click",(e)=>{
    const addBtn = e.target.closest(".add-btn");
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if(addBtn){
      const item = MENU.find(m=>m.id===addBtn.dataset.id);
      addToCart(item);
      updateCartBadge(); render();
      toast(item.name + " ditambahkan");
    } else if(inc){
      const item = MENU.find(m=>m.id===inc.dataset.inc);
      addToCart(item); updateCartBadge(); render();
    } else if(dec){
      const id = dec.dataset.dec;
      const st = getState();
      const it = st.cart.find(c=>c.id===id);
      if(it){
        it.quantity -= 1;
        if(it.quantity<=0) st.cart = st.cart.filter(c=>c.id!==id);
        saveState(st); updateCartBadge(); render();
      }
    }
  });

  // Order buttons on discount cards
  document.addEventListener("click",(e)=>{
    const ob = e.target.closest(".order-btn");
    if(ob){
      const item = MENU.find(m=>m.id===ob.dataset.id);
      addToCart(item); updateCartBadge(); render();
      ob.classList.add("added"); ob.textContent="✓";
      setTimeout(()=>{ ob.classList.remove("added"); ob.textContent="Order"; }, 700);
      toast(item.name + " ditambahkan");
    }
  });

  // Waiter sheet
  const sheet = document.getElementById("waiter-sheet");
  const confirmSheet = document.getElementById("confirm-sheet");
  let pendingReason = "";

  function openConfirm(reason){
    if(!reason) return;
    pendingReason = reason;
    document.getElementById("confirm-reason").textContent = reason;
    confirmSheet.hidden = false;
  }
  document.getElementById("call-waiter-btn").addEventListener("click", ()=>sheet.hidden=false);
  document.getElementById("waiter-close").addEventListener("click", ()=>sheet.hidden=true);
  sheet.querySelector(".sheet-backdrop").addEventListener("click", ()=>sheet.hidden=true);
  sheet.querySelectorAll(".reason-chip").forEach(c=>{
    c.addEventListener("click", ()=>openConfirm(c.dataset.reason));
  });
  document.getElementById("custom-reason-send").addEventListener("click", ()=>{
    const v = document.getElementById("custom-reason").value.trim();
    if(!v){ toast("Ketik alasan terlebih dahulu"); return; }
    openConfirm(v);
  });

  document.getElementById("confirm-no").addEventListener("click", ()=>{ confirmSheet.hidden=true; });
  confirmSheet.querySelector(".sheet-backdrop").addEventListener("click", ()=>confirmSheet.hidden=true);
  document.getElementById("confirm-yes").addEventListener("click", ()=>{
    confirmSheet.hidden = true;
    sheet.hidden = true;
    document.getElementById("custom-reason").value = "";
    toast("Pelayan dipanggil: " + pendingReason);
  });
}

/* ---------- CART ---------- */
function addToCart(item){
  const s = getState();
  const existing = s.cart.find(c=>c.id===item.id);
  if(existing) existing.quantity += 1;
  else s.cart.push({ id:item.id, name:item.name, price:item.price, image:item.image, quantity:1, note:"" });
  saveState(s);
}
function updateCartBadge(){
  const el = document.getElementById("nav-cart-count");
  if(!el) return;
  const count = getState().cart.reduce((a,b)=>a+b.quantity,0);
  if(count>0){ el.hidden=false; el.textContent=count; } else { el.hidden=true; }
}

if (document.body.classList.contains("cart-page")) {
  const s = getState();
  const badge = document.getElementById("cart-meja-badge");
  if(s.table){ badge.textContent = "Meja " + s.table; }

  function render(){
    const st = getState();
    const list = document.getElementById("cart-list");
    const footer = document.getElementById("cart-footer");
    if(!st.cart.length){
      list.innerHTML = `<div class="cart-empty">Keranjang masih kosong.<br/><a href="menu.html" style="color:var(--primary);font-weight:700">Lihat menu</a></div>`;
      footer.hidden = true; return;
    }
    list.innerHTML = st.cart.map(c=>{
      const menuItem = MENU.find(m=>m.id===c.id);
      const hasDiscount = menuItem && menuItem.oldPrice && menuItem.discount;
      const lineOld = hasDiscount ? menuItem.oldPrice : c.price;
      return `
      <div class="cart-item" data-id="${c.id}">
        <img src="${c.image}" alt="${c.name}"/>
        <div class="cart-item-body">
          <p class="cart-item-name">${c.name}</p>
          <span class="cart-item-price">
            ${hasDiscount ? `<span class="cart-old">${formatPrice(menuItem.oldPrice)}</span>` : ""}
            ${formatPrice(c.price)}
            ${hasDiscount ? `<span class="cart-disc">${menuItem.discount}% OFF</span>` : ""}
          </span>
          <input class="cart-note" type="text" placeholder="Catatan (opsional)" value="${c.note||""}" data-note="${c.id}"/>
          <div class="qty-row">
            <button class="qty-btn" data-dec="${c.id}">−</button>
            <span class="qty-num">${c.quantity}</span>
            <button class="qty-btn" data-inc="${c.id}">+</button>
          </div>
        </div>
      </div>
    `}).join("");

    let subtotal = 0, discount = 0;
    for(const c of st.cart){
      const m = MENU.find(x=>x.id===c.id);
      const base = (m && m.oldPrice) ? m.oldPrice : c.price;
      subtotal += base * c.quantity;
      discount += (base - c.price) * c.quantity;
    }
    const total = subtotal - discount;

    document.getElementById("cart-subtotal").textContent = formatPrice(subtotal);
    const discRow = document.getElementById("discount-row");
    if(discount > 0){ discRow.hidden = false; document.getElementById("cart-discount").textContent = "- " + formatPrice(discount); }
    else { discRow.hidden = true; }
    document.getElementById("cart-total").textContent = formatPrice(total);
    footer.hidden = false;
  }
  render();

  document.addEventListener("click",(e)=>{
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if(inc||dec){
      const id = (inc||dec).dataset.inc || (inc||dec).dataset.dec;
      const st = getState();
      const item = st.cart.find(c=>c.id===id);
      if(item){
        item.quantity += inc?1:-1;
        if(item.quantity<=0) st.cart = st.cart.filter(c=>c.id!==id);
        saveState(st); render();
      }
    }
  });
  document.addEventListener("input",(e)=>{
    const n = e.target.closest("[data-note]");
    if(n){
      const st = getState();
      const item = st.cart.find(c=>c.id===n.dataset.note);
      if(item){ item.note = n.value; saveState(st); }
    }
  });
  const confirmOrder = document.getElementById("confirm-order");
  function computeBill(){
    const st = getState();
    let subtotal=0, discount=0;
    for(const c of st.cart){
      const m = MENU.find(x=>x.id===c.id);
      const base = (m && m.oldPrice) ? m.oldPrice : c.price;
      subtotal += base*c.quantity;
      discount += (base - c.price)*c.quantity;
    }
    return { subtotal, discount, total: subtotal-discount };
  }
  function openConfirm(){
    const st = getState();
    if(!st.cart.length) return;
    document.getElementById("confirm-meja").textContent = st.table || "-";
    document.getElementById("confirm-items").innerHTML = st.cart.map(c=>`
      <li class="confirm-item">
        <span class="ci-qty">${c.quantity}×</span>
        <span class="ci-name">${c.name}</span>
        <span class="ci-price">${formatPrice(c.price*c.quantity)}</span>
      </li>`).join("");
    const { subtotal, discount, total } = computeBill();
    document.getElementById("confirm-subtotal").textContent = formatPrice(subtotal);
    const dr = document.getElementById("confirm-disc-row");
    if(discount>0){ dr.hidden=false; document.getElementById("confirm-discount").textContent = "- "+formatPrice(discount); }
    else dr.hidden = true;
    document.getElementById("confirm-total").textContent = formatPrice(total);
    confirmOrder.hidden = false;
  }
  document.getElementById("checkout-btn").addEventListener("click", openConfirm);
  document.getElementById("confirm-order-cancel").addEventListener("click",()=>confirmOrder.hidden=true);
  document.getElementById("confirm-order-close").addEventListener("click",()=>confirmOrder.hidden=true);
  confirmOrder.querySelector(".sheet-backdrop").addEventListener("click",()=>confirmOrder.hidden=true);
  document.getElementById("confirm-order-yes").addEventListener("click",()=>{
    const { total } = computeBill();
    const st = getState();
    sessionStorage.setItem("pending_total", total);
    sessionStorage.setItem("pending_table", st.table || "");
    sessionStorage.setItem("pending_items", JSON.stringify(st.cart));
    location.href = "payment.html";
  });
}

/* ---------- PAYMENT ---------- */
if (document.body.classList.contains("payment-page")) {
  function syncSelected(){
    document.querySelectorAll(".pay-row").forEach(row=>row.classList.toggle("selected", row.querySelector("input").checked));
  }
  document.querySelectorAll('input[name="method"]').forEach(r=>r.addEventListener("change", syncSelected));
  syncSelected();
  document.getElementById("proceed-btn").addEventListener("click",()=>{
    const method = document.querySelector('input[name="method"]:checked').value;
    sessionStorage.setItem("pay_method", method);
    if(method === "qris"){
      location.href = "qris.html";
    } else {
      // Cash / EDC → tunjukkan order ke kasir
      const orderNo = "1200000" + Math.floor(100000 + Math.random()*900000);
      sessionStorage.setItem("last_order", orderNo);
      location.href = "cash.html";
    }
  });
}

/* ---------- CASH (tunjukkan ke kasir) ---------- */
if (document.body.classList.contains("cash-page")) {
  const orderNo = sessionStorage.getItem("last_order") || ("1200000" + Math.floor(100000 + Math.random()*900000));
  sessionStorage.setItem("last_order", orderNo);
  const table = sessionStorage.getItem("pending_table") || (getState().table || "-");
  const items = JSON.parse(sessionStorage.getItem("pending_items") || "[]");
  const total = Number(sessionStorage.getItem("pending_total") || 0);
  let subtotal = 0, discount = 0;
  for(const c of items){
    const m = MENU.find(x=>x.id===c.id);
    const base = (m && m.oldPrice) ? m.oldPrice : c.price;
    subtotal += base*c.quantity;
    discount += (base - c.price)*c.quantity;
  }
  document.getElementById("cash-order-no").textContent = "#"+orderNo;
  document.getElementById("cash-meja").textContent = "Meja " + table;
  document.getElementById("cash-items").innerHTML = items.map(c=>`
    <li class="confirm-item">
      <span class="ci-qty">${c.quantity}×</span>
      <span class="ci-name">${c.name}</span>
      <span class="ci-price">${formatPrice(c.price*c.quantity)}</span>
    </li>`).join("");
  document.getElementById("cash-subtotal").textContent = formatPrice(subtotal);
  if(discount>0){
    document.getElementById("cash-disc-row").hidden = false;
    document.getElementById("cash-discount").textContent = "- "+formatPrice(discount);
  }
  document.getElementById("cash-total").textContent = formatPrice(total);

  document.getElementById("cash-paid").addEventListener("click", ()=>{
    sessionStorage.setItem("order_confirmed", "1");
    setState({ cart: [] });
    location.href = "success.html";
  });
}

/* ---------- QRIS ---------- */
if (document.body.classList.contains("qris-page")) {
  const total = Number(sessionStorage.getItem("pending_total") || 0);
  const orderNo = "1200000" + Math.floor(100000 + Math.random()*900000);
  document.getElementById("qris-total").textContent = formatPrice(total);
  document.getElementById("qris-order-no").textContent = orderNo;
  const t = document.getElementById("qris-timer");
  const doneBtn = document.getElementById("qris-done");
  const timeoutModal = document.getElementById("qris-timeout");
  const failModal = document.getElementById("qris-fail");
  const DURATION = 15*60;
  let secs = DURATION, iv = null, expired = false;

  function tick(){
    secs--;
    const m = Math.floor(secs/60), s = ((secs%60)+60)%60;
    t.textContent = String(Math.max(0,m)).padStart(2,"0")+":"+String(s).padStart(2,"0");
    if(secs<=0){ stopTimer(); onTimeout(); }
  }
  function startTimer(){
    stopTimer();
    secs = DURATION; expired = false;
    doneBtn.disabled = false;
    t.textContent = "15:00";
    iv = setInterval(tick, 1000);
  }
  function stopTimer(){ if(iv){ clearInterval(iv); iv=null; } }
  function onTimeout(){
    expired = true;
    doneBtn.disabled = true;
    timeoutModal.hidden = false;
  }

  startTimer();

  doneBtn.addEventListener("click", ()=>{
    if(expired) return;
    doneBtn.disabled = true;
    doneBtn.textContent = "Memverifikasi...";
    // Simulate verification; ~85% success
    setTimeout(()=>{
      const ok = Math.random() < 0.85;
      doneBtn.textContent = "I Have Paid";
      if(ok){
        stopTimer();
        sessionStorage.setItem("last_order", orderNo);
        sessionStorage.setItem("order_confirmed", "0");
        sessionStorage.setItem("qris_paid_at", String(Date.now()));
        setState({ cart: [] });
        location.href = "status.html";
      } else {
        doneBtn.disabled = false;
        failModal.hidden = false;
      }
    }, 1200);
  });

  // Timeout modal actions
  document.getElementById("qris-retry").addEventListener("click", ()=>{
    timeoutModal.hidden = true;
    startTimer();
  });
  document.getElementById("qris-cancel").addEventListener("click", ()=>{
    timeoutModal.hidden = true;
    location.href = "payment.html";
  });

  // Failure modal actions
  document.getElementById("qris-fail-retry").addEventListener("click", ()=>{
    failModal.hidden = true;
  });
  document.getElementById("qris-fail-back").addEventListener("click", ()=>{
    failModal.hidden = true;
    stopTimer();
    location.href = "payment.html";
  });
}

/* ---------- SUCCESS ---------- */
if (document.body.classList.contains("success-page")) {
  const no = sessionStorage.getItem("last_order") || Math.floor(1000+Math.random()*9000);
  const total = Number(sessionStorage.getItem("pending_total") || 0);
  const table = sessionStorage.getItem("pending_table") || "-";
  const method = (sessionStorage.getItem("pay_method") || "-").toUpperCase();
  const set = (id,v)=>{ const el=document.getElementById(id); if(el) el.textContent=v; };
  set("order-no", "#"+no);
  set("receipt-meja", table);
  set("receipt-method", method);
  set("receipt-total", formatPrice(total));
}

/* ---------- STATUS (menunggu konfirmasi penjual) ---------- */
if (document.body.classList.contains("status-page")) {
  const no = sessionStorage.getItem("last_order") || "0000";
  const total = Number(sessionStorage.getItem("pending_total") || 0);
  const table = sessionStorage.getItem("pending_table") || "-";
  const method = (sessionStorage.getItem("pay_method") || "qris").toUpperCase();
  document.getElementById("s-order-no").textContent = "#"+no;
  document.getElementById("s-meja").textContent = table;
  document.getElementById("s-method").textContent = method;
  document.getElementById("s-total").textContent = formatPrice(total);

  const CONFIRM_AFTER_MS = 12000; // simulasi: penjual konfirmasi setelah ~12 detik
  if(!sessionStorage.getItem("qris_paid_at")){
    sessionStorage.setItem("qris_paid_at", String(Date.now()));
  }

  const iconEl = document.getElementById("status-icon");
  const titleEl = document.getElementById("status-title");
  const descEl = document.getElementById("status-desc");
  const pillEl = document.getElementById("status-pill");
  const hintEl = document.getElementById("status-hint");
  const checkBtn = document.getElementById("check-status");
  const receiptBtn = document.getElementById("see-receipt");

  function isConfirmed(){
    if(sessionStorage.getItem("order_confirmed") === "1") return true;
    const paidAt = Number(sessionStorage.getItem("qris_paid_at") || Date.now());
    if(Date.now() - paidAt >= CONFIRM_AFTER_MS){
      sessionStorage.setItem("order_confirmed", "1");
      return true;
    }
    return false;
  }

  function paintAccepted(){
    iconEl.classList.remove("pending");
    iconEl.classList.add("accepted");
    iconEl.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    titleEl.textContent = "Pesanan Diterima";
    descEl.textContent = "Pesanan Anda telah dikonfirmasi penjual dan sedang diproses oleh dapur. Tekan tombol di bawah untuk melihat struk online.";
    pillEl.textContent = "Diterima";
    pillEl.classList.add("ok");
    hintEl.textContent = "Terima kasih, mohon menunggu pesanan di meja Anda.";
    checkBtn.hidden = true;
    receiptBtn.hidden = false;
  }

  if(isConfirmed()) paintAccepted();

  checkBtn.addEventListener("click", ()=>{
    checkBtn.disabled = true;
    const original = checkBtn.textContent;
    checkBtn.textContent = "Memeriksa...";
    setTimeout(()=>{
      if(isConfirmed()){
        paintAccepted();
        toast("Pesanan telah dikonfirmasi penjual");
      } else {
        checkBtn.disabled = false;
        checkBtn.textContent = original;
        toast("Pesanan masih menunggu konfirmasi");
      }
    }, 900);
  });

  receiptBtn.addEventListener("click", ()=>{
    location.href = "success.html";
  });
}

/* ---------- REVIEW ---------- */
if (document.body.classList.contains("review-page")) {
  let rating = 0;
  const labels = ["Pilih jumlah bintang","Sangat kurang","Kurang","Cukup","Baik","Sangat baik"];
  const stars = document.querySelectorAll("#rating-row .star");
  const labelEl = document.getElementById("rating-label");
  stars.forEach(s=>{
    s.addEventListener("click", ()=>{
      rating = Number(s.dataset.v);
      stars.forEach(x=>x.classList.toggle("active", Number(x.dataset.v) <= rating));
      labelEl.textContent = labels[rating];
    });
  });
  document.querySelectorAll(".tag-chip").forEach(c=>{
    c.addEventListener("click", ()=>c.classList.toggle("active"));
  });
  document.getElementById("submit-review").addEventListener("click", ()=>{
    if(rating === 0){ toast("Pilih jumlah bintang terlebih dahulu"); return; }
    document.getElementById("review-thanks").hidden = false;
    // Bersihkan sesi pesanan
    ["pending_total","pending_table","pending_items","last_order","pay_method","order_confirmed","qris_paid_at"]
      .forEach(k=>sessionStorage.removeItem(k));
  });
  document.getElementById("skip-review").addEventListener("click", ()=>{
    location.href = "index.html";
  });
}

