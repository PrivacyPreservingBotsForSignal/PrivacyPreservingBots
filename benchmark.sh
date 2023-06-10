#!/usr/bin/env zsh

# Absolute path to this script, e.g. /home/user/bin/foo.sh
SCRIPT=$(readlink -f "$0")
# Absolute path this script is in, thus /home/user/bin
DIRECTORY="$(dirname "$SCRIPT")"

make docker-build

export BENCHMARK=true
export ONLINE=$(($1+1))
export NO_OF_BOTS=$(($1+1))
export BENCHMARK_BOT=$1

# If "no-capek" is in the argument list, use the real backend, otherwise use the mock backend through docker
if [[ " $@ " =~ " no-capek " ]]; then
    export NO_CAPEK=true
else
    export NO_CAPEK=false
fi


# If "no-capek" is in the argument list, use the real backend, otherwise use the mock backend through docker
if [[ " $@ " =~ " no-persist " ]]; then
    export NO_PERSIST=true
else
    export NO_PERSIST=false
fi

# If "real" is in the argument list, use the real backend, otherwise use the mock backend through docker
if [[ " $@ " =~ " real " ]]; then
    export BACKEND_SEND_URL=http://host.docker.internal
    export BACKEND_RECEIVE_URL=http://host.docker.internal
else
    export BACKEND_SEND_URL=http://host.docker.internal
    export BACKEND_RECEIVE_URL=http://host.docker.internal
    # Spawn the mock server and save its pid for termination later
    cd mock_server
    cargo build --release
    ./target/release/mock_server &
    serverPID=$(ps -ef | grep 'mock_server' | grep -v 'grep' | awk '{ printf $2 }')
    sleep 2
    cd ..
fi

# if "no-elect" disable elections through an environment variable
if [[ " $@ " =~ " no-elect " ]]; then
    export NO_ELECT=true
else 
    export NO_ELECT=false
fi

if [ -z "$1" ]
then
    echo "No argument supplied"
    exit 1
fi

# Send receive requests to the server to initialise connections
for i in {0..$1..1}
do
    curl -X GET -H "Content-Type: application/json" 127.0.0.1:8080/v1/receive/$i
done

for i in {0..$1..1}
do
    # If "real" is in the argument list, set the BACKEND_SEND_PORT to 8080+$i and BACKEND_RECEIVE_PORT to 8080+$i+$1+1 (if $i = 0 overlap can occur without +1)
    if [[ " $@ " =~ " real " ]]; then
        export BACKEND_SEND_PORT=$((8080+$i*2))
        export BACKEND_RECEIVE_PORT=$((8080+$i*2+1))
        # Spawn backend REST endpoints for sending
        docker run -d -it --rm --name signal-cli-rest-api-$i-send \
            -e MODE=normal \
            -p $BACKEND_SEND_PORT:8080 \
            -v "$(pwd)"/signal-cli-config-$(($i*2)):/home/.local/share/signal-cli \
            bbernhard/signal-cli-rest-api:0.116-dev
        # Spawn backend REST endpoints for receiving
        docker run -d -it --rm --name signal-cli-rest-api-$i-receive \
            -e MODE=normal \
            -p $BACKEND_RECEIVE_PORT:8080 \
            -v "$(pwd)"/signal-cli-config-$(($i*2+1)):/home/.local/share/signal-cli \
            bbernhard/signal-cli-rest-api:0.116-dev

        # Set USER_NUMBER
        if [ $i -eq 0 ]; then
            export USER_NUMBER="+4571678076"
        elif [ $i -eq 1 ]; then
            export USER_NUMBER="+4571680459"
        elif [ $i -eq 2 ]; then
            export USER_NUMBER="+4571683659"
        elif [ $i -eq 3 ]; then
            export USER_NUMBER="+4571679451"
        elif [ $i -eq 4 ]; then
            export USER_NUMBER="+4571683381"
        elif [ $i -eq 5 ]; then
            export USER_NUMBER="+4571662267"
        elif [ $i -eq 6 ]; then
            export USER_NUMBER="+4571659403"
        elif [ $i -eq 7 ]; then
            export USER_NUMBER="+4571654937"
        elif [ $i -eq 8 ]; then
            export USER_NUMBER="+4571657961"
        elif [ $i -eq 9 ]; then
            export USER_NUMBER="+4571655512"
        fi
        # If USER_NUMBER is not set, report an error and exit
        if [ -z "$USER_NUMBER" ]
        then
            echo "USER_NUMBER not set"
            exit 1
        fi

        sleep 5

        ./receive.sh $BACKEND_SEND_PORT $USER_NUMBER
        ./receive.sh $BACKEND_RECEIVE_PORT $USER_NUMBER
    fi
