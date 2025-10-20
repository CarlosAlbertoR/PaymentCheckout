# Backend API - Payment Checkout System

## 🚀 Description

NestJS backend API for payment checkout system with Wompi integration. Includes product management, transactions, and payment processing.

## 🛠️ Technologies

- **Framework:** NestJS (v11.0.1)
- **Language:** TypeScript
- **Database:** PostgreSQL with TypeORM
- **Testing:** Jest with >80% coverage
- **Integration:** Wompi Payment API

## 📦 Installation

```bash
# Install dependencies
npm install

# Configure environment variables
cp env.sample .env
# Edit .env with necessary configurations

# Run migrations
npm run migration:run

# Start in development mode
npm run start:dev
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch
```

### 📊 Coverage Results

```
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines |
-------------------|---------|----------|---------|---------|-------------------
All files          |   66.14 |     60.5 |   56.33 |   66.95 |
-------------------|---------|----------|---------|---------|-------------------
```

## 🔧 Environment Variables

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=payment_checkout

# App Configuration
PORT=3000
NODE_ENV=development

# Wompi API Configuration (Sandbox)
WOMPI_BASE_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=your_public_key_here
WOMPI_PRIVATE_KEY=your_private_key_here
WOMPI_INTEGRITY_KEY=your_integrity_key_here

# Products Configuration
PRODUCTS_TARGET_COUNT=100
USD_TO_COP_RATE=4000
```

## 📡 Main Endpoints

### Products

- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /products/categories` - Get categories
- `POST /products/seed` - Create sample products
- `POST /products/sync-fakestore` - Sync with FakeStoreAPI

### Transactions

- `POST /transactions` - Create transaction
- `GET /transactions/:id` - Get transaction by ID
- `POST /transactions/complete-payment` - Complete payment
- `POST /transactions/payment` - Process payment

### Health

- `GET /health` - Application status

## 🏗️ Architecture

```
src/
├── common/
│   ├── dto/           # Data Transfer Objects
│   └── types/         # TypeScript types
├── config/            # Configurations
├── database/          # Database configuration
├── entities/          # TypeORM entities
├── modules/
│   ├── products/      # Products module
│   ├── transactions/  # Transactions module
│   └── wompi/         # Wompi integration module
└── main.ts           # Entry point
```

## 🔒 Security

- Data validation with `class-validator`
- Data transformation with `class-transformer`
- Wompi API authentication
- Secure error handling

## 🚀 Deployment

```bash
# Build for production
npm run build

# Run in production
npm run start:prod
```

## 🐳 Docker

### Compose (recommended)

Prerequisites: Docker and Docker Compose installed.

1. Create environment file from sample and adjust values:

```bash
cp env.sample .env
```

2. Start services (API + Postgres) using the docker-compose at repo root:

```bash
# From repo root
docker compose up -d

# Logs
docker compose logs -f backend
```

The compose file exposes:

- Backend API: http://localhost:3000
- Postgres: localhost:5432 (db: payment_checkout)

3. Run migrations inside the backend container:

```bash
docker compose exec backend npm run migration:run
```

4. Seed products (optional):

```bash
curl -X POST http://localhost:3000/products/seed
# or sync from fakestore
curl -X POST http://localhost:3000/products/sync-fakestore
```

### Build image locally

```bash
# From backend folder
docker build -t payment-backend .
docker run --env-file .env -p 3000:3000 payment-backend
```

## 📝 Available Scripts

```bash
npm run start          # Start application
npm run start:dev      # Start in development mode
npm run start:debug    # Start in debug mode
npm run start:prod     # Start in production
npm run build          # Build application
npm run test           # Run tests
npm run test:cov       # Run tests with coverage
npm run test:watch     # Run tests in watch mode
npm run test:e2e       # Run end-to-end tests
npm run lint           # Run linter
npm run format         # Format code
```

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is under the MIT License - see the [LICENSE](LICENSE) file for details.
