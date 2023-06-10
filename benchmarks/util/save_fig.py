
import os


def save_fig(plt, script_name: str):
    # Get current directory
    path = os.path.abspath(__file__).rsplit('/', 1)[0]

    # Make directory if it doesn't exist
    if not os.path.exists(f'{path}/../plots'):
        os.makedirs(f'{path}/../plots')

    # save the plot
    plt.savefig(f'{path}/../plots/{script_name}.svg')
    plt.savefig(f'{path}/../plots/{script_name}.png')