done

for i in {0..$1..1}
do
    # if $i == $1 daemon flag enabled otherwise disabled
    if [ $i -ne $1 ]
    then
        DAEMON="-d"
    else
        DAEMON="" # Make "" if you want the last docker instance to attach to TTY. 
    fi
    # If "real" is in the argument list, set the BACKEND_SEND_PORT to 8080+$i and BACKEND_RECEIVE_PORT to 8080+$i+$1+1 (if $i = 0 overlap can occur without +1)
    if [[ " $@ " =~ " real " ]]; then
        export BACKEND_SEND_PORT=$((8080+$i*2))
        export BACKEND_RECEIVE_PORT=$((8080+$i*2+1))

        # Set USER_NUMBER
        if [ $i -eq 0 ]; then
            export USER_NUMBER="+4571678076"
        elif [ $i -eq 1 ]; then
            export USER_NUMBER="+4571680459"
        elif [ $i -eq 2 ]; then
            export USER_NUMBER="+4571683659"
        elif [ $i -eq 3 ]; then
            export USER_NUMBER="+4571679451"
        elif [ $i -eq 4 ]; then
            export USER_NUMBER="+4571683381"
        elif [ $i -eq 5 ]; then
            export USER_NUMBER="+4571662267"
        elif [ $i -eq 6 ]; then
            export USER_NUMBER="+4571659403"
        elif [ $i -eq 7 ]; then
            export USER_NUMBER="+4571654937"
        elif [ $i -eq 8 ]; then
            export USER_NUMBER="+4571657961"
        elif [ $i -eq 9 ]; then
            export USER_NUMBER="+4571655512"
        fi
        # If USER_NUMBER is not set, report an error and exit
        if [ -z "$USER_NUMBER" ]
        then
            echo "USER_NUMBER not set"
            exit 1
        fi
    else
        export BACKEND_SEND_PORT=8080
        export BACKEND_RECEIVE_PORT=8080
        export USER_NUMBER=$i
    fi
    export SIGNAL_BOT_ID=$i

    echo "Starting bot $i"
    docker run --add-host=host.docker.internal:host-gateway $DAEMON -it --rm \
        --env BENCHMARK \
        --env NO_ELECT \
        --env ONLINE \
        --env BACKEND_SEND_URL \
        --env BACKEND_SEND_PORT \
        --env BACKEND_RECEIVE_URL \
        --env BACKEND_RECEIVE_PORT \
        --env BOTPATH \
        --env SIGNAL_BOT_ID \
        --env USER_NUMBER \
        --env NO_CAPEK \
        --env NO_OF_BOTS \
        --env BENCHMARK_BOT \
        --env BENCHMARK_NAME \
        --env NO_PERSIST \
        --env HEARTBEAT_INTERVAL \
        --env ELECTION_INTERVAL \
        --volume $DIRECTORY/benchmarks/results:/app/benchmarks/results \
        --name signal-bot-$i signal-bot

done

echo "Stopping the dockerised components"
docker kill $(docker ps -q)
sleep 5

if [[ " $@ " =~ " real " ]]; then
    echo "Done"
else
    echo "Stopping the server"
    kill $serverPID
    echo "Done"
fi