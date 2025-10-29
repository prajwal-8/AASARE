# 🧠 AASARE – AI-Powered Mental Health Wellness Platform

AASARE is a full-stack web application designed to provide **mental health support** through AI-driven conversations, curated resources, and interactive exercises.  
It combines **Flask**, **React**, and **MongoDB** to create a seamless experience where users can chat with an empathetic AI assistant, read expert blogs, complete mental health exercises, and even consult professionals.

---

## 🌿 Overview

In today’s fast-paced world, mental health issues like stress, anxiety, and depression are common, yet access to help is limited.  
**AASARE bridges this gap** by offering a digital companion that listens, guides, and recommends helpful content — all in one place.

The system integrates **Natural Language Processing (NLP)** for understanding user inputs and **LLM-based AI (Google Gemini)** for generating natural, empathetic responses.

---

## ⚙️ Tech Stack

### 🔸 Frontend

- React.js
- Axios (API communication)
- Context API (for authentication & state management)
- HTML5 / CSS3

### 🔸 Backend

- Flask (Python)
- Flask-PyMongo (MongoDB integration)
- Flask-CORS (Cross-Origin handling)
- Flask-Session for user management
- GraphQL API (Taddy Podcast Integration)

### 🔸 Database

- MongoDB (Atlas / Local)

### 🔸 AI & NLP

- Google Gemini API for conversational AI
- RapidFuzz for fuzzy text matching (spelling correction)
- Rule-based NLP for topic detection & entity recognition
- Chat history and dialogue context management

---

## 💡 Key Features

### 👥 User & Consultant Roles

- Secure login & registration (role-based access)
- Consultants can create blogs & exercises
- Users can read blogs, complete exercises, and view badges

### 🤖 AI Chatbot – Chat Mitra

- Empathetic, context-aware mental health conversations
- NLP-driven topic detection (e.g., anxiety, stress, sleep)
- Spelling correction using fuzzy matching
- Suggests relevant blogs, podcasts, and exercises based on user intent

### 🧘 Exercises & Gamification

- Mental wellness exercises with progress tracking
- Earn badges for consistency and completion milestones

### 📰 Blogs & Podcasts

- Expert-authored blogs for mental health awareness
- Podcasts fetched via **Taddy GraphQL API**

### 💬 Chat History & Analytics

- User-specific chat logs stored in MongoDB
- Track progress and revisit earlier advice

### 🏆 Gamified Badges

- “Starter”, “Achiever”, and “Champion” badges
- Motivates regular engagement with exercises

---

## 🧠 NLP in Action

AASARE uses **lightweight NLP techniques** for input understanding:

- **Text Preprocessing** – cleans and normalizes user queries
- **Tokenization** – breaks input into key terms
- **Topic Detection** – maps user intent to mental health domains
- **Entity Recognition (Rule-based)** – identifies words like _stress_, _depression_, _sleep_
- **Natural Language Generation (Gemini)** – generates empathetic responses
- **Dialogue Management** – maintains chat context for multi-turn conversations

**Example:**

> “I feel anxious about my exams” → _Topic Detected:_ Anxiety  
> → Suggests relaxation exercises + relevant blogs.

---

## 🚀 Future Enhancements

- ✅ JWT Authentication for microservices scalability
- 🌍 Multi-language & voice interaction (speech-to-text, TTS)
- 📊 Mood journaling and emotion tracking
- 💬 Sentiment analysis for dynamic tone adaptation
- 🚨 Crisis detection for high-risk conversations
- 📱 Mobile app (React Native) with push notifications
- ☁️ Deployment via Docker & AWS ECS/Fargate

---

### ⚡ Installation & Setup

1. Clone the repository

- git clone https://github.com/your-username/AASARE.git
- cd AASARE

2. Backend Setup

- cd backend
- pip install -r requirements.txt
- python app.py

3. Frontend Setup

- cd frontend
- npm install
- npm start

4. Environment Variables

- Create a .env file in both /backend and /frontend:

## Backend (.env)

- MONGO_URI=your_mongo_uri
- GOOGLE_API_KEY=your_gemini_key
- TADDY_API_KEY=your_taddy_key
- TADDY_USER_ID=your_user_id
- SECRET_KEY=your_secret

## Frontend (.env)

- REACT_APP_API_URL=http://localhost:5000

⸻

🌐 API Endpoints

- Endpoint Method Description
- /register POST User registration
- /login POST User login
- /logout POST End session
- /blogs GET/POST Fetch or add blogs
- /exercises GET/POST Fetch or add exercises
- /chatbot POST Send question to AI assistant
- /chat_history GET Retrieve user chat history
- /badges GET Fetch user badges

⸻

👨‍💻 Author

- Prajwal S
- AI Developer | Full Stack Engineer | Passionate about Mental Health Tech
- 📧 prajwal8321@gmail.com

⸻

“Technology can’t replace therapy — but it can offer a safe first step toward help.” 🌿

```

```
