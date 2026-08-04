# 22 · Navegación

> Contestar en todo momento: dónde estoy, qué más hay, y cómo vuelvo.

---

## 1. Modelo

Tres niveles. **Un cuarto nivel de navegación indica que la información se estructuró mal.**

```
Nivel 1 — Área       Sidebar        Tesorería · Ingresos · Gastos · Informes
Nivel 2 — Sección    Pestañas       Resumen · Movimientos · Conciliación
Nivel 3 — Detalle    Descenso       Un asiento, una cuenta, un documento
```

| Nivel | Componente | Persistencia |
| --- | --- | --- |
| 1 | [Sidebar](23-sidebar.md) | Siempre visible |
| 2 | Pestañas bajo el [header](24-header.md) | Visibles dentro del área |
| 3 | Panel lateral, o página con migas | Contextual |

## 2. Las cuatro reglas

### 2.1 La navegación no se mueve

La posición de un elemento del sidebar **no cambia** entre sesiones: nada de "más usados
arriba". La memoria muscular es el mecanismo de navegación más rápido que existe, y
reordenar la lista lo destruye para ganar dos píxeles de relevancia.

### 2.2 El estado activo es inequívoco

Nunca solo color. Sidebar: fondo `surface-accent` + barra `accent` de 2 px a la izquierda +
texto peso 500. Pestañas: subrayado `accent` de 2 px + texto `text-primary`.

### 2.3 Volver siempre es posible y siempre está en el mismo sitio

Migas de pan para el descenso; `Esc` cierra cualquier panel; el botón "atrás" del navegador
funciona (la URL refleja el estado real: área, sección, periodo y filtros).

Que los filtros vivan en la URL no es un detalle técnico: es lo que permite **compartir una
vista** por correo, que es cómo trabaja de verdad un equipo financiero.

### 2.4 El contexto viaja

Periodo, entidad y moneda **se conservan al navegar entre áreas**. Cambiar de Ingresos a
Gastos y que el periodo vuelva a "mes actual" obliga a reconfigurar en cada salto y es una
fuente real de comparaciones erróneas.

## 3. Migas de pan

```
Ingresos  ›  Cuenta 4300 · Clientes  ›  Factura F-2025-1284
```

- Aparecen **solo a partir del nivel 3**. En los niveles 1–2 el sidebar y las pestañas ya
  dicen dónde se está.
- El último elemento es el actual, en `text-primary`, no clicable.
- Los anteriores en `text-secondary`, clicables.
- Separador `›` en `text-tertiary`.
- Si superan el ancho: se colapsa el medio con `…`, nunca el primero ni el último.

## 4. Teclado

| Atajo | Acción |
| --- | --- |
| `Cmd/Ctrl + K` | Paleta de comandos: ir a cualquier sitio, ejecutar cualquier acción |
| `Cmd/Ctrl + 1…9` | Ir al área n del sidebar |
| `G` luego `D` | Ir al Dashboard |
| `[` / `]` | Periodo anterior / siguiente |
| `Esc` | Cerrar panel, menú o modal |
| `?` | Lista de atajos |

**La paleta de comandos es la navegación principal para el usuario experto.** El sidebar es
para descubrir; la paleta es para trabajar. Un usuario que viene de Excel espera no soltar el
teclado — ver [03 · Principios UX § 7](../foundations/03-principios-ux.md#7-el-teclado-es-de-primera-clase).

## 5. Accesibilidad

- Enlace "Saltar al contenido" como primer elemento enfocable.
- `<nav>` con `aria-label` distinto para cada navegación ("Principal", "Secciones", "Migas").
- Elemento activo con `aria-current="page"`.
- Orden de tabulación = orden visual.
- Las pestañas implementan el patrón ARIA: flechas mueven, `Tab` sale del grupo.

## 6. Excel

En Excel la navegación son **hojas y un índice**, y hay que construirla porque las pestañas
nativas no bastan a partir de ocho hojas.

```
Hoja "Inicio":     Índice con hipervínculos a cada área
                   Botón "Volver al inicio" en B1 de TODAS las hojas
Pestañas de hoja:  Nombre corto, sin espacios ni acentos (los hipervínculos
                   y las fórmulas entre hojas se rompen con ellos)
Color de pestaña:  Por área — accent1..6 del tema
Orden:             Fijo: Inicio · Dashboard · áreas · Datos · Param · Control
Ocultar:           Las hojas de datos se agrupan al final, nunca se ocultan del
                   todo: una hoja oculta es una hoja que nadie audita
Nivel 3:           Filtro de la tabla, o segmentación de datos. NO una hoja nueva
Contexto:          Rangos con nombre (Periodo_Actual, Entidad_Actual) leídos
                   por todas las hojas — el equivalente del contexto que viaja
```

El equivalente de las migas de pan en Excel es la **celda B1 de cada hoja**: siempre contiene
`Inicio › Área › Hoja` con hipervínculo. Es la convención más barata que existe y la que más
se agradece en un libro de veinte hojas.

---

**Anterior:** [21 · Dashboard](21-dashboard.md) · **Siguiente:** [23 · Sidebar](23-sidebar.md)
