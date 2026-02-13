# 🚦 Current Status

## ✅ Completed
* Basic FastAPI WebSocket server set up.
* Pydantic Schemas defined (`ChatRequest` with `department_id`).
* **Normalizer Service:** Implemented using Qwen 2.5 (0.5B).
* **Router Service:** Implemented using Llama 3.2 (1B).
* **Client:** Simple HTML/JS `index.html` for testing.
* **Hardware:** `llama-cpp-python` is configured for Mac (Metal) and Windows.

## 🚧 In Progress / Next Steps
1.  **Complexity Classifier:** We need to implement a logic to classify queries as "Easy" vs "Hard".
2.  **Database:** `users` and `departments` tables are sketched but not fully integrated.
3.  **Semantic Cache:** Not started.