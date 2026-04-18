package com.tuturno.repository;

import com.tuturno.model.Cita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface CitaRepository extends JpaRepository<Cita, Long> {

    List<Cita> findByUsuarioEmail(String email);

    // Obligamos a cargar los servicios y el usuario de golpe para evitar el error Lazy en el JSON
    @Query("SELECT DISTINCT c FROM Cita c LEFT JOIN FETCH c.servicios LEFT JOIN FETCH c.usuario WHERE c.usuario.id = :usuarioId")
    List<Cita> findByUsuarioId(@Param("usuarioId") Long usuarioId);

    // Sobrescribimos findAll para que el Administrador tampoco sufra este error al cargar el panel
    @Query("SELECT DISTINCT c FROM Cita c LEFT JOIN FETCH c.servicios LEFT JOIN FETCH c.usuario")
    List<Cita> findAll();

    @Query("SELECT c FROM Cita c LEFT JOIN FETCH c.servicios WHERE c.fecha = :fecha")
    List<Cita> findByFecha(@Param("fecha") LocalDate fecha);
}