# Finance OS — producto

Este documento existe para que el Design System no diseñe a ciegas. No sustituye a la
Línea Base Oficial: la interpreta en clave de diseño.

---

## Para quién

El usuario de Finance OS **trabaja con dinero ajeno o propio bajo responsabilidad**. No es
un usuario casual. Tres perfiles, en orden de peso para el diseño:

| Perfil          | Qué hace en el producto                         | Qué le duele                                       |
| --------------- | ----------------------------------------------- | -------------------------------------------------- |
| **El operador** | Carga, concilia y corrige datos                 | Perder el sitio en una tabla de 4.000 filas        |
| **El analista** | Compara real contra plan y explica desviaciones | No distinguir de un vistazo lo estimado de lo real |
| **El decisor**  | Mira 8 cifras y decide                          | Que la cifra grande sea la equivocada              |

Los tres usan el mismo sistema. La diferencia no es de producto: es de **densidad**. El
operador quiere filas compactas; el decisor quiere una cifra enorme y nada más.

## Contexto de uso

- **Sesiones largas.** Cuatro horas mirando la misma pantalla. Cualquier decisión visual que
  moleste levemente, a la cuarta hora duele. De ahí el fondo `canvas` en lugar de blanco puro
  y la ausencia total de saturación decorativa.
- **Consecuencias reales.** Un número mal leído mueve dinero. La interfaz nunca puede ser
  ambigua sobre qué es real, qué es estimado y qué está desactualizado.
- **Interrupciones constantes.** El usuario vuelve a la pantalla después de veinte minutos.
  El estado tiene que ser recuperable de un vistazo, sin memoria.
- **Se imprime y se comparte.** Todavía se envían capturas y PDF a comités. El diseño se
  valida en papel en blanco y negro, no solo en pantalla.

## Las tres promesas del producto (y su consecuencia de diseño)

| Promesa                                | Consecuencia visual obligatoria                               |
| -------------------------------------- | ------------------------------------------------------------- |
| **1. Lo que ves es lo que hay.**       | Nada de números animados, nada de estimaciones sin marcar     |
| **2. Sabes de dónde sale cada cifra.** | Toda cifra agregada tiene una ruta de descenso al detalle     |
| **3. No pierdes tu sitio.**            | Encabezados fijos, foco persistente, nada de saltos de layout |

## Excel primero — y qué obliga eso

Excel no es una limitación temporal que se tolere: es la primera plataforma real, y sus
restricciones son las que hacen que el sistema sea sólido.

| Excel no tiene…        | Lo que obliga                                                      |
| ---------------------- | ------------------------------------------------------------------ |
| Sombras en celdas      | La elevación se expresa además con superficie y filete             |
| Esquinas redondeadas   | La retícula es de esquina viva en las dos plataformas              |
| Fuentes garantizadas   | La tipografía se elige entre las que Office ya trae instaladas     |
| Píxeles                | El espaciado se define en una unidad que convierte exacto a puntos |
| Estados de foco reales | El foco se refuerza con relleno y borde, no solo con anillo        |
| Modo oscuro utilizable | El modo claro es el canónico; el oscuro es una extensión web       |

Un sistema diseñado para lo que Excel _sí_ puede hacer se implementa en web sin perder
nada. Al revés no funciona.

---

## Supuestos de esta fase

Declarados porque la Línea Base congelada no los cubre y el diseño necesitaba una respuesta:

1. **El idioma canónico del producto es el español**, con formato numérico configurable
   (separador de miles y decimal) — ver `../design-system/foundations/06-tipografia.md` § 6.
2. **La convención de polaridad por defecto es la occidental** (verde = favorable). Es un
   token remapeable, no una constante — ver `foundations/05-color.md` § 5.
3. **La densidad por defecto es `default` (36 px / 27 pt)**, con `compact` y `relaxed` como
   preferencia del usuario.
4. **El lienzo de diseño de referencia es 1440 px**, y el de impresión A4 apaisado.

Si la Línea Base contradice cualquiera de estos cuatro puntos, gana la Línea Base y el
Design System se corrige.
