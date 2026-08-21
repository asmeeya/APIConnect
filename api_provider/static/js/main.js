// Provider Frontend Scripts

async function handleProviderLogin(event) {
    event.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const alertBox = document.getElementById("loginAlert");
    const btn = document.getElementById("loginBtn");

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Authenticating...`;

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        alertBox.classList.remove("d-none", "alert-danger", "alert-success");
        if (res.ok && data.success) {
            alertBox.classList.add("alert-success");
            alertBox.innerHTML = `<i class="bi bi-check-circle me-1"></i> ${data.message}`;
            
            const tokenBox = document.getElementById("tokenResultBox");
            if (tokenBox) {
                tokenBox.classList.remove("d-none");
                document.getElementById("jwtOutput").value = data.data.token;
            }
            sessionStorage.setItem("provider_jwt_token", data.data.token);
        } else {
            alertBox.classList.add("alert-danger");
            alertBox.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i> ${data.message || 'Login failed'}`;
        }
    } catch (err) {
        alertBox.classList.remove("d-none", "alert-success");
        alertBox.classList.add("alert-danger");
        alertBox.innerHTML = `<i class="bi bi-wifi-off me-1"></i> Network error connecting to API provider.`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-box-arrow-in-right me-1"></i> Authenticate &amp; Get Token`;
    }
}

async function handleProviderRegister(event) {
    event.preventDefault();
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const alertBox = document.getElementById("registerAlert");
    const btn = document.getElementById("regBtn");

    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-1"></span> Registering...`;

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        alertBox.classList.remove("d-none", "alert-danger", "alert-success");
        if (res.ok && data.success) {
            alertBox.classList.add("alert-success");
            alertBox.innerHTML = `<i class="bi bi-check-circle me-1"></i> ${data.message} Redirecting to login...`;
            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } else {
            alertBox.classList.add("alert-danger");
            alertBox.innerHTML = `<i class="bi bi-exclamation-triangle me-1"></i> ${data.message || 'Registration failed'}`;
        }
    } catch (err) {
        alertBox.classList.remove("d-none", "alert-success");
        alertBox.classList.add("alert-danger");
        alertBox.innerHTML = `<i class="bi bi-wifi-off me-1"></i> Network error registering user.`;
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<i class="bi bi-person-check me-1"></i> Register Account`;
    }
}

function copyToken() {
    const textarea = document.getElementById("jwtOutput");
    if (textarea) {
        textarea.select();
        navigator.clipboard.writeText(textarea.value);
        alert("JWT Token copied to clipboard!");
    }
}

async function autoFillAdminToken() {
    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "admin@example.com", password: "Admin@123456" })
        });
        const data = await res.json();
        if (data.success && data.data.token) {
            const tokenInput = document.getElementById("activeJwtToken");
            if (tokenInput) {
                tokenInput.value = data.data.token;
            }
            alert("Admin token fetched and set successfully!");
        }
    } catch (e) {
        alert("Failed to auto-sign-in admin.");
    }
}

async function testLiveEndpoint(endpoint, method = "GET") {
    const consoleCard = document.getElementById("liveConsoleCard");
    const consoleOutput = document.getElementById("liveConsoleOutput");
    if (!consoleCard || !consoleOutput) return;

    consoleCard.classList.remove("d-none");
    consoleOutput.textContent = `Executing ${method} ${endpoint} ...\n`;

    try {
        const token = document.getElementById("activeJwtToken")?.value || "";
        const headers = { "Content-Type": "application/json" };
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(endpoint, { method, headers });
        const json = await res.json();
        consoleOutput.textContent = `HTTP Status: ${res.status} ${res.statusText}\n\n` + JSON.stringify(json, null, 2);
    } catch (err) {
        consoleOutput.textContent = `Error executing request: ${err.message}`;
    }
}
