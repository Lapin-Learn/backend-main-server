import { Inject, Injectable } from "@nestjs/common";
import { QuestHandler } from "@app/types/abstracts";
import { MissionCategoryNameEnum } from "@app/types/enums";
import { QUEST_HANDLERS_MAP } from "@app/types/constants";

@Injectable()
export class QuestHandlerContainer {
  constructor(@Inject(QUEST_HANDLERS_MAP) private handlers: Map<MissionCategoryNameEnum, QuestHandler>) {}

  resolve(category: MissionCategoryNameEnum): QuestHandler {
    const handler = this.handlers.get(category);
    if (!handler) throw new Error("Invalid category name");
    return handler;
  }
}
