// ======== BOOKING WIZARD ========
app.bookingWizard = {
    step: 1,
    editingCitaId: null,
    selectedServices: [],
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1, // 1-12
    selectedDate: null,
    selectedTime: null,
    diasDisponiblesMes: [],
    groupedServices: {},
    
    init: async function() {
        this.step = 1;
        this.editingCitaId = null;
        this.selectedServices = [];
        this.selectedDate = null;
        this.selectedTime = null;
        this.groupedServices = {};
        this.updateView();
        
        const services = await app.loadServices();
        
        this.groupedServices = {
            'Todos': services,
            'Peluquería - Mujer': [],
            'Peluquería - Hombre': [],
            'Estética - Mujer': [],
            'Estética - Hombre': []
        };

        services.forEach(s => {
            const cat = (s.categoria || '').toLowerCase();
            const nom = (s.nombre || '').toLowerCase();
            
            let isHombre = cat.includes('hombre') || nom.includes('hombre') || nom.includes('barb') || nom.includes('caballero');
            let isEstetica = cat.includes('estetica') || cat.includes('estética') || nom.includes('laser') || nom.includes('facial') || nom.includes('manicura') || nom.includes('pedicura') || nom.includes('masaje') || nom.includes('depilacion') || nom.includes('cejas');
            
            if (isHombre && !isEstetica) this.groupedServices['Peluquería - Hombre'].push(s);
            else if (isHombre && isEstetica) this.groupedServices['Estética - Hombre'].push(s);
            else if (!isHombre && !isEstetica) this.groupedServices['Peluquería - Mujer'].push(s);
            else if (!isHombre && isEstetica) this.groupedServices['Estética - Mujer'].push(s);
        });

        this.renderServices('Todos');
    },

    renderServices: function(groupName) {
        document.querySelectorAll('#service-category-tabs .chip').forEach(el => el.classList.remove('active'));
        const chips = Array.from(document.querySelectorAll('#service-category-tabs .chip'));
        const activeChip = chips.find(c => c.getAttribute('onclick') && c.getAttribute('onclick').includes(groupName));
        if (activeChip) activeChip.classList.add('active');

        const container = document.getElementById('client-services-list');
        container.innerHTML = '';
        
        if (app.state.userRole === 'admin') {
            container.classList.add('admin-services-mode');
        } else {
            container.classList.remove('admin-services-mode');
        }
        
        const list = this.groupedServices[groupName] || [];
        
        if (list.length === 0) {
            container.innerHTML = '<p class="empty-state">No hay tratamientos disponibles en esta categoría.</p>';
        }

        if (app.state.userRole === 'admin') {
            const addCard = document.createElement('div');
            addCard.className = 'service-card-app';
            addCard.style.cssText = 'background: linear-gradient(135deg, var(--color-gold) 0%, #c19b2e 100%); color: #fff; cursor: pointer; text-align: center; justify-content: center; margin-bottom: 2rem; border: none;';
            addCard.onclick = () => { 
                app.navigateTo('admin'); 
                app.admin.switchTab('catalog'); 
                document.getElementById('serviceForm').classList.remove('hidden'); 
                window.scrollTo(0,0); 
            };
            addCard.innerHTML = `<h3 style="margin:0; color: #fff;"><i class="fas fa-plus-circle"></i> Acceder al Panel CRUD de Servicios / Añadir Nuevo</h3>`;
            container.appendChild(addCard);
        }

        const getServiceIcon = (nombre, categoria) => {
            const text = (nombre + ' ' + (categoria || '')).toLowerCase();
            if (text.includes('hombre') || text.includes('barba') || text.includes('caballero') || text.includes('niño')) return 'img/icons/icon_hombre.png';
            if (text.includes('maquillaje') || text.includes('pestaña') || text.includes('ceja') || text.includes('mirada')) return 'img/icons/icon_maquillaje_new.png';
            if (text.includes('manicura') || text.includes('pedicura') || text.includes('uña') || text.includes('esmalte')) return 'img/icons/icon_unas_new.png';
            if (text.includes('corte') || text.includes('tijera') || text.includes('cortar')) return 'img/icons/icon_corte_new.png';
            if (text.includes('peinado') || text.includes('lavado') || text.includes('secado') || text.includes('recogido') || text.includes('brushing')) return 'img/icons/icon_peinado_new.png';
            if (text.includes('color') || text.includes('mecha') || text.includes('tinte') || text.includes('balayage')) return 'img/icons/icon_mujer.png';
            return 'img/icons/icon_spa.png'; // fallback estética/otros
        };

        list.forEach(s => {
            const div = document.createElement('div');
            div.className = 'service-card-app';
            div.id = `serv-opt-${s.id}`;
            const iconPath = getServiceIcon(s.nombre, s.categoria);
            
            if (app.state.userRole === 'admin') {
                const safeObj = JSON.stringify(s).replace(/'/g, "&#39;");
                div.style.cursor = 'default';
                div.setAttribute('data-admin', 'true');
                div.setAttribute('data-desc', s.descripcion);
                div.innerHTML = `
                    <div class="service-icon-wrapper">
                        <img class="service-custom-icon" src="${iconPath}" alt="Icono">
                    </div>
                    <div class="service-card-left">
                        <strong>${s.nombre}</strong>
                        <span class="service-card-desc">${s.descripcion}</span>
                        <span class="badge-time"><i class="far fa-clock"></i> ${s.duracionMinutos} min <span style="margin-left:5px; color:var(--color-gold); font-weight:bold;">${s.precio}€</span></span>
                    </div>
                    <div class="service-card-right" style="flex-direction: column; gap:0.5rem; justify-content:center; align-items:flex-end;">
                        <button class="btn btn-outline btn-small" onclick='app.admin.editService(${safeObj})' style="padding:0.5rem;"><i class="fas fa-edit"></i> Editar</button>
                        <button class="btn btn-danger btn-small" onclick='app.admin.deleteService(${s.id})' style="padding:0.5rem; width:100%;"><i class="fas fa-trash"></i></button>
                    </div>
                `;
            } else {
                const isSelected = this.selectedServices.some(sel => sel.id === s.id);
                if (isSelected) div.classList.add('selected');
                // data-desc para el overlay CSS hover
                div.setAttribute('data-desc', s.descripcion);
                
                div.onclick = () => this.toggleService(s.id);
                div.innerHTML = `
                    <div class="service-icon-wrapper">
                        <img class="service-custom-icon" src="${iconPath}" alt="Icono">
                    </div>
                    <div class="service-card-left">
                        <strong>${s.nombre}</strong>
                    </div>
                `;
            }
            container.appendChild(div);
        });
        
        this.updateCheckoutSummary();
    },

    toggleService: function(id) {
        const service = app.state.services.find(s => s.id === id);
        const alreadySelected = this.selectedServices.some(s => s.id === id);

        // Desmarcar todos visualmente
        this.selectedServices.forEach(s => {
            const el = document.getElementById(`serv-opt-${s.id}`);
            if (el) el.classList.remove('selected');
        });

        if (alreadySelected) {
            // Si ya estaba seleccionado, lo deseleccionamos
            this.selectedServices = [];
        } else {
            // Seleccionamos solo este (radio behavior)
            this.selectedServices = [service];
            const div = document.getElementById(`serv-opt-${id}`);
            if (div) div.classList.add('selected');

            if (app.guideActive && app.guideStep === 1) {
                setTimeout(() => {
                    this.goToStep2();
                    if (app.advanceGuideStep) app.advanceGuideStep(2);
                }, 400);
            }
        }

        this.updateCheckoutSummary();
    },
    
    updateCheckoutSummary: function() {
        const checkoutBox = document.getElementById('checkout-summary');
        if (!checkoutBox) return;
        
        if (this.selectedServices.length === 0) {
            checkoutBox.classList.add('hidden');
            return;
        }
        
        checkoutBox.classList.remove('hidden');
        
        const totalPrecio = this.selectedServices.reduce((sum, s) => sum + s.precio, 0).toFixed(2);
        const totalDuracion = this.selectedServices.reduce((sum, s) => sum + s.duracionMinutos, 0);
        
        document.getElementById('checkout-total-price').textContent = totalPrecio;
        document.getElementById('checkout-total-duration').textContent = totalDuracion;
    },
    
    goToStep2: async function() {
        if (this.selectedServices.length === 0) return;
        
        const names = this.selectedServices.map(s => s.nombre).join(', ');
        const totalDuration = this.selectedServices.reduce((sum, s) => sum + s.duracionMinutos, 0);
        
        document.getElementById('selected-service-info').innerHTML = `
            <div style="background: var(--color-cream-dark); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <strong>Tu elección:</strong> ${names} &mdash; ${totalDuration} min en total
            </div>
        `;
        
        this.step = 2;
        this.updateView();
        window.scrollTo({ top: document.querySelector('.booking-section').offsetTop, behavior: 'smooth' });
        await this.loadCalendar();
    },

    // --- LÓGICA DE CALENDARIO ---
    changeMonth: async function(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 12) {
            this.currentMonth = 1;
            this.currentYear++;
        } else if (this.currentMonth < 1) {
            this.currentMonth = 12;
            this.currentYear--;
        }
        await this.loadCalendar();
    },

    startEditFlow: async function(cita, servicio) {
        this.editingCitaId = cita.id;
        
        if (cita.servicios && cita.servicios.length > 0) {
            this.selectedServices = [...cita.servicios];
        } else {
            let foundService = null;
            for (const key in this.groupedServices) {
                const match = this.groupedServices[key].find(s => s.id === servicio.id);
                if (match) { foundService = match; break; }
            }
            this.selectedServices = foundService ? [foundService] : [servicio];
        }
        
        this.step = 2;
        this.updateView();
        window.scrollTo({ top: document.querySelector('.booking-section').offsetTop, behavior: 'smooth' });
        await this.loadCalendar();
    },

    loadCalendar: async function() {
        document.getElementById('time-slots-container').classList.add('hidden');
        document.getElementById('btn-next-step2').classList.add('hidden');
        this.selectedDate = null;
        this.selectedTime = null;

        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        document.getElementById('calendar-month-year').textContent = `${monthNames[this.currentMonth - 1]} ${this.currentYear}`;

        const calGrid = document.getElementById('calendar-grid');
        calGrid.querySelectorAll('.cal-day, .loading-text').forEach(el => el.remove());

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-text';
        loadingDiv.textContent = 'Consultando disponibilidad...';
        calGrid.appendChild(loadingDiv);

        try {
            // 🟢 IMPORTANTE: Quitamos app.getAuthHeaders() porque esta ruta ahora es pública en Spring
            const ids = this.selectedServices.map(s => s.id).join(',');
            const response = await fetch(`${API_URL}/citas/disponibles/mes?anio=${this.currentYear}&mes=${this.currentMonth}&servicioIds=${ids}`);
            if (response.ok) {
                this.diasDisponiblesMes = await response.json();
            } else {
                this.diasDisponiblesMes = [];
            }
        } catch (error) {
            console.error("Error cargando calendario", error);
            this.diasDisponiblesMes = [];
        }

        this.renderCalendarGrid();
    },

    renderCalendarGrid: function() {
        const calGrid = document.getElementById('calendar-grid');
        calGrid.querySelectorAll('.loading-text').forEach(el => el.remove());

        const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
        const firstDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
        
        let startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Ajustar a Lunes=0..Domingo=6

        // Rellenar huecos vacíos antes del día 1
        for (let i = 0; i < startDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'cal-day empty';
            calGrid.appendChild(emptyDiv);
        }

        const today = new Date();
        const currentDateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            
            const monthStr = String(this.currentMonth).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const iterDateStr = `${this.currentYear}-${monthStr}-${dayStr}`;

            if (iterDateStr < currentDateStr) {
                dayDiv.className = 'cal-day disabled';
            } else if (this.diasDisponiblesMes.includes(day)) {
                dayDiv.className = 'cal-day available';
                dayDiv.onclick = () => this.selectDate(day);
                
                if (this.selectedDate === iterDateStr) {
                    dayDiv.classList.add('selected');
                }
            } else {
                dayDiv.className = 'cal-day disabled';
            }

            calGrid.appendChild(dayDiv);
        }
    },

    selectDate: async function(day) {
        // 🔴 BARRERA DE SEGURIDAD FRONTEND: Si no hay token, levantamos el modal y cortamos la ejecución
        if (!app.state.token) {
            document.getElementById('register-modal').classList.add('active');
            return;
        }

        document.querySelectorAll('.cal-day').forEach(el => el.classList.remove('selected'));
        event.target.classList.add('selected');

        const monthStr = String(this.currentMonth).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        this.selectedDate = `${this.currentYear}-${monthStr}-${dayStr}`;
        
        document.getElementById('selected-date-text').textContent = `${day}/${monthStr}/${this.currentYear}`;
        document.getElementById('time-slots-container').classList.remove('hidden');
        
        await this.loadTimeSlots();

        if (app.guideActive && app.guideStep === 2) {
            if (app.advanceGuideStep) app.advanceGuideStep(3);
        }
    },
              
    loadTimeSlots: async function() {
        const grid = document.getElementById('time-slots-grid');
        grid.innerHTML = '<p class="loading-text">Cargando horas...</p>';
        document.getElementById('btn-next-step2').classList.add('hidden');
        this.selectedTime = null;

        try {
            const ids = this.selectedServices.map(s => s.id).join(',');
            const response = await fetch(`${API_URL}/citas/disponibles?fecha=${this.selectedDate}&servicioIds=${ids}`, {
                headers: app.getAuthHeaders()
            });

            if (response.ok) {
                const slots = await response.json(); 
                grid.innerHTML = '';
                
                if(slots.length === 0) {
                    grid.innerHTML = '<p>Este día no tiene horas disponibles. Prueba con otro.</p>';
                    return;
                }

                slots.forEach(slot => {
                    let timeStr = "";
                    if (Array.isArray(slot.horaInicio)) {
                        const hora = String(slot.horaInicio[0]).padStart(2, '0');
                        const min = String(slot.horaInicio[1] || 0).padStart(2, '0');
                        timeStr = `${hora}:${min}`;
                    } else {
                        timeStr = slot.horaInicio.substring(0, 5);
                    }
                    
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-outline slot-btn';
                    btn.textContent = timeStr;
                    btn.onclick = (e) => this.selectTime(timeStr, e.target);
                    grid.appendChild(btn);
                });
            } else {
                console.error("Error del servidor:", response.status);
                grid.innerHTML = '<p class="error-msg">No pudimos cargar las horas. Por favor, inténtalo de nuevo.</p>';
            }
        } catch (error) {
            console.error("Error cargando horas", error);
            grid.innerHTML = '<p class="error-msg">Error conectando con el servidor.</p>';
        }
    },

    selectTime: function(timeStr, btnElement) {
        document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected-slot'));
        btnElement.classList.add('selected-slot');
        this.selectedTime = timeStr;
        document.getElementById('btn-next-step2').classList.remove('hidden');

        if (app.guideActive && app.guideStep === 3) {
            setTimeout(() => {
                this.goToConfirm();
                if (app.advanceGuideStep) app.advanceGuideStep(4);
            }, 600);
        }
    },
    
    goToConfirm: function() {
        if (!this.selectedDate || !this.selectedTime) {
            app.showToast("Elige una fecha y hora para continuar.", "error");
            return;
        }
        this.step = 3;
        this.updateView();
    },

    prevStep: function() {
        if (this.step > 1) {
            this.step--;
            this.updateView();
        }
    },

    updateView: function() {
        document.querySelectorAll('.wizard-step').forEach(el => el.classList.remove('active'));
        document.getElementById(`step-${this.step}`).classList.add('active');

        if (this.step === 3) {
            const dateParts = this.selectedDate.split('-');
            const displayDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            
            const names = this.selectedServices.map(s => s.nombre).join(', ');
            const totalDuration = this.selectedServices.reduce((sum, s) => sum + s.duracionMinutos, 0);
            const totalPrice = this.selectedServices.reduce((sum, s) => sum + s.precio, 0).toFixed(2);
            
            document.getElementById('confirm-service').textContent = names;
            document.getElementById('confirm-datetime').textContent = `${displayDate} a las ${this.selectedTime}`;
            document.getElementById('confirm-duration').textContent = totalDuration; 
            document.getElementById('confirm-price').textContent = totalPrice;
        }
    },

    confirmBooking: async function() {
        const fechaInicioStr = `${this.selectedDate}T${this.selectedTime}:00`;
        const payload = {
            fechaInicio: fechaInicioStr,
            usuarioId: app.state.userId,
            servicioIds: this.selectedServices.map(s => s.id)
        };

        try {
            const url = this.editingCitaId ? `${API_URL}/citas/${this.editingCitaId}` : `${API_URL}/citas`;
            const method = this.editingCitaId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: app.getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                app.showToast(this.editingCitaId ? "¡Tu cita ha sido actualizada con éxito!" : "¡Cita reservada con éxito! Te esperamos.", "success");
                this.editingCitaId = null;
                app.client.loadMisCitas();
                this.init(); 

                if (app.guideActive && app.finishGuide) {
                    app.finishGuide();
                }
            } else if (response.status === 409 || response.status === 400) {
                const msg = await response.text();
                app.showToast(msg || "Ese momento ya no está disponible. Elige otra hora.", "error");
                this.prevStep();
                this.loadTimeSlots();
            } else {
                const msg = await response.text();
                console.error("Error al confirmar reserva:", response.status, msg);
                app.showToast("Error al guardar la cita. Inténtalo de nuevo.", "error");
            }
        } catch (error) {
            console.error("Booking Error", error);
            app.showToast("Error de conexión. Comprueba tu red e inténtalo de nuevo.", "error");
        }
    },

    // Buscador en tiempo real para móvil
    filterMobileServices: function(query) {
        const lq = query.toLowerCase().trim();
        const allServices = this.groupedServices['Todos'] || [];
        const filtered = lq === '' ? allServices : allServices.filter(s =>
            s.nombre.toLowerCase().includes(lq) ||
            (s.descripcion && s.descripcion.toLowerCase().includes(lq))
        );

        const container = document.getElementById('client-services-list');
        container.innerHTML = '';

        if (filtered.length === 0) {
            container.innerHTML = '<p class="empty-state">No encontramos ese tratamiento. Prueba otro término.</p>';
            return;
        }

        const getServiceIcon = (nombre, categoria) => {
            const text = (nombre + ' ' + (categoria || '')).toLowerCase();
            if (text.includes('hombre') || text.includes('barba') || text.includes('caballero') || text.includes('niño')) return 'img/icons/icon_hombre.png';
            if (text.includes('maquillaje') || text.includes('pestaña') || text.includes('ceja') || text.includes('mirada')) return 'img/icons/icon_maquillaje_new.png';
            if (text.includes('manicura') || text.includes('pedicura') || text.includes('uña') || text.includes('esmalte')) return 'img/icons/icon_unas_new.png';
            if (text.includes('corte') || text.includes('tijera') || text.includes('cortar')) return 'img/icons/icon_corte_new.png';
            if (text.includes('peinado') || text.includes('lavado') || text.includes('secado') || text.includes('recogido') || text.includes('brushing')) return 'img/icons/icon_peinado_new.png';
            if (text.includes('color') || text.includes('mecha') || text.includes('tinte') || text.includes('balayage')) return 'img/icons/icon_mujer.png';
            return 'img/icons/icon_spa.png';
        };

        filtered.forEach(s => {
            const div = document.createElement('div');
            div.className = 'service-card-app';
            div.id = `serv-opt-${s.id}`;
            const iconPath = getServiceIcon(s.nombre, s.categoria);
            const isSelected = this.selectedServices.some(sel => sel.id === s.id);
            if (isSelected) div.classList.add('selected');
            div.setAttribute('data-desc', s.descripcion);
            div.onclick = () => this.toggleService(s.id);
            div.innerHTML = `
                <div class="service-icon-wrapper">
                    <img class="service-custom-icon" src="${iconPath}" alt="Icono">
                </div>
                <div class="service-card-left">
                    <strong>${s.nombre}</strong>
                </div>
            `;
            container.appendChild(div);
        });
    }
};
