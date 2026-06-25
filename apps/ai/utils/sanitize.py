import re


def sanitize_input(text: str, max_len: int = 4000) -> str:
    """Strip control characters and enforce length to prevent prompt injection."""
    cleaned = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", text)
    return cleaned[:max_len]
