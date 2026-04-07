"""v13b: contrastive fine-tuning of all-mpnet-base-v2 on Quora duplicates.

Path B experiment: the v13 MiniLM runs plateaued at ~24% Hit@0.15 on the
200-concept universal test set because the 22M-param MiniLM encoder
saturated on Quora in <0.3 epochs. Swapping to the 110M-param
`all-mpnet-base-v2` encoder gives us ~5x more capacity and a stronger
pretrained paraphrase prior (MTEB paraphrase ~84 vs MiniLM ~73).

Dataset, loss, batch, LR, warmup — all unchanged from the v13 MiniLM run
to isolate the base-model effect.

Usage:
    cd normalization-test && uv run python -m training.finetune_embedder

Output:
    normalization-test/checkpoints/v13b_mpnet_finetuned/
"""

from __future__ import annotations

import json
import logging
import time
from pathlib import Path

from datasets import Dataset, concatenate_datasets, load_dataset
from sentence_transformers import SentenceTransformer, SentenceTransformerTrainer, losses
from sentence_transformers.training_args import SentenceTransformerTrainingArguments

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(name)s %(levelname)s %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("training.finetune_embedder")

BASE_MODEL = "sentence-transformers/all-mpnet-base-v2"
ROOT = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT / "checkpoints" / "v13b_mpnet_finetuned"

# Training hyperparameters
EPOCHS = 1
BATCH_SIZE = 64
LEARNING_RATE = 2e-5
WARMUP_RATIO = 0.1

# Quora is the only clean paraphrase source we've found that fits in under an
# hour. all-NLI looked like paraphrase data but is actually entailment pairs
# (specific premise → weak generalization) which HURT our test categories —
# confirmed experimentally: Quora+NLI dropped Hit@0.15 from 23.7% → 13.7%.
MAX_QUORA = 149_000  # full Quora
MAX_SEQ_LENGTH = 64
SYNTHETIC_PATH = ROOT / "training" / "synthetic_paraphrases.json"
SYNTHETIC_UPSAMPLE = 20  # Quora is ~500x larger; upsample so synthetic isn't drowned out


def _load_pair(name: str, config: str, col_a: str, col_b: str, limit: int) -> Dataset:
    logger.info("Loading %s [%s] (cap=%d)...", name, config, limit)
    ds = load_dataset(name, config, split="train")
    logger.info("  %d rows available", len(ds))
    if len(ds) > limit:
        ds = ds.shuffle(seed=42).select(range(limit))
        logger.info("  subsampled to %d rows", len(ds))
    # Normalize column names to anchor/positive for MNRL
    ds = ds.rename_columns({col_a: "anchor", col_b: "positive"})
    # Drop any other columns so concatenate_datasets works
    keep = {"anchor", "positive"}
    drop = [c for c in ds.column_names if c not in keep]
    if drop:
        ds = ds.remove_columns(drop)
    return ds


def _load_synthetic() -> Dataset:
    logger.info("Loading synthetic paraphrases from %s", SYNTHETIC_PATH)
    with open(SYNTHETIC_PATH) as f:
        rows = json.load(f)
    logger.info("  %d synthetic pairs loaded", len(rows))
    anchors = [r["anchor"] for r in rows] * SYNTHETIC_UPSAMPLE
    positives = [r["positive"] for r in rows] * SYNTHETIC_UPSAMPLE
    logger.info("  upsampled %dx -> %d rows", SYNTHETIC_UPSAMPLE, len(anchors))
    return Dataset.from_dict({"anchor": anchors, "positive": positives})


def load_training_mixture() -> Dataset:
    logger.info("=== Loading paraphrase mixture ===")
    datasets = [
        _load_pair("sentence-transformers/quora-duplicates", "pair", "anchor", "positive", MAX_QUORA),
        _load_synthetic(),
    ]
    merged = concatenate_datasets(datasets)
    merged = merged.shuffle(seed=42)
    logger.info("Total training rows: %d", len(merged))
    return merged


def main() -> None:
    overall_start = time.time()
    logger.info("=== v13 embedder fine-tuning ===")
    logger.info("Base model  : %s", BASE_MODEL)
    logger.info("Output dir  : %s", OUTPUT_DIR)
    logger.info("Epochs=%d  batch_size=%d  lr=%g", EPOCHS, BATCH_SIZE, LEARNING_RATE)

    train_dataset = load_training_mixture()

    logger.info("Loading base model...")
    model = SentenceTransformer(BASE_MODEL)
    model.max_seq_length = MAX_SEQ_LENGTH  # truncate to short queries — huge speedup on MPS
    logger.info("Device: %s  max_seq_length=%d", model.device, model.max_seq_length)

    train_loss = losses.MultipleNegativesRankingLoss(model)

    total_steps = (len(train_dataset) // BATCH_SIZE) * EPOCHS
    warmup_steps = int(total_steps * WARMUP_RATIO)
    logger.info(
        "Training: ~%d steps/epoch, %d total steps, %d warmup",
        len(train_dataset) // BATCH_SIZE,
        total_steps,
        warmup_steps,
    )

    OUTPUT_DIR.parent.mkdir(parents=True, exist_ok=True)
    args = SentenceTransformerTrainingArguments(
        output_dir=str(OUTPUT_DIR),
        num_train_epochs=EPOCHS,
        per_device_train_batch_size=BATCH_SIZE,
        learning_rate=LEARNING_RATE,
        warmup_steps=warmup_steps,
        logging_steps=100,
        save_strategy="no",
        disable_tqdm=False,
        report_to="none",
    )

    trainer = SentenceTransformerTrainer(
        model=model,
        args=args,
        train_dataset=train_dataset,
        loss=train_loss,
    )

    train_start = time.time()
    logger.info("Starting training — watch the tqdm bar for steps and loss...")
    trainer.train()
    train_duration = time.time() - train_start
    logger.info("Training complete in %.1f minutes", train_duration / 60)

    model.save(str(OUTPUT_DIR))
    total_duration = time.time() - overall_start
    logger.info("=== Done ===")
    logger.info("Total time  : %.1f minutes", total_duration / 60)
    logger.info("Checkpoint  : %s", OUTPUT_DIR)
    logger.info("Next step   : uv run python -m harness.runner --configs v13b_mpnet_finetuned")


if __name__ == "__main__":
    main()
