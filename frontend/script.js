console.log("✅ script.js loaded!");

const modal = document.getElementById("logoutModal");

const backendURL = "https://cd-un1i.onrender.com";
// Helper function for API calls with automatic token expiry handling
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  // Attach token if not already added
  if (token && !options.headers?.Authorization) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`
    };
  }

  try {
    const res = await fetch(`${backendURL}${endpoint}`, options);
    const data = await res.json();

    // Check for expired or invalid token
    if (data.message === "Invalid token" || data.message === "Token expired") {
      alert(" Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      updateAuthButtons();
      showLandingPage();
      throw new Error("Session expired");
    }

    return data;

  } catch (err) {
    console.error(" API Error:", err);
    throw err;
  }
}



function showSection(id) {
  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');

  // Change background based on section
  const body = document.body;
  body.style.transition = "background 0.5s ease-in-out"; // smooth fade

  switch(id) {
    case 'findWorker':
      body.style.backgroundImage = "url('img/fw3.jpeg')";
      body.style.backgroundRepeat = "no-repeat";
      body.style.backgroundSize = "100% auto";  // force full width & height
      body.style.backgroundPosition = "center 40%";
      const hed2 = document.querySelector(".site-header");
        if(hed2){
    hed2.style.backgroundColor = "#0606068f";
  }
      break;
   
      case 'home':
          body.style.backgroundImage = "url('img/j5.jpeg') ";
      // body.style.backgroundPosition = "center 30%";

            const hed3 = document.querySelector(".site-header");
        if(hed3){
    hed3.style.backgroundColor = "#08080897";
  }
      break;



    case 'addWorker':
      body.style.backgroundImage = "url('img/j4.jpeg') ";
      body.style.backgroundRepeat = "no-repeat";
      body.style.backgroundSize = "100% 1000px"; 
      body.style.backgroundPosition = "center 20%";
            const hed1 = document.querySelector(".site-header");
        if(hed1){
    hed1.style.backgroundColor = "#0808089b";
  }

      break;

    default:
      body.style.backgroundImage =  "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('img/bg2.jpeg')";
      const hed = document.querySelector(".site-header");
        if(hed){
    hed.style.backgroundColor = "rgba(0, 0, 0, 0.11)";
  }
  const title=document.querySelector(".brand-title");
   title.style.fontSize = "28px"; // change 28px to any size you want
    title.style.fontWeight = "700"; // optional, ensure bold
  body.style.backgroundRepeat = "no-repeat";
      body.style.backgroundSize = "100% 800px"; 
      body.style.backgroundPosition = "center 30%";

  }
}


// Is valid phone 
function isValidPhone(phone) {
  return /^[6-9]\d{9}$/.test(phone);  // Indian 10-digit mobile validation
}

// Is valid email
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Is valid aadhar
function isValidAadhaar(aadhaar) {
  return /^[2-9]\d{11}$/.test(aadhaar);
}

// Helper: escape HTML
function escapeHtml(s){ 
  return String(s||'').replace(/[&<>"']/g, m=>(
    {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[m]
  )); 
}

// ========== Signup ==========
// ========== Signup ==========
const signupForm = document.getElementById('signupForm');

if (signupForm) {
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    const name = document.getElementById('su_name').value.trim();
    const phone = document.getElementById('su_phone').value.trim();
    const pwd = document.getElementById('su_password').value;

    if (!name || !isValidPhone(phone) || !pwd) {
      document.getElementById('signupMsg').textContent = t("signupError");
      document.getElementById('signupMsg').style.color = 'crimson';
      return;
    }

    try {
      const res = await fetch(`${backendURL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, password: pwd })
      });

      const data = await res.json();

      document.getElementById('signupMsg').textContent = data.message || data.error;
      document.getElementById('signupMsg').style.color = data.success ? 'green' : 'crimson';

      if (data.success) {
        // ✅ Show floating success message for 2 seconds
        const msg = document.createElement("div");
        msg.textContent = "Signup successful!";
        msg.style.cssText = `
          background: #4caf50;
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          position: fixed;
          top: 15px;
          left: 50%;
          transform: translateX(-50%);
          box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          font-weight: 500;
          z-index: 9999;
        `;
        document.body.appendChild(msg);
        setTimeout(() => msg.remove(), 2000);

        // Redirect or show login section after success
        setTimeout(() => showSection('login'), 2000);
      }
    } catch (err) {
      document.getElementById('signupMsg').textContent = t("serverError");
      document.getElementById('signupMsg').style.color = 'crimson';
    }
  });
}


