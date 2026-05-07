// ======== SISTEMA DE REGISTRO DE ERRORES ========

const ERROR_TYPES = [
    // Críticos (rojo)
    { value: 'login_fail',       label: 'No puedo iniciar sesión / Acceso denegado',   severity: 'critico' },
    { value: 'session_lost',     label: 'Sesión cerrada de forma inesperada',           severity: 'critico' },
    { value: 'booking_fail',     label: 'Error al confirmar una reserva',               severity: 'critico' },
    { value: 'data_loss',        label: 'Pérdida de datos / Información incorrecta',    severity: 'critico' },
    { value: 'server_error',     label: 'La página no carga / Error del servidor',      severity: 'critico' },
    { value: 'payment_fail',     label: 'Fallo en el proceso de pago',                  severity: 'critico' },
    // Moderados (naranja)
    { value: 'service_load',     label: 'Los servicios no se cargan correctamente',     severity: 'moderado' },
    { value: 'calendar_fail',    label: 'El calendario no responde o muestra mal',      severity: 'moderado' },
    { value: 'register_fail',    label: 'Error en el formulario de registro',           severity: 'moderado' },
    { value: 'cancel_fail',      label: 'No puedo cancelar o modificar una cita',       severity: 'moderado' },
    { value: 'slot_error',       label: 'Horarios disponibles incorrectos',             severity: 'moderado' },
    { value: 'profile_fail',     label: 'No puedo actualizar mis datos de perfil',      severity: 'moderado' },
    // Leves (amarillo)
    { value: 'ui_broken',        label: 'Problema de visualización / Diseño roto',     severity: 'leve' },
    { value: 'button_fail',      label: 'Un botón no responde al pulsarlo',            severity: 'leve' },
    { value: 'image_fail',       label: 'Imagen o icono no se muestra',                severity: 'leve' },
    { value: 'slow_app',         label: 'La aplicación va muy lenta',                  severity: 'leve' },
    { value: 'wrong_msg',        label: 'Notificación o mensaje de texto incorrecto',  severity: 'leve' },
    { value: 'other',            label: 'Otro error no listado',                        severity: 'moderado' },
];

const DEVICE_TYPES = [
    { value: 'pc_windows',   label: 'Ordenador — Windows' },
    { value: 'pc_mac',       label: 'Ordenador — Mac' },
    { value: 'pc_linux',     label: 'Ordenador — Linux' },
    { value: 'mobile_android',label: 'Móvil — Android' },
    { value: 'mobile_ios',   label: 'Móvil — iPhone (iOS)' },
    { value: 'tablet_android',label: 'Tablet — Android' },
    { value: 'tablet_ios',   label: 'Tablet — iPad (iOS)' },
    { value: 'other',        label: 'Otro dispositivo' },
];

const SEVERITY_CONFIG = {
    critico:  { label: 'CRÍTICO',  bg: '#fef2f2', border: '#fca5a5', color: '#b91c1c', dot: '#ef4444' },
    moderado: { label: 'MODERADO', bg: '#fff7ed', border: '#fdba74', color: '#c2410c', dot: '#f97316' },
    leve:     { label: 'LEVE',     bg: '#fefce8', border: '#fde047', color: '#854d0e', dot: '#eab308' },
};

