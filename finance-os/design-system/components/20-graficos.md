# 20 · Gráficos

> Un gráfico responde a una pregunta. Si no se sabe cuál, el gráfico sobra y una cifra
> bastaba.

---

## 1. El orden correcto de decisiones

El color va **el último**. Casi todos los gráficos malos eligen color primero.

```
1. ¿Cuál es la pregunta?          → decide si hace falta gráfico
2. ¿Qué trabajo hace el dato?     → decide la forma
3. ¿Qué trabajo hace el color?    → decide la paleta
4. Marcas, ejes, etiquetas
5. Interacción
6. Comprobación de accesibilidad
```

## 2. Elegir la forma

| La pregunta es…                        | Forma                             | No usar                      |
| -------------------------------------- | --------------------------------- | ---------------------------- |
| ¿Cuánto vale ahora?                    | **Una cifra** ([KPI](19-kpis.md)) | Gráfico de un dato           |
| ¿Cómo evoluciona?                      | Línea                             | Barras a lo largo del tiempo |
| ¿Cómo se comparan categorías?          | Barras horizontales               | Circular                     |
| ¿Cómo se compone un total?             | Barras apiladas o cascada         | Circular, donut              |
| ¿Real contra plan?                     | Barras agrupadas o **cascada**    | Dos ejes                     |
| ¿De dónde viene la diferencia?         | **Cascada**                       | Cualquier otra               |
| ¿Qué relación hay entre dos variables? | Dispersión                        | Línea                        |
| ¿Dónde se concentra?                   | Mapa de calor                     | Burbujas                     |
| ¿Cómo se distribuye?                   | Histograma o caja                 | Barras ordenadas             |

### Prohibiciones de forma

| Prohibido                                    | Por qué                                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Doble eje Y**                              | El error nº 1 en gráficos. Dos escalas distintas hacen que la correlación la decida la elección de escala, no los datos. Si hay dos magnitudes: dos gráficos, o indexadas a base 100 |
| **Circular y donut**                         | El ojo humano compara ángulos mal. Con más de 3 porciones es ilegible; con 3, una tabla informa mejor                                                                                |
| **3D, cualquier cosa**                       | La perspectiva falsea las magnitudes. Literalmente miente                                                                                                                            |
| **Eje Y que no arranca en cero** (en barras) | La longitud de la barra **es** el valor. Truncarla multiplica visualmente la diferencia. En líneas sí puede recortarse, indicándolo                                                  |
| **Área apilada con más de 4 series**         | Solo la serie inferior tiene una línea base legible                                                                                                                                  |
| **Degradados de relleno**                    | No codifican nada y complican leer el valor                                                                                                                                          |

## 3. El trabajo del color

| Trabajo        | Codifica                      | Estructura                                                      |
| -------------- | ----------------------------- | --------------------------------------------------------------- |
| **Categórica** | Identidad (qué serie)         | 8 tonos, orden fijo, asignados en secuencia, **nunca en ciclo** |
| **Secuencial** | Magnitud                      | Un solo tono, claro → oscuro                                    |
| **Divergente** | Polaridad respecto a una base | Dos tonos + punto medio gris                                    |
| **Estado**     | Situación                     | Escala reservada, siempre con icono y texto                     |

### 3.1 Paleta categórica — validada, no elegida

Orden fijo. **El orden es el mecanismo de seguridad frente al daltonismo**, no una
preferencia estética: se validó que cada par adyacente se distingue bajo simulación de
protanopia y deuteranopia.

| Ranura | Tono          | Claro     | Oscuro    |
| -----: | ------------- | --------- | --------- |
|      1 | Índigo        | `#3B5BDB` | `#5C7CE8` |
|      2 | Naranja       | `#E07A1F` | `#CE7526` |
|      3 | Verde azulado | `#0E9F8A` | `#14A18C` |
|      4 | Oro           | `#A8801A` | `#AE8A22` |
|      5 | Rosa          | `#D2699E` | `#CB6693` |
|      6 | Verde         | `#2E8B4E` | `#327F49` |
|      7 | Violeta       | `#6D4AA8` | `#8A66C8` |
|      8 | Bermellón     | `#D64B4B` | `#E25C5C` |

