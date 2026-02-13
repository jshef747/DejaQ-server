# 🛠️ Tech Stack & Constraints

## Core Technologies
* **Language:** Python 3.12+
* **Package Manager:** `uv` (Strict requirement. Do not use `pip` directly).
* **Framework:** FastAPI (WebSockets).
* **AI Engine:** `llama-cpp-python` (GGUF format).
    * *Constraint:* Must support both Metal (Mac) and CUDA (Windows).
* **Database:** SQLAlchemy (Async) + SQLite (Dev) / PostgreSQL (Prod).
* **Vector DB:** chromaDB

## 📝 Coding Standards
1.  **Logging:** NEVER use `print()`. Always use `app.utils.logger`.
2.  **Typing:** Strong typing is required. Use `Pydantic` for all data structures.
3.  **Async:** All I/O operations (DB, Network) must be `async/await`.
4.  **Structure:**
    * `app/routers`: API Endpoints.
    * `app/services`: Business Logic (AI, Normalization).
    * `app/schemas`: Pydantic Models.
    * `app/models`: Database Tables.

## ⚠️ Known Constraints
* **Model Loading:** Models are heavy. Use the `ModelManager` singleton (`app.services.model_loader`) to avoid loading them twice.
* **Windows Support:** We cannot use `mlx-lm`. We strictly use `llama-cpp-python` for cross-platform compatibility.