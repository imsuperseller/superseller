import { hash, compare } from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

// In-memory database for demo - replace with real database in production
const users: User[] = [];

export class UserDatabase {
  static async createUser(email: string, password: string, name: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const hashedPassword = await hash(password, 12);
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    users.push(user);
    return user;
  }

  static async findUserByEmail(email: string): Promise<User | null> {
    return users.find(user => user.email === email) || null;
  }

  static async validatePassword(user: User, password: string): Promise<boolean> {
    return await compare(password, user.password);
  }

  static async createDefaultAdmin(): Promise<void> {
    const existingAdmin = await this.findUserByEmail('admin@rensto.com');
    if (!existingAdmin) {
      await this.createUser(
        'admin@rensto.com',
        process.env.DEFAULT_ADMIN_PASSWORD || 'ChangeMe123!',
        'Admin User',
        'admin'
      );
      console.log('✅ Default admin user created');
    }
  }
}
