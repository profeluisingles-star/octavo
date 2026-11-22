export type TopicPeriod = string;

export interface Topic {
  id: number;
  title: string;
  subtitle: string;
  period: TopicPeriod;
  isOriginalConvocatoria: boolean;
  source: string;
  goal: string;
  steps: [string, string][];
  map: [string, string][];
  video: string;
  videoLabel: string;
  extraVideo?: { url: string; label: string };
  practiceCue: string;
  narrationUrl?: string;
  narrationTime?: [number, number];
  narrationTranscript: string;
}

export type WorkedExample = [string, string, string]; // [english, spanish, explanation]

export interface VerbForm {
  base: string;
  third: string;
  past: string;
  participle: string;
  gerund: string;
  es: string;
  present: string;
  then: string;
  rule: string;
  pastAlternatives?: string[];
  unitTag?: string;
}

export interface Question {
  prompt: string;
  correct: string;
  options: string[];
  hint: string;
  passage: string;
  passageTitle?: string;
  format?: 'write';
  typed?: boolean;
  verb?: string;
  answerMode?: 'blank' | 'question' | 'sentence';
  direction?: string;
  complete?: string;
  alternatives?: string[];
  imageChoices?: boolean;
  picture?: string;
  wordBank?: string[];
  blankParts?: number;
}

export type ReadingTaskType = 'Completa la oración' | 'Identifica información' | 'Responde en inglés';

export interface ReadingTask {
  type: ReadingTaskType;
  prompt: string;
  answer: string;
  hint: string;
  options?: string[];
}

export interface ReadingPassage {
  title: string;
  period: string;
  isOriginal: boolean;
  text: string;
  vocabulary: [string, string][];
  tasks: ReadingTask[];
}

export interface FlashcardItem {
  id: string;
  topicId: number;
  front: string;
  back: string;
  example: string;
  category: string;
}

export interface MatchPairItem {
  id: string;
  topicId: number;
  left: string;
  right: string;
  spoken: string;
}

export interface SentenceBuildItem {
  id: string;
  topicId: number;
  instruction: string;
  target: string;
  spanish: string;
  tokens: string[];
  tip: string;
}

export interface AudioDrillItem {
  id: string;
  topicId: number;
  spokenText: string;
  spanishMeaning: string;
  mode: 'dictation' | 'comprehension';
  questionPrompt: string;
  correctAnswer: string;
  options?: string[];
  alternatives?: string[];
  hint: string;
}

export type AssessmentMode = 'practice' | 'quiz';

export interface ReviewItem {
  prompt: string;
  choice: string;
  correct: string;
  hint: string;
  passage: string;
  complete?: string;
}

export interface ActiveAttempt {
  mode: AssessmentMode;
  index: number;
  items: Question[];
  revision: string;
  cursor: number;
  hits: number;
  errors: number;
  selection: string | null;
  review?: ReviewItem[];
  restartReview?: ReviewItem[];
}

export interface ReadingRecord {
  vocabulary?: { score: number; total: number };
  comprehension?: { score: number; total: number };
}

export type GradeEventType =
  | 'Visita'
  | 'Práctica'
  | 'Quiz'
  | 'Quiz reiniciado'
  | 'Lectura'
  | 'Vocabulario'
  | 'Audio Lab'
  | 'Verbos'
  | 'Flashcards'
  | 'Examen Final';

export interface GradeEvent {
  id: string;
  timestamp: string;
  student: string;
  type: GradeEventType;
  activity: string;
  topicIndex?: number;
  score: number;
  max: number;
  percentage: number;
  details?: string;
}

export interface StudentState {
  student: string;
  visits: number;
  topic: number;
  practice: Record<number, number>;
  quiz: Record<number, number>;
  readings: Record<string, ReadingRecord>;
  audioLab: Record<number, { score: number; total: number }>;
  verbDrills: Record<string, { score: number; total: number }>;
  flashcardsMastered: Record<string, boolean>;
  active: ActiveAttempt | null;
  pausedQuizzes: Record<number, ActiveAttempt>;
  previous: Record<number, string[]>;
  restarts: Record<number, number>;
  outbox: GradeEvent[];
  localHistory: GradeEvent[];
  soundEffects: boolean;
  mockExams?: Record<string, { score: number; total: number; bestPct: number; completedAt: string }>;
  mockExamDrafts?: Record<string, Record<string, string>>;
}

export interface NotificationChannelStatus {
  teacherEmail: string;
  whatsappPhone: string;
  emailAutomatic: boolean;
  emailProviders: {
    resend: boolean;
    appsScript: boolean;
  };
  whatsappAutomatic: boolean;
  whatsappProviders: {
    callmebot: boolean;
  };
  webhookAutomatic: boolean;
}

