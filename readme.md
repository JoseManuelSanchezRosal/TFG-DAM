# TuTurno - Aplicación Web para Reserva de Citas

TuTurno es una plataforma web desarrollada como Trabajo de Fin de Grado (TFG) para el Ciclo Superior de Desarrollo de Aplicaciones Multiplataforma. Está diseñada específicamente para automatizar y gestionar las reservas de un salón de belleza unipersonal, optimizando el tiempo del profesional y ofreciendo disponibilidad 24/7 a los clientes.

## Características Principales

El sistema se divide en roles principales con accesos y permisos específicos para garantizar la seguridad y fluidez del negocio:

* **Usuarios (Clientes):** Pueden registrarse, explorar el catálogo de servicios filtrado por categorías, reservar citas mediante un flujo intuitivo de 3 pasos, y modificar o cancelar sus reservas futuras. También disponen de un formulario para reportar errores técnicos directamente desde su panel.
* **Jefe (Profesional):** Dispone de un panel de jefatura con una agenda interactiva para visualizar las citas diarias, gestionar reservas manualmente (añadir, editar, eliminar) y mantener el catálogo de tratamientos mediante operaciones CRUD.
* **Superadministrador:** Cuenta con herramientas de soporte avanzado, incluyendo la gestión integral de usuarios, el registro centralizado de incidencias y una función técnica de "impersonación" para iniciar sesión como cualquier cliente y depurar errores en vivo.

## Stack Tecnológico

El proyecto sigue una arquitectura cliente-servidor completamente desacoplada:

### Backend (API RESTful)
* **Lenguaje:** Java.
* **Framework:** Spring Boot.
* **Persistencia (ORM):** Spring Data JPA / Hibernate.
* **Base de Datos:** PostgreSQL.
* **Utilidades:** Lombok para reducir código repetitivo.

### Frontend (Interfaz de Usuario)
* **Estructura y Estilos:** HTML5 y CSS3.
* **Lógica de Cliente:** Vanilla JavaScript para la manipulación del DOM y las peticiones asíncronas HTTP, sin dependencias de frameworks externos.
* **Diseño UX/UI:** Totalmente responsivo, adaptándose a pantallas de PC, tablets y dispositivos móviles sin requerir la instalación de aplicaciones adicionales. Se incluye una Guía Interactiva (Onboarding) para educar a los usuarios en su primer acceso.

## Arquitectura y Base de Datos

* **Prevención de Solapamientos:** La lógica del servidor calcula los huecos disponibles sumando automáticamente la duración del servicio más los tiempos técnicos de preparación. El sistema garantiza integridad de datos impidiendo que dos citas se guarden en el mismo tramo horario.
* **Normalización:** El modelo relacional está diseñado cumpliendo hasta la Tercera Forma Normal (3FN), asegurando que los atributos dependan exclusivamente de sus claves primarias.
* **Seguridad:** El sistema exige autenticación para paneles privados y las contraseñas de los usuarios son encriptadas (hash) obligatoriamente antes de ser almacenadas en la base de datos.

## Pruebas (Testing)

Se ha implementado una sólida base de pruebas para certificar la viabilidad técnica de la aplicación:
* **Verificación de Infraestructura:** Comprobación del correcto arranque del contexto de Spring Boot.
* **Gestión de Identidad:** Validación del registro único de correos y la encriptación de credenciales.
* **Lógica de Negocio:** Tests unitarios orientados a verificar el cálculo matemático de huecos, el respeto por los días inhábiles y el bloqueo estricto contra solapamientos de citas.
* **API Testing:** Uso intensivo de Postman para validar los endpoints.

## Autor
* **Desarrollador:** José Manuel Sánchez Rosal.