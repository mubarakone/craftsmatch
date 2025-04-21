// Force IPv4 for all API routes
import { type NextRequest, NextResponse } from 'next/server';

// Helper to ensure IPv4 connections for API routes
export const configureIPv4 = () => {
  // If running in a Node.js environment
  if (typeof process !== 'undefined') {
    // Set environment variables for IPv4 preference
    process.env.UV_THREADPOOL_SIZE = '64';
    process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --dns-result-order=ipv4first`;
    
    // Force Node.js to prefer IPv4
    if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === undefined) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    }
    
    // For databases, force IPv4
    process.env.PG_PREFER_IPV4 = 'true';
    
    // Set DNS lookup preference to IPv4 first globally
    if (typeof require !== 'undefined') {
      try {
        const dns = require('dns');
        if (dns && typeof dns.setDefaultResultOrder === 'function') {
          dns.setDefaultResultOrder('ipv4first');
        }
      } catch (e) {
        console.warn('Could not set DNS lookup preference', e);
      }
    }
  }
};

// Use in API routes like this:
// export async function GET(req: NextRequest) {
//   configureIPv4();
//   // Rest of your API route
// } 