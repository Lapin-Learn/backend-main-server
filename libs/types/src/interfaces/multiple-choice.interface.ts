export interface IMultipleChoice {
  id: string;
  text: string;
  choices: string[];
  correctAnswer: number;
  createdAt: Date;
  updatedAt: Date;
}
