# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v4_gate_fix | 51 | 153 | 81.7% | 90.2% | 0.0774 | 0.2565 | 100.0% | 452.4 | 2127.8 |
| v5_qwen_1_5b | 51 | 153 | 86.3% | 93.5% | 0.0699 | 0.2097 | 100.0% | 227.4 | 674.4 |

## v4_gate_fix

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 27 | 85.2% | 88.9% | 0.0756 | 0.2387 | — |
| multi_reference | 24 | 70.8% | 83.3% | 0.1228 | 0.2562 | — |
| passthrough | 27 | 96.3% | 100.0% | 0.0418 | 0.1142 | 100.0% |
| pronoun_resolution | 45 | 91.1% | 93.3% | 0.0465 | 0.2531 | — |
| topic_continuation | 30 | 60.0% | 83.3% | 0.1212 | 0.2597 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `climate_feedback_deep` | deep_chain | Which feedbacks are most dangerous? | Which climate feedback loops pose the greatest danger for accelerating warming? | Which feedbacks are most dangerous? | 0.3332 |
| 2 | `geology_rock_types` | topic_continuation | And metamorphic rocks? | What is a metamorphic rock and how does it form? | What are the main types of igneous rocks? | 0.3329 |
| 3 | `earth_vs_mars_atmosphere` | multi_reference | Why is one so much thinner? | Why is Mars's atmosphere so much thinner than Earth's? | Why is one so much thinner? | 0.3112 |
| 4 | `tectonic_plates` | pronoun_resolution | How many are there? | How many tectonic plates are there? | How many are there? | 0.3022 |
| 5 | `entropy_thermodynamics` | pronoun_resolution | What does it mean for the universe? | What does entropy mean for the long-term fate of the universe? | What does it mean for the universe? | 0.2818 |
| 6 | `stem_cells` | pronoun_resolution | What types are there? | What types of stem cells are there? | What types are there? | 0.2763 |
| 7 | `wave_types` | topic_continuation | Which type is sound? | Is sound a transverse or longitudinal wave? | Which type is sound? | 0.2713 |
| 8 | `proton_neutron` | multi_reference | Which can be split further? | Can protons or neutrons be split into smaller particles? | Which can be split further? | 0.2638 |
| 9 | `vaccine_immune_response_deep` | deep_chain | How long do memory cells last? | How long do memory T and B cells persist after vaccination? | How long do memory cells last? | 0.2516 |
| 10 | `acids_bases` | topic_continuation | What about bases? | What is a base in chemistry? | What about bases? | 0.2454 |
| 11 | `earth_vs_mars_atmosphere` | multi_reference | Which is colder? | Is Earth or Mars colder on average? | Which planet has a colder atmosphere? | 0.2129 |
| 12 | `evolution_natural_selection` | topic_continuation | How does mutation fit in? | How does mutation contribute to evolutionary processes? | How does mutation fit in? | 0.2113 |
| 13 | `big_bang_inflation_deep` | deep_chain | What evidence supports inflation? | What evidence supports the theory of cosmic inflation after the Big Bang? | What evidence supports inflation? | 0.2086 |
| 14 | `plant_animal_cell` | multi_reference | Which can make their own food? | Can plant or animal cells make their own food? | Which of the two can make their own food? | 0.2045 |
| 15 | `nuclear_reactions` | topic_continuation | Which produces more energy? | Does nuclear fission or fusion produce more energy? | Which produces more energy? | 0.2025 |
| 16 | `standalone_higgs_boson` | passthrough | Explain the God particle. | What is the Higgs boson and why is it called the God particle? | Explain the God particle. | 0.1971 |
| 17 | `acids_bases` | topic_continuation | What is a buffer? | What is a chemical buffer and how does it work? | What is a buffer? | 0.1801 |
| 18 | `chemical_bonding` | topic_continuation | And metallic bonds? | What is a metallic bond in chemistry? | What are the differences between ionic and metallic bonds? | 0.1769 |
| 19 | `geology_rock_types` | topic_continuation | What about sedimentary rocks? | What is a sedimentary rock and how does it form? | What about sedimentary rocks? | 0.1731 |
| 20 | `rna_vs_dna` | multi_reference | Which came first in evolution? | Which came first in evolution — DNA or RNA? | Which came first in evolution? | 0.1650 |

