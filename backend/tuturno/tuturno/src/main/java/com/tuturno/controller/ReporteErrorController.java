package com.tuturno.controller;

import com.tuturno.dto.error.ReporteErrorRequestDTO;
import com.tuturno.dto.error.ReporteErrorResponseDTO;
import com.tuturno.model.ReporteError;
import com.tuturno.model.Usuario;
import com.tuturno.repository.ReporteErrorRepository;
import com.tuturno.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/errores")
@RequiredArgsConstructor
public class ReporteErrorController {

    private final ReporteErrorRepository repository;
    private final UsuarioRepository usuarioRepository;

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody ReporteErrorRequestDTO request) {
        // Buscar el usuario en BD por email para establecer la relación formal
        Usuario usuario = usuarioRepository.findByEmail(request.userEmail())
                .orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body("Usuario con email '" + request.userEmail() + "' no encontrado.");
        }

        ReporteError reporte = new ReporteError();
        reporte.setFecha(LocalDateTime.now());
        reporte.setUsuario(usuario);
        reporte.setTipo(request.tipo());
        reporte.setTipoLabel(request.tipoLabel());
        reporte.setSeveridad(request.severidad());
        reporte.setDispositivo(request.dispositivo());
        reporte.setDispositivoLabel(request.dispositivoLabel());
        reporte.setDescripcion(request.descripcion());
        reporte.setEstado("pendiente");

        ReporteError guardado = repository.save(reporte);
        return ResponseEntity.ok(convertirADTO(guardado));
    }

    @GetMapping
    public ResponseEntity<List<ReporteErrorResponseDTO>> listarTodos() {
        List<ReporteErrorResponseDTO> reportes = repository.findAllByOrderByFechaDesc().stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reportes);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<ReporteErrorResponseDTO> alternarEstado(@PathVariable Long id) {
        return repository.findById(id)
                .map(reporte -> {
                    if ("resuelto".equals(reporte.getEstado())) {
                        reporte.setEstado("pendiente");
                    } else {
                        reporte.setEstado("resuelto");
                    }
                    ReporteError actualizado = repository.save(reporte);
                    return ResponseEntity.ok(convertirADTO(actualizado));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private ReporteErrorResponseDTO convertirADTO(ReporteError reporte) {
        String email = reporte.getUsuario() != null ? reporte.getUsuario().getEmail() : null;
        String nombre = reporte.getUsuario() != null ? reporte.getUsuario().getNombre() : null;
        return new ReporteErrorResponseDTO(
                reporte.getId(),
                reporte.getFecha(),
                email,
                nombre,
                reporte.getTipo(),
                reporte.getTipoLabel(),
                reporte.getSeveridad(),
                reporte.getDispositivo(),
                reporte.getDispositivoLabel(),
                reporte.getDescripcion(),
                reporte.getEstado()
        );
    }
}
