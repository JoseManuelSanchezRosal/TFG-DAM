package com.tuturno.dto.error;

public record ReporteErrorRequestDTO(
        String userEmail,
        String tipo,
        String tipoLabel,
        String severidad,
        String dispositivo,
        String dispositivoLabel,
        String descripcion
) {}
