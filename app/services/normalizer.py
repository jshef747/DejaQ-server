import logging
import time

from app.services.model_loader import ModelManager

logger = logging.getLogger("dejaq.services.normalizer")



class NormalizerService:

    def __init__(self):
        self.llm = ModelManager.load_qwen()


    def normalize(self, raw_query) -> str:
        logger.debug(f"Normalizing query: {raw_query}")

        start = time.time()

        output = self.llm.create_chat_completion(
            messages=[
                {"role": "system", "content": "You are a query extractor. Given a user message, output ONLY the core topic as a short search query. Never answer the question. Never explain. Just output the topic."},
                {"role": "user", "content": "INPUT: hey can you explain quantum mechanics like I'm 5\nQUERY:"},
                {"role": "assistant", "content": "quantum mechanics"},
                {"role": "user", "content": "INPUT: yo what's the capital of france lol\nQUERY:"},
                {"role": "assistant", "content": "capital of france"},
                {"role": "user", "content": "INPUT: I was wondering if you could tell me how photosynthesis works in detail please\nQUERY:"},
                {"role": "assistant", "content": "how does photosynthesis work"},
                {"role": "user", "content": "INPUT: explain to me how a computer works like I am 5 years old\nQUERY:"},
                {"role": "assistant", "content": "how does a computer work"},
                {"role": "user", "content": "INPUT: can someone tell me what gravity is in simple terms\nQUERY:"},
                {"role": "assistant", "content": "what is gravity"},
                {"role": "user", "content": f"INPUT: {raw_query}\nQUERY:"},
            ],
            max_tokens=32,
            temperature=0.0
        )

        cleaned_query = output["choices"][0]["message"]["content"].strip()
        latency = (time.time() - start) * 1000
        logger.info(f"Normalization completed in {latency:.2f} ms. Raw: '{raw_query}' -> Normalized: '{cleaned_query}'")
        return cleaned_query
