# ChitChat App

A real-time 1-to-1 chat application built with React, Express, PostgreSQL, and WebSocket.

## Features
- User registration and login with JWT authentication (httpOnly cookies)
- Protected REST API routes
- Real-time messaging via WebSocket
- Persistent message history stored in PostgreSQL

## Tech Stack
**Frontend:** React, Vite, Tailwind CSS, Axios, React Router
**Backend:** Node.js, Express, PostgreSQL, ws (WebSocket), JWT, bcrypt
**Infra:** Docker, Docker Compose

## Running with Docker (recommended)

1. Clone this repository:
git clone https://github.com/Priyanka-Sugumar/chitchat-app.git
cd ChitChat-APP

2. Copy the example environment file:
cp .env.example .env

3. Open `.env` and fill in any values you like for `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and `JWT_SECRET`.
   
4. Build and start everything:
docker compose up --build

5. Once you see `Server is running on port 5001` in the terminal, open:

http://localhost:5174


6. Register a new account to get started — the database starts empty, so you'll need to create at least two accounts to test messaging between users.

To stop everything:
docker compose down


To stop and completely wipe the database (start fully fresh next time):
docker compose down -v


## API Overview

| Method | Endpoint                   | Description                                   |
|--------|----------------------------|------------------------------------------     |
| POST   | `/api/auth/register`       | Create a new account                          |
| POST   | `/api/auth/login`          | Log in, sets an httpOnly JWT cookie           |
| POST   | `/api/auth/logout`         | Clears the auth cookie                        |
| GET    | `/api/auth/me`             | Returns the logged-in user (protected)        |
| GET    | `/api/users`               | Lists all other users (protected)             |
| GET    | `/api/messages/:userId`    | Conversation history with a user (protected)  |
| WS     | `/ws`                      | Real-time message delivery                    |

## Project Structure

ChitChat-APP/
├── BackEnd/
│ ├── config/ # DB connection + schema.sql
│ ├── middleware/ # JWT auth middleware
│ ├── routes/ # auth, users, messages
│ ├── ws/ # WebSocket server
│ └── server.js
├── FrontEnd/
│ └── src/
│ ├── pages/ # Home, Login, Register, Chat
│ └── App.jsx
├── docker-compose.yml
└── .env.example