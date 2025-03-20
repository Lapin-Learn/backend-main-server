import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MainApiController } from "./main-api.controller";
import { MainApiService } from "./main-api.service";
import { AuthModule } from "../auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { BucketModule } from "../bucket/bucket.module";
import { UserModule } from "../user/user.module";
import { MailModule } from "@app/shared-modules/mail";
import { ActivityModule } from "../activity/activity.module";
import { StreakModule } from "../streak/streak.module";
import { DailyLessonModule } from "../daily-lesson/daily-lesson.module";
import { AdminModule } from "../admin/admin.module";
import { MissionModule } from "../mission/mission.module";
import { NotificationModule } from "../notification/notification.module";
import { ItemModule } from "../item/item.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { APP_GUARD } from "@nestjs/core";
import { LoggerMiddleware } from "../../middlewares";
import { SimulatedTestModule } from "../simulated-test/simulated-test.module";
import { AIModule } from "../ai/ai.module";
import { BullModule } from "@nestjs/bullmq";
import { PaymentModule } from "../payment/payment.module";
import { WORKER_ATTEMPTS } from "@app/types/constants";
import { BlogModule } from "../blog/blog.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "public"),
      exclude: ["/api"],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => [
        {
          ttl: configService.get("TTL") || 60000,
          limit: configService.get("LIMIT") || 10000,
        },
      ],
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        connection: {
          host: configService.get("REDIS_HOST"),
          port: configService.get("REDIS_PORT"),
        },
        defaultJobOptions: {
          attempts: WORKER_ATTEMPTS,
          removeOnComplete: {
            age: 86400,
          },
          removeOnFail: {
            age: 86400,
          },
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    BucketModule,
    UserModule,
    MailModule,
    ActivityModule,
    StreakModule,
    DailyLessonModule,
    AdminModule,
    MissionModule,
    NotificationModule,
    ItemModule,
    SimulatedTestModule,
    AIModule,
    PaymentModule,
    BlogModule,
  ],
  controllers: [MainApiController],
  providers: [
    MainApiService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class MainApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes({ path: "api/*", method: RequestMethod.ALL });
  }
}
