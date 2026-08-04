# 15 · Tablas

> El componente central de Finance OS. Si la tabla está bien, el producto está bien.

---

## 1. Principio

Una tabla financiera no se lee: **se escanea**. El usuario busca una fila, compara una
columna o localiza una anomalía. Todo el diseño se subordina a esas tres operaciones.

De ahí salen las tres decisiones que definen el componente:

1. **Sin cuadrícula.** Los bordes verticales fragmentan el barrido horizontal. Las columnas
   se separan por alineación y espacio.
2. **Alineación por tipo de dato**, sin excepciones. Texto a la izquierda, números a la
   derecha, fechas a la izquierda, estados centrados.
3. **Cifras tabulares.** Sin ellas, la columna de importes no se puede comparar por forma.

## 2. Anatomía

```
CONCEPTO                    JUL 25      JUN 25      VAR.       VAR. %
────────────────────────────────────────────────────────────────────   border-default
Ingresos por servicios   284.392,00  271.048,00  13.344,00    ▲ +4,9 %
Ingresos por licencias    92.184,00   94.220,00  −2.036,00    ▼ −2,2 %
Otros ingresos             4.028,00    3.911,00     117,00    ▲ +3,0 %
────────────────────────────────────────────────────────────────────   border-strong
Total ingresos           380.604,00  369.179,00  11.425,00    ▲ +3,1 %
════════════════════════════════════════════════════════════════════   doble (gran total)
```

| Zona | Especificación |
| --- | --- |
| **Encabezado** | `overline` 11 px, 600, `text-secondary`, alineado como su columna. Fijo al desplazarse |
| **Filete de cabecera** | `border-default` 1 px. El único borde horizontal del cuerpo |
| **Fila** | Alto según densidad (28/36/44). Sin borde inferior |
| **Alternancia** | `graphite-25 #FBFCFD`. **Solo a partir de 6 columnas** |
| **Celda** | Padding horizontal 12 px, vertical centrado |
| **Total** | Filete superior `border-strong`, texto peso 600 |
| **Gran total** | Filete superior + **doble** inferior, peso 600 |

### Sobre el rayado

El rayado de filas (*zebra*) es ruido cuando no hace falta y salvación cuando sí. La regla:
**se activa a partir de 6 columnas**, que es donde el ojo empieza a perder la fila al recorrer
la línea. Por debajo, el ritmo vertical basta y el rayado solo ensucia.

El paso es `#FBFCFD` — casi imperceptible. Un rayado que se nota es un rayado que compite con
los datos.

## 3. Encabezados

- **Sin iconos.** El encabezado ya está en la posición que lo explica.
- **Alineados como su contenido.** Un encabezado a la izquierda sobre importes a la derecha
  rompe la lectura vertical de la columna.
- **Unidad en el encabezado, no en cada celda:** `IMPORTE (€)`, y luego `1.284,00` sin
  símbolo. Repetir el símbolo 4.000 veces gasta ancho y no informa nada nuevo.
- **Fijos al desplazarse.** Innegociable. Una tabla financiera sin encabezado fijo produce
  lecturas en la columna equivocada.
- **Ordenables:** flecha de dirección a la derecha del texto, visible solo en la columna
  activa. Al pasar el ratón, flecha tenue como afordancia.

## 4. Columnas

| Tipo | Alineación | Ancho | Notas |
| --- | --- | --- | --- |
| Concepto / descripción | Izquierda | Flexible, mínimo 200 px | Truncado con `…` + tooltip |
| Código de cuenta | Izquierda | Fijo, monoespaciada | |
| Importe | **Derecha** | Fijo por el valor máximo | Tabulares |
| Porcentaje | **Derecha** | 80 px | Un decimal |
| Variación | **Derecha** | 120 px | Cursor + signo + color |
| Fecha | Izquierda | 100 px | `DD/MM/AAAA` |
| Estado | Izquierda | Por contenido | [Badge](17-badges.md) |
| Acciones | Derecha | 48 px | Visibles al hacer hover **y al enfocar** |

**Primera columna fija** al desplazar en horizontal, con `border-default` a su derecha —el
único borde vertical del sistema, y solo cuando hay desplazamiento lateral real. Sin él, al
desplazarse se pierde la identidad de la fila.

## 5. Estados de fila

