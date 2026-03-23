-- =============================================================
-- SEED DE PRUEBA — HábitosPro
-- Simula 1 mes de uso real (marzo 2026)
--
-- INSTRUCCIONES:
--   1. Abrí Supabase → SQL Editor
--   2. Reemplazá TODOS los 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
--      con tu auth.uid() real. Podés obtenerlo con:
--         SELECT auth.uid();
--      o desde Supabase → Authentication → Users → tu usuario
--   3. Ejecutá este script completo
-- =============================================================

DO $$
DECLARE
  v_user_id UUID := 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'; -- ← REEMPLAZÁ ESTO

  -- Habit IDs
  h_ejercicio   UUID := gen_random_uuid();
  h_lectura     UUID := gen_random_uuid();
  h_meditacion  UUID := gen_random_uuid();
  h_agua        UUID := gen_random_uuid();
  h_estudio     UUID := gen_random_uuid();
  h_journal     UUID := gen_random_uuid();

  -- Goal IDs
  g_mensual_1   UUID := gen_random_uuid();
  g_mensual_2   UUID := gen_random_uuid();
  g_trimestral  UUID := gen_random_uuid();
  g_anual_1     UUID := gen_random_uuid();
  g_anual_2     UUID := gen_random_uuid();

  d DATE;
  i INT;

BEGIN

-- =============================================================
-- HÁBITOS
-- =============================================================
INSERT INTO habits (id, user_id, name, description, category_id, color, is_public, is_archived)
VALUES
  (h_ejercicio,  v_user_id, 'Ejercicio 30 min',      'Cardio, pesas o cualquier actividad física',  1, '#22c55e', true,  false),
  (h_lectura,    v_user_id, 'Leer 20 páginas',        'Libro de no-ficción o ficción',               2, '#a855f7', true,  false),
  (h_meditacion, v_user_id, 'Meditación',             '10 minutos mínimo, sin distracciones',        2, '#818cf8', false, false),
  (h_agua,       v_user_id, 'Tomar 2L de agua',       'Hidratación diaria completa',                 1, '#06b6d4', false, false),
  (h_estudio,    v_user_id, 'Estudio / Curso',        'Avanzar en el curso de programación',         3, '#3b82f6', true,  false),
  (h_journal,    v_user_id, 'Escribir en el journal', 'Al menos 5 minutos de reflexión escrita',     2, '#ec4899', false, true); -- archivado después de 2 semanas

-- =============================================================
-- REGISTROS DE HÁBITOS — Marzo 2026 (día a día realista)
-- Patrón: semana 1 motivada, semana 2 bajón, semana 3 recuperación, semana 4 sólida
-- =============================================================

-- Semana 1 (1-7 mar): Arranque fuerte, casi todo completo
FOR i IN 0..6 LOOP
  d := '2026-03-01'::DATE + i;

  INSERT INTO habit_records (habit_id, user_id, date, completed) VALUES
    (h_ejercicio,  v_user_id, d, i NOT IN (2)),            -- falla miércoles
    (h_lectura,    v_user_id, d, true),
    (h_meditacion, v_user_id, d, i NOT IN (5, 6)),         -- falla finde
    (h_agua,       v_user_id, d, true),
    (h_estudio,    v_user_id, d, i NOT IN (5, 6)),         -- no estudia finde
    (h_journal,    v_user_id, d, i NOT IN (3, 4, 5, 6))   -- journal solo lun-mié
  ON CONFLICT (habit_id, date) DO NOTHING;
END LOOP;

