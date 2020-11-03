#!make
include envfile
export $(shell sed 's/=.*//' envfile)

.PHONY: build, up, import

clean:
	rm -rf asn-list

build:
	docker pull node:15 && \
		docker run -it --rm -v "${PWD}/frontend":/usr/src/app -w /usr/src/app node:15 yarn install && \
		docker run -it --rm -v "${PWD}/frontend":/usr/src/app -w /usr/src/app node:15 yarn build

	docker pull python:3.9-slim && \
		docker-compose build --force-rm

	docker pull abiosoft/caddy

up:
	# the crawlers
	docker-compose up --build -d crawler-my crawler-vn crawler-mm crawler-kh crawler-id crawler-hk

	# the API
	docker-compose up --build -d backend

	# the static react site
	docker-compose up -d frontend

import:
	if cd test-lists; then git pull; else git clone https://github.com/citizenlab/test-lists/ test-lists; fi &&\
		docker-compose up --build importer-global importer-my importer-vn importer-mm importer-kh importer-id importer-hk

asn-list:
	rm -rf asn-list && \
		curl -L -o GeoLite2-ASN-CSV.zip "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-ASN-CSV&license_key=${GEOIP_LICENSE}&suffix=zip" && \
		unzip -j GeoLite2-ASN-CSV.zip -d asn-list && \
		rm GeoLite2-ASN-CSV.zip

patcher:
	docker-compose up patcher