**Resultados de la validación** (Machado-Oliveira-Fernandes 2009, severidad 1.0; ΔE euclídea
en OKLab ×100; objetivo ≥ 8 en CVD y ≥ 15 en visión normal):

| Comprobación                           | Claro                                     | Oscuro                                    |
| -------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| Banda de luminosidad                   | OK (L 0,43–0,77)                          | OK (L 0,48–0,67)                          |
| Suelo de croma                         | OK (C ≥ 0,10)                             | OK                                        |
| **Separación CVD, peor par adyacente** | **ΔE 11,7** (`#2E8B4E`↔`#D2699E`, deutan) | **ΔE 11,0** (`#327F49`↔`#CB6693`, protan) |
| **Visión normal, peor par adyacente**  | **ΔE 17,1** (`#A8801A`↔`#0E9F8A`)         | **ΔE 16,8** (`#AE8A22`↔`#14A18C`)         |
| Contraste sobre superficie             | Los 8 ≥ 3:1                               | Los 8 ≥ 3:1                               |

Reproducible:

```bash
node scripts/validate_palette.js "#3B5BDB,#E07A1F,#0E9F8A,#A8801A,#D2699E,#2E8B4E,#6D4AA8,#D64B4B" \
  --mode light --surface "#FFFFFF"
```

**Reglas de uso:**

- Las ranuras se asignan **en orden**, siempre. La serie 3 es verde azulado tanto si hay 3
  series como si hay 8.
- **El color sigue a la entidad, nunca a su posición.** Filtrar "Región Norte" no puede
  repintar las demás: la misma entidad conserva su color en todas las vistas del producto.
- **Formas de todos-contra-todos** (dispersión, burbujas, mapas, múltiplos pequeños), donde
  cualquier par puede quedar contiguo: **máximo 3 series**. Las tres primeras ranuras validan
  el criterio de todos los pares (ΔE CVD 12,1 claro / 12,7 oscuro). A partir de ahí, se
  agrupa en "Otros" o se facetea. **No se cambia la paleta.**
- Una novena serie **no existe**. Se agrupa en "Otros" (`text-tertiary`) o se pasa a
  múltiplos pequeños.

### 3.2 Secuencial

Un solo tono índigo, claro → oscuro, siete pasos (`#DDE5FD` → `#263B8E`). Para magnitud
continua: mapas de calor de varianza, matrices de concentración. **Nunca arcoíris.**

### 3.3 Divergente

Bermellón ↔ jade con **punto medio gris** `#EDF0F4`, mismo número de pasos por brazo. Para
desviación sobre presupuesto, donde el cero es un umbral con significado.

El punto medio es gris y no un tono: un tono en el medio hace que el cero parezca un valor
más, cuando es precisamente "nada".

## 4. Marcas y anatomía

| Elemento           | Especificación                                                                                  |
| ------------------ | ----------------------------------------------------------------------------------------------- |
| Línea              | 2 px, sin sombra, sin degradado                                                                 |
| Barra              | Separación de 2 px del color de la superficie entre barras contiguas y entre segmentos apilados |
| Punto              | ≥ 8 px de diámetro; anillo de 2 px del color de la superficie al solaparse                      |
| Extremos de barra  | Radio 4 px en el extremo del dato; **esquina viva en la línea base**                            |
| Cuadrícula         | Solo horizontal, 1 px, `border-subtle`. **Nunca vertical**                                      |
| Eje                | Solo la línea base del eje de valores, `border-default`                                         |
| Marcas de eje      | Sin marcas (_ticks_): la etiqueta ya indica la posición                                         |
| Etiquetas de eje   | `caption` 12 px, `text-tertiary`                                                                |
| Área bajo la línea | Solo con una serie, `accent` al 8 %                                                             |

