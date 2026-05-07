package com.tuturno.repository;

import com.tuturno.model.ReporteError;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReporteErrorRepository extends JpaRepository<ReporteError, Long> {

    // Usamos JOIN FETCH para evitar el error Lazy al cargar el Usuario y optimizar a 1 sola consulta
    @Query("SELECT r FROM ReporteError r LEFT JOIN FETCH r.usuario ORDER BY r.fecha DESC")
    List<ReporteError> findAllByOrderByFechaDesc();

    // Opcional: Si en el futuro quieres que un cliente vea solo sus propios reportes de error
    @Query("SELECT r FROM ReporteError r LEFT JOIN FETCH r.usuario WHERE r.usuario.email = :email ORDER BY r.fecha DESC")
    List<ReporteError> findByUsuarioEmailOrderByFechaDesc(String email);
}