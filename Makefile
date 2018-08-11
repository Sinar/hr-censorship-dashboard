.PHONY: up, import

up:
	# the crawlers
	docker-compose up crawler-my

	# the API

	# the static react site

foo:
	if cd test-lists; then git pull; else git clone https://github.com/citizenlab/test-lists/ test-lists; fi;
	pwd
	docker-compose up importer-my