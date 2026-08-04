# 06 · Tipografía

> En un producto financiero la tipografía no es estilo: es el instrumento de medida. Una
> columna de importes mal compuesta es una columna que se lee mal, y una columna que se lee
> mal produce decisiones equivocadas.

---

## 1. Dos pistas, una sola voz

| Plataforma | Familia UI                                           | Familia mono     |
| ---------- | ---------------------------------------------------- | ---------------- |
| **Excel**  | `Aptos`, con `Calibri` de reserva                    | `Consolas`       |
| **Web**    | `Inter`, con `-apple-system` / `Segoe UI` de reserva | `JetBrains Mono` |

### Por qué Excel no lleva Inter

**Un libro de Excel no puede depender de una fuente instalada.** Si la fuente falta en la
máquina que abre el archivo, Excel sustituye por métricas distintas y **recalcula el ancho de
todas las columnas**: el diseño no se degrada, se destruye, y en silencio.

Aptos es la fuente por defecto de Microsoft 365 desde 2024 y está presente allí donde está
Office. Calibri cubre las versiones anteriores. Ninguna de las dos hay que instalarla, y ese
es el criterio único.

### Por qué la pareja funciona

Aptos e Inter son ambas grotescas neutras de altura de x alta, contraste bajo y terminaciones
horizontales. No son idénticas —nada lo es entre plataformas— pero **producen la misma
impresión de página**: la misma densidad, el mismo color tipográfico, la misma sensación de
neutralidad. Es lo máximo alcanzable sin exigir una instalación, y es suficiente.

## 2. La escala

Escala modular de razón ≈ 1,25 en los títulos, y **paso fijo en el texto de trabajo**, donde
lo que importa es que 14 px y 12 px se distingan sin ambigüedad.

| Token         |  px | pt (Excel) | Interlínea | Peso | Uso                                         |
| ------------- | --: | ---------: | ---------: | ---: | ------------------------------------------- |
| `display`     |  40 |         30 |         44 |  600 | La cifra única de una pantalla de resumen   |
| `h1`          |  30 |         22 |         36 |  600 | Título de página                            |
| `h2`          |  24 |         18 |         32 |  600 | Sección                                     |
| `h3`          |  20 |         15 |         28 |  600 | Subsección, título de card                  |
| `h4`          |  16 |         12 |         24 |  600 | Encabezado de grupo, etiqueta destacada     |
| `body`        |  14 |         11 |         20 |  400 | Texto de trabajo — **el 80 % del producto** |
| `body-strong` |  14 |         11 |         20 |  500 | Énfasis dentro del cuerpo                   |
| `caption`     |  12 |          9 |         16 |  400 | Metadatos, texto de eje, notas              |
| `overline`    |  11 |          8 |         16 |  600 | Etiqueta de KPI, encabezado de columna      |
| `metric-lg`   |  32 |         24 |         36 |  600 | Cifra de KPI principal                      |
| `metric-md`   |  24 |         18 |         28 |  600 | Cifra de KPI secundario                     |
| `metric-sm`   |  14 |         11 |         20 |  500 | Cifra en tabla                              |

**Tres pesos y no más:** 400 regular, 500 medio, 600 semibold. No hay bold 700 — sobre
grafito `#151A21` el 600 ya es rotundo, y el 700 en una tabla densa emborrona. No hay
cursiva: en cifras es ilegible, y en etiquetas no aporta un nivel de jerarquía que no dé
mejor el color.

### La conversión px ↔ pt no es aproximada

A 96 dpi, **1 px = 0,75 pt exacto**. Los valores de la columna `pt` son la escala en el
sistema nativo de Excel, no una traducción cercana. `body` en 11 pt es además el tamaño por
defecto de Excel: el diseño no obliga a tocar nada para el caso más común.

## 3. Cifras: la decisión que define el producto

### 3.1 Tabulares, siempre

Toda cifra que pueda aparecer en columna usa **cifras tabulares de ancho fijo**:

```css
font-variant-numeric: tabular-nums lining-nums slashed-zero;
```

Con cifras proporcionales, el `1` es más estrecho que el `8` y las columnas dejan de
alinearse por posición decimal. El usuario pierde la capacidad de comparar magnitudes por la
forma del bloque y tiene que leer dígito a dígito. Es la diferencia entre escanear y leer.

En Excel esto es gratis: **Aptos y Calibri ya son tabulares por defecto** en celdas
numéricas. En web hay que pedirlo explícitamente, y olvidarlo es el fallo más frecuente.

### 3.2 Cero rasgado

`slashed-zero` en cifras. En un extracto bancario, `0` y `O` deben distinguirse sin contexto.

### 3.3 Los separadores decimales se alinean

Toda columna de importes alinea por el separador decimal. Con cifras tabulares y alineación
derecha esto sale solo **si el número de decimales es constante en la columna** — y lo es:
el número de decimales lo fija la moneda, no el valor. `1.284,00` nunca se escribe `1.284,0`
ni `1.284`.

## 4. Reglas de composición

