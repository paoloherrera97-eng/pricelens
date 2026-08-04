# 03 · Principios UX

> Diez principios. Cada uno con su consecuencia obligatoria, para que sea verificable y no
> un cartel motivacional.

---

## 1. La confianza es la funcionalidad principal

Un sistema financiero en el que no se confía no se usa, por muchas funciones que tenga. La
confianza se construye en detalles pequeños y se destruye en uno solo.

**Obligatorio:** toda vista muestra la **procedencia y la frescura** del dato (origen +
marca de tiempo, en el pie — ver [25 · Footer](../patterns/25-footer.md)). Un dato sin
procedencia visible es un defecto, no una simplificación.

## 2. Nunca sorprender con dinero

El usuario debe poder predecir el resultado de cada acción antes de ejecutarla.

**Obligatorio:** toda acción irreversible declara su alcance **en cifras** antes de
ejecutarse ("Se eliminarán 1.284 asientos"), y toda acción reversible ofrece deshacer
durante 10 segundos en lugar de pedir confirmación previa.

## 3. Reconocer, no recordar

En sesiones largas con interrupciones, la memoria del usuario no es un recurso disponible.

**Obligatorio:** el contexto completo —periodo, entidad, moneda, filtros activos— es visible
sin desplazarse en toda pantalla de datos. Un filtro activo que no se ve es un filtro que
producirá una decisión equivocada.

## 4. Densidad progresiva

La densidad correcta depende de la tarea, no de la opinión del diseñador. Conciliar 4.000
filas y presentar 8 cifras a un comité son tareas opuestas.

**Obligatorio:** tres densidades (`compact` 28 px · `default` 36 px · `relaxed` 44 px),
elegibles por el usuario y **persistentes entre sesiones**. Es preferencia, no configuración
de administrador.

## 5. El detalle está siempre a un clic

Toda agregación oculta un cálculo, y todo cálculo es cuestionable. Si no se puede descender,
no se puede auditar; si no se puede auditar, no se firma.

**Obligatorio:** toda cifra agregada es interactiva y desciende a su composición. Si una
cifra no puede descender, se marca visualmente como terminal — no se deja adivinar.

## 6. El error se previene en la entrada, no se castiga en la salida

**Obligatorio:** la validación de importes ocurre mientras se escribe (formato, separadores,
signo), no al enviar. El sistema **nunca borra lo que el usuario escribió** para corregirlo:
lo señala y propone.

## 7. El teclado es de primera clase

El usuario de Finance OS viene de Excel. En Excel no se toca el ratón. Obligar a soltarlo es
una regresión de productividad medible.

**Obligatorio:** toda acción frecuente tiene atajo; el orden de tabulación sigue el orden
visual; `Esc` siempre cierra; la navegación por celdas usa flechas y `Enter` como en Excel.
El foco es visible siempre, no solo al navegar con teclado.

## 8. El estado del sistema es siempre visible

**Obligatorio:** cargando, guardando, sincronizando, desconectado y desactualizado tienen
representación visual propia y persistente. El estado "no pasa nada" también es información
y se transmite con silencio, no con un mensaje.

## 9. La interrupción es un coste, no una herramienta

Cada modal detiene el trabajo. El presupuesto de interrupción es pequeño y se gasta con
criterio.

**Obligatorio:** modal solo para (a) acciones destructivas, (b) tareas que requieren toda la
atención, (c) errores que bloquean el trabajo. Todo lo demás es panel lateral, popover o
inline. Ver [26 · Modales](../patterns/26-modales.md).

## 10. Accesible o no está terminado

**Obligatorio:** WCAG 2.2 AA verificado, no supuesto. Contraste medido
([`../../qa/contrast/REPORT.md`](../../qa/contrast/REPORT.md)), navegación completa por
teclado, ningún significado transmitido solo por color, objetivos táctiles ≥ 24 px con
diseño a 44 px.

---

## Cómo se resuelven los conflictos entre principios

Los principios chocan. Cuando eso pasa, este es el orden de prioridad:

```
1. Corrección del dato       (¿es cierto y verificable?)
2. Comprensión               (¿se entiende sin error?)
3. Velocidad de la tarea     (¿cuánto cuesta hacerlo?)
4. Elegancia                 (¿se ve bien?)
```

**Un dato correcto y feo gana siempre a un dato bonito y ambiguo.** Escrito así de crudo
porque en la práctica la tentación es la contraria.

## Antipatrones prohibidos

| Antipatrón                                        | Por qué                                                        |
| ------------------------------------------------- | -------------------------------------------------------------- |
| Números que hacen _count-up_                      | Durante la animación se muestra una cifra falsa                |
| Scroll infinito en tablas financieras             | Impide saber cuántos registros hay: no se puede cuadrar        |
| Colores de estado sin icono ni texto              | Excluye a ~8 % de los usuarios varones                         |
| Tooltip como único portador de información        | No existe en táctil ni al imprimir                             |
| Autoguardado silencioso sin marca de tiempo       | El usuario no sabe qué versión está mirando                    |
| Redondeo variable entre vistas                    | Dos pantallas con cifras distintas destruyen la confianza      |
| Diálogo de confirmación para acciones reversibles | Entrena a confirmar sin leer, y con ello anula el diálogo real |

---

**Anterior:** [02 · Personalidad de marca](02-personalidad-marca.md) ·
**Siguiente:** [04 · Principios UI](04-principios-ui.md)
