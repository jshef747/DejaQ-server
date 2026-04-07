"""v13b: fine-tuned all-mpnet-base-v2 embedder, no LLM normalizer.

Same pipeline as v13 but with a larger (110M param) base encoder.
Train the checkpoint first:
    uv run python -m training.finetune_embedder

Then run:
    uv run python -m harness.runner --configs v13b_mpnet_finetuned
"""

from pathlib import Path

_CHECKPOINT = Path(__file__).resolve().parent.parent / "checkpoints" / "v13b_mpnet_finetuned"

CONFIG = {
    "name": "v13b_mpnet_finetuned",
    "description": "mpnet-base-v2 fine-tuned on Quora duplicates. Larger base model than v13.",
    "enabled": False,
    "passthrough": True,
    "embedder_model_path": str(_CHECKPOINT),
    # Dummies for harness compatibility
    "loader": {},
    "inference": {},
    "system_prompt": "",
    "few_shots": [],
}
