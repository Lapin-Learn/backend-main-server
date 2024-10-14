import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDefaultDataTableMissions1728887186670 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const taskCompletedActionQuery = await queryRunner.query(`SELECT id FROM actions WHERE name = 'task_completed'`);
    const taskCompletedActionId = taskCompletedActionQuery[0].id;

    const dailyLoginQuery = await queryRunner.query(`SELECT id FROM actions WHERE name = 'daily_login'`);
    const dailyLoginActionId = dailyLoginQuery[0].id;

    await queryRunner.query(`
      INSERT INTO quests (name, description, requirements, rewards, action_id, types, category)
      VALUES 
        ('perfect_lessons', 'Hoàn thành bài học hoàn hảo', 100, 50, ${taskCompletedActionId}, 'daily', 'COMPLETE_LESSON_WITH_PERCENTAGE_SCORE'),
        ('fifty_percent_accuracy_lesson', 'Trả lời đúng 50% câu hỏi', 50, 50, ${taskCompletedActionId}, 'daily', 'COMPLETE_LESSON_WITH_PERCENTAGE_SCORE'),
        ('lessons', 'Hoàn thành bài học', 0, 50, ${taskCompletedActionId}, 'daily', 'COMPLETE_LESSON_WITH_PERCENTAGE_SCORE'),
        ('two_hundred_fifty_xp', 'Nhận 250 XP', 250, 50, ${taskCompletedActionId}, 'daily', 'DEFAULT'),
        ('total_daily_login', 'Đăng nhập hằng ngày', 0, 50, ${dailyLoginActionId}, 'monthly', 'DEFAULT'),
        ('lessons', 'Hoàn thành bài học', 0, 50, ${taskCompletedActionId}, 'monthly', 'COMPLETE_LESSON_WITH_PERCENTAGE_SCORE');
    `);
  }

  public async down(): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