// Optional helper
function isValidPhone(phone) {
  return /^[0-9]{10}$/.test(phone); // basic 10-digit validation
}

// ========== Login ==========
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit', async function(e){
    e.preventDefault();

    const phone = document.getElementById('lg_phone').value.trim();
    const pwd = document.getElementById('lg_password').value;

    if(!isValidPhone(phone) || !pwd){
      document.getElementById('loginMsg').textContent = "⚠️ Invalid phone or password.";
      document.getElementById('loginMsg').style.color='crimson';
      return;
    }

    try {
      const res = await fetch(`${backendURL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password: pwd })
      });
      const data = await res.json();
   if(data.success && data.token){
  localStorage.setItem("token", data.token);
  if (data.name) localStorage.setItem("userName", data.name);

  document.getElementById('loginMsg').textContent = "✅ Login successful.";
  document.getElementById('loginMsg').style.color='green';
  updateAuthButtons();

  // Show nav + main content
  document.getElementById("mainNav").style.display = "flex"; 
  document.getElementById("mainContent").style.display = "block";

  // Delay so user sees success msg
  setTimeout(()=>{
    showSection('home');
    const nav = document.getElementById('adminBtn');
    if(nav) nav.style.display = "none";
    clearForms();
  }, 1200);


      } else {
        document.getElementById('loginMsg').textContent = data.message || "❌ Login failed.";
        document.getElementById('loginMsg').style.color='crimson';
      }
    } catch (err) {
      document.getElementById('loginMsg').textContent = "❌ Server error.";
      document.getElementById('loginMsg').style.color='crimson';
    }
  });
}


// ========== Add Worker ==========
const addForm = document.getElementById('addForm');
if(addForm){
  addForm.addEventListener('submit', async function(e){
    e.preventDefault();
    const msg = document.getElementById('addFormMsg');

    const token = localStorage.getItem("token");

    // Collect values
    const name = document.getElementById('aw_name').value.trim();
    const phone = document.getElementById('aw_phone').value.trim();
    const email = document.getElementById('aw_email').value.trim();
    const address = document.getElementById('aw_address').value.trim();
    const city = document.getElementById('aw_city').value.trim();
    const pincode = document.getElementById('aw_pincode').value.trim();
    const categorySelect = document.getElementById('aw_category');
    const category = categorySelect.value === "other" ? document.getElementById("aw_category_other").value.trim() : categorySelect.value;
    const gender = document.getElementById('aw_gender').value;
    const experience = document.getElementById('aw_experience').value.trim();
    const availability = document.getElementById('aw_availability').value.trim();
    const aadhaar = document.getElementById('aw_aadhaar').value.trim();
    const aadhaarPhoto = document.getElementById('aw_aadhaar_photo').files[0];

    // FRONTEND VALIDATION
    if(!name || !phone || !address || !city || !pincode || !category || !gender || !aadhaar){
      msg.textContent = "❌ All fields are required!";
      msg.style.color = 'crimson';
      return;
    }

    if(!/^[6-9]\d{9}$/.test(phone)){
      msg.textContent = "❌ Invalid phone number!";
      msg.style.color = 'crimson';
      return;
    }

    if(!/^[2-9]\d{11}$/.test(aadhaar)){
      msg.textContent = "❌ Invalid Aadhaar number!";
      msg.style.color = 'crimson';
      return;
    }
// Check for duplicate Aadhaar
try {
  const checkRes = await fetch(`${backendURL}/check-aadhaar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ aadhaar })
  });
  const checkData = await checkRes.json();
  if (checkData.exists) {
    msg.textContent = "⚠️ Aadhaar number already registered!";
    msg.style.color = 'crimson';
    return; // stop form submission
  }
} catch (err) {
  console.error("Error checking Aadhaar:", err);
  msg.textContent = "❌ Server error while checking Aadhaar.";
  msg.style.color = 'crimson';
  return;
}

    if(!aadhaarPhoto){
      msg.textContent = "❌ Aadhaar photo is required!";
      msg.style.color = 'crimson';
      return;
    }

    // ✅ All frontend validation passed, prepare FormData
    const formData = new FormData();
    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("email", email);
    formData.append("address", address);
    formData.append("city", city);
    formData.append("pincode", pincode);
    formData.append("category", category);
    formData.append("gender", gender);
    formData.append("experience", experience);
    formData.append("availability", availability);
    formData.append("aadhaar", aadhaar);
    formData.append("aadhaarPhoto", aadhaarPhoto);
    const profilePhoto = document.getElementById('aw_profile_photo').files[0];
    if(profilePhoto) formData.append("profilePhoto", profilePhoto);

 try {
        const res = await fetch(`${backendURL}/add-worker`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        console.log("📦 Backend response:", data);
console.log("✅ Response received:", data);
if (data && (data.success || data.message)) {
  alert("✅ Worker Added! " + (data.message || ""));
}

// 💬 Debug to confirm frontend got the response
console.log("📦 Backend response (confirmed):", data);

// ✅ If backend returned success
if (data && data.success) {
  // ✅ Create success screen
  const successScreen = document.createElement("div");
  successScreen.className = "success-screen";
  successScreen.innerHTML = `
    <h2>Worker Added Successfully!</h2>
    <button id="okBtn">OK</button>
  `;
  document.body.appendChild(successScreen);

  // ✅ Handle OK button
  document.getElementById("okBtn").addEventListener("click", () => {
    successScreen.classList.add("fade-out");
    setTimeout(() => {
      successScreen.remove(); // remove popup
      document.getElementById("homeSection").style.display = "block"; // show home
      document.getElementById("addWorkerSection").style.display = "none"; // hide form
    }, 2000); // match fade-out time
  });
}


// ⚠️ If backend returned an error
else if (data && data.error) {
  msg.textContent = data.error;
  msg.style.color = "crimson";
  alert("❌ Error: " + data.error);
}
// ⚠️ Unexpected reply
else {
  msg.textContent = "⚠️ Unexpected response from server.";
  msg.style.color = "orange";
}
} catch (err) {
  console.error("❌ Error adding worker:", err);
  msg.textContent = "❌ Network or server error.";
  msg.style.color = "crimson";
}
  }); // ✅ closes addEventListener
} 
// ========== Find Worker ==========
const findForm = document.getElementById('findForm');
if(findForm){
  findForm.addEventListener('submit', async function(e){
    e.preventDefault();

    const token = localStorage.getItem("token");
    if(!token){
      const msg = document.getElementById('findFormMsg');
      if(msg){
        msg.textContent = t("pleaseLoginSearch");
        msg.style.color = 'crimson';
      }
      showSection("signup"); 
      return;
    }

    // ✅ FRONTEND VALIDATION
    const location = document.getElementById('fw_location').value.trim();
    const category = document.getElementById('fw_category').value === "other"
      ? document.getElementById('fw_category_other').value.trim()
      : document.getElementById('fw_category').value;
    const gender = document.getElementById('fw_gender').value;

    if(!location && !category && !gender){
      const msg = document.getElementById('findFormMsg');
      msg.textContent = "❌ Please enter at least one search filter (location, category, or gender).";
      msg.style.color = 'crimson';
      return;
    }

    // ✅ Continue to backend only if valid
    const search = { location, category, gender };

    try {
      const res = await fetch(`${backendURL}/find-worker`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(search)
      });

      const workers = await res.json();
      const area = document.getElementById('results');
      area.innerHTML = `<h3>Search Results (${workers.length || 0})</h3>`;

      if(!Array.isArray(workers) || workers.length === 0 || workers.error){
        area.innerHTML += `<p class="muted">${workers.error || "⚠️ No workers found."}</p>`;
        document.getElementById('findFormMsg').textContent = workers.error || "⚠️ No workers found.";
        document.getElementById('findFormMsg').style.color = 'crimson';
      } else {
        workers.forEach(w=>{
          const card = document.createElement('div');
          card.className='result-card';
          card.innerHTML = `
            <div class="meta">
              <strong>${escapeHtml(w.name)}</strong><br>
              ${escapeHtml(w.category)} • ${escapeHtml(w.experience || '0')} yrs<br>
              📍 ${escapeHtml(w.city)} • 📞 ${escapeHtml(w.phone)}<br>
              ${w.availability ? '⏰ '+escapeHtml(w.availability):''}
            </div>`;
          area.appendChild(card);
        });

        document.getElementById('findFormMsg').textContent = `✅ Found ${workers.length} worker(s).`;
        document.getElementById('findFormMsg').style.color = 'green';
      }

    } catch (err) {
      document.getElementById('findFormMsg').textContent = t("serverError");
      document.getElementById('findFormMsg').style.color = 'crimson';
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logoutOkBtn");
  if(logoutBtn){
    logoutBtn.addEventListener("click", () => {
      const modal = document.getElementById("logoutModal");
      if(modal) modal.style.display = "none";

      localStorage.removeItem("token");
      updateAuthButtons();
      clearForms();
      showLandingPage();

      const nav = document.getElementById("mainNav");
      if(nav) nav.style.display = "none";

      const main = document.getElementById("mainContent");
      if(main) main.style.display = "block";

      showSection("landing");
    });
  }
});



async function updateAuthButtons() {
  const token = localStorage.getItem("token");
  const loginBtn = document.querySelector(".nav-login");
  const logoutBtn = document.querySelector(".nav-logout");

  if (token) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "inline-flex";

  } else {
    loginBtn.style.display = "inline-flex";
    logoutBtn.style.display = "none";
  }
  updateGreeting(); 
}


