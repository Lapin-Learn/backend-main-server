import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { BlogService } from "./blog.service";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateBlogDto } from "@app/types/dtos/blogs";
import { FirebaseJwtAuthGuard } from "../../guards";
import { CurrentUser, Roles } from "../../decorators";
import { AccountRoleEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";

@Controller("blogs")
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @UseGuards(FirebaseJwtAuthGuard)
  @Roles(AccountRoleEnum.ADMIN)
  @Post()
  @UseInterceptors(FileInterceptor("file"))
  createBlog(@Body() dto: CreateBlogDto, @UploadedFile() file: Express.Multer.File, @CurrentUser() user: ICurrentUser) {
    return this.blogService.createBlog(dto, file, user);
  }

  @Get(":id")
  getBlogById(id: string) {
    return this.blogService.getBlogById(id);
  }

  @Get()
  getAllBlogs(
    @Query("offset", new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query("limit", new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.blogService.getAllBlogs(offset, limit);
  }
}
