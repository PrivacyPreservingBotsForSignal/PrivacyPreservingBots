# The default all target builds and runs the mock stack with a 'faked' Signal backend for testing.
all: docker-build docker-build-server
	make docker-compose-mock

# This 'all-real-signal' target is equivalent to the above 'all' target, but does not spin up the mock server and instead should be configured with a docker-compose file with environment variables for use with real signal accounts
all-real-signal: docker-build docker-compose

docker-build:
	DOCKER_BUILDKIT=1; docker build -t signal-bot .

docker-run:
	docker run -it --rm --name signal-bot signal-bot

docker-run-server:
	docker run -it --rm -p 8080:8080 --name mock_server mock_server

docker-run-dev:
	docker run -it --rm --name signal-bot --entrypoint /bin/bash signal-bot

docker-compose:
	docker-compose up --remove-orphans --force-recreate

docker-compose-mock:
	docker-compose -f mock.docker-compose.yml up --remove-orphans --force-recreate

docker-build-server:
	docker build -t mock_server -f mock.Dockerfile .

do-benchmarks:
	./benchmark_all.sh
