# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v2_regex_gate | 49 | 147 | 83.7% | 94.6% | 0.0670 | 0.2060 | 100.0% | 89.7 | 222.5 |
| v3_improved_fewshots | 49 | 147 | 81.0% | 92.5% | 0.0685 | 0.2103 | 100.0% | 94.7 | 237.8 |

## v2_regex_gate

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 24 | 70.8% | 95.8% | 0.0950 | 0.1853 | — |
| multi_reference | 24 | 54.2% | 87.5% | 0.1254 | 0.2357 | — |
| passthrough | 24 | 100.0% | 100.0% | 0.0083 | 0.0599 | 100.0% |
| pronoun_resolution | 45 | 100.0% | 100.0% | 0.0278 | 0.1111 | — |
| topic_continuation | 30 | 80.0% | 86.7% | 0.1039 | 0.2247 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `gym_vs_home` | multi_reference | Which is cheaper in the long run? | Is a gym membership or home workout setup cheaper in the long run? | Which is cheaper in the long run? | 0.3174 |
| 2 | `debt_strategies` | topic_continuation | Which saves more money? | Does the debt snowball or avalanche method save more money? | Which saves more money? | 0.2760 |
| 3 | `sleep_deprivation_deep` | deep_chain | How does it affect weight? | How does chronic sleep deprivation affect body weight? | What does it affect weight? | 0.2492 |
| 4 | `renting_vs_buying` | multi_reference | Which makes more sense in a hot market? | Does renting or buying make more financial sense in a hot real estate market? | Which option makes more sense in a hot market? | 0.2404 |
| 5 | `productivity_methods` | topic_continuation | Which works best? | Which productivity method works best — Pomodoro, time blocking, or GTD? | Which method of time management works best? | 0.2284 |
| 6 | `investing_basics` | topic_continuation | Which works best? | Which investment strategy works best — dollar-cost averaging or lump-sum investing? | Which investment strategy of investing fixed amounts of money at regular intervals regardless of market price, reducing the impact of volatility and avoiding trying to time the market, is better? | 0.2203 |
| 7 | `productivity_methods` | topic_continuation | And Getting Things Done? | What is the Getting Things Done (GTD) productivity method? | What is Getting Things Done? | 0.2106 |
| 8 | `cardio_vs_weights` | multi_reference | Which is better for mental health? | Is cardio or weight training better for mental health? | Which is better for mental health? | 0.2096 |
| 9 | `cash_vs_credit` | multi_reference | Which is safer to use online? | Is using cash or credit cards safer for online purchases? | Which is safer to use online? | 0.1978 |
| 10 | `keto_vs_mediterranean` | multi_reference | Which is safer for heart health? | Is the ketogenic diet or Mediterranean diet safer for heart health? | Which is safer for heart health? | 0.1941 |
| 11 | `debt_strategies` | topic_continuation | What about the avalanche method? | What is the debt avalanche method and how does it compare to the snowball method? | What about the avalanche method? | 0.1937 |
| 12 | `stocks_vs_bonds` | multi_reference | Which should I prioritize when young? | Should I prioritize stocks or bonds when I am young? | Which should I prioritize when young? | 0.1894 |
| 13 | `diets_compared` | topic_continuation | Which is healthiest? | Which diet — Mediterranean, DASH, or paleo — is considered healthiest? | Which Mediterranean diet is the healthiest? | 0.1889 |
| 14 | `travel_hacking_deep` | deep_chain | How do I maximize the bonus? | How do I maximize a travel credit card signup bonus? | How do I maximize the bonus? | 0.1868 |
| 15 | `cash_vs_credit` | multi_reference | Which is accepted more widely internationally? | Are cash or credit cards more widely accepted internationally? | Which international currency is accepted more widely internationally? | 0.1775 |
| 16 | `stock_market_crash_deep` | deep_chain | How long do crashes typically last? | How long do stock market crashes typically last before recovery? | How long do crashes typically last? | 0.1769 |
| 17 | `term_vs_whole_life` | multi_reference | Which is better for most people? | Is term or whole life insurance better for most people? | Which type of insurance is better for most people? | 0.1766 |
| 18 | `term_vs_whole_life` | multi_reference | Which is more affordable? | Is term or whole life insurance more affordable? | Which type of insurance is more affordable? | 0.1758 |
| 19 | `fasting_insulin_deep` | deep_chain | What diet changes help most? | What dietary changes help reduce insulin resistance the most? | What diet changes help most? | 0.1679 |
| 20 | `muscle_recovery_deep` | deep_chain | How long should I rest between sessions? | How long should I rest between strength training sessions for the same muscle group? | How long should I rest between sessions? | 0.1636 |

