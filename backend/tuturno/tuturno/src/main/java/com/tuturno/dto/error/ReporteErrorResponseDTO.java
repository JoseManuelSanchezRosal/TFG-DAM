package com.tuturno.dto.error;

import java.time.LocalDateTime;

public record ReporteErrorResponseDTO(
        Long id,
        LocalDateTime fecha,
        String userEmail,
        String userName,
        String tipo,
        String tipoLabel,
        String severidad,
        String dispositivo,
        String dispositivoLabel,
        String descripcion,
        String estado
) {}
