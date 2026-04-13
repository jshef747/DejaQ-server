# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v4_gate_fix | 49 | 147 | 83.7% | 94.6% | 0.0670 | 0.2060 | 100.0% | 165.0 | 479.2 |
| v5_qwen_1_5b | 49 | 147 | 93.9% | 98.6% | 0.0519 | 0.1528 | 100.0% | 417.1 | 1410.7 |

## v4_gate_fix

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

## v5_qwen_1_5b

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 24 | 75.0% | 100.0% | 0.0893 | 0.1755 | — |
| multi_reference | 24 | 100.0% | 100.0% | 0.0462 | 0.1140 | — |
| passthrough | 24 | 100.0% | 100.0% | 0.0083 | 0.0599 | 100.0% |
| pronoun_resolution | 45 | 100.0% | 100.0% | 0.0308 | 0.1059 | — |
| topic_continuation | 30 | 90.0% | 93.3% | 0.0931 | 0.2129 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `debt_strategies` | topic_continuation | Which saves more money? | Does the debt snowball or avalanche method save more money? | Which saves more money? | 0.2760 |
| 2 | `diets_compared` | topic_continuation | Which is healthiest? | Which diet — Mediterranean, DASH, or paleo — is considered healthiest? | Which diet is considered the healthiest: the Mediterranean diet or the Atkins diet? | 0.2398 |
| 3 | `travel_hacking_deep` | deep_chain | How do I maximize the bonus? | How do I maximize a travel credit card signup bonus? | How do I maximize the bonus? | 0.1868 |
| 4 | `productivity_methods` | topic_continuation | Which works best? | Which productivity method works best — Pomodoro, time blocking, or GTD? | Which Pomodoro technique works best for managing time? | 0.1801 |
| 5 | `stock_market_crash_deep` | deep_chain | How long do crashes typically last? | How long do stock market crashes typically last before recovery? | How long do crashes typically last? | 0.1769 |
| 6 | `fasting_insulin_deep` | deep_chain | What diet changes help most? | What dietary changes help reduce insulin resistance the most? | What diet changes help most? | 0.1679 |
| 7 | `muscle_recovery_deep` | deep_chain | How long should I rest between sessions? | How long should I rest between strength training sessions for the same muscle group? | How long should I rest between sessions? | 0.1636 |
| 8 | `travel_hacking_deep` | deep_chain | What is churning? | What is credit card churning and is it worth it? | What is churning? | 0.1530 |
| 9 | `stock_market_crash_deep` | deep_chain | What is quantitative easing? | What is quantitative easing and how was it used after the 2008 crisis? | What is quantitative easing? | 0.1524 |
| 10 | `401k` | pronoun_resolution | What is an employer match? | What is an employer match in a 401(k) plan? | What is an employer match? | 0.1422 |
| 11 | `exercise_types` | topic_continuation | What about Pilates? | What is Pilates and how does it differ from HIIT? | What is Pilates? | 0.1373 |
| 12 | `skincare_routine` | topic_continuation | What about retinol? | What is retinol and what does it do for skin? | What is retinol and why is it important? | 0.1297 |
| 13 | `mortgage_refinancing_deep` | deep_chain | What are the closing costs? | What are the closing costs when refinancing a mortgage? | What are the closing costs? | 0.1290 |
| 14 | `term_vs_whole_life` | multi_reference | Which is better for most people? | Is term or whole life insurance better for most people? | Which type of life insurance is generally better for most people? | 0.1262 |
| 15 | `strength_training` | pronoun_resolution | How fast should I increase the weight? | How fast should I increase the weight when applying progressive overload? | How fast should I increase the weight? | 0.1261 |
| 16 | `gut_health_deep` | deep_chain | What is dysbiosis? | What is gut dysbiosis and what causes it? | What is dysbiosis? | 0.1249 |
| 17 | `diets_compared` | topic_continuation | And the paleo diet? | What is the paleo diet? | What is the paleo diet and how does it differ from the Mediterranean diet? | 0.1227 |
| 18 | `skincare_routine` | topic_continuation | And hyaluronic acid? | What is hyaluronic acid and how does it benefit the skin? | What is hyaluronic acid and why is it important? | 0.1190 |
| 19 | `sleep_hygiene` | topic_continuation | How many hours do adults need? | How many hours of sleep do adults need per night? | How many hours do adults need? | 0.1180 |
| 20 | `travel_planning` | topic_continuation | And travel credit cards? | What are travel credit cards and how can they help reduce travel costs? | What are the benefits of using travel credit cards for budget travel? | 0.1157 |
