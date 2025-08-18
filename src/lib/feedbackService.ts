import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { ObjectId } from 'mongodb';
import { getFeedbacksCollection } from './mongodb';

export interface Feedback {
  _id?: string;
  email: string;
  rating: number;
  feedback: string;
  name?: string;
  type: 'high-rating' | 'low-rating';
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  invitedBy?: string[]; // Array of user IDs who have invited this feedback
}

export interface PaginatedFeedback {
  feedback: Feedback[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const FEEDBACK_FILE_PATH = path.join(process.cwd(), 'data', 'feedback.json');

export class FeedbackService {
  // File-based storage methods (for development)
  private static async ensureDataDirectory() {
    const dataDir = path.dirname(FEEDBACK_FILE_PATH);
    try {
      await fs.access(dataDir);
    } catch {
      await fs.mkdir(dataDir, { recursive: true });
    }
  }

  private static async readFeedbackFile(): Promise<Feedback[]> {
    try {
      await this.ensureDataDirectory();
      const data = await fs.readFile(FEEDBACK_FILE_PATH, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is empty, return empty array
      return [];
    }
  }

  private static async writeFeedbackFile(feedback: Feedback[]): Promise<void> {
    await this.ensureDataDirectory();
    await fs.writeFile(FEEDBACK_FILE_PATH, JSON.stringify(feedback, null, 2));
  }

  // MongoDB storage methods (for production)
  private static async createFeedbackMongoDB(feedbackData: Omit<Feedback, '_id' | 'timestamp'>): Promise<Feedback> {
    const collection = await getFeedbacksCollection();
    const feedback = {
      ...feedbackData,
      timestamp: new Date(),
    };

    const result = await collection.insertOne(feedback);
    return {
      ...feedback,
      _id: result.insertedId.toString(),
    } as Feedback;
  }

  private static async getAllFeedbackMongoDB(page: number = 1, pageSize: number = 10, type?: 'high-rating' | 'low-rating'): Promise<PaginatedFeedback> {
    const collection = await getFeedbacksCollection();
    const filter = type ? { type } : {};
    
    const total = await collection.countDocuments(filter);
    const totalPages = Math.ceil(total / pageSize);
    const skip = (page - 1) * pageSize;
    
    const feedback = await collection
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(pageSize)
      .toArray();
    
    return {
      feedback: feedback.map(doc => ({
        ...doc,
        _id: doc._id.toString(),
        timestamp: new Date(doc.timestamp)
      })) as Feedback[],
      total,
      page,
      pageSize,
      totalPages
    };
  }

  private static async getFeedbackByEmailMongoDB(email: string): Promise<Feedback[]> {
    const collection = await getFeedbacksCollection();
    const feedback = await collection.find({ email }).sort({ timestamp: -1 }).toArray();
    return feedback.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      timestamp: new Date(doc.timestamp)
    })) as Feedback[];
  }

  private static async getFeedbackByTypeMongoDB(type: 'high-rating' | 'low-rating'): Promise<Feedback[]> {
    const collection = await getFeedbacksCollection();
    const feedback = await collection.find({ type }).sort({ timestamp: -1 }).toArray();
    return feedback.map(doc => ({
      ...doc,
      _id: doc._id.toString(),
      timestamp: new Date(doc.timestamp)
    })) as Feedback[];
  }

