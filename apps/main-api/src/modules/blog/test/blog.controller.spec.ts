import { BadRequestException } from "@nestjs/common";
import { BlogController } from "../blog.controller";
import { BlogService } from "../blog.service";
import { mockBlogService, mockDto, mockFile, mockUser, mockBlog, mockPaginatedBlogs } from "./mocks/blog.mock";

describe("BlogController", () => {
  let controller: BlogController;
  let service: BlogService;

  beforeEach(() => {
    controller = new BlogController(mockBlogService as any);
    service = mockBlogService as any;
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("createBlog", () => {
    it("should create a blog", async () => {
      mockBlogService.createBlog.mockResolvedValue(mockBlog);

      const result = await controller.createBlog(mockDto, mockFile, mockUser);

      expect(result).toEqual(mockBlog);
      expect(service.createBlog).toHaveBeenCalledWith(mockDto, mockFile, mockUser);
    });

    it("should throw BadRequestException when file is not provided", async () => {
      mockBlogService.createBlog.mockRejectedValue(new BadRequestException("File is required"));

      await expect(controller.createBlog(mockDto, null, mockUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw error when create blog failed", async () => {
      mockBlogService.createBlog.mockRejectedValue(new Error("Error creating blog"));

      await expect(controller.createBlog(mockDto, mockFile, mockUser)).rejects.toThrow("Error creating blog");
    });
  });

  describe("getBlogById", () => {
    const mockBlogId = "test-blog-id";

    it("should return a blog by id", async () => {
      mockBlogService.getBlogById.mockResolvedValue(mockBlog);

      const result = await controller.getBlogById(mockBlogId);

      expect(result).toEqual(mockBlog);
      expect(service.getBlogById).toHaveBeenCalledWith(mockBlogId);
    });

    it("should return null when blog not found", async () => {
      mockBlogService.getBlogById.mockResolvedValue(null);

      const result = await controller.getBlogById("non-existent-id");

      expect(result).toBeNull();
    });

    it("should throw error when get blog by id failed", async () => {
      mockBlogService.getBlogById.mockRejectedValue(new Error("Error getting blog by id"));

      await expect(controller.getBlogById("blog-id")).rejects.toThrow("Error getting blog by id");
    });
  });

  describe("getAllBlogs", () => {
    const mockOffset = 0;
    const mockLimit = 10;

    it("should return all blogs with pagination", async () => {
      mockBlogService.getAllBlogs.mockResolvedValue(mockPaginatedBlogs);

      const result = await controller.getAllBlogs(mockOffset, mockLimit);

      expect(result).toEqual(mockPaginatedBlogs);
      expect(service.getAllBlogs).toHaveBeenCalledWith(mockOffset, mockLimit);
    });

    it("should return empty array when no blogs exist", async () => {
      const emptyResponse = {
        total: 0,
        items: [],
      };
      mockBlogService.getAllBlogs.mockResolvedValue(emptyResponse);

      const result = await controller.getAllBlogs(mockOffset, mockLimit);

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it("should throw error when get all blogs failed", async () => {
      mockBlogService.getAllBlogs.mockRejectedValue(new Error("Error getting all blogs"));

      await expect(controller.getAllBlogs(mockOffset, mockLimit)).rejects.toThrow("Error getting all blogs");
    });
  });
});
