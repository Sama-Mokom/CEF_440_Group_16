# NetInsight Backend

Express + MongoDB (Mongoose) API for the NetInsight app. Stores anonymous
network measurement samples and user feedback.

## Endpoints

- `GET /` — health check, returns `NetInsight backend running...`
- `POST /api/network-metrics` — save a network measurement sample
- `GET /api/network-metrics?deviceId=&limit=` — list recent samples
- `GET /api/network-metrics/stats?deviceId=` — today's average download/upload/latency
- `POST /api/feedback` — save a feedback entry
- `GET /api/feedback?resolved=&limit=` — list feedback entries
- `PATCH /api/feedback/:id` — mark feedback resolved/unresolved

## 1. Local setup

```bash
cd trackify-backend
npm install
cp .env.example .env
```

Edit `.env` and set `MONGODB_URI` (see step 2).

```bash
npm run dev    # uses nodemon, restarts on file changes
# or
npm start
```

Visit `http://localhost:5000/` — you should see `NetInsight backend running...`.

## 2. Set up MongoDB Atlas (free tier)

1. Go to https://www.mongodb.com/cloud/atlas and create a free account.
2. Create a new **free M0 cluster**.
3. Under **Database Access**, create a database user with a username and password.
4. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere) — required for Render to connect.
5. Click **Connect** on your cluster → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<username>` and `<password>` with your real credentials, and add the database name before the `?`:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/NetInsight?retryWrites=true&w=majority
   ```
7. Put this full string in `.env` as `MONGODB_URI`.

## 3. Deploy to Render (free tier)

1. Push this `trackify-backend` folder to a GitHub repo (it can be a subfolder of a larger repo).
2. Go to https://render.com → **New** → **Web Service** → connect your GitHub repo.
3. Settings:
   - **Root Directory**: `trackify-backend` (if it's a subfolder)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Under **Environment Variables**, add:
   - `MONGODB_URI` = your Atlas connection string from step 2
5. Click **Create Web Service**. Wait for the deploy to finish.
6. Visit the URL Render gives you (e.g. `https://your-service-name.onrender.com/`) — you should see `NetInsight backend running...`.

Note: Render's free tier spins services down after ~15 minutes of inactivity.
The first request after idling will take 30-60 seconds to "wake up" — this is
normal and not an error.

## 4. Point the app at your new backend

Once deployed, update the three hardcoded URLs in the frontend to your new
Render URL:

- `utils/networkUtils.ts` — two occurrences (`/api/network-metrics`, `/api/network-metrics/stats`)
- `app/(tabs)/feedback.tsx` — one occurrence (`/api/feedback`)

Replace `https://trackify-i4hx.onrender.com` with your new service's base URL,
e.g. `https://netinsight-backend-xxxx.onrender.com`.

## Data shapes

### Network metric (POST /api/network-metrics)

```json
{
  "deviceId": "device-ios",
  "timestamp": "2026-06-12T23:40:04.599Z",
  "connectionType": "cellular",
  "isConnected": true,
  "isInternetReachable": true,
  "signalStrength": -100,
  "downloadSpeed": 2.08,
  "downloadStatus": "fair",
  "uploadSpeed": 0.1,
  "uploadStatus": "poor",
  "latency": 198,
  "latencyStatus": "fair",
  "location": { "latitude": 4.15, "longitude": 9.27, "accuracy": 72.8 }
}
```

### Feedback (POST /api/feedback)

```json
{
  "experience": "good",
  "areaOfFeedback": "data_speed",
  "description": "Slow downloads in the evening",
  "rating": 4,
  "location": { "latitude": 4.15, "longitude": 9.27 },
  "networkProvider": "Anonymous",
  "resolved": false
}
```

`experience` must be one of: `very_poor`, `poor`, `fair`, `good`, `excellent`.
`rating` must be an integer from 1 to 5.
