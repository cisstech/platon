import { Provider } from "@angular/core";
import { AnswerProvider } from "./models/answer-provider";
import { RemoteAnswerProvider } from "./providers/remote-answer.provider";

export const ANSWER_PROVIDERS: Provider[] = [
  { provide: AnswerProvider, useClass: RemoteAnswerProvider },
];
