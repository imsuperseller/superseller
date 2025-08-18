import { FamilyMember, FamilyProfile } from '../index';

export async function createFamilyProfile(members: FamilyMember[]): Promise<FamilyProfile> {
  // Calculate totals
  const totalPolicies = members.reduce((sum, member) => sum + member.policies.length, 0);
  const totalPremium = members.reduce((sum, member) => sum + member.totalPremium, 0);
  
  // Collect all insurance types
  const allInsuranceTypes = new Set<string>();
  members.forEach(member => {
    member.insuranceTypes.forEach(type => allInsuranceTypes.add(type));
  });
  
  // Determine family name from first member
  const familyName = members.length > 0 ? extractFamilyName(members[0].name) : 'משפחה';
  
  return {
    familyName,
    members,
    totalPolicies,
    totalPremium,
    allInsuranceTypes: Array.from(allInsuranceTypes),
    generatedAt: new Date()
  };
}

function extractFamilyName(memberName: string): string {
  // Extract family name from member name
  // Example: "עמית הר" -> "הר"
  const parts = memberName.split(' ');
  return parts.length > 1 ? parts[parts.length - 1] : memberName;
}
