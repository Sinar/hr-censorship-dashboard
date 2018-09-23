FROM python:3

RUN pip install hug gunicorn PyMySQL &&\
    mkdir -p /opt/dashboard-api

COPY index.py /opt/dashboard-api/index.py

WORKDIR "/opt/dashboard-api"

CMD ["gunicorn", "index:__hug_wsgi__"]