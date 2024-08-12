export const mockConfigService = {
  get(key: string) {
    switch (key) {
      case "FIREBASE_API_KEY":
        return "firebase_api_key";
      case "FIREBASE_URL":
        return "firebase_url";
    }
  },
};
