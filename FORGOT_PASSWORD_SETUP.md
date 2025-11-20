# Configuración de Recuperación de Contraseña

Este sistema incluye funcionalidad completa de recuperación de contraseña mediante email.

## Configuración del Backend

### 1. Configurar el Servidor de Email (SMTP)

Edita el archivo `Backend/src/main/resources/application.properties` y configura las siguientes propiedades:

```properties
# Configuración de Email (SMTP)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tu-email@gmail.com
spring.mail.password=tu-app-password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true

# URL del frontend para enlaces de recuperación
app.frontend.url=http://localhost:5173
```

### 2. Configurar Gmail con Contraseña de Aplicación

Si usas Gmail:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Navega a **Seguridad**
3. Activa la **Verificación en 2 pasos** (si no está activada)
4. Busca **Contraseñas de aplicaciones**
5. Genera una nueva contraseña de aplicación para "Correo"
6. Usa esa contraseña de 16 caracteres en `spring.mail.password`

### 3. Otros Proveedores de Email

#### Outlook/Hotmail
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
spring.mail.username=tu-email@outlook.com
spring.mail.password=tu-contraseña
```

#### Yahoo
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
spring.mail.username=tu-email@yahoo.com
spring.mail.password=tu-contraseña
```

## Endpoints Disponibles

### Solicitar recuperación de contraseña
```http
POST /api/usuarios/forgot-password
Content-Type: application/json

{
  "email": "usuario@example.com"
}
```

### Restablecer contraseña con token
```http
POST /api/usuarios/reset-password
Content-Type: application/json

{
  "token": "token-recibido-por-email",
  "nuevaContrasena": "NuevaContraseña123"
}
```

## Flujo de Usuario

### Frontend

1. **Solicitar Recuperación**: 
   - Usuario accede a `/forgot-password`
   - Ingresa su correo electrónico
   - Recibe un email con el enlace de recuperación

2. **Restablecer Contraseña**:
   - Usuario hace clic en el enlace del email
   - Es redirigido a `/reset-password?token=xxx`
   - Ingresa su nueva contraseña
   - Es redirigido automáticamente al login

3. **Acceso desde Login**:
   - En el modal de login, hay un enlace "¿Olvidaste tu contraseña?"
   - Redirige a la página de recuperación

## Características de Seguridad

- **Tokens únicos**: Cada solicitud genera un token único UUID
- **Expiración**: Los tokens expiran después de 1 hora
- **Un solo uso**: Los tokens se marcan como usados después de restablecer
- **Validación de contraseña**: 
  - Mínimo 8 caracteres
  - Debe contener letras y números
- **Protección de usuarios Google**: Los usuarios que iniciaron sesión con Google no pueden usar esta funcionalidad
- **Mensajes genéricos**: Por seguridad, no se revela si un email existe o no en el sistema

## Estructura de Base de Datos

Se crea automáticamente la tabla `PasswordResetToken`:

```sql
CREATE TABLE PasswordResetToken (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    id_cli INT NOT NULL,
    expiry_date DATETIME NOT NULL,
    usado BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_cli) REFERENCES Cliente(idCli)
);
```

## Componentes Creados

### Backend
- `PasswordResetToken.java` - Entidad JPA
- `PasswordResetTokenRepository.java` - Repositorio
- `EmailService.java` - Servicio de envío de emails
- Métodos en `AuthService.java`:
  - `solicitarRecuperacionContrasena(String email)`
  - `restablecerContrasena(String token, String nuevaContrasena)`
- Endpoints en `AuthController.java`:
  - `POST /api/usuarios/forgot-password`
  - `POST /api/usuarios/reset-password`

### Frontend
- `forgotPassword.tsx` - Página para solicitar recuperación
- `resetPassword.tsx` - Página para ingresar nueva contraseña
- Funciones en `userServices.ts`:
  - `solicitarRecuperacionContrasena(email)`
  - `restablecerContrasena(token, nuevaContrasena)`
- Enlace en formulario de login

## Pruebas

1. **Prueba la configuración de email**:
   - Solicita recuperación con un email válido
   - Verifica que llegue el correo
   - Revisa los logs del backend

2. **Prueba el flujo completo**:
   - Solicita recuperación
   - Abre el email
   - Haz clic en el enlace
   - Ingresa nueva contraseña
   - Inicia sesión con la nueva contraseña

3. **Prueba casos de error**:
   - Token expirado (después de 1 hora)
   - Token ya usado
   - Token inválido
   - Usuario de Google intentando recuperar

## Troubleshooting

### El email no llega
- Verifica las credenciales SMTP
- Revisa que la contraseña de aplicación sea correcta
- Verifica los logs del backend para errores
- Revisa la carpeta de spam

### Error de autenticación SMTP
- Asegúrate de usar contraseña de aplicación (no tu contraseña normal)
- Verifica que la verificación en 2 pasos esté activada
- Revisa que el puerto sea el correcto (587 para TLS)

### Token inválido
- Verifica que el token en la URL sea completo
- Asegúrate de que no haya pasado más de 1 hora
- Verifica que no se haya usado ya el token

## Próximas Mejoras

- [ ] Plantillas HTML para emails más atractivos
- [ ] Límite de intentos por IP
- [ ] Notificación al usuario cuando se cambie su contraseña
- [ ] Historial de cambios de contraseña
- [ ] Soporte para múltiples idiomas en los emails
