package com.tuturno.seed.roles;

import com.tuturno.model.Rol;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RolesData {
    public List<Rol> getRoles() {
        Rol cliente = new Rol();
        cliente.setNombre("cliente");

        Rol admin = new Rol();
        admin.setNombre("admin");
        return List.of(
                cliente,
                admin
        );
    }
}
