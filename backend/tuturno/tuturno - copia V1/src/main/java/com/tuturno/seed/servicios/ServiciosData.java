package com.tuturno.seed.servicios;

import com.tuturno.model.Servicio;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServiciosData {
    public List<Servicio> getServicios() {
        Servicio servicio = new Servicio();

        return List.of(
                servicio
        );
    }
}