# Finance OS — Design System v1.0

> **La única referencia visual del producto.** Ninguna pantalla futura decide nada que
> ya esté decidido aquí. Cuando una pantalla necesite algo que aquí no exista, se amplía
> este sistema primero y se dibuja después.

**Estado:** completo · **Plataformas:** Microsoft Excel (primera), web (segunda) ·
**Modo canónico:** claro · **Accesibilidad:** WCAG 2.2 AA, medida

---

## Cómo se lee este sistema

Tres capas, y el orden importa:

```
FUNDAMENTOS (01–11)   Deciden el 90 % del resultado. Se leen una vez y se respetan siempre.
COMPONENTES (12–20)   Las piezas. Cada una tiene anatomía, estados, tokens y su forma en Excel.
PATRONES    (21–30)   Cómo se combinan las piezas en una pantalla real.
PLATAFORMA  (31)      Cómo se comporta todo al cambiar de tamaño y de plataforma.
```

Todo documento de componente responde a las mismas cinco preguntas, en el mismo orden:
**qué es · anatomía · tamaños · estados · cómo se hace en Excel**. Si un documento no
responde alguna, está incompleto.

## Índice

### Fundamentos

| #   | Documento                                                     | Decide                                           |
| --- | ------------------------------------------------------------- | ------------------------------------------------ |
| 01  | [Filosofía visual](foundations/01-filosofia-visual.md)        | Por qué el producto se ve así                    |
| 02  | [Personalidad de marca](foundations/02-personalidad-marca.md) | Cómo suena y qué carácter tiene                  |
| 03  | [Principios UX](foundations/03-principios-ux.md)              | Cómo se comporta                                 |
| 04  | [Principios UI](foundations/04-principios-ui.md)              | Cómo se dibuja                                   |
| 05  | [Color](foundations/05-color.md)                              | Paleta, roles, polaridad, contraste medido       |
| 06  | [Tipografía](foundations/06-tipografia.md)                    | Familias, escala, cifras, formato numérico       |
| 07  | [Espaciado](foundations/07-espaciado.md)                      | La rejilla de 8 px = 6 pt                        |
| 08  | [Grid](foundations/08-grid.md)                                | Columnas en web y esqueleto de columnas en Excel |
| 09  | [Iconografía](foundations/09-iconografia.md)                  | Estilo, rejilla, inventario, uso                 |
| 10  | [Elevación y sombras](foundations/10-elevacion.md)            | Los cuatro niveles y su doble expresión          |
| 11  | [Bordes y radios](foundations/11-bordes-radios.md)            | Cuándo hay línea y cuánto se curva               |

### Componentes

| #   | Documento                                 | Decide                             |
| --- | ----------------------------------------- | ---------------------------------- |
| 12  | [Botones](components/12-botones.md)       | Jerarquía de acción                |
| 13  | [Inputs](components/13-inputs.md)         | Entrada de texto y de importe      |
| 14  | [Selectores](components/14-selectores.md) | Elegir entre opciones              |
| 15  | [Tablas](components/15-tablas.md)         | El componente central del producto |
| 16  | [Cards](components/16-cards.md)           | Agrupar sin encerrar               |
| 17  | [Badges](components/17-badges.md)         | Estado en una palabra              |
| 18  | [Alertas](components/18-alertas.md)       | Decir algo importante sin gritar   |
| 19  | [KPIs](components/19-kpis.md)             | La cifra que manda                 |
| 20  | [Gráficos](components/20-graficos.md)     | Datos en forma visual              |

### Patrones

| #   | Documento                                       | Decide                              |
| --- | ----------------------------------------------- | ----------------------------------- |
| 21  | [Dashboard](patterns/21-dashboard.md)           | La composición de la pantalla madre |
| 22  | [Navegación](patterns/22-navegacion.md)         | Modelo de navegación y jerarquía    |
| 23  | [Sidebar](patterns/23-sidebar.md)               | La navegación principal             |
| 24  | [Header](patterns/24-header.md)                 | Contexto y acciones de página       |
| 25  | [Footer](patterns/25-footer.md)                 | Procedencia del dato                |
| 26  | [Modales](patterns/26-modales.md)               | Interrumpir, y cuándo no            |
| 27  | [Menús](patterns/27-menus.md)                   | Acciones secundarias                |
| 28  | [Estados vacíos](patterns/28-estados-vacios.md) | Cuando no hay nada que mostrar      |
| 29  | [Loading](patterns/29-loading.md)               | Cuando todavía no hay nada          |
| 30  | [Skeletons](patterns/30-skeletons.md)           | Cuando ya se sabe la forma          |

### Plataforma

| #   | Documento                                       | Decide                       |
| --- | ----------------------------------------------- | ---------------------------- |
| 31  | [Responsive mindset](platform/31-responsive.md) | Comportamiento entre tamaños |

### Apéndices

| Documento                                          | Contenido                                 |
| -------------------------------------------------- | ----------------------------------------- |
| [A1 · Movimiento](appendix/A1-movimiento.md)       | Duraciones, curvas y qué nunca se anima   |
| [A2 · Accesibilidad](appendix/A2-accesibilidad.md) | Compromiso WCAG 2.2 AA y cómo se verifica |
| [A3 · Glosario](appendix/A3-glosario.md)           | Vocabulario común del sistema             |

---

## Las cinco reglas que sobreviven a todo

Si alguien solo lee esta página, que lea esto:

1. **El dato es la interfaz.** Todo lo demás es andamio, y el andamio se ve lo menos posible.
2. **El espacio es la primera herramienta.** Antes de añadir un borde, una sombra o un
   fondo: más espacio. Casi siempre gana.
3. **El color significa o no está.** Índigo es acción. Verde y rojo son polaridad
   financiera. Ámbar es estimación. No hay color decorativo.
4. **El color nunca va solo.** Todo significado codificado en color lleva además signo,
   icono o texto. Un sistema financiero no puede depender de que el usuario distinga tonos.
5. **Si no funciona en Excel, no está en el sistema.** La restricción más dura manda.

## Verificación

```bash
node finance-os/qa/contrast/audit.mjs      # cada ratio de este sistema sale de aquí
node finance-os/tokens/build-tokens.mjs    # cada valor sale de tokens/finance-os.tokens.json
```

Las cifras de contraste que aparecen en estos documentos están **medidas**, no estimadas, y
se regeneran con el auditor. Seis pares fallaron la primera pasada y se corrigieron; el
registro está en [`../qa/contrast/REPORT.md`](../qa/contrast/REPORT.md) y en
[CHANGELOG.md](CHANGELOG.md).