-- Semana 2 (8-14 mar): Bajón de motivación
FOR i IN 0..6 LOOP
  d := '2026-03-08'::DATE + i;

  INSERT INTO habit_records (habit_id, user_id, date, completed) VALUES
    (h_ejercicio,  v_user_id, d, i IN (0, 3, 6)),          -- solo lun, jue, dom
    (h_lectura,    v_user_id, d, i NOT IN (1, 2, 5)),       -- falla mar, mié, sáb
    (h_meditacion, v_user_id, d, i IN (0, 4)),              -- muy poco
    (h_agua,       v_user_id, d, i NOT IN (2, 3)),          -- casi siempre
    (h_estudio,    v_user_id, d, i IN (0, 1, 4)),           -- intermitente
    (h_journal,    v_user_id, d, i IN (0, 6))               -- muy poco
  ON CONFLICT (habit_id, date) DO NOTHING;
END LOOP;

-- Semana 3 (15-21 mar): Recuperación progresiva
FOR i IN 0..6 LOOP
  d := '2026-03-15'::DATE + i;

  INSERT INTO habit_records (habit_id, user_id, date, completed) VALUES
    (h_ejercicio,  v_user_id, d, i NOT IN (2, 5)),
    (h_lectura,    v_user_id, d, i NOT IN (5)),
    (h_meditacion, v_user_id, d, i NOT IN (3, 5, 6)),
    (h_agua,       v_user_id, d, true),
    (h_estudio,    v_user_id, d, i NOT IN (5, 6)),
    (h_journal,    v_user_id, d, i IN (0, 1, 2, 4))
  ON CONFLICT (habit_id, date) DO NOTHING;
END LOOP;

-- Semana 4 (22-31 mar): Solidificación — buen rendimiento
FOR i IN 0..9 LOOP
  d := '2026-03-22'::DATE + i;

  INSERT INTO habit_records (habit_id, user_id, date, completed) VALUES
    (h_ejercicio,  v_user_id, d, i NOT IN (6)),             -- casi todos
    (h_lectura,    v_user_id, d, true),
    (h_meditacion, v_user_id, d, i NOT IN (4, 7)),
    (h_agua,       v_user_id, d, true),
    (h_estudio,    v_user_id, d, i NOT IN (5, 6, 9))
  ON CONFLICT (habit_id, date) DO NOTHING;
END LOOP;

-- =============================================================
-- VALORACIONES DIARIAS — Marzo 2026
-- =============================================================
INSERT INTO day_ratings (user_id, date, rating, notes) VALUES
  -- Semana 1: energía alta
  (v_user_id, '2026-03-01', 4, 'Buen arranque de mes. Me siento con energía y ganas de empezar.'),
  (v_user_id, '2026-03-02', 5, '¡Día perfecto! Completé todo y encima tuve tiempo para leer más.'),
  (v_user_id, '2026-03-03', 3, 'Me costó el ejercicio pero al final lo hice. Cansancio acumulado.'),
  (v_user_id, '2026-03-04', 4, 'Bien en general. El estudio me está resultando muy interesante.'),
  (v_user_id, '2026-03-05', 4, 'Sólido. La meditación antes de dormir me está ayudando mucho.'),
  (v_user_id, '2026-03-06', 3, 'Finde, aflojé un poco. Está bien descansar también.'),
  (v_user_id, '2026-03-07', 3, 'Domingo tranquilo. Pensé bastante en mis objetivos del mes.'),

  -- Semana 2: bajón
  (v_user_id, '2026-03-08', 2, 'Mal día. Trabajo muy estresante, no pude hacer casi nada.'),
  (v_user_id, '2026-03-09', 2, 'Segundo día difícil. Me cuesta retomar el ritmo.'),
  (v_user_id, '2026-03-10', 3, 'Un poco mejor. Al menos leí y tomé el agua.'),
  (v_user_id, '2026-03-11', 2, 'Muy cansado. Dormí mal esta semana y lo noto en todo.'),
  (v_user_id, '2026-03-12', 3, 'Mejor que ayer. Ejercicio corto pero algo es algo.'),
  (v_user_id, '2026-03-13', 3, 'Sábado de descanso real. Lo necesitaba.'),
  (v_user_id, '2026-03-14', 4, 'Domingo reconfortante. Volví a journalear y me cayó bien reflexionar.'),

  -- Semana 3: recuperación
  (v_user_id, '2026-03-15', 4, 'Nuevo comienzo de semana con más energía. El descanso del finde ayudó.'),
  (v_user_id, '2026-03-16', 4, 'Buen día. Retomé el ritmo de estudio que había perdido.'),
  (v_user_id, '2026-03-17', 3, 'Correcto. Nada destacable pero todo en orden.'),
  (v_user_id, '2026-03-18', 4, 'Me sentí muy productivo en el trabajo y aún así cumplí los hábitos.'),
  (v_user_id, '2026-03-19', 4, 'Cuatro días seguidos bien. Siento que estoy recuperando el hilo.'),
  (v_user_id, '2026-03-20', 3, 'Sábado social, salí con amigos. Aflojé hábitos pero valió la pena.'),
  (v_user_id, '2026-03-21', 3, NULL),

  -- Semana 4: solidificación
  (v_user_id, '2026-03-22', 5, '¡Día 5 estrellas! Todo completado y me quedé con energía de sobra.'),
  (v_user_id, '2026-03-23', 4, 'Muy bien. Ya se siente que los hábitos son parte de la rutina.'),
  (v_user_id, '2026-03-24', 4, 'Sólido. El ejercicio ya no me cuesta como al principio del mes.')
