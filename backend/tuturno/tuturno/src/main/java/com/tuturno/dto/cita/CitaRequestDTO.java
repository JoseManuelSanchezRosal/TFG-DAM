package com.tuturno.dto.cita;

import java.time.LocalDateTime;
import java.util.List;

public record CitaRequestDTO(
        LocalDateTime fechaInicio,
        Long usuarioId,
        List<Long> servicioIds
) {}