package com.tuturno.service;

import com.tuturno.model.Usuario;
import com.tuturno.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DetalleUsuarioService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        // Convertimos nuestro Usuario (Entidad) al Usuario de Spring Security
        return User.builder()
                .username(usuario.getEmail())
                .password(usuario.getPassword()) // Spring verificará si coincide
                .roles(usuario.getRol().name())
                .build();
    }
}