interface KlaviyoEventData {
  email: string;
  name?: string;
  rating: number;
  feedback: string;
  feedbackType: 'high-rating' | 'low-rating';
  timestamp: string;
  ipAddress?: string;
}

export class KlaviyoService {
  private static readonly KLAVIYO_TRACK_URL = 'https://a.klaviyo.com/api/track';
  
  /**
   * Send feedback event to Klaviyo
   * @param data - Feedback data to send
   * @returns Promise with the response
   */
  static async sendFeedbackEvent(data: KlaviyoEventData): Promise<{ success: boolean; error?: string }> {
    const publicKey = process.env.KLAVIYO_PUBLIC_KEY;
    
    if (!publicKey) {
      console.warn('KLAVIYO_PUBLIC_KEY not configured, skipping Klaviyo event');
      return { success: false, error: 'Klaviyo not configured' };
    }

    try {

      // {
      //   "token": "PUBLIC_KEY",
      //   "event": "Ordered Product",
      //   "customer_properties": {
      //     "$email": "abraham.lincoln@klaviyo.com"
      //   },
      //   "properties": {
      //     "item_name": "Boots",
      //     "$value": 100
      //   }
      // }


      const eventPayload = {
        token: publicKey,
        event: "Send feedback",
        customer_properties: {
          "$email": data.email,
          "$first_name": data.name || 'Anonymous'
        },
        properties: {
          feedback_type: data.feedbackType,
          rating: data.rating,
          feedback_text: data.feedback,
          submitted_at: data.timestamp,
          ip_address: data.ipAddress || 'unknown',
          rating_category: data.rating >= 4 ? 'Positive' : 'Negative'
        },
        time: Math.floor(new Date(data.timestamp).getTime() / 1000) // Unix timestamp in seconds
      };

      // Encode the payload as base64 for GET request
      const encodedData = Buffer.from(JSON.stringify(eventPayload)).toString('base64');
      
      // Klaviyo Track API expects data as a query parameter
      const url = `${this.KLAVIYO_TRACK_URL}?data=${encodeURIComponent(encodedData)}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });

      if (response.ok) {
        console.log('Klaviyo event sent successfully:', {
          event: 'Send feedback',
          email: data.email,
          feedbackType: data.feedbackType,
          rating: data.rating
        });
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('Klaviyo API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return { 
          success: false, 
          error: `Klaviyo API error: ${response.status} ${response.statusText}` 
        };
      }
    } catch (error) {
      console.error('Error sending Klaviyo event:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Alternative method using POST request with JSON body
   * Some Klaviyo implementations prefer this method
   */
  static async sendFeedbackEventPost(data: KlaviyoEventData): Promise<{ success: boolean; error?: string }> {
    const publicKey = process.env.KLAVIYO_PUBLIC_KEY;
    
    if (!publicKey) {
      console.warn('KLAVIYO_PUBLIC_KEY not configured, skipping Klaviyo event');
      return { success: false, error: 'Klaviyo not configured' };
    }

    try {
      const eventPayload = {
        token: publicKey,
        event: "Send feedback",
        customer_properties: {
          "$email": data.email,
        },
        properties: {
          feedback_type: data.feedbackType,
          rating: data.rating,
          feedback_text: data.feedback,
          submitted_at: data.timestamp,
          ip_address: data.ipAddress || 'unknown',
          rating_category: data.rating >= 4 ? 'Positive' : 'Negative'
        }
      };

      const response = await fetch(this.KLAVIYO_TRACK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      if (response.ok) {
        console.log('Klaviyo event sent successfully (POST):', {
          event: 'Send feedback',
          email: data.email,
          feedbackType: data.feedbackType,
          rating: data.rating
        });
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('Klaviyo API error (POST):', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        return { 
          success: false, 
          error: `Klaviyo API error: ${response.status} ${response.statusText}` 
        };
      }
    } catch (error) {
      console.error('Error sending Klaviyo event (POST):', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}
