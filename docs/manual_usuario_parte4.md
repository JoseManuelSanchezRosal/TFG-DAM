## 5. GUÍA PARA EL ADMINISTRADOR DEL SISTEMA (SUPERADMIN)

Esta sección está destinada al **administrador técnico de la plataforma TuTurno**. El rol de Superadministrador tiene acceso total al sistema: gestión integral de usuarios, herramientas de soporte técnico avanzado y control centralizado de incidencias reportadas.

> **Nota:** Este rol está reservado exclusivamente al personal técnico responsable del mantenimiento del sistema. Sus credenciales deben custodiarse con la máxima seguridad y nunca deben compartirse con usuarios finales.

---

### 5.1 Acceso al Panel de Administración

1. Accede a TuTurno desde tu navegador.
2. Haz clic en **Zona Clientes** en el menú de navegación superior.
3. Introduce las credenciales de la cuenta con rol *Superadmin*.
4. Haz clic en **Iniciar Sesión**.
5. El sistema detectará el rol de administrador y te redirigirá al **Panel de Administración del Sistema**.

[INSERTA CAPTURA AQUÍ: Vista completa del Panel de Administración del Sistema recién cargado, mostrando el menú o pestañas de navegación con las secciones disponibles (Gestión de Usuarios, Registro de Incidencias). Vista de escritorio]

El panel de administración ofrece las siguientes secciones principales:

| Sección | Descripción |
|---------|-------------|
| **Gestión de Usuarios** | Alta, baja, edición e impersonación de cuentas |
| **Registro de Incidencias** | Visualización y gestión de errores reportados |

---

### 5.2 Gestión Integral de Usuarios

La sección de **Gestión de Usuarios** ofrece una vista tabular completa de todas las cuentas registradas en el sistema, con las herramientas necesarias para su administración.

[INSERTA CAPTURA AQUÍ: Tabla de gestión de usuarios del panel de administración, mostrando varias filas con datos de usuarios (nombre, email, rol) y los botones de acción (editar, eliminar, impersonar) en cada fila. Vista de escritorio]

La tabla de usuarios muestra para cada cuenta:

| Columna | Descripción |
|---------|-------------|
| **ID** | Identificador único del usuario en el sistema |
| **Nombre** | Nombre completo del usuario |
| **Email** | Dirección de correo electrónico (identificador de acceso) |
| **Rol** | Perfil asignado: `cliente`, `jefe` o `admin` |
| **Acciones** | Botones de gestión disponibles |

---

#### 5.2.1 Dar de Alta un Nuevo Usuario (Crear Cuenta)

Además del proceso de auto-registro por parte del cliente, el administrador puede crear cuentas manualmente. Esto es especialmente útil para crear cuentas con roles especiales (*jefe*, *admin*).

1. En la sección de Gestión de Usuarios, haz clic en el botón **"+ Nuevo Usuario"** o **"Añadir Usuario"**.
2. Se abrirá el formulario de creación con los siguientes campos:
   - **Nombre completo**
   - **Correo electrónico**
   - **Contraseña inicial**
   - **Rol:** Selecciona entre `cliente`, `jefe` o `admin`
3. Rellena todos los campos y haz clic en **Guardar**.
4. El nuevo usuario quedará registrado y podrá iniciar sesión inmediatamente con las credenciales indicadas.

[INSERTA CAPTURA AQUÍ: Formulario de creación de nuevo usuario abierto en el panel de administración, mostrando los campos de nombre, email, contraseña y el desplegable de rol. Vista de escritorio]

> **Tip:** Al crear una cuenta de *jefe*, comunica las credenciales al profesional del salón de forma segura. Recuérdale que puede cambiar su contraseña desde la configuración de perfil.

---

#### 5.2.2 Editar los Datos de un Usuario

1. Localiza al usuario en la tabla de gestión.
2. Haz clic en el **icono de lápiz** (✏️) de la fila correspondiente.
3. Se abrirá el formulario de edición con los datos actuales precargados.
4. Modifica los campos necesarios (nombre, email, rol).
5. Haz clic en **Guardar cambios** para aplicar la modificación.

> **Nota:** Modificar el **rol** de un usuario tiene efecto inmediato. Si cambias a un cliente a `jefe`, la próxima vez que inicie sesión accederá al Panel de Jefatura.

---

#### 5.2.3 Dar de Baja (Eliminar) un Usuario

