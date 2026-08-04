# 23 · Sidebar

---

## 1. Anatomía

```
┌──────────────────────┐
│ ◧ Finance OS         │  56px  Marca · clic → Dashboard
├──────────────────────┤
│                      │  16px
│ ▸ Dashboard          │  36px  elemento
│ ▸ Tesorería          │  36px
│ ▸ Ingresos           │  36px  ← activo: surface-accent + barra 2px
│ ▸ Gastos             │  36px
│                      │  24px
│ INFORMES             │  20px  grupo · overline · text-tertiary
│ ▸ Resultados         │  36px
│ ▸ Balance            │  36px
│                      │
│         ⋮ (flexible) │
│                      │
├──────────────────────┤
│ ▸ Configuración      │  36px  fijo abajo
│ ◔ Paola H.           │  48px  cuenta
└──────────────────────┘
   240px · fondo canvas · borde derecho border-subtle
```

| Propiedad | Valor |
| --- | --- |
| Ancho expandido | **240 px** |
| Ancho colapsado | **64 px** (solo iconos) |
| Fondo | `canvas` `#F6F8FA` |
| Separación con el contenido | `border-subtle` 1 px |
| Alto de elemento | 36 px (`default`) |
| Padding horizontal | 12 px |
| Icono | 20 px, `text-secondary`, a 12 px del texto |

**Fondo `canvas` y no `surface`.** La navegación es el fondo sobre el que ocurre el trabajo,
no un objeto elevado sobre él. Con el sidebar en gris y el contenido en cards blancas, la
jerarquía se lee sin un solo borde.

**240 px** cabe "Conciliación bancaria" —la etiqueta más larga previsible— a 14 px sin
truncar, con su icono y su padding. Ese es el criterio; no es un número redondo elegido de
antemano.

## 2. Elementos

| Estado | Fondo | Texto | Icono |
| --- | --- | --- | --- |
| default | — | `text-secondary` | `text-secondary` |
| hover | `surface-hover` | `text-primary` | `text-primary` |
| **activo** | `surface-accent` + barra `accent` 2 px izquierda | `text-accent`, peso 500 | `text-accent` |
| padre de activo | — | `text-primary`, peso 500 | `text-primary` |
| disabled | — | `text-disabled` | `text-disabled` |

Radio `radius-md` 6 px, con 8 px de margen lateral para que el resalte no toque el borde.

**El estado activo tiene tres señales:** fondo, barra y peso. Sobrevive a la escala de
grises, a la fotocopia y al daltonismo.

## 3. Grupos

- Encabezado en `overline` 11 px, `text-tertiary`, con 24 px encima y 8 px debajo.
- **No son clicables** ni colapsables: un encabezado que a veces navega y a veces pliega es
  impredecible.
- Máximo **3 grupos** y **7 elementos** por grupo. Por encima de eso la navegación necesita
  un nivel más de estructura o el producto necesita menos áreas.

## 4. Colapsado

A 64 px, solo iconos, con la etiqueta en tooltip a la derecha tras 400 ms.

- La preferencia **persiste** entre sesiones.
- Se colapsa **automáticamente** por debajo de 1280 px, y pasa a superponerse por debajo de
  1024 px.
- El elemento activo conserva la barra `accent` de 2 px: es la única señal que sigue
  funcionando sin texto.
- El botón de colapsar está **abajo del todo**, no junto a la marca, para que no se pulse por
  accidente al ir al Dashboard.

## 5. Reglas

1. **El sidebar no se desplaza con el contenido.** Es fijo; si su propio contenido no cabe,
   se desplaza él, con la zona inferior anclada.
2. **Sin contadores de notificación** salvo que exijan acción. Un "12" junto a Gastos que
   solo significa "hay 12 gastos" es ruido permanente.
3. **Sin buscador dentro.** Para buscar está `Cmd+K`.
4. **El orden no cambia nunca.** Ver
   [22 · Navegación § 2.1](22-navegacion.md#21-la-navegación-no-se-mueve).
5. **La marca de arriba lleva al Dashboard**, no a una landing.

## 6. Accesibilidad

- `<nav aria-label="Principal">` con `<ul>`/`<li>`.
- `aria-current="page"` en el activo.
- En colapsado, el `aria-label` de cada elemento conserva el texto completo: el tooltip no es
  un nombre accesible.
- El foco se ve sobre `canvas`: el anillo `border-focus` mide **5,32:1** sobre ese fondo
  (medido).

## 7. Excel

Excel no tiene sidebar. Hay dos opciones honestas, y la elección no es de gusto:

| Opción | Cuándo | Coste |
| --- | --- | --- |
| **Hoja "Inicio" con índice** | Libro para compartir | Ninguno. **Preferida** |
| **Columna de navegación fija** | Libro de uso intensivo | Ocupa ancho en todas las hojas |

### Opción preferida — hoja Inicio

```
Hoja Inicio:  Índice a pantalla completa, agrupado igual que el sidebar web
              Cada área: forma rectangular 240 × 36 px con hipervínculo
              Estilo: FOS/Nav-Item · relleno F6F8FA · texto 55606F
              Activo no aplica (es un índice, no una navegación persistente)
Todas hojas:  B1 = "‹ Inicio" con hipervínculo · estilo FOS/Nav-Back
              Fila 1 inmovilizada
Pestañas:     Color por área (accent1..6), orden fijo
```

### Opción alternativa — columna de navegación

Columna `A` ensanchada a 240 px con hipervínculos, **inmovilizada** horizontalmente. Se
descarta por defecto porque rompe el esqueleto de columnas
([08 · Grid](../foundations/08-grid.md#3-excel-el-esqueleto-de-columnas)) y se lleva 240 px
de ancho útil en cada hoja — en A4 apaisado, eso es una columna de datos menos.

---

**Anterior:** [22 · Navegación](22-navegacion.md) · **Siguiente:** [24 · Header](24-header.md)
