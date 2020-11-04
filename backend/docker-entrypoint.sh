#!/bin/sh

set -e

. /venv/bin/activate

exec gunicorn -w 4 --bind 0.0.0.0:8000 backend.index:__hug_wsgi__