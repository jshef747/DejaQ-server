import logging
import sys

# Define the format: Timestamp - Module Name - Level - Message
LOG_FORMAT = "%(asctime)s | %(name)-20s | %(levelname)-8s | %(message)s"

def setup_logging():
    """
    Configures the root logger. Call this once in main.py.
    """
    # Configure the root logger
    logging.basicConfig(
        level=logging.INFO,
        format=LOG_FORMAT,
        handlers=[
            logging.StreamHandler(sys.stdout)  # Output to console
            # In the future, add FileHandler here to save logs to a file
        ]
    )

    # Silence noisy libraries if needed (optional)
    # logging.getLogger("uvicorn.access").setLevel(logging.WARNING)