import os
from dotenv import load_dotenv

load_dotenv()

RELAY_URL = os.getenv("RELAY_URL", "http://127.0.0.1:8000")
NODE_ID = os.getenv("NODE_ID")
NODE_TOKEN = os.getenv("NODE_TOKEN")
SENSOR_TYPE = os.getenv("SENSOR_TYPE", "cowrie")
COWRIE_JSON_PATH = os.getenv("COWRIE_JSON_PATH", "./sample-cowrie.json")
