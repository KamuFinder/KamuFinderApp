from fastapi import FastAPI
from ai.recommender import recommend_groups

app = FastAPI()

# Testi "tietokanta"
users = {
    1: {
        "interests": ["ai", "python"],
        "skills": ["python", "ml"]
    },
    2: {
        "interests": ["web", "design"],
        "skills": ["html", "css"]
    }
}

groups = [
    {
        "id": 1,
        "name": "AI Study Group",
        "description": "Opiskellaan machine learningia and AI:ä yhdessä",
        "member_count": 5,
        "interests": ["ai", "machine learning"],
        "skills": ["python"]
    },
    {
        "id": 2,
        "name": "Web Dev Group",
        "description": "Frontend ja backend web development",
        "member_count": 8,
        "interests": ["web development"],
        "skills": ["javascript"]
    },
    {
        "id": 3,
        "name": "Data Science Group",
        "description": "Data analyysi and Python projekteja",
        "member_count": 6,
        "interests": ["python", "data science"],
        "skills": ["python"]
    }
]

@app.get("/")
def root():
    return {"message": "API on käynnissä"}


@app.get("/recommend-groups/{user_id}")
def get_recommendations(user_id: int):
    
    # hae user "tietokannasta"
    user = users.get(user_id)

    if not user:
        return {"error": "Käyttäjää ei löydy"}

    # kutsu AI
    recommendations = recommend_groups(user, groups)
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

    return {
        "user_id": user_id,
        "recommendations": formatted
    }

# Testidataan:
# from fastapi import FastAPI
#from ai.recommender import recommend_groups
#from ai.test_data import user, groups

#app = FastAPI()

#@app.get("/")
#def root():
#    return {"message": "API is running"}

#@app.get("/recommend-groups")
#def get_recommendations():
#    recommendations = recommend_groups(user, groups)
#    return {"recommendations": recommendations}