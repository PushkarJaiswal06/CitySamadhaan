import axios from 'axios';

class MSG91Service {
  constructor() {
    this.authKey = process.env.MSG91_AUTH_KEY;
    this.senderId = process.env.MSG91_SENDER_ID || 'CITYSD';
    this.route = process.env.MSG91_ROUTE || '4'; // 4 = Transactional
    this.countryCode = process.env.MSG91_COUNTRY_CODE || '91';
    this.baseURL = 'https://control.msg91.com/api/v5';
  }

  /**
   * Send SMS using MSG91
   * @param {string} phoneNumber - 10-digit phone number
   * @param {string} message - SMS content
   * @param {string} templateId - Optional MSG91 template ID
   */
  async sendSMS(phoneNumber, message, templateId = null) {
    try {
      const payload = {
        sender: this.senderId,
        route: this.route,
        country: this.countryCode,
        sms: [
          {
            message: message,
            to: [phoneNumber]
          }
        ]
      };

      if (templateId) {
        payload.template_id = templateId;
      }

      const response = await axios.post(
        `${this.baseURL}/flow/`,
        payload,
        {
          headers: {
            'authkey': this.authKey,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('SMS sent successfully:', response.data);
      return {
        success: true,
        messageId: response.data.request_id || response.data.message,
        data: response.data
      };
    } catch (error) {
      console.error('MSG91 SMS Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Send OTP using MSG91
   * @param {string} phoneNumber - 10-digit phone number
   */
  async sendOTP(phoneNumber) {
    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/otp',
        {
          template_id: process.env.MSG91_OTP_TEMPLATE_ID,
          mobile: phoneNumber,
          authkey: this.authKey,
          otp_expiry: process.env.OTP_EXPIRY_MINUTES || 5,
          otp_length: 6
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        type: response.data.type,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('MSG91 OTP Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Verify OTP
   * @param {string} phoneNumber - 10-digit phone number
   * @param {string} otp - OTP code
   */
  async verifyOTP(phoneNumber, otp) {
    try {
      const response = await axios.post(
        'https://control.msg91.com/api/v5/otp/verify',
        {
          authkey: this.authKey,
          mobile: phoneNumber,
          otp: otp
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: response.data.type === 'success',
        message: response.data.message
      };
    } catch (error) {
      console.error('MSG91 OTP Verify Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Make voice call (IVR)
   * @param {string} phoneNumber - 10-digit phone number
   * @param {string} flowId - MSG91 Voice Flow ID
   */
  async makeVoiceCall(phoneNumber, flowId = null) {
    try {
      const voiceFlowId = flowId || process.env.MSG91_FLOW_ID;
      
      if (!voiceFlowId) {
        throw new Error('Voice Flow ID not configured');
      }

      const response = await axios.post(
        'https://control.msg91.com/api/v5/voice/call',
        {
          authkey: this.authKey,
          flow_id: voiceFlowId,
          recipients: [phoneNumber]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        callId: response.data.request_id,
        data: response.data
      };
    } catch (error) {
      console.error('MSG91 Voice Call Error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  }

  /**
   * Send complaint registration SMS
   */
  async sendComplaintConfirmation(phoneNumber, complaintId, category) {
    const message = `Your complaint #${complaintId} for ${category} has been registered. Track at citysamadhaan.in/track/${complaintId}`;
    return await this.sendSMS(phoneNumber, message);
  }

  /**
   * Send status update SMS
   */
  async sendStatusUpdate(phoneNumber, complaintId, status) {
    const message = `Complaint #${complaintId} status updated to: ${status}. Check details at citysamadhaan.in/track/${complaintId}`;
    return await this.sendSMS(phoneNumber, message);
  }
}

export default new MSG91Service();
