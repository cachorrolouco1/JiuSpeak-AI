import { aiPgRepo } from '../db/ai-pg-repository';

export async function buildCurriculumContext(belt: string): Promise<string> {
  try {
    const lessons = await aiPgRepo.getLessonsByBelt(belt);
    if (!lessons || lessons.length === 0) return '';

    const lines: string[] = [];
    let currentCourse = '';

    for (const l of lessons) {
      if (l.courseTitle !== currentCourse) {
        currentCourse = l.courseTitle;
        lines.push(`\n## ${currentCourse} (${l.targetBelt} Belt)`);
      }
      const phrases = (l.keyPhrases || []).map((p: any) => `"${p.en}" (${p.pt})`).join(', ');
      lines.push(`- Aula ${l.moduleOrder}: ${l.title} — ${l.summaryPt} | ${phrases}`);
    }
    return lines.join('\n');
  } catch (err) {
    console.warn('Failed to load curriculum from PG:', err);
    return '';
  }
}

export async function getTeacherForNow() {
  const hour = new Date().getHours();
  const shift = (hour >= 6 && hour < 18) ? 'day' : 'night';
  return aiPgRepo.getTeacherByShift(shift);
}
