# ADR-0000 · Plantilla

> Copiar a `ADR-NNNN-<asunto>.md` con el siguiente número libre. **No editar este archivo.**

---

**Estado:** propuesto · aceptado · rechazado · sustituido por ADR-NNNN
**Fecha:** AAAA-MM-DD
**Afecta a:** Design System · Tokens · Excel · Web · Línea Base

## Contexto

Qué situación obliga a decidir. Hechos, no opiniones. Si hay cifras, van aquí.

## Decisión

Qué se decide, en presente y en una frase. "Usamos X" — no "deberíamos considerar X".

## Alternativas consideradas

| Alternativa | Por qué no |
| ----------- | ---------- |
|             |            |

Una decisión sin alternativas descartadas no es una decisión: es un valor por defecto que
nadie revisó.

## Consecuencias

**Positivas**

-

**Negativas** — se escriben. Toda decisión tiene coste; el ADR que no lo dice está incompleto.

-

**Qué obliga a cambiar**

- Tokens:
- Documentación:
- Implementación:

## Verificación

Cómo se comprueba que la decisión se aplicó (comando, medición, lista de verificación).

---

## Cuándo hace falta un ADR

| Situación                                      |                            ADR                            |
| ---------------------------------------------- | :-------------------------------------------------------: |
| Cambiar el valor de un token existente         |                          **Sí**                           |
| Añadir un token nuevo                          |                  No — basta el CHANGELOG                  |
| Añadir un componente                           |                            No                             |
| Eliminar o renombrar un componente             |                          **Sí**                           |
| Cambiar un principio UX o UI                   |                          **Sí**                           |
| Enmendar la Línea Base Oficial                 | **Sí**, y con los cuatro pasos de `../baseline/README.md` |
| Cambiar la convención de polaridad por defecto |                          **Sí**                           |
| Corregir una errata                            |                            No                             |

## Enmendar la Línea Base

La Línea Base está congelada. El único camino es:

```
1. ADR en estado "propuesto"
2. Revisión y aprobación explícita
3. Estado "aceptado" + fecha
4. Solo entonces cambia el archivo de baseline/, citando el ADR
```

Sin los cuatro pasos, la Línea Base no cambió.
