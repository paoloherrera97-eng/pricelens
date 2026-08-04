# 05 · Color

> Toda razón de contraste de este documento está **medida**, no estimada. Se generan con
> `node finance-os/qa/contrast/audit.mjs` y viven en
> [`../../qa/contrast/REPORT.md`](../../qa/contrast/REPORT.md).

---

## 1. La estrategia de color en una frase

**Una base neutra que ocupa el 95 % de la pantalla, un acento que solo significa "acción", y
tres colores de estado que solo significan lo que significan en finanzas.**

Cuatro familias. Ni una más:

| Familia       | Nombre   | Significado — único e innegociable                     |
| ------------- | -------- | ------------------------------------------------------ |
| **Grafito**   | Neutro   | Estructura, texto, superficie. No significa nada.      |
| **Índigo**    | Acento   | Acción, selección, enfoque. **Nunca** estado del dato. |
| **Jade**      | Positivo | Variación favorable                                    |
| **Bermellón** | Negativo | Variación desfavorable                                 |
| **Ámbar**     | Aviso    | Estimado, aproximado, requiere atención                |

### Por qué el acento es azul y no verde

Podría parecer que un producto financiero pide verde. Es un error, y no estético:

1. **El verde ya está ocupado.** En finanzas, verde = variación favorable. Un botón verde
   junto a una columna de variaciones verdes obliga al usuario a desambiguar en cada
   lectura.
2. **Azul sobrevive al daltonismo.** Protanopia y deuteranopia —~8 % de los hombres— colapsan
   verde y rojo entre sí, pero **no** afectan al azul. Poner la acción en el eje azul
   garantiza que la acción nunca se confunde con la polaridad, precisamente para quien más
   riesgo de confusión tiene.
3. **Azul es cromáticamente estable.** Aguanta el cambio de calibración de monitor, la
   proyección y la fotocopia mejor que cualquier verde.

El tono concreto —índigo `#3B5BDB`, no el azul de sistema— aleja al producto del "azul
corporativo por defecto" sin sacrificar nada de lo anterior.

## 2. Rampas primitivas

Valores en [`tokens/finance-os.tokens.json`](../../tokens/finance-os.tokens.json). Los
primitivos **nunca se usan directamente en un componente**: existen para alimentar la capa
semántica.

### Grafito — el 95 % del producto

| Paso        | Hex                   | Papel                                |
| ----------- | --------------------- | ------------------------------------ |
| `0`         | `#FFFFFF`             | Superficie de card                   |
| `25`        | `#FBFCFD`             | Alternancia de fila                  |
| `50`        | `#F6F8FA`             | Fondo de aplicación                  |
| `100`       | `#EDF0F4`             | Campo relleno, hover                 |
| `150`       | `#E4E8EE`             | Activo, filete sutil                 |
| `200`       | `#D8DDE5`             | Divisor                              |
| `300`       | `#C2C9D4`             | Borde decorativo                     |
| `400`       | `#98A2B1`             | Texto deshabilitado                  |
| `450`       | `#7C8695`             | **Límite de control**                |
| `500`       | `#636C7A`             | Texto terciario                      |
| `600`       | `#55606F`             | Texto secundario                     |
| `700`–`950` | `#3D4654` … `#0C1016` | Texto primario y superficies oscuras |

El grafito lleva un matiz azulado mínimo (H ≈ 220). Un gris perfectamente neutro junto a un
acento azul se ve sucio, amarillento; un gris con una gota del acento se ve intencionado. El
matiz es tan bajo que nadie lo nombra — y ese es el objetivo.

### Índigo, jade, bermellón, ámbar

Cuatro rampas de trabajo. Solo se documentan los pasos que la interfaz usa de verdad; una
rampa con doce pasos de los que se usan tres es deuda, no flexibilidad.

