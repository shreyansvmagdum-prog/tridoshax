export type Dosha = 'Vata' | 'Pitta' | 'Kapha';

export interface Section {
  id: string;
  title: string;
  questionIds: number[];
}

export interface Question {
  id: number;
  text: string;
  options: {
    label: string;
    value: Dosha;
  }[];
}

export interface AssessmentResult {
  id: string;
  date: string;
  dosha: Dosha;
  confidence: number;
  scores: {
    Vata: number;
    Pitta: number;
    Kapha: number;
  };
}

export interface User {
  name: string;
  email: string;
  assessments: AssessmentResult[];
}
