# Finance OS — informe de contraste

> Generado por `node finance-os/qa/contrast/audit.mjs --write`. **No editar a mano.**
> Cada cifra del Design System que afirme una razón de contraste debe coincidir con este archivo.

Umbrales: **4,5:1** texto normal (WCAG 2.2 SC 1.4.3) · **3,0:1** componentes no textuales y
límites de control (SC 1.4.11) · **—** token exento (texto deshabilitado, divisor decorativo).

## Modo claro — canónico, y el único que existe en Excel

| Frente | Fondo | Hex | Ratio | Mínimo | Estado | Uso |
| --- | --- | --- | ---: | ---: | :---: | --- |
| `text-primary` | `surface` | #151A21 / #FFFFFF | **17.48:1** | 4.5 | OK | Cifra y encabezado sobre card |
| `text-primary` | `canvas` | #151A21 / #F6F8FA | **16.42:1** | 4.5 | OK | Cifra sobre fondo de aplicación |
| `text-primary` | `surface-sunken` | #151A21 / #EDF0F4 | **15.29:1** | 4.5 | OK | Texto dentro de campo relleno |
| `text-secondary` | `surface` | #55606F / #FFFFFF | **6.39:1** | 4.5 | OK | Etiqueta, texto de apoyo |
| `text-secondary` | `canvas` | #55606F / #F6F8FA | **6.00:1** | 4.5 | OK | Etiqueta sobre fondo |
| `text-tertiary` | `surface` | #636C7A / #FFFFFF | **5.31:1** | 4.5 | OK | Placeholder, texto de eje |
| `text-tertiary` | `surface-sunken` | #636C7A / #EDF0F4 | **4.64:1** | 4.5 | OK | Placeholder dentro de campo |
| `text-disabled` | `surface` | #98A2B1 / #FFFFFF | **2.58:1** | — | — | Deshabilitado — exento de 1.4.3 |
| `text-accent` | `surface` | #2F49B4 / #FFFFFF | **7.68:1** | 4.5 | OK | Enlace, botón terciario |
| `text-accent` | `surface-accent` | #2F49B4 / #EEF2FE | **6.87:1** | 4.5 | OK | Enlace sobre superficie teñida |
| `text-positive` | `surface` | #127543 / #FFFFFF | **5.75:1** | 4.5 | OK | Variación favorable |
| `text-positive` | `surface-positive` | #127543 / #E8F6EF | **5.17:1** | 4.5 | OK | Badge favorable |
| `text-negative` | `surface` | #C22B24 / #FFFFFF | **5.73:1** | 4.5 | OK | Variación desfavorable |
| `text-negative` | `surface-negative` | #C22B24 / #FDECEB | **5.01:1** | 4.5 | OK | Badge desfavorable |
| `text-warning` | `surface` | #8F5B12 / #FFFFFF | **5.72:1** | 4.5 | OK | Aviso, dato estimado |
| `text-warning` | `surface-warning` | #8F5B12 / #FDF4E4 | **5.24:1** | 4.5 | OK | Badge de aviso |
| `text-on-accent` | `accent` | #FFFFFF / #3B5BDB | **5.67:1** | 4.5 | OK | Etiqueta de botón primario |
| `text-on-accent` | `accent-hover` | #FFFFFF / #2F49B4 | **7.68:1** | 4.5 | OK | Botón primario en hover |
| `border-strong` | `surface` | #7C8695 / #FFFFFF | **3.68:1** | 3 | OK | Límite de control (1.4.11) |
| `border-strong` | `surface-sunken` | #7C8695 / #EDF0F4 | **3.22:1** | 3 | OK | Límite de campo relleno |
| `border-focus` | `surface` | #3B5BDB / #FFFFFF | **5.67:1** | 3 | OK | Anillo de foco (1.4.11) |
| `border-focus` | `canvas` | #3B5BDB / #F6F8FA | **5.32:1** | 3 | OK | Anillo de foco sobre fondo |
| `accent` | `surface` | #3B5BDB / #FFFFFF | **5.67:1** | 3 | OK | Marca de dato / relleno de serie |
| `border-default` | `surface` | #D8DDE5 / #FFFFFF | **1.36:1** | — | — | Divisor decorativo — nunca un límite |
| `border-subtle` | `surface` | #E4E8EE / #FFFFFF | **1.23:1** | — | — | Divisor decorativo |

## Modo oscuro — solo web

