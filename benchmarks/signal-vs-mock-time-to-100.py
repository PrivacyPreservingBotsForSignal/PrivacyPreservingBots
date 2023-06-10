import os
import matplotlib.pyplot as plt
from util.save_fig import save_fig
from util.get_data import get_data


script_name = os.path.basename(__file__)[:-3]
script_name_mock = script_name + '_mock'
script_name_signal = script_name + '_signal'

mock_data = get_data(script_name_mock)
signal_data = get_data(script_name_signal)

# Create a line plot
plt.plot(mock_data['no_of_bots'], mock_data['time_to_100'].div(1000), label='Mock')
plt.plot(signal_data['no_of_bots'], signal_data['time_to_100'].div(1000), label='Signal')

# Add a title and axis labels
plt.title('Time to counter = 100 for different number of bots')
plt.xlabel('Number of bots')
plt.ylabel('Execution Time (seconds)')

plt.legend()


save_fig(plt, script_name)
