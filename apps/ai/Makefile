.PHONY: dev install migrate seed test

install:
	python -m venv venv && . venv/bin/activate && pip install -r requirements.txt

dev:
	. venv/bin/activate && uvicorn main:app --reload --port 8000

migrate:
	. venv/bin/activate && alembic upgrade head

seed:
	. venv/bin/activate && python -c "from models.db import seed; seed()"

test:
	. venv/bin/activate && pytest tests/ -v
