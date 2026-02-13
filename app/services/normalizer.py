import logging
import time
from turtledemo.penrose import start

from app.services.model_loader import ModelManager

logger = logging.getLogger("dejaq.services.normalizer")



class NormalizerService:

    def __init__(self):
        self.llm = ModelManager.load_qwen()


    def normalize(self, raw_query) -> str:
        logger.debug(f"Normalizing query: {raw_query}")

        system_prompt = (
            "You are a search query optimizer. "
            "Remove all politeness, conversational fillers, and meta-instructions. "
            "Keep all search-relevant nouns, verbs, and defining adjectives. "
            "Output ONLY the cleaned query string. "
            "Do NOT answer the question."
        )

        start = time.time()

        output = self.llm.create_chat_completion(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": raw_query}
            ],
            max_tokens=128,
            temperature=0.1
        )

        cleaned_query = output["choices"][0]["message"]["content"].strip()
        latency = (time.time() - start) * 1000
        logger.info(f"Normalization completed in {latency:.2f} ms. Raw: '{raw_query}' -> Normalized: '{cleaned_query}'")
        return cleaned_query
