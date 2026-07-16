# WatchShelf 🍿

WatchShelf is a full-stack streaming platform built with React, Tailwind, and Django REST. It offers users personalized watchlists, episode streaming, and secure authentication, plus a robust admin dashboard for complete content management.

## ✨ Features

### User Experience
*   **Secure Authentication:** User registration, login, and session management using JWT (JSON Web Tokens).
*   **Content Discovery:** Browse trending movies, TV series, and search by genres or titles.
*   **Custom Video Player:** Integrated video player for streaming episodes and movies.
*   **Personalized Space:** Manage favorites, watch history, and custom collections.
*   **Interactions:** Leave comments and rate content directly on the platform.

### Admin Dashboard (Protected)
*   **Content Management:** Full CRUD (Create, Read, Update, Delete) operations for Movies, Series, Seasons, and Episodes with media upload support (thumbnails and videos).
*   **Genre Management:** Easily categorize content.
*   **Moderation System:** Monitor and delete inappropriate user comments.

---

## 🛠️ Tech Stack

**Frontend:**
*   React.js (Vite)
*   Tailwind CSS (Styling & UI)
*   React Router DOM (Navigation)
*   Axios (API Communication)

**Backend:**
*   Django & Python
*   Django REST Framework (DRF)
*   SimpleJWT (Authentication)
*   django-cors-headers (CORS handling)

---

## 🚀 Installation & Setup

Follow these steps to get the project running on your local machine.

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)

### 1. Backend Setup (Django)

1. Navigate to the backend directory:
bash
   cd backend
Create and activate a virtual environment:

Bash
  python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
Install dependencies:

Bash
  pip install -r requirements.txt
Run database migrations:

Bash
  python manage.py migrate
Create a superuser (for Admin Dashboard access):

Bash
  python manage.py createsuperuser
Start the Django development server:

Bash
  python manage.py runserver
The backend will run at http://127.0.0.1:8000/

2. Frontend Setup (React/Vite)
Open a new terminal and navigate to the frontend directory:

Bash
  cd movies-front
Install Node dependencies:

Bash
  npm install
Create a .env file in the root of your frontend folder and add the API URL:

Code snippet
  VITE_API_BASE_URL=http://localhost:8000/api
Start the Vite development server:

Bash
  npm run dev
The frontend will be accessible at http://localhost:5173/

📂 Project Structure Overview
Plaintext
WatchShelf/
├── backend/                  # Django REST API
│   ├── core/                 # Models, Views, Serializers
│   ├── movies/               # Main settings
│   └── manage.py
│
└── frontend/                 # React Application
    ├── src/
    │   ├── api/              # Axios configuration & interceptors
    │   ├── components/       # Reusable UI components (Navbar, Cards, Player)
    │   ├── context/          # Global state (AuthContext)
    │   └── pages/            # Page components (Home, Details, Admin Dashboard)
    ├── .env                  # Environment variables
    └── package.json
🧑‍💻 Author
Abdellah Saidi
Full-Stack Developer | Computer Science & Data Science
