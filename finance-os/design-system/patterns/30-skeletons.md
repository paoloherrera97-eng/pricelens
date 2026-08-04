# 30 · Skeletons

> Un skeleton es una **promesa sobre la forma** de lo que viene. Si la promesa no se cumple,
> es peor que no haber puesto nada.

---

## 1. Por qué skeleton y no spinner

| | Spinner | Skeleton |
| --- | --- | --- |
| Informa de la forma | No | **Sí** |
| Reserva el espacio | No | **Sí** |
| Evita el salto de layout | No | **Sí** |
| Espera percibida | Más larga | Más corta |
| Requiere conocer la forma | No | Sí |

El skeleton gana siempre que se sepa qué va a llegar — que en un producto con estructura fija
es casi siempre. El spinner queda para lo verdaderamente desconocido.

## 2. Especificación

```
Color base:      surface-sunken   #EDF0F4
Color de brillo: surface          #FFFFFF  al 60 %
Animación:       barrido de izquierda a derecha, 1.600 ms, ease-in-out, en bucle
Radio:           4 px (texto) · el del componente (bloques)
```

**Barrido, no pulso.** El pulso de opacidad se lee como un parpadeo y en una pantalla con
veinte skeletons produce un efecto estroboscópico molesto. El barrido tiene dirección, y la
dirección se lee como progreso.

Un solo barrido para toda la pantalla, **sincronizado**: veinte skeletons con su propia fase
es ruido visual. Todos comparten el mismo reloj.

## 3. Formas

| Contenido | Skeleton |
| --- | --- |
| Línea de texto | Rectángulo del alto de la línea (16/20/24), radio 4 |
| Párrafo | 3 líneas; la última al **60 % de ancho** |
| Título | Rectángulo del alto del título, 40 % de ancho |
| Cifra de KPI | Rectángulo 32 px de alto, 60 % de ancho |
| Badge | Rectángulo 20 × 80 px, radio 4 |
| Avatar | Círculo del tamaño real |
| Fila de tabla | Rectángulos por columna, **con los anchos reales de las columnas** |
| Gráfico | Rectángulo del área de trazado, **con los ejes ya dibujados** |
| Card | Estructura interna completa: título, contenido, pie |

Dos detalles que separan un skeleton bueno de uno decorativo:

- **La última línea de un párrafo va al 60 %.** Un bloque de líneas todas del mismo ancho no
  parece texto; parece una tabla.
- **El gráfico dibuja sus ejes desde el principio.** Los ejes no dependen de los datos: se
  saben. Mostrarlos ya reduce el salto cuando llega la serie.

## 4. Reglas

1. **La forma es la real.** Mismo número de filas, mismos anchos de columna, misma altura de
   card. Un skeleton de 5 filas seguido de una tabla de 20 es una promesa incumplida y el
   salto resultante es peor que no haber mostrado nada.
2. **El texto estático no se esqueletiza.** Encabezados de columna, etiquetas de KPI y
   títulos de sección ya se conocen: se muestran de verdad desde el primer momento. Solo se
   esqueletiza **el dato**.
3. **Máximo 5 filas de skeleton** en una tabla, aunque vayan a llegar 200. Con cinco ya se
   entiende la forma; con doscientas es una pantalla gris.
4. **Nunca más de 3 segundos.** Pasado ese punto, el skeleton deja de tranquilizar y empieza
   a inquietar: se sustituye por progreso con texto de estado (ver
   [29 · Loading](29-loading.md#1-la-regla-de-los-umbrales)).
5. **La transición al contenido es un fundido de 120 ms**, no un cambio brusco.
6. **Nunca hay números falsos en un skeleton.** Ni de relleno, ni difuminados, ni "0,00". Un
   bloque gris no se puede confundir con un dato; un `1.234,00` de relleno sí, y alguien lo
   leerá.

## 5. Ejemplo — dashboard cargando

```
┌────────────────────────────────────────────────────────┐
│ Ingresos                     [Julio 2025] [EUR]        │  ← REAL: se conoce
├────────────────────────────────────────────────────────┤
│ INGRESOS NETOS      MARGEN         GASTOS              │  ← REAL: etiquetas
│ ▓▓▓▓▓▓▓▓▓▓▓         ▓▓▓▓▓▓▓        ▓▓▓▓▓▓▓▓▓          │  ← skeleton: cifras
│ ▓▓▓▓▓               ▓▓▓▓           ▓▓▓▓▓               │  ← skeleton: variación
├────────────────────────────────────────────────────────┤
│ CONCEPTO         JUL 25    JUN 25    VAR.              │  ← REAL: encabezados
│ ▓▓▓▓▓▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓               │
│ ▓▓▓▓▓▓▓▓▓      ▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓               │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓▓▓   ▓▓▓▓▓▓▓   ▓▓▓▓               │
└────────────────────────────────────────────────────────┘
```

Todo lo que se sabe se muestra de verdad. Solo el dato es gris. El resultado: cuando llegan
las cifras, **nada se mueve**.

## 6. Accesibilidad

- El contenedor lleva `aria-busy="true"`; los skeletons van `aria-hidden="true"`.
- Al terminar, `aria-live="polite"` anuncia "Movimientos cargados, 42 registros".
- Con `prefers-reduced-motion: reduce`, **el barrido desaparece** y queda el bloque estático
  en `surface-sunken`. Sigue reservando el espacio, que es su función principal.
- El contraste del skeleton es irrelevante (no es contenido), pero no debe confundirse con un
  campo editable: por eso comparte color con `surface-sunken` **sin borde**, y un input
  siempre lleva `border-strong`.

## 7. Excel

**Excel no tiene skeletons y no debe simularlos.** El recálculo es síncrono: la hoja está
bloqueada o está lista, no hay estado intermedio que representar.

Lo que sí se hace:

```
Durante un proceso largo:
  Application.ScreenUpdating = False        ' la hoja no parpadea
  Application.StatusBar = "Consultando movimientos…"

Celda de control (visible siempre, sin macro):
  Estado: "Actualizando…"  → relleno FDF4E4, texto 8F5B12
  Estado: "Actualizado"    → relleno FFFFFF, texto 636C7A

Fórmulas que dependen de datos aún no cargados:
  =SI(Datos_Listos; calculo; "—")
  → muestra "—" (sin dato), NUNCA 0,00
```

La última línea es la traducción exacta de la regla 6 a Excel: un `0,00` mientras se carga es
un dato falso en pantalla, y en una hoja que alguien puede capturar o imprimir en ese
instante, es un dato falso publicado.

---

**Anterior:** [29 · Loading](29-loading.md) ·
**Siguiente:** [31 · Responsive mindset](../platform/31-responsive.md)
