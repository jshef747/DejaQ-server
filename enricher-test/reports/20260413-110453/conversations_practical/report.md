# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| baseline_qwen_0_5b | 49 | 147 | 85.7% | 94.6% | 0.0603 | 0.2043 | 100.0% | 134.2 | 246.0 |
| v2_regex_gate | 49 | 147 | 83.7% | 94.6% | 0.0670 | 0.2060 | 100.0% | 96.4 | 265.6 |

## baseline_qwen_0_5b

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 24 | 83.3% | 95.8% | 0.0666 | 0.1620 | — |
| multi_reference | 24 | 54.2% | 87.5% | 0.1254 | 0.2357 | — |
| passthrough | 24 | 100.0% | 100.0% | 0.0154 | 0.0673 | 100.0% |
| pronoun_resolution | 45 | 100.0% | 100.0% | 0.0241 | 0.0971 | — |
| topic_continuation | 30 | 80.0% | 86.7% | 0.0935 | 0.2160 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `gym_vs_home` | multi_reference | Which is cheaper in the long run? | Is a gym membership or home workout setup cheaper in the long run? | Which is cheaper in the long run? | 0.3174 |
| 2 | `sleep_deprivation_deep` | deep_chain | How does it affect weight? | How does chronic sleep deprivation affect body weight? | What does it affect weight? | 0.2492 |
| 3 | `renting_vs_buying` | multi_reference | Which makes more sense in a hot market? | Does renting or buying make more financial sense in a hot real estate market? | Which option makes more sense in a hot market? | 0.2404 |
| 4 | `productivity_methods` | topic_continuation | Which works best? | Which productivity method works best — Pomodoro, time blocking, or GTD? | Which method of time management works best? | 0.2284 |
| 5 | `investing_basics` | topic_continuation | Which works best? | Which investment strategy works best — dollar-cost averaging or lump-sum investing? | Which investment strategy of investing fixed amounts of money at regular intervals regardless of market price, reducing the impact of volatility and avoiding trying to time the market, is better? | 0.2203 |
| 6 | `productivity_methods` | topic_continuation | And Getting Things Done? | What is the Getting Things Done (GTD) productivity method? | What is Getting Things Done? | 0.2106 |
| 7 | `cardio_vs_weights` | multi_reference | Which is better for mental health? | Is cardio or weight training better for mental health? | Which is better for mental health? | 0.2096 |
| 8 | `debt_strategies` | topic_continuation | Which saves more money? | Does the debt snowball or avalanche method save more money? | Which method of debt repayment saves more money? | 0.2070 |
| 9 | `cash_vs_credit` | multi_reference | Which is safer to use online? | Is using cash or credit cards safer for online purchases? | Which is safer to use online? | 0.1978 |
| 10 | `keto_vs_mediterranean` | multi_reference | Which is safer for heart health? | Is the ketogenic diet or Mediterranean diet safer for heart health? | Which is safer for heart health? | 0.1941 |
| 11 | `debt_strategies` | topic_continuation | What about the avalanche method? | What is the debt avalanche method and how does it compare to the snowball method? | What about the avalanche method? | 0.1937 |
| 12 | `stocks_vs_bonds` | multi_reference | Which should I prioritize when young? | Should I prioritize stocks or bonds when I am young? | Which should I prioritize when young? | 0.1894 |
| 13 | `diets_compared` | topic_continuation | Which is healthiest? | Which diet — Mediterranean, DASH, or paleo — is considered healthiest? | Which Mediterranean diet is the healthiest? | 0.1889 |
| 14 | `cash_vs_credit` | multi_reference | Which is accepted more widely internationally? | Are cash or credit cards more widely accepted internationally? | Which international currency is accepted more widely internationally? | 0.1775 |
| 15 | `term_vs_whole_life` | multi_reference | Which is better for most people? | Is term or whole life insurance better for most people? | Which type of insurance is better for most people? | 0.1766 |
| 16 | `term_vs_whole_life` | multi_reference | Which is more affordable? | Is term or whole life insurance more affordable? | Which type of insurance is more affordable? | 0.1758 |
| 17 | `muscle_recovery_deep` | deep_chain | How long should I rest between sessions? | How long should I rest between strength training sessions for the same muscle group? | How long should I rest between sessions? | 0.1636 |
| 18 | `running_vs_cycling` | multi_reference | Which is easier on knees? | Is running or cycling easier on the knees? | Which is easier on knees? | 0.1626 |
| 19 | `renting_vs_buying` | multi_reference | Which is cheaper over 10 years? | Is renting or buying a home cheaper over 10 years? | Which is cheaper over 10 years? | 0.1595 |
| 20 | `travel_hacking_deep` | deep_chain | What is churning? | What is credit card churning and is it worth it? | What is churning? | 0.1530 |

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