// Run when page loads
document.addEventListener("DOMContentLoaded", updateAuthButtons);


function clearForms(){
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const addForm = document.getElementById("addForm");

  if(loginForm) loginForm.reset();
  if(signupForm) signupForm.reset();
  if(addForm) addForm.reset();
}


// ===== Categories =====
const categories = [
  "Plumber",
  "Site Worker",
  "Electrician",
  "Carpenter",
  "Painter",
  "Driver",
  "Cook",
  "Maid",
  "Security Guard",
  "Gardener",
  "Other"
];

function populateCategories(){
  const awSelect = document.getElementById("aw_category");
  const fwSelect = document.getElementById("fw_category");

  // Clear any existing options
  if(awSelect) awSelect.innerHTML = "";
  if(fwSelect) fwSelect.innerHTML = "";

  // ✅ Add placeholder option (always default)
  if(awSelect){
    let placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select category";
    placeholder.disabled = true;
    placeholder.selected = true;
    awSelect.appendChild(placeholder);
    awSelect.required = true;
  }

  if(fwSelect){
    let placeholder2 = document.createElement("option");
    placeholder2.value = "";
    placeholder2.textContent = "Select category";
    placeholder2.disabled = true;
    placeholder2.selected = true;
    fwSelect.appendChild(placeholder2);
    fwSelect.required = true;
  }

  // Add actual categories
  categories.forEach(cat => {
    if(awSelect){
      let opt1 = document.createElement("option");
      opt1.value = cat.toLowerCase().replace(/\s+/g, "-");  // value = "plumber", "site-worker"
      opt1.textContent = cat;                               // visible text
      awSelect.appendChild(opt1);
    }

    if(fwSelect){
      let opt2 = document.createElement("option");
      opt2.value = cat.toLowerCase().replace(/\s+/g, "-");
      opt2.textContent = cat;
      fwSelect.appendChild(opt2);
    }
  });
}

