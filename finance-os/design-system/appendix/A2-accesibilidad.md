# A2 · Accesibilidad

> Compromiso: **WCAG 2.2 nivel AA**, verificado y no supuesto.

---

## 1. Por qué no es opcional aquí

Un sistema financiero se usa en entornos donde la accesibilidad deja de ser una cuestión de
minorías:

- **~8 % de los hombres** tienen alguna deficiencia en la visión del color. En un equipo
  financiero de 12 personas, es probable que haya una.
- La **presbicia** afecta a prácticamente todo el mundo a partir de los 45, que es la franja
  de edad de quien decide.
- El **contraste real de una sala de reuniones** con un proyector es mucho peor que el de un
  monitor calibrado.
- En muchos países, el software de gestión usado por administraciones públicas y sus
  proveedores está sujeto a requisitos legales de accesibilidad.

Un dato que no se puede leer no es un dato.

## 2. Los cinco compromisos

### 2.1 Contraste medido, no estimado

Todo par de colores del sistema está medido con
[`qa/contrast/audit.mjs`](../../qa/contrast/audit.mjs). El auditor falla con código 1 si algún
par obligatorio incumple, lo que lo hace utilizable en integración continua.

| Umbral | Aplicación |
| ---: | --- |
| 4,5:1 | Texto normal (SC 1.4.3) |
| 3,0:1 | Texto grande, límites de control y componentes no textuales (SC 1.4.11) |
| Exento | Texto deshabilitado, divisores decorativos |

**Seis pares fallaron la primera medición.** Los cuatro tokens implicados se corrigieron; el
registro está en [CHANGELOG.md](../CHANGELOG.md). Los cuatro se veían bien: por eso se mide.

### 2.2 El color nunca va solo

Toda información codificada en color lleva **al menos una** codificación adicional:

| Información | Codificaciones |
| --- | --- |
| Polaridad de una variación | Color + signo aritmético + cursor ▲▼— |
| Estado en un badge | Color + texto |
| Nivel de una alerta | Color + icono + título |
| Elemento activo de navegación | Color + barra lateral + peso tipográfico |
| Serie de un gráfico | Color + leyenda + etiqueta directa |
| Celda en error | Color + icono + mensaje |

Verificación práctica: **la prueba de la fotocopia**. Impreso en blanco y negro, no se pierde
ninguna información.

### 2.3 Teclado completo

- Todo lo alcanzable con ratón lo es con teclado.
- Orden de tabulación = orden visual.
- Foco visible siempre, 2 px, sin transición.
- Foco atrapado en los modales, y devuelto al disparador al cerrar.
- `Esc` cierra cualquier capa superpuesta.
- Enlace "Saltar al contenido" como primer elemento enfocable.
- Navegación por celdas con la gramática de Excel (flechas, `Enter`, `F2`).
- **Sin trampas de foco** fuera de los modales (SC 2.1.2).

### 2.4 Estructura semántica

- Un `<h1>` por página; jerarquía de encabezados sin saltos.
- `<table>` real con `<th scope>` y `<caption>`.
- `<button>` para acciones, `<a>` para navegación. Nunca un `<div>` con `onClick`.
- Landmarks: `<nav>`, `<main>`, `<header>`, `<footer>`, con `aria-label` cuando se repiten.
- Formularios con `<label for>` real y errores asociados por `aria-describedby`.

### 2.5 Sin dependencias sensoriales

- Ninguna información existe **solo** en hover (SC 1.4.13, y la
  [regla 9 de UI](../foundations/04-principios-ui.md#9-optimizar-el-estado-en-reposo)).
- Ninguna información existe solo en un tooltip.
- Nada parpadea entre 2 y 55 Hz (SC 2.3.1).
- `prefers-reduced-motion` respetado en la capa de tokens.
- Zoom al 200 % sin pérdida de contenido (SC 1.4.4); espaciado de texto ajustable
  (SC 1.4.12).

## 3. Criterios nuevos de la WCAG 2.2

Los que afectan directamente a este sistema:

| Criterio | Cómo se cumple |
| --- | --- |
| **2.4.11 Foco no oculto (mínimo)** | El header fijo y la fila de totales fija no tapan el elemento enfocado: hay `scroll-margin` reservado |
| **2.5.7 Movimientos de arrastre** | Reordenar columnas y filas tiene siempre alternativa por menú |
| **2.5.8 Tamaño del objetivo (mínimo)** | 24 × 24 px como mínimo absoluto; el diseño usa 36 px o más |
| **3.2.6 Ayuda consistente** | El acceso a la ayuda está en el mismo sitio en todas las pantallas |
| **3.3.7 Entrada redundante** | Los datos ya introducidos se ofrecen precargados, no se piden dos veces |
| **3.3.8 Autenticación accesible** | Sin puzles cognitivos; se admite pegar la contraseña y el gestor de credenciales |

**2.4.11 es el que más se rompe** en productos con encabezado fijo: al tabular, el elemento
enfocado queda debajo de la barra. Con `scroll-margin-top` igual al alto del header
comprimido, no pasa.

## 4. Verificación

```bash
# Contraste — falla con código 1 si algún par incumple
node finance-os/qa/contrast/audit.mjs
```

Manual, por pantalla, antes de darla por terminada:

- [ ] Recorrerla entera solo con teclado
- [ ] Verla al 200 % de zoom
- [ ] Imprimirla en blanco y negro
- [ ] Simular deuteranopia y protanopia
- [ ] Recorrerla con lector de pantalla (NVDA en Windows, VoiceOver en macOS)
- [ ] Comprobar que ninguna información aparece solo al pasar el ratón

Lista completa en [`qa/checklists/`](../../qa/checklists/).

## 5. Excel

Excel tiene sus propias reglas de accesibilidad, y algunas no tienen equivalente en web:

| Requisito | Cómo |
| --- | --- |
| **Nombres de hoja descriptivos** | `Dashboard`, no `Hoja1` |
| **Texto alternativo en formas y gráficos** | Clic derecho → Ver texto alternativo. Obligatorio en todos |
| **Rangos con nombre** | Permiten navegar por el Cuadro de nombres sin ver la pantalla |
| **Sin celdas combinadas** | Rompen la navegación con lector de pantalla — y también el filtrado |
| **Encabezados de tabla reales** | Tabla de Excel (Ctrl+T) con "La tabla tiene encabezados" marcado |
| **Orden de tabulación** | Definido por el orden de desbloqueo de celdas en la hoja protegida |
| **Comprobador de accesibilidad** | Revisar → Comprobar accesibilidad. **Cero errores antes de publicar** |
| **Sin información solo por color** | Igual que en web: siempre con texto o símbolo |

La coincidencia entre "prohibido combinar celdas" por accesibilidad y por
[funcionamiento](../foundations/07-espaciado.md#7-excel--concreto) no es casual: en Excel, casi
todas las decisiones que rompen la accesibilidad rompen también el filtrado, el ordenamiento y
el copiado. La regla accesible es casi siempre la regla robusta.

---

**Anterior:** [A1 · Movimiento](A1-movimiento.md) · **Siguiente:** [A3 · Glosario](A3-glosario.md)