ON CONFLICT (user_id, date) DO NOTHING;

-- =============================================================
-- OBJETIVOS
-- =============================================================

-- MENSUAL: Leer 4 libros en marzo
INSERT INTO goals (id, user_id, title, description, category_id, type, target_value, current_value, unit, start_date, end_date, is_public, is_completed)
VALUES (
  g_mensual_1, v_user_id,
  'Leer 4 libros en marzo',
  'Un libro por semana. Mezcla de no-ficción y novela.',
  2, 'mensual', 4, 3, 'libros',
  '2026-03-01', '2026-03-31',
  true, false
);

-- MENSUAL: Completar módulo 3 del curso
INSERT INTO goals (id, user_id, title, description, category_id, type, target_value, current_value, unit, start_date, end_date, is_public, is_completed)
VALUES (
  g_mensual_2, v_user_id,
  'Terminar módulo 3 del curso de Next.js',
  'Avanzar en el curso y completar todos los ejercicios del módulo.',
  3, 'mensual', 12, 9, 'lecciones',
  '2026-03-01', '2026-03-31',
  false, false
);

-- TRIMESTRAL: Correr 100km en Q1 2026
INSERT INTO goals (id, user_id, title, description, category_id, type, target_value, current_value, unit, start_date, end_date, is_public, is_completed)
VALUES (
  g_trimestral, v_user_id,
  'Correr 100 km en Q1 2026',
  'Entre enero y marzo. Combinando salidas cortas y largas.',
  1, 'trimestral', 100, 68, 'km',
  '2026-01-01', '2026-03-31',
  true, false
);

-- ANUAL: Leer 24 libros en 2026
INSERT INTO goals (id, user_id, title, description, category_id, type, target_value, current_value, unit, start_date, end_date, is_public, is_completed)
VALUES (
  g_anual_1, v_user_id,
  'Leer 24 libros en 2026',
  'Dos libros por mes. Variedad de géneros y temáticas.',
  2, 'anual', 24, 7, 'libros',
  '2026-01-01', '2026-12-31',
  true, false
);

-- ANUAL: Ahorrar para viaje (completado)
INSERT INTO goals (id, user_id, title, description, category_id, type, target_value, current_value, unit, start_date, end_date, is_public, is_completed)
VALUES (
  g_anual_2, v_user_id,
  'Ahorrar para viaje a Europa',
  'Fondo de ahorro para el viaje planeado en julio.',
  6, 'anual', 5000, 1800, 'USD',
  '2026-01-01', '2026-07-01',
  false, false
);

-- =============================================================
-- HISTORIAL DE PROGRESO DE OBJETIVOS
-- Simula actualizaciones manuales a lo largo del mes
-- =============================================================

