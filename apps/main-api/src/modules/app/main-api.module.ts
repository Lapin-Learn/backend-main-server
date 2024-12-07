import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { MainApiController } from "./main-api.controller";
import { MainApiService } from "./main-api.service";
import { AuthModule } from "../auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { BucketModule } from "../bucket/bucket.module";
import { UserModule } from "../user/user.module";
import { MailModule } from "@app/shared-modules/mail";
import { ActivityModule } from "../activity/activity.module";
import { StreakModule } from "../streak/streak.module";
import { DailyLessonModule } from "../daily-lesson/daily-lesson.module";
import { LessonModule } from "../lesson/lesson.module";
import { AdminModule } from "../admin/admin.module";
import { MissionModule } from "../mission/mission.module";
import { NotificationModule } from "../notification/notification.module";
import { ItemModule } from "../item/item.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { APP_GUARD } from "@nestjs/core";
import { loggerMiddleware } from "../../middlewares";
import { SimulatedTestModule } from "../simulated-test/simulated-test.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "public"),
      exclude: ["/api"],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 30000,
        limit: 120,
      },
    ]),
    AuthModule,
    BucketModule,
    UserModule,
    MailModule,
    ActivityModule,
    StreakModule,
    DailyLessonModule,
    LessonModule,
    AdminModule,
    MissionModule,
    NotificationModule,
    ItemModule,
    SimulatedTestModule,
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
    consumer.apply(loggerMiddleware).forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
