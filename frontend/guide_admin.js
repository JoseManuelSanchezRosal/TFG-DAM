app.startAdminGuide = function() {
    if (app.adminGuideActive) return;
    app.adminGuideActive = true;
    app.adminGuideStep = 1;

    // ── Estilos de animación ──────────────────────────────────────────────────
    const styleId = 'guide-admin-animations-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes guide-pulse-glow {
                0%   { box-shadow: 0 0 0 9999px rgba(35,30,25,0.65), 0 0 15px rgba(212,175,55,0.2) inset, 0 0 10px rgba(212,175,55,0.3); }
                50%  { box-shadow: 0 0 0 9999px rgba(35,30,25,0.75), 0 0 25px rgba(212,175,55,0.45) inset, 0 0 20px rgba(212,175,55,0.6); }
                100% { box-shadow: 0 0 0 9999px rgba(35,30,25,0.65), 0 0 15px rgba(212,175,55,0.2) inset, 0 0 10px rgba(212,175,55,0.3); }
            }
            @keyframes guide-float {
                0%   { transform: translateY(0px); }
                50%  { transform: translateY(-6px); }
                100% { transform: translateY(0px); }
            }
        `;
        document.head.appendChild(style);
    }

    // ── Elementos del overlay ─────────────────────────────────────────────────
    const highlight = document.createElement('div');
    highlight.id = 'guide-admin-highlight';
    highlight.style.cssText = [
        'position:fixed;z-index:9990;background:transparent;',
        'border:3px solid var(--color-gold);border-radius:14px;pointer-events:none;',
        'transition:top .45s cubic-bezier(.25,1,.5,1),left .45s cubic-bezier(.25,1,.5,1),',
        '           width .45s cubic-bezier(.25,1,.5,1),height .45s cubic-bezier(.25,1,.5,1);',
        'animation:guide-pulse-glow 2.5s infinite ease-in-out;'
    ].join('');

    const tooltip = document.createElement('div');
    tooltip.id = 'guide-admin-tooltip';
    tooltip.style.cssText = [
        'position:fixed;z-index:9992;background:#fff;padding:26px 28px;',
        'border-radius:16px;border:1px solid rgba(212,175,55,0.3);',
        'width:90%;max-width:380px;',
        'box-shadow:0 20px 50px rgba(0,0,0,0.18);',
        'transition:top .45s cubic-bezier(.25,1,.5,1),left .45s cubic-bezier(.25,1,.5,1);',
        'animation:guide-float 3s infinite ease-in-out;',
        'display:flex;flex-direction:column;gap:6px;'
    ].join('');

    document.body.appendChild(highlight);
    document.body.appendChild(tooltip);

    // Posición inicial centrada para que el tooltip sea visible de inmediato
    tooltip.style.top  = Math.max(20, window.innerHeight / 2 - 130) + 'px';
    tooltip.style.left = Math.max(20, window.innerWidth  / 2 - 190) + 'px';

    let currentTargetEl = null;

    // ─────────────────────────────────────────────────────────────────────────
    // PASOS DE LA GUÍA
    // onEnter (opcional): se ejecuta antes de posicionar el tooltip; permite
    //                     cambiar de pestaña para que el elemento sea visible.
    // getTarget: devuelve el elemento DOM a resaltar.
    // ─────────────────────────────────────────────────────────────────────────
    const STEPS = [

        // ── Paso 1: Pantalla principal ───────────────────────────────────────
        {
            getTarget: () => {
                // La cabecera "Agenda y Servicios PRO" con las pestañas debajo
                return document.querySelector('#view-admin .auth-tabs')
                    || document.querySelector('#view-admin .dashboard-header');
            },
            html: `
                <h3 style="margin:0 0 8px 0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.3rem;">
                    <i class="fas fa-crown" style="color:var(--color-gold);margin-right:8px;"></i>
                    Bienvenido a tu Panel
                </h3>
                <p style="margin:0 0 10px 0;color:var(--color-light-text);line-height:1.65;font-size:0.9rem;">
                    Este es tu centro de control <strong>Agenda y Servicios</strong>. Desde aquí gestionas todo el salón con dos grandes secciones:
                </p>
                <ul style="margin:0;padding-left:1.2rem;color:var(--color-dark-text);font-size:0.88rem;line-height:1.9;">
                    <li><strong>📅 Calendario de Citas</strong> — visualiza y gestiona las reservas diarias.</li>
                    <li><strong>📋 Catálogo de Servicios</strong> — administra todos los tratamientos del salón.</li>
                </ul>
                <p style="margin:8px 0 0 0;font-size:0.82rem;color:#bbb;">
                    Pulsa <em>Siguiente</em> para conocer cada sección en detalle.
                </p>`
        },

        // ── Paso 2: Catálogo — vista y búsqueda ──────────────────────────────
        {
            onEnter: () => { if (app.admin?.switchTab) app.admin.switchTab('catalog'); },
            getTarget: () => document.getElementById('admin-search-service')
                          || document.getElementById('tab-btn-catalog'),
            html: `
                <h3 style="margin:0 0 8px 0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.3rem;">
                    <i class="fas fa-clipboard-list" style="color:var(--color-gold);margin-right:8px;"></i>
                    Catálogo — Explorar
                </h3>
                <p style="margin:0 0 8px 0;color:var(--color-light-text);line-height:1.65;font-size:0.9rem;">
                    La pestaña <strong>Catálogo de Servicios</strong> muestra todos tus tratamientos como tarjetas con nombre, precio y duración.
                </p>
                <ul style="margin:0;padding-left:1.2rem;color:var(--color-dark-text);font-size:0.88rem;line-height:1.9;">
                    <li><strong>🔍 Buscador</strong> — filtra servicios por nombre en tiempo real.</li>
                    <li>Cada tarjeta muestra el icono del servicio, precio en dorado y duración estimada.</li>
                    <li>Desplázate hacia abajo para ver el listado completo.</li>
                </ul>`
        },

        // ── Paso 3: Catálogo — CRUD ───────────────────────────────────────────
        {
            onEnter: () => { if (app.admin?.switchTab) app.admin.switchTab('catalog'); },
            getTarget: () => document.querySelector('#admin-tab-catalog .btn-primary')
                          || document.getElementById('tab-btn-catalog'),
            html: `
                <h3 style="margin:0 0 8px 0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.3rem;">
                    <i class="fas fa-cogs" style="color:var(--color-gold);margin-right:8px;"></i>
                    Catálogo — Gestión
                </h3>
                <p style="margin:0 0 8px 0;color:var(--color-light-text);line-height:1.65;font-size:0.9rem;">
                    Aquí puedes crear y modificar cualquier servicio del salón:
                </p>
                <ul style="margin:0;padding-left:1.2rem;color:var(--color-dark-text);font-size:0.88rem;line-height:1.9;">
                    <li><strong>➕ Nuevo Servicio</strong> — abre el formulario para crear un tratamiento: nombre, precio, descripción, duración y categoría.</li>
                    <li><strong>✏️ Editar</strong> — pulsa el botón de cada tarjeta para modificar sus datos y guardarlos.</li>
                    <li><strong>🗑️ Eliminar</strong> — borra un servicio con el icono rojo; la acción es inmediata.</li>
                </ul>`
        },

        // ── Paso 4: Calendario — vista general ───────────────────────────────
        {
            onEnter: () => { if (app.admin?.switchTab) app.admin.switchTab('calendar'); },
            getTarget: () => document.querySelector('#admin-tab-calendar .calendar-controls')
                          || document.getElementById('tab-btn-calendar'),
            html: `
                <h3 style="margin:0 0 8px 0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.3rem;">
                    <i class="fas fa-calendar-alt" style="color:var(--color-gold);margin-right:8px;"></i>
                    Calendario — Vista
                </h3>
                <p style="margin:0 0 8px 0;color:var(--color-light-text);line-height:1.65;font-size:0.9rem;">
                    La pestaña <strong>Calendario de Citas</strong> te da una visión del mes completo:
                </p>
                <ul style="margin:0;padding-left:1.2rem;color:var(--color-dark-text);font-size:0.88rem;line-height:1.9;">
                    <li><strong>🟢 Verde</strong> — días con citas programadas.</li>
                    <li><strong>🔴 Rojo</strong> — días sin reservas.</li>
                    <li>Usa las flechas <strong>‹ ›</strong> para navegar entre meses.</li>
                    <li>Pulsa cualquier día para ver la lista de citas de ese día en el panel derecho.</li>
                </ul>`
        },

        // ── Paso 5: Calendario — CRUD citas ──────────────────────────────────
        {
            onEnter: () => { if (app.admin?.switchTab) app.admin.switchTab('calendar'); },
            getTarget: () => document.querySelector('#admin-tab-calendar .btn-primary')
                          || document.getElementById('tab-btn-calendar'),
            html: `
                <h3 style="margin:0 0 8px 0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.3rem;">
                    <i class="fas fa-calendar-plus" style="color:var(--color-gold);margin-right:8px;"></i>
                    Calendario — Gestión de Citas
                </h3>
                <p style="margin:0 0 8px 0;color:var(--color-light-text);line-height:1.65;font-size:0.9rem;">
                    En el panel derecho gestiones las citas del día seleccionado:
                </p>
                <ul style="margin:0;padding-left:1.2rem;color:var(--color-dark-text);font-size:0.88rem;line-height:1.9;">
                    <li><strong>➕ Añadir</strong> — crea una nueva cita eligiendo cliente, servicio, día y hora desde el calendario interactivo.</li>
                    <li><strong>✏️ Editar</strong> — pulsa el lápiz dorado de cualquier cita para modificarla.</li>
                    <li><strong>🗑️ Eliminar</strong> — el icono rojo elimina la cita de ese día.</li>
                    <li>Cada cita muestra el nombre del cliente, tratamiento y franja horaria.</li>
                </ul>
                <p style="margin:8px 0 0 0;font-size:0.82rem;color:#bbb;">
                    ¡Ya conoces todo lo que necesitas para gestionar TuTurno! 🎉
                </p>`
        }
    ];

    const TOTAL = STEPS.length;

    // ── Renderizar UI de un paso ──────────────────────────────────────────────
    const updateAdminGuideUI = (afterEnter = false) => {
        const stepData = STEPS[app.adminGuideStep - 1];
        if (!stepData) { finishAdminGuide(); return; }

        // Si hay acción de entrada (cambio de pestaña) y aún no se ejecutó, lanzarla
        if (!afterEnter && typeof stepData.onEnter === 'function') {
            stepData.onEnter();
            // Esperar a que el DOM se actualice con la nueva pestaña
            setTimeout(() => updateAdminGuideUI(true), 180);
            return;
        }

        currentTargetEl = stepData.getTarget();
        if (!currentTargetEl) currentTargetEl = document.querySelector('#view-admin') || document.body;

        // ── Contenido HTML del tooltip ──
        tooltip.innerHTML = `
            ${stepData.html}
            <div style="display:flex;justify-content:space-between;align-items:center;
                        margin-top:14px;border-top:1px solid rgba(0,0,0,0.06);padding-top:12px;gap:8px;">
                <span style="font-size:0.8rem;color:#bbb;white-space:nowrap;font-weight:600;">
                    ${app.adminGuideStep} / ${TOTAL}
                </span>
                <div style="display:flex;gap:8px;flex:1;justify-content:flex-end;">
                    <button id="guide-admin-btn-skip"
                        style="border:none;background:transparent;color:#adb5bd;font-weight:500;
                               font-size:0.85rem;cursor:pointer;padding:4px 8px;border-radius:8px;">
                        Cerrar
                    </button>
                    ${app.adminGuideStep < TOTAL
                        ? `<button id="guide-admin-btn-next"
                                style="padding:8px 22px;border-radius:25px;font-weight:600;
                                       background:var(--color-gold);border:none;color:#fff;
                                       box-shadow:0 4px 12px rgba(212,175,55,0.35);
                                       cursor:pointer;font-size:0.88rem;">
                                Siguiente <i class="fas fa-arrow-right" style="margin-left:4px;font-size:0.8rem;"></i>
                           </button>`
                        : `<button id="guide-admin-btn-next"
                                style="padding:8px 22px;border-radius:25px;font-weight:600;
                                       background:var(--color-gold);border:none;color:#fff;
                                       box-shadow:0 4px 12px rgba(212,175,55,0.35);
                                       cursor:pointer;font-size:0.88rem;">
                                <i class="fas fa-check" style="margin-right:4px;font-size:0.8rem;"></i> ¡Entendido!
                           </button>`
                    }
                </div>
            </div>`;

        document.getElementById('guide-admin-btn-skip').onclick = () => finishAdminGuide();
        document.getElementById('guide-admin-btn-next').onclick = () => {
            if (app.adminGuideStep < TOTAL) {
                app.adminGuideStep++;
                updateAdminGuideUI(); // ejecutará onEnter del siguiente paso si lo tiene
            } else {
                finishAdminGuide();
            }
        };

        scrollAndRecalc();
    };

    app.advanceAdminGuideStep = function(step) {
        if (!app.adminGuideActive) return;
        app.adminGuideStep = step;
        updateAdminGuideUI();
    };

    // ── Posicionamiento ───────────────────────────────────────────────────────
    let _retries = 0;
    const MAX_RETRIES = 15;

    const scrollAndRecalc = () => {
        if (!app.adminGuideActive || !currentTargetEl) return;

        const testRect = currentTargetEl.getBoundingClientRect();
        if (testRect.width === 0 && testRect.height === 0) {
            if (_retries++ < MAX_RETRIES) {
                setTimeout(scrollAndRecalc, 100);
            } else {
                // Fallback: centrar tooltip si el elemento sigue oculto
                _retries = 0;
                const tW = tooltip.offsetWidth  || 380;
                const tH = tooltip.offsetHeight || 260;
                tooltip.style.top  = Math.max(20, window.innerHeight / 2 - tH / 2) + 'px';
                tooltip.style.left = Math.max(20, window.innerWidth  / 2 - tW / 2) + 'px';
                highlight.style.top = '-9999px';
            }
            return;
        }
        _retries = 0;

        const isMobile = window.innerWidth <= 768;
        currentTargetEl.scrollIntoView({
            behavior: isMobile ? 'auto' : 'smooth',
            block: 'center',
            inline: 'nearest'
        });
        setTimeout(recalcPositions, isMobile ? 50 : 350);
    };

    const recalcPositions = () => {
        if (!app.adminGuideActive || !currentTargetEl) return;

        const rect = currentTargetEl.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        const outOfView = rect.bottom < 0 || rect.top > window.innerHeight ||
                          rect.right  < 0 || rect.left > window.innerWidth;
        if (outOfView) {
            currentTargetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            setTimeout(recalcPositions, 100);
            return;
        }

        highlight.style.top    = (rect.top  - 12) + 'px';
        highlight.style.left   = (rect.left - 12) + 'px';
        highlight.style.width  = (rect.width  + 24) + 'px';
        highlight.style.height = (rect.height + 24) + 'px';

        const tH = tooltip.offsetHeight || 260;
        const tW = tooltip.offsetWidth  || 380;
        const m  = 20;

        const spaceR = window.innerWidth  - rect.right;
        const spaceL = rect.left;
        const spaceB = window.innerHeight - rect.bottom;
        const spaceT = rect.top;

        let top, left;

        if (spaceL > tW + m && window.innerWidth > 768) {
            // A la izquierda (prioridad)
            top  = rect.top + rect.height / 2 - tH / 2;
            left = rect.left - tW - m;
        } else if (spaceR > tW + m && window.innerWidth > 768) {
            // A la derecha (fallback)
            top  = rect.top + rect.height / 2 - tH / 2;
            left = rect.right + m;
        } else if (spaceB > tH + m) {
            top  = rect.bottom + m;
            left = Math.max(m, Math.min(rect.left + rect.width / 2 - tW / 2, window.innerWidth - tW - m));
        } else if (spaceT > tH + m) {
            top  = rect.top - tH - m;
            left = Math.max(m, Math.min(rect.left + rect.width / 2 - tW / 2, window.innerWidth - tW - m));
        } else {
            top  = Math.max(m, window.innerHeight / 2 - tH / 2);
            left = Math.max(m, window.innerWidth  / 2 - tW / 2);
        }

        top  = Math.min(Math.max(m, top),  window.innerHeight - tH - m);
        left = Math.min(Math.max(m, left), window.innerWidth  - tW - m);

        tooltip.style.top  = top  + 'px';
        tooltip.style.left = left + 'px';
    };

    // ── Finalización ─────────────────────────────────────────────────────────
    const finishAdminGuide = () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', recalcPositions, true);
        clearInterval(app._adminGuideUpdateInterval);

        if (document.body.contains(highlight)) document.body.removeChild(highlight);
        if (document.body.contains(tooltip))   document.body.removeChild(tooltip);

        const styleEl = document.getElementById(styleId);
        if (styleEl && document.head.contains(styleEl)) document.head.removeChild(styleEl);

        app.adminGuideActive = false;
        // El FAB siempre visible — no bloqueamos el re-inicio de la guía
    };

    const handleResize = () => scrollAndRecalc();

    // ── Arranque ──────────────────────────────────────────────────────────────
    app._adminGuideUpdateInterval = setInterval(() => {
        if (!app.adminGuideActive) { clearInterval(app._adminGuideUpdateInterval); return; }
        recalcPositions();
    }, 200);

    setTimeout(() => {
        updateAdminGuideUI();
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', recalcPositions, true);
    }, 300);
};
