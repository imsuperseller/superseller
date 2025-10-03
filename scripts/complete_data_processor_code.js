// Optimized Insurance Data Processor for Svix Webhook
const items = $input.all();
const processedItems = [];

for (const item of items) {
  const webhookData = item.json;
  // Fix: Correctly extract data from the nested structure (updated for 6-level payload format)
  const leadData = webhookData.body.body.body.body.body.body.data || webhookData.body.body.body.body.body.data || webhookData.body.body.body.body.data || webhookData.body.body.body.data || webhookData.body.body.data || webhookData.body.data || webhookData.body || {};
  
  // Process and enrich the lead data
  const profile = {
    // Basic Information
    id: leadData.customerId || leadData.leadId || leadData.id || `lead-${Date.now()}`,
    fullName: `${leadData.firstName || ''} ${leadData.lastName || ''}`.trim() || 'Unknown',
    age: leadData.age || 35,
    city: leadData.city || 'Unknown',
    street: leadData.street || '',
    
    // Contact Information
    email: leadData.email || '',
    phone: cleanPhoneNumber(leadData.phoneNumber1 || leadData.phone || leadData.phoneNumber || ''),
    
    // Financial Information
    income: parseIncome(leadData.monthlyIncome || leadData.income || 15000),
    familySize: leadData.childCount || leadData.familySize || 1,
    profession: leadData.profession || 'עובד',
    
    // Webhook Metadata
    eventType: webhookData.body.body.body.body.body.body.eventType || webhookData.body.body.body.body.body.eventType || webhookData.body.body.body.body.eventType || webhookData.body.body.body.eventType || webhookData.body.body.eventType || webhookData.body.eventType,
    receivedAt: new Date().toISOString(),
    
    // Processed Fields
    dataQuality: calculateDataQuality(leadData),
    riskFactors: [],
    insuranceNeeds: [],
    priority: 'medium',
    familyId: generateFamilyId(leadData)
  };
  
  // Calculate risk factors and insurance needs
  calculateRiskProfile(profile);
  
  processedItems.push(profile);
}

// Helper functions
function cleanPhoneNumber(phone) {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('0')) {
    return '+972-' + cleaned.substring(1, 3) + '-' + cleaned.substring(3, 6) + '-' + cleaned.substring(6);
  }
  return cleaned;
}

function parseIncome(income) {
  if (typeof income === 'number') return income;
  if (typeof income === 'string') {
    const parsed = parseInt(income.replace(/[^0-9]/g, ''));
    return isNaN(parsed) ? 15000 : parsed;
  }
  return 15000;
}

function calculateDataQuality(data) {
  const fields = ['firstName', 'lastName', 'email', 'phoneNumber1', 'age', 'monthlyIncome', 'city'];
  const filledFields = fields.filter(field => data[field] && data[field] !== '');
  return Math.round((filledFields.length / fields.length) * 100);
}

function generateFamilyId(data) {
  const name = `${data.firstName || ''} ${data.lastName || ''}`.replace(/[^a-zA-Z0-9]/g, '');
  const phone = (data.phoneNumber1 || '').replace(/[^0-9]/g, '');
  return `${name}-${phone}-${Date.now()}`.substring(0, 20);
}

function calculateRiskProfile(profile) {
  // Age-based risk factors
  if (profile.age < 30) {
    profile.riskFactors.push('young_adult');
    profile.insuranceNeeds.push('life_insurance', 'disability_insurance');
  } else if (profile.age > 50) {
    profile.riskFactors.push('senior_citizen');
    profile.insuranceNeeds.push('health_insurance', 'long_term_care');
    profile.priority = 'high';
  }
  
  // Income-based factors
  if (profile.income > 20000) {
    profile.riskFactors.push('high_income');
    profile.insuranceNeeds.push('comprehensive_coverage');
    profile.priority = 'high';
  }
  
  // Family size factors
  if (profile.familySize > 3) {
    profile.riskFactors.push('large_family');
    profile.insuranceNeeds.push('family_insurance', 'education_savings');
    profile.priority = 'high';
  }
  
  // Calculate risk score
  profile.riskScore = Math.min(profile.riskFactors.length * 2, 10);
}

return processedItems;
