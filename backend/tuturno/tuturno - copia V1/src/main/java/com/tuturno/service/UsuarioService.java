package com.tuturno.service;

import com.tuturno.model.Usuario;
import com.tuturno.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository repositorio;
    private final PasswordEncoder passwordEncoder; // 1. Inyectamos el encriptador

    public List<Usuario> listarTodos() {
        return repositorio.findAll();
    }

    public Usuario guardar(Usuario usuario) {
        if (usuario.getId() == null) {
            // Es CREACIÓN
            Optional<Usuario> existente = repositorio.findByEmail(usuario.getEmail());
            if (existente.isPresent()) {
                throw new RuntimeException("El email ya está registrado");
            }
            // 2. ¡ENCRIPTAMOS LA CONTRASEÑA ANTES DE GUARDAR!
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        // Nota: Si fuera una actualización (else), habría que ver si cambió la contraseña para no re-encriptarla.
        // Por ahora, asumimos que este método se usa principalmente para crear.

        return repositorio.save(usuario);
    }

    public Usuario obtenerPorId(Long id) {
        return repositorio.findById(id).orElse(null);
    }

    public Optional<Usuario> buscarPorEmail(String email) {
        return this.buscarPorEmail(email);
    }

    public void eliminar(Long id) {
        repositorio.deleteById(id);
    }
}