| Frente | Fondo | Hex | Ratio | Mínimo | Estado | Uso |
| --- | --- | --- | ---: | ---: | :---: | --- |
| `text-primary` | `surface` | #F6F8FA / #151A21 | **16.42:1** | 4.5 | OK | Cifra y encabezado sobre card |
| `text-primary` | `canvas` | #F6F8FA / #0C1016 | **17.91:1** | 4.5 | OK | Cifra sobre fondo de aplicación |
| `text-primary` | `surface-sunken` | #F6F8FA / #0C1016 | **17.91:1** | 4.5 | OK | Texto dentro de campo relleno |
| `text-secondary` | `surface` | #A9B3C1 / #151A21 | **8.24:1** | 4.5 | OK | Etiqueta, texto de apoyo |
| `text-secondary` | `canvas` | #A9B3C1 / #0C1016 | **8.99:1** | 4.5 | OK | Etiqueta sobre fondo |
| `text-tertiary` | `surface` | #8A94A3 / #151A21 | **5.70:1** | 4.5 | OK | Placeholder, texto de eje |
| `text-tertiary` | `surface-sunken` | #8A94A3 / #0C1016 | **6.22:1** | 4.5 | OK | Placeholder dentro de campo |
| `text-disabled` | `surface` | #55606F / #151A21 | **2.74:1** | — | — | Deshabilitado — exento de 1.4.3 |
| `text-accent` | `surface` | #93A9F2 / #151A21 | **7.65:1** | 4.5 | OK | Enlace, botón terciario |
| `text-accent` | `surface-accent` | #93A9F2 / #1B2440 | **6.70:1** | 4.5 | OK | Enlace sobre superficie teñida |
| `text-positive` | `surface` | #5FBE8C / #151A21 | **7.68:1** | 4.5 | OK | Variación favorable |
| `text-positive` | `surface-positive` | #5FBE8C / #0C2A1C | **6.77:1** | 4.5 | OK | Badge favorable |
| `text-negative` | `surface` | #F08A85 / #151A21 | **7.22:1** | 4.5 | OK | Variación desfavorable |
| `text-negative` | `surface-negative` | #F08A85 / #331312 | **6.98:1** | 4.5 | OK | Badge desfavorable |
| `text-warning` | `surface` | #E2B24E / #151A21 | **8.91:1** | 4.5 | OK | Aviso, dato estimado |
| `text-warning` | `surface-warning` | #E2B24E / #2E2109 | **8.01:1** | 4.5 | OK | Badge de aviso |
| `text-on-accent` | `accent` | #FFFFFF / #3B5BDB | **5.67:1** | 4.5 | OK | Etiqueta de botón primario |
| `text-on-accent` | `accent-hover` | #FFFFFF / #4A68DF | **4.84:1** | 4.5 | OK | Botón primario en hover |
| `border-strong` | `surface` | #5E6878 / #151A21 | **3.10:1** | 3 | OK | Límite de control (1.4.11) |
| `border-strong` | `surface-sunken` | #5E6878 / #0C1016 | **3.38:1** | 3 | OK | Límite de campo relleno |
| `border-focus` | `surface` | #93A9F2 / #151A21 | **7.65:1** | 3 | OK | Anillo de foco (1.4.11) |
| `border-focus` | `canvas` | #93A9F2 / #0C1016 | **8.35:1** | 3 | OK | Anillo de foco sobre fondo |
| `accent` | `surface` | #3B5BDB / #151A21 | **3.08:1** | 3 | OK | Marca de dato / relleno de serie |
| `border-default` | `surface` | #2E3643 / #151A21 | **1.44:1** | — | — | Divisor decorativo — nunca un límite |
| `border-subtle` | `surface` | #212834 / #151A21 | **1.18:1** | — | — | Divisor decorativo |

## Paleta categórica sobre superficie

Umbral de marca de dato: 3,0:1. La separación entre series se valida aparte con el simulador
Machado-Oliveira-Fernandes 2009 (ver `design-system/components/20-graficos.md`).

### Claro

| Ranura | Hex | Contraste sobre superficie |
| --- | --- | ---: |
| 1 | #3B5BDB | 5.67:1 |
| 2 | #E07A1F | 3.01:1 |
| 3 | #0E9F8A | 3.31:1 |
| 4 | #A8801A | 3.64:1 |
| 5 | #D2699E | 3.36:1 |
| 6 | #2E8B4E | 4.27:1 |
| 7 | #6D4AA8 | 6.57:1 |
| 8 | #D64B4B | 4.23:1 |

### Oscuro

| Ranura | Hex | Contraste sobre superficie |
| --- | --- | ---: |
| 1 | #5C7CE8 | 4.58:1 |
| 2 | #CE7526 | 5.16:1 |
| 3 | #14A18C | 5.41:1 |
| 4 | #AE8A22 | 5.37:1 |
| 5 | #CB6693 | 4.88:1 |
| 6 | #327F49 | 3.55:1 |
| 7 | #8A66C8 | 4.01:1 |
| 8 | #E25C5C | 4.93:1 |
