.PHONY: install dev migrate seed test clean

VENV   = venv
PYTHON = $(VENV)/bin/python
PIP    = $(VENV)/bin/pip
UV     = $(VENV)/bin/uvicorn

$(VENV)/bin/activate:
	python3 -m venv $(VENV)

install: $(VENV)/bin/activate
	$(PIP) install --upgrade pip
	$(PIP) install -r requirements.txt

dev: $(VENV)/bin/activate
	$(UV) main:app --reload --port 8000

migrate: $(VENV)/bin/activate
	$(VENV)/bin/alembic upgrade head

seed: $(VENV)/bin/activate
	$(PYTHON) -c "from models.db import seed; seed()"

test: $(VENV)/bin/activate
	$(VENV)/bin/pytest tests/ -v

clean:
	rm -rf $(VENV) __pycache__ .pytest_cache
