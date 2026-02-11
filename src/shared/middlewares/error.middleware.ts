import {  ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { EnumAPIResponseStatusType } from '../enums';
import { ObjectTemplateForAPIResponseGeneral } from '../data_templates/ObjectTemplateForAPIResponse';


@Catch()
export class ErrorHandler implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = 500;
    let message = 'Internal server error';
    let error: any = {};


    if (exception instanceof HttpException) {
        statusCode = exception.getStatus();
        const errorResponse = exception.getResponse();
        message = exception.message;
        error = typeof errorResponse === 'string'   ? { message: errorResponse } : { ...errorResponse };
    }


    if (exception?.name === 'ValidationError') {
      message = error?.message || 'validation_error';
    }


    if (exception?.code === 11000 || message.includes('E11000 duplicate key error collection')) {
      statusCode = 409;
      //message = error?.message  || 'duplicate_error';
    }


    if (!error?.message) {
      error.message = message;  
    }
    

    ObjectTemplateForAPIResponseGeneral.status =  EnumAPIResponseStatusType.ERROR;
    ObjectTemplateForAPIResponseGeneral.message = message;
    ObjectTemplateForAPIResponseGeneral.data.results = {
      statusCode,
      error,
    };

    response.status(statusCode).json(ObjectTemplateForAPIResponseGeneral);
  }
}


