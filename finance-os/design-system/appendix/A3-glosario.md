# A3 · Glosario

> Para que dos personas que hablan del sistema estén hablando de lo mismo.

---

## Vocabulario del sistema de diseño

| Término | Significa en Finance OS |
| --- | --- |
| **Token** | Un valor con nombre definido en `finance-os.tokens.json`. No hay valores fuera de ellos |
| **Primitivo** | Un valor crudo sin significado (`indigo.500`). Nunca se usa en un componente |
| **Semántico** | Un token que describe un papel (`text-primary`, `border-strong`) |
| **Superficie** | Un plano de fondo: `canvas`, `surface`, `surface-sunken` |
| **Elevación** | Nivel semántico 0–3. En web es sombra; en Excel, superficie y filete |
| **Escalón de superficie** | Subir o bajar un paso en la rampa de grises para sugerir profundidad |
| **Densidad** | `compact` / `default` / `relaxed`. Preferencia del usuario, persistente |
| **Esqueleto de columnas** | La estructura fija de columnas A–L de una hoja de Excel |
| **Polaridad** | La codificación de "favorable / desfavorable". Remapeable por mercado |
| **Cursor de polaridad** | Los caracteres ▲ ▼ — que acompañan a toda variación |
| **Cifras tabulares** | Numerales de ancho fijo, imprescindibles para alinear columnas |
| **Prueba de la fotocopia** | Verificar en blanco y negro que no se pierde información |
| **Relación de proximidad** | La distancia entre elementos codifica si pertenecen al mismo grupo |
| **Escalada** | El orden espacio → superficie → filete → sombra |
| **Fila espaciadora** | Fila de Excel de 6 o 18 pt que sustituye al padding |

## Vocabulario financiero usado en el sistema

| Término | Significa |
| --- | --- |
| **Real** | Dato registrado y contrastado |
| **Estimado** | Cálculo sobre información incompleta. **Siempre marcado** con badge `Est.` |
| **Presupuesto** | Cifra planificada antes del periodo |
| **Previsión** | Estimación actualizada del cierre del periodo |
| **Desviación** | Diferencia entre real y presupuesto |
| **Variación** | Diferencia entre dos periodos comparables |
| **pp** (punto porcentual) | Diferencia entre dos porcentajes. `42,1 % → 44,5 %` es `+2,4 pp`, no `+2,4 %` |
| **Descuadre** | El modelo no cuadra. Es un **error**, no un aviso |
| **Conciliación** | Contraste entre dos fuentes que deben coincidir |
| **Periodo cerrado** | Periodo contable bloqueado. Solo lectura |
| **Descender / drill-down** | Pasar de una cifra agregada a su composición |
| **Consolidado** | Agregado de varias entidades, con eliminaciones entre ellas |

## Errores de vocabulario que este sistema evita

| ❌ | ✅ | Por qué |
| --- | --- | --- |
| "Variación del +2,4 %" sobre un margen | "+2,4 pp" | Un margen varía en puntos, no en porcentaje |
| "Sin datos" para un periodo sin actividad | "Sin movimientos en julio 2025" | El vacío legítimo es un dato válido |
| "Actualizado hace 3 minutos" | "04/08/2025 09:14" | El relativo se congela en una pestaña abierta |
| "0,00" cuando no hay dato | "—" | Cero y "no lo sabemos" son afirmaciones distintas |
| "Total" para un subtotal | "Total ingresos" / "Total general" | El alcance del total tiene que ser explícito |
| "(1.284,00)" para una pérdida | "−1.284,00" | El paréntesis se pierde al copiar y al escanear |

---

**Anterior:** [A2 · Accesibilidad](A2-accesibilidad.md) · **Índice:** [README](../README.md)