## v5_qwen_1_5b

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 27 | 88.9% | 88.9% | 0.0806 | 0.2387 | — |
| multi_reference | 24 | 79.2% | 95.8% | 0.0977 | 0.1652 | — |
| passthrough | 27 | 96.3% | 100.0% | 0.0418 | 0.1142 | 100.0% |
| pronoun_resolution | 45 | 93.3% | 93.3% | 0.0383 | 0.2473 | — |
| topic_continuation | 30 | 70.0% | 90.0% | 0.1105 | 0.2073 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `climate_feedback_deep` | deep_chain | Which feedbacks are most dangerous? | Which climate feedback loops pose the greatest danger for accelerating warming? | Which feedbacks are most dangerous? | 0.3332 |
| 2 | `tectonic_plates` | pronoun_resolution | How many are there? | How many tectonic plates are there? | How many are there? | 0.3022 |
| 3 | `stem_cells` | pronoun_resolution | What types are there? | What types of stem cells are there? | What types are there? | 0.2763 |
| 4 | `entropy_thermodynamics` | pronoun_resolution | What does it mean for the universe? | What does entropy mean for the long-term fate of the universe? | What does the second law of thermodynamics imply about the universe? | 0.2719 |
| 5 | `wave_types` | topic_continuation | Which type is sound? | Is sound a transverse or longitudinal wave? | Which type is sound? | 0.2713 |
| 6 | `vaccine_immune_response_deep` | deep_chain | How long do memory cells last? | How long do memory T and B cells persist after vaccination? | How long do memory cells last? | 0.2516 |
| 7 | `plant_animal_cell` | multi_reference | Which is larger? | Are plant or animal cells generally larger? | Which is larger, the central vacuole in plant cells or the centrioles in animal cells? | 0.2512 |
| 8 | `evolution_natural_selection` | topic_continuation | How does mutation fit in? | How does mutation contribute to evolutionary processes? | How does mutation fit in? | 0.2113 |
| 9 | `big_bang_inflation_deep` | deep_chain | What evidence supports inflation? | What evidence supports the theory of cosmic inflation after the Big Bang? | What evidence supports inflation? | 0.2086 |
| 10 | `nuclear_reactions` | topic_continuation | Which produces more energy? | Does nuclear fission or fusion produce more energy? | Which produces more energy? | 0.2025 |
| 11 | `standalone_higgs_boson` | passthrough | Explain the God particle. | What is the Higgs boson and why is it called the God particle? | Explain the God particle. | 0.1971 |
| 12 | `geology_rock_types` | topic_continuation | Can one type turn into another? | Can one type of rock turn into another type of rock? | Can an intrusive igneous rock turn into an extrusive igneous rock? | 0.1942 |
| 13 | `acids_bases` | topic_continuation | What about bases? | What is a base in chemistry? | What are the properties of bases? | 0.1941 |
| 14 | `geology_rock_types` | topic_continuation | What about sedimentary rocks? | What is a sedimentary rock and how does it form? | What are the main types of sedimentary rocks? | 0.1883 |
| 15 | `acids_bases` | topic_continuation | What is a buffer? | What is a chemical buffer and how does it work? | What is a buffer? | 0.1801 |
| 16 | `plant_animal_cell` | multi_reference | Which can make their own food? | Can plant or animal cells make their own food? | Which can make their own food? | 0.1653 |
| 17 | `rna_vs_dna` | multi_reference | Which came first in evolution? | Which came first in evolution — DNA or RNA? | Which came first in evolution? | 0.1650 |
| 18 | `electromagnetic_spectrum` | topic_continuation | And infrared? | What is infrared radiation in the electromagnetic spectrum? | What is infrared? | 0.1640 |
| 19 | `virus_vs_bacteria` | multi_reference | Which cause more diseases? | Do viruses or bacteria cause more human diseases? | Which cause more diseases? | 0.1594 |
| 20 | `acids_bases` | topic_continuation | And pH? | What is pH and how does it measure acidity? | What is pH and how is it related to acids? | 0.1587 |
