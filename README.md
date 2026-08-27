# FoodOrder - Food Ordering Web Application

A production-ready food ordering web application built with React + FastAPI + PostgreSQL. Deployable entirely on free tiers.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, Zustand |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2.x (async), asyncpg |
| Database | PostgreSQL (Neon Free Tier) |
| Auth | JWT (OAuth2 Password Flow), bcrypt |
| Testing | pytest, httpx |

## Project Structure

```
food-ordering-app/
├── backend/          # FastAPI backend
│   ├── app/
│   │   ├── api/      # Route modules
│   │   ├── core/     # Config, security, dependencies
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   └── db/       # Database setup, seed data
│   ├── tests/        # pytest tests
│   ├── alembic/      # Database migrations
│   └── main.py       # App entry point
├── frontend/         # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/    # Zustand stores
│   │   ├── types/
│   │   └── lib/      # API client, utilities
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```

## Local Development

### Prerequisites

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

### Using Docker (Recommended)

```bash
# Start all services
docker-compose up --build

# Run migrations
docker-compose exec backend python -m app.db.seed

# Access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Copy and configure .env
cp .env.example .env

# Run migrations
alembic upgrade head

# Seed demo data
python -m app.db.seed

# Start server
uvicorn main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Demo Credentials

| Email | Password |
|-------|----------|
| demo@example.com | Demo123! |
| alice@example.com | Alice123! |
| bob@example.com | Bob123! |

## API Endpoints

### Auth
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login (OAuth2 form)
- `POST /auth/refresh` - Refresh JWT token
- `GET /auth/me` - Get current user

### Restaurants
- `GET /restaurants` - List with filters (cuisine, rating, price, veg_only, city, search)
- `GET /restaurants/{id}` - Restaurant detail with menu
- `GET /restaurants/{id}/menu` - Restaurant menu

### Menu
- `GET /menu-items` - Search menu items
- `GET /menu-items/{id}` - Menu item detail

### Cart
- `GET /cart` - Get cart
- `POST /cart/items` - Add item
- `PUT /cart/items/{id}` - Update quantity
- `DELETE /cart/items/{id}` - Remove item
- `DELETE /cart` - Clear cart
- `POST /cart/calculate` - Calculate pricing

### Orders
- `POST /orders` - Create order from cart
- `GET /orders` - List user orders
- `GET /orders/{id}` - Order detail
- `PATCH /orders/{id}/cancel` - Cancel order

### Payments (Simulated)
- `POST /payments/process` - Process mock payment (95% success)
- `GET /payments/{order_id}/status` - Payment status

### Delivery
- `GET /deliveries/{order_id}/status` - Delivery status
- `POST /deliveries/{order_id}/simulate-progress` - Simulate progress

### Coupons
- `GET /coupons/validate/{code}` - Validate coupon

### Users
- `GET /users/preferences` - Get preferences
- `PUT /users/preferences` - Update preferences

### Health
- `GET /health` - Health check (no auth)

## Deployment to Free Tiers

### Step 1: Database (Neon PostgreSQL)

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the `DATABASE_URL` from the dashboard
4. Format: `postgresql+asyncpg://user:password@host/database?sslmode=require`

### Step 2: Backend (Render)

1. Push code to GitHub
2. Create a free account at [render.com](https://render.com)
3. Create a new **Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Build Command:** `cd backend && pip install -r requirements.txt`
   - **Start Command:** `cd backend && alembic upgrade head && python -m app.db.seed && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Python Version:** 3.11
6. Add environment variables:
   ```
   DATABASE_URL=<your-neon-url>
   SECRET_KEY=<generate-a-random-key>
   CORS_ORIGINS=https://your-app.vercel.app
   ENVIRONMENT=production
   ```
7. Deploy and verify `/health` endpoint

> **Note:** Render free tier has cold starts (spins down after inactivity). First request may take 30-60 seconds.

### Step 3: Frontend (Vercel)

1. Create a free account at [vercel.com](https://vercel.com)
2. Import your GitHub repo
3. Set framework to **Vite**
4. Set root directory to `frontend`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-app.onrender.com
   ```
6. Deploy

### Step 4: Final Configuration

1. Add your Vercel domain to Render's `CORS_ORIGINS`
2. Run migrations against Neon:
   ```bash
   cd backend
   alembic upgrade head
   python -m app.db.seed
   ```
3. Test end-to-end

## Testing

```bash
cd backend
pytest -v
```

## Mock Payment System

All payments are simulated. Card and UPI payments have a 95% success rate. No real money is involved. COD always succeeds.

## Delivery Simulation

Use the "Simulate Progress" button on the order detail page to advance through delivery states:

```
PLACED → CONFIRMED → PREPARING → READY_FOR_PICKUP → OUT_FOR_DELIVERY → DELIVERED
```

## Environment Variables

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection string | - |
| SECRET_KEY | JWT signing key | - |
| ACCESS_TOKEN_EXPIRE_MINUTES | Access token TTL | 30 |
| REFRESH_TOKEN_EXPIRE_DAYS | Refresh token TTL | 7 |
| CORS_ORIGINS | Comma-separated allowed origins | http://localhost:5173 |
| ENVIRONMENT | development/production | development |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:8000 |

## License

MIT
