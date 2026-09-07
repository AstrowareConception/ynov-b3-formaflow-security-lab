import 'reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { currentProfile, vulnerableWarning } from './profile';

async function bootstrap() {
  const profile = currentProfile();
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  if (profile !== 'vulnerable') app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const config = new DocumentBuilder().setTitle('FormaFlow Security Lab').setVersion('1.0.0').addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config);
  document.openapi = '3.1.0';
  SwaggerModule.setup('/openapi', app, document);
  const warning = vulnerableWarning(profile);
  if (warning) Logger.warn(warning, 'SECURITY-LAB');
  await app.listen(Number(process.env.PORT ?? 3000), '0.0.0.0');
  Logger.log(`FormaFlow Security Lab profile=${profile} port=${process.env.PORT ?? 3000}`);
}

void bootstrap();
