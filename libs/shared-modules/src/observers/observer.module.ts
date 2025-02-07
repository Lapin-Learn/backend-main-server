import { Module } from "@nestjs/common";
import { MileStonesObserver } from "./milestone.observer";

@Module({
  providers: [MileStonesObserver],
  exports: [MileStonesObserver],
})
export class ObserverModule {}
