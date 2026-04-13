# Enricher Test Report

Thresholds: fidelity production=0.15 · trusted=0.2 · passthrough=0.05

## Headline comparison

| Config | Scenarios | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate | Mean lat (ms) | P95 lat (ms) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| v2_regex_gate | 54 | 162 | 84.0% | 90.7% | 0.0831 | 0.2362 | 100.0% | 89.5 | 242.1 |
| v3_improved_fewshots | 54 | 162 | 86.4% | 93.8% | 0.0723 | 0.2159 | 100.0% | 96.4 | 241.4 |

## v2_regex_gate

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 27 | 85.2% | 96.3% | 0.1043 | 0.1760 | — |
| multi_reference | 30 | 70.0% | 83.3% | 0.1258 | 0.2647 | — |
| passthrough | 30 | 86.7% | 96.7% | 0.0704 | 0.1834 | 100.0% |
| pronoun_resolution | 45 | 93.3% | 93.3% | 0.0370 | 0.2086 | — |
| topic_continuation | 30 | 80.0% | 83.3% | 0.1030 | 0.2461 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `pytest_basics` | multi_reference | Can I use both together? | Can I use pytest fixtures and setup/teardown methods together? | Can I use both together? | 0.3605 |
| 2 | `virtual_env` | pronoun_resolution | How do I create one? | How do I create a Python virtual environment? | How do I create one? | 0.3399 |
| 3 | `python_decorator` | pronoun_resolution | How do I write one? | How do I write a Python decorator? | How do I write one? | 0.3196 |
| 4 | `mongodb_vs_postgres` | multi_reference | Which has stronger consistency guarantees? | Does MongoDB or PostgreSQL have stronger data consistency guarantees? | Which database has stronger ACID compliance? | 0.2905 |
| 5 | `design_patterns` | topic_continuation | How about Strategy? | What is the Strategy design pattern? | What is the Singleton design pattern? | 0.2821 |
| 6 | `react_hooks_deep` | deep_chain | Can I write custom ones? | Can I write custom React hooks? | Can I write custom ones? | 0.2569 |
| 7 | `ci_cd` | topic_continuation | What tools are used? | What tools are commonly used for CI/CD? | What tools are used? | 0.2501 |
| 8 | `caching_strategies` | topic_continuation | What are common eviction policies? | What are common cache eviction policies like LRU and LFU? | What are common eviction policies? | 0.2412 |
| 9 | `memory_management` | topic_continuation | And manual memory management in C? | How does manual memory management work in C? | What is garbage collection in C? | 0.2364 |
| 10 | `mongodb_vs_postgres` | multi_reference | Which scales better horizontally? | Does MongoDB or PostgreSQL scale better horizontally? | Which scales better horizontally? | 0.2331 |
| 11 | `sql_index` | pronoun_resolution | When should I add one? | When should I add a database index? | When should I add one? | 0.2287 |
| 12 | `standalone_solid` | passthrough | What are the SOLID principles? | What are the SOLID principles in software engineering? | What are the SOLID principles? | 0.2196 |
| 13 | `docker_vs_vm` | multi_reference | Which uses less memory? | Do Docker containers or virtual machines use less memory? | Which uses less memory? | 0.2168 |
| 14 | `memory_management` | topic_continuation | How does Python do it? | How does Python implement garbage collection? | What does Python do to prevent memory leaks? | 0.2039 |
| 15 | `python_vs_go` | multi_reference | Which has better tooling? | Does Python or Go have better developer tooling? | Which language has better tooling for backend development? | 0.2029 |
| 16 | `multithreading_vs_multiprocessing` | multi_reference | Which uses more memory? | Does multithreading or multiprocessing use more memory in Python? | Which uses more memory? | 0.1947 |
| 17 | `standalone_race_condition` | passthrough | How do race conditions occur? | How do race conditions occur in multithreaded code? | How do race conditions occur? | 0.1845 |
| 18 | `standalone_race_condition` | passthrough | What is a race condition? | What is a race condition in concurrent programming? | What is a race condition? | 0.1822 |
| 19 | `class_inheritance` | topic_continuation | What about inheritance? | How does class inheritance work in Python? | What is the difference between a class and an object in Python? | 0.1819 |
| 20 | `git_rebase_deep` | deep_chain | What is the golden rule of rebasing? | What is the golden rule of git rebase? | What is the golden rule of rebasing? | 0.1778 |

