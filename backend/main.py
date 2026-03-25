from fastapi import FastAPI
from ai.recommender import recommend_study_groups, recommend_hobby_groups

app = FastAPI()

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

    #hobby group
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
    return {"message": "API on käynnissä"}


@app.get("/recommend/hobby/{user_id}")
def get_hobby_recommendations(user_id: int):

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