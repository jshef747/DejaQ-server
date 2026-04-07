"""v14: structured-intent extractor + v13b mpnet embedder.

Qwen 2.5-0.5B with grammar-constrained decoding emits a fixed schema
    ACT topic [| modifier]
which collapses speech-act and superlative variation that the v13/v13b
fine-tuned embedders cannot flatten on their own. The structured form
is then embedded with the v13b mpnet checkpoint.

See plan: ~/.claude/plans/nested-discovering-pebble.md
"""

from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
_EMBEDDER = _ROOT / "checkpoints" / "v13b_mpnet_finetuned"

_GRAMMAR = r"""
root     ::= act " " topic modifier?
act      ::= "ASK_FACT" | "EXPLAIN" | "COMPARE" | "RECOMMEND" | "HOWTO" | "CODE_REQUEST" | "OPINION" | "HISTORY"
topic    ::= word (" " word){0,7}
modifier ::= " | " word (" " word){0,5}
word     ::= [a-z0-9]+
"""

_SYSTEM_PROMPT = """You convert user queries into a structured intent label.
Output exactly one line in the format: ACT topic | modifier

ACT must be one of: ASK_FACT, EXPLAIN, COMPARE, RECOMMEND, HOWTO, CODE_REQUEST, OPINION, HISTORY
- ASK_FACT: factual lookup (capitals, numbers, names, dates of objects)
- EXPLAIN:  conceptual / how-something-works
- COMPARE:  difference between two things
- RECOMMEND: "best/greatest/top/finest X" — always RECOMMEND, never OPINION
- HOWTO:    procedural instructions ("how to X", "guide me through X", "walk me through X")
- CODE_REQUEST: any code/snippet/programming task
- OPINION:  subjective viewpoint not framed as "best" (rare)
- HISTORY:  who/when/where of past events, inventions, discoveries

topic = short lowercase noun phrase. NO articles (a, an, the). NO superlatives
(best, greatest, ultimate, finest, top). NO question words (how, what, which).
NO speech-act verbs (give, walk, show, tell, write, name).

modifier = optional qualifier after " | ". Use ONLY when the topic has a
specific dimension: programming language for code, time period for history,
comparison object, domain. Omit if not needed.

Two paraphrases of the same intent MUST produce the same output.
"""

_FEW_SHOTS = [
    # ASK_FACT
    ("What is the smallest planet in our solar system?",        "ASK_FACT smallest planet | solar system"),
    ("Name the tiniest planet orbiting our sun.",               "ASK_FACT smallest planet | solar system"),
    ("Which solar system planet has the least mass and volume?", "ASK_FACT smallest planet | solar system"),
    ("What is the deepest point in the ocean?",                  "ASK_FACT deepest point | ocean"),
    # RECOMMEND (opinion-style "best X")
    ("Which season of the year is the best?",                    "RECOMMEND season of year"),
    ("What is arguably the greatest time of year?",              "RECOMMEND season of year"),
    ("Which season do you consider to be the absolute best?",    "RECOMMEND season of year"),
    ("Which programming language is the best choice for data science?", "RECOMMEND programming language | data science"),
    ("What is the most highly recommended language for a data analyst?", "RECOMMEND programming language | data science"),
    ("Which coding tool is the ultimate best for machine learning and data?", "RECOMMEND programming language | data science"),
    # HOWTO (question + imperative variants collapse)
    ("How do you neatly wrap a present?",                        "HOWTO wrap gift"),
    ("What is the best technique for gift wrapping?",            "HOWTO wrap gift"),
    ("Give me a step-by-step guide to wrapping a box with paper.", "HOWTO wrap gift"),
    ("How do I create a professional resume?",                   "HOWTO write resume"),
    ("What are the steps to writing a good CV?",                 "HOWTO write resume"),
    ("Guide me through building a resume from scratch.",         "HOWTO write resume"),
    # CODE_REQUEST (intent + request variants collapse)
    ("How do I read user input from the console in Java?",       "CODE_REQUEST read console input | java"),
    ("Write Java code using Scanner to get command line input.", "CODE_REQUEST read console input | java"),
    ("Show me a Java snippet that prompts the user for text input.", "CODE_REQUEST read console input | java"),
    # COMPARE
    ("What is the difference between CC and BCC in an email?",   "COMPARE cc bcc | email"),
    ("Compare the CC and BCC fields when sending emails.",       "COMPARE cc bcc | email"),
    # EXPLAIN
    ("How do submarines sink and float?",                        "EXPLAIN submarine ballast"),
    ("Explain the ballast system of a submarine.",               "EXPLAIN submarine ballast"),
    # HISTORY
    ("Who invented the World Wide Web?",                         "HISTORY inventor world wide web"),
    ("Name the creator of the WWW.",                             "HISTORY inventor world wide web"),
]


def _postprocess(raw: str, original: str) -> str:
    # Grammar guarantees the format. Just lowercase and collapse whitespace.
    return " ".join(raw.lower().split())


CONFIG = {
    "name": "v14_structured_intent",
    "description": "Qwen 2.5-0.5B grammar-constrained intent extractor + v13b mpnet embedder.",
    "enabled": True,
    "passthrough": False,
    "embedder_model_path": str(_EMBEDDER),
    "loader": {
        "repo_id": "Qwen/Qwen2.5-0.5B-Instruct-GGUF",
        "filename": "*q4_k_m.gguf",
        "n_ctx": 4096,
    },
    "inference": {
        "max_tokens": 48,
        "temperature": 0.0,
    },
    "grammar": _GRAMMAR,
    "system_prompt": _SYSTEM_PROMPT,
    "few_shots": _FEW_SHOTS,
    "postprocess_fn": _postprocess,
}
