# Marca — recursos

> Especificación en
> [`../../design-system/foundations/02-personalidad-marca.md`](../../design-system/foundations/02-personalidad-marca.md) § 5.

---

## Qué vive aquí (cuando se produzcan los recursos)

```
brand/
├── README.md
├── logo/
│   ├── finance-os-logo.svg           Logotipo completo, monocromo
│   ├── finance-os-logo-invert.svg    Sobre fondo oscuro
│   ├── finance-os-symbol.svg         Solo el símbolo
│   └── png/                          @1x @2x @3x para Excel y presentaciones
└── favicon/                          16, 32, 180, 512 px
```

## Especificación

| Elemento | Regla |
| --- | --- |
| **Escritura** | `Finance OS` — dos palabras, `OS` en mayúsculas |
| **Marca denominativa** | Familia de interfaz, peso 600, tracking −0,02 em |
| **Símbolo** | Cuadrado de esquina viva con corte diagonal. Lee como celda y como pantalla |
| **Color** | Índigo `#3B5BDB` sobre blanco o sobre grafito `#151A21` |
| **Zona de respeto** | La altura de la `F` por los cuatro lados |
| **Tamaño mínimo** | Símbolo 16 px de alto · logotipo completo 80 px de ancho |

**No hay tipografía exclusiva de marca.** Usar la misma familia que la interfaz es una
decisión: el producto y la marca son la misma cosa.

## Prohibido

Degradados · sombras de color · rotar, estirar o recolorear el símbolo · sobre fotografía ·
sobre un color de estado · mascota · ilustraciones de personajes.

## Formatos por destino

| Destino | Formato | Nota |
| --- | --- | --- |
| Web | SVG | Único formato |
| Excel | PNG @2x y @3x | Excel no rasteriza SVG de forma fiable en todas las versiones |
| Presentaciones | SVG y PNG @3x | |
| Favicon | ICO + PNG | 16, 32, 180 (Apple), 512 (manifest) |

Todos los PNG se exportan **del mismo SVG**, nunca se redibujan — misma regla que los
[iconos](../icons/README.md).
