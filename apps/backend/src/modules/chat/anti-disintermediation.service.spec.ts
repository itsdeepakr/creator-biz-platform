import { AntiDisintermediationService } from './anti-disintermediation.service';

describe('AntiDisintermediationService', () => {
  let service: AntiDisintermediationService;

  beforeEach(() => {
    service = new AntiDisintermediationService();
  });

  it('should not flag clean professional messages', () => {
    const result = service.scan('Hello, can we review the script for the reel?');
    expect(result.isFlagged).toBe(false);
    expect(result.violations).toHaveLength(0);
  });

  it('should detect Indian phone numbers in message', () => {
    const result = service.scan('Call me at 9876543210 to discuss pricing directly');
    expect(result.isFlagged).toBe(true);
    expect(result.violations).toContain('Phone number detected');
  });

  it('should detect email addresses in message', () => {
    const result = service.scan('Send the invoice to founder@brandcompany.com');
    expect(result.isFlagged).toBe(true);
    expect(result.violations).toContain('Email address detected');
  });

  it('should detect WhatsApp and direct payment keywords', () => {
    const result1 = service.scan('Lets talk on whatsapp instead');
    expect(result1.isFlagged).toBe(true);

    const result2 = service.scan('Can you do GPay or Paytm for faster transfer?');
    expect(result2.isFlagged).toBe(true);

    const result3 = service.scan('Message me on telegram t.me/creator');
    expect(result3.isFlagged).toBe(true);
  });
});
