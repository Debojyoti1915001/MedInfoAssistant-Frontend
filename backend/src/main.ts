import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOrigin = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : 'http://localhost:5173';

  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 8080, '0.0.0.0');
}
bootstrap();
