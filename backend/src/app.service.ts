import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getApiMessage() {
    return {
      message: 'Hello from GET',
      status: '200',
    };
  }
}
