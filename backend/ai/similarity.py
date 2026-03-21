def jaccard_similarity(list1, list2):
    set1 = set(list1)
    set2 = set(list2)

    intersection = len(set1 & set2)
    union = len(set1 | set2)

    if union == 0:
        return 0

    return intersection / union


#   Testidatan testaukseen:

# similarity.py

#from utils import jaccard_similarity


#def compare_users():
#    interests1 = ["music", "sports", "coding"]
#    interests2 = ["music", "movies", "coding"]

#    score = jaccard_similarity(interests1, interests2)
#    print("Similarity:", score)


#if __name__ == "__main__":
#    compare_users()
