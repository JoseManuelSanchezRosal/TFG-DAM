package com.tuturno.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "servicios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Servicio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Column
    private String descripcion;

    @Column(nullable = false)
    private Double precio;

    // ESTOS CAMPOS FALTABAN:
    @Column(nullable = false)
    private Integer duracionMinutos; // Lombok generará getDuracion() y setDuracion()
}