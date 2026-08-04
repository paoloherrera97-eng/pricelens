# Listas de verificación

Se ejecutan **antes** de dar por terminada una pantalla, no después de que alguien se queje.

---

## 1. Visual — toda pantalla

- [ ] Hay **exactamente un** elemento de nivel 1 en la jerarquía
- [ ] Todo valor sale de un token; ni un `13px` ni un `#4A5568` sueltos
- [ ] Todo múltiplo de 8 px (o 4 px justificado **dentro** de un componente)
- [ ] Los números van a la derecha, con cifras tabulares y cero rasgado
- [ ] No hay ningún borde que pudiera haber sido espacio
- [ ] Nada cambia de tamaño al cambiar de estado
- [ ] Ninguna información aparece solo al pasar el ratón
- [ ] Ningún significado depende solo del color
- [ ] Máximo 4 KPIs, 3 gráficos, 2 tablas, 1 alerta visible
- [ ] Menos del 5 % de la superficie está coloreada

## 2. Dato financiero

- [ ] Toda cifra estimada lleva badge `Est.`
- [ ] Toda variación lleva cursor **+** signo **+** color
- [ ] Todo porcentaje lleva su base ("vs. jun 25")
- [ ] Las diferencias entre porcentajes están en `pp`, no en `%`
- [ ] `0,00` y `—` se usan con sentidos distintos y correctos
- [ ] Los decimales son los de la moneda, y **los mismos en todas las vistas**
- [ ] Toda cifra agregada desciende a su composición, o está marcada como terminal
- [ ] La procedencia y la marca de tiempo son visibles
- [ ] La marca de tiempo es absoluta, no relativa

## 3. Estados

- [ ] `default`, `hover`, `active`, `focus`, `disabled`, `loading`, `error` definidos
- [ ] Estado vacío: identificado **cuál** de los cinco es
- [ ] Estado de carga con la forma real del contenido
- [ ] Estado de error con causa **y** salida
- [ ] Fallo parcial: lo que funciona sigue funcionando

## 4. Accesibilidad

- [ ] `node finance-os/qa/contrast/audit.mjs` pasa
- [ ] Recorrida entera solo con teclado
- [ ] Foco visible en todo elemento interactivo, sin transición
- [ ] Orden de tabulación = orden visual
- [ ] `Esc` cierra toda capa superpuesta
- [ ] Vista al 200 % de zoom sin pérdida de contenido
- [ ] Simulación de deuteranopia y protanopia
- [ ] Impresa en blanco y negro sin pérdida de información
- [ ] Recorrida con lector de pantalla
- [ ] Objetivos táctiles ≥ 24 px (diseño a 44 px)
- [ ] Encabezados sin saltos de nivel
- [ ] Tablas con `<th scope>` y `<caption>`

## 5. Excel

- [ ] Comprobador de accesibilidad: **cero errores**
- [ ] Ninguna celda combinada
- [ ] Líneas de división desactivadas
- [ ] Esqueleto de columnas A–L respetado
- [ ] Solo estilos `FOS/*`, sin formato directo
- [ ] Tablas reales (Ctrl+T), no rangos
- [ ] Paneles inmovilizados
- [ ] Hoja protegida, entradas desbloqueadas
- [ ] Control de cuadre visible en la parte superior
- [ ] Ningún error de fórmula visible (`SI.ERROR` en toda fórmula de presentación)
- [ ] Vista previa: A4 apaisado, 1 página de ancho
- [ ] Filas de encabezado repetidas al imprimir
- [ ] Texto alternativo en formas y gráficos
- [ ] Solo Aptos / Calibri / Consolas

## 6. Gráficos

- [ ] La forma responde a la pregunta (no es un gráfico decorativo)
- [ ] **Ningún doble eje Y**
- [ ] Ningún circular, donut ni 3D
- [ ] Barras con eje desde cero
- [ ] Series asignadas en el orden fijo de ranuras
- [ ] El color sigue a la entidad, no a su posición
- [ ] Máximo 3 series en dispersión, burbujas, mapas o múltiplos pequeños
- [ ] Leyenda con ≥ 2 series; etiqueta directa con 2–4
- [ ] Texto de leyenda en tinta, no en el color de la serie
- [ ] Etiquetas de datos selectivas, nunca en todos los puntos
- [ ] Existe una tabla equivalente
- [ ] Título que dice la conclusión

## 7. Antes de publicar

- [ ] `node finance-os/tokens/build-tokens.mjs` ejecutado y sin cambios pendientes
- [ ] `node finance-os/qa/contrast/audit.mjs --write` ejecutado
- [ ] Cambios registrados en `design-system/CHANGELOG.md`
- [ ] Ninguna cifra de contraste en la documentación contradice `qa/contrast/REPORT.md`
