# 28 · Estados vacíos

> "No hay datos" no es un estado: son **cinco estados distintos** con causas y salidas
> distintas. Tratarlos igual es el error de diseño más frecuente y más caro.

---

## 1. Los cinco vacíos

| Vacío              | Causa                                      | Qué necesita el usuario         |
| ------------------ | ------------------------------------------ | ------------------------------- |
| **Primer uso**     | Aún no se ha configurado nada              | Saber cómo empezar              |
| **Sin resultados** | Los filtros no devuelven nada              | Saber qué filtro quitar         |
| **Vacío legítimo** | No hubo movimientos. **Es un dato válido** | Confirmación de que es correcto |
| **Sin permiso**    | Hay datos, pero no para este usuario       | Saber a quién pedirlo           |
| **Error de carga** | Fallo técnico                              | Reintentar                      |

**El vacío legítimo es el que casi todos los productos tratan mal.** "No hay movimientos en
julio" puede ser exactamente la respuesta correcta y valiosa: significa que no hubo
actividad. Presentarlo con un dibujo triste y "¡Vaya, no encontramos nada!" convierte un dato
en un aparente fallo.

## 2. Anatomía

```
┌────────────────────────────────────────────────────┐
│                                                    │
│                                                    │   64px arriba
│         Sin movimientos en julio 2025              │   ← h3 20/600/text-primary
│                                                    │   8px
│         La cuenta 4300 no registró operaciones     │   ← body 14/text-secondary
│         entre el 1 y el 31 de julio.               │      máximo 2 líneas
│                                                    │   24px
│         [Cambiar periodo]                          │   ← botón secundario, opcional
│                                                    │
│                                                    │   64px abajo
└────────────────────────────────────────────────────┘
```

| Elemento    | Regla                                                      |
| ----------- | ---------------------------------------------------------- |
| **Icono**   | **No hay.** Ver § 4                                        |
| Título      | Una frase que dice **qué pasa**, con el contexto concreto  |
| Descripción | Una o dos líneas: la causa. Nunca más                      |
| Acción      | Solo si hay una salida clara. Nunca dos                    |
| Alineación  | Centrada horizontalmente, en el bloque que estaría ocupado |

## 3. Los cinco, escritos

| Vacío          | Título                                    | Descripción                                                           | Acción             |
| -------------- | ----------------------------------------- | --------------------------------------------------------------------- | ------------------ |
| Primer uso     | "Conecta tu primer origen de datos"       | "Finance OS lee tus movimientos desde tu ERP o desde un archivo."     | `Conectar origen`  |
| Sin resultados | "Ningún asiento coincide con los filtros" | "3 filtros activos: periodo, cuenta y estado."                        | `Quitar filtros`   |
| Vacío legítimo | "Sin movimientos en julio 2025"           | "La cuenta 4300 no registró operaciones entre el 1 y el 31 de julio." | `Cambiar periodo`  |
| Sin permiso    | "No tienes acceso a esta entidad"         | "Solicita acceso a Grupo Ejemplo · Consolidado a tu administrador."   | `Solicitar acceso` |
| Error de carga | "No se pudieron cargar los movimientos"   | "El origen no respondió. Los datos mostrados pueden ser anteriores."  | `Reintentar`       |

Observación transversal: **todos mencionan el contexto real** —la cuenta, el periodo, el
número de filtros—. Un estado vacío genérico obliga al usuario a reconstruir por su cuenta
qué estaba pidiendo.

## 4. Sin ilustración, y por qué

La convención del sector es una ilustración grande, gris y amable en el centro de la pantalla.
En Finance OS **no**:

1. **Ocupa el espacio de la información**, y ese espacio se va a llenar de datos en cuanto
   haya.
2. **No informa.** Una lupa dibujada no dice qué filtro sobra.
3. **Trivializa lo que a veces no es trivial.** "No hay datos" en un balance puede significar
   que la carga falló, y un dibujo simpático es el tono equivocado.
4. **Envejece.** Las ilustraciones son lo primero que fecha un producto — y este sistema es
   [atemporal por requisito](../foundations/01-filosofia-visual.md#25-atemporalidad-como-requisito-técnico).

Lo que se usa en su lugar: **espacio y una frase bien escrita.** 64 px arriba y abajo, texto
centrado. Es más limpio, es más útil y no hay que mantenerlo.

## 5. Reglas

1. **El vacío legítimo no es un error.** Ni ámbar, ni rojo, ni icono de aviso. Texto neutro.
2. **Nunca borrar el contexto.** El header, los filtros y las columnas de la tabla **siguen
   visibles**. Vaciar la pantalla entera hace perder el sitio.
3. **Nunca "No hay datos" a secas.** Dice qué no hay, dónde y por qué.
4. **Una acción como mucho**, y solo si es clara. Dos botones en un estado vacío es un
   estado vacío que no sabe qué recomendar.
5. **La tabla vacía conserva sus encabezados.** Enseñan qué habrá cuando haya algo.
6. **Sin exclamaciones, sin emojis, sin disculpas.**

## 6. Accesibilidad

- El estado vacío es texto real, no una imagen con texto.
- Al aparecer tras una acción (filtrar), se anuncia con `aria-live="polite"`.
- El título es un encabezado real en la jerarquía del documento.
- La acción es un botón real, enfocable y alcanzable con teclado.

## 7. Excel

```
Vacío legítimo:   La tabla conserva encabezados y formato
                  Celda B(primera fila): "Sin movimientos en julio 2025"
                  Estilo FOS/Empty · Aptos 11 pt · color 636C7A · cursiva NO
                  Fila de altura doble (54 pt) para que respire
Sin resultados:   El autofiltro ya indica "0 de 4.284 registros" en la barra de estado
                  Además: celda de aviso sobre la tabla, relleno EEF2FE, texto 2F49B4
                  "3 filtros activos · Ningún registro coincide"
Error de carga:   Celda de control con relleno FDECEB y texto C22B24
                  "No se pudieron actualizar los datos · Última carga 03/08 18:04"
Fórmulas:         SI.ERROR(...; "—") — nunca dejar #N/D ni #¡VALOR! visibles
```

Dos reglas específicas de Excel:

- **`—` para "sin dato", `0,00` para cero.** La distinción de
  [06 · Tipografía § 6](../foundations/06-tipografia.md#6-formato-numérico) se implementa con
  `SI.ERROR` y con la cuarta sección del formato numérico personalizado.
- **Ningún error de fórmula visible.** Un `#¡REF!` en una hoja de presentación destruye la
  confianza en todo el libro, incluso en las cifras correctas. Todas las fórmulas de
  presentación van envueltas en `SI.ERROR`.

---

**Anterior:** [27 · Menús](27-menus.md) · **Siguiente:** [29 · Loading](29-loading.md)
