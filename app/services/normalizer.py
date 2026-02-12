import logging

logger = logging.getLogger("dejaq.services.normalizer")

class NormalizerService:
    def normalize(self, raw_query) -> str:
        """
        TODO SHAY: Implement normalization logic here.
        """
        #Placeholder normalization: trim whitespace and convert to lowercase
        logger.debug(f"Normalizing query: {raw_query}")
        normalized_query = raw_query.strip().lower()
        logger.debug(f"Normalized query: {normalized_query}")
        return normalized_query
