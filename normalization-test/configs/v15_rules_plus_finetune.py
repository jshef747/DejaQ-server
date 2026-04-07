"""v15: deterministic Python rule pipeline + v13b fine-tuned mpnet embedder.

No LLM at all. The entire normalization is pure Python string manipulation:
    lowercase → strip punctuation → remove filler phrases → tokenize →
    remove stopwords → synonym canonicalization → lemmatization →
    alphabetical sort → join

This cleaned text is then embedded by the v13b fine-tuned mpnet checkpoint.

Rationale: v1–v14 prove that Qwen 0.5B / Gemma E2B cannot reliably
canonicalize synonyms across paraphrases. The fine-tuned embedder alone
(v13b passthrough, 41% Hit@0.15) is limited because raw query surface-form
diversity is too high for the embedder to collapse. By deterministically
cleaning the worst variance sources (superlatives, speech-act verbs,
filler, synonyms) BEFORE embedding, we give the embedder much less work.

Target: >75% Hit@0.15, latency ~0ms per prompt.
"""

from __future__ import annotations

import re
from pathlib import Path

_ROOT = Path(__file__).resolve().parent.parent
_EMBEDDER = _ROOT / "checkpoints" / "v13b_mpnet_finetuned"

# ── Filler phrases removed before tokenization ──────────────────────────────
# Order matters: longer phrases first to avoid partial matches.
_FILLER_PHRASES = [
    # step/guide framing
    "step-by-step", "step by step", "from scratch", "walk me through",
    "guide me through", "give me a step-by-step guide to",
    "give me a step-by-step guide for",
    # scope modifiers
    "of all time", "all time", "in general", "in the world", "on earth",
    "in the universe", "in our solar system", "on the planet",
    "in the solar system", "on our planet",
    # opinion/recommendation qualifiers
    "highly recommended", "widely considered", "most highly recommended",
    "in your opinion", "would you say", "do you think",
    "is considered", "comes most", "is arguably",
    # filler/politeness
    "like a pro", "right now", "these days", "at home", "for beginners",
    "can you tell me", "could you tell me", "i was wondering if you could",
    "can you explain", "could you explain",
    # absolute qualifiers
    "the absolute", "the single", "the ultimate",
]

# ── Stopwords: functional words with no topic content ────────────────────────
_STOPWORDS = frozenset("""
a an the and or but of in on at to for from with without by into onto upon
is are was were be been being am do does did doing done have has had having
will would could should may might must shall can cannot
i me my mine we us our ours you your yours he him his she her hers it its
they them their theirs this that these those what which who whom whose
how when where why whether if then than as so such also just only even still
yet very much more most less least many few some any all every each no not
please kindly hey hi hello thanks thank ok okay well actually basically really
truly simply literally kind sort type exactly precisely rather quite fairly
tell show give teach guide help let make through
want trying need looking about get got getting going go come came ever never
always sometimes often usually generally typically normally currently recently
today tomorrow yesterday now later sooner longer shorter
thing things stuff matter way ways method methods process
there here everywhere somewhere anywhere nowhere
good better great nice new old young big large small little
mean means meaning called named known said consider
between difference differ different differs compare compared comparing
versus vs
""".split())

# ── Synonym canonicalization ─────────────────────────────────────────────────
# Maps variant → canonical form. Applied per-token after stopword removal.
# Goal: collapse surface-form variations so embeddings converge.
_SYNONYMS = {
    # ── superlatives / opinion qualifiers → canonical ──
    "biggest": "largest", "greatest": "best", "top": "best", "finest": "best",
    "ultimate": "best", "optimal": "best", "ideal": "best", "premier": "best",
    "superior": "best", "highest": "largest", "tallest": "largest",
    "tiniest": "smallest", "littlest": "smallest",
    "quickest": "fastest", "speediest": "fastest", "swiftest": "fastest",
    "ancient": "oldest", "earliest": "oldest",
    "toughest": "hardest", "strongest": "hardest",
    "poorest": "worst", "lowest": "worst",
    "delicious": "best", "perfect": "best", "absolute": "best",

    # ── vehicles ──
    "vehicle": "car", "automobile": "car", "auto": "car",

    # ── people/animals ──
    "mammal": "animal", "creature": "animal",

    # ── books/literature ──
    "novel": "book", "publication": "book", "literature": "book",
    "fiction": "book", "nonfictional": "nonfiction",

    # ── movies/shows ──
    "film": "movie", "picture": "movie",
    "television": "tv", "series": "show",

    # ── tech ──
    "application": "app", "software": "app", "program": "app", "platform": "app",
    "snippet": "code", "script": "code",
    "pc": "computer", "machine": "computer", "device": "computer",
    "smartphone": "phone", "cellphone": "phone", "mobile": "phone",
    "postgres": "database", "mysql": "database", "mongo": "database",
    "mongodb": "database", "datastore": "database", "postgresql": "database",
    "website": "web", "webpage": "web", "site": "web",

    # ── programming languages ──
    "javascript": "js", "typescript": "ts", "python": "py",
    "golang": "go", "c++": "cpp", "cplusplus": "cpp",

    # ── food/cooking ──
    "prepare": "cook", "preparation": "cook", "cooking": "cook",
    "grilling": "grill", "searing": "sear",
    "boiling": "boil", "boiled": "boil",
    "dice": "cut", "chop": "cut", "slice": "cut", "mince": "cut",

    # ── body/health ──
    "exercise": "workout", "fitness": "workout", "training": "workout",
    "activity": "workout",

    # ── home/diy ──
    "bedroom": "room", "interior": "room",
    "painting": "paint", "prep": "prepare",
    "wash": "clean", "cleaning": "clean",
    "streak-free": "streakfree", "streakless": "streakfree",

    # ── crafts ──
    "plait": "braid", "braiding": "braid", "weave": "braid",
    "wrapping": "wrap", "present": "gift",

    # ── jobs/work ──
    "cv": "resume", "freelancer": "freelance",
    "employment": "job", "employee": "job",
    "consulting": "freelance",

    # ── travel ──
    "holiday": "vacation", "trip": "vacation", "getaway": "vacation",
    "place": "location", "spot": "location", "destination": "location",
    "metropolitan": "city", "metropolis": "city",
    "globe": "world", "globally": "world", "global": "world",

    # ── science ──
    "geological": "geology", "meteorological": "meteorology",
    "biological": "biology", "astrophysics": "astronomy",

    # ── misc ──
    "brand": "company", "manufacturer": "company", "maker": "company",
    "category": "genre", "style": "genre",
    "tabletop": "board",
    "cinema": "movie",
    "reside": "live", "residing": "live", "living": "live",

    # ── history ──
    "wwii": "ww2", "ww-ii": "ww2",
    "wwi": "ww1", "ww-i": "ww1",
    "invented": "invent", "inventor": "invent",
    "discovered": "discover", "discovery": "discover", "discoverer": "discover",
    "created": "create", "creator": "create", "creation": "create",
    "founded": "found", "founder": "found", "founding": "found",
    "developed": "develop", "developer": "develop",
    "wrote": "write", "written": "write", "writer": "write", "author": "write",
    "penned": "write",
    "assassinated": "assassinate", "assassination": "assassinate",
    "killed": "kill", "shot": "shoot",
    "commissioned": "commission", "ordered": "order", "built": "build",
    "signed": "sign", "signing": "sign", "adopted": "adopt",
    "collapsed": "collapse", "fell": "fall", "fallen": "fall",
    "concluded": "end", "conclusion": "end", "ended": "end",
    "declared": "declare",
    "credited": "credit",
    "confirmed": "confirm",

    # ── abbreviation expansion ──
    "wwii": "ww2", "wwi": "ww1",
    "www": "world wide web",
    "jfk": "kennedy",
    "dna": "dna",
    "ai": "artificial intelligence",
    "css": "css", "html": "html", "sql": "sql",
    "http": "http", "https": "https",
    "lcd": "lcd", "oled": "oled",
    "cc": "cc", "bcc": "bcc",
    "cpu": "cpu", "gpu": "gpu", "ram": "ram",
    "api": "api", "ml": "ml", "ui": "ui", "db": "db",
    "cpr": "cpr", "url": "url",
}


