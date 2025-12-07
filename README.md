Repository for our Stevens CS-554 (Web Dev 2) final project

# Running everything with docker:

```
docker compose up --build
```

## (NEED TO TEST) Running docker with dev mode

Start db services only:

```
docker compose up -d mongo elasticsearch redis
```

Start backend locally:

```
# in backend/
npm install
npm run dev
npm run seed
```

Start frontend locally:

```
# in frontend/
npm install
npm run dev
```
