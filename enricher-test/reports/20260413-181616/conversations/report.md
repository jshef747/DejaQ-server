# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v4_gate_fix | 60 | 180 | 85.6% | 95.6% | 0.0628 | 0.1996 | 100.0% | 748.5 | 3477.9 |
| v5_qwen_1_5b | 60 | 180 | 91.7% | 98.9% | 0.0498 | 0.1648 | 100.0% | 323.1 | 856.6 |

## v4_gate_fix

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 30 | 70.0% | 90.0% | 0.1248 | 0.2427 | — |
| multi_reference | 30 | 76.7% | 86.7% | 0.0868 | 0.2054 | — |
| passthrough | 30 | 100.0% | 100.0% | 0.0191 | 0.0912 | 100.0% |
| pronoun_resolution | 45 | 97.8% | 100.0% | 0.0170 | 0.0957 | — |
| topic_continuation | 45 | 80.0% | 97.8% | 0.0802 | 0.1807 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `frontend_vs_backend` | multi_reference | Which pays more? | Does frontend or backend development pay more? | Which programming language is more popular? | 0.3928 |
| 2 | `carbon_capture` | deep_chain | Is it effective enough to matter? | Is carbon capture effective enough to significantly reduce atmospheric CO2? | Is it effective enough to matter? | 0.3553 |
| 3 | `homo_sapiens_neanderthals` | deep_chain | Did we interbreed with them? | Did Homo sapiens interbreed with Neanderthals? | Did we interbreed with them? | 0.2640 |
| 4 | `event_loop_internals` | deep_chain | How does it schedule tasks? | How does the event loop schedule async tasks? | How does it schedule tasks? | 0.2166 |
| 5 | `newton_vs_einstein` | multi_reference | How did one build on the other? | How did Einstein's theory of relativity build on Newton's classical mechanics? | What was the relationship between Newton and Einstein's theories of physics? | 0.2082 |
| 6 | `greek_mythology` | topic_continuation | How about Athena? | Who is Athena in Greek mythology? | What about Athena? | 0.2020 |
| 7 | `aerobic_vs_anaerobic` | multi_reference | How long should I do each? | How long should aerobic vs anaerobic exercise sessions be? | How long should I do each exercise? | 0.2020 |
| 8 | `python_vs_java` | multi_reference | Which one should I learn first? | Should I learn Python or Java first? | Which language should I learn first? | 0.2002 |
| 9 | `art_movements` | topic_continuation | What about Cubism? | What is the Cubism art movement? | What about Cubism? | 0.1996 |
| 10 | `homo_sapiens_neanderthals` | deep_chain | Are we smarter than they were? | Were Homo sapiens more intelligent than Neanderthals? | Are we more intelligent than they were? | 0.1996 |
| 11 | `docker_compose` | deep_chain | How does it differ from Docker alone? | How does Docker Compose differ from using Docker alone? | What is the difference between Docker and the containerization of an application? | 0.1915 |
| 12 | `antibiotic_resistance` | deep_chain | Is resistance a big global problem? | Is antibiotic resistance a major global health problem? | Is resistance a big global problem? | 0.1913 |
| 13 | `aerobic_vs_anaerobic` | multi_reference | Which builds more muscle? | Does aerobic or anaerobic exercise build more muscle? | Which builds more muscle? | 0.1860 |
| 14 | `programming_languages` | topic_continuation | And Go? | What is Go programming language good for? | What is Go good for? | 0.1808 |
| 15 | `nutrition_protein` | topic_continuation | What about carbohydrates? | Why are carbohydrates important for the body? | What are carbohydrates? | 0.1805 |
| 16 | `economics_inflation` | topic_continuation | And interest rates? | How do interest rates relate to inflation? | What are the main factors that contribute to inflation? | 0.1786 |
| 17 | `photosynthesis` | pronoun_resolution | What does it produce? | What does photosynthesis produce? | What does it produce? | 0.1780 |
| 18 | `blockchain_crypto` | topic_continuation | How does mining work? | How does cryptocurrency mining work on a blockchain? | How does mining work? | 0.1648 |
| 19 | `meditation_yoga` | topic_continuation | What techniques work best for beginners? | What meditation techniques work best for beginners? | What techniques work best for beginners? | 0.1631 |
| 20 | `nutrition_protein` | topic_continuation | And vitamins? | Why are vitamins important for the body? | What are the essential vitamins for the body? | 0.1600 |

