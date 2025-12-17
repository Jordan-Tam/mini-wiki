Repository for our Stevens CS-554 (Web Dev 2) final project

# Mini Wiki - Setup Instructions

## Prerequisites

- Docker and Docker Compose installed on your system
- Port 5173 (frontend), 3000 (backend), 27017 (MongoDB), 9200 (Elasticsearch), and 6379 (Redis) available

## Quick Start

### First Time Setup

**NOTE**: On Windows, make sure you have docker set to use WSL2 as the engine (see Docker Desktop's general settings) and that you run all the docker commands in a WSL Terminal!

1. Clone the repository and navigate to the project directory
2. Run all services with Docker Compose:

```bash
docker compose up --build
```

3. Wait for all services to start. The application will:

   - Start Elasticsearch, MongoDB, and Redis
   - Build and start the backend API server
   - Build and start the frontend development server
   - Automatically seed the database with initial data

4. Once all services are running, access the application: http://localhost:5173

### Regular Development Workflow

For subsequent runs (when only code changes), and use the `-d` flag to not show all logs for all services:

```bash
docker compose up [-d]
```

**Note**: The seed service will run each time, which clears and repopulates the database. If you want to preserve existing data, start only the main services, and use the `-d` flag to not show all logs for all services:

```bash
docker compose up [-d] elasticsearch mongo redis backend frontend
```

### When Dependencies Change

If you update `package.json`, `Dockerfile`, or `docker-compose.yml`:

```bash
docker compose build
docker compose up [-d]
```

**Note**: This will also reseed the database. To preserve data while rebuilding, use:

```bash
docker compose build
docker compose up [-d] elasticsearch mongo redis backend frontend
```

### Viewing Only Specific Service Logs

To reduce log noise and only see backend/frontend logs, use the `-d` flag and then connect to the logs of the specific services you want to see the logs for (in this example, just backend/frontend):

```bash
docker compose up -d
docker compose logs -f backend frontend
```

### Stopping the Application

To stop all services:

```bash
docker compose down
```

To stop and remove all volumes (complete cleanup):

```bash
docker compose down -v
```

## Hot Reload / Live Development

- **Frontend**: Vite will automatically reload when you save changes to files in `frontend/src/`
- **Backend**: TypeScript changes are available immediately via the volume mount and `ts-node`. However, the server does not auto-reload. To apply changes, restart the backend container:

```bash
docker compose restart backend
```

**Note**: Only rebuild if you change `package.json`, `Dockerfile`, or other build configuration:

```bash
docker compose up -d --build backend
```

## Database Access

### MongoDB Connection

**From your host machine (e.g., MongoDB Compass):**

- **Linux/Mac**: `mongodb://localhost:27017/`
- **Windows (WSL)**: `mongodb://{WSL2_IP_ADDRESS}:27017/`

To find your WSL2 IP address on Windows, run in PowerShell:

```powershell
wsl hostname -I
```

### Redis

You can access the redis cache by executing `docker exec -it miniwiki-redis redis-cli`

## Reseeding the Database

The seed service runs automatically with `docker compose up` (clears and repopulates data). To reseed manually without starting all services:

```bash
docker compose run --rm seed
```

### When You Need to Clear All Data

If you make changes to the database schema or data structure that are incompatible with existing data, you'll need to clear everything and reseed:

```bash
docker compose down -v
docker compose up -d elasticsearch mongo redis backend
docker compose run --rm seed
```

The `-v` flag removes all volumes, which deletes all MongoDB data, Elasticsearch indices, and forces a fresh database state.

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + TypeScript + Express
- **Database**: MongoDB
- **Search**: Elasticsearch
- **Cache**: Redis
