import { NextRequest, NextResponse } from 'next/server';
import { 
  markFeeAsPaid, 
  markWorkCompleted, 
  markDemoApproved, 
  markJobCompleted 
} from '@/lib/handlers/client-status-handler';

export async function POST(request: NextRequest) {
  try {
    const { email, stage } = await request.json();

    if (!email || !stage) {
      return NextResponse.json(
        { error: 'Email and stage are required' },
        { status: 400 }
      );
    }

    let result;
    
    switch (stage) {
      case 'FEE_PAID':
        result = await markFeeAsPaid(email);
        break;
      case 'WORK_COMPLETED':
        result = await markWorkCompleted(email);
        break;
      case 'DEMO_APPROVED':
        result = await markDemoApproved(email);
        break;
      case 'JOB_COMPLETED':
        result = await markJobCompleted(email);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid stage' },
          { status: 400 }
        );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating stage:', error);
    return NextResponse.json(
      { error: 'Failed to update stage' },
      { status: 500 }
    );
  }
}