/// DOM
document.addEventListener("DOMContentLoaded", () => {
  // Auth buttons
  updateAuthButtons();

  // Populate categories
  populateCategories();

  // Setup "Other" category inputs
  setupCategoryInputs("aw_category", "aw_category_other");
  setupCategoryInputs("fw_category", "fw_category_other");

  // Show landing page initially
  showLandingPage();

  // Logout button handler
  const logoutBtn = document.getElementById("logoutOkBtn");
  if(logoutBtn){
    logoutBtn.addEventListener("click", () => {
      const modal = document.getElementById("logoutModal");
      if(modal) modal.style.display = "none";

      localStorage.removeItem("token");
      localStorage.removeItem("userName");
updateGreeting();

      updateAuthButtons();
      clearForms();
      showLandingPage();

      const nav = document.getElementById("mainNav");
      if(nav) nav.style.display = "none";

      const main = document.getElementById("mainContent");
      if(main) main.style.display = "block";

      showSection("landing");
    });
  }
});



/// helper function
function setupCategoryInputs(selectId, otherId){
  const selectEl = document.getElementById(selectId);
  const otherEl = document.getElementById(otherId);
  if (!selectEl || !otherEl) return;

  selectEl.addEventListener("change", function () {
    if (this.value === "other") {
      otherEl.style.display = "block";
    } else {
      otherEl.style.display = "none";
      otherEl.value = "";
    }
  });

  otherEl.addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z\s]/g, "");
  });
}