## v5_qwen_1_5b

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 30 | 83.3% | 100.0% | 0.1015 | 0.1783 | — |
| multi_reference | 30 | 86.7% | 96.7% | 0.0612 | 0.1737 | — |
| passthrough | 30 | 100.0% | 100.0% | 0.0191 | 0.0912 | 100.0% |
| pronoun_resolution | 45 | 100.0% | 100.0% | 0.0095 | 0.0461 | — |
| topic_continuation | 45 | 86.7% | 97.8% | 0.0686 | 0.1759 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `greek_mythology` | topic_continuation | And Apollo? | Who is Apollo in Greek mythology? | And Apollo? | 0.3042 |
| 2 | `aerobic_vs_anaerobic` | multi_reference | How long should I do each? | How long should aerobic vs anaerobic exercise sessions be? | How long should I engage in each type of exercise? | 0.2035 |
| 3 | `antibiotic_resistance` | deep_chain | Is resistance a big global problem? | Is antibiotic resistance a major global health problem? | Is resistance a big global problem? | 0.1913 |
| 4 | `carbon_capture` | deep_chain | Is it effective enough to matter? | Is carbon capture effective enough to significantly reduce atmospheric CO2? | Is the increase in CO₂ concentration effective enough to cause significant climate change? | 0.1865 |
| 5 | `aerobic_vs_anaerobic` | multi_reference | Which builds more muscle? | Does aerobic or anaerobic exercise build more muscle? | Which builds more muscle? | 0.1860 |
| 6 | `programming_languages` | topic_continuation | And Go? | What is Go programming language good for? | What is Go good for? | 0.1808 |
| 7 | `economics_inflation` | topic_continuation | And interest rates? | How do interest rates relate to inflation? | What are interest rates? | 0.1787 |
| 8 | `homo_sapiens_neanderthals` | deep_chain | Are we smarter than they were? | Were Homo sapiens more intelligent than Neanderthals? | Are modern humans smarter than our ancestors? | 0.1682 |
| 9 | `carbon_capture` | deep_chain | How does it remove CO2 from the air? | How does carbon capture technology remove CO2 from the atmosphere? | How does the ocean remove CO2 from the air? | 0.1651 |
| 10 | `blockchain_crypto` | topic_continuation | How does mining work? | How does cryptocurrency mining work on a blockchain? | How does mining work? | 0.1648 |
| 11 | `meditation_yoga` | topic_continuation | What techniques work best for beginners? | What meditation techniques work best for beginners? | What techniques work best for beginners? | 0.1631 |
| 12 | `newton_vs_einstein` | multi_reference | Who had the bigger impact on physics? | Who had a bigger impact on physics — Newton or Einstein? | Who had the bigger impact on physics? | 0.1587 |
| 13 | `democratic_vs_republican` | multi_reference | Which supports more social programs? | Do Democrats or Republicans support more social programs? | Which supports more social programs? | 0.1555 |
| 14 | `blockchain_crypto` | topic_continuation | And NFTs? | What are NFTs and how do they use blockchain? | What are NFTs? | 0.1555 |
| 15 | `python_negative_indexing` | deep_chain | What do negative indices do? | How do negative indices work in Python list slicing? | What do negative indices do? | 0.1501 |
| 16 | `flask_jwt_chain` | deep_chain | What does the token contain? | What does a JSON Web Token (JWT) contain? | What does the token contain? | 0.1492 |
| 17 | `aerobic_vs_anaerobic` | multi_reference | Which burns more fat? | Does aerobic or anaerobic exercise burn more fat? | Which type of exercise burns more fat? | 0.1436 |
| 18 | `standalone_git` | passthrough | What is Git used for? | What is Git version control used for? | What is Git used for? | 0.1407 |
| 19 | `homo_sapiens_neanderthals` | deep_chain | Did we interbreed with them? | Did Homo sapiens interbreed with Neanderthals? | Did modern humans interbreed with other hominid species? | 0.1381 |
| 20 | `smart_contracts` | deep_chain | How do they work? | How do smart contracts work on a blockchain? | How do the blockchain and the distributed ledger work? | 0.1374 |
