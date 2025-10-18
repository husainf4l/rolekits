import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

async function createSystemApiKey() {
  // Database configuration
  const dataSource = new DataSource({
    type: 'postgres',
    host: '149.200.251.12',
    port: 5432,
    username: 'husain',
    password: 'tt55oo77',
    database: 'rolekits',
    entities: [],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Get or create system user
    const userResult = await dataSource.query(
      `SELECT id FROM "user" WHERE username = $1`,
      ['system']
    );

    let systemUserId: string;

    if (userResult.length === 0) {
      console.log('🔧 Creating system user...');
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      
      const result = await dataSource.query(
        `INSERT INTO "user" (username, "hashedPassword") VALUES ($1, $2) RETURNING id`,
        ['system', hashedPassword]
      );
      systemUserId = result[0].id;
      console.log('✅ System user created:', systemUserId);
    } else {
      systemUserId = userResult[0].id;
      console.log('✅ System user exists:', systemUserId);
    }

    // Generate new API key
    const randomPart = crypto.randomBytes(32).toString('hex');
    const systemKey = `rk_system_${randomPart}`;
    const hashedKey = crypto.createHash('sha256').update(systemKey).digest('hex');

    // Insert new API key
    await dataSource.query(
      `INSERT INTO api_key (key, name, "userId", active, "expiresAt") 
       VALUES ($1, $2, $3, $4, $5)`,
      [hashedKey, 'System Master Key - ' + new Date().toISOString(), systemUserId, true, null]
    );

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔐 NEW SYSTEM API KEY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log(`API Key: ${systemKey}`);
    console.log('');
    console.log('This key has full system access. Use it in Authorization header:');
    console.log(`Authorization: Bearer ${systemKey}`);
    console.log('');
    console.log('Use it for:');
    console.log('  • Admin operations');
    console.log('  • Background jobs');
    console.log('  • System integrations');
    console.log('  • CI/CD pipelines');
    console.log('');
    console.log('⚠️  Save this key securely - it won\'t be shown again!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    await dataSource.destroy();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createSystemApiKey();
