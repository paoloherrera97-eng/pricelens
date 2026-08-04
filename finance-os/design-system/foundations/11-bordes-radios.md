# 11 · Bordes y radios

---

## 1. Los tres bordes

Repetido desde [05 · Color](05-color.md#los-tres-bordes-y-por-qué-son-tres) porque es donde
más sistemas de diseño se equivocan:

| Token | Hex | Contraste sobre `surface` | Papel |
| --- | --- | ---: | --- |
| `border-subtle` | `#E4E8EE` | 1,23:1 | Divisor entre filas, dentro de una card |
| `border-default` | `#D8DDE5` | 1,36:1 | Divisor entre secciones, contorno de card |
| `border-strong` | `#7C8695` | **3,68:1** | **Límite de control** — input, select, checkbox |

Los dos primeros **son decorativos** y no pueden identificar un control: no llegan al 3:1
que exige la SC 1.4.11. Solo `border-strong` puede decir "esto es un campo en el que se
escribe".

Usar `border-default` en un input es un fallo de accesibilidad. Se ve elegante; deja fuera a
usuarios con baja visión.

## 2. Grosores

| Grosor | Uso |
| --- | --- |
| **1 px** (0,75 pt) | Todo. El grosor por defecto del sistema |
| **2 px** | Solo el anillo de foco y el indicador de pestaña activa |
| 1,5 px, 3 px, 4 px | **No existen** |

Un borde de 1 px en pantallas @2x se renderiza a medio píxel físico y se ve más fino de lo
esperado: es exactamente el efecto buscado. No se compensa subiéndolo a 2 px.

## 3. Cuándo hay borde

Un borde solo aparece si contesta que sí a alguna de estas:

- [ ] ¿Identifica un control con el que se puede interactuar? → `border-strong`
- [ ] ¿Separa dos contenidos que el espacio no puede separar? → `border-subtle`
- [ ] ¿Delimita una superficie recortable o desplazable? → `border-default`
- [ ] ¿Marca el foco del teclado? → `border-focus`, 2 px

Si son todas que no, **es espacio, no borde**.

### El caso de la tabla

Una tabla financiera lleva **exactamente dos** bordes:

```
Encabezado ────────────────────  border-default, 1 px, debajo del encabezado
Fila 1
Fila 2                           sin bordes verticales, sin bordes de fila
Fila 3
Total     ════════════════════   border-strong, 1 px arriba (y doble abajo en el gran total)
```

Sin cuadrícula, sin bordes verticales. Las columnas se separan por alineación y espacio, que
es como las separa cualquier estado financiero bien compuesto. La cuadrícula completa es la
convención de Excel por defecto, y es justo lo que hay que desactivar para que el libro deje
de parecer una hoja de cálculo y empiece a parecer un producto.

## 4. Radios

| Token | px | Uso |
| --- | ---: | --- |
| `radius-none` | 0 | **Toda la retícula tabular**, celdas, filas |
| `radius-sm` | 4 | Badges, chips, casillas |
| `radius-md` | 6 | Inputs, selects, botones |
| `radius-lg` | 8 | Cards, popovers, menús |
| `radius-xl` | 12 | Modales, paneles laterales |
| `radius-2xl` | 16 | Contenedores de página completa (raro) |
| `radius-full` | 9999 | Avatares e indicadores circulares. **Nada más** |

### Las dos reglas del radio

**1. El radio crece con la superficie.** Un radio de 12 px en un badge de 20 px de alto lo
convierte en una pastilla; un radio de 4 px en un modal de 600 px se ve como un error de
renderizado. La proporción aproximada es radio ≈ 1/8 del lado menor, redondeada al token.

**2. Los radios anidados se restan.** Un elemento dentro de un contenedor con radio usa:

```
radio_interior = radio_exterior − separación
```

Card `radius-lg` (8) con padding de 16 → un elemento pegado al borde interior usaría 8 − 16 =
negativo, es decir **0**. Por eso una tabla dentro de una card es de esquina viva: no es una
excepción, es la regla aplicada.

### Por qué nada de pastillas

Los botones no son pastillas (`radius-full`). Un botón con radio completo se lee como una
etiqueta o un estado, no como una acción, y en una barra de herramientas con varios botones
pegados el radio completo desperdicia espacio horizontal. `radius-md` (6 px) es
suficientemente suave para no parecer un cuadro y suficientemente contenido para parecer
serio.

## 5. Excel

**Las celdas de Excel no admiten radio.** Punto. Toda la retícula es de esquina viva, y por
eso el sistema fija `radius-none` para la retícula tabular en **ambas** plataformas: no para
imitar a Excel, sino porque un radio en una fila de tabla es una mala idea de todos modos.

El radio existe en Excel solo en **formas**:

```
Botón dibujado como forma:  rectángulo redondeado, radio 6 px
Modal simulado con forma:   rectángulo redondeado, radio 12 px
Card construida con celdas: esquina viva, obligatoriamente
```

Una card en Excel es un rango de celdas con relleno y borde: sale con esquina viva y **así se
queda**. La alternativa —dibujar cada card como una forma— rompe el filtrado, el copiado y la
impresión. La esquina viva es el precio, y es barato.

### Bordes en Excel — concreto

```
border-subtle    →  Fino,  color E4E8EE
border-default   →  Fino,  color D8DDE5
border-strong    →  Fino,  color 7C8695
Total            →  Fino superior 7C8695
Gran total       →  Fino superior + Doble inferior, 7C8695
Cuadrícula       →  Vista → Líneas de división: DESACTIVADO en toda hoja de presentación
```

Desactivar las líneas de división es el cambio de un solo clic con más impacto visual en todo
el producto de Excel.

---

**Anterior:** [10 · Elevación y sombras](10-elevacion.md) ·
**Siguiente:** [12 · Botones](../components/12-botones.md)
