import { NestFactory } from '@nestjs/core';
import { MainApiModule } from './modules/app/main-api.module';

async function bootstrap() {
  const app = await NestFactory.create(MainApiModule);
  await app.listen(3000);
}
bootstrap();
