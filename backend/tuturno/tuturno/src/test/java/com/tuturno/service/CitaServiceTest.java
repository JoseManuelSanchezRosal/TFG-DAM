package com.tuturno.service;

import com.tuturno.dto.cita.SlotDto;
import com.tuturno.model.Cita;
import com.tuturno.model.Servicio;
import com.tuturno.model.Usuario;
import com.tuturno.repository.CitaRepository;
import com.tuturno.repository.ServicioRepository;
import com.tuturno.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
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

    @BeforeEach
    void setUp() {
        // Inicializar las propiedades @Value que utiliza el servicio
        ReflectionTestUtils.setField(citaService, "weekdayStartStr", "10:00");
        ReflectionTestUtils.setField(citaService, "weekdayEndStr", "19:00");
        ReflectionTestUtils.setField(citaService, "saturdayStartStr", "10:00");
        ReflectionTestUtils.setField(citaService, "saturdayEndStr", "14:00");
        ReflectionTestUtils.setField(citaService, "preparationTimeMinutes", 15);
    }

    // =========================================================================
    // TESTS PARA: listarSegunRol
    // =========================================================================

    @Test
    void listarSegunRol_DebeDevolverTodasLasCitas_SiEsAdmin() {
        // ARRANGE
        when(citaRepository.findAll()).thenReturn(List.of(new Cita(), new Cita()));
        // ACT
        List<Cita> resultado = citaService.listarSegunRol(1L, true);
        // ASSERT
        assertEquals(2, resultado.size());
        verify(citaRepository).findAll();
        verify(citaRepository, never()).findByUsuarioId(any());
    }

    @Test
    void listarSegunRol_DebeDevolverCitasDelUsuario_SiNoEsAdmin() {
        // ARRANGE
        Long usuarioId = 1L;
        when(citaRepository.findByUsuarioId(usuarioId)).thenReturn(List.of(new Cita()));
        // ACT
        List<Cita> resultado = citaService.listarSegunRol(usuarioId, false);
        // ASSERT
        assertEquals(1, resultado.size());
        verify(citaRepository).findByUsuarioId(usuarioId);
        verify(citaRepository, never()).findAll();
    }

    // =========================================================================
    // TESTS PARA: getHuecosDisponibles
    // =========================================================================

    @Test
    void getHuecosDisponibles_DebeLanzarExcepcion_SiServiciosNoExisten() {
        when(servicioRepository.findAllById(any())).thenReturn(new ArrayList<>());
        Exception exception = assertThrows(RuntimeException.class, () -> 
            citaService.getHuecosDisponibles(LocalDate.now(), List.of(99L))
        );
        assertEquals("Servicios no encontrados", exception.getMessage());
    }

    @Test
    void getHuecosDisponibles_SinHuecosEnDomingoYLunes() {
        // Buscar un domingo (Ej: 26 Mayo 2024 fue Domingo)
        LocalDate domingo = LocalDate.of(2024, 5, 26);
        Servicio s1 = new Servicio(); s1.setDuracionMinutos(30);
        when(servicioRepository.findAllById(any())).thenReturn(List.of(s1));

        List<SlotDto> resultado = citaService.getHuecosDisponibles(domingo, List.of(1L));
        assertTrue(resultado.isEmpty());
    }

    @Test
    void getHuecosDisponibles_DevuelveHuecos_DiaEntreSemana() {
        // Fijar un jueves en el futuro (18 de abril de 2030 es Jueves)
        LocalDate juevesFueraPlazo = LocalDate.of(2030, 4, 18);
        
        Servicio s1 = new Servicio();
        s1.setDuracionMinutos(45);
        when(servicioRepository.findAllById(any())).thenReturn(List.of(s1));
        when(citaRepository.findByFecha(juevesFueraPlazo)).thenReturn(new ArrayList<>());

        // Duración total = 45 + 15 prep = 60 min
        // Apertura 10:00, Cierre 19:00. Avanza de 30 en 30 min.
        List<SlotDto> resultado = citaService.getHuecosDisponibles(juevesFueraPlazo, List.of(1L));

        assertFalse(resultado.isEmpty());
        assertEquals(LocalTime.of(10, 0), resultado.get(0).horaInicio());
        assertEquals(LocalTime.of(10, 45), resultado.get(0).horaFin());
    }

    // =========================================================================
    // TESTS PARA: crearCita
    // =========================================================================

    @Test
    void crearCita_Exito() {
        // ARRANGE
        Long usuarioId = 1L;
        Long servicioId = 2L;
        LocalDateTime fechaInicio = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);

        Usuario mockUsuario = new Usuario(); mockUsuario.setId(usuarioId);
        Servicio mockServicio = new Servicio(); mockServicio.setDuracionMinutos(60);

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(mockUsuario));
        when(servicioRepository.findAllById(List.of(servicioId))).thenReturn(List.of(mockServicio));
        when(citaRepository.findByFecha(fechaInicio.toLocalDate())).thenReturn(new ArrayList<>());
        when(citaRepository.save(any(Cita.class))).thenAnswer(i -> i.getArgument(0));

        // ACT
        Cita nuevaCita = citaService.crearCita(fechaInicio, usuarioId, List.of(servicioId));

        // ASSERT
        assertNotNull(nuevaCita);
        assertEquals(usuarioId, nuevaCita.getUsuario().getId());
        assertEquals(fechaInicio.getHour(), nuevaCita.getHora());
        verify(citaRepository).save(any(Cita.class));
    }

    @Test
    void crearCita_LanzaExcepcion_SiHaySolapamiento() {
        Long usuarioId = 1L;
        Long servicioId = 2L;
        LocalDateTime fechaInicio = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0);

        Usuario mockUsuario = new Usuario(); mockUsuario.setId(usuarioId);
        Servicio mockServicio = new Servicio(); mockServicio.setDuracionMinutos(60);

        Cita citaExistente = new Cita();
        citaExistente.setFecha(fechaInicio.toLocalDate());
        citaExistente.setHora(10); citaExistente.setMinutos(15); citaExistente.setSegundos(0);
        citaExistente.setServicios(List.of(mockServicio)); // Ocupa de 10:15 a 11:30 (60 + 15 prep)

        when(usuarioRepository.findById(usuarioId)).thenReturn(Optional.of(mockUsuario));
        when(servicioRepository.findAllById(List.of(servicioId))).thenReturn(List.of(mockServicio));
        when(citaRepository.findByFecha(fechaInicio.toLocalDate())).thenReturn(List.of(citaExistente));

        // ACT & ASSERT: Queremos reservar a las 10:00 (Ocupará hasta las 11:15), solapará con la existente (10:15).
        Exception exception = assertThrows(IllegalStateException.class, () -> 
            citaService.crearCita(fechaInicio, usuarioId, List.of(servicioId))
        );
        assertEquals("El tramo horario seleccionado ya se encuentra ocupado. Por favor, elige otro.", exception.getMessage());
    }

    // =========================================================================
    // TESTS PARA: modificarCita
    // =========================================================================

    @Test
    void modificarCita_ComoAdmin_PuedeCambiarPropietario() {
        Long citaId = 1L;
        LocalDateTime nuevaFecha = LocalDateTime.now().plusDays(2).withHour(12).withMinute(0);
        
        Usuario actualPropietario = new Usuario(); actualPropietario.setId(2L);
        Usuario nuevoPropietario = new Usuario(); nuevoPropietario.setId(3L);
        Servicio servicio = new Servicio(); servicio.setDuracionMinutos(30);
        
        Cita citaAntigua = new Cita(); 
        citaAntigua.setId(citaId); citaAntigua.setUsuario(actualPropietario);

        when(citaRepository.findById(citaId)).thenReturn(Optional.of(citaAntigua));
        when(usuarioRepository.findById(3L)).thenReturn(Optional.of(nuevoPropietario));
        when(servicioRepository.findAllById(anyList())).thenReturn(List.of(servicio));
        when(citaRepository.findByFecha(any())).thenReturn(new ArrayList<>());
        when(citaRepository.save(any(Cita.class))).thenAnswer(i -> i.getArgument(0));

        // ACT
        Cita modificada = citaService.modificarCita(citaId, nuevaFecha, 99L /* Token Admin ID */, 3L /* Target */, List.of(1L), true /* Es Admin */);

        // ASSERT
        assertNotNull(modificada);
        assertEquals(3L, modificada.getUsuario().getId()); // Propietario cambiado
        verify(citaRepository).save(any(Cita.class));
    }

    @Test
    void modificarCita_ComoUsuarioNormal_LanzaExcepcionAlCambiarPropietario() {
        Long citaId = 1L;
        Usuario miUsuario = new Usuario(); miUsuario.setId(2L);
        Cita miCita = new Cita(); miCita.setId(citaId); miCita.setUsuario(miUsuario);

        when(citaRepository.findById(citaId)).thenReturn(Optional.of(miCita));

        Exception exception = assertThrows(RuntimeException.class, () -> 
            citaService.modificarCita(citaId, LocalDateTime.now(), 2L, 3L /* Intenta pasarsela al user 3 */, List.of(1L), false /* No Admin */)
        );
        assertEquals("No tienes permiso para reasignar la cita a otro usuario", exception.getMessage());
    }

    // =========================================================================
    // TESTS PARA: eliminar
    // =========================================================================

    @Test
    void eliminar_Exito_ComoPropietario() {
        Long citaId = 1L;
        Usuario propietario = new Usuario(); propietario.setId(5L);
        Cita cita = new Cita(); cita.setId(citaId); cita.setUsuario(propietario);

        when(citaRepository.findById(citaId)).thenReturn(Optional.of(cita));

        // ACT
        citaService.eliminar(citaId, 5L, false);

        // ASSERT
        verify(citaRepository).deleteById(citaId);
    }

    @Test
    void eliminar_Excepcion_SiNoEsPropietarioNiAdmin() {
        Long citaId = 1L;
        Usuario propietario = new Usuario(); propietario.setId(5L);
        Cita cita = new Cita(); cita.setId(citaId); cita.setUsuario(propietario);

        when(citaRepository.findById(citaId)).thenReturn(Optional.of(cita));

        // ACT
        Exception exception = assertThrows(RuntimeException.class, () -> 
            citaService.eliminar(citaId, 99L /* Otro usuario */, false)
        );

        // ASSERT
        assertEquals("No tienes permiso para eliminar esta cita", exception.getMessage());
        verify(citaRepository, never()).deleteById(any());
    }
}