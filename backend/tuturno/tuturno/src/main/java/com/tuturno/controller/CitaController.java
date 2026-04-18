package com.tuturno.controller;

import com.tuturno.dto.cita.CitaRequestDTO;
import com.tuturno.dto.cita.SlotDto;
import com.tuturno.model.Cita;
import com.tuturno.service.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {

    private final CitaService citaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('CLIENTE', 'BOSS', 'ADMIN')")
    public ResponseEntity<List<Cita>> listar(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Long realUserId = (Long) authentication.getPrincipal();
        boolean tienePrivilegiosAltos = authentication.getAuthorities().stream()
                .anyMatch(rol -> rol.getAuthority().equals("ROLE_ADMIN") || rol.getAuthority().equals("ROLE_BOSS"));

        List<Cita> citas = citaService.listarSegunRol(realUserId, tienePrivilegiosAltos);

        citas.forEach(c -> {
            if (c.getUsuario() != null) {
                c.getUsuario().setPassword(null);
            }
        });
        return ResponseEntity.ok(citas);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENTE', 'BOSS', 'ADMIN')")
    public ResponseEntity<?> crear(@RequestBody CitaRequestDTO request, Authentication authentication) {
        try {
            if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

            Long realUserId = (Long) authentication.getPrincipal();

            boolean tienePrivilegiosAltos = authentication.getAuthorities().stream()
                    .anyMatch(rol -> rol.getAuthority().equals("ROLE_ADMIN") || rol.getAuthority().equals("ROLE_BOSS"));
            
            Long targetUserId = (tienePrivilegiosAltos && request.usuarioId() != null) ? request.usuarioId() : realUserId;

            if (!tienePrivilegiosAltos && !realUserId.equals(targetUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("No tienes permisos para crear citas para otros usuarios.");
            }
            Cita nuevaCita = citaService.crearCita(request.fechaInicio(), targetUserId, request.servicioIds());

            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaCita);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENTE', 'BOSS', 'ADMIN')")
    public ResponseEntity<?> modificar(@PathVariable Long id, @RequestBody CitaRequestDTO request, Authentication authentication) {
        try {
            if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

            Long realUserId = (Long) authentication.getPrincipal();
            boolean tienePrivilegiosAltos = authentication.getAuthorities().stream()
                    .anyMatch(rol -> rol.getAuthority().equals("ROLE_ADMIN") || rol.getAuthority().equals("ROLE_BOSS"));
            
            Long targetUserId = (tienePrivilegiosAltos && request.usuarioId() != null) ? request.usuarioId() : realUserId;

            Cita citaActualizada = citaService.modificarCita(id, request.fechaInicio(), realUserId, targetUserId, request.servicioIds(), tienePrivilegiosAltos);

            return ResponseEntity.ok(citaActualizada);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/disponibles/mes")
    public ResponseEntity<List<Integer>> getDiasDisponibles(
            @RequestParam int anio, @RequestParam int mes, @RequestParam List<Long> servicioIds) {
        return ResponseEntity.ok(citaService.getDiasDisponiblesEnMes(anio, mes, servicioIds));
    }

    @GetMapping("/disponibles")
    @PreAuthorize("hasAnyRole('CLIENTE', 'BOSS', 'ADMIN')")
    public ResponseEntity<List<SlotDto>> getDisponibilidad(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam List<Long> servicioIds) {
        return ResponseEntity.ok(citaService.getHuecosDisponibles(fecha, servicioIds));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CLIENTE', 'BOSS', 'ADMIN')")
    public ResponseEntity<?> eliminar(@PathVariable Long id, Authentication authentication) {
        try {
            if (authentication == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

            Long realUserId = (Long) authentication.getPrincipal();
            boolean tienePrivilegiosAltos = authentication.getAuthorities().stream()
                    .anyMatch(rol -> rol.getAuthority().equals("ROLE_ADMIN") || rol.getAuthority().equals("ROLE_BOSS"));

            citaService.eliminar(id, realUserId, tienePrivilegiosAltos);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        }
    }
}