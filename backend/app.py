from flask import Flask, request, jsonify, session
from flask_pymongo import PyMongo
from flask_cors import CORS

import os
import re
from werkzeug.security import generate_password_hash, check_password_hash
import logging
from bson import ObjectId
import requests
from gql import gql, Client
from gql.transport.requests import RequestsHTTPTransport
import asyncio
from Chatbot.chatbot import chatbot_response
from datetime import datetime, timezone



# ---- app + CORS + cookies ----
app = Flask(__name__)
from flask_cors import CORS

CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    supports_credentials=True
)
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax' #This sets how cookies behave with cross-origin requests.
app.config['SESSION_COOKIE_SECURE'] = False #This tells Flask: Don’t require HTTPS to send cookies.
app.secret_key = os.getenv("SECRET_KEY", "supersecretkey") #Sets the secret key for Flask’s session signing (used to secure cookies).

# ---- Mongo init with fallback to mongomock ----
from pymongo.errors import ConfigurationError, ServerSelectionTimeoutError
use_mock = False
MONGO_URI = os.getenv("MONGO_URI")

if MONGO_URI:
    app.config["MONGO_URI"] = MONGO_URI
    try:
        # fail fast if the cluster/host isn't reachable
        mongo = PyMongo(app, serverSelectionTimeoutMS=3000)
        # ping to verify connection
        mongo.cx.admin.command("ping")
        print("✅ Connected to MongoDB")
    except (ConfigurationError, ServerSelectionTimeoutError, Exception) as e:
        print("❌ MongoDB connection failed, switching to in-memory mongomock:", e)
        use_mock = True
else:
    print("ℹ️ No MONGO_URI set, using in-memory mongomock")
    use_mock = True

if use_mock:
    import mongomock
    from types import SimpleNamespace
    client = mongomock.MongoClient()
    db = client["aasare"]
    mongo = SimpleNamespace(db=db)
    print("✅ Using in-memory MongoDB (mongomock)")

# ---- External API (Taddy) ----
endpoint_url = "https://api.taddy.org/"
headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Aasare',
    'X-USER-ID': os.getenv('TADDY_USER_ID'),
    'X-API-KEY': os.getenv('TADDY_API_KEY'),
}

def make_graphql_request(query, variables):
    try:
        transport = RequestsHTTPTransport(url=endpoint_url, headers=headers, use_json=True)
        client = Client(transport=transport, fetch_schema_from_transport=False)
        response = client.execute(gql(query), variable_values=variables)
        return response
    except Exception as e:
        print(f"GraphQL query execution failed: {e}")
        return None

@app.get("/api/health")
def health():
    return {"status": "ok"}, 200
# ---- Health endpoints ----
@app.get("/api/db-ping")
def db_ping():
    try:
        if hasattr(mongo, "cx"):  # real mongo
            mongo.cx.admin.command("ping")
            return {"ok": True, "backend": "real-mongo"}
        return {"ok": True, "backend": "mongomock"}
    except Exception as e:
        return {"ok": False, "error": str(e)}, 500

@app.route('/')
def index():
    return "Welcome to Aasare!"

# ---- Example Taddy endpoint ----
@app.route('/api/podcast_series', methods=['GET'])
def get_podcast_series():
    name = request.args.get('name', '')
    query = '''query searchForTerm($term: String, $page: Int, $limitPerPage: Int, $filterForTypes: [TaddyType], $filterForCountries: [Country], $filterForLanguages: [Language], $filterForGenres: [Genre], $filterForSeriesUuids: [ID], $filterForNotInSeriesUuids: [ID], $isExactPhraseSearchMode: Boolean, $isSafeMode: Boolean, $searchResultsBoostType: SearchResultBoostType) {
      searchForTerm(term: $term, page: $page, limitPerPage: $limitPerPage, filterForTypes: $filterForTypes, filterForCountries: $filterForCountries, filterForLanguages: $filterForLanguages, filterForGenres: $filterForGenres, filterForSeriesUuids: $filterForSeriesUuids, filterForNotInSeriesUuids: $filterForNotInSeriesUuids, isExactPhraseSearchMode: $isExactPhraseSearchMode, isSafeMode: $isSafeMode, searchResultsBoostType:$searchResultsBoostType) {
        searchId
        podcastSeries { uuid name rssUrl itunesId }
        podcastEpisodes { uuid guid name audioUrl }
      }
    }'''
    variables = {
        "name": name,
        "filterForGenres": ["PODCASTSERIES_HEALTH_AND_FITNESS_MENTAL_HEALTH"],
        "limitPerPage": 25,
        "page": 5
    }
    response = make_graphql_request(query, variables)
    return (jsonify(response), 200) if response else (jsonify({"error": "Not found"}), 404)

