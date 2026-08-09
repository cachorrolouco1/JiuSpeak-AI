import { query, queryOne } from './pg-db';

export async function getFullStudentContext(studentId: string) {
  // 1. Dados básicos do aluno
  const user = await queryOne(`
    SELECT id, username, name, email, belt, stripes, 
           xp, level, "createdAt", "lastLoginAt", bio, avatar,
           academy, city
    FROM "User" WHERE id = $1
  `, [studentId]);

  if (!user) return null;

  // 2. Progresso nos módulos do curso
  const moduleProgress = await query(`
    SELECT mp.*, cm.title as "moduleTitle", cm.slug, cm.description
    FROM "CourseModuleProgress" mp
    JOIN "CourseModule" cm ON mp."moduleId" = cm.id
    WHERE mp."userId" = $1
    ORDER BY cm."order"
  `, [studentId]);

  // 3. Progresso nas aulas individuais
  const lessonProgress = await query(`
    SELECT lp.*, cl.title as "lessonTitle", cl."moduleId"
    FROM "CourseLessonProgress" lp
    JOIN "CourseLesson" cl ON lp."lessonId" = cl.id
    WHERE lp."userId" = $1
    ORDER BY cl."order"
  `, [studentId]);

  // 4. Tentativas de exame (notas)
  const examAttempts = await query(`
    SELECT ea.*, ce.title as "examTitle", ce."moduleId", ea.score, ea.passed
    FROM "CourseExamAttempt" ea
    JOIN "CourseExam" ce ON ea."examId" = ce.id
    WHERE ea."userId" = $1
    ORDER BY ea."createdAt" DESC
    LIMIT 20
  `, [studentId]);

  // 5. Comunidades que participa
  const communities = await query(`
    SELECT cm.role, c.name, c.category, c.description
    FROM "CommunityMember" cm
    JOIN "Community" c ON cm."communityId" = c.id
    WHERE cm."userId" = $1 AND cm."isBanned" = false
    LIMIT 10
  `, [studentId]);

  // 6. Log de treino
  const trainingLogs = await query(`
    SELECT date, positions, fatigue, duration, notes
    FROM "TrainingLog"
    WHERE "userId" = $1
    ORDER BY date DESC
    LIMIT 10
  `, [studentId]);

  // 7. Stats do JiuVerse (se tem)
  const jvStats = await queryOne(`
    SELECT * FROM "JvCharStats" WHERE "userId" = $1
  `, [studentId]);

  // 8. Conquistas
  const achievements = await query(`
    SELECT a.name, a.description, ua."unlockedAt"
    FROM "UserAchievement" ua
    JOIN "Achievement" a ON ua."achievementId" = a.id
    WHERE ua."userId" = $1
    ORDER BY ua."unlockedAt" DESC
    LIMIT 15
  `, [studentId]);

  // 9. Atividade social (posts recentes)
  const recentPosts = await query(`
    SELECT content, "mediaType", "createdAt"
    FROM "SocialPost"
    WHERE "authorId" = $1
    ORDER BY "createdAt" DESC
    LIMIT 5
  `, [studentId]);

  // Montar resumo textual pra injetar no prompt
  const completedModules = moduleProgress.filter((m: any) => m.completed);
  const failedExams = examAttempts.filter((e: any) => !e.passed);
  const passedExams = examAttempts.filter((e: any) => e.passed);

  const incompleteLessons = lessonProgress.filter((l: any) => !l.completed);
  const completedLessons = lessonProgress.filter((l: any) => l.completed);

  const contextText = `
### PERFIL COMPLETO DO ALUNO NO JIUSPEAK:
- Nome: ${user.name || user.username}
- Faixa: ${user.belt || 'White'} Belt (${user.stripes || 0} stripes)
- Level: ${user.level || 1} | XP: ${user.xp || 0} | JiuTickets: ${0 || 0}
- Academia: ${user.academy || 'Não informada'} (${user.city || ''})
- Frequência de treino: ${'N/A' || 'Não informada'}
- Membro desde: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
- Bio: ${user.bio || 'Sem bio'}

### PROGRESSO NO CURSO:
- Módulos concluídos: ${completedModules.length}/${moduleProgress.length}
${moduleProgress.map((m: any) => `  - ${m.moduleTitle}: ${m.completed ? '✅ Concluído' : `⏳ ${m.completeness || 0}%`}`).join('\n')}

### AULAS:
- Aulas concluídas: ${completedLessons.length}/${lessonProgress.length}
${incompleteLessons.length > 0 ? `- Aulas pendentes: ${incompleteLessons.map((l: any) => l.lessonTitle).join(', ')}` : '- Todas as aulas concluídas até aqui!'}

### EXAMES E NOTAS:
${examAttempts.length > 0
  ? examAttempts.slice(0, 10).map((e: any) => `- ${e.examTitle}: ${e.score}pts ${e.passed ? '✅' : '❌ REPROVADO'}`).join('\n')
  : '- Nenhum exame realizado ainda.'}
${failedExams.length > 0 ? `\n⚠️ ATENÇÃO PROFESSOR: O aluno REPROVOU em: ${failedExams.map((e: any) => `${e.examTitle} (${e.score}pts)`).join(', ')}. Reforce esses tópicos!` : ''}

### TREINOS RECENTES:
${trainingLogs.length > 0
  ? trainingLogs.slice(0, 5).map((t: any) => `- ${new Date(t.date).toLocaleDateString('pt-BR')}: ${t.positions || 'geral'} (${t.duration}min, fadiga: ${t.fatigue}/5)${t.notes ? ` — "${t.notes}"` : ''}`).join('\n')
  : '- Nenhum treino registrado.'}

### COMUNIDADES:
${communities.length > 0
  ? communities.map((c: any) => `- ${c.name} (${c.role})`).join('\n')
  : '- Não participa de comunidades.'}

### CONQUISTAS:
${achievements.length > 0
  ? achievements.slice(0, 8).map((a: any) => `- 🏆 ${a.name}`).join('\n')
  : '- Nenhuma conquista desbloqueada.'}

${jvStats ? `### JIUVERSE STATS:
- Level: ${jvStats.level} | XP: ${jvStats.xp} | ELO: ${jvStats.elo}
- Attack: ${jvStats.attack} | Defense: ${jvStats.defense} | Guard: ${jvStats.guard}
- Lutas: ${jvStats.totalFights} (${jvStats.wins}W / ${jvStats.losses}L)` : ''}
`.trim();

  return {
    user,
    moduleProgress,
    lessonProgress,
    examAttempts,
    communities,
    trainingLogs,
    jvStats,
    achievements,
    contextText,
    belt: user.belt || 'White',
    name: user.name || user.username,
  };
}