// Show landing page function
function showLandingPage() {
  const main = document.getElementById("mainContent");
  if(main) main.style.display = "block";  
  showSection("landing");                  
}



  const loginMsg = document.getElementById("loginMsg");
  if(loginMsg) loginMsg.textContent = "";


  document.addEventListener("DOMContentLoaded", () => {
  const logoutNavBtn = document.querySelector(".nav-logout");
  const logoutModal = document.getElementById("logoutModal");

  // when user clicks Cancel inside popup
  const cancelBtn = document.getElementById("logoutCancelBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      logoutModal.style.display = "none"; // hide popup
    });
  }
});

// When page loads, check login state and restore home if logged in
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");

  if (token) {
    // User already logged in — show home section
    document.getElementById("mainNav").style.display = "flex";
    document.getElementById("mainContent").style.display = "block";
    updateAuthButtons();
    showSection("home");
  } else {
    // Not logged in — show landing page
    showLandingPage();
  }
});

function scrollToServices() {
  // Make sure jk.html content is already loaded
  const section = document.querySelector("#new-content .services");
  if (section) {
    section.scrollIntoView({ behavior:'auto' });
  } else {
    // if jk.html hasn’t loaded yet, wait for it and then scroll
    const observer = new MutationObserver(() => {
      const loadedSection = document.querySelector("#new-content .services");
      if (loadedSection) {
        loadedSection.scrollIntoView({ behavior: "smooth" });
        observer.disconnect();
      }
    });
    observer.observe(document.getElementById("new-content"), { childList: true, subtree: true });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const logoutNavBtn = document.querySelector(".nav-logout");
  const logoutModal = document.getElementById("logoutModal");
  const logoutOkBtn = document.getElementById("logoutOkBtn");
  const logoutCancelBtn = document.getElementById("logoutCancelBtn");

  // 🟢 When user clicks Logout in navbar → show modal
  if (logoutNavBtn && logoutModal) {
    logoutNavBtn.addEventListener("click", () => {
      logoutModal.style.display = "flex";
    });
  }

  // 🟢 When user confirms logout → clear session
  if (logoutOkBtn) {
    logoutOkBtn.addEventListener("click", () => {
      logoutModal.style.display = "none";
      localStorage.removeItem("token");
      updateAuthButtons();
      clearForms();
      showLandingPage();
      showSection("landing");
    });
  }

  // 🟢 When user cancels logout → hide modal
  if (logoutCancelBtn) {
    logoutCancelBtn.addEventListener("click", () => {
      logoutModal.style.display = "none";
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const adminBtn = document.getElementById("adminBtn");
  if(adminBtn){
    adminBtn.addEventListener("click", () => {
      // Show the admin login modal/section
      showSection("adminLogin"); // create a section for admin login
      const nav = document.getElementById("new-content");
      if(nav) nav.style.display = "none";

// const nav1 = document.getElementById("langSelect");
// if(nav1) nav1.style.display="none";

// const nav2 = document.getElementById("adminBtn");
// if(nav2) nav2.style.display="none";

    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const adminLoginForm = document.getElementById("adminLoginForm");
  if(adminLoginForm){
    adminLoginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = document.getElementById("adminUser").value.trim();
      const pass = document.getElementById("adminPass").value.trim();

      if(user === "admin" && pass === "123"){
        localStorage.setItem("isAdmin", "true");

        // Hide normal nav and show admin dashboard
        const nav = document.getElementById("mainNav");
        if(nav) nav.style.display = "none";

        showSection("adminDashboard");
        loadWorkersForAdmin(); // populate workers table
      } else {
        const msg = document.getElementById("adminLoginMsg");
        if(msg){
          msg.textContent = "❌ Invalid credentials!";
          msg.style.color = "crimson";
        }
      }
    });
  }
});

// Load Workers

async function loadWorkersForAdmin() {
  const res = await fetch(`${backendURL}/workers`);
  const workers = await res.json();

  const tbody = document.getElementById("adminWorkersTbody");
  tbody.innerHTML = "";

  workers.forEach(w => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(w.name)}</td>
      <td>${escapeHtml(w.category)}</td>
      <td>${escapeHtml(w.experience)}</td>
      <td>${escapeHtml(w.city)}</td>
            <td>${escapeHtml(w.availability)}</td>

      <td>${escapeHtml(w.phone)}</td>
      <td>
        <button class="btn small addDel" onclick="deleteWorker('${w._id}')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}
document.getElementById("adminSearchInput").addEventListener("input", function() {
  const filter = this.value.toLowerCase();
  const rows = document.querySelectorAll("#adminWorkersTbody tr");

  rows.forEach(row => {
    const name = row.cells[0].textContent.toLowerCase();
    const category = row.cells[1].textContent.toLowerCase();
    const city = row.cells[2].textContent.toLowerCase();

    if(name.includes(filter) || category.includes(filter) || city.includes(filter)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
});

async function deleteWorker(id) {
  if (!confirm("Delete this worker?")) return;
  await fetch(`${backendURL}/workers/${id}`, { method: "DELETE" });
  loadWorkersForAdmin();
}

function logoutAdmin() {
  localStorage.removeItem("isAdmin");
  // Show the nav again
  // const nav = document.getElementById("mainNav");
  // if(nav) nav.style.display = "flex";

  showSection("landing");
  
}


function updateGreeting() {
  const name = localStorage.getItem("userName");
  const greeting = document.getElementById("userGreeting");
  if (greeting) {
    greeting.textContent = name ? `Hi, ${name} ` : "";
  }
}
function closeSuccessModal() {
  const modal = document.getElementById("Succ_Modal");
  if (modal) modal.style.display = "none";
    showSection("home");
}
