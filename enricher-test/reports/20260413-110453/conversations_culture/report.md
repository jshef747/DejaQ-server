# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline_qwen_0_5b | 49 | 147 | 85.0% | 91.2% | 0.0723 | 0.2413 | 79.2% | 131.5 | 271.8 |
| v2_regex_gate | 49 | 147 | 78.9% | 88.4% | 0.0810 | 0.2796 | 100.0% | 90.1 | 270.7 |

## baseline_qwen_0_5b

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 24 | 79.2% | 83.3% | 0.0970 | 0.3270 | — |
| multi_reference | 24 | 62.5% | 79.2% | 0.1390 | 0.2701 | — |
| passthrough | 24 | 100.0% | 100.0% | 0.0329 | 0.1064 | 79.2% |
| pronoun_resolution | 45 | 97.8% | 100.0% | 0.0332 | 0.1268 | — |
| topic_continuation | 30 | 76.7% | 86.7% | 0.0891 | 0.2439 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `cold_war_arms_race_deep` | deep_chain | What was MAD strategy? | What was the Mutually Assured Destruction (MAD) strategy during the Cold War? | What was the Strategic Arms Limitation Talks (SALT) agreement? | 0.3445 |
| 2 | `napoleon_waterloo_deep` | deep_chain | Who was Wellington? | Who was the Duke of Wellington and what was his role at Waterloo? | Who was Field Marshal Wellington? | 0.3370 |
| 3 | `democracy_vs_republic` | multi_reference | Which is more common today? | Are direct democracies or republics more common in the modern world? | Which is more common today? | 0.3127 |
| 4 | `music_genres` | topic_continuation | And rock and roll? | How did rock and roll emerge as a music genre? | What are the main differences between jazz and rock and roll? | 0.3029 |
| 5 | `literary_movements` | topic_continuation | What about Realism? | What was the Realism literary movement? | What about Realism? | 0.2769 |
| 6 | `homer_vs_virgil` | multi_reference | Which is harder to read today? | Is Homer's Iliad or Virgil's Aeneid harder to read for a modern reader? | Which epic poem is harder to read today? | 0.2747 |
| 7 | `greek_tragedy_form_deep` | deep_chain | What is hamartia? | What is hamartia in Greek tragedy? | What is a fatal flaw in Greek tragedy? | 0.2699 |
| 8 | `plato_aristotle_politics` | multi_reference | What did each think of tyranny? | What did Plato and Aristotle each think about tyranny? | What did each think of tyranny? | 0.2435 |
| 9 | `homer_vs_virgil` | multi_reference | Which is considered greater? | Is Homer's Iliad or Virgil's Aeneid considered the greater epic? | Which epic poem is considered greater? | 0.2360 |
| 10 | `enlightenment_revolution_deep` | deep_chain | Which thinker was most influential? | Which Enlightenment thinker was most influential on modern democracy? | Which thinker was most influential in the American Revolution? | 0.2176 |
| 11 | `plato_aristotle_politics` | multi_reference | Who had the more realistic vision? | Did Plato or Aristotle have a more realistic political vision? | Who had the more realistic vision of democracy? | 0.2073 |
| 12 | `literary_movements` | topic_continuation | How about Postmodernism? | What was the Postmodernism literary movement? | What about Postmodernism? | 0.2035 |
| 13 | `music_genres` | topic_continuation | How about hip-hop? | How did hip-hop music originate? | What is hip-hop? | 0.2027 |
| 14 | `architecture_styles` | topic_continuation | How does Renaissance differ? | How does Renaissance architecture differ from Gothic architecture? | What is the difference between Renaissance and medieval Europe? | 0.1980 |
| 15 | `martin_luther_king` | pronoun_resolution | How was he assassinated? | How was Martin Luther King Jr. assassinated? | What happened to Martin Luther King Jr.? | 0.1964 |
| 16 | `enlightenment_revolution_deep` | deep_chain | What did Rousseau add to these ideas? | What did Jean-Jacques Rousseau add to Enlightenment political philosophy? | What did Rousseau add to Locke's ideas? | 0.1930 |
| 17 | `east_west_philosophy` | multi_reference | Which tradition emphasizes ethics more? | Does Western or Eastern philosophy emphasize ethics more? | Which tradition emphasizes ethics more? | 0.1852 |
| 18 | `revolutions_compare` | topic_continuation | Which had the biggest impact? | Which revolution — Industrial, Agricultural, or Digital — had the biggest impact on human society? | Which country had the biggest impact on the Industrial Revolution? | 0.1799 |
| 19 | `baroque_vs_classical_music` | multi_reference | Which produced more famous composers? | Did the Baroque or Classical period produce more famous composers? | Which genre produced more famous composers? | 0.1756 |
| 20 | `literary_movements` | topic_continuation | And Modernism? | What was the Modernism literary movement? | What is Modernism? | 0.1723 |

