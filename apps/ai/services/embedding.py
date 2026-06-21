import logging
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("axiom-ai")

_model = None

def get_model() -> SentenceTransformer:
    """Lazy-load the SentenceTransformer model."""
    global _model
    if _model is None:
        logger.info("Loading sentence-transformers/all-MiniLM-L6-v2...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info("Model loaded successfully.")
    return _model

def embed_text(text: str) -> list[float]:
    """Generate 384-dimensional dense vector embeddings for a given text."""
    if not text or not text.strip():
        # Return 0 vector of 384 dimensions if text is empty
        return [0.0] * 384
    try:
        model = get_model()
        embedding = model.encode(text)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Error generating embedding: {e}")
        return [0.0] * 384

def preload_model():
    """Trigger eager loading of the model to avoid latency on the first request."""
    logger.info("Preloading embedding model...")
    get_model()
