package com.tuturno.repository;

import com.tuturno.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    // Método extra para buscar por email (útil para login)
    Optional<Usuario> findByEmail(String email);

}