## v2_regex_gate

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 24 | 79.2% | 91.7% | 0.0821 | 0.2142 | — |
| multi_reference | 24 | 41.7% | 70.8% | 0.1834 | 0.3253 | — |
| passthrough | 24 | 100.0% | 100.0% | 0.0177 | 0.0854 | 100.0% |
| pronoun_resolution | 45 | 88.9% | 93.3% | 0.0519 | 0.2191 | — |
| topic_continuation | 30 | 76.7% | 83.3% | 0.0923 | 0.2912 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `homer_vs_virgil` | multi_reference | Which came first? | Which was written first — Homer's Iliad or Virgil's Aeneid? | Which came first? | 0.5243 |
| 2 | `baroque_vs_classical_music` | multi_reference | Which came first? | Did Baroque or Classical music come first historically? | Which came first? | 0.3275 |
| 3 | `revolutions_compare` | topic_continuation | Which had the biggest impact? | Which revolution — Industrial, Agricultural, or Digital — had the biggest impact on human society? | Which had the biggest impact? | 0.3155 |
| 4 | `democracy_vs_republic` | multi_reference | Which is more common today? | Are direct democracies or republics more common in the modern world? | Which is more common today? | 0.3127 |
| 5 | `music_genres` | topic_continuation | And rock and roll? | How did rock and roll emerge as a music genre? | What are the main differences between jazz and rock and roll? | 0.3029 |
| 6 | `impressionism_monet` | pronoun_resolution | How did his style evolve? | How did Claude Monet's painting style evolve over his career? | How did his style evolve? | 0.2875 |
| 7 | `plato_aristotle_politics` | multi_reference | Who had the more realistic vision? | Did Plato or Aristotle have a more realistic political vision? | Who had the more realistic vision? | 0.2823 |
| 8 | `impressionism_monet` | pronoun_resolution | Where can I see his works? | Where can I see Claude Monet's paintings? | Where can I see his works? | 0.2807 |
| 9 | `literary_movements` | topic_continuation | What about Realism? | What was the Realism literary movement? | What about Realism? | 0.2769 |
| 10 | `homer_vs_virgil` | multi_reference | Which is harder to read today? | Is Homer's Iliad or Virgil's Aeneid harder to read for a modern reader? | Which epic poem is harder to read today? | 0.2747 |
| 11 | `renaissance_vs_enlightenment` | multi_reference | Which came first? | Did the Renaissance or the Enlightenment come first? | Which came first? | 0.2598 |
| 12 | `plato_aristotle_politics` | multi_reference | What did each think of tyranny? | What did Plato and Aristotle each think about tyranny? | What did each think of tyranny? | 0.2435 |
| 13 | `napoleon_waterloo_deep` | deep_chain | Who was Wellington? | Who was the Duke of Wellington and what was his role at Waterloo? | Who was Wellington? | 0.2369 |
| 14 | `impressionism_monet` | pronoun_resolution | What is his most famous painting? | What is Claude Monet's most famous painting? | What is his most famous painting? | 0.2301 |
| 15 | `cold_war_arms_race_deep` | deep_chain | What was MAD strategy? | What was the Mutually Assured Destruction (MAD) strategy during the Cold War? | What was MAD strategy? | 0.2179 |
| 16 | `literary_movements` | topic_continuation | How about Postmodernism? | What was the Postmodernism literary movement? | What about Postmodernism? | 0.2035 |
| 17 | `music_genres` | topic_continuation | How about hip-hop? | How did hip-hop music originate? | What is hip-hop? | 0.2027 |
| 18 | `east_west_philosophy` | multi_reference | Which had more influence on modern science? | Did Western or Eastern philosophy have more influence on modern science? | Which had more influence on modern science? | 0.1985 |
| 19 | `enlightenment_revolution_deep` | deep_chain | What did Rousseau add to these ideas? | What did Jean-Jacques Rousseau add to Enlightenment political philosophy? | What did Rousseau add to Locke's ideas? | 0.1930 |
| 20 | `communism_vs_fascism` | multi_reference | Which caused more deaths historically? | Did communism or fascism cause more deaths historically? | Which caused more deaths historically? | 0.1928 |
