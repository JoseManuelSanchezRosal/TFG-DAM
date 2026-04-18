package com.tuturno.dto.cita;

import java.time.LocalTime;

public record SlotDto(
        LocalTime horaInicio,
        LocalTime horaFin
) {}
