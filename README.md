## Description

Test project with email notifications REST API

## Installation

```bash
# packages/dependencies
$ npm install

# rename .env.example to .env
$ mv .env.example .env

# start docker containers for local development
$ docker-compose up -d
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests (docker containers must be running on localhost!)
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
