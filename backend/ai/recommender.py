#interest_score	kuinka kiinnostukset matchaa
#skill_score	kuinka taidot matchaa
#total_score	yhdistetty tulos

from ai.similarity import jaccard_similarity


def recommend_study_groups(user, groups):
    results = []

    for group in groups:
        if group.get("type") != "study":
            continue

        interest_score = jaccard_similarity(
            user.get("interests", []),
            group.get("interests", [])
        )

        skill_score = jaccard_similarity(
            user.get("skills", []),
            group.get("skills", [])
        )

        total_score = 0.7 * interest_score + 0.3 * skill_score

        results.append((group["id"], total_score))

    results.sort(key=lambda x: x[1], reverse=True)
    return results


def recommend_hobby_groups(user, groups):
    results = []

    for group in groups:
        if group.get("type") != "hobby":
            continue

        hobby_score = jaccard_similarity(
            user.get("hobby_interests", []),
            group.get("hobby_interests", [])
        )

        results.append((group["id"], hobby_score))

    results.sort(key=lambda x: x[1], reverse=True)
    return results

#Testidatan testaukseen:
#print("Recommender loaded")

#def recommend_groups(user, groups):
#    results = []

#    for group in groups:
#        results.append((group["id"], 1.0))

#    return results