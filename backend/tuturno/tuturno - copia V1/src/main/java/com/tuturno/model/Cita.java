package com.tuturno.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "citas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private Integer hora;

    @Column(nullable = false)
    private Integer minutos;

    @Column(nullable = false)
    private Integer segundos;

    // Relación Muchos a Uno: Muchas citas pueden ser de un Usuario
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Relación Muchos a Uno: Muchas citas pueden tener el mismo Servicio
    @ManyToMany
    @JoinTable(
            name = "Cita_Servicio",
            joinColumns = { @JoinColumn(name = "id_cita") },
            inverseJoinColumns = { @JoinColumn(name = "id_servicio") }
    )
    private List<Servicio> servicios;
}