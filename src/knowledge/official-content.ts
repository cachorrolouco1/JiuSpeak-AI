/**
 * JiuSpeak AI - Official Curriculum Knowledge Base
 */

import { JiuSpeakCourseModule } from '../core/types/knowledge.types';

export const OFFICIAL_JIUSPEAK_MODULES: JiuSpeakCourseModule[] = [
  {
    id: 'mod-101-sparring',
    courseTitle: 'JiuSpeak Official Competition & Gym English',
    moduleTitle: 'Module 1: Gym Communication & Sparring Dialogue',
    bjjTopic: 'Gym Etiquette, Sparring Setup, Tapping Out Safety',
    level: 'Beginner to Intermediate',
    summaryPt: 'Guia completo de diálogos e instruções para treinar com segurança em academias internacionais.',
    keyPhrasesEn: [
      {
        phrase: 'Do you want to flow roll or hard roll?',
        translation: 'Você quer fazer um rola solto (flow) ou mais forte (hard)?',
        contextNote: 'Sempre defina a intensidade antes de começar o treino.',
      },
      {
        phrase: 'Tap early, tap often.',
        translation: 'Bata cedo, bata sempre (treine sem se machucar).',
        contextNote: 'Máxima fundamental de segurança em academias no exterior.',
      },
      {
        phrase: 'Let us reset in the middle of the mat.',
        translation: 'Vamos voltar para o centro do tatame.',
        contextNote: 'Usado ao se aproximar da borda da área de treino.',
      },
    ],
    dialogueExamples: [
      {
        speaker: 'Partner A',
        textEn: 'Hey bro, do you want to grab a round?',
        textPt: 'E aí parceiro, quer fazer um rola?',
      },
      {
        speaker: 'Partner B',
        textEn: 'Sure! Let us start light, my shoulder is a bit sore.',
        textPt: 'Claro! Vamos começar leve, meu ombro está um pouco dolorido.',
      },
    ],
    isOfficialJiuSpeakContent: true,
  },
  {
    id: 'mod-201-referee',
    courseTitle: 'JiuSpeak Referee & Competition Masterclass',
    moduleTitle: 'Module 2: IBJJF Referee Calls & Scoring Language',
    bjjTopic: 'Points, Advantages, Disqualifications, Stalling Commands',
    level: 'Intermediate to Advanced',
    summaryPt: 'Terminologia oficial de arbitragem em eventos internacionais da IBJJF, AJP e ADCC.',
    keyPhrasesEn: [
      {
        phrase: 'Lack of combativity / Stalling',
        translation: 'Falta de combatividade / Amarrando a luta',
        contextNote: 'Penalidade aplicada quando um atleta segura a posição sem evoluir.',
      },
      {
        phrase: 'Two points for takedown',
        translation: 'Dois pontos por queda',
        contextNote: 'Sinalização oficial de pontuação.',
      },
    ],
    dialogueExamples: [
      {
        speaker: 'Referee',
        textEn: 'Stop! Out of bounds. Reset in the center.',
        textPt: 'Parou! Fora da área. Reiniciar no centro.',
      },
      {
        speaker: 'Athlete',
        textEn: 'Professor, was that considered an advantage or 2 points?',
        textPt: 'Professor, aquilo foi considerado vantagem ou 2 pontos?',
      },
    ],
    isOfficialJiuSpeakContent: true,
  },
];
