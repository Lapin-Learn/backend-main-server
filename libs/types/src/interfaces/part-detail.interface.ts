export interface IPartDetail {
  questionTypesIndices: IQuestionTypeIndex[];
  startQuestionIndex: number;
  endQuestionIndex: number;
}

export interface IQuestionTypeIndex {
  name: string;
  startIndex: number;
  endIndex: number;
}
