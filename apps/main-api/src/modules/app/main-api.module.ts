import { Module } from "@nestjs/common";
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "public"),
      exclude: ["/api"],
    }),
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
  ],
  controllers: [MainApiController],
  providers: [MainApiService],
})
export class MainApiModule {}
