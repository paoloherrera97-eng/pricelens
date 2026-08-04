# Plataforma: Web

**Segunda plataforma.** No existe todavía, y este directorio está aquí para que cuando exista
no invente nada.

---

## La tesis de portabilidad

El Design System se diseñó contra las restricciones de Excel. La consecuencia buscada es
que **la web no necesita rediseño, solo implementación**:

| Decisión tomada por Excel | Lo que regala en web |
| --- | --- |
| Rejilla de 8 px = 6 pt | Rejilla limpia y divisible |
| Retícula de esquina viva | Tablas que no parecen tarjetas |
| Elevación por superficie antes que por sombra | Modo oscuro que funciona sin rehacer nada |
| Nada depende del hover | Táctil resuelto de origen |
| Nada depende solo del color | Accesibilidad de origen |
| Sin animación de cifras | Cero cifras falsas en pantalla |

Al revés no habría funcionado: un sistema diseñado en web con sombras, radios y hover se
queda sin la mitad al llegar a Excel.

## Qué vive aquí (cuando llegue la fase de implementación)

```
web/
├── README.md              ← este archivo
├── components/            Implementación de los componentes 12–20
├── patterns/              Implementación de los patrones 21–30
└── styles/                Capa base sobre tokens/build/finance-os.css
```

## El contrato con el Design System

**Se importa `../../tokens/build/finance-os.css` y no se define ni un valor más.**

```css
@import '../../tokens/build/finance-os.css';

.fos-button--primary {
  background: var(--fos-accent);
  color: var(--fos-text-on-accent);
  border-radius: var(--fos-radius-md);
  height: 2.25rem;
  padding-inline: var(--fos-space-4);
  transition: background var(--fos-duration-fast) var(--fos-ease-standard);
}
```

Un valor literal en una hoja de estilos de componente es un error de revisión, no una
preferencia. Ver
[04 · Principios UI § 2](../../design-system/foundations/04-principios-ui.md#2-todo-medida-es-un-token).

## Requisitos no negociables de la implementación

1. **Cifras tabulares explícitas.** En web hay que pedirlas; olvidarlo es el fallo más
   frecuente y destruye la comparabilidad de las columnas:
   ```css
   font-variant-numeric: tabular-nums lining-nums slashed-zero;
   ```
2. **Elementos nativos.** `<button>`, `<table>`, `<label for>`, `<select>`. Un `<div>` con
   `onClick` no es un botón.
3. **Modo oscuro por remapeo de tokens**, nunca variantes `dark:` por elemento.
4. **`prefers-reduced-motion` en la capa de tokens**, no componente a componente.
5. **El estado vive en la URL**: área, sección, periodo, entidad, moneda y filtros. Es lo que
   permite compartir una vista por correo, que es cómo trabaja un equipo financiero.
6. **Hoja de estilos de impresión**: sin sombras, sin fondos teñidos, encabezados de tabla
   repetidos, procedencia y marca de tiempo visibles.
7. **Anillo de foco sin transición.** 0 ms, siempre.
8. **El texto de dato nunca baja de 14 px** en ningún tamaño de pantalla.

## Comprobación de paridad

Antes de dar por buena una pantalla web, comparar con su equivalente en Excel:

- [ ] ¿Los mismos decimales en las dos plataformas? (redondear distinto produce cifras
      contradictorias entre dispositivos y entre plataformas)
- [ ] ¿La misma jerarquía de tamaños?
- [ ] ¿El mismo orden de columnas?
- [ ] ¿Los mismos colores de polaridad?
- [ ] ¿El mismo texto en etiquetas y estados vacíos?

La primera es la que más silenciosamente rompe la confianza: dos personas mirando el mismo
dato en dos plataformas y viendo números distintos.
