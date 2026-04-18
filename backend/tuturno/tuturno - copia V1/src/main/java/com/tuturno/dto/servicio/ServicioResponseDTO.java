package com.tuturno.dto.servicio;

public record ServicioResponseDTO(
        Long id,
        String nombre,
        String descripcion,
        Double precio,
        Integer duracionMinutos
) {}