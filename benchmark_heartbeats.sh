#!/usr/bin/env zsh

export BOTPATH=./src/CapekScript/Examples/timeCounter
export NUMBER_OF_HEARTBEATS_BEFORE_ELECTION="-1"

##############################################

export BENCHMARK_NAME="heartbeat_breakdown_1000_2000_50"

export HEARTBEAT_INTERVAL=1000
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
echo "no_of_bots,time_to_100" > ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

for i in {0..20..1}
do  
    export ELECTION_INTERVAL=$((2000 - $i*50))
    echo "Election interval: $ELECTION_INTERVAL"
    ./benchmark.sh 2
    rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
done

mv -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv ./benchmarks/results/heartbeat_breakdown_1000_2000_50.csv

##############################################

export BENCHMARK_NAME="heartbeat_breakdown_500_1000_25"

export HEARTBEAT_INTERVAL=500
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
echo "no_of_bots,time_to_100" > ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

for i in {0..20..1}
do  
    export ELECTION_INTERVAL=$((1000 - $i*25))
    echo "Election interval: $ELECTION_INTERVAL"
    ./benchmark.sh 2
    rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
done

mv -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv ./benchmarks/results/heartbeat_breakdown_500_1000_25.csv

##############################################

export BENCHMARK_NAME="heartbeat_breakdown_250_500_10"

export HEARTBEAT_INTERVAL=250
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
echo "no_of_bots,time_to_100" > ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

for i in {0..25..1}
do  
    export ELECTION_INTERVAL=$((500 - $i*10))
    echo "Election interval: $ELECTION_INTERVAL"
    ./benchmark.sh 2
    rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
done

mv -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv ./benchmarks/results/heartbeat_breakdown_250_500_10.csv

##############################################
