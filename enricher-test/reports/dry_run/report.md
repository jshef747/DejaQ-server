# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| passthrough_dry_run | 60 | 180 | 46.1% | 61.1% | 0.1607 | 0.3304 | 100.0% | 0.0 | 0.0 |

## passthrough_dry_run

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 30 | 60.0% | 70.0% | 0.1642 | 0.3624 | — |
| multi_reference | 30 | 6.7% | 36.7% | 0.2353 | 0.3354 | — |
| passthrough | 30 | 100.0% | 100.0% | 0.0191 | 0.0912 | 100.0% |
| pronoun_resolution | 45 | 20.0% | 35.6% | 0.2149 | 0.3343 | — |
| topic_continuation | 45 | 53.3% | 71.1% | 0.1489 | 0.2723 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `newton_vs_einstein` | multi_reference | How did one build on the other? | How did Einstein's theory of relativity build on Newton's classical mechanics? | How did one build on the other? | 0.4796 |
| 2 | `programming_languages` | topic_continuation | And Go? | What is Go programming language good for? | And Go? | 0.4331 |
| 3 | `backpropagation` | deep_chain | Why is it important? | Why is backpropagation important in neural network training? | Why is it important? | 0.4217 |
| 4 | `smart_contracts` | deep_chain | How do they work? | How do smart contracts work on a blockchain? | How do they work? | 0.3683 |
| 5 | `carbon_capture` | deep_chain | Is it effective enough to matter? | Is carbon capture effective enough to significantly reduce atmospheric CO2? | Is it effective enough to matter? | 0.3553 |
| 6 | `machine_learning_intro` | pronoun_resolution | How does it work? | How does machine learning work? | How does it work? | 0.3406 |
| 7 | `react_vs_vue` | multi_reference | Which is more popular? | Is React or Vue more popular? | Which is more popular? | 0.3405 |
| 8 | `photosynthesis` | pronoun_resolution | Where does it take place? | Where does photosynthesis take place in a plant? | Where does it take place? | 0.3385 |
| 9 | `python_features` | pronoun_resolution | Tell me more about its features | What are the main features of Python? | Tell me more about its features | 0.3353 |
| 10 | `eiffel_tower` | pronoun_resolution | How tall is it? | How tall is the Eiffel Tower? | How tall is it? | 0.3301 |
| 11 | `tcp_vs_udp` | multi_reference | When should I use each? | When should I use TCP vs UDP? | When should I use each? | 0.3290 |
| 12 | `ml_vs_deep_learning` | multi_reference | When should I use one over the other? | When should I use machine learning vs deep learning? | When should I use one over the other? | 0.3140 |
| 13 | `eiffel_tower` | pronoun_resolution | Who designed it? | Who designed the Eiffel Tower? | Who designed it? | 0.3091 |
| 14 | `frontend_vs_backend` | multi_reference | How do they communicate? | How do frontend and backend communicate with each other? | How do they communicate? | 0.3088 |
| 15 | `react_vs_vue` | multi_reference | Which is easier to learn? | Is React or Vue easier to learn? | Which is easier to learn? | 0.3075 |
| 16 | `sql_vs_nosql` | multi_reference | When should I use each? | When should I use SQL vs NoSQL databases? | When should I use each? | 0.3073 |
| 17 | `greek_mythology` | topic_continuation | And Apollo? | Who is Apollo in Greek mythology? | And Apollo? | 0.3042 |
| 18 | `antibiotics` | pronoun_resolution | How do they work? | How do antibiotics work? | How do they work? | 0.2976 |
| 19 | `machine_learning_intro` | pronoun_resolution | What are its applications? | What are the applications of machine learning? | What are its applications? | 0.2973 |
| 20 | `react_vs_vue` | multi_reference | How do they handle state? | How do React and Vue handle state management? | How do they handle state? | 0.2896 |
