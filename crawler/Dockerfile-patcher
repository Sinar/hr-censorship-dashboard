FROM python:3

RUN pip install python-dateutil ujson pymysql crawler cryptography &&\
    mkdir -p /opt/patcher

COPY patcher.py /opt/patcher/patcher.py

CMD ["python", "/opt/patcher/patcher.py"]