1. Localiza al usuario en la tabla de gestión.
2. Haz clic en el **icono de papelera roja** (🗑️) de la fila correspondiente.
3. El sistema mostrará un **diálogo de confirmación**.
4. Confirma la eliminación. La cuenta será **desactivada permanentemente** y el usuario no podrá volver a iniciar sesión.

[INSERTA CAPTURA AQUÍ: Tabla de usuarios con el diálogo de confirmación de eliminación visible sobre la pantalla, mostrando el nombre del usuario que se va a eliminar. Vista de escritorio]

> **Nota:** Esta acción es **irreversible**. Antes de eliminar una cuenta, verifica que el usuario no tiene **citas futuras pendientes** asociadas, ya que estas también podrían verse afectadas.

---

### 5.3 Función de Impersonación de Usuario

La **impersonación** es una herramienta de soporte técnico avanzado que permite al administrador **iniciar sesión con la identidad de un cliente** sin necesidad de conocer su contraseña. Esta función facilita la reproducción y diagnóstico de problemas técnicos reportados por un usuario concreto.

> **Nota importante:** El uso de la impersonación debe estar siempre justificado por razones de soporte técnico. Esta función debe utilizarse de forma **responsable y ética**, únicamente para resolver incidencias del usuario afectado.

**Cómo usar la función de impersonación:**

1. En la tabla de Gestión de Usuarios, localiza la cuenta del usuario que necesitas impersonar.
2. Haz clic en el **icono de impersonación** (👤 o icono de inicio de sesión rápido) situado en la columna de acciones de la fila del usuario.
3. El sistema cerrará la sesión del administrador y abrirá automáticamente la sesión **como si fuera ese usuario**.
4. Verás una **notificación visual** (banner o toast) en la parte inferior de la pantalla indicando: *"Conectado como [nombre del usuario]"* o *"Acceso rápido como [email]"*.
5. Podrás navegar por la plataforma y reproducir el error exactamente como lo vería el cliente.
6. Para volver a la cuenta de administrador, haz clic en el botón **Salir** del menú de navegación y vuelve a iniciar sesión con tus credenciales de admin.

[INSERTA CAPTURA AQUÍ: Pantalla de la Zona Cliente con las notificaciones de impersonación visibles en la esquina inferior izquierda, mostrando el badge "Conectando como [email]" y "Acceso rápido como [email]". Vista de escritorio]

[INSERTA CAPTURA AQUÍ: Tabla de usuarios del panel de administración con los botones de acción de una fila resaltados, mostrando claramente el icono de impersonación/acceso rápido junto a los de editar y eliminar. Vista de escritorio]

> **Tip:** Antes de impersonar a un usuario, revisa el **informe de error** que haya enviado (sección 5.4) para entender exactamente qué pasos realizó antes de que se produjera el problema. Esto agilizará enormemente el diagnóstico.

---

### 5.4 Registro Centralizado de Incidencias

El **Registro de Incidencias** es el panel de control donde el administrador puede ver, filtrar, gestionar y resolver todos los errores reportados por los usuarios a través del formulario de soporte.

[INSERTA CAPTURA AQUÍ: Vista completa del panel de Registro de Incidencias, mostrando las estadísticas en la parte superior (total, críticos, moderados, leves) y la tabla de informes con varias filas visibles. Vista de escritorio]

**Panel de estadísticas:**

En la parte superior del Registro de Incidencias se muestran **4 contadores en tiempo real**:

| Contador | Descripción |
|----------|-------------|
| **Total** | Número total de informes registrados |
| **Críticos** | Informes de severidad crítica (fondo rojo) |
| **Moderados** | Informes de severidad moderada (fondo naranja) |
| **Leves** | Informes de severidad leve (fondo amarillo) |

---

#### 5.4.1 Visualizar y Filtrar Incidencias

La tabla de incidencias muestra todos los informes recibidos. Para cada informe se muestra:

| Campo | Descripción |
|-------|-------------|
| **Severidad** | Nivel de criticidad (badge de color: Crítico/Moderado/Leve) |
| **Tipo de error** | Categoría del problema reportado |
| **Usuario** | Email del usuario que reportó el error |
| **Dispositivo** | Dispositivo desde el que se reportó |
| **Descripción** | Resumen del texto del informe |
| **Fecha** | Fecha y hora en que se envió el informe |
| **Acciones** | Botones de gestión |

