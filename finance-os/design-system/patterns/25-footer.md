# 25 · Footer

> En la mayoría de productos el pie es donde van los enlaces legales. En Finance OS es
> **donde vive la procedencia del dato**, y por eso es un componente de primera.

---

## 1. Qué hace

Contesta tres preguntas que un usuario responsable se hace antes de firmar nada:

```
¿De dónde salen estas cifras?     → origen
¿De cuándo son?                   → marca de tiempo
¿Puedo llevármelas?               → exportación
```

## 2. Anatomía

```
────────────────────────────────────────────────────────────────────────
Origen: ERP · Sincronizado 04/08/2025 09:14   Tipo de cambio BCE 03/08
                                                    [Exportar] [Detalle]
────────────────────────────────────────────────────────────────────────
   48px · fondo canvas · borde superior border-subtle · caption 12 / text-tertiary
```

| Zona      | Contenido                                                             |
| --------- | --------------------------------------------------------------------- |
| Izquierda | Origen del dato · marca de sincronización · tipos de cambio aplicados |
| Derecha   | Exportar · ver detalle de procedencia                                 |

Tipografía `caption` 12 px en `text-tertiary` (5,31:1 medido). Es información de respaldo:
tiene que estar, tiene que poder leerse, y no tiene que competir.

## 3. Reglas

### 3.1 La marca de tiempo es obligatoria

Toda vista con datos muestra **cuándo se obtuvieron**. Sin excepción, ni siquiera cuando "son
de ahora mismo".

Formato: **absoluto, no relativo.** `04/08/2025 09:14`, no "hace 3 minutos". El relativo se
queda congelado en una pestaña abierta desde ayer y miente; el absoluto no puede mentir.

### 3.2 Frescura con estado

| Antigüedad              | Aspecto                                 |
| ----------------------- | --------------------------------------- |
| < 1 hora                | `text-tertiary`, sin marca              |
| 1–24 horas              | `text-tertiary` + icono `clock`         |
| > 24 horas              | `text-warning` + icono `alert-triangle` |
| Fallo de sincronización | `text-negative` + botón "Reintentar"    |

El umbral de 24 horas no es universal: se configura por origen. Un tipo de cambio de hace 20
horas está desactualizado; un plan contable de hace 20 horas está perfectamente vigente.

### 3.3 Nada de navegación

El pie **no** lleva enlaces a secciones, ni mapa del sitio, ni redes sociales, ni logotipo.
Para navegar está el [sidebar](23-sidebar.md).

### 3.4 Fijo si la tabla se desplaza

Cuando el contenido principal es una tabla desplazable, el pie se **fija abajo** junto con la
fila de totales. La procedencia acompaña siempre a lo que se está mirando.

## 4. Variantes

| Variante           | Uso                                                                   |
| ------------------ | --------------------------------------------------------------------- |
| **De vista**       | El descrito. Toda pantalla de datos                                   |
| **De card**        | Dentro de una card con origen propio: una línea, sin acciones         |
| **De exportación** | En PDF/impresión: origen, marca de tiempo, usuario, página _n_ de _m_ |
| **De aplicación**  | Solo en la pantalla de configuración: versión, licencia, soporte      |

El pie de aplicación aparece **una sola vez en todo el producto**. Poner la versión y el
aviso legal en cada pantalla es ruido permanente para una información que se consulta dos
veces al año.

## 5. Accesibilidad

- `<footer>` con `role="contentinfo"` solo si es el del documento.
- La marca de tiempo en `<time datetime="...">` en ISO, con el texto legible visible.
- El estado de frescura no depende solo del color: icono + texto.
- Los cambios de estado de sincronización van en `aria-live="polite"`.

## 6. Excel

El pie tiene **dos formas** en Excel, y las dos hacen falta:

### En pantalla — bloque de procedencia

```
Dos filas bajo el bloque de datos, tras una fila espaciadora de 18 pt:
  B(n):    "Origen: ERP · Sincronizado " & TEXTO(Ult_Sync;"dd/mm/aaaa hh:mm")
  B(n+1):  "Tipo de cambio BCE " & TEXTO(Fecha_TC;"dd/mm/aaaa")
  Estilo:  FOS/Caption · Aptos 9 pt · 636C7A
  Borde:   superior fino E4E8EE
Formato condicional sobre Ult_Sync:
  > 24 h  →  fuente 8F5B12  (text-warning)
  error   →  fuente C22B24  (text-negative)
```

### Al imprimir — pie de página nativo

```
Diseño de página → Encabezado y pie de página:
  Izquierda:  &"Aptos,Regular"&9 Finance OS · [Entidad] · [Periodo]
  Centro:     Origen y fecha de sincronización
  Derecha:    Página &P de &N
Color:        Excel imprime el pie en negro. Se acepta: es un pie de página
```

**Las dos formas son necesarias.** El pie nativo solo existe al imprimir; el bloque de
celdas solo se ve en pantalla. Un informe que se envía como PDF y no dice de cuándo son sus
cifras no se puede usar para decidir, y ese es exactamente el uso que se le va a dar.

---

**Anterior:** [24 · Header](24-header.md) · **Siguiente:** [26 · Modales](26-modales.md)
