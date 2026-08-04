# 21 · Dashboard

> La pantalla madre. Su trabajo no es mostrar todo: es **contestar en cinco segundos si hoy
> hay algo de lo que ocuparse**.

---

## 1. La pregunta que responde

Un dashboard financiero mal diseñado muestra el estado del negocio. Uno bien diseñado
muestra **lo que ha cambiado**. El estado se consulta; el cambio se vigila.

De ahí la composición: cada elemento del dashboard responde a una de estas tres preguntas, en
este orden:

```
1. ¿Hay algo roto?         → alertas y descuadres, arriba del todo
2. ¿Cómo vamos?            → KPIs con su variación
3. ¿De dónde viene eso?    → tabla y gráficos
```

## 2. Estructura vertical

```
┌────────────────────────────────────────────────────────────┐
│ HEADER — contexto: entidad · periodo · moneda   [acciones] │  64 px
├────────────────────────────────────────────────────────────┤
│ ALERTAS — solo si las hay. Nunca un hueco reservado        │  auto
├────────────────────────────────────────────────────────────┤
│                                                            │  32 px
│ KPIs — 3 o 4, misma altura, misma jerarquía                │  ~120 px
│                                                            │  32 px
├────────────────────────────────────────────────────────────┤
│ CONTENIDO PRINCIPAL — tabla o gráfico dominante            │  flexible
│                                                            │
├────────────────────────────────────────────────────────────┤
│ APOYO — desgloses secundarios                              │  flexible
├────────────────────────────────────────────────────────────┤
│ FOOTER — procedencia · última actualización                │  48 px
└────────────────────────────────────────────────────────────┘
```

**La zona de alertas no reserva espacio.** Un hueco vacío esperando un error enseña al
usuario a ignorar esa franja, que es justo donde luego aparecerá el error.

## 3. Reglas de composición

### 3.1 Una jerarquía, no cuatro cuadrantes

El error clásico es la rejilla 2×2 de cards del mismo tamaño. Con cuatro elementos de igual
peso, el ojo no sabe por dónde empezar y el usuario acaba leyendo en zigzag.

**Un elemento domina.** El resto lo apoya, y se ve que lo apoya.

### 3.2 El presupuesto de pantalla

Un dashboard de Finance OS cabe en **una pantalla y media** a 1440 × 900. Si necesita tres,
son dos dashboards.

Reparto orientativo de la primera pantalla:

| Zona                | % del alto |
| ------------------- | ---------: |
| Header + contexto   |       10 % |
| KPIs                |       20 % |
| Contenido principal |   **55 %** |
| Inicio del apoyo    |       15 % |

### 3.3 Máximo cuatro KPIs

Ver [19 · KPIs § 2.6](../components/19-kpis.md#26-máximo-cuatro-por-fila). Con cinco, ninguno
es principal.

### 3.4 Todo desciende

Cada KPI, cada barra y cada fila lleva a su composición. Un dashboard del que no se puede
salir hacia el detalle es un póster.

### 3.5 El contexto es global y visible

Entidad, periodo y moneda viven en el header y **se aplican a toda la pantalla**. Nunca un
filtro por card: dos cards con periodos distintos en la misma pantalla producen comparaciones
falsas, y nadie se da cuenta hasta el comité.

## 4. Densidad de información

| Elemento                 | Máximo por dashboard |
| ------------------------ | -------------------: |
| KPIs                     |                    4 |
| Gráficos                 |                    3 |
| Tablas                   |                    2 |
| Alertas visibles         |         1 (agrupada) |
| Colores distintos en uso |                    5 |

No son sugerencias: son el límite por encima del cual la pantalla deja de contestar en cinco
segundos. Si el contenido no cabe, la solución es **otra pantalla**, no más densidad.

## 5. Estados del dashboard

| Estado         | Comportamiento                                                              |
| -------------- | --------------------------------------------------------------------------- |
| Cargando       | [Skeleton](30-skeletons.md) con la estructura exacta, no un spinner central |
| Vacío          | [Estado vacío](28-estados-vacios.md) explicando qué falta para poblarlo     |
| Parcial        | Lo disponible se muestra; lo que falta, con su propio skeleton o `—`        |
| Error parcial  | La card afectada muestra su error; **el resto sigue funcionando**           |
| Desactualizado | Aviso global + marca de tiempo en el pie                                    |

**El fallo parcial no tumba la pantalla.** Si el proveedor de tipos de cambio no responde,
las cifras en moneda local siguen siendo correctas y se muestran. Un dashboard que se pone
en blanco entero por una fuente caída es un dashboard que no se usa el día que importa.

## 6. Personalización

- El usuario puede **reordenar y ocultar** bloques. No puede cambiar colores, tipografías ni
  tamaños: eso es el sistema.
- La disposición persiste por usuario y por dashboard.
- Siempre hay "Restablecer disposición".
- **La disposición por defecto es la buena.** La personalización es para casos particulares,
  no la excusa para no decidir una jerarquía.

## 7. Excel

Un dashboard en Excel es una **hoja de presentación** que no contiene ningún dato: solo
referencias a las hojas de datos.

```
Estructura de libro:
  Portada      Contexto, índice, fecha de actualización
  Dashboard    ← esta hoja. Solo fórmulas de referencia
  Datos_*      Tablas fuente (Ctrl+T). Ocultas o agrupadas
  Param        Parámetros y rangos con nombre
  Control      Comprobaciones de cuadre

Hoja Dashboard:
  Líneas de división   DESACTIVADAS
  Esqueleto            Columnas A–L (ver 08 · Grid)
  Fila 1–2             Header: entidad · periodo · moneda
  Fila 3               Control de cuadre (ver 18 · Alertas § 7)
  Fila 5               Fila espaciadora 18 pt
  Fila 6–8             KPIs: 3 celdas apiladas por KPI (ver 19 · KPIs § 7)
  Fila 10+             Contenido principal
  Última fila          Pie: origen y marca de tiempo
  Inmovilizar paneles  Bajo el header
  Área de impresión    B:L, ajustar a 1 página de ancho, A4 apaisado
  Protección           Hoja protegida; solo los parámetros desbloqueados
```

Reglas del libro:

1. **La hoja de dashboard no contiene datos**, solo referencias. Así se puede rehacer sin
   riesgo de perder nada.
2. **Ninguna fórmula apunta a una celda de otra hoja de dashboard.** Las dependencias van
   siempre hacia las hojas de datos, nunca en lateral.
3. **Los parámetros son rangos con nombre**, nunca celdas sueltas referenciadas por
   coordenada. `Periodo_Actual` sobrevive a insertar una fila; `Param!$B$4` no.
4. **La comprobación de cuadre es visible desde la primera fila.** Ver
   [18 · Alertas § 7](../components/18-alertas.md#7-excel).

---

**Anterior:** [20 · Gráficos](../components/20-graficos.md) ·
**Siguiente:** [22 · Navegación](22-navegacion.md)
