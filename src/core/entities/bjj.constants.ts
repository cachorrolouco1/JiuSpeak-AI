/**
 * JiuSpeak AI - BJJ Constants & Domain Knowledge Initializer
 */

import { AvatarProfile } from '../types/avatar.types';

export const OFFICIAL_AVATARS: AvatarProfile[] = [
  {
    id: 'prof-jiuspeak-master',
    name: 'Prof. Marcos "JiuSpeak"',
    titlePt: 'Professor Virtual - Faixa Preta 4º Dan',
    descriptionPt: 'Especialista em instrução internacional de BJJ e comunicação com árbitros e atletas estrangeiros.',
    bjjBelt: 'Black',
    avatarImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    voiceId: 'elevenlabs-prof-marcos-en-pt',
    defaultLanguage: 'en-US',
    personalityStyle: 'Didático, encorajador, técnico e enfático na postura do BJJ',
    supportedModes: ['realtime', 'pregenerated_video'],
  },
  {
    id: 'prof-carol-jiuspeak',
    name: 'Profª. Carol "JiuSpeak"',
    titlePt: 'Professora Virtual - Faixa Preta & Competidora',
    descriptionPt: 'Focada em vocabulário de competição IBJJF, drilling de posições e entrevistas pós-luta.',
    bjjBelt: 'Black',
    avatarImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    voiceId: 'elevenlabs-prof-carol-en-pt',
    defaultLanguage: 'en-US',
    personalityStyle: 'Dinâmica, precisa em correções gramaticais, focada em sparring e regras',
    supportedModes: ['realtime', 'pregenerated_video'],
  },
];

export const BJJ_SCENARIOS = [
  {
    id: 'drilling-pass',
    title: 'Drilling Guard Passing',
    descriptionPt: 'Treino de passagem de guarda com instrução de parceiro em inglês',
    category: 'DRILLING',
    suggestedStarterEn: 'Hey bro, let us drill the knee cut pass. Can you step back a little?',
  },
  {
    id: 'sparring-reset',
    title: 'Rolling / Sparring',
    descriptionPt: 'Comunicação durante o rola na academia no exterior',
    category: 'SPARRING',
    suggestedStarterEn: 'Do you want to start from standing or from the guard?',
  },
  {
    id: 'referee-commands',
    title: 'IBJJF Competition & Referee Commands',
    descriptionPt: 'Entendendo e respondendo aos comandos do árbitro',
    category: 'COMPETITION',
    suggestedStarterEn: 'Professor, what should I say when the referee calls "Combate" or "Parou"?',
  },
  {
    id: 'seminar-instruction',
    title: 'Teaching a BJJ Seminar Abroad',
    descriptionPt: 'Explicando os detalhes de um estrangulamento para alunos em inglês',
    category: 'SEMINAR',
    suggestedStarterEn: 'Today I want to teach you how to apply a tight cross collar choke from closed guard.',
  },
];
