# Plataforma: Microsoft Excel

**Primera plataforma de Finance OS.** No es un prototipo ni un paso previo: es donde el
producto va a existir primero y donde sus restricciones han moldeado todo el sistema de
diseño.

> Este directorio documenta **cómo se materializa** el Design System en un libro de Excel.
> No contiene plantillas todavía: la implementación es una fase posterior.

---

## Qué vive aquí (cuando llegue la fase de implementación)

```
excel/
├── README.md              ← este archivo
├── theme/                 theme1.xml del tema de Office "Finance OS"
├── styles/                Definición de los estilos de celda con nombre (FOS/*)
├── ribbon/                Ribbon XML de la pestaña "Finance OS"
├── templates/             Plantillas .xltx
└── vba/                   Módulos VBA versionados como texto
```

## El contrato con el Design System

Todo valor sale de [`../../tokens/build/finance-os.excel.json`](../../tokens/build/finance-os.excel.json),
generado desde la fuente única. Ese archivo trae:

- Los 12 huecos del tema de Office ya mapeados (`lt1`, `dk1`, `accent1`…`accent6`, `hlink`)
- Todos los colores semánticos en hex **sin almohadilla**, como los espera `theme1.xml`
- Los tamaños de fuente en puntos
- Las alturas de fila por densidad, en puntos
- Los grosores de borde en puntos

## Las diez reglas de un libro Finance OS

Cada una desarrollada en el capítulo que se cita:

1. **Líneas de división desactivadas** en toda hoja de presentación.
   → [15 · Tablas](../../design-system/components/15-tablas.md#9-excel)
2. **Esqueleto de columnas A–L fijo**, márgenes y canales siempre vacíos.
   → [08 · Grid](../../design-system/foundations/08-grid.md#3-excel-el-esqueleto-de-columnas)
3. **Nunca combinar celdas.** Rompe orden, filtro, selección, copiado y accesibilidad.
   → [07 · Espaciado](../../design-system/foundations/07-espaciado.md#7-excel--concreto)
4. **Aptos 11 pt**, con Calibri de reserva. Ninguna fuente que haya que instalar.
   → [06 · Tipografía](../../design-system/foundations/06-tipografia.md#por-qué-excel-no-lleva-inter)
5. **Solo estilos de celda con nombre** (`FOS/*`). Cero formato directo.
6. **Tablas reales (Ctrl+T)**, nunca rangos con formato bonito.
7. **Inmovilizar paneles** en la primera fila de datos, siempre.
8. **Hoja protegida**; solo las celdas de entrada desbloqueadas.
   → [13 · Inputs](../../design-system/components/13-inputs.md#9-excel)
9. **Control de cuadre visible** en la fila superior de cada hoja de modelo.
   → [18 · Alertas](../../design-system/components/18-alertas.md#7-excel)
10. **Configuración de impresión definida**: A4 apaisado, 1 página de ancho, filas de
    encabezado repetidas. → [31 · Responsive](../../design-system/platform/31-responsive.md#6-el-responsive-de-excel)

## Lo que Excel no tiene, y cómo se resuelve

| Excel no tiene | Solución del sistema | Capítulo |
| --- | --- | --- |
| Sombras en celdas | Elevación por superficie + filete | [10](../../design-system/foundations/10-elevacion.md) |
| Esquinas redondeadas | Retícula de esquina viva en ambas plataformas | [11](../../design-system/foundations/11-bordes-radios.md) |
| Padding | Filas y columnas espaciadoras, y sangría de celda | [07](../../design-system/foundations/07-espaciado.md) |
| Píxeles | Escala de 8 px que convierte a 6 pt exactos | [07](../../design-system/foundations/07-espaciado.md) |
| Estados hover / foco | Controles mayores, más separación, relleno reservado | [12](../../design-system/components/12-botones.md), [13](../../design-system/components/13-inputs.md) |
| Sistema de iconos | PNG exportados del mismo SVG de Lucide | [09](../../design-system/foundations/09-iconografia.md#6-excel) |
| Modo oscuro utilizable | El claro es canónico; el oscuro es solo web | [05](../../design-system/foundations/05-color.md#7-modo-oscuro--y-por-qué-excel-no-lo-tiene) |
| Carga asíncrona | Barra de estado + celda de control | [29](../../design-system/patterns/29-loading.md#6-excel) |
| Skeletons | No se simulan. `—`, nunca `0,00` | [30](../../design-system/patterns/30-skeletons.md#7-excel) |
| Sidebar | Hoja "Inicio" con índice + "‹ Inicio" en B1 | [23](../../design-system/patterns/23-sidebar.md#7-excel) |
| Paleta de comandos | Pestaña propia en la cinta | [27](../../design-system/patterns/27-menus.md#7-excel) |

## Trampas conocidas

Las que más caro salen, recogidas de los capítulos:

- **VBA usa BGR, no RGB.** `#151A21` se escribe `&H211A15`. Fuente número uno de colores
  equivocados.
- **`Application.StatusBar` hay que devolverla a `False`**, o se queda colgada para siempre.
- **`ScreenUpdating = False` sin restaurar** deja Excel aparentemente colgado. Va en un
  manejador de errores.
- **`vbDefaultButton2` en toda confirmación destructiva.** `Enter` es el gesto más frecuente
  en Excel.
- **La validación de datos no impide pegar.** Toda entrada crítica necesita además una
  fórmula de comprobación.
- **Los controles de formulario se desalinean** al ocultar filas o cambiar el zoom. En listas
  largas, columna de validación en su lugar.
- **`[Red]` del formato numérico no es `#C22B24`.** La polaridad se colorea con formato
  condicional.
- **Autoajustar ancho de columna destruye el esqueleto** en un clic.

## Verificación antes de publicar un libro

- [ ] Comprobador de accesibilidad de Excel: **cero errores**
- [ ] Ninguna celda combinada
- [ ] Ningún error de fórmula visible (`SI.ERROR` en toda fórmula de presentación)
- [ ] Vista previa de impresión en A4 apaisado, 1 página de ancho
- [ ] Impresión en blanco y negro sin pérdida de información
- [ ] Ninguna fuente fuera de Aptos / Calibri / Consolas
- [ ] Todos los colores presentes en `finance-os.excel.json`
- [ ] Hojas protegidas, entradas desbloqueadas
- [ ] Texto alternativo en todas las formas y gráficos