# ---- Auth & Users ----
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    username = data.get('username')
    password = data.get('password')
    role = data.get('role')
    email = data.get('email')
    phone = data.get('phone')
    dob = data.get('dob')
    specialization = data.get('specialization') if role == 'consultant' else None
    document = data.get('document') if role == 'consultant' else None

    if not all([username, password, role, email, phone, dob]):
        return jsonify({"error": "All fields are required"}), 400

    if role not in ["customer", "consultant"]:
        return jsonify({"error": "Invalid role"}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({"error": "Invalid email format"}), 400

    if role == "consultant" and not specialization:
        return jsonify({"error": "Specialization is required for consultants"}), 400

    existing_user = mongo.db.users.find_one({"username": username})
    if existing_user:
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)
    user_data = {
        "name": name,
        "username": username,
        "password": hashed_password,
        "role": role,
        "email": email,
        "phone": phone,
        "dob": dob,
        "document": document
    }
    if role == 'consultant':
        user_data["specialization"] = specialization

    mongo.db.users.insert_one(user_data)
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = mongo.db.users.find_one({"username": username})
    if not user or not check_password_hash(user["password"], password):
        return jsonify({"error": "Invalid username or password"}), 400

    session['username'] = username
    session['role'] = user['role']
    print(f"role {user['role']}")

    return jsonify({
        "message": f"Welcome, {user['role']} {username}!",
        "username": username,
        "role": user['role']
    }), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('username', None)
    session.pop('role', None)
    return jsonify({"message": "Logout successful"}), 200

@app.route('/api/dashboard', methods=['GET'])
def dashboard():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"message": f"Hello, {session['role']} {session['username']}!"}), 200

# ---- Blogs ----
@app.route('/api/blogs', methods=['GET'])
def get_blogs():
    blogs = mongo.db.blogs.find()
    result = []
    for blog in blogs:
        result.append({
            '_id': str(blog['_id']),
            'title': blog['title'],
            'content': blog['content'],
            'author': blog['author'],
            'tag': blog.get('tag', 'N/A')
        })
    return jsonify(result), 200

