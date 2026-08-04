# 16 · Cards

> Una card agrupa. No decora, no separa por separar y no es el envoltorio por defecto de todo
> lo que hay en una pantalla.

---

## 1. Cuándo hay card

Una card está justificada si cumple **al menos una**:

- [ ] El grupo se puede mover, colapsar u ocultar como unidad
- [ ] El grupo tiene sus propias acciones
- [ ] El grupo compite visualmente con otro del mismo nivel (fila de KPIs)
- [ ] El grupo tiene su propio desplazamiento

Si no cumple ninguna, **es una sección con espacio**, no una card. El síntoma de un
dashboard mal diseñado es que todo está dentro de una caja: cuando todo está encerrado, el
encierro deja de significar nada y solo queda el ruido de los bordes.

## 2. Anatomía

```
┌────────────────────────────────────────────┐
│  Título de la card              [acciones] │  ← h3 20px/600 · sin fondo propio
│                                            │
│  Contenido                                 │  ← 24px de separación con el título
│                                            │
│  ─────────────────────────────────────     │  ← border-subtle, solo si hay pie
│  Pie: procedencia · marca de tiempo        │  ← caption 12 / text-tertiary
└────────────────────────────────────────────┘
   fondo surface · radio 8 · elevación 1 · padding 24
```

| Propiedad              | Valor                                         |
| ---------------------- | --------------------------------------------- |
| Fondo                  | `surface` `#FFFFFF`                           |
| Radio                  | `radius-lg` 8 px                              |
| Elevación              | Nivel 1                                       |
| Padding                | 24 px (`space-5`); 16 px en variante compacta |
| Separación entre cards | 24 px                                         |

**El encabezado no tiene fondo propio.** Un encabezado con fondo gris dentro de una card
crea un segundo nivel de superficie que no significa nada y roba peso al contenido. La
jerarquía la da la tipografía.

## 3. Variantes

| Variante        | Diferencia                                  | Uso                                                     |
| --------------- | ------------------------------------------- | ------------------------------------------------------- |
| **Estándar**    | La descrita                                 | Contenedor general                                      |
| **Compacta**    | Padding 16 px, título `h4`                  | Rejillas de muchas cards                                |
| **KPI**         | Sin título; la etiqueta es `overline`       | Ver [19 · KPIs](19-kpis.md)                             |
| **Sin relleno** | Padding 0                                   | La que contiene una tabla — el padding lo pone la tabla |
| **Interactiva** | Toda la card es clicable                    | Sube a elevación 2 en hover                             |
| **Con estado**  | Barra de 4 px arriba en el color del estado | Alertas persistentes                                    |

**La card que contiene una tabla no tiene padding.** La tabla llega hasta el borde y su
propio padding de celda hace el trabajo; si se suman los dos, la tabla queda flotando dentro
de un marco excesivo y se pierde ancho útil.

## 4. Anidamiento

Máximo **un** nivel. La card interior:

- No tiene sombra (usa `surface-sunken`)
- No tiene radio propio si toca el borde interior (ver
  [11 · Radios](../foundations/11-bordes-radios.md#las-dos-reglas-del-radio))
- Tiene 16 px de padding, no 24

Dos niveles de anidamiento significan que la jerarquía de información necesita replantearse,
no otra caja.

## 5. Reglas

1. **No hay card sin contenido.** Si no hay datos, la card se sustituye por un
   [estado vacío](../patterns/28-estados-vacios.md) — no una card vacía con un mensaje
   dentro.
2. **Card interactiva ⇒ toda la card es el objetivo.** No una card clicable con botones
   dentro que hacen otra cosa: el usuario no puede predecir qué hará su clic.
3. **La altura no se fuerza.** En una fila, las cards igualan altura por rejilla, no
   rellenando con espacio muerto.
4. **El pie es para procedencia**, no para acciones. Las acciones van en el encabezado.
5. **Sin degradados, sin bordes de color, sin sombras de color.**

## 6. Excel

Una card en Excel es un **rango de celdas con relleno y borde**, nunca una forma.

```
Rango:        Bloque rectangular alineado al esqueleto de columnas
Relleno:      FFFFFF sobre hoja F6F8FA
Borde:        Contorno fino E4E8EE (border-subtle) — la elevación 1 de Excel
Radio:        NO EXISTE. Esquina viva
Padding:      Fila superior e inferior de 18 pt (space-5) con relleno FFFFFF
              Columna izquierda y derecha de 9 pt con relleno FFFFFF
Título:       Estilo FOS/H3 en la primera fila de contenido
Pie:          Estilo FOS/Caption, texto 636C7A, borde superior E4E8EE
```

El padding se construye con **filas y columnas espaciadoras rellenas del color de la card**,
que es el equivalente exacto y no rompe nada.

**Nunca con formas:** una card dibujada como forma no se filtra, no se imprime alineada con
sus datos, se despega al ocultar filas y no se puede copiar como rango. Se acepta la esquina
viva a cambio de que todo lo demás funcione.

---

**Anterior:** [15 · Tablas](15-tablas.md) · **Siguiente:** [17 · Badges](17-badges.md)