# ── Lemmatization ────────────────────────────────────────────────────────────

def _lemmatize(token: str) -> str:
    """Crude lemmatization: strip common suffixes to merge inflected forms."""
    if len(token) < 4:
        return token
    # -ing → base (but not "ring", "king", etc.)
    if token.endswith("ing") and len(token) > 5:
        base = token[:-3]
        if base.endswith(base[-1]) and base[-1] not in "aeiou":
            base = base[:-1]  # "running" → "run"
        return base
    # -tion/-sion → base (normalize to the root)
    if token.endswith("tion") and len(token) > 6:
        return token[:-4]
    if token.endswith("sion") and len(token) > 6:
        return token[:-4]
    # -ies → -y
    if token.endswith("ies") and len(token) > 4:
        return token[:-3] + "y"
    # -sses, -xes, -ches, -shes → drop -es
    if token.endswith(("sses", "xes", "ches", "shes")):
        return token[:-2]
    # -es → drop -es (if not too short)
    if token.endswith("es") and len(token) > 5 and not token.endswith("ses"):
        return token[:-2]
    # trailing -s (but not -ss, -us)
    if token.endswith("s") and not token.endswith(("ss", "us", "is")):
        return token[:-1]
    # -ly → drop (adverbs)
    if token.endswith("ly") and len(token) > 5:
        return token[:-2]
    # -ed → drop
    if token.endswith("ed") and len(token) > 5:
        base = token[:-2]
        if base.endswith(base[-1]) and base[-1] not in "aeiou":
            base = base[:-1]  # "stopped" → "stop"
        return base
    return token


# ── Main pipeline ────────────────────────────────────────────────────────────

_WORD_RE = re.compile(r"[a-z][a-z0-9+#.-]*")


def _normalize(raw: str, original: str) -> str:
    """Deterministic rule-based normalization. No LLM needed.

    raw = original (passthrough mode), original = original query.
    """
    q = original.lower()

    # Remove filler phrases (longer matches first)
    for phrase in _FILLER_PHRASES:
        q = q.replace(phrase, " ")

    # Tokenize: extract word-like tokens
    tokens = _WORD_RE.findall(q)

    # Process each token: stopword removal → lemmatize → synonym → dedup
    out: list[str] = []
    seen: set[str] = set()
    for t in tokens:
        if t in _STOPWORDS:
            continue
        if len(t) < 2:
            continue
        # Lemmatize first, then look up synonyms
        t = _lemmatize(t)
        t = _SYNONYMS.get(t, t)
        # Re-check after canonicalization
        if t in _STOPWORDS:
            continue
        if t in seen:
            continue
        seen.add(t)
        out.append(t)

    # Sort alphabetically for determinism
    out.sort()
    return " ".join(out) if out else original.lower()


CONFIG = {
    "name": "v15_rules_plus_finetune",
    "description": "Deterministic Python rules (no LLM) + v13b fine-tuned mpnet embedder",
    "enabled": True,
    "passthrough": True,
    "embedder_model_path": str(_EMBEDDER),
    # Dummies for harness compatibility (passthrough=True means no model loaded)
    "loader": {},
    "inference": {},
    "system_prompt": "",
    "few_shots": [],
    "postprocess_fn": _normalize,
}
