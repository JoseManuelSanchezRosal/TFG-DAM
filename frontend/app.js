const hostname = window.location.hostname;
const API_URL = (hostname === 'localhost' || hostname === '127.0.0.1') 
    ? "http://localhost:8082/api" 
    : `http://${hostname}:8082/api`;

const app = {
    state: {
        token: null,
        userRole: null, // 'cliente' | 'admin'
        userId: null,
        userName: null,
        userEmail: null,
        services: []
    },

    init: function() {
        // Inicializamos el wizard para TODO el mundo (público y privado)
        if (this.bookingWizard) this.bookingWizard.init();
        const storedAuth = localStorage.getItem("auth_token");
        if (storedAuth) {
            this.state.token = storedAuth;
            this.state.userRole = localStorage.getItem("auth_role") || "cliente";
            this.state.userName = localStorage.getItem("auth_name") || "Usuario";
            this.state.userEmail = localStorage.getItem("auth_email") || "";
            // Simulating parsing a JWT for ID (Simplified prototype assumption)
            this.state.userId = localStorage.getItem("auth_id") || 1; 
            this.state.hasSeenGuide = localStorage.getItem(`auth_hasSeenGuide_${this.state.userEmail}`) === "true";

            this.navigateToDashboard();
        } else {
            this.navigateTo('landing');
        }
    },

    // ======== ROUTING ========
    navigateTo: function(viewId) {
        // Auto-close mobile menu if open
        const navMenu = document.getElementById('nav-menu');
        if (navMenu && navMenu.classList.contains('nav-menu-open')) {
            navMenu.classList.remove('nav-menu-open');
        }

        // Hide all views
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active-view'));
        
        // Hide FAB globally by default when navigating — except for jefe (always visible)
        const fab = document.getElementById('global-help-fab');
        if (fab) {
            if (app.state.userRole === 'jefe') {
                fab.style.display = 'flex'; // El jefe siempre ve el botón de guía
            } else {
                fab.style.display = 'none';
            }
        }

        // Remove active class from nav
        document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active', 'highlight'));

        // Show target view
        const viewEl = document.getElementById(`view-${viewId}`);
        if(viewEl) viewEl.classList.add('active-view');
        
        // Update Nav 
        const btnId = `btn-nav-${viewId}`;
        const btnEl = document.getElementById(btnId);
        if(btnEl) btnEl.classList.add('active');

        // Session controls
        if (app.state.token) {
            const adminBtn = document.getElementById('btn-nav-admin');
            const jefeBtn = document.getElementById('btn-nav-jefe');
            
            if (app.state.userRole === 'admin') {
                if(adminBtn) adminBtn.classList.remove('hidden');
                if(jefeBtn) jefeBtn.classList.add('hidden');
            } else if (app.state.userRole === 'jefe') {
                if(adminBtn) adminBtn.classList.add('hidden');
                if(jefeBtn) jefeBtn.classList.remove('hidden');
            } else {
                if(adminBtn) adminBtn.classList.add('hidden');
                if(jefeBtn) jefeBtn.classList.add('hidden');
            }
            const logoutBtn = document.getElementById('btn-logout');
            if(logoutBtn) logoutBtn.classList.remove('hidden');
            
            // Mobile icons
            const mobileProfileBtn = document.getElementById('btn-mobile-profile');
            if(mobileProfileBtn) mobileProfileBtn.classList.remove('hidden');
            const mobileLogoutBtn = document.getElementById('btn-mobile-logout');
            if(mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
        } else {
            const adminBtn = document.getElementById('btn-nav-admin');
            if(adminBtn) adminBtn.classList.add('hidden');
            const jefeBtn = document.getElementById('btn-nav-jefe');
            if(jefeBtn) jefeBtn.classList.add('hidden');
            const logoutBtn = document.getElementById('btn-logout');
            if(logoutBtn) logoutBtn.classList.add('hidden');
            
            // Mobile icons
            const mobileProfileBtn = document.getElementById('btn-mobile-profile');
            if(mobileProfileBtn) mobileProfileBtn.classList.add('hidden');
            const mobileLogoutBtn = document.getElementById('btn-mobile-logout');
            if(mobileLogoutBtn) mobileLogoutBtn.classList.add('hidden');
            
            const clientZoneBtn = document.getElementById('btn-nav-client-zone');
            if(clientZoneBtn) clientZoneBtn.classList.add('highlight');
        }

        if (viewId === 'client-zone') {
            if (app.bookingWizard) app.bookingWizard.init();
            
            const clientGrid = document.querySelector('.client-grid');
            
            if (app.state.token && app.state.userRole !== 'admin') {
                document.getElementById('client-logged-in-header').style.display = 'block';
                const fab = document.getElementById('global-help-fab');
                if (fab) fab.style.display = 'flex';
                
                const loggedOutHeader = document.getElementById('client-logged-out-header');
                if (loggedOutHeader) loggedOutHeader.style.display = 'none';
                document.getElementById('my-appointments-card').style.display = 'block';
                if(clientGrid) clientGrid.classList.add('logged-in-grid');
                if(app.client) app.client.initAuthClient();
                if (!app.state.hasSeenGuide && app.startGuide && !app.guideActive) {
                    setTimeout(() => app.startGuide(), 500);
                }
            } else {
                document.getElementById('client-logged-in-header').style.display = 'none';
                const fab = document.getElementById('global-help-fab');
                if (fab) fab.style.display = 'none';
                
                const loggedOutHeader = document.getElementById('client-logged-out-header');
                if (loggedOutHeader) loggedOutHeader.style.display = 'block';
                document.getElementById('my-appointments-card').style.display = 'none';
                if(clientGrid) clientGrid.classList.remove('logged-in-grid');
            }
        }
    },

    navigateToDashboard: function() {
        if (!this.state.token) {
            this.navigateTo('auth');
            return;
        }

        if (this.state.userRole === 'admin') {
            this.navigateTo('superadmin');
            if (this.superadmin) this.superadmin.init();
        } else if (this.state.userRole === 'jefe') {
            this.navigateTo('admin');
            if (this.admin) this.admin.init();
            
            // El FAB siempre visible para el jefe (no depende de hasSeenGuide)
            const fab = document.getElementById('global-help-fab');
            if (fab) fab.style.display = 'flex';
        } else {
            this.navigateTo('client-zone');
        }
    },

    // ======== UTILS ========
    toggleMenu: function() {
        const navMenu = document.getElementById('nav-menu');
        if (navMenu) {
            navMenu.classList.toggle('nav-menu-open');
        }
    },

    getAuthHeaders: function() {
        return {
            "Authorization": `Bearer ${this.state.token}`,
            "Content-Type": "application/json"
        };
    },

    showToast: function(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fas fa-info-circle';
        if (type === 'success') icon = 'fas fa-check-circle';
        if (type === 'error') icon = 'fas fa-exclamation-circle';

        toast.innerHTML = `<i class="${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideIn 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    // ⚡ SOLO DESARROLLO — Acceso rápido (llama al backend real)
    DEV_PASSWORD: '1234',  // ← Cambia esto si tu contraseña de prueba es diferente

    devLogin: async function(email, role) {
        app.showToast(`Conectando como ${email}…`, 'info');
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: app.DEV_PASSWORD })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.token) {
                    this.state.token     = data.token;
                    this.state.userRole  = role;
                    this.state.userEmail = email;
                    this.state.userName  = email.split('@')[0];
                    this.state.userId    = data.id || data.userId || null;
                    this.state.hasSeenGuide = localStorage.getItem(`auth_hasSeenGuide_${email}`) === 'true';

                    localStorage.setItem('auth_token', data.token);
                    localStorage.setItem('auth_role',  role);
                    localStorage.setItem('auth_name',  this.state.userName);
                    localStorage.setItem('auth_email', email);
                    localStorage.setItem('auth_id',    this.state.userId);

                    this.showToast(`⚡ Acceso rápido como ${email}`, 'success');
                    this.navigateToDashboard();
                    return;
                }
            }
            // Si el login falla (credenciales incorrectas)
            this.showToast(`⚠️ Acceso rápido fallido. Comprueba que el usuario "${email}" existe en la BD con contraseña "${app.DEV_PASSWORD}"`, 'error');
        } catch (err) {
            // Servidor no disponible
            this.showToast(`⚠️ No se pudo conectar al servidor. Asegúrate de que el backend está activo.`, 'error');
        }
    },

    loadServices: async function() {
        try {
            const response = await fetch(`${API_URL}/servicios`);
            if (response.ok) {
                this.state.services = await response.json();
                return this.state.services;
            }
        } catch (error) {
            console.error("Failed to load services", error);
            // Mock data if server is down for testing frontend
            this.state.services = [
                { id: 1, nombre: "Corte y Peinado Premium", descripcion: "Incluye lavado y masaje", precio: 25.0, duracionMinutos: 45 },
                { id: 2, nombre: "Tinte y Mechas", descripcion: "Coloración completa", precio: 55.0, duracionMinutos: 90 },
                { id: 3, nombre: "Tratamiento Facial", descripcion: "Limpieza e hidratación", precio: 40.0, duracionMinutos: 60 }
            ];
            return this.state.services;
        }
    }
};

// Initialize App on load
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});