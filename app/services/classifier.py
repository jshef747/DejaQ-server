import logging

logger = logging.getLogger("dejaq.services.classifier")

class ClassifierService:
    def predict_complexity(self, query: str) -> str:
        """
        TODO SHAY: Use a local classifier (e.g., Nvidia/Prompt-Classifier) or DistilBERT.
        Returns: 'easy' or 'hard'
        """
        #Placeholder logic: If the query contains "complex", classify as hard; otherwise easy.
        if "complex" in query:
            logger.info(f"classifying query as HARD: {query}")
            return "hard"

        logger.info(f"classifying query as EASY: {query}")
        return "easy"