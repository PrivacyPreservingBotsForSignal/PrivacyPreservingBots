#!/usr/bin/env zsh
make docker-build

export BACKEND_SEND_URL=http://host.docker.internal
export BACKEND_RECEIVE_URL=http://host.docker.internal

if [ -z "$1" ]
then
    echo "No argument supplied"
    exit 1
fi

# For loop set to arg 1
if [ -z "$2" ]
then
    echo "No second argument supplied. Using path from .env"
else
    export BOTPATH=./src/CapekScript/Examples/$2
fi
for i in {0..$1..1}
do
    echo "Starting bot $i"
    docker run --add-host=host.docker.internal:host-gateway -d -it --rm --env BACKEND_SEND_URL --env BACKEND_RECEIVE_URL --env BOTPATH --env SIGNAL_BOT_ID=$i --env USER_NUMBER=$i --name signal-bot-$i signal-bot
done
