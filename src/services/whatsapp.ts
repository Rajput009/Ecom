import { RepairRequest, RepairStatus } from '../types';

// WhatsApp Business API Configuration
const WHATSAPP_CONFIG = {
  // Replace these with your actual credentials after Meta approval
  PHONE_NUMBER_ID: (import.meta as any).env?.VITE_WHATSAPP_PHONE_NUMBER_ID || '',
  ACCESS_TOKEN: (import.meta as any).env?.VITE_WHATSAPP_ACCESS_TOKEN || '',
  BUSINESS_ACCOUNT_ID: (import.meta as any).env?.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID || '',
  API_VERSION: 'v18.0',
  BASE_URL: 'https://graph.facebook.com',
};

// Message Templates (must be pre-approved by Meta)
const MESSAGE_TEMPLATES = {
  REPAIR_CONFIRMATION: 'repair_confirmation',
  STATUS_UPDATE: 'status_update',
  REPAIR_COMPLETE: 'repair_complete',
  GENERAL_NOTIFICATION: 'general_notification',
};

interface WhatsAppMessage {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string;
  type: 'template' | 'text';
  template?: {
    name: string;
    language: { code: string };
    components?: Array<{
      type: 'body' | 'header';
      parameters: Array<{
        type: 'text' | 'currency' | 'date_time';
        text?: string;
        currency?: { fallback_value: string; code: string; amount_1000: number };
        date_time?: { fallback_value: string };
      }>;
    }>;
  };
  text?: { body: string };
}

class WhatsAppService {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = !!(
      WHATSAPP_CONFIG.PHONE_NUMBER_ID && 
      WHATSAPP_CONFIG.ACCESS_TOKEN
    );
  }

  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Ensure it starts with country code (assume Pakistan +92 if not present)
    if (!cleaned.startsWith('92')) {
      if (cleaned.startsWith('0')) {
        cleaned = '92' + cleaned.substring(1);
      } else {
        cleaned = '92' + cleaned;
      }
    }
    
    return cleaned;
  }

  private async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!this.isConfigured) {
      console.warn('WhatsApp not configured. Message would be sent:', message);
      return true; // Simulate success in development
    }

    try {
      const response = await fetch(
        `${WHATSAPP_CONFIG.BASE_URL}/${WHATSAPP_CONFIG.API_VERSION}/${WHATSAPP_CONFIG.PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_CONFIG.ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error('WhatsApp API error:', error);
        return false;
      }

      const data = await response.json();
      console.log('WhatsApp message sent:', data);
      return true;
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return false;
    }
  }

  // Send repair confirmation to customer
  async sendRepairConfirmation(repair: RepairRequest): Promise<boolean> {
    const phone = this.formatPhoneNumber(repair.phone);
    
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'template',
      template: {
        name: MESSAGE_TEMPLATES.REPAIR_CONFIRMATION,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: repair.customerName },
              { type: 'text', text: repair.id },
              { type: 'text', text: `${repair.deviceBrand} ${repair.deviceModel}` },
              { type: 'text', text: repair.serviceType },
              { type: 'text', text: this.getEstimatedTime(repair.deviceType) },
              { type: 'text', text: `https://zulfiqarpc.com/track?repair=${repair.id}` },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }

  // Send status update
  async sendStatusUpdate(repair: RepairRequest): Promise<boolean> {
    const phone = this.formatPhoneNumber(repair.phone);
    
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'template',
      template: {
        name: MESSAGE_TEMPLATES.STATUS_UPDATE,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: repair.id },
              { type: 'text', text: this.formatStatus(repair.status) },
              { type: 'text', text: repair.technician || 'Not assigned' },
              { type: 'text', text: repair.notes || 'No additional notes' },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }

  // Send repair complete notification
  async sendRepairComplete(repair: RepairRequest): Promise<boolean> {
    const phone = this.formatPhoneNumber(repair.phone);
    
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone,
      type: 'template',
      template: {
        name: MESSAGE_TEMPLATES.REPAIR_COMPLETE,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: repair.customerName },
              { type: 'text', text: repair.id },
              { type: 'text', text: `${repair.deviceBrand} ${repair.deviceModel}` },
              { type: 'text', text: `PKR ${repair.finalCost || repair.estimatedCost || 0}` },
            ],
          },
        ],
      },
    };

    return this.sendMessage(message);
  }

  // Send custom text message (for replies or custom notifications)
  async sendTextMessage(phone: string, text: string): Promise<boolean> {
    const formattedPhone = this.formatPhoneNumber(phone);
    
    const message: WhatsAppMessage = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: formattedPhone,
      type: 'text',
      text: { body: text },
    };

    return this.sendMessage(message);
  }

  private getEstimatedTime(deviceType: string): string {
    const times: Record<string, string> = {
      mobile: '2-3 hours',
      tablet: '3-4 hours',
      laptop: '1-2 days',
      desktop: '1-3 days',
    };
    return times[deviceType] || '2-3 hours';
  }

  private formatStatus(status: RepairStatus): string {
    const statusMap: Record<RepairStatus, string> = {
      'received': 'Received',
      'diagnosing': 'Being Diagnosed',
      'waiting-parts': 'Waiting for Parts',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'returned': 'Ready for Pickup',
      'cancelled': 'Cancelled',
    };
    return statusMap[status] || status;
  }

  // Check if WhatsApp is properly configured
  isReady(): boolean {
    return this.isConfigured;
  }

  // Get configuration status for UI
  getConfigStatus(): { configured: boolean; missing: string[] } {
    const missing: string[] = [];
    
    if (!WHATSAPP_CONFIG.PHONE_NUMBER_ID) {
      missing.push('Phone Number ID');
    }
    if (!WHATSAPP_CONFIG.ACCESS_TOKEN) {
      missing.push('Access Token');
    }
    
    return {
      configured: missing.length === 0,
      missing,
    };
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

// Log configuration status on load
const configStatus = whatsappService.getConfigStatus();
if (!configStatus.configured) {
  console.warn('WhatsApp not fully configured. Missing:', configStatus.missing);
} else {
  console.log('WhatsApp service ready');
}
