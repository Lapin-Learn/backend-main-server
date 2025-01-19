import { Controller, Get, ParseEnumPipe, Query, UseGuards } from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiDefaultResponses, CurrentUser } from "../../decorators";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ICurrentUser } from "@app/types/interfaces";
import { GetSessionProgressDto } from "@app/types/dtos/simulated-tests";
import { SkillEnum } from "@app/types/enums";

@ApiTags("Simulated tests")
@ApiDefaultResponses()
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller()
export class SimulatedTestReportController {
  constructor(private readonly simulatedTestService: SimulatedTestService) {}

  @ApiOperation({ summary: "Get average band scores of 4 skills all time" })
  @Get("simulated-tests/report")
  async getBandScoreReport(@CurrentUser() learner: ICurrentUser) {
    return this.simulatedTestService.getBandScoreReport(learner);
  }

  @ApiOperation({ summary: "Get all sessions by skill and specific time range" })
  @ApiQuery({ name: "skill", enum: SkillEnum, required: true })
  @ApiQuery({ name: "from", type: Date, required: false })
  @ApiQuery({ name: "to", type: Date, required: false })
  @Get("sessions/progress")
  async getSessionProgress(@CurrentUser() learner: ICurrentUser, @Query() query: GetSessionProgressDto) {
    return this.simulatedTestService.getSessionProgress(learner, query);
  }

  @ApiOperation({ summary: "Get question type percentage accuracy by skill all time" })
  @ApiQuery({ name: "skill", enum: SkillEnum, required: true })
  @Get("question-types/accuracy")
  async getQuestionTypesAccuracy(
    @CurrentUser() learner: ICurrentUser,
    @Query("skill", new ParseEnumPipe(SkillEnum)) skill: SkillEnum
  ) {
    return this.simulatedTestService.getQuestionTypeAccuracy(learner, skill);
  }
}