// -------- MÓDULO CLIENTE --------
app.errorReport = {

    open: function() {
        // Rellenar el desplegable de tipos de error
        const selType = document.getElementById('er-type');
        if (selType && selType.options.length <= 1) {
            ERROR_TYPES.forEach(et => {
                const opt = document.createElement('option');
                opt.value = et.value;
                opt.textContent = et.label;
                selType.appendChild(opt);
            });
        }
        // Rellenar el desplegable de dispositivos
        const selDev = document.getElementById('er-device');
        if (selDev && selDev.options.length <= 1) {
            DEVICE_TYPES.forEach(dt => {
                const opt = document.createElement('option');
                opt.value = dt.value;
                opt.textContent = dt.label;
                selDev.appendChild(opt);
            });
        }
        document.getElementById('er-description').value = '';
        document.getElementById('error-report-modal').classList.add('active');
    },

    submit: async function() {
        const typeVal  = document.getElementById('er-type').value;
        const deviceVal= document.getElementById('er-device').value;
        const desc     = document.getElementById('er-description').value.trim();

        if (!typeVal || !deviceVal || !desc) {
            app.showToast('Completa todos los campos antes de enviar.', 'error');
            return;
        }

        const errorType  = ERROR_TYPES.find(e => e.value === typeVal);
        const deviceType = DEVICE_TYPES.find(d => d.value === deviceVal);

        const report = {
            userEmail:   app.state.userEmail || 'Anónimo',
            userName:    app.state.userName  || 'Anónimo',
            tipo:        typeVal,
            tipoLabel:   errorType?.label   || typeVal,
            severidad:   errorType?.severity || 'moderado',
            dispositivo: deviceVal,
            dispositivoLabel: deviceType?.label  || deviceVal,
            descripcion: desc
        };

        try {
            const resp = await fetch(`${API_URL}/errores`, {
                method: 'POST',
                headers: app.getAuthHeaders(),
                body: JSON.stringify(report)
            });
            if (resp.ok) {
                document.getElementById('error-report-modal').classList.remove('active');
                app.showToast('✅ Informe enviado. ¡Gracias por ayudarnos a mejorar!', 'success');
            } else {
                app.showToast('❌ Ocurrió un error al enviar el informe. Inténtalo más tarde.', 'error');
            }
        } catch(error) {
            console.error("Error enviando reporte:", error);
            app.showToast('❌ Error de conexión al enviar el informe.', 'error');
        }
    }
};