-- Libro: arrancó en 0, fue marcando de a 1 por semana
INSERT INTO goal_progress_entries (goal_id, user_id, value, note, recorded_at) VALUES
  (g_mensual_1, v_user_id, 1, 'Terminé "Atomic Habits" de James Clear. Muy bueno.',          '2026-03-07 21:00:00'),
  (g_mensual_1, v_user_id, 2, 'Terminé "El Alquimista". Relectura, pero siempre suma.',       '2026-03-14 22:30:00'),
  (g_mensual_1, v_user_id, 3, 'Terminé "Deep Work" de Cal Newport. Aplicable al 100%.',       '2026-03-22 20:00:00');

-- Curso: actualiza cada ~2-3 días
INSERT INTO goal_progress_entries (goal_id, user_id, value, note, recorded_at) VALUES
  (g_mensual_2, v_user_id, 3,  'Completé las primeras 3 lecciones. Conceptos base claros.',   '2026-03-03 20:00:00'),
  (g_mensual_2, v_user_id, 5,  'Dos más. La parte de Server Components es compleja.',          '2026-03-06 21:00:00'),
  (g_mensual_2, v_user_id, 5,  NULL,                                                            '2026-03-10 19:00:00'),
  (g_mensual_2, v_user_id, 7,  'Retomé el ritmo. Hice 2 lecciones hoy.',                       '2026-03-15 20:30:00'),
  (g_mensual_2, v_user_id, 9,  'Ya casi termino el módulo. Me quedan 3 lecciones.',             '2026-03-20 21:00:00');

-- Correr: actualiza 2-3 veces por semana
INSERT INTO goal_progress_entries (goal_id, user_id, value, note, recorded_at) VALUES
  (g_trimestral, v_user_id, 42, 'Acumulado a fin de enero. Buen mes.',                         '2026-01-31 20:00:00'),
  (g_trimestral, v_user_id, 56, 'Febrero más flojo, mucho frío.',                              '2026-02-28 20:00:00'),
  (g_trimestral, v_user_id, 60, '4km el lunes.',                                               '2026-03-03 19:30:00'),
  (g_trimestral, v_user_id, 63, 'Salida corta de 3km.',                                        '2026-03-07 08:00:00'),
  (g_trimestral, v_user_id, 63, NULL,                                                            '2026-03-11 20:00:00'),
  (g_trimestral, v_user_id, 68, 'Salida larga de 5km. Me sentí bien al final.',                '2026-03-18 19:00:00');

-- Libros anuales: igual que mensual + los de jan/feb
INSERT INTO goal_progress_entries (goal_id, user_id, value, note, recorded_at) VALUES
  (g_anual_1, v_user_id, 2, 'Cerré enero con 2 libros leídos.',                               '2026-01-31 21:00:00'),
  (g_anual_1, v_user_id, 4, 'Febrero: 2 libros más. Cumpliendo el ritmo.',                    '2026-02-28 21:00:00'),
  (g_anual_1, v_user_id, 5, 'Primer libro de marzo terminado.',                               '2026-03-07 21:00:00'),
  (g_anual_1, v_user_id, 6, 'Segundo libro de marzo.',                                        '2026-03-14 22:30:00'),
  (g_anual_1, v_user_id, 7, 'Tercer libro de marzo. Voy bien respecto al objetivo anual.',    '2026-03-22 20:00:00');

-- Ahorro: una actualización mensual
INSERT INTO goal_progress_entries (goal_id, user_id, value, note, recorded_at) VALUES
  (g_anual_2, v_user_id, 600,  'Ahorro de enero.',                                            '2026-01-31 18:00:00'),
  (g_anual_2, v_user_id, 1200, 'Ahorro de febrero. Mes sin gastos extras.',                   '2026-02-28 18:00:00'),
  (g_anual_2, v_user_id, 1800, 'Ahorro de marzo. Voy por buen camino pero hay que acelerar.', '2026-03-23 18:00:00');

END $$;
