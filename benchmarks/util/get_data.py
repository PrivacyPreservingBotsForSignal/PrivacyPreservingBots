import os
import pandas as pd


def get_data(script_name: str) -> pd.DataFrame:
    # Get current directory
    path = os.path.abspath(__file__).rsplit('/', 1)[0]
    # Load the data from the CSV file into a pandas DataFrame
    data = pd.read_csv(f'{path}/../results/{script_name}.csv')

    return data
