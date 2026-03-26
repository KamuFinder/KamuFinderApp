from fastapi import FastAPI
from pydantic import BaseModel, Field
from ai.recommender import recommend_study_groups, recommend_hobby_groups
from ai.similarity import jaccard_similarity

app = FastAPI()


class HobbyRequest(BaseModel):
    hobby_interests: list[str]


class CandidateUser(BaseModel):
    user_id: str
    firstName: str = ""
    city: str = ""
    hobby_interests: list[str] = Field(default_factory=list)


class HobbyUserRecommendationRequest(BaseModel):
    current_user_id: str
    hobby_interests: list[str]
    candidates: list[CandidateUser] = Field(default_factory=list)


# Testi "tietokanta"
users = {
    1: {
        "interests": ["ai", "python"],
        "skills": ["python", "ml"],
        "hobby_interests": ["pelaaminen", "sali"]
    },
    2: {
        "interests": ["web", "design"],
        "skills": ["html", "css"],
        "hobby_interests": ["sali", "matkustelu"]
    }
}

groups = [
    {
        "id": 1,
        "name": "AI Study Group",
        "type": "study",
        "description": "Opiskellaan machine learningia ja AI:ta yhdessä",
        "member_count": 5,
        "interests": ["ai", "machine learning"],
        "skills": ["python"],
        "hobby_interests": []
    },
    {
        "id": 2,
        "name": "Web Dev Group",
        "type": "study",
        "description": "Frontend ja backend web development",
        "member_count": 8,
        "interests": ["web development"],
        "skills": ["javascript"],
        "hobby_interests": []
    },
    {
        "id": 3,
        "name": "Gaming Friends",
        "type": "hobby",
        "description": "Pelataan yhdessä vapaa-ajalla",
        "member_count": 10,
        "interests": [],
        "skills": [],
        "hobby_interests": ["pelaaminen"]
    },
    {
        "id": 4,
        "name": "Gym Buddies",
        "type": "hobby",
        "description": "Käydään salilla yhdessä",
        "member_count": 6,
        "interests": [],
        "skills": [],
        "hobby_interests": ["sali"]
    }
]


@app.get("/")
def root():
    return {"message": "API on käynnissä", "version": "v3"}


@app.post("/recommend/hobby")
def post_hobby_recommendations(request: HobbyRequest):
    user = {
        "hobby_interests": request.hobby_interests
    }

    hobby_recs = recommend_hobby_groups(user, groups)

    formatted = []

    for group_id, score in hobby_recs:
        group = next(g for g in groups if g["id"] == group_id)

        formatted.append({
            "group_id": group_id,
            "group_name": group["name"],
            "description": group["description"],
            "member_count": group["member_count"],
            "score": score
        })

    return {
        "recommendations": formatted
    }


@app.post("/recommend/users/hobby")
def recommend_users_by_hobby(request: HobbyUserRecommendationRequest):
    results = []

    for candidate in request.candidates:
        if candidate.user_id == request.current_user_id:
            continue

        score = jaccard_similarity(
            request.hobby_interests,
            candidate.hobby_interests
        )

        if score > 0:
            results.append({
                "user_id": candidate.user_id,
                "firstName": candidate.firstName,
                "city": candidate.city,
                "hobby_interests": candidate.hobby_interests,
                "score": score
            })

    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "recommendations": results
    }


@app.get("/recommend/hobby/{user_id}")
def get_hobby_recommendations_by_user(user_id: int):
    user = users.get(user_id)

    if not user:
        return {"error": "Käyttäjää ei löydy"}

    hobby_recs = recommend_hobby_groups(user, groups)

    formatted = []

    for group_id, score in hobby_recs:
        group = next(g for g in groups if g["id"] == group_id)

        formatted.append({
            "group_id": group_id,
            "group_name": group["name"],
            "description": group["description"],
            "member_count": group["member_count"],
            "score": score
        })

    return {
        "user_id": user_id,
        "recommendations": formatted
    }


@app.get("/recommend-groups/{user_id}")
def get_recommendations(user_id: int):
    user = users.get(user_id)

    if not user:
        return {"error": "Käyttäjää ei löydy"}

    study_recs = recommend_study_groups(user, groups)
    hobby_recs = recommend_hobby_groups(user, groups)

    def format_results(recommendations):
        formatted = []

        for group_id, score in recommendations:
            group = next(g for g in groups if g["id"] == group_id)

            formatted.append({
                "group_id": group_id,
                "group_name": group["name"],
                "description": group["description"],
                "member_count": group["member_count"],
                "score": score
            })

        return formatted

    return {
        "user_id": user_id,
        "study_recommendations": format_results(study_recs),
        "hobby_recommendations": format_results(hobby_recs)
    }