package com.tuturno.service;

import com.tuturno.model.Usuario;
import com.tuturno.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UsuarioService service;

    @Test
    void guardar_DebeGuardarUsuario_CuandoEmailNoExiste() {
        Usuario usuarioNuevo = new Usuario();
        usuarioNuevo.setEmail("nuevo@test.com");
        usuarioNuevo.setNombre("Nuevo Usuario");
        usuarioNuevo.setPassword("1234");

        when(repository.findByEmail("nuevo@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashed_1234");
        
        Usuario usuarioGuardadoMock = new Usuario();
        usuarioGuardadoMock.setEmail("nuevo@test.com");
        usuarioGuardadoMock.setPassword("hashed_1234");
        when(repository.save(any(Usuario.class))).thenReturn(usuarioGuardadoMock);

        Usuario resultado = service.guardar(usuarioNuevo);

        assertNotNull(resultado);
        assertEquals("nuevo@test.com", resultado.getEmail());
        assertEquals("hashed_1234", resultado.getPassword());
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

    @Test
    void marcarGuiaCompletada_DebeActualizarYHacerSave_CuandoUsuarioExiste() {
        Usuario usuarioMock = new Usuario();
        usuarioMock.setId(1L);
        usuarioMock.setHasSeenGuide(false);

        when(repository.findById(1L)).thenReturn(Optional.of(usuarioMock));

        service.marcarGuiaCompletada(1L);

        assertTrue(usuarioMock.isHasSeenGuide());
        verify(repository).save(usuarioMock);
    }
}