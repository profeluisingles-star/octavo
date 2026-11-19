# Learning with Mr. Picado · Primera convocatoria

La versión en línea activa el acceso en un solo navegador por código. Comparte con el estudiante la URL de la aplicación web y solo el código activo. El HTML local sirve de vista previa para el profesor.

1. Abre https://script.google.com con la cuenta docente. Crea o abre el proyecto. Pega Code.gs en el archivo del mismo nombre. Crea dos archivos de tipo HTML, Access e Index, y pega el contenido de los archivos correspondientes.
2. Ejecuta initialize desde el editor y autoriza los permisos de Google. Es el paso que crea el registro privado en Hojas de cálculo y permite enviar avisos a profeluisingles@gmail.com.
3. En Configuración del proyecto > Propiedades de secuencia de comandos, guarda el primer código como STUDENT_CODE.
4. En Implementar > Nueva implementación > Aplicación web, selecciona Ejecutar como: Yo. Si el estudiante no tiene cuenta de Google, el acceso debe ser Cualquier persona, si tu cuenta lo permite. Conserva la URL que termina en /exec y comparte esa URL y el código activo. El enlace va sin parámetros. Si ya existía una versión, actualiza esa misma implementación a una versión nueva. Esto conserva la hoja privada.
5. El estudiante abre el enlace en su navegador habitual, introduce el código y luego escribe su nombre. Debe seguir usando el mismo navegador y perfil. Si quieres hacer una prueba primero, usa un código de prueba y sustitúyelo antes de entregar el acceso. Activar el código del estudiante en tu equipo lo dejaría asignado a tu navegador.

## Códigos de reserva

- Guarda los códigos de reserva en privado. Si el estudiante cambia de navegador o borra los datos del sitio, pega un código de reserva sin usar en la propiedad NEXT_STUDENT_CODE y ejecuta activateReplacementCode desde el editor. Entrega ese código. El anterior queda revocado y la URL sigue siendo la misma.
- Para generar cinco códigos adicionales, ejecuta generateReserveCodes y copia los valores del Registro de ejecución. Generarlos conserva el acceso activo.
- Al cambiar de navegador, la hoja docente conserva el historial. El intento y otros resultados guardados solo en el navegador permanecen en el navegador original.

Cada sesión nueva de navegador registra una visita después de identificar al estudiante. Se registran con el nombre escrito una práctica terminada (/30), un quiz terminado (/50), cada reinicio de quiz por tres vidas perdidas (hasta 15/50) y las actividades terminadas de lectura y vocabulario. En lectura se puntúan las respuestas objetivas del primer intento. Las respuestas abiertas se comparan con un modelo y sirven como práctica. El nombre y el avance se guardan por navegador. Si dos estudiantes comparten un dispositivo, deben entrar desde perfiles de navegador separados. La cuenta de Google fija la cuota de correo. Si falla el correo, la hoja conserva el evento y deja constancia del fallo.

La sección Verbos incluye práctica guiada con los ejercicios del PDF y series para aprender los diez verbos en presente y pasado. Esas series muestran el resultado en pantalla. **Compartir mi avance por WhatsApp** prepara un mensaje para el +506 8617 9072. **Preparar informe en Gmail** abre un borrador dirigido a profeluisingles@gmail.com. Ambos incluyen el nombre y los resultados guardados. El estudiante o su encargado pulsa Enviar en el servicio que elija.

El modo quiz oculta las ayudas de la lección e impide copiar la pregunta desde la pantalla en navegadores compatibles. No detecta ni bloquea herramientas externas o un segundo dispositivo.
