import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { QAModule } from './qa/qa.module';
import { User } from './entities/user.entity';
import { Document } from './entities/document.entity';
import { IngestionStatus } from './entities/ingestion-status.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'raguser',
      password: process.env.DB_PASSWORD || 'ragpass',
      database: process.env.DB_DATABASE || 'rag_db',
      entities: [User, Document, IngestionStatus],
      synchronize: true, // We're using migrations
      logging: true,
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule,
    QAModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