## v3_improved_fewshots

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 24 | 70.8% | 95.8% | 0.0914 | 0.1853 | — |
| multi_reference | 24 | 54.2% | 83.3% | 0.1221 | 0.2570 | — |
| passthrough | 24 | 100.0% | 100.0% | 0.0083 | 0.0599 | 100.0% |
| pronoun_resolution | 45 | 100.0% | 100.0% | 0.0208 | 0.1044 | — |
| topic_continuation | 30 | 66.7% | 80.0% | 0.1271 | 0.2674 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `term_vs_whole_life` | multi_reference | Can I switch from one to the other? | Can I switch from term life insurance to whole life insurance? | Can I switch from one to the other? | 0.3304 |
| 2 | `diets_compared` | topic_continuation | Which is healthiest? | Which diet — Mediterranean, DASH, or paleo — is considered healthiest? | Which is the healthiest? | 0.3269 |
| 3 | `debt_strategies` | topic_continuation | Which saves more money? | Does the debt snowball or avalanche method save more money? | Which saves more money? | 0.2760 |
| 4 | `stocks_vs_bonds` | multi_reference | Which is safer? | Are stocks or bonds safer investments? | Which is safer? | 0.2624 |
| 5 | `productivity_methods` | topic_continuation | Which works best? | Which productivity method works best — Pomodoro, time blocking, or GTD? | Which Pomodoro technique works best? | 0.2569 |
| 6 | `sleep_deprivation_deep` | deep_chain | How does it affect weight? | How does chronic sleep deprivation affect body weight? | How does it affect weight? | 0.2481 |
| 7 | `renting_vs_buying` | multi_reference | Which makes more sense in a hot market? | Does renting or buying make more financial sense in a hot real estate market? | Which makes more sense in a hot market? | 0.2264 |
| 8 | `productivity_methods` | topic_continuation | And Getting Things Done? | What is the Getting Things Done (GTD) productivity method? | What is Getting Things Done? | 0.2106 |
| 9 | `cardio_vs_weights` | multi_reference | Which is better for mental health? | Is cardio or weight training better for mental health? | Which is better for mental health? | 0.2096 |
| 10 | `investing_basics` | topic_continuation | Which works best? | Which investment strategy works best — dollar-cost averaging or lump-sum investing? | Which investment strategy works best? | 0.2046 |
| 11 | `cooking_techniques` | topic_continuation | What about braising? | What is braising as a cooking technique? | What about sautéing and braising? | 0.2034 |
| 12 | `cash_vs_credit` | multi_reference | Which is safer to use online? | Is using cash or credit cards safer for online purchases? | Which is safer to use online? | 0.1978 |
| 13 | `keto_vs_mediterranean` | multi_reference | Which is safer for heart health? | Is the ketogenic diet or Mediterranean diet safer for heart health? | Which is safer for heart health? | 0.1941 |
| 14 | `debt_strategies` | topic_continuation | What about the avalanche method? | What is the debt avalanche method and how does it compare to the snowball method? | What about the avalanche method? | 0.1937 |
| 15 | `running_vs_cycling` | multi_reference | Which is better for weight loss? | Is running or cycling better for weight loss? | Which is better for weight loss? | 0.1897 |
| 16 | `stocks_vs_bonds` | multi_reference | Which should I prioritize when young? | Should I prioritize stocks or bonds when I am young? | Which should I prioritize when young? | 0.1894 |
| 17 | `exercise_types` | topic_continuation | What about Pilates? | What is Pilates and how does it differ from HIIT? | What about Pilates? | 0.1888 |
| 18 | `travel_hacking_deep` | deep_chain | How do I maximize the bonus? | How do I maximize a travel credit card signup bonus? | How do I maximize the bonus? | 0.1868 |
| 19 | `cash_vs_credit` | multi_reference | Which is accepted more widely internationally? | Are cash or credit cards more widely accepted internationally? | Which international currency is accepted more widely internationally? | 0.1775 |
| 20 | `stock_market_crash_deep` | deep_chain | How long do crashes typically last? | How long do stock market crashes typically last before recovery? | How long do crashes typically last? | 0.1769 |
