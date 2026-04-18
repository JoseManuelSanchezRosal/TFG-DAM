package com.tuturno.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoRol rol = TipoRol.CLIENTE;

    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean hasSeenGuide = false;
}