  private static async getFeedbackStatsMongoDB() {
    const collection = await getFeedbacksCollection();
    const pipeline = [
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          ratings: { $push: '$rating' },
          totalRating: { $sum: '$rating' }
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    const total = await collection.countDocuments();

    const stats = {
      total,
      byType: {} as Record<string, { count: number; ratings: number[]; avgRating?: number }>
    };

    results.forEach((result) => {
      const type = result._id;
      stats.byType[type] = {
        count: result.count,
        ratings: result.ratings,
        avgRating: Math.round((result.totalRating / result.count) * 10) / 10
      };
    });

    return stats;
  }

  private static async deleteFeedbackMongoDB(id: string): Promise<boolean> {
    const collection = await getFeedbacksCollection();
    try {
      const result = await collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Invalid feedback ID format:', id);
      return false;
    }
  }

  private static async deleteMultipleFeedbackMongoDB(ids: string[]): Promise<number> {
    const collection = await getFeedbacksCollection();
    try {
      const objectIds = ids.map(id => new ObjectId(id));
      const result = await collection.deleteMany({ _id: { $in: objectIds } });
      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting multiple feedback:', error);
      return 0;
    }
  }

  private static async clearAllFeedbackMongoDB(): Promise<void> {
    const collection = await getFeedbacksCollection();
    await collection.deleteMany({});
  }

  private static async addSampleDataMongoDB(): Promise<void> {
    const sampleFeedback: Omit<Feedback, '_id' | 'timestamp'>[] = [
      {
        email: 'john@example.com',
        rating: 5,
        feedback: 'Amazing service! The team was very responsive and helpful.',
        name: 'John Smith',
        type: 'high-rating',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        email: 'sarah@example.com',
        rating: 4,
        feedback: 'Great experience overall. Would recommend to others.',
        name: 'Sarah Johnson',
        type: 'high-rating',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        email: 'mike@example.com',
        rating: 2,
        feedback: 'The service was slow and the interface was confusing.',
        name: 'Mike Wilson',
        type: 'low-rating',
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      },
      {
        email: 'lisa@example.com',
        rating: 1,
        feedback: 'Terrible experience. Nothing worked as expected.',
        name: 'Lisa Brown',
        type: 'low-rating',
        ipAddress: '192.168.1.4',
        userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
      },
      {
        email: 'david@example.com',
        rating: 5,
        feedback: 'Excellent! Fast, reliable, and user-friendly.',
        name: 'David Lee',
        type: 'high-rating',
        ipAddress: '192.168.1.5',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ];

    const collection = await getFeedbacksCollection();
    for (const feedback of sampleFeedback) {
      await this.createFeedbackMongoDB(feedback);
    }
  }

  // Public methods with automatic storage switching
  static async createFeedback(feedbackData: Omit<Feedback, '_id' | 'timestamp'>): Promise<Feedback> {
    // Force file storage in development to avoid Windows SSL issues
    const useFileStorage = process.env.NODE_ENV === 'development' || process.env.FORCE_FILE_STORAGE === 'true';
    
    if (!useFileStorage && process.env.NODE_ENV === 'production') {
      try {
        return await this.createFeedbackMongoDB(feedbackData);
      } catch (error) {
        console.error('MongoDB connection failed, falling back to file storage:', error instanceof Error ? error.message : String(error));
        // Fallback to file storage if MongoDB fails
        const feedback: Feedback = {
          ...feedbackData,
          _id: randomUUID(),
          timestamp: new Date(),
        };

        const allFeedback = await this.readFeedbackFile();
        allFeedback.push(feedback);
        await this.writeFeedbackFile(allFeedback);

        return feedback;
      }
    } else {
      // Development mode or forced file storage - use file storage
      const feedback: Feedback = {
        ...feedbackData,
        _id: randomUUID(),
      timestamp: new Date(),
    };

    const allFeedback = await this.readFeedbackFile();
    allFeedback.push(feedback);
    await this.writeFeedbackFile(allFeedback);

    return feedback;
    }
  }

  static async getAllFeedback(page: number = 1, pageSize: number = 10, type?: 'high-rating' | 'low-rating'): Promise<PaginatedFeedback> {
    const useFileStorage = process.env.NODE_ENV === 'development' || process.env.FORCE_FILE_STORAGE === 'true';
    
    if (!useFileStorage && process.env.NODE_ENV === 'production') {
      try {
        return await this.getAllFeedbackMongoDB(page, pageSize, type);
      } catch (error) {
        console.error('MongoDB connection failed, falling back to file storage:', error instanceof Error ? error.message : String(error));
        // Fallback to file storage with pagination
        let feedback = await this.readFeedbackFile();
        if (type) {
          feedback = feedback.filter(f => f.type === type);
        }
        feedback = feedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        const total = feedback.length;
        const totalPages = Math.ceil(total / pageSize);
        const skip = (page - 1) * pageSize;
        const paginatedFeedback = feedback.slice(skip, skip + pageSize);
        
        return {
          feedback: paginatedFeedback,
          total,
          page,
          pageSize,
          totalPages
        };
      }
    } else {
      // File storage with pagination
      let feedback = await this.readFeedbackFile();
      if (type) {
        feedback = feedback.filter(f => f.type === type);
      }
      feedback = feedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      const total = feedback.length;
      const totalPages = Math.ceil(total / pageSize);
      const skip = (page - 1) * pageSize;
      const paginatedFeedback = feedback.slice(skip, skip + pageSize);
      
      return {
        feedback: paginatedFeedback,
        total,
        page,
        pageSize,
        totalPages
      };
    }
  }

  static async getFeedbackByEmail(email: string): Promise<Feedback[]> {
    if (process.env.NODE_ENV === 'production') {
      return this.getFeedbackByEmailMongoDB(email);
    } else {
    const feedback = await this.readFeedbackFile();
    return feedback
      .filter(f => f.email === email)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  }

  static async getFeedbackByType(type: 'high-rating' | 'low-rating', page: number = 1, pageSize: number = 10): Promise<PaginatedFeedback> {
    return this.getAllFeedback(page, pageSize, type);
  }

  static async getFeedbackStats() {
    if (process.env.NODE_ENV === 'production') {
      return this.getFeedbackStatsMongoDB();
    } else {
    const feedback = await this.readFeedbackFile();
    
    const stats = feedback.reduce((acc, item) => {
      if (!acc.byType[item.type]) {
        acc.byType[item.type] = {
          count: 0,
          ratings: [],
          totalRating: 0
        };
      }
      
      acc.byType[item.type].count++;
      acc.byType[item.type].ratings.push(item.rating);
      acc.byType[item.type].totalRating += item.rating;
      
      return acc;
    }, {
      total: feedback.length,
      byType: {} as Record<string, { count: number; ratings: number[]; totalRating: number; avgRating?: number }>
    });

    // Calculate averages
    Object.keys(stats.byType).forEach(type => {
      const typeStats = stats.byType[type];
      typeStats.avgRating = Math.round((typeStats.totalRating / typeStats.count) * 10) / 10;
      delete (typeStats as any).totalRating; // Remove this from final output
    });

    return stats;
    }
  }

  static async deleteFeedback(id: string): Promise<boolean> {
    const useFileStorage = process.env.NODE_ENV === 'development' || process.env.FORCE_FILE_STORAGE === 'true';
    
    if (!useFileStorage && process.env.NODE_ENV === 'production') {
      try {
        return await this.deleteFeedbackMongoDB(id);
      } catch (error) {
        console.error('MongoDB deletion failed:', error);
        return false;
      }
    } else {
    const feedback = await this.readFeedbackFile();
    const initialLength = feedback.length;
    const filteredFeedback = feedback.filter(f => f._id !== id);
    
    if (filteredFeedback.length < initialLength) {
      await this.writeFeedbackFile(filteredFeedback);
      return true;
    }
    
    return false;
    }
  }

  static async deleteMultipleFeedback(ids: string[]): Promise<number> {
    const useFileStorage = process.env.NODE_ENV === 'development' || process.env.FORCE_FILE_STORAGE === 'true';
    
    if (!useFileStorage && process.env.NODE_ENV === 'production') {
      try {
        return await this.deleteMultipleFeedbackMongoDB(ids);
      } catch (error) {
        console.error('MongoDB bulk deletion failed:', error);
        return 0;
      }
    } else {
      const feedback = await this.readFeedbackFile();
      const initialLength = feedback.length;
      const filtered = feedback.filter(f => !ids.includes(f._id || ''));
      await this.writeFeedbackFile(filtered);
      return initialLength - filtered.length;
    }
  }

  static async clearAllFeedback(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return this.clearAllFeedbackMongoDB();
    } else {
    await this.writeFeedbackFile([]);
    }
  }

  // Development helper method to add sample data
  static async addSampleData(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return this.addSampleDataMongoDB();
    } else {
    const sampleFeedback: Omit<Feedback, '_id' | 'timestamp'>[] = [
      {
        email: 'john@example.com',
        rating: 5,
        feedback: 'Amazing service! The team was very responsive and helpful.',
        name: 'John Smith',
        type: 'high-rating',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        email: 'sarah@example.com',
        rating: 4,
        feedback: 'Great experience overall. Would recommend to others.',
        name: 'Sarah Johnson',
        type: 'high-rating',
        ipAddress: '192.168.1.2',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        email: 'mike@example.com',
        rating: 2,
        feedback: 'The service was slow and the interface was confusing.',
        name: 'Mike Wilson',
        type: 'low-rating',
        ipAddress: '192.168.1.3',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X) AppleWebKit/605.1.15'
      },
      {
        email: 'lisa@example.com',
        rating: 1,
        feedback: 'Terrible experience. Nothing worked as expected.',
        name: 'Lisa Brown',
        type: 'low-rating',
        ipAddress: '192.168.1.4',
        userAgent: 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'
      },
      {
        email: 'david@example.com',
        rating: 5,
        feedback: 'Excellent! Fast, reliable, and user-friendly.',
        name: 'David Lee',
        type: 'high-rating',
        ipAddress: '192.168.1.5',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ];

    for (const feedback of sampleFeedback) {
      await this.createFeedback(feedback);
      }
    }
  }

  // Invitation methods
  static async toggleInvitation(feedbackId: string, userId: string): Promise<boolean> {
    const useFileStorage = process.env.NODE_ENV === 'development' || process.env.FORCE_FILE_STORAGE === 'true';
    
    if (!useFileStorage && process.env.NODE_ENV === 'production') {
      try {
        return await this.toggleInvitationMongoDB(feedbackId, userId);
      } catch (error) {
        console.error('MongoDB invitation toggle failed:', error);
        return false;
      }
    } else {
      return await this.toggleInvitationFile(feedbackId, userId);
    }
  }

  private static async toggleInvitationMongoDB(feedbackId: string, userId: string): Promise<boolean> {
    const collection = await getFeedbacksCollection();
    
    try {
      const feedback = await collection.findOne({ _id: new ObjectId(feedbackId) });
      if (!feedback) return false;

      const invitedBy = feedback.invitedBy || [];
      const isInvited = invitedBy.includes(userId);
      
      let newInvitedBy: string[];
      if (isInvited) {
        // Remove invitation
        newInvitedBy = invitedBy.filter((id: string) => id !== userId);
      } else {
        // Add invitation
        newInvitedBy = [...invitedBy, userId];
      }

      const result = await collection.updateOne(
        { _id: new ObjectId(feedbackId) },
        { $set: { invitedBy: newInvitedBy } }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error toggling invitation in MongoDB:', error);
      return false;
    }
  }

  private static async toggleInvitationFile(feedbackId: string, userId: string): Promise<boolean> {
    const feedback = await this.readFeedbackFile();
    const feedbackIndex = feedback.findIndex(f => f._id === feedbackId);
    
    if (feedbackIndex === -1) return false;

    const invitedBy = feedback[feedbackIndex].invitedBy || [];
    const isInvited = invitedBy.includes(userId);
    
    if (isInvited) {
      // Remove invitation
      feedback[feedbackIndex].invitedBy = invitedBy.filter((id: string) => id !== userId);
    } else {
      // Add invitation
      feedback[feedbackIndex].invitedBy = [...invitedBy, userId];
    }

    await this.writeFeedbackFile(feedback);
    return true;
  }

  // Get invitation statistics
  static async getInvitationStats(): Promise<{ invited: number; notInvited: number; total: number; ratio: number }> {
    const useFileStorage = process.env.NODE_ENV === 'development' || process.env.FORCE_FILE_STORAGE === 'true';
    
    if (!useFileStorage && process.env.NODE_ENV === 'production') {
      try {
        return await this.getInvitationStatsMongoDB();
      } catch (error) {
        console.error('MongoDB invitation stats failed:', error);
        return { invited: 0, notInvited: 0, total: 0, ratio: 0 };
      }
    } else {
      return await this.getInvitationStatsFile();
    }
  }

  private static async getInvitationStatsMongoDB(): Promise<{ invited: number; notInvited: number; total: number; ratio: number }> {
    const collection = await getFeedbacksCollection();
    
    const total = await collection.countDocuments({});
    const invited = await collection.countDocuments({ invitedBy: { $exists: true, $ne: [] } });
    const notInvited = total - invited;
    const ratio = total > 0 ? Math.round((invited / total) * 100) : 0;

    return { invited, notInvited, total, ratio };
  }

  private static async getInvitationStatsFile(): Promise<{ invited: number; notInvited: number; total: number; ratio: number }> {
    const feedback = await this.readFeedbackFile();
    const total = feedback.length;
    const invited = feedback.filter(f => f.invitedBy && f.invitedBy.length > 0).length;
    const notInvited = total - invited;
    const ratio = total > 0 ? Math.round((invited / total) * 100) : 0;

    return { invited, notInvited, total, ratio };
  }
}
