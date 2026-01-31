import pandas as pd

df = pd.read_csv("data/dataset.csv")

print("\nCOLUMNS:\n", df.columns.tolist())
print("\nFIRST 5 ROWS:\n", df.head())
print("\nDATA TYPES:\n", df.dtypes)
