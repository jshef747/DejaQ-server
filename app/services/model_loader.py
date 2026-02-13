from llama_cpp import Llama
import logging

logger = logging.getLogger("dejaq.services.model_loader")

class ModelManager:
    _qwen = None
    _llama = None

    @classmethod
    def load_qwen(cls):
        """Loads thew Qwen 2.5 (0.5B) model. the normalization model for cleaning user queries."""
        if cls._qwen is None:
            logger.info("Loading Qwen 2.5 0.5B (GGUF)...")
            cls._qwen = Llama.from_pretrained(
                repo_id="Qwen/Qwen2.5-0.5B-Instruct-GGUF",
                filename="*q4_k_m.gguf",
                verbose=False,
                n_ctx=2048
            )
        return cls._qwen

    @classmethod
    def load_llama(cls):
        """Loads the Llama 3.2 (1B) model. The local model for answering queries."""
        if cls._llama is None:
            logger.info("Loading Llama 3.2 1B (GGUF)...")
            cls._llama = Llama.from_pretrained(
                repo_id="hugging-quants/Llama-3.2-1B-Instruct-Q8_0-GGUF",
                filename="*q8_0.gguf",
                verbose=False,
                n_ctx=2048
            )
        return cls._llama