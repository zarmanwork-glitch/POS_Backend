import * as dotenv from 'dotenv';

dotenv.config();

export default {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  jwt_secret: process.env.JWT_SECRET,
  WEBSITE_URL: process.env.WEBSITE_URL,
  Admin_Email: process.env.Admin_EMAIL,
  Admin_Password: process.env.Admin_PASSWORD,
  AWSRegion: process.env.AWSRegion,
  AWSAccessKey: process.env.AWSAccessKey,
  AWSSecret: process.env.AWSSecret,
  Bucket: process.env.Bucket
};
