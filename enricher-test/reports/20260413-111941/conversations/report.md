# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v2_regex_gate | 60 | 180 | 85.0% | 95.0% | 0.0641 | 0.1996 | 100.0% | 87.6 | 223.2 |
| v3_improved_fewshots | 60 | 180 | 83.9% | 95.0% | 0.0627 | 0.2000 | 100.0% | 96.6 | 253.1 |

## v2_regex_gate

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 30 | 70.0% | 90.0% | 0.1248 | 0.2427 | — |
| multi_reference | 30 | 76.7% | 86.7% | 0.0868 | 0.2054 | — |
| passthrough | 30 | 100.0% | 100.0% | 0.0191 | 0.0912 | 100.0% |
| pronoun_resolution | 45 | 95.6% | 97.8% | 0.0222 | 0.1146 | — |
| topic_continuation | 45 | 80.0% | 97.8% | 0.0802 | 0.1807 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `frontend_vs_backend` | multi_reference | Which pays more? | Does frontend or backend development pay more? | Which programming language is more popular? | 0.3928 |
| 2 | `carbon_capture` | deep_chain | Is it effective enough to matter? | Is carbon capture effective enough to significantly reduce atmospheric CO2? | Is it effective enough to matter? | 0.3553 |
| 3 | `homo_sapiens_neanderthals` | deep_chain | Did we interbreed with them? | Did Homo sapiens interbreed with Neanderthals? | Did we interbreed with them? | 0.2640 |
| 4 | `vaccines` | pronoun_resolution | Who developed the first one? | Who developed the first vaccine? | Who developed the first one? | 0.2343 |
| 5 | `event_loop_internals` | deep_chain | How does it schedule tasks? | How does the event loop schedule async tasks? | How does it schedule tasks? | 0.2166 |
| 6 | `newton_vs_einstein` | multi_reference | How did one build on the other? | How did Einstein's theory of relativity build on Newton's classical mechanics? | What was the relationship between Newton and Einstein's theories of physics? | 0.2082 |
| 7 | `greek_mythology` | topic_continuation | How about Athena? | Who is Athena in Greek mythology? | What about Athena? | 0.2020 |
| 8 | `aerobic_vs_anaerobic` | multi_reference | How long should I do each? | How long should aerobic vs anaerobic exercise sessions be? | How long should I do each exercise? | 0.2020 |
| 9 | `python_vs_java` | multi_reference | Which one should I learn first? | Should I learn Python or Java first? | Which language should I learn first? | 0.2002 |
| 10 | `art_movements` | topic_continuation | What about Cubism? | What is the Cubism art movement? | What about Cubism? | 0.1996 |
| 11 | `homo_sapiens_neanderthals` | deep_chain | Are we smarter than they were? | Were Homo sapiens more intelligent than Neanderthals? | Are we more intelligent than they were? | 0.1996 |
| 12 | `docker_compose` | deep_chain | How does it differ from Docker alone? | How does Docker Compose differ from using Docker alone? | What is the difference between Docker and the containerization of an application? | 0.1915 |
| 13 | `antibiotic_resistance` | deep_chain | Is resistance a big global problem? | Is antibiotic resistance a major global health problem? | Is resistance a big global problem? | 0.1913 |
| 14 | `aerobic_vs_anaerobic` | multi_reference | Which builds more muscle? | Does aerobic or anaerobic exercise build more muscle? | Which builds more muscle? | 0.1860 |
| 15 | `programming_languages` | topic_continuation | And Go? | What is Go programming language good for? | What is Go good for? | 0.1808 |
| 16 | `nutrition_protein` | topic_continuation | What about carbohydrates? | Why are carbohydrates important for the body? | What are carbohydrates? | 0.1805 |
| 17 | `economics_inflation` | topic_continuation | And interest rates? | How do interest rates relate to inflation? | What are the main factors that contribute to inflation? | 0.1786 |
| 18 | `photosynthesis` | pronoun_resolution | What does it produce? | What does photosynthesis produce? | What does it produce? | 0.1780 |
| 19 | `blockchain_crypto` | topic_continuation | How does mining work? | How does cryptocurrency mining work on a blockchain? | How does mining work? | 0.1648 |
| 20 | `meditation_yoga` | topic_continuation | What techniques work best for beginners? | What meditation techniques work best for beginners? | What techniques work best for beginners? | 0.1631 |

