import { Injectable } from '@nestjs/common';

export interface ScanResult {
  isFlagged: boolean;
  flagReason?: string;
  violations: string[];
}

@Injectable()
export class AntiDisintermediationService {
  private readonly phoneRegex = /(?:\+91|0)?[6-9]\d{9}|\b\d{5}[\s-]?\d{5}\b/g;
  private readonly emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  private readonly offPlatformKeywords = [
    /\b(?:whatsapp|wa\.me|telegr\.am|telegram|t\.me)\b/i,
    /\b(?:gpay|paytm|phonepe|upi\s*id|direct\s*pay|bank\s*transfer)\b/i,
    /\b(?:call\s*me|reach\s*me\s*at|contact\s*me\s*at)\s*[:\-]?\s*[\d+]/i,
    /\b(?:ig\s*dm|instagram\s*dm|dm\s*me\s*on)\b/i,
  ];

  scan(content: string): ScanResult {
    const violations: string[] = [];

    if (this.phoneRegex.test(content)) {
      violations.push('Phone number detected');
    }

    if (this.emailRegex.test(content)) {
      violations.push('Email address detected');
    }

    for (const pattern of this.offPlatformKeywords) {
      if (pattern.test(content)) {
        violations.push('Off-platform contact or direct payment keyword detected');
        break;
      }
    }

    const isFlagged = violations.length > 0;

    return {
      isFlagged,
      flagReason: isFlagged ? violations.join('; ') : undefined,
      violations,
    };
  }
}
