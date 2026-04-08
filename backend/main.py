import os
from typing import List, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

import firebase_admin
from firebase_admin import credentials, firestore

from openai import OpenAI

from ai.recommender import recommend_study_groups, recommend_hobby_groups
from ai.similarity import jaccard_similarity


load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
FIREBASE_SERVICE_ACCOUNT_PATH = os.getenv(
    "FIREBASE_SERVICE_ACCOUNT_PATH",
    "serviceAccountKey.json"
)
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4")

if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY puuttuu .env-tiedostosta")

db = None

if os.path.exists(FIREBASE_SERVICE_ACCOUNT_PATH):
    if not firebase_admin._apps:
        cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("Firebase initialized")
else:
    print("Firebase service account file not found, continuing without Firestore")
#if not firebase_admin._apps:
 #   cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_PATH)
  #  firebase_admin.initialize_app(cred)

#db = firestore.client()

client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class StudyGroup(BaseModel):
    group_id: str
    name: str
    description: str = ""
    tags: List[str] = Field(default_factory=list)
    memberCount: int = 0


class StudyGroupRecommendationRequest(BaseModel):
    user_id: str
    study_interests: List[str] = Field(default_factory=list)
    groups: List[StudyGroup] = Field(default_factory=list)


class StudyGroupRecommendationResponse(BaseModel):
    group_id: str
    name: str
    description: str
    tags: List[str]
    score: float
    shared_interests: List[str]
    shared_count: int
    memberCount: int


class HobbyRequest(BaseModel):
    hobby_interests: List[str] = Field(default_factory=list)


class CandidateUser(BaseModel):
    user_id: str
    firstName: str = ""
    city: str = ""
    hobby_interests: List[str] = Field(default_factory=list)


class HobbyUserRecommendationRequest(BaseModel):
    current_user_id: str
    hobby_interests: List[str] = Field(default_factory=list)
    candidates: List[CandidateUser] = Field(default_factory=list)


class ChatRequest(BaseModel):
    userId: str
    chatId: str = "default"
    message: str


def normalize_hobbies(hobbies: List[str]) -> List[str]:
    return [
        hobby.strip().lower()
        for hobby in hobbies
        if isinstance(hobby, str) and hobby.strip()
    ]


def get_shared_hobbies(user_hobbies: List[str], candidate_hobbies: List[str]) -> List[str]:
    user_set = set(normalize_hobbies(user_hobbies))
    candidate_set = set(normalize_hobbies(candidate_hobbies))
    return list(user_set.intersection(candidate_set))


def fetch_last_messages(user_id: str, chat_id: str, limit_count: int = 10) -> List[Dict[str, str]]:
    if db is None:
        return []

    messages_ref = (
        db.collection("user")
        .document(user_id)
        .collection("ai_chats")
        .document(chat_id)
        .collection("messages")
    )

    docs = (
        messages_ref
        .order_by("createdAt", direction=firestore.Query.DESCENDING)
        .limit(limit_count)
        .stream()
    )

    history: List[Dict[str, str]] = []

    for item in docs:
        data = item.to_dict()
        if not data:
            continue

        role = data.get("role")
        text = data.get("text")

        if role in ["user", "assistant"] and isinstance(text, str) and text.strip():
            history.append({
                "role": role,
                "content": text.strip()
            })

    history.reverse()
    return history


@app.get("/")
def root():
    return {"message": "API on käynnissä", "version": "v6"}


@app.post(
    "/recommend/study-groups",
    response_model=List[StudyGroupRecommendationResponse]
)
def recommend_study_groups_endpoint(request: StudyGroupRecommendationRequest):
    user = {
        "study_interests": request.study_interests
    }

    groups = [
        {
            "group_id": g.group_id,
            "name": g.name,
            "description": g.description,
            "tags": g.tags,
            "memberCount": g.memberCount,
        }
        for g in request.groups
    ]

    return recommend_study_groups(user, groups)


@app.post("/recommend/hobby")
def post_hobby_recommendations(request: HobbyRequest):
    user = {
        "hobby_interests": request.hobby_interests
    }

    hobby_recs = recommend_hobby_groups(user, groups)

    formatted = []

    for group_id, score in hobby_recs:
        group = next((g for g in groups if g["id"] == group_id), None)
        if not group:
            continue

        formatted.append({
            "group_id": group_id,
            "group_name": group["name"],
            "description": group["description"],
            "member_count": group["member_count"],
            "score": round(score, 3),
        })

    return {
        "recommendations": formatted
    }


@app.post("/recommend/users/hobby")
def recommend_users_by_hobby(request: HobbyUserRecommendationRequest):
    results = []

    current_user_hobbies = normalize_hobbies(request.hobby_interests)

    for candidate in request.candidates:
        if candidate.user_id == request.current_user_id:
            continue

        candidate_hobbies = normalize_hobbies(candidate.hobby_interests)

        score = jaccard_similarity(
            current_user_hobbies,
            candidate_hobbies
        )

        shared_hobbies = get_shared_hobbies(
            current_user_hobbies,
            candidate_hobbies
        )

        if score > 0:
            results.append({
                "user_id": candidate.user_id,
                "firstName": candidate.firstName,
                "city": candidate.city,
                "hobby_interests": candidate.hobby_interests,
                "shared_hobbies": shared_hobbies,
                "shared_count": len(shared_hobbies),
                "score": round(score, 3),
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    results = results[:10]

    return {
        "recommendations": results
    }


@app.post("/chat/ai")
def chat_with_ai(payload: ChatRequest):
    try:
        user_id = payload.userId.strip()
        chat_id = payload.chatId.strip() or "default"
        user_message = payload.message.strip()

        if not user_id:
            raise HTTPException(status_code=400, detail="userId puuttuu")

        if not user_message:
            raise HTTPException(status_code=400, detail="Viesti ei voi olla tyhjä")

        history = fetch_last_messages(user_id, chat_id, limit_count=10)

        input_messages = [
            {
                "role": "system",
                "content": (
                    "Olet ystävällinen ja selkeä tekoälyassistentti mobiilisovelluksessa. "
                    "Vastaa aina suomeksi. "
                    "Vastaa käyttäjän kysymyksiin hyödyllisesti, selkeästi ja melko tiiviisti. "
                    "Älä ehdota ryhmiä, kavereita, profiilimuutoksia tai sovelluksen toimintoja, "
                    "ellei käyttäjä erikseen kysy niistä."
                )
            }
        ]

        for msg in history:
            input_messages.append(msg)

        if not history or history[-1].get("role") != "user" or history[-1].get("content") != user_message:
            input_messages.append({
                "role": "user",
                "content": user_message
            })

        response = client.responses.create(
            model=OPENAI_MODEL,
            input=input_messages,
        )

        reply_text = response.output_text

        if not reply_text:
            raise HTTPException(status_code=500, detail="AI ei palauttanut vastausta")

        return {"reply": reply_text.strip()}


    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    