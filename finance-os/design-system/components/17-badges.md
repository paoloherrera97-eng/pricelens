# 17 · Badges

> Un estado en una palabra. Si necesita dos, probablemente no era un badge.

---

## 1. Anatomía

```
┌──────────────┐
│ ● Conciliado │   alto 20px · padding 0 8px · radio 4px
└──────────────┘   caption 12px / 500 · punto 6px
```

| Propiedad          | Valor                       |
| ------------------ | --------------------------- |
| Alto               | 20 px (`sm`) · 24 px (`md`) |
| Padding horizontal | 8 px                        |
| Radio              | `radius-sm` 4 px            |
| Tipografía         | `caption` 12 px, peso 500   |
| Punto              | 6 px, a 4 px del texto      |
| Texto              | Frase, no MAYÚSCULAS        |

**Radio 4 px y no pastilla.** La forma de pastilla (`radius-full`) es la convención de las
etiquetas decorativas y de las notificaciones; el badge de estado de Finance OS es
información estructural y se lee mejor con esquina contenida, en línea con el resto del
sistema.

## 2. Variantes

| Variante     | Fondo              | Texto            |  Contraste | Significado                       |
| ------------ | ------------------ | ---------------- | ---------: | --------------------------------- |
| **Neutro**   | `surface-sunken`   | `text-secondary` |     6,39:1 | Estado sin carga: "Borrador"      |
| **Positivo** | `surface-positive` | `text-positive`  | **5,17:1** | Conciliado, aprobado, cerrado     |
| **Negativo** | `surface-negative` | `text-negative`  | **5,01:1** | Rechazado, con discrepancia       |
| **Aviso**    | `surface-warning`  | `text-warning`   | **5,24:1** | Estimado, pendiente, vence pronto |
| **Acento**   | `surface-accent`   | `text-accent`    |     6,87:1 | En curso, nuevo, activo           |

Cinco. No hay más, y no se añaden variantes de color para categorías: un badge morado para
"tipo B" convierte el badge en una etiqueta decorativa y destruye la convención de estado.

## 3. Con punto y sin punto

El punto (`●` de 6 px) aparece cuando el badge representa un **estado de un proceso** —algo
que puede cambiar—: conciliado, pendiente, en revisión. No aparece cuando representa una
**propiedad** — moneda, ejercicio, tipo de documento.

Es una distinción útil: el punto indica "esto se mueve".

## 4. El badge `Est.`

El caso especial del producto. Marca **toda** cifra que no sea un dato real:

```
2.847.392,00 €  ⌈Est.⌉
```

- Variante aviso, tamaño `sm`, sin punto.
- Va **a la derecha de la cifra**, separado 8 px, alineado por la línea base.
- Nunca se omite "porque en esta pantalla todos son estimados". La cifra viaja: se copia, se
  pega en un correo, se captura para un comité. El marcaje viaja con ella.
- En una tabla entera de estimaciones, el badge va **en el encabezado de la columna** y la
  columna lleva fondo `surface-warning` al 40 % — el único fondo teñido admitido en una tabla.

Esta es la aplicación literal del compromiso de
[filosofía visual § 2.4](../foundations/01-filosofia-visual.md#24-cero-ambigüedad-sobre-la-naturaleza-del-dato).

## 5. Reglas

1. **Una palabra, dos como mucho.** "Conciliado", "Pendiente de aprobación" (el límite).
2. **El texto es el estado.** Nunca un badge que solo sea un punto de color: es color
   solo — inaccesible e inimprimible.
3. **Nunca clicable.** Un badge es información. Si hay que filtrar por él, el filtro está en
   la barra de herramientas.
4. **Un badge por dimensión.** Tres badges apilados en una celda son una tabla mal
   normalizada.
5. **Frase capital**, no mayúsculas: "Conciliado", no "CONCILIADO".

## 6. Accesibilidad

- El color nunca es el único portador: la palabra lo dice.
- Contraste medido ≥ 5:1 en las cinco variantes (ver
  [REPORT.md](../../qa/contrast/REPORT.md)).
- Los estados que cambian en vivo van en una región `aria-live="polite"`.
- El punto es decorativo: `aria-hidden`.

## 7. Excel

Un badge en Excel es una **celda con relleno**, no una forma.

```
Celda:       Alto de fila normal · alineación izquierda o centrada
Relleno:     surface-positive E8F6EF / -negative FDECEB / -warning FDF4E4 /
             -accent EEF2FE / -sunken EDF0F4
Texto:       Aptos 11 pt · color 127543 / C22B24 / 8F5B12 / 2F49B4 / 55606F
Borde:       Ninguno
Punto:       Carácter "●" en el mismo color, delante del texto
Estilos:     FOS/Badge-Positive, FOS/Badge-Negative, FOS/Badge-Warning,
             FOS/Badge-Accent, FOS/Badge-Neutral
Automático:  Formato condicional sobre el valor de texto de la celda
```

Diferencias respecto a la web que se aceptan sin pelear:

- **Sin radio** (celda). Como toda la retícula.
- **El relleno ocupa la celda entera**, no solo el texto. Es el comportamiento nativo y
  además funciona mejor en una columna de estados: la columna se lee como una banda de
  color, que a 4.000 filas es una ventaja, no un defecto.
- El punto es un carácter Unicode, coherente con la decisión de los cursores de polaridad en
  [09 · Iconografía](../foundations/09-iconografia.md#6-excel).

---

**Anterior:** [16 · Cards](16-cards.md) · **Siguiente:** [18 · Alertas](18-alertas.md)
