export abstract class ItemEffectAbstractService {
  abstract applyEffect(): void;
}

export class DefaultItemEffect extends ItemEffectAbstractService {
  applyEffect() {
    return {
      message: "NOT_SUPPORTED_YET",
    };
  }
}
