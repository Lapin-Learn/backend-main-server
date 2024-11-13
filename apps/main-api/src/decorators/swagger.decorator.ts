import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export function ApiDefaultResponses() {
  return applyDecorators(
    ApiResponse({ status: 200, description: "Success" }),
    ApiResponse({ status: 400, description: "Bad request" }),
    ApiResponse({ status: 401, description: "Unauthorized" }),
    ApiResponse({ status: 403, description: "Forbidden" }),
    ApiResponse({ status: 500, description: "Internal server error" })
  );
}
