import { CreateBlogDto } from "@app/types/dtos/blogs";
import { ICurrentUser } from "@app/types/interfaces";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { BucketService } from "../bucket/bucket.service";
import { Blog } from "@app/database/entities/blog.entity";

@Injectable()
export class BlogService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly bucketService: BucketService) {}

  async createBlog(dto: CreateBlogDto, file: Express.Multer.File, user: ICurrentUser) {
    try {
      if (!file) {
        throw new BadRequestException("File is required");
      }

      const fileUploadResult = await this.bucketService.uploadFile(file.originalname, file, user);

      if (fileUploadResult === false) {
        throw new Error("Error uploading file");
      }

      const blog = await Blog.save({
        title: dto.title,
        content: dto.content,
        thumbnailId: fileUploadResult.id,
      });

      return blog;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getBlogById(id: string) {
    try {
      return Blog.findOneOrFail({ where: { id } });
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }

  async getAllBlogs(offset: number, limit: number) {
    try {
      const total = await Blog.count();
      const blogs = await Blog.getBlogs(offset, limit);

      return {
        total,
        items: blogs,
      };
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException(error);
    }
  }
}