| Estado | Aspecto |
| --- | --- |
| default | Sin fondo |
| hover | `surface-hover` en toda la fila |
| selected | `surface-accent` + barra `accent` de 2 px a la izquierda |
| focus | Anillo 2 px en la celda, no en la fila |
| editada | Punto `accent` de 6 px en el margen izquierdo hasta guardar |
| error | `surface-negative` + icono `alert-circle` en la primera celda |
| deshabilitada | `text-disabled`, sin hover |
| expandida | Fila hija con sangría de 24 px, fondo `surface-sunken` |

La barra izquierda en `selected` existe porque el fondo teñido solo es color; la barra
sobrevive a la escala de grises.

## 6. Interacción

- **Clic en fila** → descender al detalle. **Clic en celda** → editar, si es editable.
  Nunca las dos cosas en la misma tabla.
- **Selección múltiple** con checkbox en la primera columna, y encabezado con estado
  indeterminado.
- **Teclado como en Excel:** flechas mueven celda, `Enter` baja, `Tab` avanza, `F2` edita,
  `Esc` cancela, `Ctrl+flecha` va al extremo del bloque. Es la gramática que el usuario ya
  tiene en los dedos.
- **Ordenación:** un clic asc, dos desc, tres vuelve al orden natural. **La ordenación por
  defecto es explícita y visible**, nunca "el orden en que vinieron los datos".
- **Paginación, no scroll infinito.** El usuario necesita saber cuántos registros hay para
  cuadrar. `1–50 de 4.284`.
- **Totales siempre visibles**, fijos abajo si la tabla se desplaza. Un total al que hay que
  llegar desplazándose es un total que no se usa.

## 7. Densidad

| Densidad | Alto de fila | Padding | Cuándo |
| --- | ---: | ---: | --- |
| `compact` | 28 px | 8 px | Conciliar, revisar volumen |
| `default` | 36 px | 12 px | Por defecto |
| `relaxed` | 44 px | 16 px | Presentación, táctil |

Preferencia del usuario y **persistente entre sesiones**.

## 8. Accesibilidad

- `<table>` real con `<thead>`, `<tbody>`, `<th scope="col">`. Una tabla hecha de `<div>` no
  se puede navegar con lector de pantalla.
- `<caption>` con el contenido y el periodo, aunque esté oculto visualmente.
- `aria-sort` en la columna ordenada.
- Las acciones de fila aparecen **al enfocar con teclado**, no solo al hacer hover.
- Contraste del rayado sobre el texto verificado: `text-primary` sobre `#FBFCFD` supera
  17:1.

## 9. Excel

Aquí Excel gana: una tabla es lo que Excel hace de forma nativa. El trabajo es **quitarle** a
Excel sus valores por defecto.

```
1. Vista → Líneas de división: DESACTIVAR         ← el cambio de mayor impacto
2. Insertar → Tabla (Ctrl+T), estilo "FOS/Tabla" personalizado:
     Encabezado:   relleno FFFFFF · texto 55606F · Aptos 11 pt semibold
                   borde inferior fino D8DDE5
     Fila impar:   sin relleno
     Fila par:     relleno FBFCFD   (solo si ≥ 6 columnas)
     Sin bordes verticales en ningún elemento
     Fila total:   borde superior fino 7C8695 · texto semibold
3. Vista → Inmovilizar paneles → en la primera fila de datos
4. Formato numérico por columna (nunca por celda)
5. Alto de fila 27 pt (default)
6. Formato condicional para la polaridad — NO el rojo del formato numérico:
     Valor < 0  →  fuente C22B24
     Valor > 0  →  fuente 127543
     Valor = 0  →  fuente 636C7A
```

Qué desactivar sin excepción:

| Predeterminado de Excel | Por qué fuera |
| --- | --- |
| Líneas de división | Es la cuadrícula completa que el sistema prohíbe |
| Estilos de tabla azules | No son los tokens |
| Rojo del formato `[Red]` | Es el rojo de Excel, no `#C22B24` |
| Conjuntos de iconos (semáforos) | Fuera del sistema de iconos |
| Barras de datos con degradado | Si se usan barras, relleno sólido `accent` |
| Autoajustar ancho de columna | Rompe el esqueleto de columnas |

**Se usan tablas de Excel reales (Ctrl+T), no rangos.** Una tabla real da encabezados
persistentes, referencias estructuradas y expansión automática de fórmulas. Un rango con
formato bonito se rompe en cuanto alguien inserta una fila.

---

**Anterior:** [14 · Selectores](14-selectores.md) · **Siguiente:** [16 · Cards](16-cards.md)
