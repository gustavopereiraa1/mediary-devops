FROM python:3.12-slim

WORKDIR /opt/mediary-api

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py schema.sql ./

# Porta da API Flask
EXPOSE 5000

# --preload carrega o app uma vez só (o schema.sql roda antes de abrir os workers)
CMD ["gunicorn", "--preload", "-w", "2", "-b", "0.0.0.0:5000", "app:app"]
