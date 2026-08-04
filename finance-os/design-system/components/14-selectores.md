# 14 · Selectores

> Elegir entre opciones. El componente correcto depende de **cuántas** opciones hay y de si
> se puede elegir más de una — no del espacio disponible.

---

## 1. Cuál usar

|    Opciones | Selección única                       | Selección múltiple       |
| ----------: | ------------------------------------- | ------------------------ |
|           2 | **Switch** (si es on/off) o **Radio** | Checkbox                 |
|         3–5 | **Segmented control**                 | Grupo de checkbox        |
|        6–15 | **Select**                            | **Multi-select**         |
|         15+ | **Combobox** (con búsqueda)           | **Combobox múltiple**    |
| Jerárquicas | **Tree select**                       | **Tree select** múltiple |

**Regla:** a partir de 15 opciones, la búsqueda deja de ser una comodidad y pasa a ser
obligatoria. El plan contable, los centros de coste y las cuentas bancarias siempre pasan de
15: en Finance OS, el combobox es el caso normal y el select el caso raro.

## 2. Select

```
Etiqueta                          body-strong 14
┌──────────────────────────────┐
│ Cuenta 4300 · Clientes     ▾ │  alto 36 · misma métrica que el input
└──────────────────────────────┘
```

- Mismo alto, radio, fondo y borde que un [input](13-inputs.md). Un select que no parece un
  campo obliga a aprender dos gramáticas.
- Chevron `chevron-down` de 16 px, `text-tertiary`, a 12 px del borde derecho.
- **Sin opción vacía por defecto.** O tiene un valor sensato preseleccionado, o muestra un
  placeholder que dice qué elegir ("Selecciona una cuenta").
- El panel se abre **anclado al campo**, elevación 2, ancho ≥ el del campo, máximo 320 px de
  alto con desplazamiento.

### Opciones

| Estado    | Aspecto                                                                    |
| --------- | -------------------------------------------------------------------------- |
| default   | `text-primary` sobre `surface`, alto 36 px, padding 12 px                  |
| hover     | fondo `surface-hover`                                                      |
| selected  | fondo `surface-accent`, texto `text-accent`, `check` de 16 px a la derecha |
| disabled  | `text-disabled`, sin hover                                                 |
| agrupadas | encabezado `overline` en `text-secondary`, no seleccionable                |

El elemento seleccionado lleva **check además del fondo**: el fondo teñido solo es un
significado por color.

## 3. Combobox

Select + campo de búsqueda. Reglas propias:

- El campo de búsqueda está **dentro del panel**, no sustituye al disparador.
- Filtra por **coincidencia en cualquier posición**, no solo por prefijo: quien busca "4300 ·
  Clientes" puede escribir "clientes".
- La coincidencia se resalta en `body-strong`, nunca con fondo amarillo.
- Sin resultados → mensaje de una línea, no un estado vacío ilustrado.
- Teclado completo: `↑↓` navega, `Enter` selecciona, `Esc` cierra, escribir filtra.
- **Selección múltiple:** los elegidos aparecen como chips sobre el campo, con `×` por chip.
  A partir de 4 chips se colapsa a "4 seleccionados" con popover de detalle.

## 4. Segmented control

Para 3–5 opciones que el usuario cambia a menudo y quiere ver todas a la vez: periodo (Mes /
Trimestre / Año), vista (Tabla / Gráfico), escenario (Real / Presupuesto / Desviación).

```
┌─────────┬──────────┬─────────┐
│  Mes    │ Trimestre│  Año    │   alto 36 · fondo surface-sunken
└─────────┴──────────┴─────────┘   activo: surface + elevación 1 + text-primary
```

Segmento activo: fondo `surface`, sombra nivel 1, texto `text-primary`, peso 500. Inactivos:
`text-secondary`, sin fondo. **El indicador no es el color del texto**: es la superficie
elevada, que se ve en escala de grises y en fotocopia.

Todos los segmentos miden lo mismo, aunque las etiquetas no. Un segmentado con anchos
desiguales se lee como una jerarquía que no existe.

