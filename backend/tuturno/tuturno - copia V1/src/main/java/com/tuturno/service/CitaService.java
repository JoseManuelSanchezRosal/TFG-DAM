package com.tuturno.service;

import com.tuturno.model.Cita;
import com.tuturno.model.Servicio;
import com.tuturno.model.Usuario;
import com.tuturno.repository.CitaRepository;
import com.tuturno.repository.ServicioRepository;
import com.tuturno.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicioRepository servicioRepository;

    public List<Cita> listarSegunRol(String email, boolean esAdmin) {
        if (esAdmin) {
            return citaRepository.findAll();
        } else {
            return citaRepository.findByUsuarioEmail(email);
        }
    }

    public Cita crearCita(LocalDateTime fechaInicio, Long usuarioId, Long servicioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Servicio servicio = servicioRepository.findById(servicioId)
                .orElseThrow(() -> new RuntimeException("Servicio no encontrado"));

        Cita cita = new Cita();
        cita.setUsuario(usuario);
        /*cita.setServicio(servicio);
        cita.setFechaHoraInicio(fechaInicio);*/

        // CORRECCIÓN: Ahora servicio.getDuracion() existe gracias al paso 1
        /*if (servicio.getDuracion() != null) {
            cita.setFechaHoraFin(fechaInicio.plusMinutes(servicio.getDuracion()));
        } else {
            cita.setFechaHoraFin(fechaInicio.plusMinutes(60));
        }*/

        return citaRepository.save(cita);
    }

    public void eliminar(Long id) {
        citaRepository.deleteById(id);
    }
}