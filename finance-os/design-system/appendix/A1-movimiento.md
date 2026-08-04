# A1 · Movimiento

> No estaba en la lista de los 31 capítulos, pero los modales, los menús, los skeletons y los
> paneles laterales necesitan reglas de movimiento. Aquí están, en un apéndice, para no
> alterar la numeración acordada.

---

## 1. La tesis

**El movimiento explica una relación. Nunca decora.**

En un producto financiero hay además una razón específica: **una cifra que se anima es una
cifra en la que se desconfía.** Durante los 600 ms de un contador ascendente, la pantalla
muestra números que no son ciertos. Si alguien mira en ese instante —o hace una captura—, lee
un dato falso.

## 2. Duraciones

| Token | ms | Uso |
| --- | ---: | --- |
| `instant` | 0 | Anillo de foco. **Siempre 0** |
| `fast` | 120 | Hover, cambio de color, cierre de menú |
| `base` | 180 | Apertura de menú, modal, panel |
| `slow` | 240 | Panel lateral ancho, transición de vista |
| `deliberate` | 320 | Único caso: el usuario debe notar que algo se mueve |

**Nada supera los 320 ms.** Por encima, el movimiento deja de percibirse como respuesta y
pasa a percibirse como lentitud del sistema.

**El anillo de foco a 0 ms** merece su propia línea: quien navega rápido con teclado ya está
tres campos más allá cuando termina una transición de 150 ms. Animar el foco perjudica
exactamente a quien más lo necesita.

## 3. Curvas

| Token | Curva | Uso |
| --- | --- | --- |
| `standard` | `cubic-bezier(0.2, 0, 0, 1)` | Cambios dentro de la pantalla |
| `enter` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Algo que entra: rápido al principio |
| `exit` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Algo que sale: acelera al final |

**Sin rebotes, sin elásticos, sin `overshoot`.** Un panel que rebota al abrirse le da al
producto una personalidad juguetona que contradice todo lo demás.

Asimetría deliberada: **entrar es más lento que salir** (180 vs. 120 ms). Lo que aparece hay
que verlo llegar; lo que se va, cuanto antes deje de estorbar, mejor.

## 4. Qué se anima y qué no

| Se anima | No se anima **nunca** |
| --- | --- |
| Opacidad | **Cifras y valores numéricos** |
| Transformaciones (escala, desplazamiento) | Anillos de foco |
| Color de fondo y de borde | Contenido de tabla al ordenar o filtrar |
| Alto en colapsables | Ancho de columna |
| Barrido del skeleton | Posición de un elemento en hover |
| | Cualquier cosa con `prefers-reduced-motion` |

**El contenido de la tabla no se anima al reordenar.** Ver filas volando de sitio impide
seguir la que interesaba, que es justo lo que hacía el usuario al ordenar.

## 5. Catálogo

| Elemento | Entrada | Salida |
| --- | --- | --- |
| Modal | 180 ms `enter`: opacidad 0→1, escala 0,98→1 | 120 ms `exit`, sin escala |
| Velo | 180 ms opacidad | 120 ms opacidad |
| Panel lateral | 240 ms `enter`: desplazamiento desde el borde | 180 ms `exit` |
| Menú | 120 ms: opacidad + escala 0,96→1, origen en el disparador | 120 ms opacidad |
| Tooltip | 120 ms opacidad, tras 400 ms de espera | 0 ms |
| Toast | 180 ms desde abajo | 120 ms opacidad |
| Skeleton → contenido | 120 ms fundido cruzado | — |
| Colapsable | 180 ms de alto | 180 ms |
| Sidebar colapsar | 180 ms de ancho | 180 ms |
| Header comprimir | 180 ms de alto | 180 ms |

El origen de escala del menú es **el disparador**: es lo que hace que se lea "esto salió de
ahí" en lugar de "esto apareció".

## 6. Movimiento reducido

Con `prefers-reduced-motion: reduce`:

- Todas las duraciones pasan a **0 ms**, salvo los fundidos de opacidad, que se conservan a
  120 ms (la opacidad no provoca desorientación vestibular).
- El barrido del skeleton desaparece; queda el bloque estático.
- El spinner pasa a un pulso de opacidad, sin rotación.
- Sin desplazamiento suave (`scroll-behavior: auto`).

Se implementa en la propia capa de tokens, no componente a componente:

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --fos-duration-fast: 0ms;
    --fos-duration-base: 0ms;
    --fos-duration-slow: 0ms;
  }
}
```

Un componente que anima con un valor literal en lugar del token se escapa de esta regla — y
es la razón por la que [las medidas siempre son tokens](../foundations/04-principios-ui.md#2-todo-medida-es-un-token).

## 7. Excel

**Excel no anima, y está bien así.** Sus únicas transiciones —el desplazamiento suave y el
resaltado de selección— son del programa, no del producto, y no se tocan.

Lo que hay que evitar activamente:

- **Animar formas con VBA en bucle.** Bloquea el hilo y el libro parece colgado.
- **Recalcular con `ScreenUpdating = True`** durante un proceso largo: produce un parpadeo
  que se lee como fallo. Ver [29 · Loading § 6](../patterns/29-loading.md#6-excel).
- **Transiciones de PowerPoint en hojas incrustadas.**

La ausencia de movimiento en Excel no es una carencia que compensar: es coherente con un
sistema donde el movimiento nunca decoraba.

---

**Anterior:** [31 · Responsive](../platform/31-responsive.md) ·
**Siguiente:** [A2 · Accesibilidad](A2-accesibilidad.md)
