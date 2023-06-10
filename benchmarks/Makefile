all: plot

plot:
	@echo "Removing old plots..."
	@rm -rf ./plots
	@echo "Plotting results..."
	@python3 time_to_100.py
	@python3 roundrobin_signal_vs_mock.py
	@python3 election.py
	@python3 signal-vs-mock-time-to-100.py
	@python3 heartbeat_breakdown.py