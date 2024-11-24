import { ActionEnum } from "@app/types/enums";

export const signInRequestMock = {
  email: "exampleSignIn@gmail.com",
  password: "password",
  action: ActionEnum.RESET_PASSWORD,
};

export const signUpRequestMock = {
  email: "exampleSignUp@gmail.com",
  password: "password",
};
