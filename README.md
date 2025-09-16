# Lawpath Assessment – Address Verification App

A full-stack Next.js application for user registration, login, and Australian address verification via AusPost, with logging to Elasticsearch and Google Maps integration.

---

## 🚀 Deployed App

**Live URL:**
[https://naj-lawpath-assessment.vercel.app](https://naj-lawpath-assessment.vercel.app)

---

## 🛠️ Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/lawpath-assessment.git
cd lawpath-assessment
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the project root:

```env
# Elasticsearch
ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_API_KEY="your-local-or-remote-api-key"

# JWT
JWT_SECRET="your-jwt-secret"

# AusPost REST
AUSPOST_BASE_URL="url-for-aus-post"
AUSPOST_API_KEY="your-auspost-api-key"

# Google Maps
NEXT_GOOGLE_MAPS_API_KEY="your-google-maps-api-key"
```

### 4. Start Elasticsearch (Local Dev)

If you want to run Elasticsearch locally, use Docker Compose:

```bash
docker-compose up
```

This will start Elasticsearch and the app container (if configured).

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

```bash
pnpm test
```

For coverage:

```bash
pnpm test --coverage
```

---

## 📝 Features

- User registration and login (with hashed passwords)
- Session management via JWT cookies
- Address verification form (postcode, suburb, state)
- AusPost API integration (REST, proxied via GraphQL)
- Logging of verification attempts to Elasticsearch
- Google Maps integration for valid addresses
- Responsive, accessible UI
- LocalStorage persistence for form state
- Logout functionality

---

## 💡 Troubleshooting

- If you see "Unauthorized" or session errors, check your JWT_SECRET and cookie settings.
- If address verification fails, check your AusPost API key and base URL.
- For local ES, ensure Docker is running and accessible at the configured port.

---

## 📄 License

MIT (or as specified by Lawpath assessment brief)

---

## 🙏 Credits

Built for Lawpath by Nick Johnson
