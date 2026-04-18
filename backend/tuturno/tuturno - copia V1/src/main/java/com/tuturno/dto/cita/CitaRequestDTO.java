package com.tuturno.dto.cita;

import java.time.LocalDateTime;

public record CitaRequestDTO(
        LocalDateTime fechaInicio,
        Long usuarioId,
        Long servicioId
) {}