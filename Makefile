.PHONY: build, up, import

build:
	docker pull python:3 && \
		docker-compose build --force-rm

up:
	# the crawlers
	docker-compose up crawler-my

	# the API

	# the static react site

import:
	if cd test-lists; then git pull; else git clone https://github.com/citizenlab/test-lists/ test-lists; fi &&\
		docker-compose up importer-my