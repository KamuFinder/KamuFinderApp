from typing import List
from fastapi import FastAPI
from pydantic import BaseModel, Field
from ai.recommender import recommend_study_groups, recommend_hobby_groups
from ai.similarity import jaccard_similarity

app = FastAPI()


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




class HobbyRequest(BaseModel):
    hobby_interests: List[str]


class CandidateUser(BaseModel):
    user_id: str
    firstName: str = ""
    city: str = ""
    hobby_interests: List[str] = Field(default_factory=list)


class HobbyUserRecommendationRequest(BaseModel):
    current_user_id: str
    hobby_interests: List[str]
    candidates: List[CandidateUser] = Field(default_factory=list)


class StudyGroupCandidate(BaseModel):
    group_id: str
    name: str
    description: str = ""
    tags: List[str] = Field(default_factory=list)
    memberCount: int = 0


class StudyGroupRecommendationRequest(BaseModel):
    user_id: str
    study_interests: List[str] = Field(default_factory=list)
    groups: List[StudyGroupCandidate] = Field(default_factory=list)


class StudyGroupRecommendationResponse(BaseModel):
    group_id: str
    name: str
    description: str
    tags: List[str]
    score: float
    shared_interests: List[str]
    shared_count: int
    memberCount: int



@app.get("/")
def root():
    return {"message": "API on käynnissä", "version": "v5"}



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


@app.post(
    "/recommend/study-groups",
    response_model=List[StudyGroupRecommendationResponse]
)
def recommend_study_groups_endpoint(request: StudyGroupRecommendationRequest):
    user = {
        "study_interests": request.study_interests
    }

    formatted_groups = [
        {
            "group_id": group.group_id,
            "name": group.name,
            "description": group.description,
            "tags": group.tags,
            "memberCount": group.memberCount,
        }
        for group in request.groups
    ]

    return recommend_study_groups(user, formatted_groups)