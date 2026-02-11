import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument, User } from '../auth/auth.entity';
import { Env } from '../shared/config';


async function run() {
  const email = Env.Admin_Email;
  const password = Env.Admin_Password;

  try {
        const app = await NestFactory.createApplicationContext(AppModule);

        const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));

            
        await userModel.findOneAndUpdate(
          { email }, // filter
          { email, password }, // data to insert if not exists
          { upsert: true, new: true, setDefaultsOnInsert: true } // options
        );
        
        console.log('Seeding completed successfully.');

        await app.close();
  } 
  catch (err: any) {
    console.error('Seeder error:', err?.message);
    process.exitCode = 1;
  }
}

run();
