import { Body, Controller, Get, Post, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
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
  @Roles(AccountRoleEnum.LEARNER)
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
  getAllBlogs() {
    return this.blogService.getAllBlogs();
  }
}
