// ======== CLIENT DOMAIN ========

app.client = {
    initAuthClient: function() {
        if(document.getElementById('client-name-display')) {
            document.getElementById('client-name-display').textContent = app.state.userName || 'Cliente';
        }
        this.loadMisCitas();
    },

    loadMisCitas: async function() {
        const container = document.getElementById('client-citas-list');
        container.innerHTML = '<p class="empty-state">Un momento, consultando tu agenda...</p>';

        try {
            console.log("Solicitando citas para el usuario...");
            const response = await fetch(`${API_URL}/citas`, {
                headers: app.getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }

            const citas = await response.json();
            console.log("Citas recibidas del servidor:", citas);

            container.innerHTML = '';
            
            if (!Array.isArray(citas) || citas.length === 0) {
                container.innerHTML = '<p class="empty-state">Todavía no tienes ninguna cita. ¡Reserva tu momento ahora!</p>';
                return;
            }

            citas.forEach(cita => {
                const servicios = cita.servicios || [];
                const nombres = servicios.map(s => s.nombre).join(', ') || 'Servicio estándar';
                const totalPrecio = servicios.reduce((sum, s) => sum + s.precio, 0).toFixed(2);
                
                const cCliente = cita.usuario ? cita.usuario.nombre : (app.state.userName || 'Cliente');
                
                let hrInicio = 0, minInicio = 0;
                if (Array.isArray(cita.hora)) {
                    hrInicio = cita.hora[0];
                    minInicio = cita.hora[1] || 0;
                } else if (typeof cita.hora === 'string') {
                    const parts = cita.hora.split(':');
                    hrInicio = parseInt(parts[0], 10);
                    minInicio = parseInt(parts[1], 10) || 0;
                } else {
                    hrInicio = cita.hora || 0;
                    minInicio = cita.minutos || 0;
                }
                const timeStr = `${String(hrInicio).padStart(2,'0')}:${String(minInicio).padStart(2,'0')}`;
                
                const safeObj = JSON.stringify(cita).replace(/'/g, "&#39;");
                const div = document.createElement('div');
                div.className = 'cita-card';
                div.innerHTML = `
                    <div style="position: absolute; top: 0.5rem; right: 0.5rem; display: flex; gap: 0.5rem;">
                        <button class="btn btn-outline btn-small" title="Editar hora/fecha" onclick='app.client.editCita(${safeObj})' style="border:none; padding: 0.2rem;"><i class="fas fa-pencil-alt"></i></button>
                        <button class="delete-btn" title="Cancelar Cita" onclick="app.client.cancelCita(${cita.id})" style="position: static;">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div style="margin-bottom: 0.5rem; color: var(--color-gold); font-weight: bold; padding-right: 3rem;">${cCliente}</div>
                    <strong style="display:block;">${nombres}</strong>
                    <span style="display:inline-block; margin-top:0.5rem;"><i class="far fa-calendar"></i> ${cita.fecha} a las ${timeStr}</span><br>
                    <span style="display:inline-block; margin-top:0.25rem;"><i class="far fa-money-bill-alt"></i> ${totalPrecio}€</span>
                `;
                container.appendChild(div);
            });

        } catch (error) {
            console.error("Fallo completo en loadMisCitas:", error);
            container.innerHTML = '<p class="error-msg">Hubo un problema al cargar tus citas. Por favor, inténtalo de nuevo.</p>';
        }
    },

    editCita: function(cita) {
        if (!cita.servicios || cita.servicios.length === 0) {
            app.showToast("No se puede editar esta cita.", "error"); return;
        }
        app.bookingWizard.startEditFlow(cita, cita.servicios[0]);
    },

    cancelCita: async function(id) {
        if(confirm("¿Deseas cancelar esta reserva? Podrás hacer una nueva cuando quieras.")) {
            try {
                const response = await fetch(`${API_URL}/citas/${id}`, {
                    method: 'DELETE',
                    headers: app.getAuthHeaders()
                });
                if (response.ok || response.status === 204) {
                    app.showToast("Reserva cancelada. Ya puedes elegir otro momento.", "success");
                    this.loadMisCitas();
                }
            } catch (e) {
                app.showToast("Hubo un problema al cancelar. Inténtalo de nuevo.", "error");
            }
        }
    }
};
