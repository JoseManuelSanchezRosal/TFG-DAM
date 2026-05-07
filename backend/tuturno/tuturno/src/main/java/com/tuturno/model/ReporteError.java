package com.tuturno.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes_error")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // Relación corregida: Ahora vincula directamente con la entidad Usuario
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(length = 50)
    private String tipo;

    @Column(name = "tipo_label", length = 200)
    private String tipoLabel;

    @Column(length = 20)
    private String severidad;

    @Column(length = 50)
    private String dispositivo;

    @Column(name = "dispositivo_label", length = 100)
    private String dispositivoLabel;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @Column(length = 20)
    private String estado = "pendiente";
}