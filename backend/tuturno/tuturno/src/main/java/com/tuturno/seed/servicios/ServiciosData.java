package com.tuturno.seed.servicios;

import com.tuturno.model.Servicio;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;

@Service
public class ServiciosData {
    public List<Servicio> getServicios() {
        List<Servicio> servicios = new ArrayList<>();

        servicios.add(new Servicio(null, "Corte de mujer", "Corte personalizado adaptado a tus facciones, estilo y tipo de cabello.", 18.0, 45, "Peluquería"));
        servicios.add(new Servicio(null, "Corte de hombre", "Corte clásico o moderno a tijera o máquina, incluye lavado y peinado rápido.", 12.0, 30, "Peluquería"));
        servicios.add(new Servicio(null, "Corte infantil", "Corte de pelo adaptado para los más pequeños, rápido y cómodo.", 10.0, 30, "Peluquería"));
        servicios.add(new Servicio(null, "Peinado / Brushing (Pelo corto)", "Lavado y secado con técnica de brushing para dar forma y volumen.", 15.0, 30, "Peluquería"));
        servicios.add(new Servicio(null, "Peinado / Brushing (Pelo largo)", "Lavado, secado y moldeado con cepillo y secador para melenas largas.", 22.0, 45, "Peluquería"));
        servicios.add(new Servicio(null, "Recogido de fiesta o evento", "Elaboración de moños, trenzas o semirecogidos diseñados para ocasiones especiales.", 45.0, 60, "Peluquería"));
        servicios.add(new Servicio(null, "Tinte / Color (Solo raíz)", "Aplicación de color profesional exclusivo en la zona de crecimiento (raíces).", 25.0, 45, "Peluquería"));
        servicios.add(new Servicio(null, "Tinte completo", "Aplicación de color uniforme y brillante desde la raíz hasta las puntas.", 35.0, 60, "Peluquería"));
        servicios.add(new Servicio(null, "Mechas clásicas (Plata)", "Técnica de mechas tradicionales con papel de plata para iluminar todo el cabello.", 45.0, 90, "Peluquería"));
        servicios.add(new Servicio(null, "Mechas Balayage / Babylights", "Técnica de aclarado a mano alzada para un efecto degradado, luminoso y natural.", 70.0, 120, "Peluquería"));
        servicios.add(new Servicio(null, "Matiz / Baño de color", "Aporte de brillo extra o corrección de tonos indeseados sin alterar la base natural.", 15.0, 30, "Peluquería"));
        servicios.add(new Servicio(null, "Decoloración completa", "Proceso de extracción del pigmento natural para conseguir tonos rubios muy claros.", 60.0, 120, "Peluquería"));
        servicios.add(new Servicio(null, "Tratamiento de hidratación", "Mascarilla intensiva profesional con aporte de calor para recuperar la fibra capilar.", 20.0, 30, "Peluquería"));
        servicios.add(new Servicio(null, "Alisado orgánico / Keratina", "Tratamiento profundo para eliminar el encrespamiento y alisar de forma duradera.", 120.0, 180, "Peluquería"));
        servicios.add(new Servicio(null, "Moldeador / Permanente", "Cambio de estructura capilar para conseguir rizos u ondas definidas y duraderas.", 50.0, 120, "Peluquería"));

        servicios.add(new Servicio(null, "Diseño de cejas", "Depilación con pinza o cera para dar la forma ideal que mejor enmarque tu rostro.", 8.0, 15, "Estética"));
        servicios.add(new Servicio(null, "Depilación facial con hilo", "Técnica milenaria de extracción del vello de raíz, muy precisa e ideal para pieles sensibles.", 10.0, 15, "Estética"));
        servicios.add(new Servicio(null, "Tinte de cejas y pestañas", "Coloración semipermanente para dar profundidad e intensidad a la mirada sin maquillaje.", 15.0, 30, "Estética"));
        servicios.add(new Servicio(null, "Lifting de pestañas", "Tratamiento que eleva y curva las pestañas naturales desde la raíz para un efecto de mayor longitud.", 35.0, 60, "Estética"));
        servicios.add(new Servicio(null, "Extensiones de pestañas", "Aplicación de extensiones individuales (pelo a pelo) para alargar y poblar las pestañas.", 50.0, 120, "Estética"));
        servicios.add(new Servicio(null, "Maquillaje de día", "Maquillaje suave, natural y luminoso, ideal para eventos diurnos o reuniones.", 30.0, 45, "Estética"));
        servicios.add(new Servicio(null, "Maquillaje de fiesta / noche", "Maquillaje más intenso, sofisticado y de larga duración con técnicas de contorneado.", 45.0, 60, "Estética"));
        servicios.add(new Servicio(null, "Manicura básica", "Limado, tratamiento de cutículas, hidratación profunda y esmaltado tradicional.", 12.0, 30, "Estética"));
        servicios.add(new Servicio(null, "Manicura semipermanente", "Manicura completa con esmaltado de alta resistencia y brillo, secado en lámpara LED.", 20.0, 45, "Estética"));
        servicios.add(new Servicio(null, "Uñas de gel / Acrílico (Nuevas)", "Construcción y alargamiento de la uña natural con gel o acrílico a medida.", 40.0, 90, "Estética"));
        servicios.add(new Servicio(null, "Relleno de uñas esculpidas", "Mantenimiento de las uñas de gel o acrílico rellenando la zona del crecimiento natural.", 30.0, 60, "Estética"));
        servicios.add(new Servicio(null, "Pedicura completa", "Tratamiento de durezas, cuidado exhaustivo de uñas y cutículas, exfoliación y esmaltado.", 28.0, 60, "Estética"));
        servicios.add(new Servicio(null, "Depilación cera (Piernas enteras)", "Extracción del vello de raíz en ambas piernas completas utilizando cera tibia o caliente.", 20.0, 45, "Estética"));
        servicios.add(new Servicio(null, "Depilación cera (Axilas / Ingles)", "Depilación rápida, eficaz y duradera para zonas corporales pequeñas y sensibles.", 10.0, 15, "Estética"));
        servicios.add(new Servicio(null, "Limpieza facial básica", "Protocolo de desmaquillado, exfoliación, extracción de impurezas, mascarilla y masaje hidratante.", 35.0, 60, "Estética"));

        return servicios;
    }
}