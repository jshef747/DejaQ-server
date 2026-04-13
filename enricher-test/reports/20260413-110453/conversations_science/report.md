# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline_qwen_0_5b | 51 | 153 | 82.4% | 92.8% | 0.0736 | 0.2225 | 44.4% | 129.6 | 269.4 |
| v2_regex_gate | 51 | 153 | 81.0% | 90.2% | 0.0781 | 0.2565 | 100.0% | 84.9 | 227.1 |

## baseline_qwen_0_5b

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 27 | 88.9% | 96.3% | 0.0676 | 0.1738 | — |
| multi_reference | 24 | 75.0% | 83.3% | 0.1075 | 0.2562 | — |
| passthrough | 27 | 85.2% | 96.3% | 0.0660 | 0.1866 | 44.4% |
| pronoun_resolution | 45 | 95.6% | 97.8% | 0.0342 | 0.1330 | — |
| topic_continuation | 30 | 60.0% | 86.7% | 0.1177 | 0.2570 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `climate_feedback_deep` | deep_chain | Which feedbacks are most dangerous? | Which climate feedback loops pose the greatest danger for accelerating warming? | Which feedbacks are most dangerous? | 0.3332 |
| 2 | `geology_rock_types` | topic_continuation | And metamorphic rocks? | What is a metamorphic rock and how does it form? | What are the main types of igneous rocks? | 0.3329 |
| 3 | `earth_vs_mars_atmosphere` | multi_reference | Why is one so much thinner? | Why is Mars's atmosphere so much thinner than Earth's? | Why is one so much thinner? | 0.3112 |
| 4 | `entropy_thermodynamics` | pronoun_resolution | What does it mean for the universe? | What does entropy mean for the long-term fate of the universe? | What does it mean for the universe? | 0.2818 |
| 5 | `wave_types` | topic_continuation | Which type is sound? | Is sound a transverse or longitudinal wave? | What type of sound is sound? | 0.2665 |
| 6 | `proton_neutron` | multi_reference | Which can be split further? | Can protons or neutrons be split into smaller particles? | Which can be split further? | 0.2638 |
| 7 | `acids_bases` | topic_continuation | What about bases? | What is a base in chemistry? | What about bases? | 0.2454 |
| 8 | `standalone_atp` | passthrough | How does ATP store energy? | How does ATP store energy in cells? | What is ATP used for? | 0.2369 |
| 9 | `earth_vs_mars_atmosphere` | multi_reference | Which is colder? | Is Earth or Mars colder on average? | Which planet has a colder atmosphere? | 0.2129 |
| 10 | `plant_animal_cell` | multi_reference | Which can make their own food? | Can plant or animal cells make their own food? | Which of the two can make their own food? | 0.2045 |
| 11 | `nuclear_reactions` | topic_continuation | Which produces more energy? | Does nuclear fission or fusion produce more energy? | Which nuclear power plant produces more energy? | 0.2014 |
| 12 | `standalone_half_life` | passthrough | How is half-life measured? | How is the half-life of a radioactive element measured? | What is the half-life of a substance? | 0.1912 |
| 13 | `big_bang_inflation_deep` | deep_chain | What evidence supports inflation? | What evidence supports the theory of cosmic inflation after the Big Bang? | What evidence supports the Big Bang theory? | 0.1804 |
| 14 | `acids_bases` | topic_continuation | What is a buffer? | What is a chemical buffer and how does it work? | What is a buffer? | 0.1801 |
| 15 | `chemical_bonding` | topic_continuation | And metallic bonds? | What is a metallic bond in chemistry? | What are the differences between ionic and metallic bonds? | 0.1769 |
| 16 | `standalone_plate_tectonics` | passthrough | How does plate tectonics work? | How does plate tectonics theory work? | What is plate tectonics? | 0.1759 |
| 17 | `evolution_natural_selection` | topic_continuation | How does mutation fit in? | How does mutation contribute to evolutionary processes? | What is mutation in the context of natural selection? | 0.1739 |
| 18 | `geology_rock_types` | topic_continuation | What about sedimentary rocks? | What is a sedimentary rock and how does it form? | What about sedimentary rocks? | 0.1731 |
| 19 | `nervous_system_types` | topic_continuation | How do they interact? | How do the central and peripheral nervous systems interact? | How do the brain and spinal cord interact? | 0.1646 |
| 20 | `electromagnetic_spectrum` | topic_continuation | And infrared? | What is infrared radiation in the electromagnetic spectrum? | What is infrared? | 0.1640 |

## v2_regex_gate

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 27 | 85.2% | 88.9% | 0.0756 | 0.2387 | — |
| multi_reference | 24 | 70.8% | 83.3% | 0.1228 | 0.2562 | — |
| passthrough | 27 | 96.3% | 100.0% | 0.0418 | 0.1142 | 100.0% |
| pronoun_resolution | 45 | 91.1% | 93.3% | 0.0465 | 0.2531 | — |
| topic_continuation | 30 | 56.7% | 83.3% | 0.1246 | 0.2597 | — |

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
