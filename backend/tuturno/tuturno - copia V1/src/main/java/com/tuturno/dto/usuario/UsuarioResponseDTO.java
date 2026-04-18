package com.tuturno.dto.usuario;

public record UsuarioResponseDTO(
        Long id,
        String nombre,
        String email,
        String telefono,
        String rol
) {}