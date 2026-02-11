import { Module, OnModuleInit, Logger, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule, InjectConnection } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { BusinessDetailsModule } from './business_details/business_details.module'; 
import { BankDetailsModule } from './bank_details/bank_details.module';
import { ItemsModule } from './items/items.module';
import {CustomersModule} from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { Env } from './shared/config';
import { User, UserSchema } from './auth/auth.entity';
import { AuthMiddleware } from './shared/middlewares/authGuad.middleware';

@Module({
  imports: [
    MongooseModule.forRoot(Env.MONGO_URI, { dbName: 'POS' }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: Env.jwt_secret,
     // signOptions: { expiresIn: '1h' },
    }),
    AuthModule,
    BusinessDetailsModule,
    BankDetailsModule,
    ItemsModule,
    CustomersModule,
    InvoicesModule
  ],
  controllers: [AppController],
  providers: [AuthMiddleware],
})
export class AppModule implements OnModuleInit, NestModule {
  private readonly logger = new Logger(AppModule.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.ALL },
        { path: 'auth/register', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
  async onModuleInit() {
    // If already connected, log immediately; otherwise wait for "open"
    if (this.connection.readyState === 1) {
      await this.logAndTouchCollections();
    } else {
      this.connection.once('open', async () => {
        await this.logAndTouchCollections();
      });
    }

    this.connection.on('error', (err) => {
      this.logger.error(`MongoDB connection error: ${err?.message || err}`);
    });

    if (!Env.MONGO_URI) {
      this.logger.error('MONGO_URI is not set; check your .env');
    } else {
      this.logger.log(`Connecting to MongoDB with URI: ${Env.MONGO_URI}`);
    }
  }

  private async logAndTouchCollections() {
    this.logger.log('MongoDB connected — ready to use collections');
  }
}