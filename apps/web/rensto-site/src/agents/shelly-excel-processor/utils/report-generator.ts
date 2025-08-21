import { FamilyProfile } from '../index';
import fs from 'fs/promises';
import path from 'path';

export async function generateFamilyReport(familyProfile: FamilyProfile): Promise<string> {
  const reportId = `family-report-${Date.now()}`;
  const reportDir = path.join(process.cwd(), 'public', 'reports');
  
  // Ensure reports directory exists
  await fs.mkdir(reportDir, { recursive: true });
  
  const reportPath = path.join(reportDir, `${reportId}.html`);
  const reportContent = generateHTMLReport(familyProfile);
  
  await fs.writeFile(reportPath, reportContent, 'utf-8');
  
  return `/reports/${reportId}.html`;
}

function generateHTMLReport(familyProfile: FamilyProfile): string {
  const totalMembers = familyProfile.members.length;
  const totalPolicies = familyProfile.totalPolicies;
  const totalPremium = familyProfile.totalPremium;
  
  return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>פרופיל ביטוחי משפחתי - ${familyProfile.familyName}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2F6A92 0%, #FF6536 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        .summary-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .summary-card h3 {
            margin: 0 0 10px 0;
            color: #2F6A92;
        }
        .summary-card .value {
            font-size: 2em;
            font-weight: bold;
            color: #FF6536;
        }
        .members {
            padding: 30px;
        }
        .member-card {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        .member-header {
            background: #2F6A92;
            color: white;
            padding: 15px 20px;
            font-size: 1.2em;
            font-weight: bold;
        }
        .member-content {
            padding: 20px;
        }
        .policies {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .policy-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #FF6536;
        }
        .policy-type {
            font-weight: bold;
            color: #2F6A92;
        }
        .policy-premium {
            color: #FF6536;
            font-weight: bold;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #666;
            border-top: 1px solid #e9ecef;
        }
        @media print {
            body { background: white; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>פרופיל ביטוחי משפחתי</h1>
            <p>נוצר ב-${familyProfile.generatedAt.toLocaleDateString('he-IL')}</p>
        </div>
        
        <div class="summary">
            <div class="summary-card">
                <h3>מספר חברי משפחה</h3>
                <div class="value">${totalMembers}</div>
            </div>
            <div class="summary-card">
                <h3>סה"כ פוליסות</h3>
                <div class="value">${totalPolicies}</div>
            </div>
            <div class="summary-card">
                <h3>סה"כ פרמיה שנתית</h3>
                <div class="value">₪${totalPremium.toLocaleString('he-IL')}</div>
            </div>
            <div class="summary-card">
                <h3>סוגי ביטוח</h3>
                <div class="value">${familyProfile.allInsuranceTypes.length}</div>
            </div>
        </div>
        
        <div class="members">
            <h2>פירוט חברי המשפחה</h2>
            ${familyProfile.members.map(member => `
                <div class="member-card">
                    <div class="member-header">
                        ${member.name} - ${member.policies.length} פוליסות
                    </div>
                    <div class="member-content">
                        <p><strong>סה"כ פרמיה:</strong> ₪${member.totalPremium.toLocaleString('he-IL')}</p>
                        <p><strong>סוגי ביטוח:</strong> ${member.insuranceTypes.join(', ')}</p>
                        
                        <div class="policies">
                            ${member.policies.map(policy => `
                                <div class="policy-card">
                                    <div class="policy-type">${policy.type}</div>
                                    <div class="policy-premium">₪${policy.premium.toLocaleString('he-IL')}</div>
                                    <small>מזהה: ${policy.id}</small>
                                    ${policy.details.company ? `<br><small>חברה: ${policy.details.company}</small>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>דוח זה נוצר אוטומטית על ידי מערכת Rensto עבור Shelly Mizrahi Consulting</p>
            <p>תאריך יצירה: ${familyProfile.generatedAt.toLocaleString('he-IL')}</p>
        </div>
    </div>
</body>
</html>
  `;
}
