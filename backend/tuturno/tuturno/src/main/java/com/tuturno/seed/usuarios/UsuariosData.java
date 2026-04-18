package com.tuturno.seed.usuarios;

import com.tuturno.model.TipoRol;
import com.tuturno.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuariosData {
    private final PasswordEncoder passwordEncoder;

    public List<Usuario> getUsuarios() {



        // 2. Jefe / Empleado (BOSS)
        Usuario jefe = new Usuario();
        jefe.setNombre("Laura Jefe");
        jefe.setEmail("jefe@test.com");
        jefe.setPassword(passwordEncoder.encode("1234"));
        jefe.setTelefono("600333444");
        jefe.setRol(TipoRol.BOSS);

        // 3. Administrador (ADMIN)
        Usuario admin = new Usuario();
        admin.setNombre("Admin Sistema");
        admin.setEmail("admin@test.com");
        admin.setPassword(passwordEncoder.encode("1234"));
        admin.setTelefono("600555666");
        admin.setRol(TipoRol.ADMIN);

        return List.of(jefe, admin);
    }
}