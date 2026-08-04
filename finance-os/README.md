# Finance OS

> Sistema financiero profesional. Primera plataforma: **Microsoft Excel**. Segunda plataforma:
> aplicación web. Un solo diseño para las dos.

Este directorio contiene **todo** el trabajo de Finance OS. Está separado del resto del
repositorio a propósito: PriceLens y Finance OS son productos distintos y no comparten
código, tokens ni decisiones.

---

## Mapa del proyecto

```
finance-os/
├── baseline/           Línea Base Oficial — CONGELADA. Solo lectura.
├── product/            Qué es el producto y para quién. Precede al diseño.
├── decisions/          ADRs: decisiones con fecha, contexto y consecuencias.
├── design-system/      ← EL ENTREGABLE ACTUAL. La única referencia visual.
│   ├── foundations/    01–11  Lo que no se ve pero decide todo.
│   ├── components/     12–20  Las piezas.
│   ├── patterns/       21–30  Cómo se combinan las piezas.
│   ├── platform/       31     Comportamiento entre tamaños y plataformas.
│   └── appendix/       Movimiento, accesibilidad, glosario.
├── tokens/             Fuente única de valores + compilador a CSS y a Excel.
│   └── build/          GENERADO. No editar a mano.
├── platforms/
│   ├── excel/          Cómo se materializa el sistema en un libro de Excel.
│   └── web/            Cómo se materializa el sistema en la web futura.
├── assets/             Marca e iconografía exportadas.
└── qa/                 Auditorías ejecutables y listas de verificación.
```

## La regla que ordena todo

**Los valores viven en `tokens/`. Las razones viven en `design-system/`.**

Un hex, un tamaño o una duración se define **una vez** en
`tokens/finance-os.tokens.json` y se compila hacia cada plataforma. La documentación
explica _por qué_ ese valor es ese y no otro, y cita el token — nunca lo redefine.

Cuando la documentación y los tokens no coinciden, **ganan los tokens** y la
documentación está en falta.

## Comandos

```bash
# Recompilar CSS y el mapa de Excel desde los tokens
node finance-os/tokens/build-tokens.mjs

# Auditar contraste (falla con código 1 si algún par incumple WCAG)
node finance-os/qa/contrast/audit.mjs
node finance-os/qa/contrast/audit.mjs --write   # además regenera qa/contrast/REPORT.md
```

Ninguno de los dos necesita dependencias: Node y nada más. Es deliberado — un sistema de
diseño cuyo verificador se rompe cuando caduca un lockfile deja de verificarse.

## Estado

| Área           | Estado                        |
| -------------- | ----------------------------- |
| Línea Base     | Congelada                     |
| Design System  | **v1.0 — completo**           |
| Tokens         | v1.0 — compilados y auditados |
| Wireframes     | No iniciado (siguiente fase)  |
| Implementación | No iniciado                   |

## Qué NO hay aquí todavía

Por decisión explícita: no hay wireframes, no hay pantallas, no hay plantillas de Excel y
no hay código de aplicación. El Design System se cierra antes de dibujar la primera
pantalla, para que ninguna pantalla invente su propio criterio.
