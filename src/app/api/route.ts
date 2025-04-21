import { NextResponse } from 'next/server';
import { configureIPv4 } from './ipv4';

export async function GET() {
  // Configure IPv4 preference
  configureIPv4();
  
  return NextResponse.json({
    status: 'ok',
    message: 'CraftsMatch API is running',
    timestamp: new Date().toISOString(),
  });
} 