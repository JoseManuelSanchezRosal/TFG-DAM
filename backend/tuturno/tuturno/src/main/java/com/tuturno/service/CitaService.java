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
import java.time.LocalTime;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import com.tuturno.dto.cita.SlotDto;
import org.springframework.beans.factory.annotation.Value;
import java.time.DayOfWeek;

@Service
@RequiredArgsConstructor
public class CitaService {

    private final CitaRepository citaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ServicioRepository servicioRepository;

    @Value("${tuturno.schedule.weekday.start:10:00}")
    private String weekdayStartStr;

    @Value("${tuturno.schedule.weekday.end:19:00}")
    private String weekdayEndStr;

    @Value("${tuturno.schedule.saturday.start:10:00}")
    private String saturdayStartStr;

    @Value("${tuturno.schedule.saturday.end:14:00}")
    private String saturdayEndStr;

    @Value("${tuturno.schedule.preparation-time-minutes:15}")
    private int preparationTimeMinutes;

    public List<Cita> listarSegunRol(Long usuarioId, boolean esAdmin) {
        if (esAdmin) {
            return citaRepository.findAll();
        } else {
            return citaRepository.findByUsuarioId(usuarioId);
        }
    }

    public List<Integer> getDiasDisponiblesEnMes(int anio, int mes, List<Long> servicioIds) {
        YearMonth yearMonth = YearMonth.of(anio, mes);
        int diasEnMes = yearMonth.lengthOfMonth();
        List<Integer> diasDisponibles = new ArrayList<>();
        LocalDate hoy = LocalDate.now();

        for (int dia = 1; dia <= diasEnMes; dia++) {
            LocalDate fechaEvaluar = LocalDate.of(anio, mes, dia);

            if (fechaEvaluar.isBefore(hoy)) {
                continue;
            }

            if (fechaEvaluar.getDayOfWeek() == DayOfWeek.SUNDAY || fechaEvaluar.getDayOfWeek() == DayOfWeek.MONDAY) {
                continue;
            }

            List<SlotDto> huecosDelDia = getHuecosDisponibles(fechaEvaluar, servicioIds);

            if (!huecosDelDia.isEmpty()) {
                diasDisponibles.add(dia);
            }
        }

        return diasDisponibles;
    }

    public List<SlotDto> getHuecosDisponibles(LocalDate fecha, List<Long> servicioIds) {
        List<Servicio> servicios = servicioRepository.findAllById(servicioIds);
        if (servicios.isEmpty()) throw new RuntimeException("Servicios no encontrados");
        int duracionServicios = servicios.stream().mapToInt(Servicio::getDuracionMinutos).sum();

        LocalTime apertura;
        LocalTime cierre;

        if (fecha.getDayOfWeek() == DayOfWeek.SUNDAY || fecha.getDayOfWeek() == DayOfWeek.MONDAY) {
            return new ArrayList<>();
        } else if (fecha.getDayOfWeek() == DayOfWeek.SATURDAY) {
            apertura = LocalTime.parse(saturdayStartStr);
            cierre = LocalTime.parse(saturdayEndStr);
        } else {
            apertura = LocalTime.parse(weekdayStartStr);
            cierre = LocalTime.parse(weekdayEndStr);
        }

        int duracionTotal = duracionServicios + preparationTimeMinutes;
        List<Cita> citasDelDia = citaRepository.findByFecha(fecha);
        List<SlotDto> slotsDisponibles = new ArrayList<>();

        LocalTime actual = apertura;
        while (actual.plusMinutes(duracionTotal).isBefore(cierre) || actual.plusMinutes(duracionTotal).equals(cierre)) {
            LocalTime finSlot = actual.plusMinutes(duracionServicios);
            LocalTime finOcupacion = actual.plusMinutes(duracionTotal);

            boolean solapado = false;
            for (Cita c : citasDelDia) {
                LocalTime cInicio = c.getHora();
                int cDuracion = c.getServicios() != null ? c.getServicios().stream().mapToInt(Servicio::getDuracionMinutos).sum() : 0;
                LocalTime cFin = cInicio.plusMinutes(cDuracion + preparationTimeMinutes);

                if (actual.isBefore(cFin) && finOcupacion.isAfter(cInicio)) {
                    solapado = true;
                    break;
                }
            }

            if (!solapado) {
                LocalDateTime fechaHoraSlot = LocalDateTime.of(fecha, actual);
                if (fechaHoraSlot.isAfter(LocalDateTime.now())) {
                    slotsDisponibles.add(new SlotDto(actual, finSlot));
                }
            }

            actual = actual.plusMinutes(30);
        }

        return slotsDisponibles;
    }

