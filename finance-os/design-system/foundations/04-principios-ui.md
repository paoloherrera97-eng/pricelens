# 04 · Principios UI

> Los principios UX dicen cómo se comporta. Estos dicen cómo se dibuja. Son reglas
> comprobables mirando un píxel.

---

## 1. Una jerarquía por pantalla

En cada pantalla hay **exactamente un** elemento de primer nivel. Si hay dos, no hay
ninguno.

Cuatro niveles, y no más:

| Nivel | Qué es                          | Herramienta                                   |
| :---: | ------------------------------- | --------------------------------------------- |
| **1** | La cifra o el objeto de la vista| Tamaño (`metric-lg`) + peso 600               |
| **2** | Los que la explican             | `h3`/`h4` + espacio superior generoso         |
| **3** | Los datos de apoyo              | `body` + texto secundario                     |
| **4** | Metadatos, procedencia          | `caption` + texto terciario                   |

La jerarquía se construye con **tamaño y espacio**. El color no crea jerarquía: la
confirma.

## 2. Todo medida es un token

No existen valores libres. Ni un `13px`, ni un `#4A5568`, ni un `margin: 18px`. Si un valor
no está en [`tokens/finance-os.tokens.json`](../../tokens/finance-os.tokens.json), primero se
añade allí con su justificación y después se usa.

Un sistema con escapes deja de ser un sistema en unos seis meses.

## 3. La rejilla no se rompe

Toda posición y todo tamaño es múltiplo de **8 px** (= 6 pt en Excel). Única excepción
permitida: **4 px** para relaciones internas de un componente (separación icono-texto,
padding vertical de un badge).

El filete de 1 px y el desplazamiento óptico de la tipografía son los únicos valores que
viven fuera de la rejilla, y por razones ópticas documentadas.

## 4. Alineación: texto a la izquierda, números a la derecha

**Sin excepciones.** Un número alineado a la izquierda es un número que no se puede comparar
con el de arriba. La alineación derecha con cifras tabulares hace que los órdenes de
magnitud se vean sin leerlos: una columna de importes debe poder escanearse por la forma del
bloque, no dígito a dígito.

Corolario: los encabezados de columna se alinean **como su contenido**, no todos a la
izquierda. Un encabezado a la izquierda sobre una columna de importes a la derecha rompe la
lectura vertical.

## 5. El borde es la última opción

Orden de escalada, de nuevo:

```
espacio  →  superficie  →  filete  →  sombra
```

En una tabla eso significa: **sin bordes verticales**, filete horizontal solo bajo el
encabezado y en los totales, y separación de filas por ritmo vertical. Una tabla con
cuadrícula completa es una tabla que no confía en su propio espaciado.

## 6. El foco es visible siempre, y aparece al instante

Anillo de 2 px en `border-focus` con 2 px de separación, **sin transición**. Un anillo de
foco que se desvanece durante 150 ms es un anillo de foco que llega tarde para quien navega
rápido con teclado — que es exactamente quien lo necesita.

Nunca `outline: none` sin sustituto. El foco no es opcional en ningún componente
interactivo.

## 7. Los estados son sistemáticos, no artesanales

Todo componente interactivo tiene los mismos siete estados, y se resuelven igual en todos:

| Estado         | Resolución                                                    |
| -------------- | ------------------------------------------------------------- |
| `default`      | El estado documentado                                          |
| `hover`        | Un escalón de superficie más oscuro (claro) / más claro (oscuro)|
| `active`       | Dos escalones                                                  |
| `focus`        | Anillo 2 px, se suma a cualquier otro estado                   |
| `disabled`     | Texto `text-disabled`, sin sombra, cursor `not-allowed`, opacidad **sin cambiar** |
| `loading`      | Contenido sustituido por indicador; **el tamaño no cambia**    |
| `error`        | Borde `border-negative` + mensaje asociado; nunca solo el borde|

Dos reglas transversales: **un componente nunca cambia de tamaño al cambiar de estado**
(provoca saltos de layout), y `disabled` **no se resuelve con opacidad global** porque
arrastra el contraste del texto por debajo de lo legible.

## 8. El movimiento explica, no entretiene

Solo se anima lo que ayuda a entender una relación causa-efecto: de dónde sale un panel,
hacia dónde se cierra un menú. Duraciones entre 120 y 240 ms. Lo que **nunca** se anima:
cifras, anillos de foco, contenido de tabla, y nada en absoluto si el usuario pidió
`prefers-reduced-motion`. Ver [A1 · Movimiento](../appendix/A1-movimiento.md).

## 9. Optimizar el estado en reposo

Una pantalla se ve en reposo el 99 % del tiempo y en hover el 1 %. Se diseña primero el
reposo: si hace falta pasar el ratón por encima para entender la pantalla, la pantalla
está mal.

Consecuencia dura: **ninguna información aparece solo en hover.** Los tooltips añaden
contexto, nunca contenido.

## 10. Densidad sin apelmazamiento

La densidad se consigue reduciendo el espacio **entre** grupos, nunca **dentro** de un
grupo. La distancia entre una etiqueta y su valor no baja de 4 px; la distancia entre dos
bloques distintos no baja de 24 px. Cuando ambas se parecen, el ojo deja de ver grupos y
empieza a ver una lista uniforme — que es exactamente lo que hace ilegible una hoja de
cálculo.

---

## Lista de verificación visual

Antes de dar por buena cualquier pantalla:

- [ ] Hay exactamente un elemento de nivel 1
- [ ] Todo valor sale de un token
- [ ] Todo múltiplo de 8 px (o 4 px justificado dentro de un componente)
- [ ] Los números están a la derecha, con cifras tabulares
- [ ] No hay borde que pudiera ser espacio
- [ ] Todos los elementos interactivos tienen foco visible
- [ ] Ninguna información existe solo en hover
- [ ] Ningún significado depende solo del color
- [ ] Nada cambia de tamaño al cambiar de estado
- [ ] Se puede construir en Excel

---

**Anterior:** [03 · Principios UX](03-principios-ux.md) ·
**Siguiente:** [05 · Color](05-color.md)
