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
            id:          Date.now(),
            date:        new Date().toLocaleString('es-ES'),
            userEmail:   app.state.userEmail || 'Anónimo',
            userName:    app.state.userName  || 'Anónimo',
            type:        typeVal,
            typeLabel:   errorType?.label   || typeVal,
            severity:    errorType?.severity || 'moderado',
            device:      deviceVal,
            deviceLabel: deviceType?.label  || deviceVal,
            description: desc,
            status:      'pendiente'
        };

        // Intentar enviar al backend; siempre guardar local como respaldo
        try {
            await fetch(`${API_URL}/errores`, {
                method: 'POST',
                headers: app.getAuthHeaders(),
                body: JSON.stringify(report)
            });
        } catch(_) {}

        const existing = JSON.parse(localStorage.getItem('error_reports') || '[]');
        existing.unshift(report);
        localStorage.setItem('error_reports', JSON.stringify(existing));

        document.getElementById('error-report-modal').classList.remove('active');
        app.showToast('✅ Informe enviado. ¡Gracias por ayudarnos a mejorar!', 'success');
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
        // Intentar cargar desde backend; si falla, usar localStorage
        try {
            const resp = await fetch(`${API_URL}/errores`, { headers: app.getAuthHeaders() });
            if (resp.ok) {
                this.reports = await resp.json();
            } else {
                this.reports = JSON.parse(localStorage.getItem('error_reports') || '[]');
            }
        } catch(_) {
            this.reports = JSON.parse(localStorage.getItem('error_reports') || '[]');
        }

        // Si no hay datos reales, añadir ejemplos de demostración
        if (this.reports.length === 0) {
            this.reports = this._mockReports();
            localStorage.setItem('error_reports', JSON.stringify(this.reports));
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

    markResolved: function(id) {
        const r = this.reports.find(x => x.id == id);
        if (r) {
            r.status = r.status === 'resuelto' ? 'pendiente' : 'resuelto';
            localStorage.setItem('error_reports', JSON.stringify(this.reports));
            this.filter();
        }
    },

    deleteReport: function(id) {
        if (!confirm('¿Eliminar este informe?')) return;
        this.reports = this.reports.filter(x => x.id != id);
        localStorage.setItem('error_reports', JSON.stringify(this.reports));
        this.filter();
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
    },

    _mockReports: function() {
        const now = new Date();
        const fmt = (d) => d.toLocaleString('es-ES');
        const ago = (m) => { const d = new Date(now); d.setMinutes(d.getMinutes()-m); return fmt(d); };
        return [
            { id: 1001, date: ago(5),   userEmail:'maria@test.com',    userName:'María',   type:'login_fail',    typeLabel:'No puedo iniciar sesión',            severity:'critico',  device:'mobile_ios',    deviceLabel:'Móvil — iPhone',         description:'Introduzco mi contraseña correctamente y me dice que es incorrecta.', status:'pendiente' },
            { id: 1002, date: ago(22),  userEmail:'pepito@test.com',   userName:'Pepito',  type:'booking_fail',  typeLabel:'Error al confirmar una reserva',      severity:'critico',  device:'pc_windows',    deviceLabel:'Ordenador — Windows',    description:'Pulso "Reservar mi cita" y la página da error 500 sin confirmar.', status:'pendiente' },
            { id: 1003, date: ago(60),  userEmail:'ester@test.com',    userName:'Ester',   type:'calendar_fail', typeLabel:'El calendario no responde',           severity:'moderado', device:'mobile_android', deviceLabel:'Móvil — Android',        description:'Al intentar cambiar el mes el calendario se queda cargando indefinidamente.', status:'revisado' },
            { id: 1004, date: ago(120), userEmail:'josema@test.com',   userName:'Jose',    type:'slow_app',      typeLabel:'La aplicación va muy lenta',         severity:'leve',     device:'tablet_ios',    deviceLabel:'Tablet — iPad',           description:'Desde by wifi de trabajo la app tarda más de 10 segundos en cargar.', status:'pendiente' },
            { id: 1005, date: ago(200), userEmail:'maria@test.com',    userName:'María',   type:'ui_broken',     typeLabel:'Diseño roto / Visualización',        severity:'leve',     device:'pc_mac',        deviceLabel:'Ordenador — Mac',         description:'En Safari el calendario de citas se ve cortado por la derecha.', status:'resuelto' },
            { id: 1006, date: ago(350), userEmail:'ester2@test.com',   userName:'Ester2',  type:'slot_error',    typeLabel:'Horarios disponibles incorrectos',   severity:'moderado', device:'pc_windows',    deviceLabel:'Ordenador — Windows',    description:'Aparece disponibilidad el domingo pero el salón está cerrado.', status:'pendiente' },
            { id: 1007, date: ago(500), userEmail:'ester3@test.com',   userName:'Ester3',  type:'server_error',  typeLabel:'La página no carga / Error servidor', severity:'critico',  device:'mobile_android', deviceLabel:'Móvil — Android',       description:'Al abrir la app aparece pantalla en blanco y consola muestra error 503.', status:'resuelto' },
        ];
    }
};
