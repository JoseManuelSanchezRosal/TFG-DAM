package com.tuturno.controller;

import com.tuturno.dto.usuario.UsuarioRequestDTO;
import com.tuturno.dto.usuario.UsuarioResponseDTO;
import com.tuturno.model.Rol;
import com.tuturno.model.Usuario;
import com.tuturno.service.RolService;
import com.tuturno.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {
    private final RolService rolService;
    private final UsuarioService usuarioService;

    @GetMapping
    public List<UsuarioResponseDTO> listar() {
        return usuarioService.listarTodos().stream()
                .map(this::convertirADTO)
                .toList();
    }

    @PostMapping
    public UsuarioResponseDTO crear(@RequestBody UsuarioRequestDTO request) {
        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre());
        usuario.setEmail(request.email());
        usuario.setPassword(request.password());
        usuario.setTelefono(request.telefono());
        Rol rolCliente = this.rolService.filtrarPorNombre("cliente");
        usuario.setRol(rolCliente);

        Usuario guardado = usuarioService.guardar(usuario);
        return convertirADTO(guardado);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        usuarioService.eliminar(id);
    }

    private UsuarioResponseDTO convertirADTO(Usuario usuario) {
        return new UsuarioResponseDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getTelefono(),
                usuario.getRol().getNombre()
        );
    }
}