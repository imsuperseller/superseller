import { UserDatabase } from '../lib/database';

async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database...');
    
    // Create default admin user
    await UserDatabase.createDefaultAdmin();
    
    console.log('✅ Database initialization complete');
    console.log('📝 Default admin credentials:');
    console.log('   Email: admin@rensto.com');
    console.log('   Password: ' + (process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!'));
    console.log('⚠️  IMPORTANT: Change the default password immediately!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
