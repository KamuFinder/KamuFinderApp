from fastapi import FastAPI
from pydantic import BaseModel, Field
from ai.recommender import recommend_study_groups, recommend_hobby_groups
from ai.similarity import jaccard_similarity

app = FastAPI()

def normalize_hobbies(hobbies: list[str]) -> list[str]:
    return [
        hobby.strip().lower()
        for hobby in hobbies
        if isinstance(hobby, str) and hobby.strip()
    ]


def get_shared_hobbies(user_hobbies: list[str], candidate_hobbies: list[str]) -> list[str]:
    user_set = set(normalize_hobbies(user_hobbies))
    candidate_set = set(normalize_hobbies(candidate_hobbies))
    return list(user_set.intersection(candidate_set))

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



groups = [
    {
        "id": 1,
        "name": "AI Study Group",
        "type": "study",
        "description": "Opiskellaan machine learningia ja AI:ta yhdessä",
        "member_count": [],
        "study_interests": ["ai", "machine learning"],
        "hobby_interests": [],
        "skills": ["python"],
    },
    {
        "id": 2,
        "name": "Web Dev Group",
        "type": "study",
        "description": "Frontend ja backend web development",
        "member_count": [],
        "study_interests": ["web development"],
        "hobby_interests": [],
        "skills": ["javascript"],
    },
    {
        "id": 3,
        "name": "Gaming Friends",
        "type": "hobby",
        "description": "Pelataan yhdessä vapaa-ajalla",
        "member_count": [],
        "study_interests": [],
        "hobby_interests": ["pelaaminen"],
        "skills": [],
    },
    {
        "id": 4,
        "name": "Gym Buddies",
        "type": "hobby",
        "description": "Käydään salilla yhdessä",
        "member_count": [],
        "study_interests": [],
        "skills": [],
        "hobby_interests": ["sali"],
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

#poistetaan kirjoitusvirheiden mahdollisuudet
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
                "score": round(score, 3)
            })

    results.sort(key=lambda x: x["score"], reverse=True)
    #palautetaan parhaat 10
    results = results[:10]

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