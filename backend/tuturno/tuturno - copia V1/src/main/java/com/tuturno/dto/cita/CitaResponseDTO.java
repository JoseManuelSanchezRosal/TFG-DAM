package com.tuturno.dto.cita;

import java.time.LocalDateTime;
import java.util.List;

public record CitaResponseDTO(
        Long id,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        String nombreCliente,
        List<String> nombreServicios,
        Double precio
) {}