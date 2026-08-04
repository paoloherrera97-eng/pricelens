# 10 · Elevación y sombras

> La elevación responde a una sola pregunta: **¿esto flota de verdad?** Si la respuesta es
> no, no lleva sombra.

---

## 1. Cuatro niveles

Cuatro, porque cuatro es el número de relaciones espaciales que una interfaz puede comunicar
sin que el usuario tenga que aprenderlas.

| Nivel | Significa                           | Qué lo usa                   |
| :---: | ----------------------------------- | ---------------------------- |
| **0** | Está en el plano de la página       | Fondo, tabla, secciones      |
| **1** | Está agrupado, no flotando          | Card, panel, fila en reposo  |
| **2** | Flota temporalmente, anclado a algo | Menú, popover, card en hover |
| **3** | Flota sobre todo, bloqueando        | Modal, panel lateral         |

No hay nivel 4. Si algo necesita estar por encima de un modal, el problema es el modal.

## 2. La doble expresión

Aquí está la decisión que hace que este sistema funcione en dos plataformas: **el nivel es
semántico; su expresión depende del medio.**

| Nivel | Web (claro)                                                      | Web (oscuro)                         | Excel                                               |
| :---: | ---------------------------------------------------------------- | ------------------------------------ | --------------------------------------------------- |
| **0** | sin sombra                                                       | sin sombra                           | sin borde, fondo `canvas`                           |
| **1** | `0 1px 2px rgb(21 26 33 / .04)`, `0 0 0 1px rgb(21 26 33 / .04)` | superficie `900`                     | relleno `surface` + filete `border-subtle` 0,5 pt   |
| **2** | `0 2px 4px -1px / .06`, `0 4px 12px -2px / .08`                  | superficie `800`                     | relleno `surface` + filete `border-default` 0,75 pt |
| **3** | `0 8px 16px -4px / .10`, `0 20px 40px -8px / .14`                | superficie `750` + sombra de recorte | forma con sombra externa 4 pt al 12 %               |

Excel no tiene sombras en celdas. En vez de renunciar a la jerarquía, **la elevación se
expresa con superficie y filete** — que es lo que la sombra estaba comunicando de todos
modos. El nivel semántico se conserva; cambia el vehículo.

En oscuro pasa lo mismo por otra razón: sobre `#151A21` una sombra negra es invisible. La
elevación pasa a ser el **escalón de superficie** (900 → 800 → 750). La sombra se mantiene
solo en el nivel 3 y no para elevar, sino para recortar el modal del fondo.

## 3. Anatomía de las sombras

Cada sombra web tiene dos capas, y no es adorno:

```css
box-shadow:
  0 2px 4px -1px rgb(21 26 33 / 0.06),
  /* contacto: define el borde */ 0 4px 12px -2px rgb(21 26 33 / 0.08); /* difusión: define la altura */
```

Una sombra de una sola capa se ve como una mancha; dos capas se ven como un objeto. La capa
de contacto es corta y algo más opaca; la de difusión es larga y más suave.

Tres reglas:

1. **El color de la sombra es el grafito 900 con alfa**, nunca negro puro. El negro sobre un
   fondo con matiz azul produce un halo gris sucio.
2. **Las sombras nunca llevan color.** Una sombra índigo bajo una card no significa nada.
3. **La opacidad máxima es 0,14.** Por encima, la sombra se convierte en un elemento visual
   en sí misma en lugar de en una señal espacial.

## 4. Elevación y hover

Un elemento **sube un nivel como mucho** al hacer hover, y solo si es realmente
desplazable o clicable como un todo.

**Lo que no se hace:** `transform: translateY(-2px)` en hover. Un desplazamiento de 2 px en
una card dentro de una rejilla mueve todo lo que tiene al lado en la percepción del usuario y
provoca la sensación de inestabilidad — exactamente lo contrario de lo que un producto
financiero quiere transmitir. **Cambia la sombra; no cambia la posición.**

## 5. Cuándo NO hay sombra

- **Tablas.** Ni la tabla, ni el encabezado, ni la fila. Una tabla es plana.
- **Inputs.** Un campo es una superficie hundida, no un objeto elevado.
- **Botones.** Incluido el primario. El relleno de color ya lo separa del fondo.
- **Badges, chips, etiquetas.**
- **Cards dentro de una card.** Si hay anidamiento, el nivel interior usa superficie, no
  sombra.
- **Cualquier cosa que se vaya a imprimir.** Las sombras se imprimen como bandas grises
  sucias. La hoja de estilos de impresión las elimina todas.

## 6. Superficie como elevación

En muchos casos el escalón de superficie hace el trabajo mejor que la sombra:

```
canvas          #F6F8FA   ← el fondo
surface         #FFFFFF   ← card: un escalón más clara que el fondo
surface-sunken  #EDF0F4   ← input: un escalón más oscura que la card
```

La card es más clara que el fondo, así que se lee elevada; el campo es más oscuro que la
card, así que se lee hundido. **Todo eso sin una sola sombra**, y funciona idéntico en Excel,
donde es la única técnica disponible.

Esta es la razón por la que el fondo de la aplicación no es blanco: sobre blanco, una card
blanca solo puede separarse con borde o sombra. Con `canvas` gris, la card se separa sola.

## 7. Excel — concreto

```
Nivel 1 (card):     Relleno FFFFFF sobre hoja F6F8FA
                    Borde exterior fino, color E4E8EE (border-subtle)
Nivel 2 (menú):     Relleno FFFFFF, borde exterior D8DDE5 (border-default), 0,75 pt
Nivel 3 (modal):    Forma (rectángulo redondeado 8 px) con sombra externa
                    desplazamiento 4 pt, desenfoque 12 pt, transparencia 88 %, color 151A21
```

Los niveles 1 y 2 se construyen con celdas. El 3 solo aparece en formas, que es donde Excel
sí admite sombra — y donde además es apropiada, porque una forma sí flota de verdad sobre la
hoja.

---

**Anterior:** [09 · Iconografía](09-iconografia.md) ·
**Siguiente:** [11 · Bordes y radios](11-bordes-radios.md)
