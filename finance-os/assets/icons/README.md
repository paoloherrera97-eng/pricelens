# Iconos — recursos

> Especificación e inventario semántico en
> [`../../design-system/foundations/09-iconografia.md`](../../design-system/foundations/09-iconografia.md).

---

## Origen único

**[Lucide](https://lucide.dev)** (licencia ISC). Rejilla de 24, trazo 1,5, terminaciones
redondeadas — coincide con la especificación del sistema sin retocar nada.

**Los iconos no se dibujan a mano.** Si hace falta un concepto que Lucide no cubre, se compone
a partir de sus primitivas respetando la rejilla y se documenta en el inventario. Un icono
ad-hoc por pantalla es como acaban desalineados todos los sistemas de iconos.

## Qué vive aquí (cuando se produzcan los recursos)

```
icons/
├── README.md
├── svg/                   Los SVG del inventario, tal cual salen de Lucide
└── png/
    ├── 16/  20/  24/      Un directorio por tamaño
    └── …                  En cada uno: secondary, primary, accent,
                           positive, negative, warning
```

## Regla de exportación

**Las dos plataformas comparten origen, no solo estilo.** Todo PNG de Excel se exporta del
**mismo SVG** que usa la web:

```
svg/chevron-up.svg
  → png/16/secondary/chevron-up.png    (#55606F)
  → png/16/negative/chevron-up.png     (#C22B24)
  → …
```

| Tamaño |       Trazo | Densidades  |
| -----: | ----------: | ----------- |
|  24 px |      1,5 px | @1x @2x @3x |
|  20 px |      1,5 px | @1x @2x @3x |
|  16 px | **1,25 px** | @1x @2x @3x |

El ajuste de trazo a 16 px es óptico, no matemático: con 1,5 px se cierran las contraformas y
el icono se convierte en una mancha.

## Colores de exportación

Los seis del sistema, tomados de
[`../../tokens/build/finance-os.excel.json`](../../tokens/build/finance-os.excel.json):

| Nombre      | Hex                          |
| ----------- | ---------------------------- |
| `secondary` | `#55606F` — **el más usado** |
| `primary`   | `#151A21`                    |
| `accent`    | `#2F49B4`                    |
| `positive`  | `#127543`                    |
| `negative`  | `#C22B24`                    |
| `warning`   | `#8F5B12`                    |

En web **no se exporta por color**: el SVG hereda `currentColor`.

## Excepción documentada

Los cursores de polaridad **▲ ▼ —** no son iconos: son caracteres Unicode. Se copian, se
ordenan, se imprimen y no se despegan de la celda al filtrar. Para el elemento más frecuente
del producto, eso pesa más que la coherencia de trazo.
