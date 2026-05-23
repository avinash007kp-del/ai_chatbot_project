# AI Chatbot

A full-stack AI chatbot application featuring user authentication, conversation history, and an interactive chat interface powered by Google's Gemini Generative AI.

## Tech Stack

### Frontend
- **React.js**: UI Library
- **Vite**: Frontend Tooling & Bundler
- **Vanilla CSS**: Custom styling and responsive design
- **Lucide-React**: Iconography

### Backend
- **Node.js**: JavaScript Runtime
- **Express.js**: Web Application Framework
- **MongoDB & Mongoose**: NoSQL Database & ODM (Object Data Modeling)
- **Google Generative AI SDK**: AI engine integration (Gemini 2.5 Flash)
- **JSON Web Tokens (JWT) & bcryptjs**: Authentication and password hashing

## Folder Structure

```text
ai-chatbot/
├── backend/                   # Node.js + Express backend
│   ├── config/                # Database and environment configurations
│   ├── controllers/           # Request handlers for auth and chat
│   ├── middleware/            # Custom Express middlewares (e.g., auth check)
│   ├── models/                # Mongoose database schemas (User, Chat)
│   ├── routes/                # API route definitions
│   ├── .env                   # Environment variables (Backend)
│   ├── server.js              # Application entry point
│   └── package.json           # Backend dependencies and scripts
│
├── frontend/                  # React + Vite frontend
│   ├── public/                # Static public assets
│   ├── src/                   # React source code
│   │   ├── components/        # Reusable UI components (Sidebar, ChatMessage, etc.)
│   │   ├── App.jsx            # Main application component
│   │   ├── App.css            # Global application styles
│   │   └── main.jsx           # React entry point
│   ├── index.html             # HTML template
│   ├── vite.config.js         # Vite configuration (including API proxy)
│   └── package.json           # Frontend dependencies and scripts
│
└── package.json               # Root package manager file
```

## Running the Application Locally

1. **Start the Backend**:
   Navigate to the `backend` directory, install dependencies (if you haven't already), and run the server.
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start the Frontend**:
   Navigate to the `frontend` directory, install dependencies, and run the Vite development server.
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access the App**:
   Open the Local network URL provided by Vite (e.g., `http://localhost:5173`) in your browser.
