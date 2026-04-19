// ======== AUTHENTICATION ========

app.switchAuthTab = function(tab) {
    document.querySelectorAll('.auth-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.auth-form-wrapper').forEach(form => form.classList.remove('active'));
    
    if (tab === 'login') {
        document.querySelectorAll('.auth-tab')[0].classList.add('active');
        document.getElementById('form-login').classList.add('active');
    } else {
        document.querySelectorAll('.auth-tab')[1].classList.add('active');
        document.getElementById('form-register').classList.add('active');
    }
};

app.login = async function() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const errorMsg = document.getElementById("login-error");
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.token) {
                let role = 'cliente';
                if (email.toLowerCase().includes('admin')) {
                    role = 'admin';
                } else if (email.toLowerCase().includes('jefe')) {
                    role = 'jefe';
                }
                
                app.state.token = data.token;
                app.state.userRole = role;
                app.state.userEmail = email;
                app.state.userName = email.split('@')[0];
                app.state.userId = Math.floor(Math.random() * 10) + 1; 
                
                let localGuideRaw = localStorage.getItem(`auth_hasSeenGuide_${email}`);
                if (localGuideRaw === null) {
                    app.state.hasSeenGuide = false;
                } else {
                    app.state.hasSeenGuide = localGuideRaw === "true" || (data.hasSeenGuide === true);
                }

                localStorage.setItem("auth_token", app.state.token);
                localStorage.setItem("auth_role", app.state.userRole);
                localStorage.setItem("auth_name", app.state.userName);
                localStorage.setItem("auth_email", app.state.userEmail);
                localStorage.setItem("auth_id", app.state.userId);
                localStorage.setItem(`auth_hasSeenGuide_${email}`, app.state.hasSeenGuide);

                app.showToast("¡Bienvenida de nuevo! Qué alegría verte.", "success");
                app.navigateToDashboard();
            } else {
                errorMsg.textContent = "Las credenciales no son correctas. Vuelve a intentarlo.";
            }
        } else {
            errorMsg.textContent = "Las credenciales no son correctas. Vuelve a intentarlo.";
        }
    } catch (error) {
        console.error("Login Error:", error);
        app.showToast("No hemos podido conectar con el servidor. Comprueba tu red.", "error");
    }
};

app.register = async function() {
    const name = document.getElementById("reg-name").value;
    const email = document.getElementById("reg-email").value;
    const phone = document.getElementById("reg-phone").value;
    const password = document.getElementById("reg-password").value;
    const errorMsg = document.getElementById("register-error");

    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, phone, password })
        });

        if (response.ok) {
            app.showToast("¡Tu cuenta ha sido creada con éxito! Ya puedes acceder.", "success");
            
            // Forzar que el tutorial aparezca sí o sí limpiando basuras locales
            localStorage.removeItem(`auth_hasSeenGuide_${email}`);
            app.state.justRegistered = true;

            app.switchAuthTab('login');
            document.getElementById("login-email").value = email;
        } else {
            errorMsg.textContent = "No hemos podido completar el registro. Inténtalo de nuevo.";
        }
    } catch (error) {
        console.error("Register Error:", error);
        app.showToast("No hemos podido conectar con el servidor. Comprueba tu red.", "error");
    }
};

app.logout = function() {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_role");
    localStorage.removeItem("auth_name");
    localStorage.removeItem("auth_email");
    localStorage.removeItem("auth_id");

    app.state.token = null;
    app.state.userRole = null;
    app.navigateTo('landing');
    app.showToast("Hasta pronto. ¡Te esperamos!", "info");
};

app.deleteAccount = function() {
    if(confirm("¿Deseas cancelar tu cuenta? Esta acción no se puede deshacer y perderás todas tus reservas.")){
        app.showToast("Cuenta cancelada. Esperamos verte de nuevo pronto.", "success");
        app.logout();
    }
};
