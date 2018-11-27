FROM python:3

RUN pip install hug gunicorn PyMySQL cachetools &&\
    mkdir -p /opt/dashboard-api

COPY index.py /opt/dashboard-api/index.py

WORKDIR "/opt/dashboard-api"

CMD ["gunicorn", "-w", "4", "--bind", "0.0.0.0:8000", "index:__hug_wsgi__"]