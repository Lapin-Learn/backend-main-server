export abstract class ItemEffectAbstractService {
  abstract applyEffect(): void;
}

export class DefaultItemEffect extends ItemEffectAbstractService {
  applyEffect() {
    return {
      message: "This item isn't supported yet.",
    };
  }
}
