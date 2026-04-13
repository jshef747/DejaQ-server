# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v4_gate_fix | 54 | 162 | 86.4% | 93.2% | 0.0753 | 0.2161 | 100.0% | 153.4 | 460.1 |
| v5_qwen_1_5b | 54 | 162 | 90.7% | 96.3% | 0.0570 | 0.1843 | 100.0% | 269.2 | 643.2 |

## v4_gate_fix

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 27 | 88.9% | 100.0% | 0.0950 | 0.1697 | — |
| multi_reference | 30 | 70.0% | 83.3% | 0.1258 | 0.2647 | — |
| passthrough | 30 | 86.7% | 96.7% | 0.0704 | 0.1834 | 100.0% |
| pronoun_resolution | 45 | 100.0% | 100.0% | 0.0148 | 0.0703 | — |
| topic_continuation | 30 | 80.0% | 83.3% | 0.1030 | 0.2461 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `pytest_basics` | multi_reference | Can I use both together? | Can I use pytest fixtures and setup/teardown methods together? | Can I use both together? | 0.3605 |
| 2 | `mongodb_vs_postgres` | multi_reference | Which has stronger consistency guarantees? | Does MongoDB or PostgreSQL have stronger data consistency guarantees? | Which database has stronger ACID compliance? | 0.2905 |
| 3 | `design_patterns` | topic_continuation | How about Strategy? | What is the Strategy design pattern? | What is the Singleton design pattern? | 0.2821 |
| 4 | `ci_cd` | topic_continuation | What tools are used? | What tools are commonly used for CI/CD? | What tools are used? | 0.2501 |
| 5 | `caching_strategies` | topic_continuation | What are common eviction policies? | What are common cache eviction policies like LRU and LFU? | What are common eviction policies? | 0.2412 |
| 6 | `memory_management` | topic_continuation | And manual memory management in C? | How does manual memory management work in C? | What is garbage collection in C? | 0.2364 |
| 7 | `mongodb_vs_postgres` | multi_reference | Which scales better horizontally? | Does MongoDB or PostgreSQL scale better horizontally? | Which scales better horizontally? | 0.2331 |
| 8 | `standalone_solid` | passthrough | What are the SOLID principles? | What are the SOLID principles in software engineering? | What are the SOLID principles? | 0.2196 |
| 9 | `docker_vs_vm` | multi_reference | Which uses less memory? | Do Docker containers or virtual machines use less memory? | Which uses less memory? | 0.2168 |
| 10 | `memory_management` | topic_continuation | How does Python do it? | How does Python implement garbage collection? | What does Python do to prevent memory leaks? | 0.2039 |
| 11 | `python_vs_go` | multi_reference | Which has better tooling? | Does Python or Go have better developer tooling? | Which language has better tooling for backend development? | 0.2029 |
| 12 | `multithreading_vs_multiprocessing` | multi_reference | Which uses more memory? | Does multithreading or multiprocessing use more memory in Python? | Which uses more memory? | 0.1947 |
| 13 | `standalone_race_condition` | passthrough | How do race conditions occur? | How do race conditions occur in multithreaded code? | How do race conditions occur? | 0.1845 |
| 14 | `standalone_race_condition` | passthrough | What is a race condition? | What is a race condition in concurrent programming? | What is a race condition? | 0.1822 |
| 15 | `class_inheritance` | topic_continuation | What about inheritance? | How does class inheritance work in Python? | What is the difference between a class and an object in Python? | 0.1819 |
| 16 | `git_rebase_deep` | deep_chain | What is the golden rule of rebasing? | What is the golden rule of git rebase? | What is the golden rule of rebasing? | 0.1778 |
| 17 | `sql_vs_orm` | multi_reference | Which is faster? | Is raw SQL or ORM faster for database queries? | Which ORM is faster? | 0.1727 |
| 18 | `postgres_query_plan` | deep_chain | What does the cost number mean? | What does the cost number in a PostgreSQL query plan mean? | What does the cost number mean? | 0.1718 |
| 19 | `python_package_publish` | deep_chain | What is semantic versioning? | What is semantic versioning (semver) for Python packages? | What is semantic versioning? | 0.1647 |
| 20 | `rest_vs_graphql` | multi_reference | Which is better for mobile clients? | Is REST or GraphQL better for mobile clients? | Which API is better for mobile clients? | 0.1605 |