| Familia   | Fondo tenue  | Texto / marca                       | Presionado    |
| --------- | ------------ | ----------------------------------- | ------------- |
| Índigo    | `50 #EEF2FE` | `500 #3B5BDB` · texto `600 #2F49B4` | `700 #263B8E` |
| Jade      | `50 #E8F6EF` | texto `600 #127543`                 | `700 #0F6238` |
| Bermellón | `50 #FDECEB` | texto `600 #C22B24`                 | `700 #9B211B` |
| Ámbar     | `50 #FDF4E4` | texto `600 #8F5B12`                 | `700 #7A4E0F` |

Nota sobre el ámbar: el amarillo puro no alcanza 4,5:1 sobre blanco a ningún nivel que
siga leyéndose como amarillo. El token de texto es por tanto un **ámbar tostado**
(`#8F5B12`, 5,72:1). El amarillo brillante existe solo como relleno de superficie, nunca
como texto.

## 3. Capa semántica

Los componentes referencian **solo** esta capa. Es lo que convierte el modo oscuro en un
cambio de paleta en vez de una variante por elemento.

| Token                                                     | Papel                                          |
| --------------------------------------------------------- | ---------------------------------------------- |
| `canvas`                                                  | Fondo de la aplicación                         |
| `surface` / `surface-raised`                              | Card, panel                                    |
| `surface-sunken`                                          | Campo de entrada, celda editable               |
| `surface-hover` / `surface-active`                        | Retroalimentación de interacción               |
| `surface-accent` / `-positive` / `-negative` / `-warning` | Fondos teñidos de estado                       |
| `text-primary` / `-secondary` / `-tertiary` / `-disabled` | Cuatro niveles, ni uno más                     |
| `text-accent` / `-positive` / `-negative` / `-warning`    | Texto con significado                          |
| `border-subtle` / `-default`                              | Divisores **decorativos**                      |
| `border-strong`                                           | Límite de control — el único que cumple 1.4.11 |
| `border-focus`                                            | Anillo de foco                                 |
| `accent` / `-hover` / `-active`                           | Relleno de acción                              |
| `overlay`                                                 | Velo tras un modal                             |

### Los tres bordes, y por qué son tres

Es el error más común de un sistema de diseño: un solo token de borde usado para todo.

- `border-subtle` (1,23:1) y `border-default` (1,36:1) son **decorativos**. Separan
  visualmente. **No pueden identificar un control**: no cumplen el mínimo 3:1 de la SC
  1.4.11.
- `border-strong` (3,68:1 sobre `surface`, 3,22:1 sobre `surface-sunken`) es el único
  borde que puede decir "esto es un campo".

Usar `border-default` en un input es un fallo de accesibilidad, no una preferencia visual.

## 4. Contraste medido — modo claro

Extracto; tabla completa en [`REPORT.md`](../../qa/contrast/REPORT.md).

| Par                                      |       Ratio | Mínimo |
| ---------------------------------------- | ----------: | -----: |
| `text-primary` sobre `surface`           | **17,48:1** |    4,5 |
| `text-secondary` sobre `surface`         |  **6,39:1** |    4,5 |
| `text-tertiary` sobre `surface`          |  **5,31:1** |    4,5 |
| `text-tertiary` sobre `surface-sunken`   |  **4,64:1** |    4,5 |
| `text-accent` sobre `surface`            |  **7,68:1** |    4,5 |
| `text-positive` sobre `surface-positive` |  **5,17:1** |    4,5 |
| `text-negative` sobre `surface-negative` |  **5,01:1** |    4,5 |
| `text-warning` sobre `surface-warning`   |  **5,24:1** |    4,5 |
| `text-on-accent` sobre `accent`          |  **5,67:1** |    4,5 |
| `border-strong` sobre `surface-sunken`   |  **3,22:1** |    3,0 |
| `border-focus` sobre `canvas`            |  **5,32:1** |    3,0 |
| `text-disabled` sobre `surface`          |      2,58:1 | exento |

**Seis pares fallaron la primera medición** y obligaron a corregir tokens: el texto
terciario, el positivo sobre su propio fondo teñido, el ámbar de aviso (fallaba por mucho:
3,64:1) y el límite de control sobre campo relleno. El registro está en
[CHANGELOG.md](../CHANGELOG.md). Es la razón de que el auditor exista: **los cuatro se veían
bien.**