**Para filtrar los informes:**

1. Utiliza los **controles de filtro** situados sobre la tabla:
   - **Filtro por categoría:** Selecciona un tipo de error específico del desplegable.
   - **Filtro por dispositivo:** Filtra por el tipo de dispositivo desde el que se reportó.
   - **Filtro por severidad:** Muestra solo los informes Críticos, Moderados o Leves.
   - **Buscar por usuario:** Escribe el email del usuario para filtrar sus informes.
   - **Buscar en descripción:** Filtra por palabras clave en el texto del informe.

2. Los filtros se aplican **automáticamente** al cambiar cualquier selector.
3. Los **contadores de estadísticas** se actualizan en tiempo real reflejando solo los informes filtrados.

[INSERTA CAPTURA AQUÍ: Panel de incidencias con los filtros visibles en la parte superior y la tabla con informes de diferentes severidades (filas con badges de colores distintos: rojo crítico, naranja moderado, amarillo leve). Vista de escritorio]

> **Tip:** Para ver primero los problemas más urgentes, filtra por **Severidad: Crítico**. Estos son los errores que afectan directamente a la funcionalidad principal de la plataforma (login, reservas, pérdida de datos).

---

#### 5.4.2 Marcar un Informe como Resuelto

Cuando un error ha sido diagnosticado y solucionado:

1. Localiza el informe correspondiente en la tabla.
2. Haz clic en el **botón de check verde** (✅) de la columna de acciones.
3. El sistema actualizará el estado del informe a **"Resuelto"**.
4. La fila del informe aparecerá con **opacidad reducida** para diferenciarlo visualmente de los pendientes.
5. El botón cambiará al icono de **deshacer** (↩️), permitiendo revertir el estado a "Pendiente" si es necesario.

[INSERTA CAPTURA AQUÍ: Tabla de incidencias mostrando un informe marcado como resuelto (fila con opacidad reducida o badge de "Resuelto") junto a otro informe pendiente, para mostrar el contraste visual. Vista de escritorio]

> **Nota:** Marcar un informe como resuelto **no lo elimina** del sistema. El historial completo de incidencias se conserva para poder hacer seguimiento y análisis posterior.

---

#### 5.4.3 Eliminar un Informe

Cuando un informe ya no es relevante o ha sido resuelto y archivado:

1. Localiza el informe en la tabla.
2. Haz clic en el **botón de papelera roja** (🗑️) de la columna de acciones.
3. Confirma la eliminación en el diálogo que aparece.
4. El informe será **eliminado permanentemente** del registro.

[INSERTA CAPTURA AQUÍ: Fila de un informe en la tabla de incidencias con los botones de acción (check verde y papelera roja) claramente visibles y resaltados. Vista de escritorio]

> **Nota:** A diferencia del marcado como resuelto, la **eliminación sí es permanente**. Se recomienda eliminar solo los informes duplicados, irrelevantes o que ya hayan sido archivados por otros medios.

---

## APÉNDICE — GLOSARIO DE TÉRMINOS

| Término | Definición |
|---------|------------|
| **Slot / Hueco horario** | Franja de tiempo disponible para reservar una cita |
| **Onboarding / Guía Interactiva** | Tutorial guiado paso a paso para nuevos usuarios |
| **Spotlight** | Efecto visual que oscurece el fondo y resalta un elemento concreto |
| **Landing Page** | Página de inicio pública de la plataforma |
| **Modal** | Ventana emergente que se superpone sobre el contenido principal |
| **Toast / Notificación** | Mensaje breve que aparece temporalmente en pantalla |
| **CRUD** | Acrónimo de Crear, Leer, Actualizar y Eliminar (operaciones básicas) |
| **Rol** | Nivel de permisos y accesos asignado a una cuenta de usuario |
| **Impersonación** | Técnica de soporte que permite al admin actuar como otro usuario |
| **Responsive** | Diseño adaptable a cualquier tamaño de pantalla |
| **Badge** | Etiqueta visual pequeña que muestra información resumida |

---

## CONTROL DE VERSIONES DEL DOCUMENTO

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| 1.0 | Mayo 2026 | Versión inicial del Manual de Usuario para TFG |

---

*Fin del Manual de Usuario — TuTurno v1.0*
*Documento elaborado como parte de los Anexos del Trabajo de Fin de Ciclo Superior (DAM)*
