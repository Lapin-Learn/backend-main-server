import { PaginationResponseDto } from "@app/types/response-dtos";
import { applyDecorators } from "@nestjs/common";
import { ApiExtraModels, ApiOkResponse, ApiResponse, getSchemaPath } from "@nestjs/swagger";
import { Type } from "@nestjs/common";

export function ApiDefaultResponses() {
  return applyDecorators(
    ApiResponse({ status: 200, description: "Success" }),
    ApiResponse({ status: 400, description: "Bad request" }),
    ApiResponse({ status: 401, description: "Unauthorized" }),
    ApiResponse({ status: 403, description: "Forbidden" }),
    ApiResponse({ status: 500, description: "Internal server error" })
  );
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(PaginationResponseDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(PaginationResponseDto) },
          {
            properties: {
              items: {
                type: "array",
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    })
  );
};
