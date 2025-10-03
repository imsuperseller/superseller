import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const airtableApiKey = process.env.AIRTABLE_API_KEY;
    const baseId = 'app4nJpP1ytGukXQT';
    
    if (!airtableApiKey) {
      throw new Error('AIRTABLE_API_KEY not configured');
    }

    // Fetch contacts from Airtable
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/Contacts?maxRecords=100`,
      {
        headers: {
          'Authorization': `Bearer ${airtableApiKey}`,
        },
      }
    );
    
    const data = await response.json();
    
    // Transform Airtable data to user format with real business logic
    const users = data.records.map((record: any, index: number) => {
      const fields = record.fields;
      const contactType = fields['Contact Type'];
      const role = fields.Role;
      
      // Determine real role based on contact type and role
      let userRole = 'viewer';
      if (contactType === 'Team Member') {
        userRole = role === 'Support Team' || role === 'Development Team' ? 'admin' : 'user';
      } else if (contactType === 'Customer') {
        userRole = 'customer';
      } else if (contactType === 'Partner') {
        userRole = 'partner';
      }
      
      // Determine real status
      let status = 'inactive';
      if (fields.Status === 'Active') {
        status = 'active';
      } else if (fields.Status === 'Lead') {
        status = 'trial';
      }
      
      // Calculate real project count based on linked projects
      const projectCount = fields['Linked Projects'] ? 
        (typeof fields['Linked Projects'] === 'string' ? 
          fields['Linked Projects'].split(',').length : 
          fields['Linked Projects'].length) : 0;
      
      return {
        id: record.id,
        name: fields.Name || 'Unknown User',
        email: fields.Email || `${fields.Name?.toLowerCase().replace(/\s+/g, '.')}@rensto.com`,
        role: userRole,
        status: status,
        lastLogin: fields['Last Contact Date'] || fields['Last Updated'] || new Date().toISOString(),
        createdAt: fields['Created Date'] || new Date().toISOString(),
        projects: projectCount,
        company: fields.Company || 'Rensto',
        contactType: contactType || 'Customer',
        priority: fields.Priority || 'Medium',
        engagementScore: fields['Engagement Score'] || 0,
        totalInteractions: fields['Total Interactions'] || 0
      };
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
