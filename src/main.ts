import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Env } from './shared/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { ErrorHandler } from './shared/middlewares/error.middleware';
import { HttpCodeInterceptor } from './shared/interceptors/HttpCodes.interceptor';
import * as bodyParser from 'body-parser';

export let app: NestExpressApplication;


async function bootstrap() {
  app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const port = Env.PORT;



  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
    }), 
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.use(express.static('public'));

   app.enableCors({
    origin: '*'
  });
  
  app.useGlobalFilters(new ErrorHandler());
  app.useGlobalInterceptors(new HttpCodeInterceptor());



  await app.listen(port);
}
bootstrap();
