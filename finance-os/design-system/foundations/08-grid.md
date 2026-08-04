# 08 · Grid

> La rejilla es lo que hace que dos pantallas diseñadas por dos personas distintas parezcan
> el mismo producto.

---

## 1. Web: 12 columnas

12 porque se divide en 2, 3, 4 y 6 — todas las particiones que un dashboard financiero
necesita (mitades para comparativas, tercios para KPIs, cuartos para métricas secundarias).

| Breakpoint   | Columnas | Canal | Margen | Ancho máximo |
| ------------ | -------: | ----: | -----: | -----------: |
| `2xl` ≥ 1536 |       12 | 24 px |  48 px |      1440 px |
| `xl` ≥ 1280  |       12 | 24 px |  48 px |      1440 px |
| `lg` ≥ 1024  |       12 | 24 px |  32 px |       fluido |
| `md` ≥ 768   |        8 | 16 px |  24 px |       fluido |
| `sm` ≥ 640   |        4 | 16 px |  16 px |       fluido |
| `< 640`      |        4 | 16 px |  16 px |       fluido |

**El canal es siempre un token de espaciado** (`space-5` = 24 px, `space-4` = 16 px). No hay
canales de 20 px ni de 30 px.

### Repartos canónicos

Cuatro, y cubren el 95 % de los casos. Inventar un quinto exige justificarlo:

| Reparto               | Columnas  | Uso                                            |
| --------------------- | --------- | ---------------------------------------------- |
| **Completo**          | 12        | Tabla, gráfico ancho                           |
| **Mitades**           | 6 + 6     | Comparativa entre dos periodos o dos entidades |
| **Tercios**           | 4 + 4 + 4 | Fila de tres KPIs                              |
| **Principal + apoyo** | 8 + 4     | Contenido con panel de contexto a la derecha   |

La fila de **cuatro KPIs** usa 3+3+3+3. Cinco o más KPIs en fila no existen en el sistema: a
partir de cuatro, ninguno es principal, y [un KPI que no es principal no es un
KPI](../components/19-kpis.md).

## 2. La retícula dentro de la retícula

Una tabla financiera es una rejilla propia dentro de la rejilla de página. Sus columnas
**no** se alinean con las 12 de la página, y forzarlo es un error: el ancho de una columna de
importes lo decide el número más largo que puede contener, no una fracción del ancho de
pantalla.

Regla: la rejilla de página coloca el **contenedor** de la tabla. Dentro, manda el contenido.

## 3. Excel: el esqueleto de columnas

Excel no tiene rejilla de 12 columnas. Tiene columnas de ancho arbitrario, y ahí está el
problema: sin un esqueleto acordado, cada hoja acaba con anchos distintos y el libro deja de
parecer un producto.

**El esqueleto es fijo para todo el libro:**

| Columna | Ancho (car.) | Ancho ≈ px | Papel                               |
| ------- | -----------: | ---------: | ----------------------------------- |
| `A`     |          2,5 |         24 | Margen izquierdo. **Siempre vacía** |
| `B`     |           32 |        229 | Etiqueta / concepto / descripción   |
| `C`     |            2 |         19 | Canal                               |
| `D`–`I` |           14 |        103 | Columnas de datos (6 disponibles)   |
| `J`     |            2 |         19 | Canal                               |
| `K`     |           14 |        103 | Total / variación                   |
| `L`     |          2,5 |         24 | Margen derecho. **Siempre vacía**   |

Total ≈ 1.140 px: cabe en una pantalla de 1366 px, que sigue siendo el portátil corporativo
más común, y en A4 apaisado al 100 % de escala.

### Sobre el ancho de columna en Excel

La unidad de ancho de Excel es el **ancho del carácter `0`** en la fuente del libro, más
5 px de relleno:

```
ancho_px ≈ round(ancho_del_0_px × n) + 5
```

Con Aptos 11 pt, el `0` mide ≈ 7 px, de donde salen los valores de arriba. **Esta conversión
depende de la fuente y del dpi**: al fijar el tema del libro hay que verificar los anchos en
píxeles reales, no darlos por buenos. Es la razón operativa de la
[regla de la fuente](06-tipografia.md#por-qué-excel-no-lleva-inter): cambiar la fuente del
libro reescribe el esqueleto entero.

### Reglas del esqueleto

1. **Las columnas de margen y de canal nunca llevan datos.** Son estructura. Se protegen.
2. **Los anchos no se ajustan a mano.** Nada de "autoajustar ancho de columna": destruye el
   esqueleto en un clic.
3. **Ningún dato a la derecha de `L`.** Si no cabe, es una hoja nueva o una tabla dinámica.
4. **Nunca se combinan celdas.** Ver [07 · Espaciado](07-espaciado.md#7-excel--concreto).
5. **Inmovilizar paneles en la primera fila de datos**, siempre. Un encabezado que se pierde
   al desplazarse es una fila que se leerá en la columna equivocada.

## 4. Correspondencia web ↔ Excel

El esqueleto de Excel es la traducción del reparto de 12 columnas, no un diseño paralelo:

| Reparto web             | Equivalente en Excel          |
| ----------------------- | ----------------------------- |
| Completo (12)           | `B`–`K`                       |
| Mitades (6+6)           | `B`–`F` \| `G`–`K`            |
| Tercios (4+4+4)         | `B`–`D` \| `E`–`G` \| `H`–`K` |
| Principal + apoyo (8+4) | `B`–`I` \| `K`                |

Un dashboard diseñado sobre la rejilla web se transcribe a Excel sin rediseñarse. Ese es el
único objetivo de esta sección.

## 5. Rejilla de línea base

Las 12 columnas resuelven la horizontal; el **ritmo vertical de 4 px** resuelve la vertical
(ver [07 · Espaciado](07-espaciado.md#4-ritmo-vertical)). Las dos juntas son la rejilla real
del sistema — hablar solo de columnas deja la mitad del trabajo sin hacer, y es la mitad que
más se nota cuando dos cards contiguas terminan a alturas distintas por 3 px.

---

**Anterior:** [07 · Espaciado](07-espaciado.md) · **Siguiente:** [09 · Iconografía](09-iconografia.md)
