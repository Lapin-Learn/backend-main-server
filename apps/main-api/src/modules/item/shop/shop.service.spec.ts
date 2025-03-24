import { Test, TestingModule } from "@nestjs/testing";
import { ShopService } from "./shop.service";
import { Item, LearnerProfile, ProfileItem } from "@app/database";
import { AccountRoleEnum, ItemName } from "@app/types/enums";
import { BadRequestException } from "@nestjs/common";
import { BuyItemDto } from "@app/types/dtos";
import { OK_RESPONSE } from "@app/types/constants";
import { ICurrentUser } from "@app/types/interfaces";

jest.mock("@app/database", () => ({
  Item: { find: jest.fn(), findOne: jest.fn() },
  LearnerProfile: { findOne: jest.fn() },
  ProfileItem: { create: jest.fn() },
}));

describe("ShopService", () => {
  let shopService: ShopService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShopService],
    }).compile();

    shopService = module.get<ShopService>(ShopService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getItemsInShop", () => {
    it("should return filtered and mapped items", async () => {
      const mockItems = [
        { name: ItemName.STREAK_FREEZE },
        { name: ItemName.IDENTIFICATION },
        { name: ItemName.RANDOM_GIFT },
      ];
      Item.find = jest.fn().mockResolvedValue(mockItems);

      const result = await shopService.getItemsInShop();
      expect(result).toEqual([
        { name: ItemName.STREAK_FREEZE, popular: "1", isPopular: false },
        { name: ItemName.RANDOM_GIFT, popular: "1", isPopular: false },
      ]);
    });
  });

  describe("buyItem", () => {
    const dto: BuyItemDto = { id: "item1", quantity: 1 };

    const mockUser: ICurrentUser = { userId: "user1", profileId: "profile1", role: AccountRoleEnum.LEARNER };
    const mockItem = {
      id: "item1",
      price: {
        1: 50,
      },
    };
    const mockProfileItem = { userId: "user1", itemId: "item1", quantity: 1 };

    Item.findOneByOrFail = jest.fn().mockResolvedValue(mockItem);
    ProfileItem.findOne = jest.fn().mockResolvedValue(mockProfileItem);
    ProfileItem.save = jest.fn().mockImplementation(() => {
      mockProfileItem.quantity += dto.quantity;
    });

    it("should allow purchase when user has enough balance", async () => {
      const mockProfile = { id: "profile1", carrots: 100 };
      LearnerProfile.findOneByOrFail = jest.fn().mockResolvedValue(mockProfile);
      LearnerProfile.save = jest.fn().mockImplementation(() => {
        mockProfile.carrots -= mockItem.price[dto.quantity];
      });

      const result = await shopService.buyItem(mockUser, dto);

      expect(mockProfileItem.quantity).toBe(2);
      expect(ProfileItem.save).toHaveBeenCalled();
      expect(mockProfile.carrots).toBe(50);
      expect(LearnerProfile.save).toHaveBeenCalled();
      expect(result).toEqual(OK_RESPONSE);
    });

    it("should throw an error when user has insufficient balance", async () => {
      const mockProfile = { id: "profile1", carrots: 40 };
      LearnerProfile.findOneByOrFail = jest.fn().mockResolvedValue(mockProfile);

      await expect(shopService.buyItem(mockUser, dto)).rejects.toThrow(BadRequestException);
    });
  });
});
