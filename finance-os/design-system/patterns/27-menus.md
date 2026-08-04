# 27 · Menús

> Donde vive lo que se usa poco pero tiene que existir.

---

## 1. Tipos

| Tipo                   | Disparador                            | Uso                                  |
| ---------------------- | ------------------------------------- | ------------------------------------ |
| **De acciones** (`⋯`)  | Botón terciario con `more-horizontal` | Acciones secundarias de un objeto    |
| **Desplegable**        | Botón con `chevron-down`              | Elegir entre variantes de una acción |
| **Contextual**         | Clic derecho                          | Atajos sobre una fila o celda        |
| **Paleta de comandos** | `Cmd/Ctrl + K`                        | Todo el producto                     |

## 2. Anatomía

```
┌────────────────────────────────┐
│  Ver detalle              ⏎    │   32px por elemento
│  Duplicar               ⌘D     │
│  Exportar a Excel              │
│ ─────────────────────────────  │   separador: border-subtle, 4px arriba y abajo
│  Cerrar periodo                │
│ ─────────────────────────────  │
│  Eliminar                      │   text-negative
└────────────────────────────────┘
   ancho mínimo 200 · máximo 320 · radio 8 · elevación 2 · padding vertical 4
```

| Propiedad          | Valor                                          |
| ------------------ | ---------------------------------------------- |
| Alto de elemento   | 32 px                                          |
| Padding horizontal | 12 px                                          |
| Tipografía         | `body` 14 px                                   |
| Icono              | 16 px, `text-secondary`, a 8 px del texto      |
| Atajo              | `caption` 12 px, `text-tertiary`, a la derecha |
| Radio              | `radius-lg` 8 px                               |
| Elevación          | Nivel 2                                        |

## 3. Reglas

1. **Máximo 8 elementos.** Por encima, hace falta submenú o una página de configuración. Un
   menú de 15 líneas se lee peor que una barra de herramientas.
2. **Un nivel de submenú como mucho**, y solo si es imprescindible. Los submenús son difíciles
   de acertar con el ratón y peores con el teclado.
3. **Agrupado por consecuencia**, separado con filetes:
   `ver → modificar → exportar → destructivo`.
4. **Lo destructivo va abajo del todo**, siempre, en `text-negative`, tras un separador.
   Nunca es el primer elemento ni queda pegado a otro.
5. **Los atajos se muestran.** Es donde el usuario los aprende — un menú sin atajos condena
   al usuario a usar el menú para siempre.
6. **Sin iconos, salvo que aporten.** Un icono por línea convierte el menú en una lista de
   pictogramas y frena la lectura.
7. **Se cierra al elegir.** Salvo en menús de alternancia (mostrar/ocultar columnas), que
   permanecen abiertos: elegir columnas de una en una reabriendo el menú es tortura.

## 4. Colocación

- Anclado al disparador, **alineado por el borde más cercano**.
- Se voltea automáticamente si no cabe (abajo → arriba, derecha → izquierda).
- 4 px de separación con el disparador.
- **Nunca tapa a su propio disparador**: hay que poder ver qué se abrió.
- Si no cabe en ninguna orientación (móvil), pasa a hoja inferior (_bottom sheet_).

## 5. Paleta de comandos

La herramienta de navegación del usuario experto, y merece sus propias reglas:

```
Cmd/Ctrl + K
┌──────────────────────────────────────────┐
│ 🔍 Buscar o ejecutar…                    │   input 44px
├──────────────────────────────────────────┤
│ IR A                                     │   overline
│   Dashboard                       G D    │
│   Ingresos                        ⌘2     │
│ ACCIONES                                 │
│   Exportar vista actual                  │
│   Cambiar periodo                        │
│ RECIENTES                                │
│   Factura F-2025-1284                    │
└──────────────────────────────────────────┘
   560px · radio 12 · elevación 3
```

- Busca **a la vez** en navegación, acciones y registros. Un solo campo para todo.
- Los resultados se agrupan por tipo, con el grupo más probable arriba.
- Coincidencia difusa por subcadena; la parte coincidente en `body-strong`.
- Muestra el atajo de cada acción: la paleta también enseña.
- `↑↓` navega, `Enter` ejecuta, `Esc` cierra.
- **Sin resultados:** una línea de texto, no un estado vacío ilustrado.

## 6. Accesibilidad

- `role="menu"` con `role="menuitem"`; para acciones no navegables, no `<a>`.
- Teclado completo: `↑↓` mueve, `Enter` ejecuta, `Esc` cierra y devuelve el foco al
  disparador, `Home`/`End` van a los extremos, escribir una letra salta al elemento.
- `aria-expanded` y `aria-haspopup` en el disparador.
- El foco entra en el primer elemento al abrir con teclado, y no entra al abrir con ratón.
- Menú contextual: siempre existe una ruta equivalente con teclado. Una acción que solo se
  alcanza con clic derecho es una acción que no existe para parte de los usuarios.

## 7. Excel

| Componente             | Implementación                                                                 |
| ---------------------- | ------------------------------------------------------------------------------ |
| **Menú de acciones**   | Forma `⋯` con macro que muestra un menú emergente construido con `CommandBars` |
| **Desplegable**        | Validación de datos, o control _Cuadro combinado_                              |
| **Menú contextual**    | Personalizable por VBA (`Application.CommandBars("Cell")`)                     |
| **Paleta de comandos** | No existe. **Se sustituye por la cinta**                                       |

La decisión importante: **en Excel no se reinventa el menú, se usa la cinta.**

```
Pestaña personalizada "Finance OS" (Ribbon XML / Personalizar cinta de opciones):
  Grupo "Datos":       Actualizar · Importar · Conciliar
  Grupo "Análisis":    Comparar periodos · Escenario · Desviaciones
  Grupo "Informes":    Exportar PDF · Enviar · Imprimir
  Grupo "Modelo":      Comprobar cuadre · Recalcular · Auditar fórmulas
Iconos:  PNG 32 px (grande) y 16 px (pequeño), exportados de Lucide
Etiquetas: Frase capital, verbo en infinitivo — igual que en la web
```

Razones para usar la cinta y no menús propios:

1. El usuario de Excel **ya sabe** dónde está la cinta. Es la superficie de acción del
   programa.
2. Los menús flotantes construidos con `CommandBars` están obsoletos, se comportan distinto
   en Mac y desaparecen sin previo aviso entre versiones.
3. La cinta es accesible por teclado de forma nativa (`Alt` + teclas de acceso) sin escribir
   una línea de código.

El menú contextual de celda **sí** se extiende: es donde el usuario de Excel busca las
acciones sobre una fila, y añadir ahí "Ver detalle" o "Ir al asiento" es de las
personalizaciones más rentables del producto.

---

**Anterior:** [26 · Modales](26-modales.md) ·
**Siguiente:** [28 · Estados vacíos](28-estados-vacios.md)
