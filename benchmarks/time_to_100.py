import os
import matplotlib.pyplot as plt
from util.save_fig import save_fig
from util.get_data import get_data


script_name = os.path.basename(__file__)[:-3]
script_name_capek = script_name + '_capek'
script_name_capek_no_persist = script_name + '_capek_no_persist'
script_name_non_capek = script_name + '_non_capek'

capek_data = get_data(script_name_capek)
capek_no_persist_data = get_data(script_name_capek_no_persist)
non_capek_data = get_data(script_name_non_capek)

# Create a line plot
plt.plot(capek_data['no_of_bots'], capek_data['time_to_100'].div(1000), label='Capek')
plt.plot(capek_no_persist_data['no_of_bots'], capek_no_persist_data['time_to_100'].div(1000), label='Capek (w/o persist)')
plt.plot(non_capek_data['no_of_bots'], non_capek_data['time_to_100'].div(1000), label='Non-Capek')

# Add a title and axis labels
plt.title('Time to counter = 100 for different number of bots')
plt.xlabel('Number of bots')
plt.ylabel('Execution Time (seconds)')

plt.legend()


save_fig(plt, script_name)
