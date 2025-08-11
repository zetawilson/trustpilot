// Email validation service using multiple third-party APIs
// This provides redundancy and fallback options

interface EmailValidationResult {
  isValid: boolean;
  reason?: string;
  provider: string;
  details?: any;
}

export class EmailValidationService {
  private static instance: EmailValidationService;
  private apiKey: string | undefined;

  private constructor() {
    this.apiKey = process.env.ABSTRACT_API_KEY;
  }

  public static getInstance(): EmailValidationService {
    if (!EmailValidationService.instance) {
      EmailValidationService.instance = new EmailValidationService();
    }
    return EmailValidationService.instance;
  }

  // Primary validation using Abstract API
  private async validateWithAbstractAPI(email: string): Promise<EmailValidationResult> {
    if (!this.apiKey) {
      throw new Error('ABSTRACT_API_KEY not configured');
    }

    try {
      const response = await fetch(
        `https://emailvalidation.abstractapi.com/v1/?api_key=${this.apiKey}&email=${encodeURIComponent(email)}`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Check deliverability
      if (data.deliverability === 'UNDELIVERABLE') {
        return {
          isValid: false,
          reason: 'Email address does not exist or cannot receive emails',
          provider: 'Abstract API',
          details: data
        };
      }

      // Check format validity
      if (data.is_valid_format?.value === false) {
        return {
          isValid: false,
          reason: 'Invalid email format',
          provider: 'Abstract API',
          details: data
        };
      }

      // Check disposable emails
      if (data.is_disposable_email?.value === true) {
        return {
          isValid: false,
          reason: 'Disposable email addresses are not allowed',
          provider: 'Abstract API',
          details: data
        };
      }

      // Check role-based emails
      if (data.is_role?.value === true) {
        return {
          isValid: false,
          reason: 'Role-based email addresses are not allowed',
          provider: 'Abstract API',
          details: data
        };
      }

      // Check free email providers (optional - you can remove this if you want to allow them)
      if (data.is_free_email?.value === true) {
        // You can choose to allow or block free email providers
        // For now, we'll allow them but log the information
        console.log('Free email provider detected:', email);
      }

      return {
        isValid: true,
        provider: 'Abstract API',
        details: data
      };

    } catch (error) {
      console.error('Abstract API validation error:', error);
      throw error;
    }
  }

  // Fallback validation using basic regex
  private validateWithRegex(email: string): EmailValidationResult {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    
    return {
      isValid,
      reason: isValid ? undefined : 'Invalid email format',
      provider: 'Regex Fallback'
    };
  }

  // Alternative validation using Mailboxlayer API (if you have a key)
  private async validateWithMailboxlayer(email: string): Promise<EmailValidationResult> {
    const apiKey = process.env.MAILBOXLAYER_API_KEY;
    if (!apiKey) {
      throw new Error('MAILBOXLAYER_API_KEY not configured');
    }

    try {
      const response = await fetch(
        `http://apilayer.net/api/check?access_key=${apiKey}&email=${encodeURIComponent(email)}&smtp=1&format=1`
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();

      if (data.format_valid === false) {
        return {
          isValid: false,
          reason: 'Invalid email format',
          provider: 'Mailboxlayer',
          details: data
        };
      }

      if (data.smtp_check === false) {
        return {
          isValid: false,
          reason: 'Email address does not exist',
          provider: 'Mailboxlayer',
          details: data
        };
      }

      return {
        isValid: true,
        provider: 'Mailboxlayer',
        details: data
      };

    } catch (error) {
      console.error('Mailboxlayer validation error:', error);
      throw error;
    }
  }

  // Main validation method with fallbacks
  public async validateEmail(email: string): Promise<EmailValidationResult> {
    // First, do basic regex validation
    const regexResult = this.validateWithRegex(email);
    if (!regexResult.isValid) {
      return regexResult;
    }

    // Try Abstract API first
    try {
      return await this.validateWithAbstractAPI(email);
    } catch (error) {
      console.warn('Abstract API failed, trying Mailboxlayer...');
      
      // Try Mailboxlayer as fallback
      try {
        return await this.validateWithMailboxlayer(email);
      } catch (fallbackError) {
        console.warn('All APIs failed, using regex validation only');
        
        // Final fallback to regex only
        return {
          isValid: true,
          reason: 'Advanced validation unavailable, using basic format check',
          provider: 'Regex Fallback (APIs unavailable)'
        };
      }
    }
  }

  // Batch validation for multiple emails
  public async validateEmails(emails: string[]): Promise<EmailValidationResult[]> {
    const results: EmailValidationResult[] = [];
    
    for (const email of emails) {
      try {
        const result = await this.validateEmail(email);
        results.push(result);
      } catch (error) {
        results.push({
          isValid: false,
          reason: 'Validation failed',
          provider: 'Error'
        });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const emailValidationService = EmailValidationService.getInstance();