@app.route('/api/blogs', methods=['POST'])
def add_blog():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    author = session['username']
    tag = data.get('tag')

    if not all([title, content, author]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        blog = {
            'title': title,
            'content': content,
            'author': author,
            'tag': tag if tag else 'N/A'
        }
        result = mongo.db.blogs.insert_one(blog)
        blog['_id'] = str(result.inserted_id)
        return jsonify(blog), 201
    except Exception:
        return jsonify({"error": "An error occurred while adding the blog"}), 500

# ---- Exercises ----
@app.route('/api/exercises', methods=['GET'])
def get_exercises():
    exercises = mongo.db.exercises.find()
    result = []
    for exercise in exercises:
        result.append({
            '_id': str(exercise['_id']),
            'title': exercise['title'],
            'description': exercise['description']
        })
    return jsonify(result), 200

@app.route('/api/exercises', methods=['POST'])
def add_exercise():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    exercise_id = mongo.db.exercises.insert_one({'title': title, 'description': description}).inserted_id
    return jsonify({"_id": str(exercise_id), "title": title, "description": description}), 201

@app.route('/api/exercises/<exercise_id>/complete', methods=['POST'])
def complete_exercise(exercise_id):
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user = mongo.db.users.find_one({"username": session['username']})
    if not user:
        return jsonify({"error": "User not found"}), 404

    completed_exercises = user.get('completed_exercises', [])
    if exercise_id not in completed_exercises:
        completed_exercises.append(exercise_id)
        mongo.db.users.update_one(
            {"username": session['username']},
            {"$set": {"completed_exercises": completed_exercises}}
        )
        update_exercise_progress(session['username'], exercise_id)
        # FIX: call the correct function name
        award_badge(session['username'])
        return jsonify({"message": "Exercise completed and badges updated"}), 200
    else:
        update_exercise_progress(session['username'], exercise_id)
        return jsonify({"message": "Exercise already completed, progress updated"}), 200

def update_exercise_progress(username, exercise_id):
    user = mongo.db.users.find_one({"username": username})
    exercise_progress = user.get('exercise_progress', {})

    if exercise_id in exercise_progress:
        exercise_progress[exercise_id] += 1
    else:
        exercise_progress[exercise_id] = 1

    badges_earned = []
    for ex_id, completion_count in exercise_progress.items():
        if completion_count >= 10:
            badges_earned.append("Exercise Expert")
        elif completion_count >= 5:
            badges_earned.append("Exercise Enthusiast")

    mongo.db.users.update_one(
        {"username": username},
        {"$set": {"exercise_progress": exercise_progress, "badges": badges_earned}}
    )

@app.route('/api/exercises/progress', methods=['GET'])
def get_exercise_progress():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user = mongo.db.users.find_one({"username": session['username']})
    if not user:
        return jsonify({"error": "User not found"}), 404

    exercise_progress = user.get('exercise_progress', {})
    result = []

    for ex_id, completion_count in exercise_progress.items():
        exercise = mongo.db.exercises.find_one({"_id": ObjectId(ex_id)})
        if exercise:
            result.append({
                'exercise_id': str(exercise['_id']),
                'title': exercise['title'],
                'timesCompleted': completion_count
            })

    return jsonify(result), 200

def award_badge(username):
    user = mongo.db.users.find_one({"username": username})
    completed_exercises = user.get('completed_exercises', [])
    badges = user.get('badges', [])

    badge_criteria = {
        'starter': 1,
        'achiever': 5,
        'champion': 10
    }

    for badge, count in badge_criteria.items():
        if len(completed_exercises) >= count and badge not in badges:
            badges.append(badge)
            mongo.db.users.update_one({"username": username}, {"$set": {"badges": badges}})

@app.route('/api/badges', methods=['GET'])
def get_badges():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user = mongo.db.users.find_one({"username": session['username']})
    if not user:
        return jsonify({"error": "User not found"}), 404

    badges = user.get('badges', [])
    return jsonify(badges), 200

@app.route('/api/consultants', methods=['GET'])
def get_consultants():
    consultants = mongo.db.users.find({"role": "consultant"})
    result = []
    for c in consultants:
        result.append({
            '_id': str(c['_id']),
            'username': c['username'],
            'email': c['email'],
            'phone': c['phone'],
            'dob': c['dob'],
            'specialization': c.get('specialization', 'N/A')
        })
    return jsonify(result), 200

def get_blogs_by_author(username):
    blogs = mongo.db.blogs.find({"author": username})
    result = []
    for blog in blogs:
        result.append({
            '_id': str(blog['_id']),
            'title': blog['title'],
            'content': blog['content'],
            'author': blog['author']
        })
    return result

def get_exercises_by_author(username):
    exercises = mongo.db.exercises.find({"user": username})
    result = []
    for ex in exercises:
        result.append({
            '_id': str(ex['_id']),
            'title': ex['title'],
            'description': ex['description'],
            'author': ex['user']
        })
    return result

@app.route('/api/blogs/<blog_id>', methods=['PUT'])
def update_blog(blog_id):
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    title = data.get('title')
    content = data.get('content')
    author = session['username']

    if not all([title, content, author]):
        return jsonify({"error": "All fields are required"}), 400

    try:
        updated_blog = {'title': title, 'content': content, 'author': author}
        mongo.db.blogs.update_one({"_id": ObjectId(blog_id)}, {"$set": updated_blog})
        return jsonify({"message": "Blog updated successfully", "blog_id": blog_id}), 200
    except Exception:
        return jsonify({"error": "An error occurred while updating the blog"}), 500

@app.route('/api/exercises/<exercise_id>', methods=['PUT'])
def update_exercise(exercise_id):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')

    if not title or not description:
        return jsonify({"error": "Title and description are required"}), 400

    try:
        updated_exercise = {'title': title, 'description': description}
        mongo.db.exercises.update_one({"_id": ObjectId(exercise_id)}, {"$set": updated_exercise})
        return jsonify({"message": "Exercise updated successfully", "exercise_id": exercise_id}), 200
    except Exception as e:
        logging.error(f"Error updating exercise: {e}")
        return jsonify({"error": "An error occurred while updating the exercise"}), 500

@app.route('/api/profile', methods=['GET'])
def get_profile():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    user = mongo.db.users.find_one({"username": session['username']})
    if not user:
        return jsonify({"error": "User not found"}), 404

    user['_id'] = str(user['_id'])
    user.pop('password', None)

    if user['role'] == 'consultant':
        user['specialization'] = user.get('specialization', '')
        user['blogs'] = get_blogs_by_author(user['username'])
        user['exercises'] = get_exercises_by_author(user['username'])

    return jsonify(user), 200

@app.route('/api/profile', methods=['PUT'])
def update_profile():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    update_data = {}

    for key in ['email', 'phone', 'dob']:
        if key in data:
            update_data[key] = data[key]

    if 'password' in data:
        update_data['password'] = generate_password_hash(data['password'])

    mongo.db.users.update_one({"username": session['username']}, {"$set": update_data})
    return jsonify({"message": "Profile updated successfully"}), 200

def store_chat_message(username, role, message, response):
    chat_data = {
        'username': username,
        'role': role,
        'message': message,
        'response': response,
        'timestamp': datetime.now(timezone.utc)
    }
    mongo.db.chat_history.insert_one(chat_data)

@app.route('/api/chat_history', methods=['GET'])
def get_chat_history():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    username = session['username']
    chat_history = mongo.db.chat_history.find({'username': username}).sort('timestamp', 1)

    history = []
    for chat in chat_history:
        history.append({
            'role': chat['role'],
            'message': chat['message'],
            'response': chat['response'],
            'timestamp': chat['timestamp']
        })
    return jsonify(history), 200

@app.route('/api/chatbot', methods=['POST'])
def chatbot():
    if 'username' not in session:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json()
    question = data.get('question')
    username = session['username']
    role = session['role']

    if not question:
        return jsonify({"error": "Question is required"}), 400

    # ✅ SAFE asyncio usage under Gunicorn
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    response = loop.run_until_complete(chatbot_response(question))
    loop.close()

    store_chat_message(username, 'user', question, None)
    store_chat_message(username, 'bot', None, response['response'])

    return jsonify(response), 200
