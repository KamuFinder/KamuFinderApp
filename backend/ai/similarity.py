def jaccard_similarity(list1, list2):
    set1 = set(list1)
    set2 = set(list2)

    intersection = len(set1 & set2)
    union = len(set1 | set2)

    if union == 0:
        return 0

    return intersection / union
