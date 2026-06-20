# 🌿 MindWell — A Simple Mental Wellness Journal

MindWell is a privacy-first mental wellness journal. Users can write guided journal entries, log their mood and energy levels, visualize their emotional trends over time, and use a calming breathing exercise — all while their private thoughts stay encrypted, even from the database itself.

## 🔐 Security Note: Our Encryption Strategy

**Data privacy is the #1 feature of this app, not an afterthought.**

- **Journal entry content is encrypted using AES-256** (via the `crypto-js` library) **before it is ever written to MongoDB.**
- This is implemented at the Mongoose schema level (`backend/models/JournalEntry.js`) using a `set` transform: every time `content` is assigned to a `JournalEntry` document, it is automatically encrypted. A matching `get` transform automatically decrypts it back to plain text only when the application reads it (e.g., to show the entry to its owner).
- **Result:** if someone looked directly at the `journalentries` collection in MongoDB (e.g. a database admin, a leaked backup, or an attacker who gains DB access), they would only see unreadable ciphertext — never the user's actual journal text.
- The encryption key (`ENCRYPTION_KEY`) lives only in server-side environment variables. It is never stored in the database, never sent to the frontend, and never committed to source control (`.env` is gitignored).
- **Passwords** are never stored or compared in plain text either — they're hashed with **bcrypt** (`bcryptjs`) before being saved to the `User` model.
- **Authentication** uses JWTs (JSON Web Tokens) so that each user can only ever read their own journal entries — enforced on every protected route via `middleware/authMiddleware.js`.

### Proving it works
To verify encryption is working, open your MongoDB Atlas collection viewer after creating a journal entry. The `content` field will show a long unreadable string (ciphertext) — not your actual journal text. A screenshot of this should be included in project documentation as proof.

## ✨ Features

**Phase 1 — Secure Journaling**
- Daily rotating guided prompts (e.g. "What made you smile today?")
- AES-256 encryption at rest for all journal content

**Phase 2 — Mood Tracking & Analytics**
- Mood (1–10) and energy (1–10) sliders, plus emotion tagging
- "Mood over Time" line chart and "Most Common Emotions" pie chart (Chart.js)
- MongoDB aggregation pipelines for weekly mood averages (premium feature)

**Phase 3 — Interactive Wellness Tools**
- 4-7-8 breathing assistant with a smooth, animated expanding/contracting circle (Framer Motion)
- Minimalist, calming UI with a soft sage/cream palette
- Full Dark Mode support

**Phase 4 — Monetization & Data Freedom**
- Freemium model: free users see the last 7 days of mood data; premium unlocks full history + weekly averages
- One-click JSON data export of all journal entries (GDPR-style data portability)

## 🏗️ Tech Stack

- **Frontend:** React.js, React Router, Framer Motion, Chart.js (via react-chartjs-2), Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Security:** AES-256 (crypto-js), bcrypt password hashing, JWT authentication

## 🚀 Running Locally

### Backend
\`\`\`bash
cd backend
npm install
# create a .env file (see .env.example) with your MONGO_URI, JWT_SECRET, ENCRYPTION_KEY
npm start
\`\`\`

### Frontend
\`\`\`bash
cd frontend
npm install
npm start
\`\`\`

The frontend expects the backend running at the URL set in `frontend/.env` (`REACT_APP_API_URL`).

## 🌐 Deployment

- **Backend** → deploy to [Render](https://render.com) (set environment variables in the Render dashboard: `MONGO_URI`, `JWT_SECRET`, `ENCRYPTION_KEY`, `PORT`)
- **Frontend** → deploy to [Vercel](https://vercel.com) (set `REACT_APP_API_URL` to your deployed backend URL)

## 📦 Data Export (GDPR)

Users can download a full JSON export of all their journal entries from Settings → Export My Data.

---

Built as part of the Persevex Full Stack Developer Internship.
