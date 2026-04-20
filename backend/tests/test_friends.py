def test_search_friends_success(client):
    response = client.get("/friends/search?q=anni")

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)


def test_search_friends_empty_query(client):
    response = client.get("/friends/search?q=")
    assert response.status_code in [200, 400, 422]


def test_search_friends_no_results(client):
    response = client.get("/friends/search?q=zzzzzzzz")

    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 0


def test_search_friends_missing_query_param(client):
    response = client.get("/friends/search")

    assert response.status_code in [400, 422]