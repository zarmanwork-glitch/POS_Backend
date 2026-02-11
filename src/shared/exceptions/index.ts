import { HttpException, HttpStatus } from '@nestjs/common';

export const callHTTPException = (
  message: string,
  status: HttpStatus = HttpStatus.BAD_REQUEST,
) => {
  throw new HttpException(
    {
      message,
    },
    status,
  );
};
