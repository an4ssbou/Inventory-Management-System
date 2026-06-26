# Inventory Management System

Inventory Management System is a MERN stack web application for managing hospital equipment inventory, loan requests, users, and administrative workflows.

## Features

- User authentication with JWT
- Role-based admin dashboard
- Equipment catalogue with availability status
- Equipment loan request workflow
- Admin approval and rejection of requests
- Automatic material status updates after validation
- CSV export for requests
- Responsive React interface for desktop and mobile
- Basic security hardening with Helmet, CORS, validation, and rate limiting
- Email notification support through Gmail app password or OAuth2

## Tech Stack

### Front-end

- React
- Vite
- Tailwind CSS
- Flowbite React
- Material UI
- Axios
- React Router

### Back-end

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Zod validation
- Nodemailer
- Helmet
- Express Rate Limit

## Project Structure

```text
Inventory-Management-System/
├── client/          # React front-end
├── server/          # Express/MongoDB back-end
├── README.md
└── .gitignore
```

## Requirements

- Node.js 18+
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Environment Variables

Create `server/.env` from `server/.env.example`:

```env
NODE_ENV=development
PORT=4000
MONGO=mongodb://127.0.0.1:27017/inventory_management
JWT_SECRET=replace_with_a_strong_secret
JWT_EXPIRES_IN=3h
CLIENT_ORIGIN=http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174
JSON_BODY_LIMIT=1mb
LOGIN_RATE_LIMIT=20
MAX_UPLOAD_SIZE=2097152
ALLOW_PUBLIC_SIGNUP=false
EMAIL=your-email@gmail.com
EMAIL_APP_PASSWORD=your-gmail-app-password
BOOTSTRAP_ADMIN_TOKEN=replace_with_a_temporary_strong_token
CLIENT_ID=
CLIENT_SECRET=
REFRESH_TOKEN=
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
```

Create `client/.env` if needed:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Do not commit real `.env` files. Use `.env.example` for documentation only.

## Installation

Install back-end dependencies:

```bash
cd server
npm install
```

Install front-end dependencies:

```bash
cd client
npm install
```

## Run Locally

Start MongoDB first, then start the API:

```bash
cd server
npm start
```

Start the front-end in another terminal:

```bash
cd client
npm run dev
```

Default URLs:

- Front-end: `http://localhost:5173`
- Back-end API: `http://localhost:4000`

## Build

```bash
cd client
npm run build
```

## Quality Checks

```bash
cd client
npm run lint
```

```bash
cd server
npm audit
```

## Security Notes

- Keep `server/.env` private.
- Use a strong `JWT_SECRET` in production.
- Restrict `CLIENT_ORIGIN` to the deployed front-end domain.
- Use MongoDB credentials with least privilege.
- Rotate Gmail app passwords or OAuth credentials if exposed.
- Run dependency audits before deployment.

## Deployment Notes

- Deploy `server` as the API service.
- Deploy `client/dist` after running `npm run build`.
- Configure production environment variables in the hosting provider.
- Make sure CORS allows only the production front-end URL.


## Free Deployment

Recommended free-friendly setup:

- Front-end: Vercel or Netlify
- Back-end API: Render Web Service
- Database: MongoDB Atlas free cluster

### Back-end on Render

1. Create a new Render Web Service from this GitHub repository.
2. Use `server` as the root directory, or use the included `render.yaml` blueprint.
3. Set the environment variables from `server/.env.example`.
4. Use a MongoDB Atlas connection string for `MONGO`; local MongoDB will not work online.
5. Set `CLIENT_ORIGIN` to the deployed front-end URL, for example:

```env
CLIENT_ORIGIN=https://your-frontend-domain.vercel.app
```

### Front-end on Vercel

1. Import the GitHub repository in Vercel.
2. Set the root directory to `client`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Add this environment variable:

```env
VITE_API_BASE_URL=https://your-render-api.onrender.com
```

### Front-end on Netlify

1. Import the GitHub repository in Netlify.
2. Set the base directory to `client`.
3. Build command: `npm run build`.
4. Publish directory: `client/dist` or `dist` if the base directory is already `client`.
5. Add `VITE_API_BASE_URL` with the deployed API URL.


## Create the First Production Admin

If the production database is empty, create the first admin with the temporary bootstrap endpoint. Set `BOOTSTRAP_ADMIN_TOKEN` in the API environment first, then call:

```bash
curl -X POST https://your-api-url.onrender.com/api/bootstrap-admin \
  -H "Content-Type: application/json" \
  -H "x-bootstrap-token: YOUR_BOOTSTRAP_ADMIN_TOKEN" \
  -d '{"nom":"Admin","prénom":"Production","email":"admin@example.com","password":"Admin12345","Phone":"0600000000"}'
```

After the admin is created, remove `BOOTSTRAP_ADMIN_TOKEN` from the production environment and redeploy. The endpoint also refuses to create another admin if one already exists.
