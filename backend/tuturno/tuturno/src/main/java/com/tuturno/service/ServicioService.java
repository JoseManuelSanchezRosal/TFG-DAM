package com.tuturno.service;

import com.tuturno.model.Servicio;
import com.tuturno.repository.ServicioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServicioService {

    private final ServicioRepository repositorio;

    public List<Servicio> listarTodos() {
        return repositorio.findAll();
    }

    public Servicio guardar(Servicio servicio) {
        return repositorio.save(servicio);
    }

    public Optional<Servicio> obtenerPorId(Long id) {
        return repositorio.findById(id);
    }

    public void eliminar(Long id) {
        repositorio.deleteById(id);
    }
}