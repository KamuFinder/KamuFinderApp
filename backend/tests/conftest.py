import os
import pytest
from fastapi.testclient import TestClient

os.environ["GROQ_API_KEY"] = "test-key"
os.environ["OPENAI_MODEL"] = "llama-3.1-8b-instant"

from main import app

@pytest.fixture
def client():
    return TestClient(app)