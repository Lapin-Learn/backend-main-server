import { Injectable, Scope } from "@nestjs/common";
import { MileStonesEnum } from "@app/types/enums";
import { IMileStoneInfo } from "@app/types/interfaces";

@Injectable({
  scope: Scope.REQUEST,
})
export class MileStonesObserver {
  private readonly mileStones: IMileStoneInfo<any>[] = [];

  update(type: MileStonesEnum, newValue: any): void {
    this.mileStones.push({ type, newValue });
  }

  getMileStones(): IMileStoneInfo<any>[] {
    return this.mileStones;
  }
}
