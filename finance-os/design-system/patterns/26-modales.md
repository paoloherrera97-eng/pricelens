# 26 · Modales

> Un modal detiene el trabajo. El presupuesto de interrupción es pequeño y hay que gastarlo
> con criterio.

---

## 1. Cuándo — y cuándo no

**Solo tres casos justifican un modal:**

1. **Acción destructiva o irreversible** que necesita confirmación consciente.
2. **Tarea corta que exige toda la atención** y no puede convivir con la pantalla de fondo.
3. **Error que bloquea** el trabajo y hay que resolver para continuar.

Para todo lo demás:

| Necesidad | Componente |
| --- | --- |
| Ver detalle sin perder el sitio | **Panel lateral** |
| Editar un registro | Panel lateral, o edición en línea |
| Elegir entre opciones | [Menú](27-menus.md) o [select](../components/14-selectores.md) |
| Información complementaria | Popover |
| Confirmar algo reversible | **Nada** — se hace y se ofrece deshacer |

La última merece énfasis: **confirmar acciones reversibles entrena a confirmar sin leer**, y
con ello anula el diálogo de la acción que sí era irreversible. Un "¿Seguro?" gratuito hoy es
un asiento eliminado sin querer dentro de seis meses.

## 2. Anatomía

```
        ╔══════════════════════════════════════════╗
        ║  Eliminar 1.284 asientos            [×]  ║  ← h3 20/600
        ╟──────────────────────────────────────────╢
        ║                                          ║
        ║  Se eliminarán 1.284 asientos del        ║  ← body 14
        ║  periodo Julio 2025 por un importe       ║
        ║  total de 284.392,00 €.                  ║
        ║                                          ║
        ║  Esta acción no se puede deshacer.       ║  ← body-strong
        ║                                          ║
        ╟──────────────────────────────────────────╢
        ║                  [Cancelar]  [Eliminar]  ║
        ╚══════════════════════════════════════════╝
   fondo surface · radio 12 · elevación 3 · velo overlay 32 %
```

| Propiedad | Valor |
| --- | --- |
| Anchos | 400 px (confirmación) · 560 px (formulario) · 800 px (tarea) |
| Radio | `radius-xl` 12 px |
| Elevación | Nivel 3 |
| Velo | `overlay` — `rgb(21 26 33 / 0.32)` |
| Padding | 24 px |
| Posición | Centrado horizontal · 15 % del alto desde arriba |
| Alto máximo | 80 % de la ventana; el cuerpo se desplaza, cabecera y pie no |

Posición al 15 % y no centrado vertical: un modal centrado en una pantalla alta queda
demasiado abajo y la vista tiene que buscarlo.

## 3. Confirmación destructiva

El caso más importante del producto. Reglas:

1. **El título nombra la acción y su alcance:** "Eliminar 1.284 asientos". No "¿Estás
   seguro?" — esa pregunta no aporta ningún dato para decidir.
2. **El cuerpo cuantifica las consecuencias:** cuántos registros, qué periodo, qué importe.
   El usuario decide con cifras, no con adjetivos.
