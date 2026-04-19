app.startGuide = function() {
    if (app.guideActive) return;
    app.guideActive = true;
    app.guideStep = 1;

    // Marcar como vista inmediatamente para que no reaparezca tras el siguiente login
    app.state.hasSeenGuide = true;
    localStorage.setItem(`auth_hasSeenGuide_${app.state.userEmail}`, "true");

    const styleId = 'guide-animations-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes guide-pulse-glow {
                0% { box-shadow: 0 0 0 9999px rgba(35, 30, 25, 0.7), 0 0 15px rgba(212, 175, 55, 0.2) inset, 0 0 10px rgba(212, 175, 55, 0.3); }
                50% { box-shadow: 0 0 0 9999px rgba(35, 30, 25, 0.8), 0 0 25px rgba(212, 175, 55, 0.45) inset, 0 0 20px rgba(212, 175, 55, 0.6); }
                100% { box-shadow: 0 0 0 9999px rgba(35, 30, 25, 0.7), 0 0 15px rgba(212, 175, 55, 0.2) inset, 0 0 10px rgba(212, 175, 55, 0.3); }
            }
            @keyframes guide-float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
                100% { transform: translateY(0px); }
            }
        `;
        document.head.appendChild(style);
    }

    const highlight = document.createElement('div');
    highlight.id = 'guide-highlight';
    highlight.style.cssText = 'position:fixed;z-index:9990;background:transparent;border:3px solid var(--color-gold);border-radius:14px;pointer-events:none;transition:top 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1), width 0.4s cubic-bezier(0.25, 1, 0.5, 1), height 0.4s cubic-bezier(0.25, 1, 0.5, 1);animation:guide-pulse-glow 2.5s infinite ease-in-out;';

    const tooltip = document.createElement('div');
    tooltip.id = 'guide-tooltip';
    tooltip.style.cssText = 'position:fixed;z-index:9992;background:#fff;padding:30px;border-radius:14px;border:1px solid rgba(212, 175, 55, 0.3);width:90%;max-width:350px;box-shadow:0 20px 50px rgba(0,0,0,0.15);transition:top 0.4s cubic-bezier(0.25, 1, 0.5, 1), left 0.4s cubic-bezier(0.25, 1, 0.5, 1);animation:guide-float 3s infinite ease-in-out;display:flex;flex-direction:column;gap:5px;';

    document.body.appendChild(highlight);
    document.body.appendChild(tooltip);

    let currentTargetEl = null;

    app.advanceGuideStep = function(step) {
        if (!app.guideActive) return;
        app.guideStep = step;
        updateGuideUI();
    };

    const blockClicksFn = function(e) {
        if (!app.guideActive) return;
        if (tooltip.contains(e.target)) return;
        if (currentTargetEl && currentTargetEl.contains(e.target)) return;

        e.stopPropagation();
        e.preventDefault();

        // Efecto visual rápido de error por pulsar fuera
        highlight.style.borderColor = 'red';
        setTimeout(() => highlight.style.borderColor = 'var(--color-gold)', 200);
    };

    document.addEventListener('click', blockClicksFn, true); // true = Use Capture Phase

    const updateGuideUI = () => {
        let text = '';

        if (app.guideStep === 1) {
            app.bookingWizard.step = 1;
            app.bookingWizard.updateView();
            currentTargetEl = document.getElementById('client-services-list');
            text = '<h3 style="margin:0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.4rem;"><i class="fas fa-sparkles" style="color:var(--color-gold);margin-right:8px;"></i>Paso 1: Tu Selección</h3><p style="margin:0 0 10px 0;color:var(--color-light-text);line-height:1.6;font-size:0.95rem;">Explora los tratamientos disponibles.</p><strong style="color:var(--color-gold); font-size:1.1rem;"><i class="fas fa-mouse-pointer" style="margin-right:5px; animation: guide-float 2s infinite;"></i>Pulsa el tratamiento que desees</strong>';
        } else if (app.guideStep === 2) {
            app.bookingWizard.step = 2;
            app.bookingWizard.updateView();
            currentTargetEl = document.querySelector('#step-2 .calendar-wrapper') || document.getElementById('step-2');
            text = '<h3 style="margin:0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.4rem;"><i class="far fa-calendar-alt" style="color:var(--color-gold);margin-right:8px;"></i>Paso 2: La Fecha</h3><p style="margin:0 0 10px 0;color:var(--color-light-text);line-height:1.6;font-size:0.95rem;">Busca el día en el calendario interactivo.</p><strong style="color:var(--color-gold); font-size:1.1rem;"><i class="fas fa-mouse-pointer" style="margin-right:5px; animation: guide-float 2s infinite;"></i>Ahora pulsa el día</strong>';
        } else if (app.guideStep === 3) {
            currentTargetEl = document.querySelector('#time-slots-grid') || document.getElementById('step-2');
            text = '<h3 style="margin:0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.4rem;"><i class="far fa-clock" style="color:var(--color-gold);margin-right:8px;"></i>Paso 3: La Hora</h3><p style="margin:0 0 10px 0;color:var(--color-light-text);line-height:1.6;font-size:0.95rem;">Elige el tramo horario que prefieras de los mostrados para el día seleccionado.</p><strong style="color:var(--color-gold); font-size:1.1rem;"><i class="fas fa-mouse-pointer" style="margin-right:5px; animation: guide-float 2s infinite;"></i>Ahora pulsa la hora</strong>';
        } else if (app.guideStep === 4) {
            app.bookingWizard.step = 3;
            app.bookingWizard.updateView();
            currentTargetEl = document.querySelector('#step-3 .btn-success') || document.querySelector('#step-3 .confirmation-summary');
            text = '<h3 style="margin:0;color:var(--color-dark);font-family:var(--font-heading);font-size:1.4rem;"><i class="fas fa-check-circle" style="color:var(--color-gold);margin-right:8px;"></i>Paso 4: ¡Completado!</h3><p style="margin:0 0 10px 0;color:var(--color-light-text);line-height:1.6;font-size:0.95rem;">¡Así de fácil y sin esperas! Revisa que todo sea correcto.</p><strong style="color:var(--color-gold); font-size:1.1rem;"><i class="fas fa-mouse-pointer" style="margin-right:5px; animation: guide-float 2s infinite;"></i>Pulsa en "Reservar mi cita"</strong>';
        }

        if (!currentTargetEl) currentTargetEl = document.body;

        tooltip.innerHTML = text;

        const controls = document.createElement('div');
        controls.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-top:15px;border-top:1px solid rgba(0,0,0,0.05);padding-top:10px;';

        const btnSkip = document.createElement('button');
        btnSkip.className = 'btn btn-outline btn-small';
        btnSkip.textContent = 'Abandonar Guía';
        btnSkip.style.cssText = 'border:none;background:transparent;color:#adb5bd;font-weight:500;padding:5px;width:100%;text-align:center;';
        btnSkip.onclick = () => app.finishGuide();

        controls.appendChild(btnSkip);
        tooltip.appendChild(controls);

        scrollAndRecalc();
    };

    // Scroll el elemento al centro y luego recalcula posiciones.
    // Si el elemento tiene rect vacío (vista oculta), reintenta hasta que sea visible.
    const scrollAndRecalc = () => {
        if (!app.guideActive || !currentTargetEl) return;

        // Comprobar si el elemento tiene dimensiones reales (visible en el DOM)
        const testRect = currentTargetEl.getBoundingClientRect();
        if (testRect.width === 0 && testRect.height === 0) {
            // El elemento está oculto (display:none en sección inactiva), reintentar
            setTimeout(scrollAndRecalc, 100);
            return;
        }

        // En móvil usamos behavior 'auto' para evitar problemas de timing con scroll suave
        const isMobile = window.innerWidth <= 768;
        currentTargetEl.scrollIntoView({
            behavior: isMobile ? 'auto' : 'smooth',
            block: 'center',
            inline: 'nearest'
        });

        // Esperar a que el scroll termine antes de calcular la posición
        setTimeout(recalcPositions, isMobile ? 50 : 350);
    };

    const recalcPositions = () => {
        if (!app.guideActive || !currentTargetEl) return;

        const rect = currentTargetEl.getBoundingClientRect();

        // Si el elemento no tiene dimensiones (hidden), no posicionar
        if (rect.width === 0 && rect.height === 0) return;

        // Si el elemento sigue fuera del viewport, forzamos scroll y re-intentamos
        const outOfView = rect.bottom < 0 || rect.top > window.innerHeight ||
                          rect.right < 0 || rect.left > window.innerWidth;
        if (outOfView) {
            currentTargetEl.scrollIntoView({ behavior: 'auto', block: 'center' });
            setTimeout(recalcPositions, 100);
            return;
        }

        highlight.style.top    = (rect.top  - 12) + 'px';
        highlight.style.left   = (rect.left - 12) + 'px';
        highlight.style.width  = (rect.width  + 24) + 'px';
        highlight.style.height = (rect.height + 24) + 'px';

        const tooltipH = tooltip.offsetHeight || 200;
        const tooltipW = tooltip.offsetWidth  || 350;
        const margin   = 20;

        // Calcular espacio disponible alrededor del elemento
        const spaceRight  = window.innerWidth  - rect.right;
        const spaceLeft   = rect.left;
        const spaceBottom = window.innerHeight - rect.bottom;
        const spaceTop    = rect.top;

        let tTop, tLeft;

        if (spaceLeft > tooltipW + margin && window.innerWidth > 768) {
            // A la izquierda (prioridad)
            tTop  = rect.top + (rect.height / 2) - (tooltipH / 2);
            tLeft = rect.left - tooltipW - margin;
        } else if (spaceRight > tooltipW + margin && window.innerWidth > 768) {
            // A la derecha (fallback)
            tTop  = rect.top + (rect.height / 2) - (tooltipH / 2);
            tLeft = rect.right + margin;
        } else if (spaceBottom > tooltipH + margin) {
            // Debajo del elemento (móvil / pantallas estrechas)
            tTop  = rect.bottom + margin;
            tLeft = Math.max(margin, Math.min(rect.left + rect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - margin));
        } else if (spaceTop > tooltipH + margin) {
            // Encima del elemento
            tTop  = rect.top - tooltipH - margin;
            tLeft = Math.max(margin, Math.min(rect.left + rect.width / 2 - tooltipW / 2, window.innerWidth - tooltipW - margin));
        } else {
            // Centrado en pantalla como último recurso
            tTop  = Math.max(margin, window.innerHeight / 2 - tooltipH / 2);
            tLeft = Math.max(margin, window.innerWidth  / 2 - tooltipW  / 2);
        }

        // Asegurar que no se sale de los límites de la pantalla
        tTop  = Math.min(Math.max(margin, tTop),  window.innerHeight - tooltipH - margin);
        tLeft = Math.min(Math.max(margin, tLeft), window.innerWidth  - tooltipW  - margin);

        tooltip.style.top  = tTop  + 'px';
        tooltip.style.left = tLeft + 'px';
    };

    app.finishGuide = async () => {
        document.removeEventListener('click', blockClicksFn, true);
        window.removeEventListener('resize', recalcPositions);
        window.removeEventListener('scroll', recalcPositions, true);

        if (document.body.contains(highlight)) document.body.removeChild(highlight);
        if (document.body.contains(tooltip))   document.body.removeChild(tooltip);

        let styleEl = document.getElementById(styleId);
        if (styleEl && document.head.contains(styleEl)) document.head.removeChild(styleEl);

        app.guideActive = false;
        app.state.hasSeenGuide = true;
        localStorage.setItem(`auth_hasSeenGuide_${app.state.userEmail}`, "true");

        try {
            await fetch(`${API_URL}/usuarios/onboarding`, {
                method: 'PATCH',
                headers: app.getAuthHeaders()
            });
        } catch (e) {}
    };

    app._guideUpdateInterval = setInterval(() => {
        if (!app.guideActive) {
            clearInterval(app._guideUpdateInterval);
            return;
        }
        recalcPositions();
    }, 200);

    // ============================================================
    // CORRECCIÓN PRINCIPAL: El jefe/admin llega desde view-admin,
    // donde los elementos del wizard (client-services-list, step-2…)
    // están en view-client-zone con display:none. getBoundingClientRect()
    // devuelve {0,0,0,0} en elementos ocultos → highlight se queda en
    // la esquina superior-izquierda. Solución: navegar a client-zone
    // primero y esperar la transición antes de montar la guía.
    // ============================================================
    const clientZoneView = document.getElementById('view-client-zone');
    const alreadyVisible  = clientZoneView &&
        clientZoneView.classList.contains('active-view') &&
        getComputedStyle(clientZoneView).display !== 'none';

    if (!alreadyVisible && typeof app.navigateTo === 'function') {
        // Navegar a client-zone y esperar que la transición CSS (~300ms) termine
        app.navigateTo('client-zone');
        setTimeout(() => {
            updateGuideUI();
            window.addEventListener('resize', () => scrollAndRecalc());
            window.addEventListener('scroll', recalcPositions, true);
        }, 400);
    } else {
        // Ya estamos en client-zone, iniciar directamente
        setTimeout(() => {
            updateGuideUI();
            window.addEventListener('resize', () => scrollAndRecalc());
            window.addEventListener('scroll', recalcPositions, true);
        }, 100);
    }
};
