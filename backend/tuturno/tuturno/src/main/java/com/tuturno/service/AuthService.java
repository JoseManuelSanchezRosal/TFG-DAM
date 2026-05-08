package com.tuturno.service;

import com.tuturno.dto.auth.LoginRequestDTO;
import com.tuturno.dto.auth.LoginResponseDTO;
import com.tuturno.dto.auth.RegisterRequestDTO;
import com.tuturno.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public LoginResponseDTO login(LoginRequestDTO loginRequestDto) {
        Optional<Usuario> usuarioEncontrado = this.usuarioService.buscarPorEmail(loginRequestDto.email());
        if (usuarioEncontrado.isEmpty()) {
            return new LoginResponseDTO(null, false);
        }

        Usuario usuario = usuarioEncontrado.get();
        if (!passwordEncoder.matches(loginRequestDto.password(), usuario.getPassword())) {
            return new LoginResponseDTO(null, false);
        }

        return new LoginResponseDTO(jwtService.createToken(usuario.getId()), usuario.isHasSeenGuide());
    }

    public void register(RegisterRequestDTO registerRequestDto) {
        Usuario usuario = new Usuario();
        usuario.setNombre(registerRequestDto.name());
        usuario.setEmail(registerRequestDto.email());
        usuario.setTelefono(registerRequestDto.phone());

        // CORRECCIÓN: Le pasamos la contraseña sin encriptar,
        // porque UsuarioService.guardar() ya se encarga de encriptarla.
        usuario.setPassword(registerRequestDto.password());


        usuarioService.guardar(usuario);
    }
}