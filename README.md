# 🎮 Battle Pass Pro

Aplicación gamificada de gestión de tareas con sistema de Pase de Batalla. Completa tareas, gana XP, sube de nivel y desbloquea recompensas.

## ✨ Características

- **Sistema de niveles** — Gana XP completando tareas y sube de nivel (cada 100 XP = 1 nivel)
- **Dos modos de XP** — Clásico (suma lineal) o Actual (multiplicador combinado)
- **Pase de batalla** — Visualiza niveles desbloqueables con sus recompensas en un grid paginado
- **Tareas recurrentes** — Asigna tareas a días de la semana y se generan automáticamente
- **Inventario** — Reclama y revisa recompensas desbloqueadas y obtenidas
- **Panel de administración** — Crea tareas personalizadas y recompensas con imagen
- **Animaciones** — Efectos visuales al subir de nivel (popup con confeti y toast)
- **Persistencia local** — Todo el progreso se guarda automáticamente en `localStorage`

## 🛠️ Stack

| Tecnología | Versión |
|------------|---------|
| [React](https://react.dev) | 19.2 |
| [Vite](https://vitejs.dev) | 8.0 |
| [Tailwind CSS](https://tailwindcss.com) | 4.3 |
| [PostCSS](https://postcss.org) | 8.5 |
| [ESLint](https://eslint.org) | 10.3 |

## 🚀 Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (HMR)
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview

# Ejecutar linter
npm run lint
```

## 📁 Estructura del proyecto

```
src/
├── assets/              # Recursos estáticos (imágenes, SVG)
├── components/
│   ├── Admin/           # Panel de administración (tareas, recompensas)
│   ├── BattlePass/      # Vista del pase de batalla
│   ├── Config/          # Configuración de XP y gestión de datos
│   ├── Dashboard/       # Panel principal (progreso, tareas, grid)
│   ├── Header/          # Encabezado de la aplicación
│   ├── Inventory/       # Inventario de recompensas
│   ├── LevelUpPopup/    # Modal de subida de nivel con confeti
│   ├── LevelUpToast/    # Notificación toast de subida de nivel
│   └── Navigation/      # Navegación por pestañas
├── hooks/               # Custom hooks de React
│   ├── useGameState.js      # Estado global del juego
│   ├── useLevelUp.js        # Detección de subida de nivel
│   ├── useRegisterAnimation.js  # Animación de registro de XP
│   └── useXpAnimation.js    # Animación de contador de XP
├── App.jsx              # Componente raíz
├── index.css            # Estilos globales + Tailwind
└── main.jsx             # Punto de entrada
```

