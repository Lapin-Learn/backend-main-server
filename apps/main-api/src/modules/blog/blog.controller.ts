import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { BlogService } from "./blog.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateBlogDto } from "@app/types/dtos/blogs";
import { FirebaseJwtAuthGuard, RoleGuard } from "../../guards";
import { ApiDefaultResponses, ApiPaginatedResponse, CurrentUser, Roles } from "../../decorators";
import { AccountRoleEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { PaginationInterceptor } from "@app/utils/interceptors";

@ApiTags("Blogs")
@ApiBearerAuth()
@ApiDefaultResponses()
@Controller("blogs")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @ApiOperation({ summary: "Create a post" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    type: CreateBlogDto,
  })
  @UseGuards(FirebaseJwtAuthGuard, RoleGuard)
  @Roles(AccountRoleEnum.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  createBlog(@Body() dto: CreateBlogDto, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: ICurrentUser) {
    return this.blogService.createBlog(dto, file, user);
  }

  @ApiOperation({ summary: "Create a post" })
  @Get(":id")
  getBlogById(@Param("id", ParseUUIDPipe) id: string) {
    return this.blogService.getBlogById(id);
  }

  @ApiOperation({ summary: "Get all posts" })
  @ApiQuery({ name: "offset", type: Number, required: false })
  @ApiQuery({ name: "limit", type: Number, required: false })
  @ApiPaginatedResponse(CreateBlogDto)
  @UseInterceptors(PaginationInterceptor)
  @Get()
  getAllBlogs(
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.blogService.getAllBlogs(offset, limit);
  }
}
