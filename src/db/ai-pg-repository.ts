import { query, queryOne } from './pg-db';

export const aiPgRepo = {
  // Buscar professor pelo turno (day/night)
  async getTeacherByShift(shift: 'day' | 'night') {
    return queryOne('SELECT * FROM "AiTeacher" WHERE shift = $1 AND "isActive" = true', [shift]);
  },

  // Buscar professor por ID
  async getTeacherById(id: string) {
    return queryOne('SELECT * FROM "AiTeacher" WHERE id = $1', [id]);
  },

  // Buscar todos os professores
  async getAllTeachers() {
    return query('SELECT * FROM "AiTeacher" WHERE "isActive" = true');
  },

  // Buscar aulas por faixa do aluno (módulo atual + anterior pra revisão)
  async getLessonsByBelt(belt: string) {
    const beltLower = (belt || 'white').toLowerCase();
    const beltToCourses: Record<string, string[]> = {
      'white': ['crs-white'],
      'blue': ['crs-white', 'crs-blue'],
      'purple': ['crs-blue', 'crs-purple'],
      'brown': ['crs-purple', 'crs-brown'],
      'black': ['crs-brown', 'crs-black'],
    };
    const courseIds = beltToCourses[beltLower] || ['crs-white'];
    const placeholders = courseIds.map((_, i) => `$${i + 1}`).join(',');
    return query(
      `SELECT l.*, c.title as "courseTitle", c."targetBelt" FROM "AiLesson" l JOIN "AiCourse" c ON l."courseId" = c.id WHERE l."courseId" IN (${placeholders}) ORDER BY c."moduleOrder", l."moduleOrder"`,
      courseIds
    );
  },

  // Buscar uma aula específica
  async getLessonById(id: string) {
    return queryOne('SELECT * FROM "AiLesson" WHERE id = $1', [id]);
  },

  // Buscar todos os cursos
  async getAllCourses() {
    return query('SELECT * FROM "AiCourse" ORDER BY "moduleOrder"');
  },
};
