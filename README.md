# DejaQ - AI Middleware & Organizational Memory

**DejaQ** is an intelligent middleware layer designed to optimize LLM interactions. It intelligently routes queries between a local semantic cache, lightweight local models (Llama/Qwen), and high-performance external APIs (GPT-4/Gemini) to minimize latency and cost.

## 🚀 Quick Start

### 1. Prerequisites
Before starting, ensure you have the following installed:
- **Python 3.12+**
- **uv** (Fast Python package manager)
  - **Mac/Linux:** `curl -LsSf https://astral.sh/uv/install.sh | sh`
  - **Windows:** `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`

---

### 2. Installation & Hardware Optimization

Clone the repository and navigate to the server directory:  

```bash
git clone <your-repo-url>
cd dejaq/server
```

#### Enable GPU Acceleration
Run the command matching your operating system to optimize performance:

**🍎 Mac (Apple Silicon M1/M2/M3)**
```bash
CMAKE_ARGS="-DLLAMA_METAL=on" uv sync
```

**🪟 Windows (NVIDIA GPU)**  
*Note: Ensure the [CUDA Toolkit](https://developer.nvidia.com/cuda-downloads) is installed.*
```powershell
$env:CMAKE_ARGS = "-DLLAMA_CUBLAS=on"
uv sync
```

**💻 Windows/Linux (CPU Only)**
```bash
uv sync
```

---

### 3. Running the Server
Start the backend orchestrator. On the first run, the system will automatically download the necessary model files (~1GB).
```bash
uv run uvicorn app.main:app --reload
```
**Success:** The server will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).