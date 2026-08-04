# 09 · Iconografía

> Un icono es una palabra que ocupa menos. Si necesita explicación, la palabra habría sido
> mejor.

---

## 1. Estilo

| Atributo | Valor |
| --- | --- |
| Tipo | Contorno (*outline*). Nunca relleno, nunca dos tonos |
| Rejilla | 24 × 24 px, con 2 px de margen óptico → área útil 20 × 20 |
| Grosor de trazo | **1,5 px** a 24 px, escalado proporcionalmente |
| Terminaciones | Redondeadas (`stroke-linecap: round`) |
| Uniones | Redondeadas (`stroke-linejoin: round`) |
| Esquinas | Radio 2 px en formas cerradas |
| Color | Hereda del texto. **Un icono nunca tiene color propio** |

**Contorno y no relleno** porque un icono relleno pesa visualmente lo mismo que texto en
negrita: en una tabla con un icono por fila, el relleno convierte la columna en una fila de
manchas. El contorno de 1,5 px iguala el color tipográfico del texto de 14 px a peso 400,
que es exactamente lo que se busca — que el icono **no** destaque sobre su etiqueta.

## 2. Tamaños

| Token | px | Uso |
| --- | ---: | --- |
| `icon-sm` | 16 | Dentro de texto de 14 px, badges, celdas de tabla |
| `icon-md` | 20 | Botones, navegación, campos |
| `icon-lg` | 24 | Estados vacíos, encabezados de sección |

Solo tres. El icono se escala desde la rejilla de 24 con el grosor de trazo ajustado para
mantener el peso óptico:

| Tamaño | Trazo |
| ---: | ---: |
| 24 px | 1,5 px |
| 20 px | 1,5 px |
| 16 px | 1,25 px |

A 16 px, un trazo de 1,5 px cierra los contraformas y el icono se convierte en una mancha.
Es el único ajuste, y es óptico, no matemático.

## 3. Alineación con el texto

Un icono junto a texto se alinea por el **centro óptico de la altura de x**, no por la caja.
En la práctica: `vertical-align: -0.125em` para `icon-sm` junto a `body`.

Separación icono-texto: **4 px** (`space-1`) para `icon-sm`, **8 px** (`space-2`) para
`icon-md`. Nunca más: a más separación, el par deja de leerse como una unidad.

## 4. Biblioteca

**Origen único: [Lucide](https://lucide.dev)** (ISC, derivado de Feather). Rejilla de 24,
trazo de 1,5 y terminaciones redondeadas — coincide con la especificación de arriba sin
retocar nada.

Regla de mantenimiento: **los iconos no se dibujan a mano.** Si Finance OS necesita un
concepto que Lucide no cubre, se compone a partir de primitivas de Lucide respetando la
rejilla, y se documenta aquí. Un icono ad-hoc por pantalla es como acaban desalineados todos
los sistemas de iconos.

### Inventario semántico

Cada concepto tiene **un** icono. Un icono no significa dos cosas:

| Concepto | Icono | Notas |
| --- | --- | --- |
| Variación al alza | `chevron-up` | **Nunca** `trending-up`: la flecha diagonal implica tendencia, no variación puntual |
| Variación a la baja | `chevron-down` | |
| Sin variación | `minus` | |
| Tendencia | `trending-up` / `trending-down` | Solo para series, no para una comparación puntual |
| Dato estimado | `sparkles`… **no** | Se usa `circle-dashed`. Nada de magia en finanzas |
| Bloqueado / cerrado | `lock` | Periodo contable cerrado |
| Conciliado | `check` | |
| Pendiente | `clock` | |
| Discrepancia | `alert-triangle` | Reservado a incumplimientos reales |
| Error | `alert-circle` | |
| Información | `info` | |
| Descender al detalle | `chevron-right` | Girado 90° al expandir |
| Fórmula / calculado | `function-square` | |
| Origen del dato | `database` | |
| Exportar | `download` | |
| Importar | `upload` | |
| Filtrar | `filter` | Con punto índigo cuando hay filtro activo |
| Ordenar | `arrow-up-down` | Se sustituye por la dirección concreta al ordenar |
| Buscar | `search` | |
| Configuración | `settings` | |
| Más acciones | `more-horizontal` | Horizontal en filas, vertical en tarjetas |
| Periodo | `calendar` | |
| Moneda | `circle-dollar-sign` | Selector de divisa, no importes |
| Actualizar | `refresh-cw` | |
| Deshacer | `undo-2` | |

## 5. Cuándo NO usar icono

- **Junto al texto de un botón**, salvo que el icono aporte algo que la palabra no da
  (`download`, `plus`). "Guardar" con un disquete no aporta nada.
- **En un KPI.** La cifra es el protagonista; el icono le roba peso.
- **En encabezados de columna.** Ver [15 · Tablas](../components/15-tablas.md).
- **Como único contenido de un control**, sin `aria-label` y sin tooltip. Un icono solo es
  una adivinanza para quien no lo conoce.
- **Para decorar un estado vacío.** Un icono grande y gris en el centro de la pantalla es el
  cliché del estado vacío; ver [28 · Estados vacíos](../patterns/28-estados-vacios.md).

## 6. Excel

Excel **no** tiene un sistema de iconos utilizable para esto. Sus tres opciones y el
veredicto:

| Opción | Veredicto |
| --- | --- |
| Conjuntos de iconos de formato condicional | **Prohibidos.** Semáforos y flechas 3D fuera del sistema, sin control de color ni de tamaño |
| Iconos SVG insertados (Insertar → Iconos) | Aceptables pero pesados y difíciles de alinear a la celda |
| **PNG exportados del mismo origen Lucide** | **La opción del sistema** |

**Regla:** todo icono que aparezca en Excel se exporta del **mismo SVG** de Lucide que usa la
web, a PNG @1x/@2x/@3x en `text-secondary` (`#55606F`) y en los cuatro colores semánticos.
Los dos productos comparten origen, no solo estilo.

Excepción operativa: los cursores de polaridad **▲ ▼ —** son caracteres Unicode, no imágenes.
Se copian, se ordenan, se imprimen y no se despegan de la celda al filtrar. Para el elemento
más frecuente del producto, esto pesa más que la coherencia de trazo.

Alineación en Excel: los PNG se anclan a la celda con *Mover y cambiar tamaño con celdas*
desactivado —para que no se deformen al ajustar filas— y centrados ópticamente a 16 px en
una fila de 27 pt.

---

**Anterior:** [08 · Grid](08-grid.md) · **Siguiente:** [10 · Elevación y sombras](10-elevacion.md)
