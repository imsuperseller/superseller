import * as XLSX from 'xlsx';
import { FamilyMember, Policy } from '../index';

export async function processFamilyFiles(files: File[]): Promise<FamilyMember[]> {
  const familyMembers: FamilyMember[] = [];

  for (const file of files) {
    try {
      const member = await processSingleFile(file);
      familyMembers.push(member);
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(`Failed to process ${file.name}: ${error}`);
    }
  }

  return familyMembers;
}

async function processSingleFile(file: File): Promise<FamilyMember> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON with Hebrew support
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Extract member name from filename (Hebrew)
  const memberName = extractMemberName(file.name);
  
  const policies: Policy[] = [];
  let totalPremium = 0;
  const insuranceTypes = new Set<string>();
  
  // Process each row starting from row 5 (where actual data begins)
  for (let i = 5; i < data.length; i++) {
    const row = data[i] as any[];
    
    // Skip empty rows
    if (!row || !row[0] || String(row[0]).trim() === '') {
      continue;
    }
    
    // Extract policy data
    const policy = extractPolicyData(row);
    if (policy) {
      policies.push(policy);
      totalPremium += policy.premium;
      insuranceTypes.add(policy.type);
    }
  }
  
  return {
    name: memberName,
    policies,
    totalPremium,
    insuranceTypes: Array.from(insuranceTypes)
  };
}

function extractMemberName(filename: string): string {
  // Extract Hebrew name from filename
  // Example: "עמית הר ביטוח 05.08.25.xlsx" -> "עמית הר"
  const nameMatch = filename.match(/^([\u0590-\u05FF\s]+)/);
  return nameMatch ? nameMatch[1].trim() : 'Unknown Member';
}

function extractPolicyData(row: any[]): Policy | null {
  try {
    const id = String(row[0] || '').trim();
    if (!id) return null;
    
    // Extract insurance type from column 1 (ענף ראשי) or column 2 (ענף משני)
    let type = 'כללי';
    if (row[1] && String(row[1]).trim()) {
      type = String(row[1]).trim();
    } else if (row[2] && String(row[2]).trim()) {
      type = String(row[2]).trim();
    }
    
    // Extract premium from column 7 (פרמיה בש"ח)
    let premium = 0;
    if (row[7] && !isNaN(Number(row[7]))) {
      premium = Number(row[7]);
    }
    
    // Extract additional details
    const details: Record<string, any> = {};
    if (row[3]) details.company = String(row[3]);
    if (row[4]) details.policyNumber = String(row[4]);
    if (row[5]) details.startDate = String(row[5]);
    if (row[6]) details.endDate = String(row[6]);
    if (row[8]) details.coverage = String(row[8]);
    if (row[9]) details.notes = String(row[9]);
    
    return {
      id,
      type,
      premium,
      details
    };
  } catch (error) {
    console.error('Error extracting policy data:', error);
    return null;
  }
}
