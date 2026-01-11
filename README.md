# Athlete Recruiting & NIL Showcase Platform

A comprehensive digital recruiting and NIL (Name, Image, Likeness) showcase platform for athletes. Think of it like 247Sports + Instagram + NIL marketplace, but simpler.

## What It Does

The platform does three things:
1. **Collects athlete information** - Comprehensive profiles with stats, videos, and social media
2. **Turns that information into a 1-5 star rating** - Transparent, weighted algorithm
3. **Shows those ratings to colleges and brands** - Searchable directory with filters

## Features

### For Athletes
- Create comprehensive profiles with personal info, sports data, and media
- Automatic star rating (1-5 stars) based on weighted performance metrics
- View detailed rating breakdown showing why they got their score
- Showcase performance stats and highlight videos
- Control profile visibility (public/private)

### For Coaches & Brands
- Search athletes by sport, star rating, location, graduation year
- View detailed athlete profiles and rating breakdowns
- Filter and sort to find the right prospects
- Access performance stats and highlight videos

### User Roles
- **Athlete** - Create and manage their own profile
- **Coach** - Search and view athlete profiles
- **Brand** - Discover athletes for NIL opportunities
- **Admin** - Manage all profiles, override ratings

## Star Rating System

The platform uses a transparent, weighted rating algorithm:

| Component | Weight | Description |
|-----------|--------|-------------|
| Performance | 40% | On-field/court performance metrics |
| Physical | 20% | Physical attributes and measurables |
| Academic | 15% | Academic standing and eligibility |
| Social | 15% | Social media presence and NIL potential |
| Evaluation | 10% | Coach and scout evaluations |

### Star Ratings
| Score | Stars | Tier Label |
|-------|-------|------------|
| 90-100 | 5.0 ⭐⭐⭐⭐⭐ | Elite NIL Prospect |
| 80-89 | 4.5 ⭐⭐⭐⭐½ | Power 5 Ready |
| 70-79 | 4.0 ⭐⭐⭐⭐ | D1 Potential |
| 60-69 | 3.5 ⭐⭐⭐½ | High D1/Mid-Major |
| 50-59 | 3.0 ⭐⭐⭐ | Solid College Athlete |
| 40-49 | 2.5 ⭐⭐½ | D2/D3 Prospect |
| 30-39 | 2.0 ⭐⭐ | Developmental |
| 20-29 | 1.5 ⭐½ | Emerging Talent |
| 0-19 | 1.0 ⭐ | Early Stage |

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js (REST API)
- **Database**: PostgreSQL with TypeORM
- **Cache/Sessions**: Redis
- **Authentication**: Express sessions with bcrypt

### Frontend
- **Web**: React.js with TypeScript
- **Mobile**: React Native with Expo
- **UI Library**: Ant Design
- **HTTP Client**: Axios
- **Forms**: Formik with Yup validation

### Testing
- **Backend**: Jest + Supertest
- **Frontend**: React Testing Library

## Project Structure

```
packages/
├── server/          # Express REST API backend
│   ├── src/
│   │   ├── entity/          # TypeORM entities (User, Athlete, etc.)
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic (rating, etc.)
│   │   ├── middleware/      # Auth, validation, etc.
│   │   └── __tests__/       # Unit & integration tests
│   └── ...
├── web/             # React.js website
│   ├── src/
│   │   ├── modules/         # Feature-based components
│   │   │   └── athlete/     # Athlete directory, profile, etc.
│   │   └── routes/          # React Router setup
│   └── ...
├── app/             # React Native mobile app
├── controller/      # Shared UI logic (controllers)
└── common/          # Shared code (validation, API client)
```

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register        # Register new user
POST   /api/v1/auth/login           # Login
POST   /api/v1/auth/logout          # Logout
GET    /api/v1/auth/me              # Get current user
POST   /api/v1/auth/forgot-password # Request password reset
POST   /api/v1/auth/reset-password  # Reset with token
```

### Athletes
```
GET    /api/v1/athletes             # List athletes (with filters)
GET    /api/v1/athletes/search      # Search athletes
GET    /api/v1/athletes/me/profile  # Get my athlete profile
GET    /api/v1/athletes/:id         # Get athlete by ID
POST   /api/v1/athletes             # Create athlete profile
PUT    /api/v1/athletes/:id         # Update athlete
DELETE /api/v1/athletes/:id         # Delete athlete
```

### Ratings
```
GET    /api/v1/ratings/:athleteId/breakdown  # Get rating breakdown
PUT    /api/v1/ratings/:athleteId            # Update rating components
POST   /api/v1/ratings/calculate/:athleteId  # Recalculate (admin)
```

## Installation

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- Redis (v6+)
- Yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/athlete-recruiting-platform.git
cd athlete-recruiting-platform
```

2. **Install dependencies**
```bash
yarn install
```

3. **Set up environment variables**
```bash
cp .env.example packages/server/.env
# Edit .env with your values
```

4. **Set up PostgreSQL**
```bash
# Create database
createdb athlete_db

# Connect and enable UUID extension
psql athlete_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
\q
```

5. **Start Redis**
```bash
redis-server
```

6. **Build shared packages**
```bash
cd packages/common && yarn build
cd ../controller && yarn build
```

7. **Start the server**
```bash
cd packages/server
yarn start
```

8. **Start the web app (in another terminal)**
```bash
cd packages/web
yarn start
```

## Running Tests

### Backend Tests
```bash
cd packages/server

# Run all tests
yarn test

# Run with coverage
yarn test:coverage

# Run specific test file
yarn test rating.service.test
yarn test auth.test
yarn test athletes.test
```

### Frontend Tests
```bash
cd packages/web
yarn test
```

## Environment Variables

See `.env.example` for all available configuration options:

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | development |
| `PORT` | Server port | 4000 |
| `FRONTEND_HOST` | Frontend URL for CORS | http://localhost:3000 |
| `DATABASE_*` | PostgreSQL connection settings | - |
| `REDIS_URL` | Redis connection URL | redis://localhost:6379 |
| `SESSION_SECRET` | Secret for session encryption | - |
| `SPARKPOST_API_KEY` | Email service API key | - |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Roadmap

### Phase 2 (Planned)
- [ ] Sport-specific rating weights
- [ ] Rating trend tracking over time
- [ ] Coach evaluations and endorsements
- [ ] Advanced search with saved filters
- [ ] Email notifications

### Phase 3 (NIL Marketplace)
- [ ] NIL valuation score
- [ ] Brand deal listings
- [ ] Commission tracking
- [ ] Payment processing

### Phase 4 (AI & Analytics)
- [ ] AI-powered growth projections
- [ ] School fit modeling
- [ ] Regional dominance scores
- [ ] Comparative analytics

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Originally based on [fullstack-graphql-airbnb-clone](https://github.com/benawad/fullstack-graphql-airbnb-clone) by Ben Awad
- Transformed from GraphQL to REST API architecture
- Enhanced with athlete recruiting and NIL features
