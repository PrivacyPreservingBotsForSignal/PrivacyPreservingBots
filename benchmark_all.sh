#!/usr/bin/env zsh

export BOTPATH=./src/CapekScript/Examples/roundrobin

##############################################

export BENCHMARK_NAME="roundrobin_signal_vs_mock_mock"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo 'count,time' > ./benchmarks/results/$BENCHMARK_NAME-counter.csv

./benchmark.sh 2
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

mv -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv ./benchmarks/results/roundrobin_signal_vs_mock_mock.csv

##############################################

export BENCHMARK_NAME="roundrobin_signal_vs_mock_signal"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo 'count,time' > ./benchmarks/results/$BENCHMARK_NAME-counter.csv

./benchmark.sh 2 real
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

mv -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv ./benchmarks/results/roundrobin_signal_vs_mock_signal.csv

##############################################

export BENCHMARK_NAME="election_3"
export NUMBER_OF_HEARTBEATS_BEFORE_ELECTION=3

rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo 'count,time' > ./benchmarks/results/$BENCHMARK_NAME-counter.csv

./benchmark.sh 2
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

mv -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv ./benchmarks/results/election_3.csv


export NUMBER_OF_HEARTBEATS_BEFORE_ELECTION="-1"

# ##############################################

export BENCHMARK_NAME="election_3_disabled"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo 'count,time' > ./benchmarks/results/$BENCHMARK_NAME-counter.csv

./benchmark.sh 2 no-elect
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

mv -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv ./benchmarks/results/election_3_disabled.csv

##############################################

export BENCHMARK_NAME="election_50"
export NUMBER_OF_HEARTBEATS_BEFORE_ELECTION=3

rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo 'count,time' > ./benchmarks/results/$BENCHMARK_NAME-counter.csv

./benchmark.sh 49
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

mv -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv ./benchmarks/results/election_50.csv

export NUMBER_OF_HEARTBEATS_BEFORE_ELECTION="-1"

##############################################

export BENCHMARK_NAME="election_50_disabled"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo 'count,time' > ./benchmarks/results/$BENCHMARK_NAME-counter.csv

./benchmark.sh 49 no-elect
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

mv -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv ./benchmarks/results/election_50_disabled.csv

##############################################

export BENCHMARK_NAME="election_100"
export NUMBER_OF_HEARTBEATS_BEFORE_ELECTION=3

rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo 'count,time' > ./benchmarks/results/$BENCHMARK_NAME-counter.csv

./benchmark.sh 99
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

mv -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv ./benchmarks/results/election_100.csv

export NUMBER_OF_HEARTBEATS_BEFORE_ELECTION="-1"

##############################################

export BENCHMARK_NAME="election_100_disabled"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo 'count,time' > ./benchmarks/results/$BENCHMARK_NAME-counter.csv

./benchmark.sh 99 no-elect
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

mv -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv ./benchmarks/results/election_100_disabled.csv

##############################################

export BENCHMARK_NAME="signal-vs-mock-time-to-100-mock"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo "no_of_bots,time_to_100" > ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

for i in {1..9..1} 
do  
    echo $i
    ./benchmark.sh $i no-elect
    rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
done

mv -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv ./benchmarks/results/signal-vs-mock-time-to-100_mock.csv

##############################################

export BENCHMARK_NAME="signal-vs-mock-time-to-100-signal"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
echo "no_of_bots,time_to_100" > ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

for i in {1..9..1} 
do  
    echo $i
    ./benchmark.sh $i real no-elect
    rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
done

mv -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv ./benchmarks/results/signal-vs-mock-time-to-100_signal.csv

##############################################

export BENCHMARK_NAME="timeTo100For2To100Bots-non-capek"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
echo "no_of_bots,time_to_100" > ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

for i in {1..99..1} 
do  
    echo $i
    ./benchmark.sh $i no-capek no-elect
    rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
done

mv -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv ./benchmarks/results/time_to_100_non_capek.csv

##############################################

export BENCHMARK_NAME="timeTo100For2To100Bots-capek"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
echo "no_of_bots,time_to_100" > ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

for i in {1..99..1} 
do  
    echo $i
    ./benchmark.sh $i no-elect
    rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
done

mv -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv ./benchmarks/results/time_to_100_capek.csv

##############################################

export BENCHMARK_NAME="timeTo100For2To100Bots-capek-no-persist"
rm -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv
echo "no_of_bots,time_to_100" > ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv

for i in {1..99..1} 
do  
    echo $i
    ./benchmark.sh $i no-persist no-elect
    rm -f ./benchmarks/results/$BENCHMARK_NAME-counter.csv
done

mv -f ./benchmarks/results/$BENCHMARK_NAME-timeTo100.csv ./benchmarks/results/time_to_100_capek_no_persist.csv

##############################################

./benchmark_heartbeats.sh