3. **El botón dice el verbo**, no "Aceptar": "Eliminar", "Cerrar periodo", "Revertir asiento".
4. **La acción destructiva es el botón relleno rojo aquí** —y solo aquí—, porque el usuario
   ya declaró su intención al abrir el diálogo. En la barra de herramientas era de contorno
   (ver [12 · Botones § 5](../components/12-botones.md#destructivo)).
5. **Cancelar a la izquierda, acción a la derecha.** Cancelar es un botón secundario, nunca
   un enlace de texto: hacerlo más difícil de pulsar que la acción destructiva es
   exactamente el error contrario al que hay que evitar.
6. **El foco inicial va en Cancelar.** `Enter` no puede desencadenar una eliminación.
7. **Para lo catastrófico, confirmación escrita:** teclear el nombre del periodo para
   cerrarlo. Reservado a lo verdaderamente irreversible; usado de más, se convierte en un
   trámite mecánico.

## 4. Comportamiento

| Aspecto | Regla |
| --- | --- |
| Apertura | 180 ms: fundido del velo + escala 0,98 → 1 del panel |
| Cierre | 120 ms, sin escala |
| `Esc` | Cierra siempre, salvo si hay cambios sin guardar (entonces pregunta) |
| Clic en el velo | Cierra, salvo en formularios con cambios |
| Foco | **Atrapado** dentro del modal mientras esté abierto |
| Al cerrar | El foco vuelve al elemento que lo abrió |
| Desplazamiento de fondo | Bloqueado |
| Modal sobre modal | **Prohibido.** Si hace falta, la tarea es una página |

## 5. Panel lateral

La alternativa por defecto, y la que más se va a usar:

```
Ancho:      400 px (detalle) · 560 px (edición) · 720 px (tarea compleja)
Posición:   Anclado a la derecha, alto completo
Elevación:  Nivel 3
Velo:       Solo si es modal. Un panel de detalle NO lleva velo
Entrada:    180 ms desde la derecha
Cierre:     Esc, botón ×, o clic fuera
```

**El panel de detalle no lleva velo** y no bloquea el fondo: el usuario puede seguir viendo
la tabla y hacer clic en otra fila, que el panel actualiza. Es exactamente el patrón que
necesita revisar 40 asientos seguidos, y con un modal sería 40 aperturas y 40 cierres.

## 6. Accesibilidad

- `role="dialog"` + `aria-modal="true"` + `aria-labelledby` apuntando al título.
- Foco atrapado; `Tab` circula dentro y no se escapa al fondo.
- Al cerrar, el foco vuelve **al disparador**, no al `<body>`.
- El fondo queda `aria-hidden` mientras el modal esté abierto.
- El velo por sí solo no es una señal accesible: el modal siempre tiene título y borde.

## 7. Excel

Excel tiene tres mecanismos, en orden de preferencia:

| Mecanismo | Cuándo | Nota |
| --- | --- | --- |
| **Mensaje de validación de datos** | Prevenir una entrada errónea | Nativo, sin macro. **Primera opción** |
| **`MsgBox` de VBA** | Confirmar una acción destructiva | Nativo, accesible, con teclado |
| **UserForm** | Tarea con varios campos | Última opción: hay que diseñarlo entero |

```
Confirmación destructiva (VBA):
  MsgBox "Se eliminarán 1.284 asientos del periodo Julio 2025" & vbCrLf & _
         "por un importe total de 284.392,00 €." & vbCrLf & vbCrLf & _
         "Esta acción no se puede deshacer.", _
         vbExclamation + vbYesNo + vbDefaultButton2, _
         "Eliminar asientos"

  vbDefaultButton2  ← el botón por defecto es "No". Innegociable.
```

`vbDefaultButton2` es la traducción literal de la regla 6: en Excel, `Enter` es el gesto más
frecuente que existe, y un `MsgBox` cuyo botón por defecto sea "Sí" borrará datos por
accidente.

Sobre los **UserForm**: se evitan salvo necesidad real. No heredan el tema del libro, hay que
recolorearlos a mano token por token, no escalan con el dpi del sistema y no se comportan
bien en Excel para Mac. Cuando no queda otra:

```
BackColor:  &HFFFFFF (surface) · Fuente Aptos 11 pt · ForeColor &H211A15 (BGR de 151A21)
Botones:    Alto 27 pt · primario relleno 3B5BDB con texto blanco
Cancelar:   Cancel = True (responde a Esc) · Default = False
```

Nota técnica: VBA usa **BGR**, no RGB. `#151A21` se escribe `&H211A15`. Es la fuente número
uno de colores equivocados en formularios de Excel.

---

**Anterior:** [25 · Footer](25-footer.md) · **Siguiente:** [27 · Menús](27-menus.md)
