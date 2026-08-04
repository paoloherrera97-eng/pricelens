# 19 · KPIs

> La cifra que manda. Este componente es la razón de ser de la pantalla de resumen: si se lee
> mal, la pantalla no sirve.

---

## 1. Anatomía

```
INGRESOS NETOS                    ← overline 11 / 600 / +0,06em / text-secondary
2.847.392,00 €                    ← metric-lg 32 / 600 / text-primary / tabular
▲ +12,4 %  vs. jun 25             ← caption 12 / 500 / polarity + text-tertiary
```

Tres líneas y **ninguna caja**. Separaciones: etiqueta→cifra **8 px**, cifra→comparación
**4 px**.

| Elemento            | Token                                      |       Obligatorio        |
| ------------------- | ------------------------------------------ | :----------------------: |
| Etiqueta            | `overline` 11 px, `text-secondary`         |            Sí            |
| Valor               | `metric-lg` 32 px, `text-primary`, tabular |            Sí            |
| Variación           | `caption` 12 px, cursor + signo + color    |            No            |
| Comparación         | `caption` 12 px, `text-tertiary`           | Sí, **si hay variación** |
| Sparkline           | 60 × 20 px, `accent`, sin ejes             |            No            |
| Marca de estimación | Badge `Est.`                               |      Sí, si aplica       |

## 2. Las reglas duras

### 2.1 Un porcentaje sin base es propaganda

Si hay variación, **la base es obligatoria**: `+12,4 % vs. jun 25`, nunca `+12,4 %` a secas.
Un porcentaje sin referencia no es información, es una sensación. Es la regla más violada
del diseño de dashboards y la que más decisiones malas produce.

### 2.2 La cifra completa, no abreviada — con una excepción

`2.847.392,00 €`, no `2,8 M €`. La abreviación se admite **solo** cuando el ancho disponible
es menor de 200 px, y entonces el valor exacto aparece en el tooltip **y** en la tabla de
detalle. Nunca es la única representación.

### 2.3 Sin icono

El KPI no lleva icono decorativo junto a la etiqueta. El único símbolo permitido es el cursor
de polaridad (▲ ▼ —), que es información. Un icono de "dinero" junto a "Ingresos netos" no
añade nada y le roba peso a la cifra.

### 2.4 La variación lleva las tres codificaciones

Cursor + signo aritmético + color. Siempre. Ver
[05 · Color § 5.1](../foundations/05-color.md#51-el-color-nunca-va-solo).

### 2.5 Puntos porcentuales, no porcentaje

Si el KPI **es** un porcentaje (margen bruto 42,1 %), su variación se expresa en **puntos
porcentuales**: `+2,4 pp`, no `+2,4 %`. Confundirlos es un error de cálculo con formato de
error tipográfico, y en un comité alguien lo detecta.

### 2.6 Máximo cuatro por fila

Con cinco, ninguno es principal. Si hay más de cuatro métricas, la pantalla necesita
jerarquía —uno principal grande, el resto secundarios— o una tabla.

## 3. Jerarquía de KPIs

| Nivel          | Valor             | Etiqueta         | Uso                                    |
| -------------- | ----------------- | ---------------- | -------------------------------------- |
| **Principal**  | `display` 40 px   | `overline` 11 px | Una por pantalla. La cifra de la vista |
| **Estándar**   | `metric-lg` 32 px | `overline` 11 px | Fila de 3–4                            |
| **Secundario** | `metric-md` 24 px | `caption` 12 px  | Dentro de una card, apoyo              |
| **En línea**   | `metric-sm` 14 px | `caption` 12 px  | Dentro de una tabla o un pie           |

## 4. Variantes

| Variante          | Qué añade                                         |
| ----------------- | ------------------------------------------------- |
| **Simple**        | Etiqueta + valor                                  |
| **Con variación** | + cursor, porcentaje y base                       |
| **Con tendencia** | + sparkline de 12 periodos, sin ejes ni puntos    |
| **Con objetivo**  | + barra de progreso de 4 px y `72 % del objetivo` |
| **Comparativo**   | Dos valores lado a lado con la diferencia debajo  |

El sparkline **no tiene ejes, ni cuadrícula, ni puntos, ni tooltip**. Comunica forma, no
valores. Si hace falta leer valores, es un [gráfico](20-graficos.md), no un sparkline.

## 5. Estados

| Estado         | Aspecto                                                                        |
| -------------- | ------------------------------------------------------------------------------ |
| Cargando       | [Skeleton](../patterns/30-skeletons.md) con la forma exacta de las tres líneas |
| Sin dato       | Valor `—` en `text-tertiary` + `caption` con el motivo                         |
| Estimado       | Badge `Est.` a la derecha del valor                                            |
| Desactualizado | Valor en `text-secondary` + marca de tiempo en el pie                          |
| Interactivo    | Toda la card desciende al detalle; hover a elevación 2                         |

**El valor nunca se anima.** Ni contador ascendente, ni fundido al cambiar. Durante una
animación de _count-up_ la pantalla muestra cifras que no son ciertas, y quien mire en ese
instante lee un número falso. En un producto financiero es inaceptable, por bonito que quede.

## 6. Accesibilidad

- La etiqueta y el valor forman **un solo grupo accesible**: la cifra sola no significa nada.
- El cursor `▲` es decorativo (`aria-hidden`); la variación se anuncia como texto
  ("aumento del 12,4 % respecto a junio de 2025").
- La cifra, aunque grande, cumple 4,5:1 — no se aplica la relajación de "texto grande",
  porque es el contenido crítico de la pantalla.
- El valor abreviado siempre tiene el exacto disponible como texto, no solo en tooltip.

## 7. Excel

Un KPI en Excel son **tres celdas apiladas** en una columna del esqueleto:

```
Fila 1 (16 pt):  Etiqueta   FOS/Overline · Aptos 8 pt semibold · 55606F · MAYÚSCULAS
Fila 2 (36 pt):  Valor      FOS/Metric-lg · Aptos 24 pt semibold · 151A21
                            Formato #.##0,00 [$€-es-ES] · alineación izquierda
Fila 3 (16 pt):  Variación  FOS/Caption · Aptos 9 pt · color por formato condicional
                            Fórmula: ="▲ +"&TEXTO(var;"0,0%")&"  vs. "&base
Bloque:          Relleno FFFFFF · borde E4E8EE (card nivel 1)
                 Filas espaciadoras de 6 pt arriba y abajo
```

Notas:

- **La alineación del valor es a la izquierda**, no a la derecha como en una tabla: un KPI se
  lee solo, no se compara en columna con el de abajo.
- El cursor ▲▼— se compone **por fórmula** dentro del texto de la variación, para que viaje
  al copiar y al imprimir.
- El color de la variación se aplica con **formato condicional sobre el valor numérico
  subyacente**, que vive en una celda auxiliar oculta. Nunca se colorea a mano.
- El sparkline sí existe en Excel (Insertar → Minigráficos): línea, sin marcadores, color
  `3B5BDB`, sin eje. Es uno de los pocos elementos nativos de Excel que encaja en el sistema
  sin retoques.

---

**Anterior:** [18 · Alertas](18-alertas.md) · **Siguiente:** [20 · Gráficos](20-graficos.md)
