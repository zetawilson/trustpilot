import { promises as fs } from 'fs';
import path from 'path';
import { ObjectId } from 'mongodb';

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
}

const FEEDBACK_FILE_PATH = path.join(process.cwd(), 'data', 'feedback.json');

export class FeedbackService {
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

  static async createFeedback(feedbackData: Omit<Feedback, '_id' | 'timestamp'>): Promise<Feedback> {
    const feedback: Feedback = {
      ...feedbackData,
      _id: new ObjectId().toString(),
      timestamp: new Date(),
    };

    const allFeedback = await this.readFeedbackFile();
    allFeedback.push(feedback);
    await this.writeFeedbackFile(allFeedback);

    return feedback;
  }

  static async getAllFeedback(): Promise<Feedback[]> {
    const feedback = await this.readFeedbackFile();
    return feedback.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async getFeedbackByEmail(email: string): Promise<Feedback[]> {
    const feedback = await this.readFeedbackFile();
    return feedback
      .filter(f => f.email === email)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async getFeedbackByType(type: 'high-rating' | 'low-rating'): Promise<Feedback[]> {
    const feedback = await this.readFeedbackFile();
    return feedback
      .filter(f => f.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async getFeedbackStats() {
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

  static async deleteFeedback(id: string): Promise<boolean> {
    const feedback = await this.readFeedbackFile();
    const initialLength = feedback.length;
    const filteredFeedback = feedback.filter(f => f._id !== id);
    
    if (filteredFeedback.length < initialLength) {
      await this.writeFeedbackFile(filteredFeedback);
      return true;
    }
    
    return false;
  }

  static async clearAllFeedback(): Promise<void> {
    await this.writeFeedbackFile([]);
  }

  // Development helper method to add sample data
  static async addSampleData(): Promise<void> {
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
