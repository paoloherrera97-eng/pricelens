# 24 · Header

> El header de un producto financiero no es una barra de marca: es **la declaración del
> contexto en el que hay que interpretar todo lo que hay debajo**.

---

## 1. Anatomía

```
┌──────────────────────────────────────────────────────────────────────┐
│ Ingresos                        [Julio 2025 ▾] [EUR ▾]  [⋯] [Exportar]│
│ Grupo Ejemplo · Consolidado                                           │
└──────────────────────────────────────────────────────────────────────┘
   64px (una línea) / 80px (con subtítulo) · fondo surface · borde inferior
```

| Zona | Contenido | Alineación |
| --- | --- | --- |
| **Izquierda** | Título de página (`h2` 24 px) + subtítulo de contexto (`caption`) | Izquierda |
| **Centro** | Vacío. Deliberadamente | — |
| **Derecha** | Selectores de contexto → menú `⋯` → acción principal | Derecha |

El centro se queda vacío. Un buscador central roba el espacio del título y compite con
`Cmd+K`, que ya hace ese trabajo mejor.

## 2. Los selectores de contexto

Es la parte importante de este componente.

| Selector | Obligatorio | Nota |
| --- | :---: | --- |
| **Periodo** | Sí | Siempre visible. El dato financiero sin periodo no significa nada |
| **Entidad** | Si hay más de una | Sociedad, unidad de negocio, centro de coste |
| **Moneda** | Si hay más de una | Con indicación del tipo de cambio aplicado |
| **Escenario** | Si aplica | Real · Presupuesto · Previsión |

Reglas:

1. **Muestran el valor, no la etiqueta.** "Julio 2025", no "Periodo: Julio 2025". El valor
   es la información; la etiqueta la sabe el usuario.
2. **Se aplican a toda la pantalla.** Ningún filtro por card. Ver
   [21 · Dashboard § 3.5](21-dashboard.md#35-el-contexto-es-global-y-visible).
3. **Viajan al navegar.** Ver [22 · Navegación § 2.4](22-navegacion.md#24-el-contexto-viaja).
4. **Un valor no estándar se destaca:** si el periodo no es el actual, o el escenario no es
   Real, el selector pasa a fondo `surface-accent`. Es la señal que evita que alguien lea
   cifras de presupuesto creyendo que son reales — y esa confusión, en un comité, es
   incidente.

## 3. Acciones

Orden de izquierda a derecha: **selectores de contexto → acciones secundarias (`⋯`) → acción
principal.**

- **Una sola acción principal** ([botón primario](../components/12-botones.md#2-jerarquía)).
- Máximo 2 acciones secundarias visibles; el resto al menú `⋯`.
- Las acciones destructivas **nunca** están en el header: viven en el menú de la fila o del
  registro concreto.

## 4. Comportamiento al desplazarse

El header **se queda fijo**, siempre. Y se comprime:

| Posición | Alto | Contenido |
| --- | ---: | --- |
| Arriba | 80 px | Título + subtítulo + selectores + acciones |
| Desplazado > 80 px | 56 px | Título + selectores + acción principal |

El subtítulo y las acciones secundarias desaparecen; **el contexto nunca**. Si al desplazarse
se pierde de vista el periodo, se pierde la capacidad de interpretar la tabla que se está
mirando.

La transición es un cambio de alto de 180 ms, sin desvanecidos, sin desplazamientos laterales.

## 5. Título

- **`h2` 24 px, peso 600.** Es el nombre de la vista, no de la aplicación: el nombre del
  producto ya está en el sidebar.
- El subtítulo lleva **contexto que no cabe en los selectores**: entidad, alcance de
  consolidación, versión del cierre.
- En nivel 3, el título es el objeto ("Factura F-2025-1284") y las migas van encima.

## 6. Accesibilidad

- `<header>` con `role="banner"` solo si es el header del documento.
- El título de página es `<h1>` en el árbol de accesibilidad aunque visualmente sea `h2`: el
  tamaño es una decisión visual, la estructura no.
- Los selectores llevan etiqueta accesible completa: `aria-label="Periodo: Julio 2025"`.
- Al comprimirse **no se pierde ningún elemento enfocable**: pasan al menú `⋯`, que sí es
  enfocable.

## 7. Excel

El header es un **bloque fijo de filas inmovilizadas** en cada hoja.

```
Fila 1:  B1  "‹ Inicio"                       FOS/Nav-Back · hipervínculo
Fila 2:  B2  Título de la hoja                FOS/H2 · Aptos 18 pt semibold
         I2  Periodo   (lista de validación)  FOS/Input · rango Periodo_Actual
         K2  Moneda    (lista de validación)  FOS/Input · rango Moneda_Actual
Fila 3:  B3  Subtítulo de contexto            FOS/Caption · 636C7A
         B3..K3 Control de cuadre             ver 18 · Alertas § 7
Fila 4:  Fila espaciadora 12 pt
Inmovilizar paneles en A5 → las filas 1–4 quedan siempre visibles
```

Detalles que hacen que funcione:

- **Los selectores son celdas con validación de datos** vinculadas a rangos con nombre
  (`Periodo_Actual`, `Moneda_Actual`) que **todas** las hojas leen. Cambiar el periodo en una
  hoja lo cambia en el libro entero: es el equivalente exacto del contexto global.
- **Las filas del header se repiten al imprimir**: Diseño de página → Imprimir títulos →
  Repetir filas en extremo superior `$1:$4`. Sin esto, la página 2 de un informe impreso no
  dice de qué periodo es.
- Las celdas de contexto van **desbloqueadas**; el resto del header, bloqueado.

---

**Anterior:** [23 · Sidebar](23-sidebar.md) · **Siguiente:** [25 · Footer](25-footer.md)
