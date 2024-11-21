# FXQL Statement Parser

## Setup Instructions
Follow these steps to set up the project:

### Prerequisites
Ensure you have the following installed on your system:

- Node.js (version 16 or higher)
- npm or yarn
- MongoDB (if the project uses a database)
- Git

* Clone the repository:

```bash
$ git clone <repository-url>
```

```bash
$ cd <project-directory>
```

* Installation

## Installation

```bash
$ npm install
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

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov

# Docker coverage
$ docker-compose up --build
```

## Perculiarities
- Mongodb database was used instead of Postgres. 
- A user.guard.ts module simulates an authentication guard for users.
- An access token is included to the submission for API testing.


Documentation link: 

```bash
 https://documenter.getpostman.com/view/26141564/2sAYBSjtQq
```
