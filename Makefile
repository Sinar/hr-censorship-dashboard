.PHONY: build, up, import

build:
	docker pull node:8 && \
		docker run -it --rm -v "${PWD}/frontend":/usr/src/app -w /usr/src/app node:8 yarn install && \
		docker run -it --rm -v "${PWD}/frontend":/usr/src/app -w /usr/src/app node:8 yarn build

	docker pull python:3 && \
		docker-compose build --force-rm

up:
	# the crawlers
	docker-compose up --build -d crawler-my crawler-vn crawler-mm crawler-kh crawler-id

	# the API
	docker-compose up --build -d backend

	# the static react site
	docker-compose up --build -d frontend

import:
	if cd test-lists; then git pull; else git clone https://github.com/citizenlab/test-lists/ test-lists; fi &&\
		docker-compose up --build importer-my importer-vn importer-mm importer-kh importer-id

import-asn:
	rm -rf asn-list && \
		curl -O https://geolite.maxmind.com/download/geoip/database/GeoLite2-ASN-CSV.zip && \
		unzip -j GeoLite2-ASN-CSV.zip -d asn-list && \
		rm GeoLite2-ASN-CSV.zip

patcher:
	docker-compose up patcher
