import os
import matplotlib.pyplot as plt
from util.save_fig import save_fig
from util.get_data import get_data


def gen_deltas(start, end, step):
    res = [end - i for i in range(start, end+1, step)]
    return res


script_name = os.path.basename(__file__)[:-3]
script_name_1000_2000_50 = script_name + '_1000_2000_50'
script_name_500_1000_25 = script_name + '_500_1000_25'
script_name_250_500_10 = script_name + '_250_500_10'

_1000_2000_50_data = get_data(script_name_1000_2000_50)
_500_1000_25_data = get_data(script_name_500_1000_25)
_250_500_10_data = get_data(script_name_250_500_10)

# Create a line plot
plt.plot(gen_deltas(1000, 2000, 50),
         _1000_2000_50_data['time_to_100'].div(1000), label='B:2000 E:1000 S:50')
plt.plot(gen_deltas(500, 1000, 25),
         _500_1000_25_data['time_to_100'].div(1000), label='B:1000 E:500 S:25')
plt.plot(gen_deltas(250, 500, 10),
         _250_500_10_data['time_to_100'].div(1000), label='B:500 E:250 S:10')

# Add a title and axis labels
plt.title('Heartbeat Breakdown (B: Beginning, E: End, S: Step))')
plt.xlabel('Delta (ms)')
plt.ylabel('Execution Time (seconds)')

plt.legend()


save_fig(plt, script_name)
