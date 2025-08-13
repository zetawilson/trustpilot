import { randomUUID } from 'crypto';
import { ObjectId } from 'mongodb';
import { getDatabase } from './mongodb';

export interface User {
  _id?: string;
  email: string;
  password: string; // Hashed password
  name?: string;
  isSuperUser: boolean;
  isApproved: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignupRequest {
  _id?: string;
  email: string;
  password: string; // Hashed password
  name?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export class AuthService {
  private static async getUsersCollection() {
    const db = await getDatabase();
    return db.collection('users');
  }

  private static async getSignupRequestsCollection() {
    const db = await getDatabase();
    return db.collection('signup_requests');
  }

  // Hash password (in production, use bcrypt)
  private static hashPassword(password: string): string {
    // Simple hash for demo - in production use bcrypt
    return Buffer.from(password).toString('base64');
  }

  // Verify password
  private static verifyPassword(password: string, hashedPassword: string): boolean {
    return this.hashPassword(password) === hashedPassword;
  }

  // Initialize super user
  static async initializeSuperUser(): Promise<void> {
    const usersCollection = await this.getUsersCollection();
    
    // Get super user credentials from environment variables
    const superUserEmail = process.env.SUPER_USER_EMAIL;
    const superUserPassword = process.env.SUPER_USER_PASSWORD;
    
    if (!superUserEmail || !superUserPassword) {
      console.warn('⚠️ Super user credentials not found in environment variables');
      return;
    }
    
    // Check if super user already exists
    const existingSuperUser = await usersCollection.findOne({ 
      email: superUserEmail 
    });

    if (!existingSuperUser) {
      const superUser: Omit<User, '_id'> = {
        email: superUserEmail,
        password: this.hashPassword(superUserPassword),
        name: 'Super Admin',
        isSuperUser: true,
        isApproved: true,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await usersCollection.insertOne(superUser);
      console.log('✅ Super user created successfully');
    }
  }

  // User registration
  static async registerUser(email: string, password: string, name?: string): Promise<SignupRequest> {
    const usersCollection = await this.getUsersCollection();
    const signupRequestsCollection = await this.getSignupRequestsCollection();

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Check if signup request already exists
    const existingRequest = await signupRequestsCollection.findOne({ email });
    if (existingRequest) {
      throw new Error('Signup request already exists for this email');
    }

    const signupRequest: Omit<SignupRequest, '_id'> = {
      email,
      password: this.hashPassword(password),
      name,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await signupRequestsCollection.insertOne(signupRequest);
    
    return {
      ...signupRequest,
      _id: result.insertedId.toString(),
    } as SignupRequest;
  }

  // User login
  static async loginUser(email: string, password: string): Promise<User> {
    const usersCollection = await this.getUsersCollection();
    
    const user = await usersCollection.findOne({ email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!this.verifyPassword(password, user.password)) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    if (!user.isApproved) {
      throw new Error('Account is not yet approved');
    }

    return {
      ...user,
      _id: user._id.toString(),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    } as User;
  }

  // Get all signup requests (for super user)
  static async getAllSignupRequests(): Promise<SignupRequest[]> {
    const signupRequestsCollection = await this.getSignupRequestsCollection();
    
    const requests = await signupRequestsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return requests.map(request => ({
      ...request,
      _id: request._id.toString(),
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt),
      approvedAt: request.approvedAt ? new Date(request.approvedAt) : undefined,
    })) as SignupRequest[];
  }

  // Approve signup request (for super user)
  static async approveSignupRequest(requestId: string, approvedBy: string): Promise<void> {
    const signupRequestsCollection = await this.getSignupRequestsCollection();
    const usersCollection = await this.getUsersCollection();

    let request;
    try {
      request = await signupRequestsCollection.findOne({ 
        _id: new ObjectId(requestId) 
      });
    } catch (error) {
      throw new Error('Invalid request ID format');
    }

    if (!request) {
      throw new Error('Signup request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not pending');
    }

    // Create user account
    const user: Omit<User, '_id'> = {
      email: request.email,
      password: request.password,
      name: request.name,
      isSuperUser: false,
      isApproved: true,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await usersCollection.insertOne(user);

    // Update signup request status
    try {
      await signupRequestsCollection.updateOne(
        { _id: new ObjectId(requestId) },
        {
          $set: {
            status: 'approved',
            approvedBy,
            approvedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      );
    } catch (error) {
      throw new Error('Failed to update signup request');
    }
  }

  // Reject signup request (for super user)
  static async rejectSignupRequest(requestId: string, approvedBy: string): Promise<void> {
    const signupRequestsCollection = await this.getSignupRequestsCollection();

    let request;
    try {
      request = await signupRequestsCollection.findOne({ 
        _id: new ObjectId(requestId) 
      });
    } catch (error) {
      throw new Error('Invalid request ID format');
    }

    if (!request) {
      throw new Error('Signup request not found');
    }

    if (request.status !== 'pending') {
      throw new Error('Request is not pending');
    }

    try {
      await signupRequestsCollection.updateOne(
        { _id: new ObjectId(requestId) },
        {
          $set: {
            status: 'rejected',
            approvedBy,
            approvedAt: new Date(),
            updatedAt: new Date(),
          }
        }
      );
    } catch (error) {
      throw new Error('Failed to update signup request');
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const usersCollection = await this.getUsersCollection();
    
    const user = await usersCollection.findOne({ email });
    if (!user) return null;

    return {
      ...user,
      _id: user._id.toString(),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    } as User;
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    const usersCollection = await this.getUsersCollection();
    
    try {
      // Try to find by ObjectId first
      const user = await usersCollection.findOne({ _id: new ObjectId(id) });
      if (user) {
        return {
          ...user,
          _id: user._id.toString(),
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        } as User;
      }
    } catch (error) {
      // If ObjectId conversion fails, try to find by string ID
      console.log('ObjectId conversion failed, trying string ID:', id);
    }

    // If we get here, the user was not found
    return null;
  }

  // Update user
  static async updateUser(id: string, updates: Partial<User>): Promise<void> {
    const usersCollection = await this.getUsersCollection();
    
    try {
      await usersCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            ...updates,
            updatedAt: new Date(),
          }
        }
      );
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
  }

  // Delete user
  static async deleteUser(id: string): Promise<void> {
    const usersCollection = await this.getUsersCollection();
    try {
      await usersCollection.deleteOne({ _id: new ObjectId(id) });
    } catch (error) {
      throw new Error('Invalid user ID format');
    }
  }

  // Get all users (for super user)
  static async getAllUsers(): Promise<User[]> {
    const usersCollection = await this.getUsersCollection();
    
    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return users.map(user => ({
      ...user,
      _id: user._id.toString(),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    })) as User[];
  }
}
