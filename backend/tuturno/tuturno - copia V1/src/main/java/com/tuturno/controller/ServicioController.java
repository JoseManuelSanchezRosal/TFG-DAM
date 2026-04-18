package com.tuturno.controller;

import com.tuturno.dto.servicio.ServicioRequestDTO;
import com.tuturno.dto.servicio.ServicioResponseDTO;
import com.tuturno.model.Servicio;
import com.tuturno.repository.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioRepository servicioRepository;

    @PostMapping
    public ResponseEntity<ServicioResponseDTO> crear(@RequestBody ServicioRequestDTO request) {
        Servicio servicio = new Servicio();
        servicio.setNombre(request.nombre());
        servicio.setDescripcion(request.descripcion());
        servicio.setPrecio(request.precio());

        // CORRECCIÓN: El DTO trae 'duracionMinutos', lo metemos en 'duracion' del modelo
        servicio.setDuracionMinutos(request.duracionMinutos());

        Servicio guardado = servicioRepository.save(servicio);
        return ResponseEntity.ok(convertirADTO(guardado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicioRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private ServicioResponseDTO convertirADTO(Servicio servicio) {
        return new ServicioResponseDTO(
                servicio.getId(),
                servicio.getNombre(),
                servicio.getDescripcion(),
                servicio.getPrecio(),
                servicio.getDuracionMinutos() // Usamos getDuracion()
        );
    }
}