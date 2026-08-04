# 13 · Inputs

> El campo de importe es el componente más usado de Finance OS y el que más daño hace cuando
> está mal.

---

## 1. Anatomía

```
Etiqueta                          body-strong 14 / text-primary
┌──────────────────────────────┐
│ 1.284,00                   € │  alto 36 · padding 0 12 · radio 6
└──────────────────────────────┘  fondo surface-sunken · borde border-strong 1px
Texto de ayuda o error            caption 12 / text-tertiary o text-negative
```

Distancias: etiqueta→campo **8 px**, campo→ayuda **4 px**, campo→siguiente campo **12 px**.

## 2. La etiqueta va siempre encima, y siempre existe

Nunca dentro (_floating label_), nunca a la izquierda, nunca sustituida por el placeholder.

- El placeholder como etiqueta **desaparece al escribir**: el usuario pierde la referencia
  justo cuando la necesita, y al revisar un formulario largo no puede saber qué es cada
  campo.
- La etiqueta flotante se encoge a ~11 px y pierde contraste sobre el fondo del campo.
- La etiqueta a la izquierda desperdicia ancho, que en una pantalla financiera es el recurso
  escaso.

El placeholder, cuando existe, muestra **el formato esperado**: `0,00`, `DD/MM/AAAA`. En
`text-tertiary` (4,64:1 sobre `surface-sunken` — medido, y por eso el terciario se oscureció
respecto al valor inicial).

## 3. Tamaños

| Tamaño |  Alto | Tipografía | Uso                                |
| ------ | ----: | ---------- | ---------------------------------- |
| `sm`   | 28 px | `body` 14  | Filtros en línea, densidad compact |
| `md`   | 36 px | `body` 14  | **Por defecto**                    |
| `lg`   | 44 px | `body` 14  | Formularios principales, táctil    |

El **texto es siempre de 14 px** en las tres. Reducirlo a 12 px en `sm` haría ilegibles las
cifras, que es el contenido más importante. Lo que cambia es el alto, no el cuerpo.

## 4. Estados

| Estado   | Fondo              | Borde                             | Texto           |
| -------- | ------------------ | --------------------------------- | --------------- |
| default  | `surface-sunken`   | `border-strong`                   | `text-primary`  |
| hover    | `surface-sunken`   | `border-strong` + oscurecido      | `text-primary`  |
| focus    | `surface`          | `border-focus` 1 px + anillo 2 px | `text-primary`  |
| filled   | `surface-sunken`   | `border-strong`                   | `text-primary`  |
| error    | `surface-negative` | `text-negative` 1 px              | `text-primary`  |
| disabled | `surface-sunken`   | `border-default`                  | `text-disabled` |
| readonly | `transparent`      | ninguno                           | `text-primary`  |

**En foco el fondo se aclara a `surface`.** El campo activo es el único blanco de la
pantalla: es una señal de posición fortísima en un formulario largo, y no cuesta nada.

**`readonly` no tiene caja.** Un valor que no se puede editar no debe parecer editable; se
presenta como texto y ya. Es distinto de `disabled`, que es un campo editable temporalmente
bloqueado y sí conserva la caja.

## 5. El campo de importe

El componente crítico. Sus reglas:

| Regla                         | Comportamiento                                                 |
| ----------------------------- | -------------------------------------------------------------- |
| **Alineación**                | Derecha, siempre. Comparable con la columna                    |
| **Cifras**                    | Tabulares (`tabular-nums`, `slashed-zero`)                     |
| **Formato al escribir**       | Los separadores de miles se insertan mientras se teclea        |
| **Formato al salir**          | Se normaliza a los decimales de la moneda: `1284` → `1.284,00` |
| **El cursor no salta**        | Al insertar un separador, la posición del cursor se conserva   |
| **Símbolo de moneda**         | Sufijo fijo dentro del campo, `text-tertiary`, no editable     |
| **Signo**                     | `−` con `polarity.loss`; el usuario puede escribir `-`         |
| **Nunca se borra lo escrito** | Una entrada inválida se marca; no se descarta                  |
| **Pegar es tolerante**        | Acepta `1,284.00`, `1.284,00`, `1284`, `€1.284`, `(1.284)`     |
| **Teclado**                   | `inputmode="decimal"`                                          |

