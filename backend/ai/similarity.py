
#def jaccard_similarity(set1, set2):
#    intersection = len(set(set1).intersection(set(set2)))
#    union = len(set(set1).union(set(set2)))

#    if union == 0:
#        return 0

#    return intersection / union


#   Testidatan testaukseen:

# similarity.py

from utils import jaccard_similarity


def compare_users():
    interests1 = ["music", "sports", "coding"]
    interests2 = ["music", "movies", "coding"]

    score = jaccard_similarity(interests1, interests2)
    print("Similarity:", score)


if __name__ == "__main__":
    compare_users()