    public synchronized Cita crearCita(LocalDateTime fechaInicio, Long usuarioId, List<Long> servicioIds) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Servicio> servicios = servicioRepository.findAllById(servicioIds);
        if (servicios.isEmpty()) throw new RuntimeException("Servicios no encontrados");
        int duracionServicios = servicios.stream().mapToInt(Servicio::getDuracionMinutos).sum();

        int duracionTotal = duracionServicios + preparationTimeMinutes;
        LocalDateTime fechaFin = fechaInicio.plusMinutes(duracionTotal);

        List<Cita> citasDelDia = citaRepository.findByFecha(fechaInicio.toLocalDate());
        for (Cita c : citasDelDia) {
            LocalDateTime cInicio = LocalDateTime.of(c.getFecha(), c.getHora());
            int duracionCita = preparationTimeMinutes;
            if (c.getServicios() != null) {
                duracionCita += c.getServicios().stream().mapToInt(Servicio::getDuracionMinutos).sum();
            }
            LocalDateTime cFin = cInicio.plusMinutes(duracionCita);

            if (fechaInicio.isBefore(cFin) && fechaFin.isAfter(cInicio)) {
                throw new IllegalStateException("El tramo horario seleccionado ya se encuentra ocupado. Por favor, elige otro.");
            }
        }

        Cita cita = new Cita();
        cita.setUsuario(usuario);
        cita.setFecha(fechaInicio.toLocalDate());
        cita.setHora(fechaInicio.toLocalTime().withSecond(0).withNano(0));
        cita.setServicios(servicios);

        return citaRepository.save(cita);
    }

    // --- NUEVO: MÉTODO PARA MODIFICAR ---
    public synchronized Cita modificarCita(Long citaId, LocalDateTime nuevaFechaInicio, Long tokenUserId, Long targetUserId, List<Long> nuevoServicioIds, boolean tienePrivilegiosAltos) {

        Cita citaExistente = citaRepository.findById(citaId)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (!tienePrivilegiosAltos && !citaExistente.getUsuario().getId().equals(tokenUserId)) {
            throw new RuntimeException("No tienes permiso para modificar esta cita");
        }
        
        if (targetUserId != null && !citaExistente.getUsuario().getId().equals(targetUserId)) {
            if (!tienePrivilegiosAltos) {
                throw new RuntimeException("No tienes permiso para reasignar la cita a otro usuario");
            }
            Usuario nuevoUsuario = usuarioRepository.findById(targetUserId).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
            citaExistente.setUsuario(nuevoUsuario);
        }

        List<Servicio> nuevosServicios = servicioRepository.findAllById(nuevoServicioIds);
        if (nuevosServicios.isEmpty()) throw new RuntimeException("Servicios no encontrados");
        int duracionServicios = nuevosServicios.stream().mapToInt(Servicio::getDuracionMinutos).sum();

        int duracionTotal = duracionServicios + preparationTimeMinutes;
        LocalDateTime fechaFin = nuevaFechaInicio.plusMinutes(duracionTotal);

        List<Cita> citasDelDia = citaRepository.findByFecha(nuevaFechaInicio.toLocalDate());
        for (Cita c : citasDelDia) {
            if (c.getId().equals(citaId)) continue;

            LocalDateTime cInicio = LocalDateTime.of(c.getFecha(), c.getHora());
            int duracionCita = preparationTimeMinutes;
            if (c.getServicios() != null) {
                duracionCita += c.getServicios().stream().mapToInt(Servicio::getDuracionMinutos).sum();
            }
            LocalDateTime cFin = cInicio.plusMinutes(duracionCita);

            if (nuevaFechaInicio.isBefore(cFin) && fechaFin.isAfter(cInicio)) {
                throw new IllegalStateException("El tramo horario seleccionado ya se encuentra ocupado. Por favor, elige otro.");
            }
        }
        citaExistente.setFecha(nuevaFechaInicio.toLocalDate());
        citaExistente.setHora(nuevaFechaInicio.toLocalTime().withSecond(0).withNano(0));
        citaExistente.setServicios(nuevosServicios);

        return citaRepository.save(citaExistente);
    }

    public void eliminar(Long id, Long usuarioId, boolean tienePrivilegiosAltos) {
        Cita cita = citaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));

        if (!tienePrivilegiosAltos && !cita.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("No tienes permiso para eliminar esta cita");
        }

        citaRepository.deleteById(id);
    }
}