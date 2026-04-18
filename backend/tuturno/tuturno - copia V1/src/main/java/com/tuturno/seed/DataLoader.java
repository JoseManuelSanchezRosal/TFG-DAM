package com.tuturno.seed;

import com.tuturno.model.Cita;
import com.tuturno.model.Servicio;
import com.tuturno.model.Usuario;
import com.tuturno.repository.CitaRepository; // IMPORTANTE
import com.tuturno.repository.RolRepository;
import com.tuturno.repository.ServicioRepository;
import com.tuturno.repository.UsuarioRepository;
import com.tuturno.seed.roles.RolesData;
import com.tuturno.seed.servicios.ServiciosData;
import com.tuturno.seed.usuarios.UsuariosData;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {
    private final UsuariosData usuariosData;
    private final ServiciosData serviciosData;
    private final RolesData rolesData;
    private final UsuarioRepository usuarioRepository;
    private final ServicioRepository servicioRepository;
    private final RolRepository rolRepository;

    @Override
    public void run(String... args) throws Exception {
        this.rolRepository.saveAllAndFlush(rolesData.getRoles());
        this.usuarioRepository.saveAllAndFlush(usuariosData.getUsuarios());
        /*this.servicioRepository.saveAllAndFlush(serviciosData.getServicios());*/
    }
}