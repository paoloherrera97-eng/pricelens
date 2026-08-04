# Línea Base Oficial — CONGELADA

**Estado: congelada. No se modifica.**

## Qué es

La Línea Base Oficial es el acuerdo cerrado sobre el alcance, el modelo funcional y las
reglas de negocio de Finance OS v1.0. Es la referencia contra la que se mide cualquier
entrega posterior.

## Qué significa "congelada"

1. **Ningún entregable posterior puede modificarla.** El Design System, los wireframes y la
   implementación se adaptan a la Línea Base, nunca al revés.
2. **Ningún archivo de este directorio se edita.** Si un documento de aquí necesita cambiar,
   no cambia: se abre un ADR en `../decisions/` que propone la enmienda, y la enmienda solo
   existe cuando está aprobada y fechada.
3. **El silencio no es permiso.** Si el Design System necesita un dato que la Línea Base no
   especifica, se documenta como *supuesto explícito* en el entregable, no como hecho.

## Relación con el Design System v1.0

El Design System de esta fase define **identidad visual y comportamiento de interfaz**. No
define funcionalidad, no define fórmulas y no define el modelo de datos. Donde el Design
System ha tenido que suponer algo sobre el producto para poder decidir un patrón, lo dice
en el propio documento bajo el encabezado *Supuesto*.

Los supuestos de esta fase están recogidos en `../product/README.md` § Supuestos.

## Cómo se enmienda

```
1. ADR en decisions/ADR-NNNN-<asunto>.md, estado "propuesto"
2. Revisión y aprobación explícita
3. Estado "aceptado" + fecha
4. Solo entonces: el archivo de baseline/ cambia, citando el ADR
```

Sin los cuatro pasos, la Línea Base no cambió.
