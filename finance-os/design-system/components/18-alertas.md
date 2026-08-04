# 18 · Alertas

> Decir algo importante sin gritar. En un producto financiero la alarma se gasta rápido: si
> todo alerta, nada alerta.

---

## 1. Los cuatro niveles

| Nivel           | Cuándo                                | Color     | Descartable |
| --------------- | ------------------------------------- | --------- | :---------: |
| **Información** | Contexto útil que no exige acción     | Acento    |     Sí      |
| **Aviso**       | Algo que puede afectar a una decisión | Ámbar     |     Sí      |
| **Error**       | Algo falló o impide continuar         | Bermellón |   **No**    |
| **Éxito**       | Confirmación de una acción completada | Jade      | Auto (5 s)  |

## 2. Anatomía

```
┌─────────────────────────────────────────────────────────┐
│ ⚠  Tipos de cambio del 31/07                       [×]  │  ← h4 16px/600
│    El proveedor no ha publicado los de hoy. Las         │  ← body 14 / text-secondary
│    conversiones usan el último cierre disponible.       │
│                                                          │
│    [Reintentar]  [Ver detalle]                          │  ← botones terciarios
└─────────────────────────────────────────────────────────┘
   fondo surface-warning · borde izquierdo 3px text-warning · radio 6 · padding 16
```

| Elemento      | Especificación                                               |
| ------------- | ------------------------------------------------------------ |
| Icono         | 20 px, en el color del nivel, arriba a la izquierda          |
| Título        | `h4` 16 px / 600 / `text-primary` — **el qué**, en una línea |
| Cuerpo        | `body` 14 / `text-secondary` — **la causa y la salida**      |
| Acciones      | Botones terciarios, máximo 2                                 |
| Cerrar        | `×` 16 px arriba a la derecha, salvo en errores              |
| Barra lateral | 3 px en el color del nivel — sobrevive a la escala de grises |

**El fondo teñido no basta.** Los cuatro fondos (`surface-warning`, `-negative`, `-accent`,
`-positive`) son claros y se distinguen mal entre sí en pantallas mal calibradas o
impresos. Icono + barra lateral + palabra hacen el trabajo real; el fondo solo acompaña.

## 3. Colocación

| Tipo           | Dónde                          | Comportamiento            |
| -------------- | ------------------------------ | ------------------------- |
| **Global**     | Bajo el header, ancho completo | Persiste hasta resolverse |
| **De sección** | Dentro de la card afectada     | Persiste                  |
| **En línea**   | Bajo el campo                  | Ligada a la validación    |
| **Toast**      | Abajo a la derecha             | 5 s, o hasta descartar    |

**El toast solo para confirmaciones.** Un error nunca es un toast: desaparece antes de que
el usuario lo lea y no deja rastro. Los errores persisten hasta que alguien hace algo.

## 4. Reglas

1. **Una alerta global por pantalla.** Si hay dos, se agrupan en una con lista.
2. **Toda alerta dice qué hacer.** "No se pudo conectar con el origen" está incompleto;
   "…Reintentar o usar el último cierre" está completo.
3. **El error no se puede descartar** sin resolverse. Un error descartable es un error que
   se descartará sin leer.
4. **Sin signos de exclamación.** Ver [02 · Personalidad](../foundations/02-personalidad-marca.md#41-reglas-de-voz).
5. **Nada parpadea.** Nunca. Y no solo por gusto: el parpadeo entre 2 y 55 Hz es un riesgo
   fotosensible (WCAG SC 2.3.1).
6. **El éxito es breve y no se celebra.** "Guardado · 14:32" y desaparece.
7. **La alerta no reemplaza al contenido.** Aparece junto a él, no en su lugar.

## 5. Alertas propias del dominio financiero

Las cuatro que este producto necesita nombrar explícitamente:

| Caso                  | Nivel       | Mensaje modelo                                                                               |
| --------------------- | ----------- | -------------------------------------------------------------------------------------------- |
| Datos desactualizados | Aviso       | "Última sincronización: 31/07 18:04. Las cifras pueden no reflejar movimientos posteriores." |
| Cifras estimadas      | Aviso       | "3 de 12 partidas son estimaciones. Ver cuáles."                                             |
| Descuadre             | Error       | "El activo no cuadra con pasivo + patrimonio. Diferencia: 1.284,00 €."                       |
| Periodo cerrado       | Información | "Julio 2025 está cerrado. Los asientos son de solo lectura."                                 |

El descuadre es un error, no un aviso: **un balance que no cuadra invalida todo lo que hay
encima**, y descartarlo no debe ser posible.

## 6. Accesibilidad

- `role="alert"` + `aria-live="assertive"` en errores; `role="status"` +
  `aria-live="polite"` en el resto.
- El icono es decorativo (`aria-hidden`): el nivel se expresa en el texto.
- El foco **no** se roba automáticamente, salvo que la alerta bloquee el trabajo.
- Un toast no puede ser el único portador de información: siempre existe además en el
  registro de la sesión o en el pie.

## 7. Excel

```
Alerta global:   Rango combinado de B a K en la cabecera de la hoja
                 Relleno del nivel · borde izquierdo grueso (1,5 pt) del color del nivel
                 Icono: PNG 20 px anclado · Título FOS/H4 · Cuerpo FOS/Body
Alerta de celda: Formato condicional — relleno FDECEB + fuente C22B24
                 Comentario/nota con el detalle
Validación:      Mensaje de error de la validación de datos
                 Estilo "Detener" para lo que rompe el modelo
                 Estilo "Advertencia" para lo dudoso pero posible
Toast:           NO EXISTE. Se sustituye por una celda de estado en la cabecera
                 ("Guardado · 14:32") que la macro actualiza
```

En Excel, **la alerta más importante es la de descuadre**, y va en una **fila de control fija
en la parte superior de cada hoja de modelo**:

```
B2:  ✓ Cuadra          → relleno E8F6EF, texto 127543
B2:  ✕ Descuadre: 1.284,00 €  → relleno FDECEB, texto C22B24
```

Fija con inmovilizar paneles, siempre visible, calculada por fórmula. Es el equivalente
funcional de un test que se ejecuta solo: mientras esa celda esté verde, el modelo se
sostiene.

---

**Anterior:** [17 · Badges](17-badges.md) · **Siguiente:** [19 · KPIs](19-kpis.md)
