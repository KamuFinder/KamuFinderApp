from unittest.mock import patch


def test_chat_ai_success_mocked(client):
    mock_response = type(
        "MockResponse",
        (),
        {
            "choices": [
                type(
                    "Choice",
                    (),
                    {
                        "message": type(
                            "Msg",
                            (),
                            {"content": "Mockattu AI-vastaus"}
                        )()
                    },
                )()
            ]
        },
    )()

    with patch("main.client.chat.completions.create", return_value=mock_response):
        payload = {
            "userId": "user123",
            "chatId": "default",
            "message": "Moi"
        }

        response = client.post("/chat/ai", json=payload)

        assert response.status_code == 200
        assert response.json()["reply"] == "Mockattu AI-vastaus"


def test_chat_ai_empty_message(client):
    payload = {
        "userId": "user123",
        "chatId": "default",
        "message": ""
    }

    response = client.post("/chat/ai", json=payload)

    assert response.status_code in [400, 422]


def test_chat_ai_missing_message_field(client):
    payload = {
        "userId": "user123",
        "chatId": "default"
    }

    response = client.post("/chat/ai", json=payload)

    assert response.status_code == 422


def test_chat_ai_missing_user_id(client):
    payload = {
        "chatId": "default",
        "message": "Moi"
    }

    response = client.post("/chat/ai", json=payload)

    assert response.status_code == 422


def test_chat_ai_groq_failure(client):
    with patch(
        "main.client.chat.completions.create",
        side_effect=Exception("Groq failure")
    ):
        payload = {
            "userId": "user123",
            "chatId": "default",
            "message": "Moi"
        }

        response = client.post("/chat/ai", json=payload)

        assert response.status_code in [500, 502, 503]