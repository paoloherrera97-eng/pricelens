# 12 · Botones

---

## 1. Qué es

Un botón ejecuta una acción. **Si navega, es un enlace**, no un botón — la distinción no es
pedante: cambia el elemento HTML, el comportamiento del teclado, el menú contextual y lo que
anuncia un lector de pantalla.

## 2. Jerarquía

Cuatro variantes, y el número que puede haber de cada una por pantalla:

| Variante | Papel | Máximo por vista |
| --- | --- | :---: |
| **Primario** | La acción principal de la pantalla | **1** |
| **Secundario** | Acciones importantes alternativas | 2–3 |
| **Terciario** | Acciones frecuentes de bajo peso | sin límite |
| **Destructivo** | Elimina o revierte de forma irreversible | 1 |

**Un botón primario por pantalla.** Dos primarios son cero primarios: el usuario tiene que
leer ambos para decidir, que es justo el trabajo que el color venía a ahorrarle.

## 3. Anatomía

```
┌─────────────────────────────┐
│  [icono]  Etiqueta          │   alto: 36 px (default)
└─────────────────────────────┘   padding: 0 16px · icono→texto: 8px · radio: 6px
```

- **Etiqueta:** verbo en infinitivo + objeto. "Guardar cambios", no "OK". Sin mayúsculas, sin
  puntos suspensivos salvo que abra un diálogo que pida más datos ("Exportar…").
- **Icono:** opcional y solo cuando aporte lo que la palabra no da (`download`, `plus`).
  Siempre a la izquierda; a la derecha solo en `chevron-down` de un menú.
- **Ancho:** por contenido. Nada de anchos fijos, salvo en un grupo donde todos igualan al
  más ancho.

## 4. Tamaños

| Tamaño | Alto | Padding H | Tipografía | Icono | Uso |
| --- | ---: | ---: | --- | ---: | --- |
| `sm` | 28 px | 12 px | `caption` 12 | 16 | Barras de herramientas de tabla, densidad compact |
| `md` | 36 px | 16 px | `body` 14 | 16 | **Por defecto** |
| `lg` | 44 px | 24 px | `body` 14 | 20 | Acción principal de un formulario, táctil |

## 5. Estilos y estados

### Primario

| Estado | Fondo | Texto | Contraste |
| --- | --- | --- | ---: |
| default | `accent` `#3B5BDB` | `#FFFFFF` | **5,67:1** |
| hover | `accent-hover` `#2F49B4` | `#FFFFFF` | **7,68:1** |
| active | `accent-active` `#263B8E` | `#FFFFFF` | 10,01:1 |
| focus | default + anillo 2 px `border-focus`, offset 2 px | | |
| disabled | `surface-sunken` | `text-disabled` | 2,58:1 (exento) |
| loading | fondo de default, spinner 16 px + etiqueta **intacta** | | |

### Secundario

Fondo `surface`, borde `border-strong` 1 px, texto `text-primary`. Hover: fondo
`surface-hover`. Active: `surface-active`. El borde es `border-strong` y no `border-default`
porque un botón **es** un control y le aplica la SC 1.4.11.

### Terciario

Sin fondo ni borde. Texto `text-accent` (7,68:1). Hover: fondo `surface-hover`. Ocupa el
mismo alto que los demás para que las barras de herramientas cuadren.

### Destructivo

Fondo `surface`, borde `border-strong`, texto `text-negative` `#C22B24` (5,73:1). **No es un
botón rojo relleno.** Un bloque rojo sólido en una barra de herramientas atrae el clic
accidental, que es exactamente lo que no se quiere en la acción irreversible. El relleno rojo
se reserva a la confirmación **dentro** del modal, donde el usuario ya declaró su intención.

## 6. Reglas invariables

1. **El tamaño no cambia con el estado.** En `loading`, el spinner sustituye al icono o se
   antepone, y la etiqueta se conserva. Un botón que se encoge al cargar desplaza todo lo que
   tiene al lado.
2. **La etiqueta no cambia en `loading`.** "Guardar" no se convierte en "Guardando…": rompe
   el ancho y anula el nombre accesible. El estado se anuncia con `aria-busy`.
3. **Nunca solo icono sin nombre accesible.** `aria-label` obligatorio, y tooltip para quien
   ve.
4. **Objetivo mínimo 24 × 24 px** (SC 2.5.8). El diseño apunta a 36 px o más.
5. **Nada de sombras.** El relleno ya lo separa del fondo.
6. **Nada de mayúsculas** en la etiqueta.
7. **Orden en un grupo:** la acción principal a la derecha en modales (sigue al flujo de
   lectura hacia la confirmación), a la izquierda en barras de herramientas (donde el orden
   es de frecuencia). Coherente dentro de cada contexto.

## 7. Accesibilidad

- `<button>` real, nunca un `<div>` con `onClick`.
- Se activa con `Enter` y `Espacio`.
- `disabled` no recibe foco; si la razón del bloqueo importa, se usa `aria-disabled` con el
  motivo, porque un botón deshabilitado que no se puede enfocar tampoco puede explicarse.
- Anillo de foco de 2 px, **sin transición** (ver [A1](../appendix/A1-movimiento.md)).

## 8. Excel

Un botón en Excel es una **forma**, no una celda: las celdas no dan retroalimentación de
clic ni pueden llevar radio.

```
Forma:      Rectángulo redondeado, radio 6 px
Tamaño:     alto 27 pt (36 px) · ancho por contenido + 12 pt de padding
Primario:   Relleno 3B5BDB · sin contorno · texto FFFFFF · Aptos 11 pt semibold
Secundario: Relleno FFFFFF · contorno 7C8695 0,75 pt · texto 151A21
Terciario:  Sin relleno · sin contorno · texto 2F49B4
Destructivo:Relleno FFFFFF · contorno 7C8695 · texto C22B24
Acción:     Asignar macro
```

Limitaciones que hay que asumir y compensar:

- **No hay hover ni foco.** Se compensa con un tamaño mayor (nunca menos de 27 pt de alto) y
  separación amplia entre botones (≥ 12 pt), para reducir el clic erróneo.
- **Las formas se despegan al filtrar o al ocultar filas.** Los botones van en una zona de
  cabecera **fuera** del área de datos, en filas que nunca se filtran.
- **No hay estado `disabled` real.** Se simula con relleno `EDF0F4` y texto `98A2B1`, y la
  macro comprueba la precondición y muestra el motivo. Un botón que parece activo y no hace
  nada es peor que uno que explica por qué no.

---

**Anterior:** [11 · Bordes y radios](../foundations/11-bordes-radios.md) ·
**Siguiente:** [13 · Inputs](13-inputs.md)