## 5. Checkbox y radio

|                     | Checkbox                                    | Radio                               |
| ------------------- | ------------------------------------------- | ----------------------------------- |
| Forma               | Cuadrado, `radius-sm` 4 px                  | Círculo                             |
| Tamaño              | 16 × 16 px                                  | 16 × 16 px                          |
| Área de clic        | 24 × 24 px mínimo, **incluye la etiqueta**  | igual                               |
| Sin marcar          | Borde `border-strong` 1 px, fondo `surface` | igual                               |
| Marcado             | Fondo `accent`, check blanco 12 px          | Punto blanco de 6 px sobre `accent` |
| Indeterminado       | Fondo `accent`, guion blanco                | No existe                           |
| Separación etiqueta | 8 px                                        | 8 px                                |

Cuadrado para múltiple y círculo para única es una convención de cuarenta años. No se
reinventa.

**El estado indeterminado es obligatorio** en cualquier checkbox que gobierne a otros
(seleccionar todas las filas de una tabla filtrada). Sin él, un "seleccionar todo" marcado
miente sobre cuántas filas están realmente seleccionadas — y eso, en una acción masiva sobre
asientos contables, es un incidente.

## 6. Switch

**Solo para lo que se aplica al instante y no necesita guardarse.** Mostrar/ocultar columnas,
activar comparación con el año anterior.

Si el cambio requiere pulsar "Guardar", **es un checkbox**. Un switch que no surte efecto
hasta guardar contradice su propia semántica.

```
Apagado:  ○──   fondo surface-sunken, borde border-strong, pulgar surface
Encendido: ──●  fondo accent, pulgar surface
```

Tamaño 36 × 20 px, pulgar de 16 px. Etiqueta **a la izquierda** (a diferencia del checkbox),
porque el switch se lee como el valor de un ajuste, no como una opción de una lista.

## 7. Accesibilidad

- Elementos nativos (`<select>`, `<input type="checkbox">`) siempre que sea posible. Un
  combobox a medida implementa el patrón ARIA completo: `role="combobox"`,
  `aria-expanded`, `aria-controls`, `aria-activedescendant`.
- El grupo de radio lleva `<fieldset>` + `<legend>`.
- El estado seleccionado nunca depende solo del color: check, punto o superficie elevada.
- Objetivo mínimo 24 × 24 px incluyendo la etiqueta clicable.

## 8. Excel

| Componente    | Implementación                                                               |
| ------------- | ---------------------------------------------------------------------------- |
| **Select**    | Validación de datos → Lista, con rango con nombre como origen                |
| **Combobox**  | Control de formulario _Cuadro combinado_ (permite búsqueda por prefijo)      |
| **Segmented** | Fila de formas con macro; la activa cambia a relleno `FFFFFF` + borde        |
| **Checkbox**  | Casilla de verificación (control de formulario) vinculada a celda            |
| **Radio**     | Botón de opción dentro de un _Cuadro de grupo_ — **el grupo es obligatorio** |
| **Switch**    | No existe. **Se usa checkbox.** Simularlo con formas no aporta nada          |

```
Lista de validación:  Origen = rango con nombre (nunca lista escrita a mano:
                      una lista literal no se puede mantener ni traducir)
Celda con lista:      Estilo FOS/Input · relleno EDF0F4 · borde 7C8695
Indicador:            Excel dibuja su propia flecha; no se intenta sustituir
```

Dos advertencias operativas:

- Los **controles de formulario** (checkbox, radio) flotan sobre la hoja y **se desalinean al
  ocultar filas o cambiar el zoom**. En listas largas se sustituyen por una columna de
  validación con `SÍ`/`NO` y formato condicional: menos bonito, infinitamente más fiable.
- La validación de datos **no impide pegar** valores inválidos. Toda entrada crítica lleva
  además una fórmula de comprobación visible en la hoja de control.

---

**Anterior:** [13 · Inputs](13-inputs.md) · **Siguiente:** [15 · Tablas](15-tablas.md)