## v3_improved_fewshots

### Per-category breakdown

| Category | Rows | Fidelity@0.15 | Fidelity@0.20 | Mean dist | P95 dist | Passthrough rate |
|---|---:|---:|---:|---:|---:|---:|
| deep_chain | 27 | 85.2% | 96.3% | 0.0983 | 0.1760 | — |
| multi_reference | 30 | 66.7% | 86.7% | 0.1214 | 0.2930 | — |
| passthrough | 30 | 86.7% | 96.7% | 0.0704 | 0.1834 | 100.0% |
| pronoun_resolution | 45 | 100.0% | 100.0% | 0.0101 | 0.0564 | — |
| topic_continuation | 30 | 86.7% | 86.7% | 0.0950 | 0.2390 | — |

### Worst cases (top 20 by fidelity distance)

| # | Scenario | Category | Follow-up input | Expected | Enriched | Distance |
|---|---|---|---|---|---|---:|
| 1 | `pytest_basics` | multi_reference | Can I use both together? | Can I use pytest fixtures and setup/teardown methods together? | Can I use both together? | 0.3605 |
| 2 | `docker_vs_vm` | multi_reference | When should I use each? | When should I use Docker containers vs virtual machines? | When should I use each? | 0.3420 |
| 3 | `flask_to_fastapi_migration` | deep_chain | How hard is migrating from one to the other? | How hard is it to migrate from Flask to FastAPI? | How hard is it to migrate from one to the other? | 0.2798 |
| 4 | `ci_cd` | topic_continuation | What tools are used? | What tools are commonly used for CI/CD? | What tools are used? | 0.2501 |
| 5 | `caching_strategies` | topic_continuation | What are common eviction policies? | What are common cache eviction policies like LRU and LFU? | What are common eviction policies? | 0.2412 |
| 6 | `memory_management` | topic_continuation | And manual memory management in C? | How does manual memory management work in C? | What is garbage collection in C? | 0.2364 |
| 7 | `mongodb_vs_postgres` | multi_reference | Which scales better horizontally? | Does MongoDB or PostgreSQL scale better horizontally? | Which scales better horizontally? | 0.2331 |
| 8 | `standalone_solid` | passthrough | What are the SOLID principles? | What are the SOLID principles in software engineering? | What are the SOLID principles? | 0.2196 |
| 9 | `docker_vs_vm` | multi_reference | Which uses less memory? | Do Docker containers or virtual machines use less memory? | Which uses less memory? | 0.2168 |
| 10 | `testing_types` | topic_continuation | What about mocking? | What is mocking in software testing? | What about mocking? | 0.2003 |
| 11 | `multithreading_vs_multiprocessing` | multi_reference | Which uses more memory? | Does multithreading or multiprocessing use more memory in Python? | Which uses more memory? | 0.1947 |
| 12 | `python_vs_go` | multi_reference | Which has better tooling? | Does Python or Go have better developer tooling? | Which has better tooling for backend development? | 0.1869 |
| 13 | `standalone_race_condition` | passthrough | How do race conditions occur? | How do race conditions occur in multithreaded code? | How do race conditions occur? | 0.1845 |
| 14 | `standalone_race_condition` | passthrough | What is a race condition? | What is a race condition in concurrent programming? | What is a race condition? | 0.1822 |
| 15 | `git_rebase_deep` | deep_chain | What is the golden rule of rebasing? | What is the golden rule of git rebase? | What is the golden rule of rebasing? | 0.1778 |
| 16 | `sql_vs_orm` | multi_reference | Which is faster? | Is raw SQL or ORM faster for database queries? | Which ORM is faster? | 0.1727 |
| 17 | `postgres_query_plan` | deep_chain | What does the cost number mean? | What does the cost number in a PostgreSQL query plan mean? | What does the cost number mean? | 0.1718 |
| 18 | `mongodb_vs_postgres` | multi_reference | Which is better for analytics? | Is MongoDB or PostgreSQL better for analytics workloads? | Which is better for analytics? | 0.1669 |
| 19 | `python_package_publish` | deep_chain | What is semantic versioning? | What is semantic versioning (semver) for Python packages? | What is semantic versioning? | 0.1647 |
| 20 | `standalone_orm` | passthrough | What is an ORM? | What is an ORM (Object-Relational Mapper)? | What is an ORM? | 0.1579 |
