const dns = require('dns').promises;
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8']);

async function findRegion() {
  const hostname = 'db.mkxokrdkkwkcphphpyhw.supabase.co';
  try {
    const addresses = await resolver.resolve6(hostname);
    console.log('IPv6 addresses:', addresses);
    
    // Most Supabase hosts have a CNAME that reveals the region if we look deep enough
    // But resolve6 might not show it. Let's try resolveAny
    const info = await resolver.resolveAny(hostname);
    console.log('DNS Info:', JSON.stringify(info, null, 2));
    
  } catch (err) {
    console.error('Error:', err);
  }
}

findRegion();
