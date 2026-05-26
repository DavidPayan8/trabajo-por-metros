# App de gestión de cobros por metros

## Descripción general
PWA (Progressive Web App) para un trabajador autónomo que gestiona cobros de trabajos en función de los metros realizados. Diseñada para iPhone, instalable desde Safari.

## Stack tecnológico
- **Frontend**: React + Vite + TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos / Auth**: Supabase
- **Deploy**: Vercel
- **PWA**: vite-plugin-pwa

## Funcionalidades

### 1. Autenticación
- Login con email y contraseña via Supabase Auth
- Sesión persistente (el trabajador no tiene que hacer login cada vez)
- Un único usuario por ahora (uso personal)

### 2. Tipos de metro
- CRUD completo: crear, editar, eliminar tipos
- Cada tipo tiene: nombre (ej. "Pintura", "Solado", "Escayola") y precio por metro (decimal)
- Listado de todos los tipos con su precio

### 3. Trabajos
- Dar de alta un trabajo con: nombre/descripción y ubicación (texto libre, ej. "Calle Mayor 12, 2ºA")
- **Restricción**: no puede haber dos trabajos con estado `abierto` en la misma ubicación
- Estados posibles: `abierto` → `pendiente_cobro` → `cobrado`
- Un trabajo `abierto` es donde se están haciendo los trabajos actualmente

### 4. Registro de metros (dentro de un trabajo abierto)
- Añadir líneas al trabajo: seleccionar tipo de metro + cantidad de metros
- Cálculo automático del subtotal por línea (metros × precio_por_metro en el momento de crear la línea — guardar precio histórico, no referencia al tipo)
- Total del trabajo = suma de subtotales de todas las líneas
- Al terminar, cambiar estado a `pendiente_cobro`

### 5. Cobro
- En trabajos con estado `pendiente_cobro`, el trabajador introduce cuánto le han pagado
- La app muestra:
  - Total calculado (lo que debería cobrar)
  - Total cobrado (lo que le han pagado)
  - Diferencia (positiva = le deben dinero, negativa = le han pagado de más, cero = correcto)
- Al confirmar, el trabajo pasa a estado `cobrado`

### 6. Historial
- Listado de trabajos cobrados con sus totales y fechas
- Filtro básico por fecha o ubicación

---

## Esquema de base de datos (Supabase / PostgreSQL)

### Tabla `tipo_metro`
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id     uuid REFERENCES auth.users NOT NULL
nombre      text NOT NULL
precio      numeric(10,2) NOT NULL
created_at  timestamptz DEFAULT now()
```

### Tabla `trabajo`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id             uuid REFERENCES auth.users NOT NULL
descripcion         text NOT NULL
ubicacion           text NOT NULL
estado              text NOT NULL DEFAULT 'abierto'  -- abierto | pendiente_cobro | cobrado
total_calculado     numeric(10,2) DEFAULT 0
total_cobrado       numeric(10,2)
fecha_inicio        timestamptz DEFAULT now()
fecha_cobro         timestamptz
created_at          timestamptz DEFAULT now()

-- Restricción: no dos trabajos 'abierto' en la misma ubicación para el mismo usuario
UNIQUE (user_id, ubicacion, estado) WHERE estado = 'abierto'
```

### Tabla `linea_trabajo`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
trabajo_id      uuid REFERENCES trabajo(id) ON DELETE CASCADE NOT NULL
tipo_metro_id   uuid REFERENCES tipo_metro(id) NOT NULL
nombre_tipo     text NOT NULL        -- copia histórica del nombre
precio_unitario numeric(10,2) NOT NULL  -- copia histórica del precio en el momento
metros          numeric(10,2) NOT NULL
subtotal        numeric(10,2) NOT NULL  -- metros × precio_unitario
created_at      timestamptz DEFAULT now()
```

### Row Level Security (RLS)
Activar RLS en todas las tablas. Política: cada usuario solo ve y modifica sus propios registros (`user_id = auth.uid()`).

---

## Estructura de carpetas del proyecto

```
/
├── public/
│   ├── manifest.json
│   └── icons/
├── src/
│   ├── components/
│   │   ├── ui/              # componentes reutilizables (Button, Input, Card...)
│   │   ├── TipoMetroForm.tsx
│   │   ├── TrabajoCard.tsx
│   │   ├── LineaTrabajoForm.tsx
│   │   └── CobroForm.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Tipos.tsx        # gestión de tipos de metro
│   │   ├── Trabajos.tsx     # lista de trabajos activos
│   │   ├── TrabajoDetalle.tsx
│   │   └── Historial.tsx
│   ├── lib/
│   │   └── supabase.ts      # cliente de supabase
│   ├── hooks/
│   │   ├── useTipos.ts
│   │   └── useTrabajos.ts
│   ├── types/
│   │   └── index.ts         # tipos TypeScript de las entidades
│   ├── App.tsx
│   └── main.tsx
├── .env.local               # VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Variables de entorno necesarias
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## Notas de implementación

- Usar `@supabase/supabase-js` v2
- React Router v6 para navegación
- El total del trabajo se recalcula en Supabase con un trigger o desde el cliente al añadir/eliminar líneas
- La app debe funcionar bien en pantalla de móvil (mobile-first): botones grandes, formularios cómodos con el teclado del iPhone
- Colores neutros y limpios, sin exceso de decoración
- Instalar como PWA: el usuario va a Safari → compartir → "Añadir a pantalla de inicio"

---

## Orden de construcción sugerido

1. Scaffold del proyecto (`npm create vite@latest`)
2. Instalar dependencias (Tailwind, Supabase, React Router, vite-plugin-pwa)
3. Crear tablas en Supabase + activar RLS
4. Configurar cliente Supabase y autenticación
5. Pantalla de Login
6. CRUD de tipos de metro
7. Lista y creación de trabajos
8. Detalle del trabajo + añadir líneas
9. Flujo de cobro
10. Historial
11. Configurar PWA manifest e iconos
12. Deploy en Vercel
