import pandas as pd

# Load the CSV file
file_path = "Expanded_Patient_Feedback_Dataset_with_Updates.csv"  # Replace with the path to your CSV file
df = pd.read_csv(file_path)

# Get distinct values for each column
distinct_values = {
    "Sex": df["Sex"].dropna().unique().tolist(),
    "Ethnicity": df["Ethnicity"].dropna().unique().tolist(),
    "Category": df["Category"].dropna().unique().tolist(),
    "Subcategory": df["Subcategory"].dropna().unique().tolist(),
}

# Display the distinct values
for column, values in distinct_values.items():
    print(f"Distinct {column}: {values}")
