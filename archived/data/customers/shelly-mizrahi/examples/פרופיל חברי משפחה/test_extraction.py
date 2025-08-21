import pandas as pd
import os

def test_file_extraction(filename):
    print(f"\n📊 Testing file: {filename}")
    
    try:
        df = pd.read_excel(filename, header=None)
        print(f"📋 File shape: {df.shape}")
        
        file_policies = 0
        file_premium = 0
        insurance_types = []
        
        # Process each row starting from row 5 (where actual data begins)
        for idx, row in df.iterrows():
            if idx < 5:  # Skip header rows
                continue
            
            # Check if this row has actual data (ID should be present)
            if pd.isna(row[0]) or str(row[0]).strip() == '':
                continue
            
            # Count this as one policy
            file_policies += 1
            
            # Extract premium from column 7 (פרמיה בש"ח)
            premium = 0.0
            if not pd.isna(row[7]) and str(row[7]).strip() != '':
                try:
                    premium = float(row[7])
                except (ValueError, TypeError):
                    premium = 0.0
            
            file_premium += premium
            
            # Extract insurance type from column 1 (ענף ראשי) or column 2 (ענף משני)
            insurance_type = 'כללי'
            if not pd.isna(row[1]) and str(row[1]).strip() != '':
                insurance_type = str(row[1]).strip()
            elif not pd.isna(row[2]) and str(row[2]).strip() != '':
                insurance_type = str(row[2]).strip()
            
            if insurance_type not in insurance_types:
                insurance_types.append(insurance_type)
        
        print(f"📈 Extracted: Policies: {file_policies}, Premium: {file_premium}, Types: {insurance_types}")
        return file_policies, file_premium, insurance_types
        
    except Exception as e:
        print(f"❌ Error processing file: {e}")
        return 0, 0, []

# Test all files
files = [
    'עמית הר ביטוח 05.08.25.xlsx',
    'יונתן הר ביטוח 04.08.25.xlsx', 
    'אנה הר ביטוח 05.08.25.xlsx',
    'אליסה הר ביטוח 04.08.25.xlsx',
    'איתן הר ביטוח 05.08.25.xlsx'
]

total_policies = 0
total_premium = 0
all_types = []

for file in files:
    policies, premium, types = test_file_extraction(file)
    total_policies += policies
    total_premium += premium
    all_types.extend(types)

print(f"\n🎯 TOTAL: Policies: {total_policies}, Premium: {total_premium}, Types: {list(set(all_types))}")
