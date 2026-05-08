import logging
import time

from app.services.model_backends import CompletionRequest, ModelBackend

logger = logging.getLogger("dejaq.services.validator")

_SYSTEM_PROMPT = (
    "You decide if a CACHED ANSWER can correctly answer a NEW QUESTION.\n"
    "Reply with exactly one word: VALID or INVALID.\n"
    "VALID = the cached answer already contains EVERY specific fact the new question asks for.\n"
    "INVALID = the cached answer is missing any requested fact, is about a different entity, or is off-topic.\n"
    "Two rules:\n"
    "- MULTIPLE FACTS: If the new question asks for two or more facts (e.g. 'A and B'), "
    "the answer must contain ALL of them. A partial answer is INVALID.\n"
    "- TONE: Ignore tone, formality, and language style. Casual or slang phrasing that "
    "asks for the same information is VALID if the answer contains it.\n"
    "When in doubt, choose INVALID."
)

_FEW_SHOTS = [
    (
        "CACHED QUESTION: What is the capital of France?\n"
        "CACHED ANSWER: The capital of France is Paris.\n"
        "NEW QUESTION: What is France's capital city?",
        "VALID",
    ),
    (
        "CACHED QUESTION: What is gravity?\n"
        "CACHED ANSWER: Gravity is a fundamental force that attracts objects with mass toward each other.\n"
        "NEW QUESTION: bro what even is gravity and why do things fall",
        "VALID",
    ),
    (
        "CACHED QUESTION: What is the capital of New Zealand?\n"
        "CACHED ANSWER: Wellington is the capital city of New Zealand.\n"
        "NEW QUESTION: How many people live in the capital of New Zealand?",
        "INVALID",
    ),
    (
        "CACHED QUESTION: What is the capital of France?\n"
        "CACHED ANSWER: The capital of France is Paris.\n"
        "NEW QUESTION: What is the capital of Germany?",
        "INVALID",
    ),
    (
        "CACHED QUESTION: What is the capital of New Zealand?\n"
        "CACHED ANSWER: Wellington is the capital of New Zealand.\n"
        "NEW QUESTION: What is the capital and largest city of New Zealand?",
        "INVALID",
    ),
    (
        "CACHED QUESTION: Who wrote Hamlet?\n"
        "CACHED ANSWER: Hamlet was written by William Shakespeare.\n"
        "NEW QUESTION: Who wrote Hamlet and when was it written?",
        "INVALID",
    ),
    (
        "CACHED QUESTION: What is machine learning?\n"
        "CACHED ANSWER: Machine learning is a branch of AI where systems learn from data.\n"
        "NEW QUESTION: What is deep learning?",
        "INVALID",
    ),
    (
        "CACHED QUESTION: What is photosynthesis?\n"
        "CACHED ANSWER: Photosynthesis is the process by which plants convert sunlight, water, and CO2 into glucose and oxygen.\n"
        "NEW QUESTION: yo eli5 photosynthesis",
        "VALID",
    ),
]

# Word-count cap on cached_answer before validator call.
# At ~400 words (~500 tokens) we stay under ~42% of the 2048-ctx window,
# safely below the 56% threshold where the model outputs garbage.
_MAX_ANSWER_WORDS = 400


class ValidatorService:
    def __init__(self, backend: ModelBackend, model_name: str):
        self.backend = backend
        self.model_name = model_name

    async def validate(
        self,
        new_query: str,
        cached_query: str,
        cached_answer: str,
    ) -> tuple[bool, str]:
        """Return (is_valid, raw_verdict). Fail-safe: unparseable output → False (INVALID)."""
        words = cached_answer.split()
        if len(words) > _MAX_ANSWER_WORDS:
            cached_answer = " ".join(words[:_MAX_ANSWER_WORDS])

        messages: list[dict] = [{"role": "system", "content": _SYSTEM_PROMPT}]
        for user_msg, assistant_msg in _FEW_SHOTS:
            messages.append({"role": "user", "content": user_msg})
            messages.append({"role": "assistant", "content": assistant_msg})
        messages.append({
            "role": "user",
            "content": (
                f"CACHED QUESTION: {cached_query}\n"
                f"CACHED ANSWER: {cached_answer}\n"
                f"NEW QUESTION: {new_query}"
            ),
        })

        was_truncated = len(cached_answer.split()) >= _MAX_ANSWER_WORDS

        start = time.time()
        raw = await self.backend.complete(
            CompletionRequest(
                model_name=self.model_name,
                messages=messages,
                max_tokens=8,
                temperature=0.0,
            )
        )
        latency_ms = (time.time() - start) * 1000

        first_token = raw.strip().split()[0].upper() if raw.strip() else ""
        if first_token == "VALID":
            logger.debug(
                "validator verdict=VALID latency=%.1fms truncated=%s query=%r",
                latency_ms, was_truncated, new_query[:80],
            )
            return True, raw
        if first_token == "INVALID":
            logger.debug(
                "validator verdict=INVALID latency=%.1fms truncated=%s query=%r",
                latency_ms, was_truncated, new_query[:80],
            )
            return False, raw
        logger.warning(
            "validator verdict=UNPARSEABLE raw=%r latency=%.1fms query=%r; treating as INVALID",
            raw[:40], latency_ms, new_query[:60],
        )
        return False, raw
