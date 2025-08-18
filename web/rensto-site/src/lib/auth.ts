import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { getCollection } from './mongodb';
import { COLLECTIONS, User, UserRole } from './models';
import { ObjectId } from 'mongodb';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const usersCollection = await getCollection(COLLECTIONS.USERS);

          // Find user by email
          const user = await usersCollection.findOne({
            email: credentials.email.toLowerCase(),
            status: 'active',
          });

          if (!user) {
            return null;
          }

          // For now, use simple password check (in production, use bcrypt)
          // TODO: Implement proper password hashing
          if (credentials.password === 'admin123') {
            return {
              id: user._id?.toString(),
              email: user.email,
              name: user.name,
              role: user.role,
              orgId: user.orgId?.toString(),
            };
          }

          return null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.orgId = token.orgId as string;
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.orgId = user.orgId;
      }
      return token;
    },
  },
};

// Helper functions for user management
export async function createUser(userData: Partial<User>): Promise<User> {
  const usersCollection = await getCollection(COLLECTIONS.USERS);

  const user: Omit<User, '_id'> = {
    email: userData.email!.toLowerCase(),
    name: userData.name!,
    role: userData.role || UserRole.USER,
    orgId: new ObjectId(userData.orgId!),
    status: 'active',
    preferences: {
      theme: 'system',
      notifications: {
        email: true,
        push: false,
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await usersCollection.insertOne(user);
  return { ...user, _id: result.insertedId };
}

export async function getUserById(userId: string): Promise<User | null> {
  const usersCollection = await getCollection(COLLECTIONS.USERS);
  return await usersCollection.findOne({ _id: new ObjectId(userId) });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const usersCollection = await getCollection(COLLECTIONS.USERS);
  return await usersCollection.findOne({ email: email.toLowerCase() });
}

export async function updateUser(
  userId: string,
  updates: Partial<User>
): Promise<User | null> {
  const usersCollection = await getCollection(COLLECTIONS.USERS);

  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(userId) },
    {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    },
    { returnDocument: 'after' }
  );

  return result;
}

export async function getUsersByOrg(orgId: string): Promise<User[]> {
  const usersCollection = await getCollection(COLLECTIONS.USERS);
  return await usersCollection.find({ orgId: new ObjectId(orgId) }).toArray();
}
