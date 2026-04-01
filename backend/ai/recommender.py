from ai.similarity import jaccard_similarity


def normalize_list(values):
    return [
        value.strip().lower()
        for value in values
        if isinstance(value, str) and value.strip()
    ]


def recommend_study_groups(user, groups):
    results = []

    user_study_interests = normalize_list(user.get("study_interests", []))

    for group in groups:
        group_tags = normalize_list(group.get("tags", []))

        if not group_tags:
            continue

        score = jaccard_similarity(user_study_interests, group_tags)

        shared_interests = list(set(user_study_interests).intersection(set(group_tags)))

        if score > 0:
            results.append({
                "group_id": group.get("group_id", ""),
                "name": group.get("name", ""),
                "description": group.get("description", ""),
                "tags": group.get("tags", []),
                "score": round(score, 3),
                "shared_interests": sorted(shared_interests),
                "shared_count": len(shared_interests),
                "memberCount": group.get("memberCount", 0),
            })

    results.sort(
        key=lambda x: (x["shared_count"], x["score"], x["memberCount"]),
        reverse=True
    )

    return results


def recommend_hobby_groups(user, groups):
    results = []

    user_hobbies = normalize_list(user.get("hobby_interests", []))

    for group in groups:
        if group.get("type") != "hobby":
            continue

        group_hobbies = normalize_list(group.get("hobby_interests", []))

        score = jaccard_similarity(user_hobbies, group_hobbies)

        if score > 0:
            results.append((group["id"], score))

    results.sort(key=lambda x: x[1], reverse=True)
    return results