export interface TemplateParams {
  company: string;
  voice_ai_name: string;
  hue_line_url: string;
  transfer_to: string;
}

export interface TemplateResult {
  download_url: string;
  s3_key: string;
  message: string;
}

export async function generateProjectTemplate(params: TemplateParams): Promise<TemplateResult> {
  const AWS_TEMPLATE_BUILDER_URL = "https://tfojpgtvud.execute-api.us-east-1.amazonaws.com/prod/build";

  try {
    const response = await fetch(AWS_TEMPLATE_BUILDER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company: params.company,
        voice_ai_name: params.voice_ai_name,
        hue_line_url: params.hue_line_url,
        transfer_to: params.transfer_to
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Template builder API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    // Handle both direct response and nested body
    if (result.body) {
      const body = JSON.parse(result.body);
      return body;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Failed to generate project template:', error);
    throw error;
  }
}