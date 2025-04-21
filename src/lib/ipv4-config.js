// Force Node.js to prefer IPv4 addresses
process.env.NODE_OPTIONS = [
  ...(process.env.NODE_OPTIONS || '').split(' '),
  '--dns-result-order=ipv4first'
].join(' ');

// This file should be imported in key server components and API routes 