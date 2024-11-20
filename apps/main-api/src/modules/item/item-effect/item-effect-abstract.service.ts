export interface IItemEffectService {
  applyEffect: () => any;
}

export class DefaultItemEffect implements IItemEffectService {
  applyEffect() {
    return {
      message: "NOT_SUPPORTED_YET",
    };
  }
}
