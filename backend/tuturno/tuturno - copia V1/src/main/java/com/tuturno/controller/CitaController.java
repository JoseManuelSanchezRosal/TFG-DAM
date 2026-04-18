package com.tuturno.controller;

import com.tuturno.dto.cita.CitaRequestDTO;
import com.tuturno.dto.cita.CitaResponseDTO;
import com.tuturno.model.Cita;
import com.tuturno.model.Servicio;
import com.tuturno.service.CitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaController {

    // CORREGIDO: Ahora inyectamos el SERVICIO, no el controlador
    private final CitaService citaService;

    @GetMapping
    public ResponseEntity<List<CitaResponseDTO>> listar(Authentication authentication) {
        // Validación de seguridad simple para evitar NullPointer si no hay login
        String email = (authentication != null) ? authentication.getName() : "anonimo";
        boolean esAdmin = (authentication != null) && authentication.getAuthorities().stream()
                .anyMatch(rol -> rol.getAuthority().equals("ROLE_ADMIN"));

        List<Cita> citas = citaService.listarSegunRol(email, esAdmin);

        List<CitaResponseDTO> response = citas.stream()
                .map(this::convertirADTO)
                .toList();

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<CitaResponseDTO> crear(@RequestBody CitaRequestDTO request) {
        Cita nuevaCita = citaService.crearCita(
                request.fechaInicio(), request.usuarioId(), request.servicioId());
        return ResponseEntity.status(HttpStatus.CREATED).body(convertirADTO(nuevaCita));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        citaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private CitaResponseDTO convertirADTO(Cita cita) {
        // Manejo seguro de nulos en precio
        Double precioVal = cita.getServicios().stream().mapToDouble(Servicio::getPrecio).reduce(0.0, Double::sum);

        return new CitaResponseDTO(
                cita.getId(),
                LocalDateTime.now(),
                LocalDateTime.now(),
                cita.getUsuario().getNombre(),
                List.of(""),
                precioVal
        );
    }
}