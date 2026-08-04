# 01 · Filosofía visual

> Por qué Finance OS se ve como se ve, y por qué no se verá de otra manera dentro de diez años.

---

## 1. La tesis

**El dato es la interfaz.**

En un producto financiero, la pantalla no es el producto: es una ventana al producto. El
producto son las cifras. Todo elemento visual que compita con una cifra por la atención del
usuario está trabajando en contra del producto, por bonito que sea.

Esto no es minimalismo por moda. Es una consecuencia aritmética: en una pantalla de análisis
hay del orden de 300 a 3.000 números. Cada gramo de decoración se multiplica por 3.000.

Lo que se hereda de las referencias:

| Referencia           | Lo que se toma                                                          |
| -------------------- | ----------------------------------------------------------------------- |
| **Linear**           | Densidad sin agobio. Que quepa mucho y no parezca mucho.                |
| **Stripe Dashboard** | El dato financiero como protagonista tipográfico, no como celda de tabla|
| **Notion**           | Superficies tranquilas y jerarquía por espacio, no por caja             |
| **Vercel**           | Autoridad del monocromo. El color es un acento, no un tema.             |
| **Arc**              | Que un producto serio pueda tener temperatura                           |
| **Apple**            | Que la tipografía cargue la jerarquía sola                              |

De ninguna se toma su decoración. Se toma su **disciplina**.

## 2. Los cinco compromisos

### 2.1 Reducción antes que adición

La pregunta por defecto ante cualquier elemento nuevo no es "¿queda bien?" sino **"¿qué
desaparece si quito esto?"**. Si la respuesta es "nada", el elemento no entra.

Aplicado: las tablas no tienen bordes verticales, las cards no tienen encabezado con fondo,
los KPI no tienen icono, los gráficos no tienen leyenda cuando hay una sola serie.

### 2.2 La jerarquía la hace el espacio, no la caja

Cuando dos bloques deben separarse, primero se prueba con espacio. Solo si el espacio no
basta —porque el bloque tiene que ser recortable, arrastrable o desplazable— aparece una
superficie. Solo si la superficie no basta, aparece un filete. La sombra es el último recurso
y casi siempre significa que algo flota de verdad.

**Orden de escalada:** espacio → superficie → filete → sombra.

### 2.3 Silencio cromático

La pantalla en reposo es gris y negra. El color aparece cuando hay algo que decir:
una acción disponible, una desviación relevante, un dato estimado. Un dashboard sano de
Finance OS tiene **menos del 5 % de su superficie coloreada**.

El efecto buscado: cuando algo se pone rojo, se ve desde el otro lado de la sala. Eso solo
funciona si el resto está callado.

### 2.4 Cero ambigüedad sobre la naturaleza del dato

Todo número pertenece a una de cuatro categorías, y la categoría **siempre es visible**:

| Categoría      | Cómo se ve                                             |
| -------------- | ------------------------------------------------------ |
| Real           | Texto primario, sin adorno                             |
| Estimado       | Texto primario + badge ámbar `Est.`                    |
| Calculado      | Texto primario + icono de fórmula al enfocar la celda  |
| Desactualizado | Texto secundario + marca de tiempo en el pie           |

Un producto financiero que presenta una estimación con el mismo aspecto que un dato real
está mintiendo, aunque sea sin querer.

### 2.5 Atemporalidad como requisito técnico

Una tendencia visual dura entre dos y cuatro años. Un sistema financiero implantado en una
organización dura entre siete y quince. El sistema no puede envejecer al ritmo de las modas.

Se excluyen por norma: degradados en superficies, glassmorphism, sombras de color, neón,
bordes con brillo, ilustraciones de personajes, esquinas muy redondeadas, tipografías con
personalidad fuerte, animaciones de entrada llamativas y modo oscuro con acentos saturados.

Lo que queda —retícula, tipografía, espacio, un acento— es lo que se ve igual de bien en
1995 y en 2040 porque nunca estuvo de moda.

## 3. La prueba de fuego

Un diseño de Finance OS es correcto si pasa las cuatro:

1. **La prueba del entrecerrar.** Al entrecerrar los ojos, lo primero que se distingue es la
   cifra más importante de la pantalla. No el logotipo, no el botón, no el gráfico.
2. **La prueba de la fotocopia.** Impreso en blanco y negro, no se pierde ninguna
   información. Si algo se pierde, ese algo dependía solo del color.
3. **La prueba de las cuatro horas.** Nada en la pantalla resulta más molesto a la cuarta
   hora que en el primer minuto.
4. **La prueba de Excel.** El diseño se puede construir con celdas, bordes, rellenos y
   formas. Si necesita algo que Excel no tiene, es un diseño para otro producto.

## 4. Lo que este sistema NO es

- **No es un sistema bonito.** Es un sistema legible. Cuando compiten, gana legible.
- **No es neutro por falta de ideas.** La neutralidad es la idea.
- **No es minimalismo estético.** Es economía de atención: la atención del usuario es el
  recurso escaso, y el sistema entero está diseñado para gastarla en las cifras.

---

**Siguiente:** [02 · Personalidad de marca](02-personalidad-marca.md)
