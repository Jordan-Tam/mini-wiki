Repository for our Stevens CS-554 (Web Dev 2) final project

# Running everything with docker:

Requirements: having docker and docker compose setup and installed.

```
docker compose up --build
```

Afterwards, if only code changes:

```
docker compose up
```

If a dependency (package.json), Dockerfile, or the docker-compose file changes:

```
docker compose build
docker compose up
```

## IMPORTANT NOTE:

If you are running Docker on windows via WSL and you want to connect to the database and view it in mongodb compass, you need to connect with the connection string:

```
mongodb://{WSL2 IP Address}:27017/
```

as opposed to using localhost where the WSL2 IP Address goes.