### Etiquetas de datos

Selectivas, nunca todas. Se etiquetan: el primer punto, el último, el máximo, el mínimo y lo
que el título menciona. Un número sobre cada punto convierte el gráfico en una tabla
desordenada — y si hacen falta todos los valores, entonces **era** una tabla.

### Leyenda

- **Una serie → sin leyenda.** El título la nombra.
- **Dos o más → leyenda siempre**, arriba a la izquierda, en horizontal.
- **Con 2–4 series, además etiqueta directa** al final de cada línea. La leyenda que obliga a
  saltar la vista entre el gráfico y una lista de colores es un impuesto de lectura.
- **El texto de la leyenda va en tinta** (`text-secondary`), nunca en el color de la serie:
  la marca de color al lado ya porta la identidad, y el texto coloreado pierde contraste.

## 5. Interacción

Un gráfico en pantalla es interactivo por defecto:

- **Línea y área:** cruceta vertical + tooltip con **todas** las series de ese punto,
  ordenadas por valor.
- **Barras y celdas:** tooltip por marca al pasar por encima.
- El área sensible es mayor que la marca (mínimo 24 px).
- El tooltip **añade contexto**, nunca contenido único: todo lo que dice existe también en la
  tabla asociada.
- Los filtros van en **una fila encima** del gráfico, nunca dentro.

## 6. Accesibilidad

- **Toda visualización tiene una tabla equivalente**, a un clic. No es una concesión: en un
  producto financiero, la tabla es la fuente y el gráfico es el resumen.
- Identidad nunca solo por color: leyenda + etiqueta directa, y textura a 45° cuando se
  imprime en blanco y negro.
- Los colores de estado (bueno/aviso/grave/crítico) están **reservados** y no se reutilizan
  como "serie 4".
- Título descriptivo que dice la conclusión: "Los ingresos crecen un 3,1 % en julio", no
  "Ingresos".
- `role="img"` con `aria-label` que resuma la conclusión, y la tabla como alternativa real.

## 7. Excel

Excel hace gráficos aceptables **después de desactivar casi todo lo que trae puesto**.

```
Tema:            Diseño de página → Colores → tema "Finance OS"
                 accent1..6 = ranuras 1..6 de la paleta categórica
Quitar siempre:  Título automático (se escribe en una celda, con estilo FOS/H3)
                 Líneas de división verticales
                 Líneas de división horizontales secundarias
                 Marcas de eje
                 Borde del área de trazado
                 Relleno del área de gráfico (transparente sobre la card)
                 Leyenda si hay una sola serie
                 Efectos, sombras, biselados, 3D — todo
Poner:           Línea de eje de valores: 1 pt, D8DDE5
                 Cuadrícula horizontal: 0,75 pt, E4E8EE
                 Fuente: Aptos 9 pt, color 636C7A
                 Series: color sólido, sin contorno, sin degradado
                 Línea: 2 pt (≈2 px), sin marcadores salvo en el último punto
                 Superposición de barras: −10 % · Ancho de intervalo: 60 %
Nunca:           Gráfico circular, 3D, eje secundario, escala logarítmica sin decirlo
```

**El gráfico se ancla a un rango de celdas** del esqueleto (ver
[08 · Grid](../foundations/08-grid.md#3-excel-el-esqueleto-de-columnas)), con _Mover y cambiar
tamaño con celdas_ activado para que siga a su bloque al cambiar densidad.

**Minigráficos** (sparklines) sí son nativos y sí encajan: línea, sin marcadores, `3B5BDB`,
sin eje. Es la forma correcta de meter tendencia en una tabla sin insertar un gráfico por
fila.

---

**Anterior:** [19 · KPIs](19-kpis.md) · **Siguiente:** [21 · Dashboard](../patterns/21-dashboard.md)
