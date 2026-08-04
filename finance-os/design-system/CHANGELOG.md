# Design System — registro de cambios

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) ·
Versionado: [SemVer](https://semver.org/lang/es/) aplicado al sistema de diseño.

- **MAYOR** — cambia el valor de un token existente, o desaparece un componente
- **MENOR** — se añade un token, un componente o una variante
- **PARCHE** — correcciones de documentación sin efecto visual

---

## [1.0.0] — 2026-08-04

Primera versión completa. Los 31 capítulos, tres apéndices, tokens compilados a web y a
Excel, y auditoría de contraste ejecutable.

### Añadido

- **Fundamentos (01–11):** filosofía visual, personalidad de marca, principios UX y UI,
  color, tipografía, espaciado, grid, iconografía, elevación, bordes y radios.
- **Componentes (12–20):** botones, inputs, selectores, tablas, cards, badges, alertas,
  KPIs, gráficos.
- **Patrones (21–30):** dashboard, navegación, sidebar, header, footer, modales, menús,
  estados vacíos, loading, skeletons.
- **Plataforma (31):** responsive mindset, con los cuatro contextos de salida de Excel.
- **Apéndices:** movimiento, accesibilidad, glosario.
- **Tokens:** fuente única en `tokens/finance-os.tokens.json`, compilada a
  `build/finance-os.css` y `build/finance-os.excel.json`.
- **Auditoría:** `qa/contrast/audit.mjs`, que falla con código 1 si algún par obligatorio
  incumple WCAG 2.2 AA.

### Corregido durante el diseño

La auditoría de contraste encontró **seis pares por debajo del umbral** en la primera
medición. Los cuatro tokens implicados se corrigieron antes de publicar. Se dejan
registrados porque los cuatro colores originales **se veían bien**, y esa es la razón por la
que el auditor existe.

| Token                              | Antes           | Después         | Par que fallaba          | Antes → después     |
| ---------------------------------- | --------------- | --------------- | ------------------------ | ------------------- |
| `graphite.500` (texto terciario)   | `#6E7889`       | `#636C7A`       | sobre `surface`          | 4,46:1 → **5,31:1** |
|                                    |                 |                 | sobre `surface-sunken`   | 3,90:1 → **4,64:1** |
| `jade.600` (texto positivo)        | `#15804A`       | `#127543`       | sobre `surface-positive` | 4,47:1 → **5,17:1** |
| `amber` (texto de aviso)           | `500` `#B7791F` | `600` `#8F5B12` | sobre `surface`          | 3,64:1 → **5,72:1** |
|                                    |                 |                 | sobre `surface-warning`  | 3,34:1 → **5,24:1** |
| `graphite.450` (límite de control) | `#838D9D`       | `#7C8695`       | sobre `surface-sunken`   | 2,93:1 → **3,22:1** |

Además, en modo oscuro: `accent-hover` pasó de `indigo.400` `#6480E6` a un paso nuevo,
`indigo.450` `#4A68DF`. El original dejaba el texto blanco del botón primario en 3,64:1. El
paso nuevo lo devuelve a **4,84:1** conservando el aclarado en hover, que es lo que se lee
como "elevado" sobre una superficie oscura.

### Validado

- **Contraste:** 25 pares medidos por modo. Informe completo en
  [`qa/contrast/REPORT.md`](../qa/contrast/REPORT.md).
- **Paleta categórica:** 8 series validadas bajo simulación de protanopia y deuteranopia
  (Machado-Oliveira-Fernandes 2009, severidad 1.0). Peor par adyacente ΔE **11,7** en claro
  y **11,0** en oscuro, sobre un objetivo de 8. Suelo de visión normal: **17,1** y **16,8**,
  sobre un mínimo de 15.
- **Rejilla:** la escala de 8 px convierte a múltiplos exactos de 6 pt, sin decimales en
  ningún paso.

### Decisiones estructurales de esta versión

1. **Modo claro canónico; oscuro solo en web.** Excel mantiene el lienzo blanco en la
   mayoría de configuraciones, todo se imprime, y los rellenos oscuros se corrompen al
   copiar entre libros con temas distintos.
2. **Acento azul, no verde.** El verde está ocupado por la polaridad financiera, y el eje
   azul es el único que sobrevive intacto a la protanopia y la deuteranopia.
3. **La polaridad es un token remapeable**, no una constante: los mercados de Asia Oriental
   invierten la convención de color.
4. **Base de 8 px** elegida por su conversión exacta a puntos de Excel.
5. **Sin ilustraciones en los estados vacíos.** Ocupan el espacio del dato, no informan y
   fechan el producto.

---

## No publicado

Nada pendiente. La siguiente entrada corresponderá a la fase de wireframes, que consumirá
este sistema sin modificarlo — y si lo modifica, la modificación entra aquí primero.
