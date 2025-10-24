// app/api/test/asana/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📦 Raw Asana data received');

    // Process fields by their names since they're consistent
    const fieldMap: any = {};
    
    body.data.forEach((field: any) => {
      const customField = field.custom_field;
      const fieldName = customField.name;
      
      fieldMap[fieldName] = {
        id: customField.gid,
        type: customField.resource_subtype,
        options: customField.enum_options ? customField.enum_options.map((opt: any) => ({
          id: opt.gid,
          name: opt.name,
          color: opt.color
        })) : null
      };
    });

    console.log('🔄 Processed field map:', fieldMap);

    // Return organized data that Make can use easily
    return NextResponse.json({ 
      success: true,
      fields: fieldMap,
      // Also return as array for different use cases
      fieldArray: Object.keys(fieldMap).map(name => ({
        name,
        ...fieldMap[name]
      })),
      // Quick access to specific field IDs
      fieldIds: {
        companyInfo: fieldMap['Company Info']?.id,
        voiceAIConfig: fieldMap['Voice AI Configuration']?.id,
        crmPlatform: fieldMap['CRM Platform']?.id,
        status: fieldMap['Status']?.id
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