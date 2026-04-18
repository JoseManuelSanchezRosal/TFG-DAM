package com.tuturno.controller;

import com.tuturno.dto.servicio.ServicioRequestDTO;
import com.tuturno.dto.servicio.ServicioResponseDTO;
import com.tuturno.model.Servicio;
import com.tuturno.repository.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/servicios")
@RequiredArgsConstructor
public class ServicioController {

    private final ServicioRepository servicioRepository;

    @GetMapping
    public ResponseEntity<List<ServicioResponseDTO>> listarTodos() {
        List<ServicioResponseDTO> servicios = servicioRepository.findAll().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(servicios);
    }

    @PostMapping
    public ResponseEntity<ServicioResponseDTO> crear(@RequestBody ServicioRequestDTO request) {
        Servicio servicio = new Servicio();
        servicio.setNombre(request.nombre());
        servicio.setDescripcion(request.descripcion());
        servicio.setPrecio(request.precio());
        servicio.setDuracionMinutos(request.duracionMinutos());
        servicio.setCategoria(request.categoria());

        Servicio guardado = servicioRepository.save(servicio);
        return ResponseEntity.ok(convertirADTO(guardado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServicioResponseDTO> actualizar(@PathVariable Long id, @RequestBody ServicioRequestDTO request) {
        return servicioRepository.findById(id)
                .map(servicio -> {
                    servicio.setNombre(request.nombre());
                    servicio.setDescripcion(request.descripcion());
                    servicio.setPrecio(request.precio());
                    servicio.setDuracionMinutos(request.duracionMinutos());
                    servicio.setCategoria(request.categoria());
                    Servicio actualizado = servicioRepository.save(servicio);
                    return ResponseEntity.ok(convertirADTO(actualizado));
                })
                .orElse(ResponseEntity.notFound().build());
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
                servicio.getDuracionMinutos(),
                servicio.getCategoria()
        );
    }
}