// -------- MÓDULO ADMIN — REGISTRO DE ERRORES --------
app.errorLog = {
    reports: [],
    filteredReports: [],

    init: function() {
        this.loadReports();
    },

    loadReports: async function() {
        try {
            const resp = await fetch(`${API_URL}/errores`, { headers: app.getAuthHeaders() });
            if (resp.ok) {
                const data = await resp.json();
                this.reports = data.map(r => ({
                    id: r.id,
                    date: r.fecha ? new Date(r.fecha).toLocaleString('es-ES') : 'Desconocida',
                    userEmail: r.userEmail,
                    userName: r.userName,
                    type: r.tipo,
                    typeLabel: r.tipoLabel,
                    severity: r.severidad,
                    device: r.dispositivo,
                    deviceLabel: r.dispositivoLabel,
                    description: r.descripcion,
                    status: r.estado
                }));
            } else {
                console.warn("Error al cargar reportes de errores del servidor");
                this.reports = [];
                app.showToast('Error al cargar la lista de errores.', 'error');
            }
        } catch(error) {
            console.error("Error cargando reportes:", error);
            this.reports = [];
            app.showToast('Error de conexión al cargar reportes.', 'error');
        }

        this.filteredReports = [...this.reports];
        this.updateStats();
        this.renderTable();
    },

    filter: function() {
        const catFilter  = document.getElementById('el-filter-category')?.value || '';
        const devFilter  = document.getElementById('el-filter-device')?.value   || '';
        const sevFilter  = document.getElementById('el-filter-severity')?.value || '';
        const txtFilter  = (document.getElementById('el-filter-text')?.value  || '').toLowerCase();
        const userFilter = (document.getElementById('el-filter-user')?.value   || '').toLowerCase();

        this.filteredReports = this.reports.filter(r => {
            if (catFilter  && r.type     !== catFilter)                         return false;
            if (devFilter  && r.device   !== devFilter)                         return false;
            if (sevFilter  && r.severity !== sevFilter)                         return false;
            if (userFilter && !r.userEmail?.toLowerCase().includes(userFilter)) return false;
            if (txtFilter  && !r.typeLabel?.toLowerCase().includes(txtFilter)
                           && !r.description?.toLowerCase().includes(txtFilter)) return false;
            return true;
        });

        this.updateStats();
        this.renderTable();
    },

    updateStats: function() {
        const all = this.filteredReports;
        const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
        set('el-stat-total',    all.length);
        set('el-stat-critico',  all.filter(r => r.severity === 'critico').length);
        set('el-stat-moderado', all.filter(r => r.severity === 'moderado').length);
        set('el-stat-leve',     all.filter(r => r.severity === 'leve').length);
    },

    markResolved: async function(id) {
        try {
            const resp = await fetch(`${API_URL}/errores/${id}/estado`, {
                method: 'PUT',
                headers: app.getAuthHeaders()
            });
            if (resp.ok) {
                app.showToast('Estado del reporte actualizado', 'success');
                this.loadReports();
            } else {
                app.showToast('Error al actualizar el estado', 'error');
            }
        } catch(error) {
            console.error("Error al actualizar estado:", error);
            app.showToast('Error de conexión', 'error');
        }
    },

    deleteReport: async function(id) {
        if (!confirm('¿Eliminar este informe?')) return;
        
        try {
            const resp = await fetch(`${API_URL}/errores/${id}`, {
                method: 'DELETE',
                headers: app.getAuthHeaders()
            });
            if (resp.ok) {
                app.showToast('Reporte eliminado', 'success');
                this.loadReports();
            } else {
                app.showToast('Error al eliminar el reporte', 'error');
            }
        } catch(error) {
            console.error("Error eliminando reporte:", error);
            app.showToast('Error de conexión', 'error');
        }
    },

    renderTable: function() {
        const tbody = document.getElementById('errorlog-table-body');
        if (!tbody) return;

        if (this.filteredReports.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:#999;">No hay informes que coincidan con los filtros.</td></tr>`;
            return;
        }

        tbody.innerHTML = this.filteredReports.map(r => {
            const sev = SEVERITY_CONFIG[r.severity] || SEVERITY_CONFIG.moderado;
            const isResolved = r.status === 'resuelto';
            return `
            <tr style="border-bottom:1px solid #eee; opacity:${isResolved ? '0.6' : '1'}; transition:background 0.2s;"
                onmouseover="this.style.background='#fafaf7'" onmouseout="this.style.background=''">
                <td style="padding:0.9rem 1rem;">
                    <span style="display:inline-flex;align-items:center;gap:0.5rem;">
                        <span style="width:10px;height:10px;border-radius:50%;background:${sev.dot};flex-shrink:0;"></span>
                        <span style="padding:0.25rem 0.7rem;border-radius:20px;font-size:0.78rem;font-weight:700;
                            background:${sev.bg};color:${sev.color};border:1px solid ${sev.border};">
                            ${sev.label}
                        </span>
                    </span>
                </td>
                <td style="padding:0.9rem 1rem;font-size:0.9rem;max-width:200px;">
                    <span title="${r.typeLabel}">${r.typeLabel}</span>
                </td>
                <td style="padding:0.9rem 1rem;color:#666;font-size:0.85rem;">${r.userEmail}</td>
                <td style="padding:0.9rem 1rem;font-size:0.85rem;">${r.deviceLabel}</td>
                <td style="padding:0.9rem 1rem;font-size:0.85rem;max-width:220px;color:#555;">
                    <span title="${r.description}">${r.description.length > 80 ? r.description.substring(0,80)+'…' : r.description}</span>
                </td>
                <td style="padding:0.9rem 1rem;font-size:0.8rem;color:#888;white-space:nowrap;">${r.date}</td>
                <td style="padding:0.9rem 1rem;text-align:center;white-space:nowrap;">
                    <button title="${isResolved ? 'Marcar como pendiente' : 'Marcar como resuelto'}"
                        onclick="app.errorLog.markResolved(${r.id})"
                        style="background:${isResolved ? '#e8f5e9' : '#f0fdf4'};color:${isResolved ? '#2e7d32' : '#15803d'};
                               border:1px solid ${isResolved ? '#a5d6a7' : '#86efac'};padding:0.3rem 0.6rem;
                               border-radius:8px;cursor:pointer;font-size:0.8rem;margin-right:0.3rem;">
                        <i class="fas ${isResolved ? 'fa-undo' : 'fa-check'}"></i>
                    </button>
                    <button title="Eliminar informe" onclick="app.errorLog.deleteReport(${r.id})"
                        style="background:#fff5f5;color:#dc2626;border:1px solid #fca5a5;padding:0.3rem 0.6rem;
                               border-radius:8px;cursor:pointer;font-size:0.8rem;">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        }).join('');
    }
};
