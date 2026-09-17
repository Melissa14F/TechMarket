1. Briefing de marca
Nombre: TechMarket Rubro: Tienda en línea de productos de tecnología (catálogo propio, multi-categoría) Identidad de partida: el logo ya existe — una mascota tipo gato ilustrado en línea blanca (auriculares, gafas, canasta con producto tech, torre de PC) sobre fondo morado/púrpura sólido, con el wordmark "TechMarket" en blanco. Todo el diseño debe partir de esta identidad, no crearla desde cero.

Sensación que debe transmitir: profesionalismo, confianza y modernidad tecnológica, pero con un toque de cercanía/personalidad que aporta la mascota (no 100% corporativo frío). Diseño moderno, minimalista — mucho espacio en blanco, jerarquía clara, sin saturar de elementos decorativos.

2. Colorimetría (derivada del logo)
Primario — Morado/Púrpura de marca: tomado directamente del fondo del logo (tono púrpura profundo). Se usa en header, footer, acentos de marca y elementos que refuercen identidad.
Secundario — Blanco/Off-white: fondo principal de catálogo y contenido, para mantener el look minimalista y dar aire a los productos.
Acento/CTA: un color complementario al morado (ej. un amarillo/dorado cálido o un cian, a definir en Figma probando contraste) reservado únicamente para botones de acción principal ("Agregar al carrito", "Comprar", promociones) — debe destacar claramente sobre el morado y el blanco.
Neutros: escala de grises fríos para texto secundario, bordes, líneas divisoras entre header/body.
Estados semánticos: verde (éxito/stock disponible), rojo (error/sin stock), ámbar (últimas unidades/promoción por vencer) — estos deben verse bien tanto sobre fondo blanco como sobre morado, ya que se usarán en badges dentro del catálogo y en el header.
Definir todo como Color Styles/Variables en Figma extraídas con el eyedropper directamente del logo, para que la paleta sea 100% consistente con la marca.
3. Tipografía
Titulares: sans-serif geométrica moderna (ej. Poppins, Sora, Space Grotesk) — el wordmark del logo ya usa una sans-serif redondeada/amigable, así que la tipografía de headings debe sentirse de la misma familia visual.
Cuerpo/UI: sans-serif de alta legibilidad (Inter, Roboto) para descripciones, precios, formularios.
Escala tipográfica definida como text styles (H1–H6, body, caption, precio, botón).
Los precios deben tener peso semibold/bold y color de marca o acento para resaltar en las fichas de producto.
4. Estructura del Header (2 niveles)
Nivel 1 (superior)
De izquierda a derecha:

Logo TechMarket (mascota + wordmark).
Buscador — input de búsqueda de productos, ancho generoso, centrado o inmediatamente después del logo.
Ingresar / Mi cuenta — botón/ícono que despliega opciones: "Iniciar sesión" y "Crear cuenta" si no hay sesión activa; si hay sesión, muestra nombre/avatar y opciones de perfil.
Carrito de compras — ícono con contador de items, al extremo derecho.
Nivel 2 (inferior, barra de navegación)
De izquierda a derecha:

Home — vuelve a la página principal.
3 categorías destacadas (las más vendidas/relevantes) como accesos directos.
Catálogo — con un desplegable (mega menú) que muestra todas las categorías y, dentro de cada una, sus productos o subcategorías, organizado en columnas para que sea fácil de escanear.
En el extremo derecho de este nivel:
Contáctenos
Ícono de WhatsApp que redirige a la línea de atención — debe usar el color oficial de WhatsApp o quedar dentro de un botón con buen contraste, ya que rompe la paleta morada; diseñarlo como un elemento reconocible al instante.
Ambos niveles deben diseñarse también en versión responsive (mobile: colapsar nivel 2 en un menú hamburguesa, mantener buscador accesible mediante ícono expandible).

5. Body
5.1 Home / Página de inicio
Carrusel/banner principal: anuncio rotativo llamativo (promociones, lanzamientos, categorías destacadas) — full-width, con controles de navegación claros y indicadores de posición (dots).
Debajo del carrusel, en este orden:
Productos destacados
Lo más vendido
Recomendados según búsquedas del cliente (personalización basada en historial de búsqueda en la tienda)
Cada sección en formato de carrusel horizontal o grid, usando el componente ProductCard ya definido en el sistema.
5.2 Vista de categoría (al hacer clic en una categoría del header)
Se abre la vista de listado de productos de esa categoría.
Filtro lateral izquierdo con:
Subcategoría
Marca
Rango de precio (slider o inputs min/max)
Promociones disponibles (checkbox/toggle)
Área principal (derecha): grid de productos filtrados, con opción de ordenar (relevancia, precio asc/desc, más vendidos) y paginación.
Los filtros deben mostrar estado de carga independiente del grid de productos, para que aplicar un filtro no recargue toda la página (coherente con el objetivo de carga optimizada del desarrollo).
6. Footer
Sobre nosotros: sección/enlace que muestra la información de la empresa — visión, misión y posiblemente valores o historia breve de TechMarket.
Información de contacto (mapeada a la entidad informacion: teléfono, dirección, horario).
Enlaces rápidos: catálogo, categorías principales, políticas (envíos, devoluciones, términos).
Íconos de redes sociales y WhatsApp (coherente con el del header).
Todo sobre fondo morado de marca (o un morado más oscuro como variante), con texto blanco/gris claro — cerrando la página reforzando la identidad visual, igual que el header.
7. Componentes a diseñar (Design System)
Botones (primario/acento, secundario, ghost, disabled, loading).
Inputs: buscador, filtros, formularios de login/cuenta.
ProductCard (grid catálogo y versión destacada de home).
Badges: categoría, stock, promoción, estado de orden (colores desde estado_orden).
Mega menú de catálogo (desplegable de categorías).
Carrusel de banners y carrusel de productos.
Tarjeta de "Mi cuenta" desplegable (login/crear cuenta/perfil).
Carrito lateral (drawer) con resumen de productos.
Tabla y modal de administración (CRUD de productos/categorías/información) — mismos componentes ya usados en la vista pública para mantener consistencia.
Estados de carga (skeletons) para: grid de productos, filtros, carrusel, mega menú.
8. Principios de layout
Grid de 12 columnas con spacing tokens consistentes (múltiplos de 4u/8px) para traducción directa a React.
Mobile-first: definir breakpoints para mobile, tablet y desktop, especialmente para el header de dos niveles (que en mobile debe simplificarse) y el filtro lateral de categorías (que en mobile pasa a un drawer/modal).
Priorizar percepción de velocidad: skeletons en vez de pantallas en blanco mientras cargan productos, filtros o el carrusel.
9. Instrucción de cierre para Figma / IA generativa de diseño
Diseña la interfaz de TechMarket, una tienda en línea de tecnología, partiendo de la identidad visual de su logo (mascota ilustrada sobre fondo morado/púrpura, wordmark blanco). El estilo debe ser moderno, minimalista y profesional, con la paleta derivada del morado del logo como color de marca, blanco como base de contenido, y un único color de acento de alto contraste para acciones principales. Diseña primero el sistema de componentes (botones, inputs, product cards, badges, mega menú, carrusel) y luego ensambla las pantallas: header de dos niveles (nivel 1: logo, buscador, cuenta, carrito; nivel 2: home, categorías, catálogo desplegable, contáctenos y WhatsApp), home (carrusel + destacados + más vendidos + recomendados), vista de categoría (filtros laterales + grid de productos) y footer (sobre nosotros, contacto, enlaces, redes). El resultado debe traducirse fácilmente a componentes de React con props claras (variant, size, state).