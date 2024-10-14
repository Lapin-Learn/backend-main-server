import { IProfileMission } from "@app/types/interfaces";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MissionHelper {
  buildMissionsResponseData(data: IProfileMission[]) {
    const response =
      data.length === 0
        ? []
        : data.map((item) => {
            return {
              interval: item?.mission?.types,
              name: item?.mission?.quest?.name,
              description: item?.mission?.quest?.description,
              current: item?.current,
              quantity: item?.mission?.quantity,
              rewards: item?.mission?.quest?.rewards,
            };
          });

    return response;
  }
}
