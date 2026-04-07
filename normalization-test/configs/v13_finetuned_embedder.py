"""v13: fine-tuned all-MiniLM-L6-v2 embedder, no LLM normalizer.

Abandons text generation entirely. The normalizer is just a passthrough — the
harness feeds raw queries into a contrastively fine-tuned sentence-transformer
checkpoint that collapses paraphrases in embedding space directly.

Train the checkpoint first:
    uv run python -m training.finetune_embedder

Then run:
    uv run python -m harness.runner --configs v13_finetuned_embedder
"""

from pathlib import Path

_CHECKPOINT = Path(__file__).resolve().parent.parent / "checkpoints" / "v13_minilm_finetuned"

CONFIG = {
    "name": "v13_finetuned_embedder",
    "description": "Contrastively fine-tuned all-MiniLM-L6-v2 on Quora duplicates. No LLM normalizer.",
    "enabled": False,
    "passthrough": True,
    "embedder_model_path": str(_CHECKPOINT),
    # Dummies for harness compatibility
    "loader": {},
    "inference": {},
    "system_prompt": "",
    "few_shots": [],
}
