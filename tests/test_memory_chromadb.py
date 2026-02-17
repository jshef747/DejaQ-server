import pytest

from app.services.memory_chromaDB import MemoryService

pytestmark = pytest.mark.no_model


class TestCacheHitMiss:
    def test_store_then_cache_hit(self, memory_service):
        memory_service.store_interaction(
            normalized_query="capital of france",
            generalized_answer="The capital of France is Paris.",
            original_query="what's the capital of france?",
            user_id="test-user",
        )
        result = memory_service.check_cache("capital of france")
        assert result is not None
        assert "Paris" in result

    def test_cache_miss_for_unrelated(self, memory_service):
        memory_service.store_interaction(
            normalized_query="capital of france",
            generalized_answer="The capital of France is Paris.",
            original_query="what's the capital of france?",
            user_id="test-user",
        )
        result = memory_service.check_cache("how does photosynthesis work")
        assert result is None


class TestCount:
    def test_empty_count(self, tmp_path):
        svc = MemoryService(
            collection_name="empty_test",
            persist_directory=str(tmp_path / "empty"),
        )
        assert svc.count == 0

    def test_count_after_store(self, tmp_path):
        svc = MemoryService(
            collection_name="count_test",
            persist_directory=str(tmp_path / "count"),
        )
        svc.store_interaction("q1", "a1", "orig1", "user1")
        assert svc.count == 1

    def test_upsert_same_key(self, tmp_path):
        svc = MemoryService(
            collection_name="upsert_test",
            persist_directory=str(tmp_path / "upsert"),
        )
        svc.store_interaction("same query", "answer1", "orig1", "user1")
        svc.store_interaction("same query", "answer2", "orig2", "user2")
        assert svc.count == 1


class TestGetAllEntries:
    def test_empty_returns_empty_list(self, tmp_path):
        svc = MemoryService(
            collection_name="entries_empty",
            persist_directory=str(tmp_path / "entries_empty"),
        )
        assert svc.get_all_entries() == []

    def test_returns_stored_entries(self, tmp_path):
        svc = MemoryService(
            collection_name="entries_test",
            persist_directory=str(tmp_path / "entries"),
        )
        svc.store_interaction("test query", "test answer", "original", "user1")
        entries = svc.get_all_entries()
        assert len(entries) == 1
        assert entries[0]["normalized_query"] == "test query"
        assert entries[0]["generalized_answer"] == "test answer"


class TestDeleteEntry:
    def test_delete_existing(self, tmp_path):
        svc = MemoryService(
            collection_name="delete_test",
            persist_directory=str(tmp_path / "delete"),
        )
        svc.store_interaction("query to delete", "answer", "orig", "user1")
        entries = svc.get_all_entries()
        entry_id = entries[0]["id"]
        assert svc.delete_entry(entry_id) is True
        assert svc.count == 0

    def test_delete_nonexistent(self, tmp_path):
        svc = MemoryService(
            collection_name="delete_none",
            persist_directory=str(tmp_path / "delete_none"),
        )
        assert svc.delete_entry("nonexistent-id") is False
