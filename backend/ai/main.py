from recommender import recommend_groups
from test_data import user, groups

recommendations = recommend_groups(user, groups)

print(recommendations)