from typing import Optional
import logging

logger = logging.getLogger("dejaq.services.memory_chromaDB")

class MemoryService:
    def check_cache(self, normalized_query: str) -> Optional[str]:
        """
        TODO SHAY: Embed query using BERT and search ChromaDB.
        Returns the cached answer if found, otherwise None.
        """
        # Simulation: If the user asks "what is dejaq", we return a cached answer.
        if "dejaq" in normalized_query:
            logger.info("[Memory] Cache HIT for query: %s", normalized_query)
            return "DejaQ is a middleware architecture for optimizing LLM costs and latency."

        logger.info("[Memory] Cache MISS for query: %s", normalized_query)
        return None

    def save_interaction(self, query: str, answer: str, rating: int):
        """
        TODO: Store the Q&A pair in ChromaDB if rating is positive.
        """
        print(f"[Memory] Saving interaction to database: {query} -> {answer}")