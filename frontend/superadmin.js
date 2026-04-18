app.superadmin = {
    users: [],
    
    init: function() {
        this.loadUsers();
        this.switchTab('users'); // Asegurar pestaña por defecto
    },

    switchTab: function(tab) {
        const panelUsers  = document.getElementById('sa-panel-users');
        const panelErrors = document.getElementById('sa-panel-errors');
        const btnUsers    = document.getElementById('sa-tab-users');
        const btnErrors   = document.getElementById('sa-tab-errors');
        if (!panelUsers || !panelErrors) return;

        if (tab === 'errors') {
            panelUsers.style.display  = 'none';
            panelErrors.style.display = 'block';
            btnUsers?.classList.remove('active');
            btnErrors?.classList.add('active');
            if (app.errorLog) app.errorLog.init();
        } else {
            panelUsers.style.display  = 'block';
            panelErrors.style.display = 'none';
            btnErrors?.classList.remove('active');
            btnUsers?.classList.add('active');
        }
    },

    loadUsers: async function() {
        try {
            const response = await fetch(`${API_URL}/usuarios`, {
                headers: app.getAuthHeaders()
            });
            if (response.ok) {
                this.users = await response.json();
            } else {
                this.mockUsers();
            }
        } catch (error) {
            console.warn("Fallo cargando usuarios del backend. Usando datos de prueba.");
            this.mockUsers();
        }
        this.renderUsers();
    },

    mockUsers: function() {
        // Datos de prueba para el prototipo si el backend falla
        this.users = [
            { id: 1, name: "Rosa Martínez", email: "jefe@test.com", phone: "600111222", role: "jefe" },
            { id: 2, name: "Admin General", email: "admin@test.com", phone: "600333444", role: "admin" },
            { id: 3, name: "Cliente VIP", email: "cliente@test.com", phone: "600555666", role: "cliente" },
            { id: 4, name: "María Gómez", email: "maria@test.com", phone: "612345678", role: "cliente" }
        ];
    },

    renderUsers: function(filteredUsers = null) {
        const tbody = document.getElementById('superadmin-users-table');
        if (!tbody) return;
        
        const renderList = filteredUsers || this.users;
        
        if (renderList.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--color-light-text);">No hay usuarios registrados.</td></tr>`;
            return;
        }

        tbody.innerHTML = renderList.map(u => {
            const nombre = u.name || u.nombre || '-';
            const rolColor = u.role === 'admin' ? '#ffebee' : (u.role === 'jefe' ? '#e3f2fd' : '#e8f5e9');
            const rolText  = u.role === 'admin' ? '#c62828' : (u.role === 'jefe' ? '#1565c0' : '#2e7d32');
            return `
            <tr style="border-bottom: 1px solid #eee; transition: background 0.2s;" onmouseover="this.style.background='#fafaf7'" onmouseout="this.style.background=''">
                <td style="padding: 1rem;">${u.id || '-'}</td>
                <td style="padding: 1rem; font-weight: 500;">${nombre}</td>
                <td style="padding: 1rem; color: var(--color-light-text);">${u.email}</td>
                <td style="padding: 1rem;">${u.phone || u.telefono || '-'}</td>
                <td style="padding: 1rem;">
                    <span style="padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; background-color: ${rolColor}; color: ${rolText}">
                    ${(u.role || 'cliente').toUpperCase()}
                    </span>
                </td>
                <td style="padding: 1rem; text-align: center; white-space: nowrap;">
                    <button title="Suplantar usuario" class="btn btn-small" onclick="app.superadmin.impersonateUser(${u.id})" style="margin-right:0.4rem; background: linear-gradient(135deg,#7c3aed,#5b21b6); color:#fff; border:none;">
                        <i class="fas fa-user-secret"></i>
                    </button>
                    <button title="Editar" class="btn btn-outline btn-small" onclick="app.superadmin.editUser(${u.id})" style="margin-right: 0.4rem;"><i class="fas fa-edit"></i></button>
                    <button title="Eliminar" class="btn btn-danger btn-small" onclick="app.superadmin.deleteUser(${u.id})"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        }).join('');
    },

    filterUsers: function() {
        const query = (document.getElementById('superadmin-search-user').value || '').toLowerCase();
        const filtered = this.users.filter(u => 
            (u.name && u.name.toLowerCase().includes(query)) || 
            (u.nombre && u.nombre.toLowerCase().includes(query)) ||
            (u.email && u.email.toLowerCase().includes(query)) ||
            (u.role && u.role.toLowerCase().includes(query)) ||
            (u.telefono && u.telefono.toLowerCase().includes(query)) ||
            (u.phone && u.phone.toLowerCase().includes(query)) 
        );
        this.renderUsers(filtered);
    },

    openUserModal: function(user = null) {
        const modal = document.getElementById('superadmin-user-modal');
        const title = document.getElementById('superadmin-user-modal-title');
        
        if (user) {
            title.textContent = "Editar Usuario";
            document.getElementById('sa-user-id').value = user.id;
            document.getElementById('sa-user-name').value = user.name || user.nombre || '';
            document.getElementById('sa-user-email').value = user.email || '';
            document.getElementById('sa-user-phone').value = user.phone || user.telefono || '';
            document.getElementById('sa-user-role').value = user.role || 'cliente';
        } else {
            title.textContent = "Añadir Usuario";
            document.getElementById('superadminUserForm').reset();
            document.getElementById('sa-user-id').value = '';
        }
        
        modal.classList.add('active');
    },

    editUser: function(id) {
        const user = this.users.find(u => u.id === id || u.id === String(id));
        if (user) {
            this.openUserModal(user);
        }
    },

    saveUser: async function() {
        const id = document.getElementById('sa-user-id').value;
        const nombre = document.getElementById('sa-user-name').value;
        const email = document.getElementById('sa-user-email').value;
        const telefono = document.getElementById('sa-user-phone').value;
        const role = document.getElementById('sa-user-role').value;

        const isEdit = !!id;
        const method = isEdit ? 'PUT' : 'POST';
        const url = isEdit ? `${API_URL}/usuarios/${id}` : `${API_URL}/usuarios`; // asumiendo ruta /usuarios
        
        const payload = {
            name: nombre,
            nombre: nombre, // enviar ambos para compatibilidad
            email,
            telefono,
            phone: telefono, // enviar ambos
            role
        };

        try {
            const resp = await fetch(url, {
                method: method,
                headers: app.getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                app.showToast(isEdit ? "Usuario actualizado correctamente" : "Usuario creado correctamente", "success");
                this.loadUsers();
            } else {
                // Falla backend real -> aplicacion prototipo (fallback mock logic)
                this.mockSave(isEdit, id, payload);
            }
        } catch (error) {
            console.warn("Fallo conectando al servidor para guardar usuario, usando mocks");
            this.mockSave(isEdit, id, payload);
        }

        document.getElementById('superadmin-user-modal').classList.remove('active');
    },

    mockSave: function(isEdit, id, payload) {
        if (isEdit) {
            const idx = this.users.findIndex(u => u.id == id);
            if (idx > -1) {
                this.users[idx] = { ...this.users[idx], ...payload };
            }
        } else {
            const newId = Math.max(...this.users.map(u => parseInt(u.id)||0)) + 1;
            this.users.push({ id: newId, ...payload });
        }
        this.renderUsers();
        app.showToast(isEdit ? "Usuario sincronizado (MOCK)" : "Usuario creado (MOCK)", "success");
    },

    deleteUser: async function(id) {
        if (!confirm("¿Estás seguro de querer eliminar este usuario? Esta acción no se puede deshacer.")) return;

        try {
            const resp = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'DELETE',
                headers: app.getAuthHeaders()
            });

            if (resp.ok) {
                app.showToast("Usuario eliminado correctamente", "success");
                this.loadUsers();
            } else {
                // Mock fallback
                this.mockDelete(id);
            }
        } catch (error) {
            console.warn("Fallo contactando servidor para borrar, usando mocks");
            this.mockDelete(id);
        }
    },

    mockDelete: function(id) {
        this.users = this.users.filter(u => u.id != id);
        this.renderUsers();
        app.showToast("Usuario borrado (MOCK)", "success");
    },

    // ======== MODO SUPLANTAR USUARIO ========
    impersonateUser: function(id) {
        const user = this.users.find(u => u.id == id);
        if (!user) return;

        const nombre = user.name || user.nombre || user.email;

        if (!confirm(`¿Quieres iniciar sesión como "${nombre}" para depurar su cuenta?\n\nTendrás acceso completo a su panel de cliente. Podrás volver al Panel de Administración en cualquier momento.`)) return;

        // 1. Guardar sesión actual del admin en sessionStorage (no en localStorage, para no persistir)
        sessionStorage.setItem('admin_backup_token', app.state.token);
        sessionStorage.setItem('admin_backup_role', app.state.userRole);
        sessionStorage.setItem('admin_backup_name', app.state.userName);
        sessionStorage.setItem('admin_backup_email', app.state.userEmail);
        sessionStorage.setItem('admin_backup_id', app.state.userId);

        // 2. Establecer sesión del usuario suplantado
        const userRole = user.role || 'cliente';
        app.state.userRole = userRole;
        app.state.userEmail = user.email;
        app.state.userName = user.name || user.nombre || user.email.split('@')[0];
        app.state.userId = user.id;
        app.state.hasSeenGuide = true; // no mostrar guía en modo debug
        app.state.isImpersonating = true;

        localStorage.setItem('auth_role', userRole);
        localStorage.setItem('auth_name', app.state.userName);
        localStorage.setItem('auth_email', app.state.userEmail);
        localStorage.setItem('auth_id', app.state.userId);

        // 3. Navegar a la vista correspondiente
        if (userRole === 'jefe') {
            app.navigateTo('admin');
            if (app.admin) app.admin.init();
        } else {
            app.navigateTo('client-zone');
        }

        // 4. Mostrar banner flotante de modo depuración
        this.showImpersonationBanner(nombre, user.email, userRole);

        app.showToast(`🔍 Viendo la app como ${nombre}`, 'info');
    },

    showImpersonationBanner: function(nombre, email, role) {
        // Eliminar banner previo si existe
        const old = document.getElementById('impersonation-banner');
        if (old) old.remove();

        const banner = document.createElement('div');
        banner.id = 'impersonation-banner';
        banner.innerHTML = `
            <div style="display:flex; align-items:center; gap:1rem; flex-wrap:wrap; justify-content:center;">
                <i class="fas fa-user-secret" style="font-size:1.3rem;"></i>
                <div>
                    <strong>Modo Depuración Activo</strong>
                    <span style="opacity:0.85; margin-left:0.5rem;">Estás viendo la app como</span>
                    <strong style="color:#e9d5ff; margin-left:0.3rem;">${nombre}</strong>
                    <span style="opacity:0.7; font-size:0.85rem; margin-left:0.4rem;">(${email} · ${role.toUpperCase()})</span>
                </div>
                <button onclick="app.superadmin.restoreAdminSession()" style="
                    background: rgba(255,255,255,0.2);
                    color: white;
                    border: 1px solid rgba(255,255,255,0.4);
                    padding: 0.5rem 1.2rem;
                    border-radius: 20px;
                    cursor: pointer;
                    font-weight: 600;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                    white-space: nowrap;
                " onmouseover="this.style.background='rgba(255,255,255,0.35)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
                    <i class="fas fa-arrow-left"></i> Volver al Panel Admin
                </button>
            </div>
        `;
        banner.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 99999;
            background: linear-gradient(135deg, #6d28d9, #4c1d95);
            color: white;
            padding: 0.75rem 1.5rem;
            font-family: var(--font-body, sans-serif);
            font-size: 0.95rem;
            box-shadow: 0 4px 20px rgba(109,40,217,0.4);
            text-align: center;
        `;

        document.body.prepend(banner);

        // Desplazar el body para que el banner no tape el header
        document.body.style.paddingTop = (banner.offsetHeight + 2) + 'px';
    },

    restoreAdminSession: function() {
        const token   = sessionStorage.getItem('admin_backup_token');
        const role    = sessionStorage.getItem('admin_backup_role');
        const name    = sessionStorage.getItem('admin_backup_name');
        const email   = sessionStorage.getItem('admin_backup_email');
        const userId  = sessionStorage.getItem('admin_backup_id');

        if (!token) {
            app.showToast('No se pudo recuperar la sesión de administrador.', 'error');
            return;
        }

        // Restaurar estado de admin
        app.state.token     = token;
        app.state.userRole  = role;
        app.state.userName  = name;
        app.state.userEmail = email;
        app.state.userId    = userId;
        app.state.isImpersonating = false;

        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_role', role);
        localStorage.setItem('auth_name', name);
        localStorage.setItem('auth_email', email);
        localStorage.setItem('auth_id', userId);

        // Limpiar backup
        sessionStorage.removeItem('admin_backup_token');
        sessionStorage.removeItem('admin_backup_role');
        sessionStorage.removeItem('admin_backup_name');
        sessionStorage.removeItem('admin_backup_email');
        sessionStorage.removeItem('admin_backup_id');

        // Quitar banner y padding
        const banner = document.getElementById('impersonation-banner');
        if (banner) banner.remove();
        document.body.style.paddingTop = '';

        // Volver al panel de admin
        app.navigateTo('superadmin');
        if (app.superadmin) app.superadmin.init();

        app.showToast('✅ Sesión de administrador restaurada', 'success');
    }
};
