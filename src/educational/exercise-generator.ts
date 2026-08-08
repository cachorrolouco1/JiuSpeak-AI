/**
 * JiuSpeak AI - Interactive BJJ Exercise Generator
 */

import { DbExercise } from '../db/schema';

export class ExerciseGenerator {
  private defaultExercises: DbExercise[] = [
    {
      id: 'ex-1',
      courseId: 'crs-jiuspeak-101',
      lessonId: 'lsn-1',
      title: 'Drill Instruction Correction',
      bjjTopic: 'Passing Guard',
      difficultyLevel: 'Intermediate',
      promptEn: 'Correct the following sentence: "I train BJJ since 2021 and I like very much guard pass."',
      contextPt: 'Reescreva a frase de forma fluida e gramaticalmente correta em inglês técnico de BJJ.',
      sampleCorrectAnswerEn: 'I have been training BJJ since 2021, and I really enjoy passing the guard.',
      category: 'TRANSLATION',
      createdAt: new Date().toISOString(),
    },
  ];

  getAvailableExercises(): DbExercise[] {
    return this.defaultExercises;
  }

  evaluateExerciseAnswer(
    exerciseId: string,
    studentAnswer: string
  ): { score: number; feedbackPt: string; sampleCorrectAnswerEn: string } {
    const exercise = this.defaultExercises.find((e) => e.id === exerciseId) || this.defaultExercises[0];

    const answerLower = studentAnswer.toLowerCase();

    let score = 80;
    if (answerLower.includes('have been training') || answerLower.includes('enjoy passing')) {
      score = 95;
    } else if (answerLower.length < 10) {
      score = 50;
    }

    return {
      score,
      feedbackPt:
        score >= 90
          ? 'Excelente resposta! Você utilizou as estruturas temporais e o vocabulário de BJJ de maneira perfeita.'
          : 'Boa tentativa! Veja a sugestão de resposta ideal para aprimorar a fluência.',
      sampleCorrectAnswerEn: exercise.sampleCorrectAnswerEn,
    };
  }
}
