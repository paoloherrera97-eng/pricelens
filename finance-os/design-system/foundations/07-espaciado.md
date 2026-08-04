# 07 · Espaciado

> El espacio es la herramienta principal del sistema. Es también la única que no cuesta
> nada implementar y la primera que se sacrifica bajo presión.

---

## 1. La unidad base: 8 px, y por qué exactamente 8

| Razón | Detalle |
| --- | --- |
| **Divisibilidad** | 8 = 2·2·2. Se parte en 4 y en 2 sin decimales en ningún factor de escala |
| **Densidad de pantalla** | Encaja en @1x, @1.5x, @2x y @3x sin subpíxeles |
| **Y la decisiva: Excel** | **8 px = 6 pt exactos** a 96 dpi |

La tercera es la que zanja el debate. Excel mide en puntos, no en píxeles. Con una base de
8 px, **toda la escala de espaciado convierte a números enteros de punto**:

| Token | px | pt |
| --- | ---: | ---: |
| `space-1` | 4 | 3 |
| `space-2` | 8 | 6 |
| `space-3` | 12 | 9 |
| `space-4` | 16 | 12 |
| `space-5` | 24 | 18 |
| `space-6` | 32 | 24 |
| `space-7` | 40 | 30 |
| `space-8` | 48 | 36 |
| `space-9` | 64 | 48 |
| `space-10` | 80 | 60 |
| `space-11` | 96 | 72 |

Ni un solo decimal. La rejilla web y la rejilla de Excel **son la misma rejilla expresada en
dos unidades**, no dos rejillas que se parecen. Con una base de 10 px, `space-3` habría sido
7,5 pt, y a la tercera fila el diseño ya no cuadra.

`space-1` (4 px / 3 pt) es el único medio paso, y solo se usa **dentro** de un componente:
separación icono-texto, padding vertical de un badge. Nunca entre componentes.

## 2. La escala de relación

El espacio codifica pertenencia. Estos son los valores, y su uso es prescriptivo:

| Distancia | Significa | Ejemplo |
| ---: | --- | --- |
| **4 px** | Son la misma cosa | Icono y su etiqueta |
| **8 px** | Están íntimamente relacionados | Etiqueta y su campo |
| **12 px** | Pertenecen al mismo grupo | Dos campos de un formulario |
| **16 px** | Mismo bloque | Padding interior de una card compacta |
| **24 px** | Bloques distintos, misma sección | Dos cards en una fila |
| **32 px** | Secciones distintas | KPIs y la tabla de debajo |
| **48 px** | Regiones distintas | Encabezado y contenido |
| **64 px+** | Silencio deliberado | Margen superior de una pantalla de resumen |

**La regla de la proximidad manda sobre la estética.** Si dos elementos relacionados están a
24 px y dos no relacionados a 16 px, la pantalla se lee al revés de como está pensada, por
mucho que quede equilibrada.

## 3. La regla del salto

Entre dos niveles de agrupación consecutivos, la distancia se **multiplica al menos por
1,5**. `8 → 12 → 24 → 32 → 48` cumple; `12 → 16 → 20` no: el ojo no percibe esos saltos como
niveles distintos y lee una lista plana.

Este es el mecanismo real de la [regla 10 de UI](04-principios-ui.md#10-densidad-sin-apelmazamiento):
la densidad se gana comprimiendo el espacio **entre** grupos manteniendo el salto, nunca
comprimiendo el espacio **dentro**.

## 4. Ritmo vertical

La línea base del sistema es de **4 px**. Toda altura de línea es múltiplo de 4 (16, 20, 24,
28, 32, 36, 44), de forma que los bloques de texto de distinto tamaño **acaban cuadrando** en
la misma rejilla al ponerlos en columnas contiguas — que es exactamente lo que pasa en un
dashboard.

Alturas de fila y de control, sincronizadas por densidad:

| Densidad | Fila de tabla | Control | Cuándo |
| --- | ---: | ---: | --- |
| `compact` | 28 px / 21 pt | 28 px | Conciliar, revisar volumen |
| `default` | 36 px / 27 pt | 36 px | Trabajo normal |
| `relaxed` | 44 px / 33 pt | 44 px | Presentación, táctil |

Que la fila y el control midan lo mismo no es casualidad: permite poner un `select` dentro de
una celda sin que la fila cambie de alto, que es de donde salen la mitad de los saltos de
layout en las tablas editables.

## 5. Márgenes de página

| Contexto | Margen lateral | Máximo de contenido |
| --- | ---: | ---: |
| Web ≥ 1280 px | 48 px | 1440 px |
| Web 1024–1279 px | 32 px | fluido |
| Web 768–1023 px | 24 px | fluido |
| Web < 768 px | 16 px | fluido |
| Excel | Columna A fija, 24 px / 18 pt | Hasta la última columna del esqueleto |

El máximo de 1440 px no es un capricho: una tabla financiera más ancha obliga a mover la
cabeza para seguir una fila, y a partir de ahí empiezan los errores de línea cruzada. Por
encima de 1440 px se añade una segunda columna de contenido, no más ancho.

## 6. Espacio en blanco como decisión

El espacio vacío alrededor del dato principal **es lo que lo hace principal**. La tentación
constante en un producto financiero es rellenarlo "porque cabe otra métrica".

Regla dura: **el KPI principal de una pantalla tiene al menos 32 px libres por los cuatro
lados.** No es aire sobrante: es la única razón por la que se lee primero.

## 7. Excel — concreto

Excel no tiene padding. El espaciado se construye con tres recursos, en este orden:

1. **Alto de fila y ancho de columna** — el equivalente directo del padding.
2. **Filas y columnas espaciadoras** — filas de 6 pt (`space-2`) o 18 pt (`space-5`) entre
   bloques, con relleno de fondo. Se nombran en el esqueleto para que nadie las borre.
3. **Sangría de celda** (`Alignment.IndentLevel`) — para el equivalente al padding izquierdo
   dentro de una celda de texto. Un nivel de sangría ≈ 3 caracteres.

```
Fila espaciadora entre bloques:      6 pt   (space-2)
Fila espaciadora entre secciones:   18 pt   (space-5)
Fila espaciadora entre regiones:    36 pt   (space-8)
Columna A (margen izquierdo):       18 pt de ancho  (space-5)
```

**Lo que no se hace nunca:** combinar celdas para simular espaciado. Las celdas combinadas
rompen el ordenamiento, el filtrado, la selección de columna y el copiado — es decir, todo
lo que hace útil a Excel. Si hace falta espacio, se cambia el alto de la fila.

---

**Anterior:** [06 · Tipografía](06-tipografia.md) · **Siguiente:** [08 · Grid](08-grid.md)
