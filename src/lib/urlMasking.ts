import axios from 'axios';

export class URLMasker {
  private static readonly API_KEY = process.env.VITE_BITLY_API_KEY;
  private static readonly CUSTOM_DOMAIN = 'zazoom.store';

  static async maskOrderURL(orderId: string): Promise<string> {
    const longUrl = `https://zazoom.store?order=${orderId}`;
    
    try {
      // First level of obfuscation: Base64 encode the order ID
      const encodedOrderId = Buffer.from(orderId).toString('base64');
      
      // Second level: Add random noise
      const noise = Math.random().toString(36).substring(7);
      const maskedPath = `${noise}/${encodedOrderId}`;

      // Create shortened URL with custom domain
      const response = await axios.post(
        'https://api-ssl.bitly.com/v4/shorten',
        {
          long_url: longUrl,
          domain: this.CUSTOM_DOMAIN,
          custom_path: maskedPath
        },
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.link;
    } catch (error) {
      console.error('URL masking failed:', error);
      // Fallback to a simple encoded URL if API fails
      return `https://${this.CUSTOM_DOMAIN}/${Buffer.from(orderId).toString('base64')}`;
    }
  }
}