| Regla                  | Valor               | Razón                                               |
| ---------------------- | ------------------- | --------------------------------------------------- |
| Longitud de línea      | 45–75 caracteres    | Más allá, el ojo pierde el retorno                  |
| Interlínea del cuerpo  | 1,45                | Más apretado cansa; más suelto rompe el bloque      |
| Interlínea de títulos  | 1,2                 | La masa del título es la unidad, no la línea        |
| Tracking de títulos    | −0,014 a −0,02 em   | Compensa el espaciado óptico en cuerpos grandes     |
| Tracking de `overline` | +0,06 em            | Las mayúsculas necesitan aire para no apelmazarse   |
| Tracking del cuerpo    | 0                   | Inter y Aptos ya están bien espaciadas a 14 px      |
| Mayúsculas             | Solo `overline`     | Un texto en mayúsculas es 15–20 % más lento de leer |
| Viudas y huérfanas     | Evitadas en títulos | `text-wrap: balance` en web                         |

## 5. Jerarquía sin color

La jerarquía se construye con **tamaño, peso y espacio**. Comprobación: en escala de grises,
la jerarquía tiene que seguir siendo evidente. Si desaparece al quitar el color, el color
estaba haciendo un trabajo que no le toca.

Ejemplo de un KPI, de arriba abajo:

```
INGRESOS NETOS        overline 11 px / 600 / text-secondary
2.847.392,00 €        metric-lg 32 px / 600 / text-primary
▲ +12,4 % vs. jun     caption 12 px / 500 / polarity.gain
```

Tres niveles en 68 px de alto, sin una sola caja y sin un solo borde.

## 6. Formato numérico

Es parte de la tipografía, no de la lógica de negocio: define cómo se ve una cifra.

| Regla               | Decisión                                                                     |
| ------------------- | ---------------------------------------------------------------------------- |
| Separador de miles  | Punto `1.284.392` (es-ES) — configurable por localización                    |
| Separador decimal   | Coma `,00` (es-ES) — configurable                                            |
| Decimales           | Los que fije la moneda: 2 (EUR, USD), 0 (JPY, CLP), 3 (BHD)                  |
| Símbolo de moneda   | Detrás con espacio fino: `1.284,00 €`. Delante en USD: `$1,284.00`           |
| Negativos           | Signo menos real `−` (U+2212), no guion. Nunca paréntesis por defecto        |
| Cero                | `0,00`, nunca `-` ni celda vacía                                             |
| Sin dato            | `—` (raya, U+2014) en `text-tertiary`. **Cero y "sin dato" no son lo mismo** |
| Porcentajes         | Un decimal `12,4 %`, espacio fino antes del `%`                              |
| Puntos porcentuales | `pp`, no `%`, para diferencias entre porcentajes                             |
| Abreviación         | Solo en gráficos y KPI: `2,8 M`, `847 k`. **Nunca en una tabla**             |
| Redondeo            | Idéntico en todas las vistas. Se redondea al presentar, jamás al calcular    |

**La distinción entre `0,00` y `—` es innegociable.** "El importe es cero" y "no tenemos el
importe" son afirmaciones distintas, y confundirlas en un estado financiero es un error
material.

**La abreviación no entra en tablas** porque una tabla es para comparar y sumar: `2,8 M`
junto a `847 k` obliga a convertir mentalmente. En un KPI, donde la cifra se lee sola y de
lejos, la abreviación gana.

## 7. Excel — concreto

```
Fuente del libro:     Aptos 11 pt  (Diseño de página → Fuentes → tema Finance OS)
Alto de fila:         27 pt (default) · 21 pt (compact) · 33 pt (relaxed)
Alineación numérica:  derecha, vertical centrada
Formato de importe:   #.##0,00 [$€-es-ES];[Red]−#.##0,00 [$€-es-ES]
Formato de %:         0,0 %
Sin dato:             formato personalizado con "—" en la cuarta sección
```

Se crean **estilos de celda con nombre** que se corresponden uno a uno con los tokens de la
escala: `FOS/Display`, `FOS/H1` … `FOS/Metric-lg`, `FOS/Body`, `FOS/Caption`. Nunca se aplica
formato directo. Un libro con formato directo es un libro que no se puede rediseñar.

Detalle: `[Red]` en el formato numérico usa el rojo de Excel, no el token. Se sustituye por
formato condicional apuntando a `text-negative` (`C22B24`) — ver
[15 · Tablas](../components/15-tablas.md) § Excel.

## 8. Accesibilidad

- Tamaño mínimo absoluto: **11 px** (`overline`), y solo en mayúsculas con tracking, que
  soporta mejor el cuerpo pequeño. Nada por debajo.
- Todo el texto respeta el zoom hasta el 200 % sin pérdida de contenido (SC 1.4.4).
- Ningún texto dentro de imagen (SC 1.4.5).
- Los tamaños se declaran en `rem`, no en `px`, para respetar el tamaño base del navegador.
- El texto se puede espaciar según la SC 1.4.12 sin romper el layout: las alturas de fila son
  mínimos, no valores fijos.

---

**Anterior:** [05 · Color](05-color.md) · **Siguiente:** [07 · Espaciado](07-espaciado.md)
