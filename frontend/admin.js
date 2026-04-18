app.admin = {
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth() + 1,
    selectedDate: new Date().toISOString().split('T')[0],
    
    // --- VARIABLES DEL WIDGET MODAL (Nueva Cita) ---
    modalYear: new Date().getFullYear(),
    modalMonth: new Date().getMonth() + 1,
    modalSelectedDate: null,
    modalSelectedTime: null,
    modalDiasDisponiblesMes: [],

    init: async function() {
        await this.renderCalendarGrid();
        this.selectDate(this.selectedDate);
        this.loadServices();
    },

    switchTab: function(tabId) {
        document.querySelectorAll('.auth-tabs .auth-tab').forEach(btn => btn.classList.remove('active'));
        const activeBtn = document.getElementById(`tab-btn-${tabId}`);
        if(activeBtn) activeBtn.classList.add('active');

        document.getElementById('admin-tab-calendar').style.display = 'none';
        document.getElementById('admin-tab-catalog').style.display = 'none';

        const targetTab = document.getElementById(`admin-tab-${tabId}`);
        if(targetTab) targetTab.style.display = 'block';
        
        // Admin Guide Hooks
        if (app.adminGuideActive) {
            if (tabId === 'catalog' && app.adminGuideStep === 1) app.advanceAdminGuideStep(2);
            if (tabId === 'calendar' && app.adminGuideStep === 6) app.advanceAdminGuideStep(7);
        }
    },

    changeMonth: function(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 12) {
            this.currentMonth = 1;
            this.currentYear++;
        } else if (this.currentMonth < 1) {
            this.currentMonth = 12;
            this.currentYear--;
        }
        this.renderCalendarGrid();
    },

    renderCalendarGrid: async function() {
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        document.getElementById('admin-calendar-month-year').textContent = `${monthNames[this.currentMonth - 1]} ${this.currentYear}`;

        const calGrid = document.getElementById('admin-calendar-grid');
        calGrid.querySelectorAll('.cal-day').forEach(el => el.remove());

        const daysInMonth = new Date(this.currentYear, this.currentMonth, 0).getDate();
        const firstDayOfMonth = new Date(this.currentYear, this.currentMonth - 1, 1).getDay();
        
        let startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

        for (let i = 0; i < startDay; i++) {
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'cal-day empty';
            calGrid.appendChild(emptyDiv);
        }
        
        let citasMes = [];
        try {
            const resp = await fetch(`${API_URL}/citas`, { headers: app.getAuthHeaders() });
            if (resp.ok) {
                const todas = await resp.json();
                const prefix = `${this.currentYear}-${String(this.currentMonth).padStart(2,'0')}`;
                citasMes = todas.filter(c => c.fecha.startsWith(prefix));
            }
        } catch(e) {}
        
        const diasConCitas = citasMes.map(c => parseInt(c.fecha.split('-')[2]));

        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.textContent = day;
            
            const monthStr = String(this.currentMonth).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const iterDateStr = `${this.currentYear}-${monthStr}-${dayStr}`;

            dayDiv.className = 'cal-day available';
            
            if (diasConCitas.includes(day)) {
                dayDiv.classList.add('day-busy');
            } else {
                dayDiv.classList.add('day-free');
            }
            
            dayDiv.onclick = () => this.selectDate(iterDateStr);
            
            if (this.selectedDate === iterDateStr) {
                dayDiv.classList.add('selected');
            }

            calGrid.appendChild(dayDiv);
        }
    },

    selectDate: function(dateStr) {
        this.selectedDate = dateStr;
        document.querySelectorAll('#admin-calendar-grid .cal-day').forEach(el => el.classList.remove('selected'));
        
        const calDays = document.querySelectorAll('#admin-calendar-grid .cal-day.available');
        const dayNum = parseInt(dateStr.split('-')[2]);
        calDays.forEach(el => {
            if (parseInt(el.textContent) === dayNum && this.currentMonth === parseInt(dateStr.split('-')[1])) {
                el.classList.add('selected');
            }
        });
        
        const dateParts = dateStr.split('-');
        document.getElementById('admin-selected-date-text').textContent = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        
        this.loadCitasDelDia(dateStr);
    },

    // -----------------------------------------------------
    // --- LÓGICA DEL MINI-CALENDARIO (NUEVA CITA MODAL) ---
    // -----------------------------------------------------

    resetModalState: function() {
        this.modalSelectedDate = null;
        this.modalSelectedTime = null;
        this.modalDiasDisponiblesMes = [];
        const t = new Date();
        this.modalYear = t.getFullYear();
        this.modalMonth = t.getMonth() + 1;
        document.getElementById('admin-modal-slots-container').classList.add('hidden');
        document.getElementById('btn-admin-modal-submit').disabled = true;
        
        const calGrid = document.getElementById('admin-modal-calendar-grid');
        calGrid.querySelectorAll('.cal-day, .loading-text').forEach(el => el.remove());
    },

    onModalServiceChange: async function() {
        const servId = document.getElementById('admin-cita-servicioId').value;
        if (!servId) {
            document.getElementById('admin-modal-slots-container').classList.add('hidden');
            document.getElementById('btn-admin-modal-submit').disabled = true;
            return;
        }
        await this.loadModalCalendar();
    },

    changeModalMonth: async function(delta) {
        this.modalMonth += delta;
        if (this.modalMonth > 12) {
            this.modalMonth = 1;
            this.modalYear++;
        } else if (this.modalMonth < 1) {
            this.modalMonth = 12;
            this.modalYear--;
        }
        await this.loadModalCalendar();
    },

    loadModalCalendar: async function() {
        const servId = document.getElementById('admin-cita-servicioId').value;
        if(!servId) return;

        document.getElementById('admin-modal-slots-container').classList.add('hidden');
        this.modalSelectedDate = null;
        this.modalSelectedTime = null;
        document.getElementById('btn-admin-modal-submit').disabled = true;

        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        document.getElementById('admin-modal-month-year').textContent = `${monthNames[this.modalMonth - 1]} ${this.modalYear}`;

        const calGrid = document.getElementById('admin-modal-calendar-grid');
        calGrid.querySelectorAll('.cal-day, .loading-text').forEach(el => el.remove());

        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-text';
        loadingDiv.textContent = 'Calculando...';
        calGrid.appendChild(loadingDiv);

        try {
            const response = await fetch(`${API_URL}/citas/disponibles/mes?anio=${this.modalYear}&mes=${this.modalMonth}&servicioIds=${servId}`);
            if (response.ok) {
                this.modalDiasDisponiblesMes = await response.json();
            } else {
                this.modalDiasDisponiblesMes = [];
            }
        } catch (error) {
            console.error("Error calendario modal", error);
            this.modalDiasDisponiblesMes = [];
        }

        this.renderModalCalendarGrid();
    },

    renderModalCalendarGrid: function() {
        const calGrid = document.getElementById('admin-modal-calendar-grid');
        calGrid.querySelectorAll('.loading-text').forEach(el => el.remove());

        const daysInMonth = new Date(this.modalYear, this.modalMonth, 0).getDate();
        const firstDayOfMonth = new Date(this.modalYear, this.modalMonth - 1, 1).getDay();
        let startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

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
            
            const monthStr = String(this.modalMonth).padStart(2, '0');
            const dayStr = String(day).padStart(2, '0');
            const iterDateStr = `${this.modalYear}-${monthStr}-${dayStr}`;

            if (iterDateStr < currentDateStr) {
                dayDiv.className = 'cal-day disabled';
            } else if (this.modalDiasDisponiblesMes.includes(day)) {
                dayDiv.className = 'cal-day available';
                dayDiv.onclick = (e) => this.selectModalDate(day, e.target);
                
                if (this.modalSelectedDate === iterDateStr) {
                    dayDiv.classList.add('selected');
                }
            } else {
                dayDiv.className = 'cal-day disabled';
            }

            calGrid.appendChild(dayDiv);
        }
    },

    selectModalDate: async function(day, element) {
        if(element) { // Element can be null if called programmatically
            document.querySelectorAll('#admin-modal-calendar-grid .cal-day').forEach(el => el.classList.remove('selected'));
            element.classList.add('selected');
        }

        const monthStr = String(this.modalMonth).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        this.modalSelectedDate = `${this.modalYear}-${monthStr}-${dayStr}`;
        
        document.getElementById('admin-modal-date-text').textContent = `${day}/${monthStr}/${this.modalYear}`;
        document.getElementById('admin-modal-slots-container').classList.remove('hidden');
        document.getElementById('btn-admin-modal-submit').disabled = true;
        this.modalSelectedTime = null;
        
        await this.loadModalTimeSlots();
    },

    loadModalTimeSlots: async function() {
        const grid = document.getElementById('admin-modal-slots-grid');
        grid.innerHTML = '<p class="loading-text">Cargando horas...</p>';
        
        const servId = document.getElementById('admin-cita-servicioId').value;

        try {
            const response = await fetch(`${API_URL}/citas/disponibles?fecha=${this.modalSelectedDate}&servicioIds=${servId}`, {
                headers: app.getAuthHeaders()
            });

            if (response.ok) {
                const slots = await response.json(); 
                grid.innerHTML = '';
                
                if(slots.length === 0) {
                    grid.innerHTML = '<p>No quedan horas libres este día.</p>';
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
                    btn.type = 'button';
                    btn.className = 'btn btn-outline slot-btn';
                    btn.textContent = timeStr;
                    btn.onclick = (e) => this.selectModalTime(timeStr, e.target);
                    // Si habia hora preseleccionada por edición
                    if(this.modalSelectedTime === timeStr) {
                        btn.classList.add('selected-slot');
                        document.getElementById('btn-admin-modal-submit').disabled = false;
                    }
                    grid.appendChild(btn);
                });
            } else {
                grid.innerHTML = '<p class="error-msg">Error conectando con servidor.</p>';
            }
        } catch (error) {
            grid.innerHTML = '<p class="error-msg">Error de conexión.</p>';
        }
    },

    selectModalTime: function(timeStr, btnElement) {
        document.querySelectorAll('#admin-modal-slots-grid .slot-btn').forEach(b => b.classList.remove('selected-slot'));
        btnElement.classList.add('selected-slot');
        this.modalSelectedTime = timeStr;
        document.getElementById('btn-admin-modal-submit').disabled = false;
    },

    // -----------------------------------------------------

    loadCitasDelDia: async function(dateStr) {
        const container = document.getElementById('admin-citas-list');
        container.innerHTML = '<p class="loading-text">Cargando citas...</p>';

        try {
            const response = await fetch(`${API_URL}/citas`, {
                headers: app.getAuthHeaders()
            });

            if (response.ok) {
                const allCitas = await response.json();
                
                const citasDia = allCitas.filter(c => c.fecha === dateStr);
                
                container.innerHTML = '';
                if (citasDia.length === 0) {
                    container.innerHTML = '<p class="empty-state">No hay citas para este día.</p>';
                    return;
                }

                // Sort by time
                citasDia.sort((a, b) => a.hora !== b.hora ? a.hora - b.hora : a.minutos - b.minutos);

                citasDia.forEach(cita => {
                    const servicio = cita.servicios && cita.servicios.length > 0 ? cita.servicios[0] : { nombre: 'Desconocido', duracionMinutos: 0 };
                    const cCliente = cita.usuario ? cita.usuario.nombre : "Cliente Anónimo";
                    
                    const minTotal = cita.minutos + servicio.duracionMinutos + 15;
                    const hrFin = cita.hora + Math.floor(minTotal / 60);
                    const minFin = minTotal % 60;

                    const div = document.createElement('div');
                    div.className = 'cita-card';
                    div.innerHTML = `
                        <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; z-index: 10;">
                            <button class="btn btn-outline btn-small" title="Editar Cita" onclick='app.admin.editCitaDialog(${JSON.stringify(cita).replace(/'/g, "&#39;")})' style="border:none; padding: 0.2rem;"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" title="Eliminar Global" onclick="app.admin.deleteCita(${cita.id})" style="position: static;"><i class="fas fa-trash"></i></button>
                        </div>
                        <strong>${String(cita.hora).padStart(2,'0')}:${String(cita.minutos).padStart(2,'0')} - ${String(hrFin).padStart(2,'0')}:${String(minFin).padStart(2,'0')}</strong>
                        <div style="margin-top: 5px;">
                            <span style="display:inline-block; background:#222; color:#fff; padding:2px 6px; border-radius:4px; font-size:0.8rem">${cCliente}</span>
                            <span>${servicio.nombre}</span>
                        </div>
                    `;
                    container.appendChild(div);
                });
            }
        } catch (error) {
            // MOCK FOR UI Testing
            container.innerHTML = `
                <div class="cita-card">
                    <div style="position: absolute; top: 1rem; right: 1rem; display: flex; gap: 0.5rem; z-index: 10;">
                        <button class="btn btn-outline btn-small" title="Editar Cita" onclick="app.admin.editCitaDialog({id: 1, hora: 9, minutos: 0, fecha: '${dateStr}', servicios: [{id: 1, nombre: 'Tinte y Mechas', duracionMinutos: 60}], usuario: {id: 2, nombre: 'María G.'}})" style="border:none; padding: 0.2rem;"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" onclick="this.closest('.cita-card').remove()" style="position: static;"><i class="fas fa-trash"></i></button>
                    </div>
                    <strong>09:00 - 10:15</strong>
                    <div style="margin-top: 5px;">
                        <span style="display:inline-block; background:#222; color:#fff; padding:2px 6px; border-radius:4px; font-size:0.8rem">María G. (Simulada)</span>
                        <span>Tinte y Mechas</span>
                    </div>
                </div>
            `;
        }
    },

    deleteCita: async function(id) {
        if(confirm("¿Eliminar esta cita del cuadrante?")) {
            try {
                await fetch(`${API_URL}/citas/${id}`, { method: 'DELETE', headers: app.getAuthHeaders() });
                app.showToast("Cita eliminada", "success");
                this.loadCitasDelDia(this.selectedDate);
            } catch(e) {
                app.showToast("Cita eliminada (Simulado)", "success");
                this.loadCitasDelDia(this.selectedDate);
            }
        }
    },

    usersCatalog: [],
    
    populateClientsDatalist: async function() {
        const datalist = document.getElementById('admin-clients-list');
        if (datalist.options.length > 0) return; // Ya se cargó

        try {
            const resp = await fetch(`${API_URL}/usuarios`, { headers: app.getAuthHeaders() });
            if (resp.ok) {
                this.usersCatalog = await resp.json();
                this.usersCatalog.filter(u => u.rol !== 'admin').forEach(u => {
                    const opt = document.createElement('option');
                    opt.value = `${u.nombre} (ID: ${u.id})`;
                    datalist.appendChild(opt);
                });
            }
        } catch(e) {
            // Fallback MOCK
            this.usersCatalog = [
                {id: 1, nombre: 'María García'},
                {id: 2, nombre: 'Ana López'},
                {id: 3, nombre: 'Carlos Ruiz'}
            ];
            this.usersCatalog.forEach(u => {
                const opt = document.createElement('option');
                opt.value = `${u.nombre} (ID: ${u.id})`;
                datalist.appendChild(opt);
            });
        }
    },

    populateServicesDropdown: async function() {
        const select = document.getElementById('admin-cita-servicioId');
        if (select.options.length <= 1) {
            const services = await app.loadServices();
            services.forEach(s => {
                const opt = document.createElement('option');
                opt.value = s.id;
                opt.textContent = `${s.nombre} (${s.precio}€)`;
                select.appendChild(opt);
            });
        }
    },

    addCitaDialog: async function() {
        document.getElementById('admin-cita-modal-title').textContent = "Añadir Nueva Cita";
        document.getElementById('adminCitaForm').reset();
        document.getElementById('admin-cita-id').value = "";
        
        this.resetModalState();
        
        await this.populateServicesDropdown();
        await this.populateClientsDatalist();
        document.getElementById('admin-cita-modal').classList.add('active');
        
        if (app.adminGuideActive && app.adminGuideStep === 7) {
            setTimeout(() => app.advanceAdminGuideStep(8), 200);
        }
    },

    editCitaDialog: async function(citaStr) {
        const cita = typeof citaStr === 'string' ? JSON.parse(citaStr) : citaStr;
        document.getElementById('admin-cita-modal-title').textContent = "Editar Cita";
        document.getElementById('admin-cita-id').value = cita.id;
        
        if (cita.usuario && cita.usuario.id && cita.usuario.nombre) {
            document.getElementById('admin-cita-userSearch').value = `${cita.usuario.nombre} (ID: ${cita.usuario.id})`;
        } else if (cita.usuario && cita.usuario.id) {
            document.getElementById('admin-cita-userSearch').value = cita.usuario.id;
        } else {
            document.getElementById('admin-cita-userSearch').value = "1"; // Fallback para mockup
        }
        
        this.resetModalState();
        this.modalSelectedDate = cita.fecha;
        this.modalSelectedTime = `${String(cita.hora).padStart(2,'0')}:${String(cita.minutos).padStart(2,'0')}`;
        const parts = cita.fecha.split('-');
        this.modalYear = parseInt(parts[0]);
        this.modalMonth = parseInt(parts[1]);
        
        await this.populateServicesDropdown();
        await this.populateClientsDatalist();
        
        if (cita.servicios && cita.servicios.length > 0) {
            document.getElementById('admin-cita-servicioId').value = cita.servicios[0].id;
            await this.onModalServiceChange();
            
            // Simular preselección del slot
            document.getElementById('admin-modal-slots-container').classList.remove('hidden');
            setTimeout(() => {
                const btns = document.querySelectorAll('#admin-modal-slots-grid .slot-btn');
                btns.forEach(b => {
                    if(b.textContent === this.modalSelectedTime) { b.classList.add('selected-slot'); document.getElementById('btn-admin-modal-submit').disabled = false;}
                });
            }, 500);
        }
        
        document.getElementById('admin-cita-modal').classList.add('active');
    },

    saveCita: async function() {
        const id = document.getElementById('admin-cita-id').value;
        const userSearchTxt = document.getElementById('admin-cita-userSearch').value;
        
        let userId = null;
        const matchId = userSearchTxt.match(/ID:\s*(\d+)/i);
        if (matchId) {
            userId = parseInt(matchId[1]);
        } else {
            userId = parseInt(userSearchTxt);
        }
        
        if (!userId || isNaN(userId)) {
            app.showToast("Selecciona un cliente de la lista desplegable", "error");
            return;
        }
        
        if (!this.modalSelectedDate || !this.modalSelectedTime) {
            app.showToast("Por favor, selecciona una fecha y hora en el calendario inferior.", "error");
            return;
        }

        const servicioId = parseInt(document.getElementById('admin-cita-servicioId').value);
        const fechaInicioStr = `${this.modalSelectedDate}T${this.modalSelectedTime}:00`;

        const payload = {
            fechaInicio: fechaInicioStr,
            usuarioId: userId,
            servicioIds: [servicioId]
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/citas/${id}` : `${API_URL}/citas`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: app.getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                app.showToast(id ? "Cita actualizada." : "Nueva cita añadida.", "success");
                document.getElementById('admin-cita-modal').classList.remove('active');
                
                if (fecha === this.selectedDate) {
                    this.loadCitasDelDia(this.selectedDate); // reload if same day
                } else {
                    this.selectDate(fecha); // move to new day
                }
            } else {
                app.showToast("Error al guardar la cita.", "error");
            }
        } catch (error) {
            app.showToast(id ? "Cita actualizada (Simulada)." : "Cita añadida (Simulada).", "success");
            document.getElementById('admin-cita-modal').classList.remove('active');
            if (fecha === this.selectedDate) {
                this.loadCitasDelDia(this.selectedDate);
            } else {
                this.selectDate(fecha);
            }
        }
    },

    filterServices: function() {
        const query = document.getElementById('admin-search-service').value.toLowerCase();
        const cards = document.querySelectorAll('#admin-services-list .service-card');
        cards.forEach(card => {
            const name = card.querySelector('strong').textContent.toLowerCase();
            if (name.includes(query)) {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
    },

    loadServices: async function() {
        const services = await app.loadServices();
        const container = document.getElementById('admin-services-list');
        container.innerHTML = '';
        
        services.forEach(s => {
            const div = document.createElement('div');
            div.className = 'service-card';
            div.style.cssText = 'background:#fff; border:1px solid #eee; border-radius:8px; padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between; box-shadow:0 2px 4px rgba(0,0,0,0.02);';
            const safeObj = JSON.stringify(s).replace(/'/g, "&#39;");
            
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

            const iconPath = getServiceIcon(s.nombre, s.categoria);

            div.innerHTML = `
                <div style="display:flex; gap:1.2rem;">
                    <div style="width: 60px; height: 60px; background-color: #fff; border-radius: 50%; display: flex; justify-content: center; align-items: center; flex-shrink: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 2px solid var(--color-gold);">
                        <img src="${iconPath}" alt="Icono" style="width: 35px; height: 35px; object-fit: contain;">
                    </div>
                    <div style="flex:1;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                            <strong style="font-size:1.1rem; color:var(--color-dark);">${s.nombre}</strong>
                            <span style="font-weight:600; color:var(--color-gold); font-size:1.1rem;">${s.precio}€</span>
                        </div>
                        <p style="font-size:0.85rem; color:var(--color-light-text); margin-bottom: 0.5rem;"><i class="far fa-clock"></i> ${s.duracionMinutos} min</p>
                        <p style="font-size:0.9rem; margin-bottom: 1.5rem;">${s.descripcion}</p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; border-top: 1px solid #eee; padding-top: 1rem;">
                    <button class="btn btn-outline btn-small" style="flex:1" onclick='app.admin.editService(${safeObj})'><i class="fas fa-edit"></i> Editar</button>
                    <button class="btn btn-danger btn-small" style="flex:0; background-color:#ffebee; color:#c62828; border-color:#ffcdd2;" onclick="app.admin.deleteService(${s.id})"><i class="fas fa-trash"></i></button>
                </div>
            `;
            container.appendChild(div);
        });
    },

    editService: function(s) {
        app.navigateTo('admin');
        app.admin.switchTab('catalog');
        
        document.getElementById('srv-id').value = s.id;
        document.getElementById('srv-name').value = s.nombre;
        document.getElementById('srv-price').value = s.precio;
        document.getElementById('srv-desc').value = s.descripcion;
        document.getElementById('srv-duration').value = s.duracionMinutos;
        document.getElementById('srv-categoria').value = s.categoria || '';
        
        document.getElementById('serviceForm').classList.remove('hidden');
        document.getElementById('btn-save-service').textContent = "Actualizar Cambios";
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        if (app.adminGuideActive && app.adminGuideStep === 4) {
            setTimeout(() => app.advanceAdminGuideStep(5), 200);
        }
    },

    resetServiceForm: function() {
        document.getElementById('serviceForm').reset();
        document.getElementById('serviceForm').classList.add('hidden');
        document.getElementById('srv-id').value = "";
        document.getElementById('srv-categoria').value = "";
        document.getElementById('btn-save-service').textContent = "Guardar Nuevo";
        
        if (app.adminGuideActive && app.adminGuideStep === 3) {
            app.advanceAdminGuideStep(4);
        } else if (app.adminGuideActive && app.adminGuideStep === 5) {
            app.advanceAdminGuideStep(6);
        }
    },

    saveService: async function() {
        const id = document.getElementById('srv-id').value;
        const payload = {
            nombre: document.getElementById('srv-name').value,
            precio: parseFloat(document.getElementById('srv-price').value),
            descripcion: document.getElementById('srv-desc').value,
            duracionMinutos: parseInt(document.getElementById('srv-duration').value),
            categoria: document.getElementById('srv-categoria').value
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/servicios/${id}` : `${API_URL}/servicios`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: app.getAuthHeaders(),
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                app.showToast(id ? "Servicio actualizado." : "Nuevo servicio añadido.", "success");
                this.resetServiceForm();
                this.loadServices(); // reload
            } else {
                app.showToast("Error al guardar el servicio.", "error");
            }
        } catch (error) {
            // MOCK SUCCESS
            app.showToast(id ? "Servicio actualizado (Simulado)." : "Servicio añadido (Simulado).", "success");
            this.resetServiceForm();
        }
    },

    deleteService: async function(id) {
        if(confirm("¿Eliminar este servicio del catálogo?")) {
            try {
                await fetch(`${API_URL}/servicios/${id}`, { method: 'DELETE', headers: app.getAuthHeaders() });
                app.showToast("Servicio eliminado.", "success");
                this.loadServices();
                if(app.bookingWizard) app.bookingWizard.init();
            } catch(e) {
                app.showToast("Simulado: Servicio eliminado.", "success");
                if(app.bookingWizard) app.bookingWizard.init();
            }
        }
    }
};