## 5. Polaridad financiera

Verde y rojo no son colores de la marca: son **codificación de polaridad**, y la polaridad
tiene dos reglas propias.

### 5.1 El color nunca va solo

Todo valor con polaridad se presenta **siempre** con tres codificaciones simultáneas:

```
▲ +2,4 %      cursor + signo aritmético + color
▼ −1,8 %
—  0,0 %      plano: cursor neutro, texto terciario, sin color
```

Impreso en blanco y negro, o visto por alguien con deuteranopia, la información se conserva
íntegra. Esta regla no se relaja nunca — es el motivo por el que la
["prueba de la fotocopia"](01-filosofia-visual.md#3-la-prueba-de-fuego) está en la filosofía.

### 5.2 La convención es un token, no una constante

En Japón, China, Corea y Taiwán el **rojo significa subida**. Un producto financiero que
codifica la convención occidental en cada componente no puede entrar en esos mercados sin
reescribirse.

Por eso existe el grupo `polarity` en los tokens:

```json
"polarity": { "gain": "text-positive", "loss": "text-negative", "convention": "western" }
```

Cambiar `convention` a `eastern` intercambia los dos primeros valores. **Ningún componente
se toca.** Ningún componente referencia `text-positive` directamente para una variación:
referencia `polarity.gain`.

### 5.3 Signo, no paréntesis

Las pérdidas se escriben con signo menos `−1.284,00`, no entre paréntesis `(1.284,00)`. Los
paréntesis son convención contable de máquina de escribir, se pierden al copiar a otra
herramienta y son invisibles al escanear una columna. El formato contable con paréntesis se
soporta como **preferencia de exportación**, no como presentación por defecto.

## 6. Color de datos

La paleta de gráficos vive en su propio documento porque obedece a reglas distintas
(separación perceptual, no jerarquía): ver [20 · Gráficos](../components/20-graficos.md).

Resumen: **8 series en orden fijo**, validadas bajo simulación de protanopia y deuteranopia
(Machado-Oliveira-Fernandes 2009, severidad 1.0); una rampa secuencial de un solo tono para
magnitud; una rampa divergente índigo↔bermellón con punto medio gris para desviación sobre
presupuesto. El orden de las series **es** el mecanismo de seguridad — no se reordena por
gusto.

## 7. Modo oscuro — y por qué Excel no lo tiene

El modo claro es **canónico**. El oscuro es una segunda expresión, exclusiva de la web.

Tres razones para no llevar el oscuro a Excel:

1. Excel oscurece la interfaz pero **el lienzo de la hoja sigue siendo blanco** en la mayoría
   de configuraciones y versiones. Un diseño oscuro se rompe a la mitad.
2. **Todo se imprime.** El papel es blanco.
3. Los rellenos de celda de un tema oscuro se corrompen al copiar entre libros con temas
   distintos, que es la operación más frecuente del usuario de Excel.

Reglas del oscuro en web:

- No es una inversión. Es un mapeo elegido y **medido por separado**.
- La elevación deja de ser sombra y pasa a ser escalón de superficie (`900 → 800 → 750`).
- Los colores de texto se aclaran; los rellenos de acción **no**: `#3B5BDB` conserva 5,67:1
  con blanco encima independientemente del fondo de la página.
- El hover del botón primario **aclara** a `#4A68DF` (4,84:1 con blanco), no oscurece.
- Ningún acento saturado. Un `#00FF88` sobre negro vibra y cansa en minutos.

## 8. Prohibiciones

Degradados en superficies o botones · sombras de color · color decorativo sin significado ·
más de un acento · verde o rojo para acciones · color como único portador de información ·
rellenos con opacidad sobre fondo desconocido (rompe el contraste medido) · un quinto nivel
de texto · un cuarto borde.

---

**Anterior:** [04 · Principios UI](04-principios-ui.md) ·
**Siguiente:** [06 · Tipografía](06-tipografia.md)
