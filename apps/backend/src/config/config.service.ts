import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  readonly env: string;
  readonly port: string;
  readonly apiUrl: string;
  readonly databaseUrl: string;
  readonly directUrl: string;
  readonly redisHost: string;
  readonly redisPort: string;
  readonly redisPassword: string;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly razorpayKeyId: string;
  readonly razorpayKeySecret: string;
  readonly razorpayWebhookSecret: string;
  readonly sendgridApiKey: string;
  readonly emailFrom: string;
  readonly awsAccessKeyId: string;
  readonly awsSecretAccessKey: string;
  readonly awsRegion: string;
  readonly awsS3Bucket: string;
  readonly adminUrl: string;
  readonly creatorUrl: string;
  readonly businessUrl: string;
  readonly throttleTtl: string;
  readonly throttleLimit: string;
  readonly googleClientId: string;
  readonly googleClientSecret: string;
  readonly instagramClientId: string;
  readonly instagramClientSecret: string;
  readonly youtubeClientId: string;
  readonly youtubeClientSecret: string;

  constructor() {
    this.env = process.env.NODE_ENV || 'development';
    this.port = process.env.PORT || '3000';
    this.apiUrl = process.env.API_URL || `http://localhost:${this.port}`;
    this.databaseUrl = process.env.DATABASE_URL || '';
    this.directUrl = process.env.DIRECT_URL || this.databaseUrl;
    this.redisHost = process.env.REDIS_HOST || 'localhost';
    this.redisPort = process.env.REDIS_PORT || '6379';
    this.redisPassword = process.env.REDIS_PASSWORD || '';
    this.jwtSecret = process.env.JWT_SECRET || 'change-me-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
    this.razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
    this.razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
    this.razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    this.sendgridApiKey = process.env.SENDGRID_API_KEY || '';
    this.emailFrom = process.env.EMAIL_FROM || 'noreply@creatorbizplatform.com';
    this.awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
    this.awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    this.awsRegion = process.env.AWS_REGION || 'ap-south-1';
    this.awsS3Bucket = process.env.AWS_S3_BUCKET || 'creator-biz-uploads';
    this.adminUrl = process.env.ADMIN_APP_URL || 'http://localhost:3001';
    this.creatorUrl = process.env.CREATOR_APP_URL || 'http://localhost:3002';
    this.businessUrl = process.env.BUSINESS_APP_URL || 'http://localhost:3003';
    this.throttleTtl = process.env.THROTTLE_TTL || '60';
    this.throttleLimit = process.env.THROTTLE_LIMIT || '100';
    this.googleClientId = process.env.GOOGLE_CLIENT_ID || '';
    this.googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    this.instagramClientId = process.env.INSTAGRAM_CLIENT_ID || '';
    this.instagramClientSecret = process.env.INSTAGRAM_CLIENT_SECRET || '';
    this.youtubeClientId = process.env.YOUTUBE_CLIENT_ID || '';
    this.youtubeClientSecret = process.env.YOUTUBE_CLIENT_SECRET || '';
  }
}
