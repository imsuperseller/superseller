import { NextRequest, NextResponse } from 'next/server';
import { processFamilyFiles } from './utils/excel-processor';
import { generateFamilyReport } from './utils/report-generator';
import { validateFiles } from './utils/file-validator';
import { createFamilyProfile } from './utils/profile-creator';

export interface FamilyMember {
  name: string;
  policies: Policy[];
  totalPremium: number;
  insuranceTypes: string[];
}

export interface Policy {
  id: string;
  type: string;
  premium: number;
  details: Record<string, string | number | boolean>;
}

export interface FamilyProfile {
  familyName: string;
  members: FamilyMember[];
  totalPolicies: number;
  totalPremium: number;
  allInsuranceTypes: string[];
  generatedAt: Date;
  reportUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Validate files
    const validation = await validateFiles(files);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Process family files
    const familyMembers = await processFamilyFiles(files);
    
    // Create family profile
    const familyProfile = await createFamilyProfile(familyMembers);
    
    // Generate comprehensive report
    const reportUrl = await generateFamilyReport(familyProfile);
    familyProfile.reportUrl = reportUrl;

    return NextResponse.json({
      success: true,
      familyProfile,
      message: 'Family profile processed successfully'
    });

  } catch (error) {
    console.error('Excel processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process family files' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    agent: 'Shelly Mizrahi Excel Family Profile Processor',
    version: '1.0.0',
    description: 'Processes individual family member Excel files and combines them into a comprehensive family profile',
    features: [
      'Hebrew text support',
      'Multiple file processing',
      'Policy extraction and analysis',
      'Premium calculation',
      'Insurance type categorization',
      'Comprehensive reporting',
      'Family profile generation'
    ]
  });
}
