// This script enforces IPv4 connections for Node.js applications
// Run it at build time or start time to ensure IPv4 is used

console.log('🔧 Enforcing IPv4 connections...');

// Set DNS lookup order to prioritize IPv4 addresses
try {
  const dns = require('dns');
  if (dns && typeof dns.setDefaultResultOrder === 'function') {
    dns.setDefaultResultOrder('ipv4first');
    console.log('✅ DNS lookup order set to IPv4 first');
  } else {
    console.log('⚠️ Could not set DNS lookup order to IPv4 first (older Node.js version?)');
  }
} catch (error) {
  console.error('❌ Failed to modify DNS settings:', error);
}

// Set environment variables for various libraries
process.env.NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} --dns-result-order=ipv4first`;
process.env.PG_PREFER_IPV4 = 'true';
process.env.NODEJS_IP_VERSION = '4'; // Some libraries check this
process.env.UV_THREADPOOL_SIZE = '64'; // Increase libuv thread pool size

console.log('✅ Environment variables set for IPv4 preference');

// Print warning about trusting self-signed certificates if needed
if (process.env.NODE_TLS_REJECT_UNAUTHORIZED === '0') {
  console.log('⚠️ WARNING: TLS certificate verification is disabled!');
}

// Override HTTP agent creation to prefer IPv4
try {
  const http = require('http');
  const https = require('https');
  
  // Store original createConnection functions
  const httpCreateConnection = http.Agent.prototype.createConnection;
  const httpsCreateConnection = https.Agent.prototype.createConnection;
  
  // Override with IPv4-preferring versions
  http.Agent.prototype.createConnection = function(options, ...args) {
    options.family = 4;
    return httpCreateConnection.call(this, options, ...args);
  };
  
  https.Agent.prototype.createConnection = function(options, ...args) {
    options.family = 4;
    return httpsCreateConnection.call(this, options, ...args);
  };
  
  console.log('✅ HTTP(S) agents modified to prefer IPv4');
} catch (error) {
  console.error('❌ Failed to modify HTTP agents:', error);
}

console.log('🚀 IPv4 enforcement complete');

// Export the script path to allow importing in other files
module.exports = __filename; 