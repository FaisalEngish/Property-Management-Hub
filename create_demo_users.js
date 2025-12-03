import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';
import { nanoid } from 'nanoid';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function createDemoUsers() {
  const users = [
    {
      email: 'admin@demo.com',
      password: '123456',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    },
    {
      email: 'manager@demo.com', 
      password: '123456',
      firstName: 'Portfolio',
      lastName: 'Manager',
      role: 'portfolio-manager'
    },
    {
      email: 'owner@demo.com',
      password: '123456', 
      firstName: 'Property',
      lastName: 'Owner',
      role: 'owner'
    },
    {
      email: 'staff@demo.com',
      password: '123456',
      firstName: 'Staff',
      lastName: 'Member', 
      role: 'staff'
    },
    {
      email: 'retail@demo.com',
      password: '123456',
      firstName: 'Retail',
      lastName: 'Agent',
      role: 'retail-agent'
    },
    {
      email: 'referral@demo.com',
      password: '123456',
      firstName: 'Referral', 
      lastName: 'Agent',
      role: 'referral-agent'
    },
    {
      email: 'guest@demo.com',
      password: '123456',
      firstName: 'Guest',
      lastName: 'User',
      role: 'guest'
    }
  ];

  for (const user of users) {
    const hashedPassword = await hashPassword(user.password);
    const userId = nanoid();
    
    try {
      await pool.query(`
        INSERT INTO users (id, organization_id, email, password, first_name, last_name, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET
          password = EXCLUDED.password,
          updated_at = NOW()
      `, [userId, 'demo-org', user.email, hashedPassword, user.firstName, user.lastName, user.role, true]);
      
      console.log(`Created user: ${user.email} with role: ${user.role}`);
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error);
    }
  }
  
  console.log('Demo users created successfully!');
  await pool.end();
}

createDemoUsers().catch(console.error);