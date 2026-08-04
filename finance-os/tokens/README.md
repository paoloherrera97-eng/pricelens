# Tokens

**Fuente única de verdad de todos los valores del sistema.**

Un hex, un tamaño, una duración o un radio se define **una vez** aquí y se compila hacia cada
plataforma. La documentación de `../design-system/` explica _por qué_ cada valor es ese; no lo
redefine.

Cuando la documentación y estos archivos no coinciden, **ganan los tokens**.

---

## Archivos

| Archivo                       | Qué es                                                         |
| ----------------------------- | -------------------------------------------------------------- |
| `finance-os.tokens.json`      | **La fuente.** Lo único que se edita a mano                    |
| `build-tokens.mjs`            | Compilador. Sin dependencias                                   |
| `build/finance-os.css`        | Generado — variables CSS para la web (claro + oscuro)          |
| `build/finance-os.excel.json` | Generado — tema de Office, estilos de celda, alturas en puntos |

```bash
node finance-os/tokens/build-tokens.mjs
```

Nada de `build/` se edita a mano: se regenera en cada compilación.

## Las tres capas

```
primitive   →   semantic   →   component
```

| Capa              | Ejemplo                             | Regla                                                           |
| ----------------- | ----------------------------------- | --------------------------------------------------------------- |
| **Primitiva**     | `indigo.500` = `#3B5BDB`            | Valor crudo, sin significado. **Nunca se usa en un componente** |
| **Semántica**     | `accent` → `{primitive.indigo.500}` | Describe un papel. Resuelve distinto en claro y oscuro          |
| **De componente** | El botón primario usa `accent`      | Siempre apunta a la capa semántica                              |

Esta separación es lo que convierte el modo oscuro en un cambio de paleta en lugar de una
variante por elemento, y lo que permite remapear la
[polaridad](../design-system/foundations/05-color.md#52-la-convención-es-un-token-no-una-constante)
para mercados de Asia Oriental sin tocar un solo componente.

## Convención de nombres

```
<categoría>-<papel>-<variante>

surface-sunken        superficie · hundida
text-secondary        texto · nivel 2
border-strong         borde · fuerte (el único que identifica un control)
accent-hover          acento · estado hover
```

Sin nombres de color en la capa semántica. `text-negative`, nunca `text-red`: el rojo puede
dejar de ser rojo (ver polaridad), pero "negativo" siempre significa lo mismo.

## Añadir un token

1. Comprobar que no existe ya uno que sirva. **Casi siempre existe.**
2. Añadirlo a `finance-os.tokens.json` con su `$description` si no es obvio.
3. Ejecutar `node finance-os/tokens/build-tokens.mjs`.
4. Ejecutar `node finance-os/qa/contrast/audit.mjs`. Si es un color de texto o de borde,
   **añadir su par a `PAIRS` en el auditor**. Un color que no se mide no está verificado.
5. Documentar la decisión en el capítulo correspondiente de `../design-system/`.
6. Registrar el cambio en `../design-system/CHANGELOG.md`.

Los seis pasos, en ese orden. Saltarse el cuarto es como se cuelan los fallos de contraste.

## Cambiar un token existente

Es un cambio **MAYOR**: afecta a todo lo ya construido. Requiere un ADR en
[`../decisions/`](../decisions/) antes de tocar el archivo.

## Por qué el compilador no tiene dependencias

Node y nada más. Un sistema de diseño cuyo verificador se rompe cuando caduca un lockfile
deja de verificarse, y un verificador que no se ejecuta es peor que no tenerlo: da la
sensación de que algo está comprobado cuando no lo está.
