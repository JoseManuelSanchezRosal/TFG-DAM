package com.tuturno.service;

import com.tuturno.model.Rol;
import com.tuturno.repository.RolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RolService {
    @Autowired
    private final RolRepository rolRepository;

    public RolService(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    public Rol filtrarPorNombre(String nombre) {
        return this.rolRepository.findByNombre(nombre);
    }
}