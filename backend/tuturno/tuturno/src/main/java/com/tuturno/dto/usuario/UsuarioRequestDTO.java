package com.tuturno.dto.usuario;

public record UsuarioRequestDTO(
        String nombre,
        String email,
        String password,
        String telefono
) {}