# StatelessAuth

Práctica de autenticación *stateless* entre microservicios usando JWT firmados
de forma asimétrica (RS256). Un servidor de autenticación emite el token con la
llave privada y cada microservicio (service-alpha, service-beta) lo valida de
forma independiente con la llave pública compartida, sin guardar estado de sesión.

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/auth/token` | Valida credenciales y devuelve un JWT (RS256, expira en 1 min) |
| `GET`  | `/v1/service-alpha/private` | Recurso privado del Servicio Alpha (protegido) |
| `GET`  | `/v1/service-beta/private`  | Recurso privado del Servicio Beta (protegido) |

---

## Documento teórico

### 1. ¿Cómo mejora la experiencia de usuario un Refresh Token sin comprometer la seguridad?

En esta práctica los JWT son *stateless* y tienen una vida muy corta (expiran al
minuto). Esto es bueno para la seguridad —si a alguien le roban el token, solo le
sirve durante esa pequeña ventana de tiempo— pero es bastante incómodo para el
usuario: si tuviéramos que pedirle que vuelva a escribir su usuario y contraseña
cada 60 segundos, la aplicación sería prácticamente inusable.

Aquí es donde entra el **Refresh Token**, y la idea es separar dos
responsabilidades que normalmente confundimos en uno solo:

- **Access Token (el JWT corto):** es el que se manda en cada petición a los
  microservicios. Como vive poco, el riesgo de que quede expuesto es bajo.
- **Refresh Token (de larga duración):** no sirve para acceder a los recursos
  protegidos. Su único trabajo es pedirle al servidor de autenticación un nuevo
  Access Token cuando el anterior expira.

De esta forma, cuando el Access Token de 1 minuto caduca, el cliente no molesta al
usuario: simplemente, *por detrás*, usa el Refresh Token para pedir uno nuevo y
sigue trabajando como si nada. El usuario percibe una sesión continua (buena UX),
pero internamente seguimos rotando tokens de corta duración (buena seguridad).

La parte de "sin comprometer la seguridad" es importante y se apoya en varias
ideas:

1. **El Refresh Token vive en un lugar más protegido** que el Access Token y no
   se expone en cada petición a los microservicios, así que su superficie de
   ataque es menor.
2. **Se puede revocar.** A diferencia de un JWT *stateless* —que es válido hasta
   que expira sí o sí—, el servidor de autenticación sí puede llevar una lista de
   Refresh Tokens válidos en su base de datos. Si detectamos algo raro (un robo,
   un logout, etc.), lo invalidamos y se corta la cadena de renovaciones.
3. **Rotación de Refresh Tokens.** Una buena práctica es que cada vez que se usa
   un Refresh Token para renovar, se emite uno nuevo y se invalida el anterior.
   Si un atacante intenta reutilizar uno viejo, el servidor lo detecta y puede
   cancelar toda la sesión.

En resumen: el Access Token corto nos da seguridad, y el Refresh Token nos
devuelve la comodidad que esa seguridad nos había quitado.

### 2. ¿Dónde debe almacenarse y gestionarse el Refresh Token? (cliente vs. servidor)

Acá hay que distinguir dos cosas, porque la respuesta es "en ambos lados, pero
cada uno hace algo distinto":

**Del lado del servidor.** El servidor de autenticación debería guardar una
referencia de los Refresh Tokens emitidos (por ejemplo, en una tabla de la base
de datos asociada al usuario). Esto es lo que nos permite revocarlos y aplicar la
rotación que mencioné antes. Aunque el Access Token sea *stateless*, el Refresh
Token sí tiene "estado" controlado por el servidor, y eso es justamente lo que lo
hace más seguro.

**Del lado del cliente.** Aquí está la decisión más delicada, y la buena práctica
es **no** guardarlo en `localStorage` ni `sessionStorage`. El motivo es que esos
almacenes son accesibles desde JavaScript, así que si la página sufre un ataque
de **XSS** (Cross-Site Scripting), el atacante podría leer el token y robárselo.

La recomendación es guardarlo en una **cookie segura** con estas banderas:

- **`HttpOnly`**: la cookie no es accesible desde JavaScript, lo que la protege
  contra XSS (el código malicioso no puede leerla).
- **`Secure`**: la cookie solo se envía por HTTPS, evitando que viaje en texto
  plano y que alguien la intercepte en la red.
- **`SameSite=Strict` (o `Lax`)**: limita que la cookie se mande en peticiones
  desde otros sitios, lo que ayuda a mitigar ataques **CSRF** (Cross-Site Request
  Forgery).
- Idealmente, acotar también el **`Path`** (por ejemplo, solo la ruta de
  refresco) para que la cookie no se mande en todas las peticiones, sino
  únicamente cuando hace falta renovar el token.

Así, el navegador se encarga de mandar la cookie automáticamente al endpoint de
refresco sin que el JavaScript de la aplicación tenga que tocarla nunca. El
Access Token, en cambio, sí se puede manejar en memoria del lado del cliente
(no en disco), porque como expira tan rápido el riesgo es mucho menor.

**Conclusión:** el Refresh Token se gestiona de forma compartida —el servidor
lleva el control para poder revocarlo y rotarlo, y el cliente lo guarda en una
cookie `HttpOnly` + `Secure` + `SameSite` para protegerlo de XSS y CSRF—, mientras
que el Access Token corto se mantiene en memoria y se usa en cada petición.
