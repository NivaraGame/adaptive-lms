# Adaptive LMS Frontend

React + TypeScript + Vite frontend for the Adaptive Learning Management System.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Backend API running on `http://localhost:8000`

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

See `.env.example` for a template.

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at: **http://localhost:5173**

### 4. Verify Backend Connection

Make sure the backend API is running before starting the frontend:

```bash
# In the backend directory
cd ../backend
uvicorn app.main:app --reload
```

The backend should be accessible at `http://localhost:8000/docs` (Swagger UI).

## Available Scripts

- **`npm run dev`** - Start development server with hot reload
- **`npm run build`** - Build for production
- **`npm run preview`** - Preview production build locally
- **`npm run lint`** - Run ESLint to check code quality

## Project Structure

```
frontend/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable React components
│   ├── pages/       # Page components
│   ├── services/    # API service layer
│   ├── types/       # TypeScript type definitions
│   ├── store/       # State management (optional)
│   ├── App.tsx      # Root component
│   └── main.tsx     # Application entry point
├── index.html       # HTML template
├── vite.config.ts   # Vite configuration
└── tsconfig.json    # TypeScript configuration
```

## Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Axios** - HTTP client

## Development

### Backend API Integration

The frontend communicates with the backend API at `/api/v1/*` endpoints. Vite proxy is configured to forward these requests to the backend server.

### CORS Configuration

The backend is configured to allow requests from `http://localhost:5173`. If you change the dev server port, update the backend CORS settings in `backend/app/config.py`.

### Hot Module Replacement (HMR)

Vite provides fast HMR for instant feedback during development. Changes to React components will be reflected immediately without full page reload.

## Building for Production

```bash
npm run build
```

The optimized production build will be created in the `dist/` directory.

To preview the production build:

```bash
npm run preview
```

## Troubleshooting

### Cannot connect to backend

- Verify backend is running: `curl http://localhost:8000/api/v1/content`
- Check CORS configuration in `backend/app/config.py`
- Verify `VITE_API_BASE_URL` in `.env` file

### Port 5173 already in use

Vite will automatically try the next available port (5174, 5175, etc.). Update backend CORS settings if needed.

### TypeScript errors

```bash
# Check for type errors
npx tsc --noEmit
```

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Backend API Documentation](http://localhost:8000/docs)

## Week 4 Implementation Status

This frontend is being developed according to the Week 4 plan. See `docs/weeks/week_4.md` for detailed implementation checklist.

### Completed
- ✅ Project initialization with Vite
- ✅ TypeScript configuration
- ✅ Development server setup

### In Progress
- 🔄 Core dependencies installation
- 🔄 API service layer
- 🔄 Routing setup
- 🔄 React Query configuration

### Upcoming
- ⏳ Learning interface (Week 5)
- ⏳ Dashboard and analytics (Week 6)
