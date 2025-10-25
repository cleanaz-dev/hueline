// app/api/test/asana/route.ts
import { NextResponse } from 'next/server';

interface EnumOption {
  gid: string;
  name: string;
  color: string;
}

interface CustomField {
  gid: string;
  name: string;
  resource_subtype: string;
  enum_options?: EnumOption[];
}

interface AsanaField {
  custom_field: CustomField;
}

interface FieldMapEntry {
  id: string;
  type: string;
  notStartedId?: string; // Just the first option ID
}

interface FieldMap {
  [key: string]: FieldMapEntry;
}

const apiKey = process.env.ASANA_MAKE_API_KEY;

export async function POST(request: Request) {
  try {
    // Check API key from header
    const authHeader = request.headers.get('x-api-key');
    
    if (!authHeader || authHeader !== apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
  
    // Process fields by their names since they're consistent
    const fieldMap: FieldMap = {};
    
    (body.data as AsanaField[]).forEach((field) => {
      const customField = field.custom_field;
      const fieldName = customField.name;
      
      fieldMap[fieldName] = {
        id: customField.gid,
        type: customField.resource_subtype,
        // Only grab first option ID (Not Started) for enum fields
        notStartedId: customField.enum_options?.[0]?.gid
      };
    });

    console.log('🔄 Processed field map:', JSON.stringify(fieldMap, null, 2));

    // Return organized data that Make can use easily
    return NextResponse.json({ 
      success: true,
      statusFieldId: fieldMap['Status']?.id,
      notStartedId: fieldMap['Status']?.notStartedId,
      // Quick access to specific field IDs
      fieldIds: {
        companyInfo: fieldMap['Company Info']?.id,
        voiceAIConfig: fieldMap['Voice AI Configuration']?.id,
        crmPlatform: fieldMap['CRM Platform']?.id,
        status: fieldMap['Status']?.id,
        notStarted: fieldMap['Status']?.notStartedId
      }
    });
    
  } catch (error) {
    console.error('❌ ERROR:', error);
    return NextResponse.json(
      { error: 'Failed to process data' },
      { status: 500 }
    );
  }
}