import os
import matplotlib.pyplot as plt
from util.save_fig import save_fig
from util.get_data import get_data


script_name = os.path.basename(__file__)[:-3]
script_name_signal = script_name + '_signal'
script_name_mock = script_name + '_mock'

signal_data = get_data(script_name_signal)
mock_data = get_data(script_name_mock)

# Create a line plot
plt.plot(signal_data['count'], signal_data['time'].div(1000), label='Signal')
plt.plot(mock_data['count'], mock_data['time'].div(1000), label='Mock')

# Add a title and axis labels
plt.title('Signal vs Mock (3 bots, roundrobin to counter = 100)')
plt.xlabel('Counter')
plt.ylabel('Time (seconds)')

plt.legend()


save_fig(plt, script_name)
