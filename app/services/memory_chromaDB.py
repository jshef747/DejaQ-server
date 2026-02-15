import hashlib
import time
import logging
from typing import Optional

import chromadb

logger = logging.getLogger("dejaq.services.memory_chromaDB")

SIMILARITY_THRESHOLD = 0.15


class MemoryService:
    def __init__(
        self,
        collection_name: str = "dejaq_default",
        persist_directory: str = "./chroma_data",
    ):
        logger.info("Initializing ChromaDB (collection=%s, path=%s)", collection_name, persist_directory)
        self._client = chromadb.PersistentClient(path=persist_directory)
        self._collection = self._client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        logger.info("ChromaDB ready — %d documents in collection '%s'", self._collection.count(), collection_name)

    def check_cache(self, normalized_query: str) -> Optional[str]:
        start = time.time()
        results = self._collection.query(
            query_texts=[normalized_query],
            n_results=1,
        )

        latency_ms = (time.time() - start) * 1000

        if (
            results["distances"]
            and results["distances"][0]
            and results["distances"][0][0] <= SIMILARITY_THRESHOLD
        ):
            distance = results["distances"][0][0]
            answer = results["metadatas"][0][0]["generalized_answer"]
            logger.info(
                "Cache HIT (distance=%.4f, latency=%.1fms) for query: %s",
                distance, latency_ms, normalized_query,
            )
            return answer

        distance = results["distances"][0][0] if results["distances"] and results["distances"][0] else None
        logger.info(
            "Cache MISS (distance=%s, latency=%.1fms) for query: %s",
            f"{distance:.4f}" if distance is not None else "N/A",
            latency_ms,
            normalized_query,
        )
        return None

    def store_interaction(
        self,
        normalized_query: str,
        generalized_answer: str,
        original_query: str,
        user_id: str,
    ) -> None:
        doc_id = hashlib.sha256(normalized_query.encode()).hexdigest()[:16]
        self._collection.upsert(
            ids=[doc_id],
            documents=[normalized_query],
            metadatas=[{
                "generalized_answer": generalized_answer,
                "original_query": original_query,
                "user_id": user_id,
                "stored_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            }],
        )
        logger.info("Stored in cache (id=%s, total=%d)", doc_id, self._collection.count())

    def get_all_entries(self, limit: int = 50, offset: int = 0) -> list[dict]:
        """Return all cached entries with metadata for the cache viewer."""
        total = self._collection.count()
        if total == 0:
            return []

        results = self._collection.get(
            include=["documents", "metadatas"],
            limit=limit,
            offset=offset,
        )

        entries = []
        for i, doc_id in enumerate(results["ids"]):
            meta = results["metadatas"][i] if results["metadatas"] else {}
            entries.append({
                "id": doc_id,
                "normalized_query": results["documents"][i] if results["documents"] else "",
                "generalized_answer": meta.get("generalized_answer", ""),
                "original_query": meta.get("original_query", ""),
                "user_id": meta.get("user_id", ""),
                "stored_at": meta.get("stored_at", ""),
            })

        return entries

    def delete_entry(self, entry_id: str) -> bool:
        """Delete a single cache entry by ID. Returns True if it existed."""
        try:
            existing = self._collection.get(ids=[entry_id])
            if not existing["ids"]:
                return False
            self._collection.delete(ids=[entry_id])
            logger.info("Deleted cache entry %s (total=%d)", entry_id, self._collection.count())
            return True
        except Exception:
            logger.error("Failed to delete cache entry %s", entry_id)
            return False

    @property
    def count(self) -> int:
        return self._collection.count()
