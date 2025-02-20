# EcoRide

C'est un site de covoiturage

## Installation

### Prerequisites
- PHP >= 8.2
- Composer
- Node.js and npm
- Docker and Docker Compose

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd EcoRide
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Install Node.js dependencies:
   ```bash
   npm install
   ```

4. Set up the database using Docker:
   ```bash
   docker-compose up -d
   ```

5. Run database migrations:
   ```bash
   php bin/console doctrine:migrations:migrate
   ```

6. Start the application:
   ```bash
   php bin/console server:run
   ```

The application should now be running at http://localhost:8000
