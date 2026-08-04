# 31 · Responsive mindset

> Excel es la primera plataforma, y Excel no es responsive. Aun así, este capítulo se escribe
> ahora — porque diseñar hoy sin pensar en el cambio de tamaño obliga a rediseñarlo todo
> mañana.

---

## 1. La postura

**No se diseña para dispositivos. Se diseña para umbrales de contenido.**

La pregunta correcta no es "¿cómo se ve esto en una tableta?" sino "¿qué pasa cuando esta
tabla no cabe?". La respuesta vale para una tableta, para una ventana partida, para un
proyector y para A4 apaisado — que son todos el mismo problema.

Es lo que permite que un sistema pensado para Excel llegue a la web sin rediseñarse: los
umbrales ya estaban decididos.

## 2. Breakpoints (web)

| Nombre | Desde | Sidebar | Rejilla | Densidad |
| --- | ---: | --- | ---: | --- |
| `xs` | 0 | Oculto, superpuesto | 4 col | `relaxed` |
| `sm` | 640 | Oculto, superpuesto | 4 col | `relaxed` |
| `md` | 768 | Colapsado (64 px) | 8 col | `default` |
| `lg` | 1024 | Colapsado (64 px) | 12 col | `default` |
| `xl` | 1280 | Expandido (240 px) | 12 col | `default` |
| `2xl` | 1536 | Expandido | 12 col, máx. 1440 | `default` |

Solo hacia arriba (`min-width`), nunca `max-width`: cada breakpoint **añade**, no corrige.

## 3. Las cuatro decisiones de adaptación

### 3.1 Una tabla que no cabe: prioridad, no compresión

**Nunca se encogen las columnas hasta que la cifra se corta.** El orden de recursos es:

```
1. Ocultar columnas por prioridad     ← primera opción, siempre
2. Fijar la primera columna y desplazar horizontalmente
3. Colapsar cada fila en una tarjeta   ← solo por debajo de 640 px
```

Cada columna declara su prioridad, y la prioridad forma parte del diseño de la tabla, no de
la implementación:

| Prioridad | Ejemplo | Se oculta… |
| ---: | --- | --- |
| **1** | Concepto, importe principal | Nunca |
| **2** | Variación, periodo comparado | Por debajo de `md` |
| **3** | Metadatos, estado, fecha | Por debajo de `lg` |
| **4** | Auditoría, usuario, origen | Solo bajo petición |

Lo que se oculta sigue accesible en el detalle de la fila. **Ocultar no es perder.**

### 3.2 KPIs: se apilan, no se encogen

```
≥ 1280 px    4 en fila
1024–1279    2 × 2
< 1024       1 columna
```

La cifra **conserva su tamaño** (`metric-lg` 32 px) en todos los casos. Un KPI de 18 px deja
de ser un KPI: el tamaño es lo que lo hace principal.

### 3.3 Gráficos: menos detalle, no menos tamaño

Al estrechar se quitan: etiquetas de datos → cuadrícula → etiquetas de eje alternas →
leyenda (sustituida por etiqueta directa). Lo que **no** se quita nunca: la línea base del
eje de valores y la identificación de las series.

Por debajo de 640 px, un gráfico de más de 3 series pasa a tabla. Es más útil.

### 3.4 Navegación: se transforma

Sidebar expandido → colapsado (iconos) → superpuesto con velo → barra inferior con las 4
áreas principales, por debajo de 640 px.

## 4. Lo que NO cambia nunca

| Invariante | Por qué |
| --- | --- |
| Tamaño del texto de datos (14 px) | Reducirlo hace ilegible lo importante |
| Tamaño de la cifra de KPI | Es lo que la hace principal |
| Alineación de números a la derecha | Es lo que permite compararlos |
| Cifras tabulares | Igual |
| Contraste | La accesibilidad no depende del ancho |
| Objetivo táctil mínimo | Crece en táctil, nunca decrece |
| Rejilla de 8 px | Es la misma en todas partes |
| Precisión decimal | Redondear distinto según pantalla produce cifras contradictorias |

La última es la más importante y la más fácil de romper: si el móvil muestra `2,8 M` y el
escritorio `2.847.392,00 €`, dos personas mirando el mismo dato en dispositivos distintos
verán números distintos, y una de las dos lo dirá en voz alta en una reunión.

## 5. Táctil

- Objetivo mínimo **44 px** (por encima del mínimo de 24 px de la SC 2.5.8).
- Densidad `relaxed` por defecto.
- Sin hover: todo lo que aparecía al pasar el ratón está siempre visible o en el menú `⋯`.
  Es la razón de la [regla 9 de UI](../foundations/04-principios-ui.md#9-optimizar-el-estado-en-reposo):
  si nada depende del hover, no hay nada que rescatar en táctil.
- Deslizar sobre una fila: **prohibido para acciones destructivas.**
- Zoom hasta el 200 % sin pérdida de contenido (SC 1.4.4). No se desactiva.

## 6. El "responsive" de Excel

Excel no reajusta nada. Su equivalente son **cuatro contextos de salida fijos**, y se diseña
para los cuatro desde el principio:

| Contexto | Ancho útil | Decisiones |
| --- | ---: | --- |
| **Pantalla 1920** | ~1.700 px | Esqueleto completo B–L |
| **Pantalla 1366** | ~1.140 px | Esqueleto completo. **Es el objetivo de diseño** |
| **A4 apaisado** | 1.052 px @96 dpi | Área de impresión B:L, ajustar a 1 página de ancho |
| **A4 vertical** | 744 px @96 dpi | Solo columnas de prioridad 1–2 |

El esqueleto de columnas de [08 · Grid](../foundations/08-grid.md#3-excel-el-esqueleto-de-columnas)
(≈ 1.140 px) está dimensionado para el segundo y el tercero a la vez: **un libro diseñado a
1366 px se imprime en A4 apaisado sin tocar nada.** No es casualidad; es el criterio con el
que se eligieron los anchos.

### Configuración de impresión, que es parte del diseño

```
Diseño de página:
  Orientación:          Horizontal
  Ajustar:              1 página de ancho × automático de alto
  Márgenes:             Estrechos (1,27 cm)
  Imprimir títulos:     Repetir filas superiores $1:$4  (el header)
  Área de impresión:    $B:$L
  Líneas de división:   No imprimir
  Blanco y negro:       Verificar que el diseño sobrevive
  Calidad de borrador:  Desactivada
```

**Imprimir en blanco y negro es una prueba, no una limitación.** Si al hacerlo se pierde
información, hay un significado codificado solo en color y hay que corregirlo — es la
["prueba de la fotocopia"](../foundations/01-filosofia-visual.md#3-la-prueba-de-fuego)
ejecutada de verdad.

## 7. Zoom en Excel

El zoom de Excel escala todo proporcionalmente, incluidas las formas ancladas. Consecuencias
de diseño:

- Los botones dibujados como formas **no deben anclarse a "Mover y cambiar tamaño con
  celdas"**: al 80 % de zoom se deforman.
- El tamaño de fuente **no se compensa con el zoom**. Un libro diseñado a 11 pt y visto al
  80 % se lee a 8,8 pt efectivos: por eso el mínimo del sistema es 11 pt y no 9.
- Los minigráficos **sí** escalan bien: es otra razón para preferirlos a un gráfico insertado
  cuando basta con la forma de la tendencia.

---

**Anterior:** [30 · Skeletons](../patterns/30-skeletons.md) ·
**Siguiente:** [A1 · Movimiento](../appendix/A1-movimiento.md)
