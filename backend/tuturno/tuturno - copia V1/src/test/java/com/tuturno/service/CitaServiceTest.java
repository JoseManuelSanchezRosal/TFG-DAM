package com.tuturno.service;

import com.tuturno.controller.CitaService;
import com.tuturno.model.Cita;
import com.tuturno.model.Servicio;
import com.tuturno.model.Usuario;
import com.tuturno.repository.CitaRepository;
import com.tuturno.repository.ServicioRepository;
import com.tuturno.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CitaServiceTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private ServicioRepository servicioRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private CitaService citaService;

    @Test
    void crearCita_DebeCalcularFechaFinCorrectamente() {
        // ARRANGE
        Long usuarioId = 1L;
        Long servicioId = 2L;
        LocalDateTime fechaInicio = LocalDateTime.of(2026, 10, 15, 10, 0);
        int duracionMinutos = 60;

        Usuario usuarioMock = new Usuario();
        usuarioMock.setId(usuarioId);

        Servicio servicioMock = new Servicio();
        servicioMock.setId(servicioId);
        servicioMock.setDuracionMinutos(duracionMinutos);
        servicioMock.setPrecio(BigDecimal.TEN);

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(usuarioMock));
        when(servicioRepository.findById(servicioId)).thenReturn(Optional.of(servicioMock));
        when(citaRepository.save(any(Cita.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // ACT
        Cita resultado = citaService.crearCita(fechaInicio, usuarioId, servicioId);

        // ASSERT
        assertNotNull(resultado);
        assertEquals(fechaInicio, resultado.getFechaHoraInicio());
        assertEquals(fechaInicio.plusMinutes(duracionMinutos), resultado.getFechaHoraFin());
        verify(citaRepository).save(any(Cita.class));
    }

    @Test
    void crearCita_DebeLanzarExcepcion_SiServicioNoExiste() {
        // ARRANGE
        Long usuarioId = 1L;
        Long servicioIdInexistente = 99L;
        LocalDateTime fechaInicio = LocalDateTime.now();

        when(servicioRepository.findById(servicioIdInexistente)).thenReturn(Optional.empty());

        // ACT & ASSERT
        Exception exception = assertThrows(RuntimeException.class, () -> {
            citaService.crearCita(fechaInicio, usuarioId, servicioIdInexistente);
        });

        assertEquals("Servicio no encontrado", exception.getMessage());
        verify(citaRepository, never()).save(any());
    }
}