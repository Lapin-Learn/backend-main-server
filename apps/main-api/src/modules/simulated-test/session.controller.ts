import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { SimulatedTestService } from "./simulated-test.service";
import { FirebaseJwtAuthGuard } from "../../guards";
import { ApiDefaultResponses, CurrentUser } from "../../decorators";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { ICurrentUser } from "@app/types/interfaces";
import { StartSessionDto, UpdateSessionDto } from "@app/types/dtos/simulated-tests";
import { FilesInterceptor } from "@nestjs/platform-express";
import { plainToInstance } from "class-transformer";

@ApiTags("Simulated tests")
@ApiDefaultResponses()
@ApiBearerAuth()
@UseGuards(FirebaseJwtAuthGuard)
@Controller()
export class SessionController {
  constructor(private readonly simulatedTestService: SimulatedTestService) {}

  @ApiOperation({ summary: "Start a simulated test with config" })
  @ApiBody({ type: StartSessionDto })
  @ApiResponse({ type: String })
  @Post("simulated-tests/sessions")
  async startSession(@CurrentUser() learner: ICurrentUser, @Body() sessionData: StartSessionDto) {
    return this.simulatedTestService.startSession(learner, sessionData);
  }

  @ApiOperation({ summary: "Get information of a session (current or finished)" })
  @ApiParam({ name: "id", type: Number, required: true })
  @Get("simulated-tests/sessions/:id")
  async getSessionDetail(@CurrentUser() learner: ICurrentUser, @Param("id", ParseIntPipe) sessionId: number) {
    return this.simulatedTestService.getSessionDetail(sessionId, learner);
  }

  @ApiOperation({ summary: "Save draft or submit a test" })
  @ApiParam({ name: "id", type: Number, required: true })
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({ type: String })
  @UseInterceptors(FilesInterceptor("files"))
  @Put("simulated-tests/sessions/:id")
  async updateSession(
    @Param("id", ParseIntPipe) sessionId: number,
    @CurrentUser() learner: ICurrentUser,
    @Body() sessionData: any,
    @UploadedFiles() files?: Array<Express.Multer.File>
  ) {
    sessionData.response = sessionData.response && JSON.parse(sessionData.response);
    const data: UpdateSessionDto = plainToInstance(UpdateSessionDto, sessionData);

    return this.simulatedTestService.updateSession(sessionId, data, learner, files);
  }

  @ApiOperation({ summary: "Evaluate response of speaking and listening test by AI" })
  @ApiParam({ name: "id", type: Number, required: true })
  @Post("simulated-tests/sessions/:id/evaluating")
  async evaluateTestResopnse(@Param("id", ParseIntPipe) sessionId: number, @CurrentUser() learner: ICurrentUser) {
    return this.simulatedTestService.evaluateSkillTest(sessionId, learner);
  }
}
