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
            return new LoginResponseDTO(null);
        }

        Usuario usuario = usuarioEncontrado.get();
        if (!usuario.getPassword().equals(passwordEncoder.encode(loginRequestDto.password()))) {
            return new LoginResponseDTO(null);
        }

        return new LoginResponseDTO(jwtService.createToken(usuario.getId()));
    }

    public void register(RegisterRequestDTO registerRequestDto) {

    }
}