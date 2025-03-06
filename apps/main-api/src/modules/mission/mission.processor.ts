import { Mission, Quest } from "@app/database";
import { MISSION_CRON_JOB, UPDATE_MISSION_JOB, VN_TIME_ZONE } from "@app/types/constants";
import { IntervalTypeEnum } from "@app/types/enums";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { Job } from "bullmq";
import moment from "moment-timezone";

@Processor(MISSION_CRON_JOB, {
  concurrency: 1,
})
export class MissionProcessor extends WorkerHost {
  private readonly logger = new Logger(MissionProcessor.name);
  constructor() {
    super();
  }

  async process(job: Job) {
    try {
      if (job.name === UPDATE_MISSION_JOB) return this.handleUpdateMission();
    } catch (err) {
      this.logger.error(`Fail ${job.name} job: `, err);
      throw err;
    }
  }

  private async handleUpdateMission() {
    this.logger.log("Update missions");

    // Check if today is the first day of month
    const isFirstDayOfMonth = moment().tz(VN_TIME_ZONE).date() === 1;
    console.log("current moment: ", moment().tz(VN_TIME_ZONE));

    // Random mission
    const randomDailyQuests = await Quest.randAndFind(IntervalTypeEnum.DAILY, 3);
    const randomMonthlyQuests = isFirstDayOfMonth ? await Quest.randAndFind(IntervalTypeEnum.MONTHLY, 1) : [];
    const randomQuests = [...randomDailyQuests, ...randomMonthlyQuests];

    // Save all random missions as global missions
    // Quantity is random between 2 and 5
    randomQuests.map(async (q) => {
      const newMission = Mission.create({ type: q.type, questId: q.id });
      console.log("new Mission: ", newMission);
      await newMission.save();
    });

    return randomQuests;
  }
}
