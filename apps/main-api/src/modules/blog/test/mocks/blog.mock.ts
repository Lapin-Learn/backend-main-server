import { Blog } from "@app/database/entities/blog.entity";
import { CreateBlogDto } from "@app/types/dtos/blogs";
import { AccountRoleEnum } from "@app/types/enums";
import { ICurrentUser } from "@app/types/interfaces";

export const mockFile = {
  fieldname: "file",
  originalname: "test.jpg",
  encoding: "7bit",
  mimetype: "image/jpeg",
  size: 1024,
  destination: "/tmp",
  filename: "test.jpg",
  path: "/tmp/test.jpg",
  buffer: Buffer.from("test"),
} as Express.Multer.File;

export const mockUser: ICurrentUser = {
  userId: "user-id",
  profileId: "profile-id",
  role: AccountRoleEnum.ADMIN,
};

export const mockDto: CreateBlogDto = {
  title: "Test Blog",
  content: "Test Content",
  file: mockFile,
};

export type MockBlogType = jest.Mock & {
  findOneOrFail: jest.Mock;
  find: jest.Mock;
  count: jest.Mock;
  getBlogs: jest.Mock;
  save: jest.Mock;
};

export const MockBlog = jest.fn().mockImplementation(() => ({
  save: jest.fn().mockImplementation(function () {
    return Promise.resolve(this);
  }),
})) as MockBlogType;

MockBlog.findOneOrFail = jest.fn();
MockBlog.find = jest.fn();
MockBlog.count = jest.fn();
MockBlog.getBlogs = jest.fn();
MockBlog.save = jest.fn();

export const mockBlog = Object.assign(new Blog(), {
  id: "blog-id",
  title: "Test Blog",
  content: "Test Content",
  thumbnailId: "thumbnail-id",
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const mockPaginatedBlogs = {
  total: 2,
  items: [
    Object.assign(new Blog(), {
      id: "1",
      title: "Blog 1",
      content: "Content 1",
      thumbnailId: "thumb-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    Object.assign(new Blog(), {
      id: "2",
      title: "Blog 2",
      content: "Content 2",
      thumbnailId: "thumb-2",
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ],
};

export const mockUploadResult = {
  id: "thumbnail-id",
};

export const mockBucketService = {
  uploadFile: jest.fn(),
};

export const mockBlogService = {
  createBlog: jest.fn(),
  getBlogById: jest.fn(),
  getAllBlogs: jest.fn(),
};
