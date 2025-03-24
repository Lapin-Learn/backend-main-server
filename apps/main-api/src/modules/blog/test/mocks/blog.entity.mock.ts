import { Blog } from "@app/database/entities/blog.entity";

const mockMethods = {
  findOneOrFail: jest.fn(),
  find: jest.fn(),
  count: jest.fn(),
  getBlogs: jest.fn(),
  save: jest.fn(),
};

export type MockBlogType = jest.Mock & typeof mockMethods;

export const MockBlog = Object.assign(
  jest.fn().mockImplementation(() => ({
    save: jest.fn().mockResolvedValue(this),
  })),
  mockMethods
) as MockBlogType;

Object.assign(Blog, mockMethods);