## v5_qwen_1_5b

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 27 | 88.9% | 100.0% | 0.0803 | 0.1697 | — |
| multi_reference | 30 | 83.3% | 90.0% | 0.0792 | 0.2258 | — |
| passthrough | 30 | 86.7% | 96.7% | 0.0704 | 0.1834 | 100.0% |
| pronoun_resolution | 45 | 100.0% | 100.0% | 0.0097 | 0.0508 | — |
| topic_continuation | 30 | 90.0% | 93.3% | 0.0716 | 0.2162 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `pytest_basics` | multi_reference | Can I use both together? | Can I use pytest fixtures and setup/teardown methods together? | Can I use both together? | 0.3605 |
| 2 | `ci_cd` | topic_continuation | What tools are used? | What tools are commonly used for CI/CD? | What tools are used? | 0.2501 |
| 3 | `caching_strategies` | topic_continuation | What are common eviction policies? | What are common cache eviction policies like LRU and LFU? | What are common eviction policies? | 0.2412 |
| 4 | `mongodb_vs_postgres` | multi_reference | Which scales better horizontally? | Does MongoDB or PostgreSQL scale better horizontally? | Which scales better horizontally? | 0.2331 |
| 5 | `standalone_solid` | passthrough | What are the SOLID principles? | What are the SOLID principles in software engineering? | What are the SOLID principles? | 0.2196 |
| 6 | `docker_vs_vm` | multi_reference | Which uses less memory? | Do Docker containers or virtual machines use less memory? | Which uses less memory? | 0.2168 |
| 7 | `multithreading_vs_multiprocessing` | multi_reference | Which uses more memory? | Does multithreading or multiprocessing use more memory in Python? | Which uses more memory? | 0.1947 |
| 8 | `design_patterns` | topic_continuation | What about the Factory pattern? | What is the Factory design pattern? | What is the Factory pattern and how does it differ from the Singleton pattern? | 0.1857 |
| 9 | `standalone_race_condition` | passthrough | How do race conditions occur? | How do race conditions occur in multithreaded code? | How do race conditions occur? | 0.1845 |
| 10 | `standalone_race_condition` | passthrough | What is a race condition? | What is a race condition in concurrent programming? | What is a race condition? | 0.1822 |
| 11 | `git_rebase_deep` | deep_chain | What is the golden rule of rebasing? | What is the golden rule of git rebase? | What is the golden rule of rebasing? | 0.1778 |
| 12 | `postgres_query_plan` | deep_chain | What does the cost number mean? | What does the cost number in a PostgreSQL query plan mean? | What does the cost number mean? | 0.1718 |
| 13 | `python_package_publish` | deep_chain | What is semantic versioning? | What is semantic versioning (semver) for Python packages? | What is semantic versioning? | 0.1647 |
| 14 | `standalone_orm` | passthrough | What is an ORM? | What is an ORM (Object-Relational Mapper)? | What is an ORM? | 0.1579 |
| 15 | `stack_queue` | multi_reference | Which is used for BFS vs DFS? | Which data structure — stack or queue — is used for DFS vs BFS? | Which data structure is used for Breadth-First Search (BFS) and which one is used for Depth-First Search (DFS)? | 0.1549 |
| 16 | `react_hooks_deep` | deep_chain | How does useMemo differ? | How does useMemo differ from useCallback in React? | How does useMemo differ? | 0.1491 |
| 17 | `standalone_race_condition` | passthrough | Explain race conditions. | What is a race condition and why is it a problem? | Explain race conditions. | 0.1427 |
| 18 | `interpreted_vs_compiled` | multi_reference | Which is better for scripting? | Are compiled or interpreted languages better for scripting? | Which type of language is better for scripting tasks? | 0.1352 |
| 19 | `async_await` | topic_continuation | How about asyncio? | What is asyncio and how does it work? | What is asyncio in the context of asynchronous programming? | 0.1350 |
| 20 | `postgres_query_plan` | deep_chain | How do I fix a sequential scan? | How do I fix a sequential scan in a PostgreSQL query plan? | How do I fix a sequential scan? | 0.1286 |
