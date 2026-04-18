package com.tuturno.seed.usuarios;

import com.tuturno.model.Usuario;
import com.tuturno.service.RolService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuariosData {
    private final RolService rolService;
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> getUsuarios() {
        Usuario usuario = new Usuario();
        usuario.setNombre("Usuario 1");
        usuario.setEmail("usuario1@test.com");
        usuario.setPassword(passwordEncoder.encode("1234"));
        usuario.setTelefono("123456789");
        usuario.setRol(rolService.filtrarPorNombre("cliente"));

        return List.of(
                usuario
        );
    }
}