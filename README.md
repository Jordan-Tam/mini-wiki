Repository for our Stevens CS-554 (Web Dev 2) final project

# Running everything with docker:

Requirements: having docker and docker compose setup and installed.

```
docker compose up --build
```

## (NEED TO TEST) Running docker with dev mode

Start db services only:

```
docker compose up -d mongo elasticsearch redis
```

Run seed script:

```
docker compose up seed
```

Start backend locally:

```
# in backend/
npm install
npm run dev
```

Start frontend locally:

```
# in frontend/
npm install
npm run dev
```

## IMPORTANT NOTE:

If you are running Docker on windows via WSL and you want to connect to the database and view it in mongodb compass, you need to connect with the connection string:

```
mongodb://{WSL2 IP Address}:27017/
```

as opposed to using localhost where the WSL2 IP Address goes.
