# AASARE – AI-Powered Mental Health Wellness Platform

**AASARE** is a full-stack AI-driven mental wellness platform built to make **mental health care more accessible, empathetic, and intelligent**.
It combines **Flask**, **React**, and **MongoDB** with **AI-powered conversations (Google Gemini)** to provide users with guidance, resources, and exercises for better emotional well-being.

---

## Overview

In a world where stress, anxiety, and burnout are increasingly common, **AASARE** acts as a digital companion that listens, understands, and supports users.
By integrating **AI, NLP, and gamified wellness**, it empowers users to track their mental health journey while learning coping techniques through interactive exercises and expert content.

---

## Tech Stack

### Frontend

- React.js
- Axios (API communication)
- Context API (Authentication & State Management)
- HTML5 / CSS3

### Backend

- Flask (Python)
- Flask-PyMongo (MongoDB integration)
- Flask-CORS & Flask-Session
- GraphQL (Taddy Podcast Integration)
- Gunicorn (Production Server)

### Database

- MongoDB Atlas (Cloud-based NoSQL database)

### AI & NLP

- Google Gemini API for AI conversations
- RapidFuzz for fuzzy text matching
- spaCy for NLP-based preprocessing and topic detection

---

## New Updates

### **Dockerization**

The entire AASARE application — both backend and frontend — is now **containerized using Docker**.
This allows the project to run consistently across all environments, eliminates dependency issues, and simplifies cloud deployment.

- Each service (backend & frontend) runs in its own isolated container.
- The backend runs with Gunicorn (a production-grade WSGI server).
- The frontend runs as a static React build served via a lightweight Node server.

With Docker, developers can now build and run the app locally or deploy it directly to the cloud with a single command.

---

### **CI/CD Pipeline with GitHub Actions**

The project now includes a **continuous integration and continuous deployment (CI/CD)** pipeline powered by **GitHub Actions**.

#### How It Works

- Whenever new code is pushed to the main branch, GitHub Actions automatically triggers the build pipeline.
- The pipeline builds Docker images for the backend and frontend.
- These images are securely pushed to **Azure Container Registry (ACR)**.
- Azure then automatically updates the **Container Apps** with the new versions — enabling zero-downtime deployments.

#### Benefits

- Automated testing, building, and deployment
- Consistent and reproducible releases
- Faster development-to-deployment cycle
- No manual intervention required

---

### **Deployment on Azure Container Apps**

**AASARE** is deployed using **Azure Container Apps (ACA)** for scalable, serverless container hosting.

<<<<<<< HEAD
#### 🔹 Deployment Architecture
=======
<<<<<<< HEAD
####  Deployment Architecture
=======
#### 🔹 Deployment Architecture
>>>>>>> 4a4e8b9 (resolve merge conflicts)
>>>>>>> frontend-fix

| Component    | Platform                       | Purpose                                           |
| ------------ | ------------------------------ | ------------------------------------------------- |
| **Frontend** | Azure Container App            | Serves the React build                            |
| **Backend**  | Azure Container App            | Flask API running via Gunicorn                    |
| **Registry** | Azure Container Registry (ACR) | Stores Docker images                              |
| **Database** | MongoDB Atlas                  | Cloud database for users, blogs, and chat history |
| **Pipeline** | GitHub Actions                 | Automates build and deployment                    |

#### Highlights

- Automatic revisioning for each new release
- Scales based on load
- Environment variables securely stored in Azure
- Health monitoring and logging via `az containerapp logs show`

---

## Running the Project Locally

You can run **AASARE** locally either through **Docker** or **manual setup**.

### Option 1 – Using Docker

1. Make sure Docker is installed and running.
2. Clone the repository:

   ```bash
   git clone https://github.com/your-username/AASARE.git
   cd AASARE
   ```

3. Build and start the containers:

   ```bash
   docker-compose up --build
   ```

4. The backend will be available at `http://localhost:5000`
   The frontend will be available at `http://localhost:3000`

### Option 2 – Manual Local Setup

#### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py
```

#### Frontend

```bash
cd frontend
npm install
npm start
```

By default:

- Frontend → `http://localhost:3000`
- Backend → `http://localhost:5000`

---

## Environment Configuration

### **Backend (.env)**

```
MONGO_URI=your_mongo_connection_string
GOOGLE_API_KEY=your_google_gemini_key
TADDY_API_KEY=your_taddy_api_key
TADDY_USER_ID=your_taddy_user_id
SECRET_KEY=your_flask_secret_key
```

### **Frontend (.env)**

```
REACT_APP_API_URL=http://localhost:5000
```

---

## Core Features

### User & Consultant Roles

- Secure login and registration
- Consultants can publish blogs and exercises
- Users can explore wellness content and interact with AI

### AI Chatbot – _Chat Mitra_

- Context-aware, empathetic mental health conversations
- Suggests blogs, podcasts, and exercises based on detected emotions
- NLP-based topic detection and fuzzy matching

### Exercises & Gamification

- Interactive wellness exercises with progress tracking
- Reward system with achievement badges

### Blogs & Podcasts

- Curated expert blogs on mental health
- Integrated **Taddy GraphQL API** for fetching relevant podcasts

---

## NLP Workflow

1. **Text Preprocessing:** Cleans and normalizes user input
2. **Intent & Topic Detection:** Identifies topics like stress, sleep, anxiety
3. **Spelling Correction:** Uses RapidFuzz to handle typos
4. **LLM Response Generation:** Uses Gemini for natural, compassionate replies
5. **Recommendation Layer:** Suggests relevant content dynamically

---

## Future Roadmap

- Multi-language and voice-based interaction (speech-to-text, TTS)
- Mood tracking and journaling
- Sentiment-based tone adjustment
- Crisis detection and escalation system
- React Native mobile app version

---

## Author

**Prajwal S**
<<<<<<< HEAD
AI Developer | Full Stack Engineer | Passionate about Mental Health Tech
=======
<<<<<<< HEAD
- Devops Engineer
- Full Stack Engineer 
- AI Developer
=======
AI Developer | Full Stack Engineer | Passionate about Mental Health Tech
>>>>>>> 4a4e8b9 (resolve merge conflicts)
>>>>>>> frontend-fix
**[prajwal8321@gmail.com](mailto:prajwal8321@gmail.com)**

> _“Technology can’t replace therapy — but it can offer a safe first step toward help.”_

---
