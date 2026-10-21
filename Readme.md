# Conflict-Aware Events & Expenses Manager

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-API-000000?logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Uploads-3448C5?logo=cloudinary&logoColor=white)

A full-stack MERN application that gives a club's team **one shared event calendar with automatic clash detection**, plus a simple **expense tracker** where bills are uploaded, verified, and deducted from the club's budget.

> Clashes are **flagged, never enforced**. The system highlights overlapping events so people can sort them out. It never cancels, rejects, or reschedules anything on its own.

---

## Table of Contents

- [Features](#features)
- [User Roles](#user-roles)
- [Tech Stack](#tech-stack)
- [How Conflict Detection Works](#how-conflict-detection-works)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)
- [Known Limitations & Roadmap](#known-limitations--roadmap)

---

## Features

- **Shared calendar**: month and week views powered by FullCalendar. Anyone can browse it without logging in.
- **Conflict detection**: days that contain overlapping events are highlighted in red, and logged-in users see exactly which events clash.
- **Role-based access**: separate login flows for Core members and Executives.
- **Event management**: logged-in users add events for a date; Core members can edit their own club's events.
- **Expense tracking**: executives upload a bill image and amount; core members review the bill history and verify bills.
- **Budget tracking**: each club has an allotted and a remaining amount. Verifying a bill deducts it from the remaining amount.
- **Bill storage**: receipts are uploaded to Cloudinary and kept as institutional records.
- **Persistent sessions**: Passport.js authentication with sessions stored in MongoDB.

## User Roles

| Role | How they sign in | What they can do |
| --- | --- | --- |
| **Guest** | No login | View the calendar and the events on any date |
| **Executive** | "Executive Member" login | Everything a guest can, plus add events, see conflict details, and upload bills |
| **Core member** | "Core Member" login | Everything an executive can, plus edit their own club's events and verify bills (which updates the club budget) |

Login requires four fields: **Admission Number, Email, Club Name, and Password**.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React (Vite), React Router, FullCalendar (`daygrid`, `timegrid`, `interaction`) |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Auth | Passport.js (`passport-local`), `express-session`, `connect-mongo` |
| File uploads | Multer + Cloudinary |

## How Conflict Detection Works

Event times are stored as minutes since midnight and dates as `YYYY-MM-DD` strings. Two events clash when they fall on the **same date** and their time ranges overlap:

```
startA < endB  AND  endA > startB
```

For example, a 5:00-7:00 PM workshop clashes with a 6:00-8:00 PM event, but it does **not** clash with an event that starts at exactly 7:00 PM. Back-to-back events are fine.

On the calendar, any date with at least one clash gets a red background. Logged-in users who open that date also see a list such as "**Workshop** conflicts with **Hackathon**".

## Project Structure

```
.
├── Backend/
│   ├── app.js                # Express server, auth, and all API routes
│   ├── cloudinaryconfig.js   # Cloudinary + Multer storage setup
│   ├── middleware.js         # loginmiddleware / editmiddleware
│   ├── ClubModel.js          # Club budget (allotted / left)
│   ├── CoreModel.js          # Core member accounts
│   ├── ExecutiveModel.js     # Executive accounts
│   ├── generalModel.js       # General user (username + email)
│   ├── eventModel.js         # Calendar events
│   ├── HistoryModel.js       # Uploaded bills and verification status
│   └── .env                  # Secrets (never commit this file)
│
└── Frontend/
    └── src/
        ├── App.jsx           # Routes: "/" calendar, "/new-page" club dashboard
        ├── Calender.jsx      # Calendar, login form, header
        ├── Box.jsx           # Side panel: day's events, conflicts, add/edit forms
        ├── Club.jsx          # Budget summary, bill upload, bill history and verification
        └── *.css             # Styles
```

> Folder names may differ in your copy of the repo. Adjust the `cd` commands below to match.

---

## Getting Started

Follow these steps in order. The whole setup takes about 15 minutes.

### Prerequisites

Install these first:

- [Node.js](https://nodejs.org/) **v18 or newer** (this also installs `npm`)
- [Git](https://git-scm.com/)
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) account
- A free [Cloudinary](https://cloudinary.com/users/register_free) account

Check your versions:

```bash
node -v
npm -v
```

### Step 1: Clone the repository

```bash
git clone https://github.com/<your-username>/<your-repo-name>.git
cd <your-repo-name>
```

### Step 2: Create a MongoDB Atlas database

1. Log in to MongoDB Atlas and create a **free (M0) cluster**.
2. Go to **Database Access** and click **Add New Database User**. Choose a username and password and save them.
3. Go to **Network Access** and click **Add IP Address**. Choose **Add Current IP Address** (or `0.0.0.0/0` for testing only).
4. Go to **Database**, click **Connect** on your cluster, choose **Drivers**, and copy the connection string. It looks like this:

   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. Replace `<username>` and `<password>` with the database user from step 2, and add a database name before the `?`, for example `/events-manager?`. If your password contains special characters such as `@` or `#`, URL-encode them.

### Step 3: Get your Cloudinary credentials

1. Log in to Cloudinary and open the **Dashboard**.
2. Copy your **Cloud name**, **API Key**, and **API Secret**.

### Step 4: Set up the backend

```bash
cd Backend
npm install
```

<details>
<summary>If <code>npm install</code> doesn't pull everything in, install the packages the backend uses manually</summary>

```bash
npm install express mongoose dotenv cors connect-mongo express-session passport passport-local bcrypt multer cloudinary multer-storage-cloudinary-v2
```

</details>

Create a file named `.env` inside `Backend/` and fill in your own values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/events-manager?retryWrites=true&w=majority
SESSION_SECRET=replace-this-with-a-long-random-string
cloud_Name=your_cloudinary_cloud_name
api_Key=your_cloudinary_api_key
api_Secret=your_cloudinary_api_secret
```

The Cloudinary variable names are **case-sensitive** and must be written exactly as shown (`cloud_Name`, `api_Key`, `api_Secret`), because that is how the code reads them.

To generate a strong `SESSION_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Make sure `.env` is listed in your `.gitignore` so your secrets are never pushed to GitHub:

```
node_modules/
.env
```

### Step 5: Add starter data

There is no sign-up page. Accounts and club budgets are created directly in the database. Add at least one club, one core member, and one executive.

In Atlas, open **Database → Browse Collections → your database**, then use **Insert Document** on each collection (collections are created automatically on first insert). Or run these in `mongosh`:

```js
use events-manager

db.clubs.insertOne({
  clubName: "ACM",
  allotedAmount: 50000,
  leftAmount: 50000
})

db.coremembers.insertOne({
  email: "core@example.com",
  AdmissionNumber: "CORE001",
  club: "ACM",
  password: "core1234",
  core: true
})

db.executives.insertOne({
  email: "exec@example.com",
  AdmissionNumber: "EXEC001",
  club: "ACM",
  password: "exec1234",
  core: false
})
```

| Collection | Holds | Important fields |
| --- | --- | --- |
| `clubs` | Budget per club | `clubName`, `allotedAmount`, `leftAmount` |
| `coremembers` | Core accounts | `email`, `AdmissionNumber`, `club`, `password`, `core: true` |
| `executives` | Executive accounts | `email`, `AdmissionNumber`, `club`, `password`, `core: false` |

The `club` / `clubName` value must match **exactly** (same spelling and capitalisation) across all three collections. These are demo credentials. Use your own for anything real.

### Step 6: Start the backend

From the `Backend/` folder:

```bash
node app.js
```

You should see:

```
listening
Successfully connected to MongoDB Atlas!
```

The API now runs at **http://localhost:8080**. Leave this terminal open.

### Step 7: Set up the frontend

Open a **second terminal** in the project root:

```bash
cd Frontend
npm install
```

<details>
<summary>If <code>npm install</code> doesn't pull everything in, install the packages the frontend uses manually</summary>

```bash
npm install react-router-dom @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
```

</details>

The frontend calls the API with relative URLs such as `/new/events`, so Vite must forward those requests to the backend. Make sure `Frontend/vite.config.js` contains this proxy:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/new': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
```

### Step 8: Start the frontend

```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

> The backend only accepts requests from `http://localhost:5173` (CORS is set to that origin), so keep the frontend on port 5173.

### Step 9: Try it out

1. **Browse as a guest**: click any date on the calendar to see its events.
2. **Log in**: scroll to the **Portal Login** card, pick **Core Member** or **Executive Member**, and enter the Admission Number, Email, Club Name, and Password from Step 5.
3. **Add events**: click a date, then use the **Add New Event** form in the side panel.
4. **See a conflict**: add two events on the same date with overlapping times (for example 17:00-19:00 and 18:00-20:00). The date turns red and the clash is listed in the side panel.
5. **Upload a bill** (executive): click **Upload Bills**, choose a `jpg`/`png` image, enter the amount, and submit.
6. **Verify a bill** (core member): click **Check and Update**, then **Fetch & Verify Bills**, and press **Verify** on a pending bill. The club's remaining amount drops by that bill's amount.

---

## Environment Variables

Set these in `Backend/.env`:

| Variable | Required | Description |
| --- | --- | --- |
| `MONGO_URI` | Yes | MongoDB Atlas connection string (include the database name) |
| `SESSION_SECRET` | Yes | Long random string used to sign session cookies |
| `cloud_Name` | Yes | Cloudinary cloud name |
| `api_Key` | Yes | Cloudinary API key |
| `api_Secret` | Yes | Cloudinary API secret |
| `NODE_ENV` | No | Set to `production` to make session cookies HTTPS-only |

Fixed in code: the backend port is `8080` and the allowed frontend origin is `http://localhost:5173`.

## API Reference

All routes are prefixed with `/new`.

| Method | Route | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/new/login/core` | Public | Core login. Body: `admissionNumber`, `email`, `club`, `password` |
| `POST` | `/new/login/executive` | Public | Executive login. Same body as above |
| `POST` | `/new/logout` | Session | Log out and destroy the session |
| `GET` | `/new/user` | Public | Returns the logged-in user, or `{ "Notfound": "server" }` |
| `GET` | `/new/all` | Public | All events (used to find conflicting dates) |
| `POST` | `/new/events` | Public | Events for one date. Body: the date as plain text (`YYYY-MM-DD`) |
| `POST` | `/new/add/:date` | Logged in | Add an event. Body: `title`, `startTime`, `endTime` (`HH:MM`) |
| `POST` | `/new/edit/:id` | Core, own club only | Edit an event's title and times |
| `POST` | `/new/bill` | Public | Upload a bill image (multipart field `slip`) to Cloudinary |
| `POST` | `/new/bill/submit` | Public | Save a bill record: `slip`, `amount`, `clubName`, `verified`, `uploadedBy` |
| `GET` | `/new/club/:club` | Public | Club budget (allotted and remaining) |
| `GET` | `/new/history/:club` | Public | Bill history for a club |
| `GET` | `/new/reduce/:amount/:club` | Public | Subtract an amount from the club's remaining budget |
| `GET` | `/new/verify/:id` | Public | Mark a bill as verified |

## Troubleshooting

| Problem | Likely cause and fix |
| --- | --- |
| Login or calendar requests return 404 or HTML | The Vite proxy is missing. Add the `proxy` block from Step 7 and restart `npm run dev`. |
| `Database connection error` on startup | Check `MONGO_URI`: correct username and password, your IP is allowed under **Network Access**, and special characters in the password are URL-encoded. |
| CORS error in the browser console | The frontend must run on `http://localhost:5173`. |
| Bill upload fails | Check that `cloud_Name`, `api_Key`, and `api_Secret` match your Cloudinary dashboard exactly, including capitalisation. Only `jpg`, `png`, and `jpeg` are intended. |
| "Invalid credentials provided" | All four fields must match a document in the right collection. Core accounts are in `coremembers`, executives in `executives`, and the club name is case-sensitive. |
| Stays logged out after refresh | Make sure you are on `http://localhost:5173` (not `127.0.0.1`) and that `NODE_ENV` is not set to `production` while testing over plain HTTP. |
