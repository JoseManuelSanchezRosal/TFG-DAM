package com.tuturno.dto.servicio;

public record ServicioRequestDTO(
        String nombre,
        String descripcion,
        Double precio,
        Integer duracionMinutos, // En el JSON vendrá como "duracionMinutos"
        String categoria
) {}