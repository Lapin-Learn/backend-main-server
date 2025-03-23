import { BlogService } from "../blog.service";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { mockBucketService, mockDto, mockFile, mockUser, mockBlog, mockUploadResult } from "./mocks/blog.mock";
import { MockBlog } from "./mocks/blog.entity.mock";

jest.mock("@app/database/entities/blog.entity");

describe("BlogService", () => {
  let service: BlogService;

  beforeEach(() => {
    service = new BlogService(mockBucketService as any);
    jest.clearAllMocks();
  });

  describe("createBlog", () => {
    it("should create blog successfully", async () => {
      mockBucketService.uploadFile.mockResolvedValue(mockUploadResult);

      const expectedBlog = {
        title: mockDto.title,
        content: mockDto.content,
        thumbnailId: mockUploadResult.id,
      };

      const savedBlog = { ...expectedBlog, id: "blog-id" };
      MockBlog.save.mockResolvedValue(savedBlog);

      const result = await service.createBlog(mockDto, mockFile, mockUser);

      expect(mockBucketService.uploadFile).toHaveBeenCalledWith(mockFile.originalname, mockFile, mockUser);
      expect(MockBlog.save).toHaveBeenCalledWith(expectedBlog);
      expect(result).toEqual(savedBlog);
    });

    it("should throw BadRequestException when file is not provided", async () => {
      await expect(service.createBlog(mockDto, null, mockUser)).rejects.toThrow(BadRequestException);
    });

    it("should throw error when upload file failed", async () => {
      mockBucketService.uploadFile.mockResolvedValue(false);

      await expect(service.createBlog(mockDto, mockFile, mockUser)).rejects.toThrow("Error uploading file");

      expect(mockBucketService.uploadFile).toHaveBeenCalledWith(mockFile.originalname, mockFile, mockUser);
    });
  });

  describe("getBlogById", () => {
    it("should return blog by id", async () => {
      MockBlog.findOneOrFail.mockResolvedValue(mockBlog);

      const result = await service.getBlogById("blog-id");

      expect(result).toEqual(mockBlog);
    });

    it("should throw NotFoundException when blog not found", async () => {
      MockBlog.findOneOrFail.mockRejectedValue(new NotFoundException("Blog not found"));

      await expect(service.getBlogById("non-existent-id")).rejects.toThrow(NotFoundException);
    });

    it("should throw error when get blog by id failed", async () => {
      MockBlog.findOneOrFail.mockRejectedValue(new Error("Error getting blog by id"));

      await expect(service.getBlogById("blog-id")).rejects.toThrow("Error getting blog by id");
    });
  });

  describe("getAllBlogs", () => {
    it("should return blogs with pagination", async () => {
      const mockBlogs = [
        { id: "1", title: "Blog 1" },
        { id: "2", title: "Blog 2" },
      ];
      const mockTotal = 2;

      MockBlog.count.mockResolvedValue(mockTotal);
      MockBlog.getBlogs.mockResolvedValue(mockBlogs);

      const result = await service.getAllBlogs(0, 10);

      expect(result.total).toBe(mockTotal);
      expect(result.items).toEqual(mockBlogs);
    });

    it("should return empty array when no blogs exist", async () => {
      MockBlog.count.mockResolvedValue(0);
      MockBlog.getBlogs.mockResolvedValue([]);

      const result = await service.getAllBlogs(0, 10);

      expect(result.total).toBe(0);
      expect(result.items).toHaveLength(0);
    });

    it("should throw error when get all blogs failed", async () => {
      MockBlog.count.mockRejectedValue(new Error("Error getting all blogs"));
      MockBlog.getBlogs.mockRejectedValue(new Error("Error getting all blogs"));

      await expect(service.getAllBlogs(0, 10)).rejects.toThrow("Error getting all blogs");
    });

    it("should throw error when get all blogs failed", async () => {
      MockBlog.count.mockRejectedValue(new Error("Error getting all blogs"));
      MockBlog.getBlogs.mockRejectedValue(new Error("Error getting all blogs"));

      await expect(service.getAllBlogs(0, 10)).rejects.toThrow("Error getting all blogs");
    });
  });
});