**La tolerancia al pegado importa más de lo que parece:** el usuario de Finance OS copia
importes desde otro Excel, desde un PDF y desde un correo, cada uno con su convención. Un
campo que rechaza `1,284.00` porque espera coma decimal genera un error de captura por cada
pegado.

**Nunca se borra lo escrito:** si el usuario teclea `1.2.3`, el campo lo marca en error y lo
conserva. Vaciarlo obliga a reescribir y, peor, hace dudar de si el sistema guardó algo.

## 6. Otros tipos

| Tipo              | Especificidad                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **Texto**         | Alineación izquierda. Contador de caracteres solo si hay límite duro                     |
| **Fecha**         | Formato `DD/MM/AAAA`, entrada por teclado **además** del selector. Nunca solo calendario |
| **Porcentaje**    | Sufijo `%` fijo, alineación derecha, un decimal                                          |
| **Búsqueda**      | Icono `search` a la izquierda, botón de limpiar a la derecha al haber texto              |
| **Área de texto** | Mínimo 3 filas, redimensionable en vertical, nunca en horizontal                         |

## 7. Validación

- **Al salir del campo** (`blur`), no en cada pulsación. Validar mientras se escribe marca en
  error un campo que aún se está rellenando.
- **Excepción:** el formato de importe sí se aplica en tiempo real, porque es formato, no
  validación.
- **Al reintentar**, la validación pasa a inmediata: el usuario ya sabe qué se espera.
- El mensaje de error **sustituye** al texto de ayuda; no se apilan.
- El mensaje dice **qué corregir**, no qué falló: "Introduce un importe con dos decimales",
  no "Formato inválido".
- El error se asocia con `aria-describedby` y el campo lleva `aria-invalid`.

## 8. Accesibilidad

- `<label for>` real. Un `<div>` encima del campo no es una etiqueta.
- Campo obligatorio: `required` + `aria-required`, marcado con la palabra "obligatorio" en la
  etiqueta. **No con un asterisco rojo**: el asterisco es color + símbolo sin texto.
- Objetivo táctil ≥ 24 px; el diseño usa 36 px.
- El anillo de foco no se sustituye por el cambio de fondo: van los dos.

## 9. Excel

Un input en Excel es una **celda desbloqueada** dentro de una hoja protegida.

```
Celda de entrada:   Relleno EDF0F4 (surface-sunken)
                    Borde fino 7C8695 (border-strong) en los cuatro lados
                    Bloqueada: NO · Estilo de celda: FOS/Input
Celda de solo lect.:Relleno FFFFFF · sin borde · Bloqueada: SÍ
Etiqueta:           Celda a la izquierda o encima · FOS/Label · alineación izquierda
Importe:            Formato #.##0,00 · alineación derecha · Aptos 11 pt
Validación:         Datos → Validación de datos (decimal, entre límites)
Mensaje de error:   Estilo "Detener" para lo que rompe el modelo,
                    "Advertencia" para lo dudoso pero posible
Ayuda:              Mensaje entrante de la validación (aparece al seleccionar)
```

Compensaciones necesarias:

- **No hay anillo de foco.** El indicador de selección de Excel es fino y gris. Se compensa
  reservando el relleno `EDF0F4` **exclusivamente** a las celdas editables: en una hoja donde
  solo lo editable es gris, se ve desde lejos dónde se escribe.
- **No hay estado de error persistente.** Se resuelve con formato condicional: relleno
  `FDECEB` y borde `C22B24` cuando la fórmula de validación falla.
- **Proteger siempre la hoja.** Sin protección, el usuario escribe encima de una fórmula y
  el modelo se rompe en silencio. La protección es parte del diseño, no de la seguridad.

---

**Anterior:** [12 · Botones](12-botones.md) · **Siguiente:** [14 · Selectores](14-selectores.md)
