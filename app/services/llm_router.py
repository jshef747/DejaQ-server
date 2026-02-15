import time
import logging
from app.services.model_loader import ModelManager

logger = logging.getLogger("dejaq.services.llm_router")

class LLMRouterService:
    def __init__(self):
        self.local_llm = ModelManager.load_llama()

    def generate_response(self, query: str, complexity: str, history: list[dict] | None = None) -> str:
        logger.info(f"Generating response for query with complexity '{complexity}': {query}")
        if complexity == "easy":
            return self._call_local_llm(query, history=history)
        else:
            return self._call_external_api(query)

    def _call_local_llm(self, query: str, history: list[dict] | None = None) -> str:
        system_prompt = "You are a helpful assistant. Answer the user's query concisely and accurately."
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": query})
        start = time.time()
        output = self.local_llm.create_chat_completion(
            messages=messages,
            max_tokens=512,
            temperature=0.7
        )
        response = output["choices"][0]["message"]["content"].strip()
        latency = (time.time() - start) * 1000

        logger.debug(f"Local LLM response generated in {latency:.2f} ms for query: {query}")
        return response

    def _call_external_api(self, query: str) -> str:
        # Placeholder for external API call (e.g., OpenAI, Qwen, etc.)
        # In a real implementation, this would involve making an HTTP request to the external service.
        logger.debug(f"Simulating external API call for query: {query}")
        time.sleep(0.5)  # Simulate network latency
        return f"Simulated response for: {query}"