import { NextResponse } from 'next/server';

// Best practice: Move this to your .env file later (e.g., process.env.WEBHOOK_SECRET)


export async function POST(req: Request) {
    // 1. Verify the webhook secret
    const WEBHOOK_SECRET = process.env.LAMBDA_WEBHOOK_SECRET
    const authHeader = req.headers.get('x-webhook-secret');

    if (authHeader !== WEBHOOK_SECRET) {
        return NextResponse.json(
            { error: 'Unauthorized' }, 
            { status: 401 }
        );
    }

    // 2. Parse the body safely
    try {
        const body = await req.json();
        console.log("Webhook Body:", body);

        // TODO: Add your business logic here (e.g., save to database, trigger events)

        // 3. Return a success response
        return NextResponse.json(
            { success: true, message: 'Webhook processed successfully' }, 
            { status: 200 }
        );

    } catch (error) {
        console.error("Error parsing webhook JSON:", error);
        
        // Return a 400 Bad Request if the JSON is invalid
        return NextResponse.json(
            { error: 'Invalid JSON payload' }, 
            { status: 400 }
        );
    }
}

