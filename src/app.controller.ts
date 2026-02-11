import { Controller, Get,  Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getIndexPage(@Res() res: Response): void {
    res.sendFile('index.html', { root: 'public' });
  }
}
