# Normalizer

The normalizer's job is to turn a user's question into a **cache key** — a clean, consistent form that can be matched against previous questions in the cache.

## The problem it solves

Two users can ask the same thing in completely different ways:

- "What's the best coffee?" vs "Which coffee is the greatest?"
- "why is Ukraine at war with Russia?" vs "why is russia at war with ukraine?"

Without normalization, the cache would treat these as different questions and call the LLM twice. The normalizer collapses variations into a single key so the cache finds the match.

## How it works

Every query goes through two steps before hitting the cache:

### Step 1 — Spell correction

Before anything else, obvious typos are fixed. "ukrine" becomes "ukraine", "captal" becomes "capital". This prevents a typo from producing a completely different cache key than the correctly-spelled version.

The spell corrector only touches words it doesn't recognize — known words pass through untouched.

### Step 2 — Opinion gate

The normalizer checks whether the question is asking for a subjective recommendation ("best", "greatest", "top-rated", "finest", etc.) or a factual question.

**Factual question** → lowercase passthrough. No model is called. Fast.

```
"Why is Ukraine at war with Russia?" → "why is ukraine at war with russia?"
"How does photosynthesis work?"      → "how does photosynthesis work?"
```

**Opinion question** → an LLM (Gemma 4 E2B) rewrites it to a short canonical form.

```
"What is the greatest coffee bean origin?" → "best coffee"
"Which country produces the finest coffee?" → "best coffee"
"What are the top-rated hiking boots?"      → "best hiking boot"
```

This ensures that any phrasing of "best X" maps to the same cache key, so the cache works across all opinion phrasings.

### Why not just use embeddings for everything?

Embeddings handle semantic similarity well (0.01 distance between "Ukraine at war with Russia" and "Russia at war with Ukraine"), but they struggle when the surface form is very different. The opinion rewrite makes these cases exact string matches instead of relying on the embedding distance threshold.

## The howto guard

One edge case: "What's the best way to cook steak?" uses "best" but isn't asking for a recommendation — it's asking for a method. The normalizer detects this pattern (best + way/method/technique/approach/...) and routes it to the factual passthrough instead of the opinion rewriter.

## Where it fits in the pipeline

```
User query
    ↓
Spell correction
    ↓
Opinion? ──yes──> Gemma E2B rewrite ──> "best <noun>"
    │
    no
    ↓
Lowercase passthrough
    ↓
Cache key (used for lookup + storage)
```

## Source

`server/app/services/normalizer.py`
