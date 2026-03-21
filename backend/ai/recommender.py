#interest_score	kuinka kiinnostukset matchaa
#skill_score	kuinka taidot matchaa
#total_score	yhdistetty tulos

from similarity import jaccard_similarity

def recommend_groups(user, groups):
    results = []

    for group in groups:
        #Interest -pisteet
        interest_score = jaccard_similarity(
            user["interests"],
            group["interests"]
        )
        # skill -pisteet
        skill_score = jaccard_similarity(
            user.get("skills", []),
            group.get("skills", [])
        )

        # 3. Yhdistetyt pisteet 
        total_score = 0.7 * interest_score + 0.3 * skill_score
        
        results.append((group["id"], total_score))
        

    results.sort(key=lambda x: x[1], reverse=True)
    return results

#Testidatan testaukseen:
#print("Recommender loaded")

#def recommend_groups(user, groups):
#    results = []

#    for group in groups:
#        results.append((group["id"], 1.0))

#    return results