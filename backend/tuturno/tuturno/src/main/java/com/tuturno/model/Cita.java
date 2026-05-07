package com.tuturno.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;
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

    // Optimización: Uso de LocalTime para una gestión profesional de la hora
    @Column(nullable = false)
    private LocalTime hora;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToMany
    @JoinTable(
            name = "Cita_Servicio",
            joinColumns = { @JoinColumn(name = "id_cita") },
            inverseJoinColumns = { @JoinColumn(name = "id_servicio") }
    )
    private List<Servicio> servicios;
}