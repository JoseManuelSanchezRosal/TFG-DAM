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
    private final PasswordEncoder passwordEncoder; // 1. Inyectamos el encriptador de contraseñas

    // Devuelve una lista con todos los usuarios registrados
    public List<Usuario> listarTodos() {
        return repositorio.findAll();
    }

    // Guarda un nuevo usuario en la base de datos o actualiza uno existente
    public Usuario guardar(Usuario usuario) {
        if (usuario.getId() == null) {
            // Como el ID es nulo, sabemos que es un usuario NUEVO (Creación)
            Optional<Usuario> existente = repositorio.findByEmail(usuario.getEmail());
            if (existente.isPresent()) {
                throw new RuntimeException("El email ya está registrado");
            }

            // 2. ¡ENCRIPTAMOS LA CONTRASEÑA ANTES DE GUARDAR!
            // Esto es vital para que Spring Security pueda hacer match durante el Login
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        }
        // Nota: Si fuera una actualización (else), habría que verificar si la
        // contraseña ha cambiado para no volver a encriptar algo que ya está encriptado.

        return repositorio.save(usuario);
    }

    // Busca a un usuario específico mediante su ID numérico
    public Usuario obtenerPorId(Long id) {
        return repositorio.findById(id).orElse(null);
    }

    // 3. ¡SOLUCIÓN AL STACKOVERFLOWERROR!
    // Hemos cambiado "this.buscarPorEmail(email)" por "repositorio.findByEmail(email)".
    // Ahora la petición viaja correctamente hacia Spring Data JPA y la base de datos.
    public Optional<Usuario> buscarPorEmail(String email) {
        return repositorio.findByEmail(email);
    }

    public void eliminar(Long id) {
        repositorio.deleteById(id);
    }

    public void marcarGuiaCompletada(Long id) {
        Usuario usuario = repositorio.findById(id).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        usuario.setHasSeenGuide(true);
        repositorio.save(usuario);
    }
}