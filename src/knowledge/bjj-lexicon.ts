/**
 * JiuSpeak AI - BJJ English-Portuguese Technical Lexicon
 */

export interface BJJLexiconEntry {
  termEn: string;
  translationPt: string;
  category: 'POSITIONS' | 'SUBMISSIONS' | 'PASSING' | 'GUARD' | 'COMMANDS' | 'COMPETITION' | 'GENERAL';
  definitionPt: string;
  exampleSentenceEn: string;
}

export const BJJ_ENGLISH_LEXICON: BJJLexiconEntry[] = [
  {
    termEn: 'Knee cut pass',
    translationPt: 'Passagem cortando o joelho / Passagem de joelho',
    category: 'PASSING',
    definitionPt: 'Passagem de guarda em que o atleta projeta o joelho sobre a coxa do adversário mantendo o esgrima.',
    exampleSentenceEn: 'Drive your knee across his thigh while keeping a deep underhook.',
  },
  {
    termEn: 'Cross collar choke',
    translationPt: 'Estrangulamento cruzado na gola',
    category: 'SUBMISSIONS',
    definitionPt: 'Finalização efetuada cruzando as pegadas profundamente na gola.',
    exampleSentenceEn: 'Get your second hand deep inside the collar and flare your elbows.',
  },
  {
    termEn: 'Underhook',
    translationPt: 'Esgrima por baixo / Esgrimar',
    category: 'POSITIONS',
    definitionPt: 'Controle em que o braço passa por baixo da axila do adversário.',
    exampleSentenceEn: 'Never lose your underhook when you are half-guard passing.',
  },
  {
    termEn: 'Scissor sweep',
    translationPt: 'Raspagem de tesoura',
    category: 'GUARD',
    definitionPt: 'Raspagem da guarda fechada usando movimento de tesoura com as pernas.',
    exampleSentenceEn: 'Pull him onto your chest before executing the scissor sweep.',
  },
  {
    termEn: 'Advantage',
    translationPt: 'Vantagem (IBJJF)',
    category: 'COMPETITION',
    definitionPt: 'Critério de desempate concedido por quase alcançar uma pontuação.',
    exampleSentenceEn: 'The referee awarded an advantage for the tight armbar attack.',
  },
  {
    termEn: 'Posture up',
    translationPt: 'Posturar / Fazer postura',
    category: 'COMMANDS',
    definitionPt: 'Elevar a cabeça e alinhar a coluna para evitar ser desequilibrado ou finalizado.',
    exampleSentenceEn: 'Keep your head high and posture up inside his closed guard.',
  },
];
