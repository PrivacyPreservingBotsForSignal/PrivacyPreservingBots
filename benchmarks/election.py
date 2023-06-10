import os
import matplotlib.pyplot as plt
from util.save_fig import save_fig
from util.get_data import get_data


script_name = os.path.basename(__file__)[:-3]
script_name_3 = script_name + '_3'
script_name_50 = script_name + '_50'
script_name_100 = script_name + '_100'
script_name_3_disabled = script_name + '_3_disabled'
script_name_50_disabled = script_name + '_50_disabled'
script_name_100_disabled = script_name + '_100_disabled'

_3_data = get_data(script_name_3)
_50_data = get_data(script_name_50)
_100_data = get_data(script_name_100)
_3_disabled_data = get_data(script_name_3_disabled)
_50_disabled_data = get_data(script_name_50_disabled)
_100_disabled_data = get_data(script_name_100_disabled)

# create a figure and three subplots for each bot
fig, (ax1, ax2, ax3) = plt.subplots(nrows=3, sharex=True, sharey=True)

# Set the spacing between subplots
fig.subplots_adjust(hspace=0.4)

# plot the data for each bot
ax1.plot(_3_data['time'].div(1000), _3_data['count'], label='Enabled')
ax1.plot(_3_disabled_data['time'].div(1000), _3_disabled_data['count'], label='Disabled')
ax1.set_title('3 Bots')
ax1.legend(loc='upper right')
ax2.plot(_50_data['time'].div(1000), _50_data['count'], label='Enabled')
ax2.plot(_50_disabled_data['time'].div(1000), _50_disabled_data['count'], label='Disabled')
ax2.set_title('50 Bots')
ax3.plot(_100_data['time'].div(1000), _100_data['count'], label='Enabled')
ax3.plot(_100_disabled_data['time'].div(1000), _100_disabled_data['count'], label='Disabled')
ax3.set_title('100 Bots')

# set the labels for the x and y axes
plt.xlabel('Time (seconds)')
plt.ylabel('Counter')


save_fig(plt, script_name)
