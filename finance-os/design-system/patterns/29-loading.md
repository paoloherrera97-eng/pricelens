# 29 · Loading

> La percepción de velocidad importa tanto como la velocidad. Y una espera explicada se
> tolera mucho mejor que una espera muda.

---

## 1. La regla de los umbrales

Qué mostrar depende **solo** de cuánto va a tardar:

| Duración         | Qué se muestra                                                         |
| ---------------- | ---------------------------------------------------------------------- |
| **< 100 ms**     | Nada. Mostrar algo produce un parpadeo peor que la espera              |
| **100–300 ms**   | Nada visual; el control pasa a `aria-busy`                             |
| **300 ms – 1 s** | [Skeleton](30-skeletons.md) del contenido                              |
| **1 – 5 s**      | Skeleton + texto de estado ("Cargando movimientos…")                   |
| **5 – 30 s**     | Barra de progreso determinada + lo hecho / lo que falta                |
| **> 30 s**       | Proceso en segundo plano: se libera la interfaz y se avisa al terminar |

**El error clásico es mostrar un spinner para 200 ms.** Aparece, y desaparece antes de que el
ojo lo procese: el resultado percibido es un parpadeo, que se lee como fallo, no como
velocidad.

## 2. Los indicadores

### 2.1 Skeleton — el principal

La opción por defecto para cargar contenido con forma conocida. Ver
[30 · Skeletons](30-skeletons.md).

### 2.2 Spinner

Solo cuando **no se conoce la forma** del resultado o el espacio es mínimo (dentro de un
botón).

```
Tamaño:     16 px (en botón) · 20 px (en línea) · 24 px (en bloque)
Trazo:      2 px
Color:      accent, con la pista en border-subtle
Velocidad:  1 vuelta cada 800 ms, lineal — sin aceleración
```

**Nunca un spinner a pantalla completa.** Bloquea todo, no dice qué se está haciendo y no
permite cancelar.

### 2.3 Barra de progreso

Cuando se conoce el avance. **Determinada siempre**: una barra indeterminada tiene la misma
información que un spinner y ocupa diez veces más.

```
Alto:       4 px · Radio: full · Pista: surface-sunken · Relleno: accent
Etiqueta:   "1.284 de 4.284 asientos" — cifras, no porcentaje solo
```

Las cifras absolutas informan mejor que el porcentaje: "1.284 de 4.284" permite estimar el
tiempo restante; "30 %" no.

### 2.4 Carga en línea

Para actualizar una parte: el valor se sustituye por un skeleton **de su tamaño exacto** y el
resto de la pantalla no se toca.

## 3. Reglas

1. **Nunca se bloquea toda la pantalla.** Lo que ya está cargado sigue siendo utilizable.
2. **La carga no cambia el layout.** El indicador ocupa el espacio exacto del contenido que
   viene. Si el layout salta al llegar los datos, el skeleton estaba mal medido.
3. **A partir de 1 s se dice qué se está haciendo.** "Cargando…" es peor que "Consultando
   movimientos de julio".
4. **A partir de 5 s se puede cancelar.**
5. **Carga progresiva:** lo que llega se muestra. Un dashboard no espera al bloque más lento
   para pintar los otros tres.
6. **Nunca datos parciales sin marcar.** Si solo hay 3 de 4 fuentes, la cuarta muestra su
   propio estado de carga; **jamás** un total calculado sobre datos incompletos presentado
   como definitivo. Esta es la regla crítica del capítulo.
7. **La animación respeta `prefers-reduced-motion`:** el spinner pasa a un pulso de opacidad,
   el skeleton pierde el barrido.

## 4. Carga optimista

Para acciones cuyo éxito es casi seguro (marcar como conciliado, guardar una nota): la
interfaz **muestra el resultado inmediatamente** y confirma después.

- El elemento afectado lleva un punto `accent` de 6 px mientras no esté confirmado.
- Si falla, se revierte con una alerta que explica qué pasó.
- **Nunca se aplica a nada que mueva dinero.** Un asiento, un pago o un cierre de periodo se
  muestran cuando el servidor confirma, no antes. La comodidad no vale una cifra falsa en
  pantalla, ni por dos segundos.

## 5. Accesibilidad

- El contenedor que carga lleva `aria-busy="true"`.
- El progreso: `role="progressbar"` con `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.
- El estado se anuncia en `aria-live="polite"` al empezar y al terminar, no de forma continua.
- El spinner es decorativo (`aria-hidden`); el estado lo dice el texto.

## 6. Excel

Excel bloquea el hilo mientras calcula: no hay carga asíncrona real. Lo que sí se puede hacer:

```
Barra de estado (VBA):
  Application.StatusBar = "Consultando movimientos… 1.284 de 4.284"
  ' al terminar, SIEMPRE:
  Application.StatusBar = False

Para procesos largos:
  Application.ScreenUpdating = False   ' evita el parpadeo de recálculo
  Application.Calculation = xlCalculationManual
  ' … proceso …
  Application.Calculation = xlCalculationAutomatic
  Application.ScreenUpdating = True

Celda de estado (siempre, sin macro):
  B3 = "Última actualización: " & TEXTO(Ult_Sync;"dd/mm/aaaa hh:mm")
```

Cuatro advertencias operativas:

- **`Application.StatusBar` hay que devolverla a `False`**, o se queda con el último mensaje
  para siempre y el usuario cree que el proceso sigue.
- **`ScreenUpdating = False` sin `True` al final** deja Excel en un estado aparentemente
  colgado. Va en un manejador de errores, no al final del flujo feliz.
- **Con `Calculation = xlCalculationManual`, las cifras en pantalla son antiguas.** Mientras
  dure, la celda de control muestra "Recalculando" en `surface-warning`. Es la aplicación de
  la regla 6: nunca datos parciales sin marcar.
- **`DoEvents` para permitir cancelar** en procesos de más de 5 segundos, con `Esc` atendido.

Y la que más importa: **una consulta de Power Query que tarda 40 segundos no se resuelve con
un indicador**. Se resuelve reduciendo el volumen que se trae. En Excel, el diseño de la
espera es sobre todo diseño del modelo de datos.

---

**Anterior:** [28 · Estados vacíos](28-estados-vacios.md) ·
**Siguiente:** [30 · Skeletons](30-skeletons.md)