## v3_improved_fewshots

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 30 | 76.7% | 93.3% | 0.1134 | 0.2184 | — |
| multi_reference | 30 | 66.7% | 83.3% | 0.0933 | 0.2516 | — |
| passthrough | 30 | 100.0% | 100.0% | 0.0191 | 0.0912 | 100.0% |
| pronoun_resolution | 45 | 95.6% | 100.0% | 0.0117 | 0.0819 | — |
| topic_continuation | 45 | 77.8% | 95.6% | 0.0887 | 0.1958 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `ml_vs_deep_learning` | multi_reference | When should I use one over the other? | When should I use machine learning vs deep learning? | When should I use one over the other? | 0.3140 |
| 2 | `sql_databases` | topic_continuation | What about NoSQL? | What is NoSQL and how does it differ from SQL? | What about SQL? | 0.2713 |
| 3 | `greek_mythology` | topic_continuation | How about Athena? | Who is Athena in Greek mythology? | How about Athena? | 0.2666 |
| 4 | `homo_sapiens_neanderthals` | deep_chain | Did we interbreed with them? | Did Homo sapiens interbreed with Neanderthals? | Did we interbreed with them? | 0.2640 |
| 5 | `aerobic_vs_anaerobic` | multi_reference | How long should I do each? | How long should aerobic vs anaerobic exercise sessions be? | How long should I do each? | 0.2570 |
| 6 | `frontend_vs_backend` | multi_reference | Which is easier to learn first? | Is frontend or backend development easier to learn first? | Which is easier to learn first? | 0.2449 |
| 7 | `homo_sapiens_neanderthals` | deep_chain | Are we smarter than they were? | Were Homo sapiens more intelligent than Neanderthals? | Are we smarter than they were? | 0.2405 |
| 8 | `ml_vs_deep_learning` | multi_reference | Which is harder to implement? | Is machine learning or deep learning harder to implement? | Which is harder to implement? | 0.2121 |
| 9 | `python_vs_java` | multi_reference | Which one should I learn first? | Should I learn Python or Java first? | Which one should I learn first? | 0.2082 |
| 10 | `art_movements` | topic_continuation | What about Cubism? | What is the Cubism art movement? | What about Cubism? | 0.1996 |
| 11 | `newton_vs_einstein` | multi_reference | How did one build on the other? | How did Einstein's theory of relativity build on Newton's classical mechanics? | How did one build on Newton and Einstein's theories? | 0.1951 |
| 12 | `antibiotic_resistance` | deep_chain | Is resistance a big global problem? | Is antibiotic resistance a major global health problem? | Is resistance a big global problem? | 0.1913 |
| 13 | `sql_vs_nosql` | multi_reference | Which is better for scalability? | Are SQL or NoSQL databases better for scalability? | Which is better for scalability? | 0.1870 |
| 14 | `aerobic_vs_anaerobic` | multi_reference | Which builds more muscle? | Does aerobic or anaerobic exercise build more muscle? | Which builds more muscle? | 0.1860 |
| 15 | `programming_languages` | topic_continuation | And Go? | What is Go programming language good for? | What is Go good for? | 0.1808 |
| 16 | `greek_mythology` | topic_continuation | What about Poseidon? | Who is Poseidon in Greek mythology? | What about Poseidon? | 0.1782 |
| 17 | `photosynthesis` | pronoun_resolution | What does it produce? | What does photosynthesis produce? | What does it produce? | 0.1780 |
| 18 | `carbon_capture` | deep_chain | How does it remove CO2 from the air? | How does carbon capture technology remove CO2 from the atmosphere? | How does CO₂ remove itself from the air? | 0.1759 |
| 19 | `nutrition_protein` | topic_continuation | And vitamins? | Why are vitamins important for the body? | What are vitamins? | 0.1727 |
| 20 | `nutrition_protein` | topic_continuation | What about carbohydrates? | Why are carbohydrates important for the body? | What about carbohydrates? | 0.1669 |
