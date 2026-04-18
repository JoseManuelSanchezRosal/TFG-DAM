package com.tuturno.service;

import com.tuturno.model.Servicio;
import com.tuturno.repository.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // Lombok crea el constructor con el repositorio automáticamente
public class ServicioService {

    private final ServicioRepository repositorio;

    // 1. Listar todos
    public List<Servicio> listarTodos() {
        return repositorio.findAll();
    }

    // 2. Guardar (Crear o Actualizar)
    public Servicio guardar(Servicio servicio) {
        return repositorio.save(servicio);
    }

    // 3. Buscar por ID
    public Optional<Servicio> obtenerPorId(Long id) {
        return repositorio.findById(id);
    }

    // 4. Eliminar
    public void eliminar(Long id) {
        repositorio.deleteById(id);
    }
}