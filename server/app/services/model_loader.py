from llama_cpp import Llama
import logging

logger = logging.getLogger("dejaq.services.model_loader")

class ModelManager:
    _qwen = None
    _qwen_1_5b = None
    _llama = None
    _phi = None

    @classmethod
    def load_qwen(cls):
        """Loads thew Qwen 2.5 (0.5B) model. the normalization model for cleaning user queries."""
        if cls._qwen is None:
            logger.info("Loading Qwen 2.5 0.5B (GGUF)...")
            cls._qwen = Llama.from_pretrained(
                repo_id="Qwen/Qwen2.5-0.5B-Instruct-GGUF",
                filename="*q4_k_m.gguf",
                verbose=False,
                n_ctx=4096
            )
        return cls._qwen

    @classmethod
    def load_qwen_1_5b(cls):
        """Loads Qwen 2.5 (1.5B) model for context adjustment."""
        if cls._qwen_1_5b is None:
            logger.info("Loading Qwen 2.5 1.5B (GGUF)...")
            cls._qwen_1_5b = Llama.from_pretrained(
                repo_id="Qwen/Qwen2.5-1.5B-Instruct-GGUF",
                filename="*q4_k_m.gguf",
                verbose=False,
                n_ctx=4096
            )
        return cls._qwen_1_5b

    @classmethod
    def load_phi(cls):
        """Loads Phi-3.5 Mini (3.8B) model for generalization (tone stripping)."""
        if cls._phi is None:
            logger.info("Loading Phi-3.5 Mini (GGUF)...")
            cls._phi = Llama.from_pretrained(
                repo_id="bartowski/Phi-3.5-mini-instruct-GGUF",
                filename="*Q4_K_M.gguf",
                verbose=False,
                n_ctx=4096
            )
        return cls._phi

    @classmethod
    def load_gemma(cls):
        """Loads the Gemma 4 26B A4B (MoE) model. The local model for answering queries."""
        if cls._llama is None:
            logger.info("Loading Gemma 4 26B A4B MoE (GGUF)...")
            cls._llama = Llama.from_pretrained(
                repo_id="unsloth/gemma-4-26B-A4B-it-GGUF",
                filename="*UD-Q4_K_M*",
                verbose=False,
                n_ctx=8192
            )
        return cls._llama