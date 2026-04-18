package com.tuturno.service;

import com.tuturno.model.Usuario;
import com.tuturno.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @InjectMocks
    private UsuarioService service;

    @Test
    void guardar_DebeGuardarUsuario_CuandoEmailNoExiste() {
        Usuario usuarioNuevo = new Usuario();
        usuarioNuevo.setEmail("nuevo@test.com");
        usuarioNuevo.setNombre("Nuevo Usuario");

        when(repository.findByEmail("nuevo@test.com")).thenReturn(Optional.empty());
        when(repository.save(any(Usuario.class))).thenReturn(usuarioNuevo);

        Usuario resultado = service.guardar(usuarioNuevo);

        assertNotNull(resultado);
        assertEquals("nuevo@test.com", resultado.getEmail());
        verify(repository).save(any(Usuario.class));
    }

    @Test
    void guardar_DebeLanzarExcepcion_CuandoEmailYaExiste() {
        Usuario usuarioDuplicado = new Usuario();
        usuarioDuplicado.setEmail("duplicado@test.com");

        Usuario usuarioExistenteEnBD = new Usuario();
        usuarioExistenteEnBD.setId(1L);
        usuarioExistenteEnBD.setEmail("duplicado@test.com");

        when(repository.findByEmail("duplicado@test.com")).thenReturn(Optional.of(usuarioExistenteEnBD));

        Exception exception = assertThrows(RuntimeException.class, () -> {
            service.guardar(usuarioDuplicado);
        });

        assertEquals("El email ya está registrado", exception.getMessage());
        verify(repository, never()).save(any(Usuario.class));
    }
}