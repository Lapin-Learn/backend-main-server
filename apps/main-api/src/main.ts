import { Logger } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

import { MainApiModule } from "./modules/app/main-api.module";
import { ExceptionHandlerInterceptor, TransformResponseInterceptor } from "@app/utils/interceptors";
import { ThrowFirstErrorValidationPipe } from "@app/utils/pipes";

async function bootstrap() {
  const app = await NestFactory.create(MainApiModule, { cors: true });
  const globalPrefix = "api";

  app.setGlobalPrefix(globalPrefix);
  app.useGlobalInterceptors(new TransformResponseInterceptor(new Reflector()));
  app.useGlobalInterceptors(new ExceptionHandlerInterceptor());
  app.useGlobalPipes(ThrowFirstErrorValidationPipe);

  const config = new DocumentBuilder()
    .setTitle("Lapin learn")
    .setDescription("Lapin learn API description")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Main application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
