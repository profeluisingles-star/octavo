export type ExamPartKind =
  | 'subject-match'
  | 'fill-blank'
  | 'choice-mcq'
  | 'long-answer'
  | 'modal-rewrite'
  | 'word-bank';

export interface ExamQuestionItem {
  id: string;
  prompt: string;
  /** Shown after blank or as hint next to input */
  clue?: string;
  /** For long answers: optional sentence starter displayed as helper */
  starter?: string;
  /** Primary accepted answer */
  answer: string;
  /** Additional exact accepted answers */
  alternatives?: string[];
  /** For long answers: keyword groups where each group is an array of acceptable synonyms */
  requiredConcepts?: string[][];
  /** Multiple choice options (for choice-mcq) */
  options?: string[];
  hint: string;
}

export interface ExamPart {
  partNumber: number;
  title: string;
  topicTag: string;
  instructions: string;
  kind: ExamPartKind;
  ruleTip?: string;
  passageTitle?: string;
  passage?: string;
  wordBank?: string[];
  showVerbChart?: boolean;
  items: ExamQuestionItem[];
}

export interface FinalExam {
  id: string;
  number: 1 | 2 | 3;
  title: string;
  subtitle: string;
  sourceBadge: string;
  schoolHeader: string;
  description: string;
  totalPoints: number;
  parts: ExamPart[];
}

const HOLIDAYS_WORLD_TEXT = `Kat / Germany
In my home country, Germany, I think the best holiday is Christmas. Christmas season is amazing. We have many markets especially for Christmas. Christmas time normally comes with a lot of snow and an amazing atmosphere. My mom makes cookies, and we have lots of friends and family over to our house, so it's a wonderful time.

Phoebe / China
What is your country's best holiday? I think in China the best holiday should be the spring festival. It is the main festival in China, and the families always get together, and the children can get their red pack with the money put in, so everybody likes that holiday.

Isma / Indonesia
My country's best holiday, I think, would be the Ramadan month, just because it is the holy month and everybody is usually pretty nice, and usually have a longer holiday on it, maybe around two weeks or something. So, the Ramadan month would be the best holiday for me.

Antoinette / United States
I'm from the U.S., so I would say the best holiday would be maybe Thanksgiving, although there are some aspects of that holiday that I don't like. I don't like the overeating, but I do like the fact that families get together and talk about reasons why they're thankful for being together and for having family.

Rese / Botswana
My country's best holiday would have to be the Christmas-New Year period, because that's the time when your family gets together and you cook and you make traditional meals and you see your friends. There's a lot of stuff going on in the village and other places, as well as the city.

Tony / Mozambique
I'll say the best holidays are Independence Day and Christmas. Independence Day, it's because that's where we achieved our freedom. And Christmas, that's when family get together to celebrate.`;

const SCHOOL_LIFE_TEXT = `At our school, life is always full of exciting activities. We always start our day with a morning assembly. During the assembly, the principal usually gives a short speech about discipline and respect. After that, we go to our classrooms.

In class, we often work on interesting projects and assignments. Our teachers frequently ask us to participate in group discussions. This helps us share ideas and learn from each other. During break time, my friends and I sometimes play soccer in the schoolyard. If it rains, we usually stay indoors and talk or play board games.

Our school rarely cancels classes, but when it happens, we feel happy because we can go home early. On Fridays, we always have a cleaning activity. Each student usually brings cleaning supplies to help tidy up the classrooms.

After school, I sometimes join the drama club, where we practice acting for school plays. My best friend, Maria, never misses art class because she loves painting.

School life is full of learning and fun, and we always look forward to the next day!`;

const SPORTS_TYPES_TEXT = `Sports are a great way to stay active and healthy. There are many kinds of sports, but we can divide them into indoor and outdoor sports and team and individual sports.

Indoor and Outdoor Sports
Some sports are played inside a building. These are called indoor sports. People play them in gyms, sports halls, or stadiums.
Examples of indoor sports: Basketball, Table Tennis, Gymnastics, Badminton, and bowling.

Other sports are played outside in the open air. These are called outdoor sports. They are usually played in parks, fields, or stadiums.
Examples of outdoor sports: Soccer, Tennis, Running, Cycling, and Baseball.

One big difference: Indoor sports can be played in any weather, but outdoor sports depend on the weather. If it rains, it may be hard to play soccer or tennis outside.

Team and Individual Sports
Some sports need a team. Players work together to win the game. These are called team sports.
Examples of team sports: Soccer, Basketball, Volleyball, and Hockey.

Other sports are played alone. These are called individual sports. The player competes against another person or tries to get a personal best.
Examples of individual sports: Swimming, Tennis, Running, Boxing, and Golf.

All sports are fun and healthy. The most important thing is to enjoy and stay active!`;

const EXAM_2_SCHOOL_TEXT = `Wednesdays are very busy at our high school. Classes begin at seven o'clock in the morning, and every student brings their notebook and textbook. In the first lesson, Mr. Vega teaches Mathematics and helps students solve equations on the board.

At ten o'clock, our eighth-grade group attends English class in room four. During this lesson, we read short stories, practice pronunciation, and ask questions in pairs. My friend Sofia loves English, so she always participates in class.

During lunch at noon, students eat together in the cafeteria and talk about their favorite subjects. On Wednesday afternoons, we have Physical Education on the school field, where everyone runs, stretches, and plays volleyball. At three o'clock, students take the bus home and review their notes before dinner.`;

const EXAM_2_SPORTS_TEXT = `At Oakridge High School, students can join different sports clubs after classes. The school offers indoor and outdoor options so every teenager can stay healthy and active.

In the school gym, students play basketball and table tennis on Mondays and Wednesdays. These indoor sports are very popular during the rainy season because rain cannot stop the games. The coach teaches basic rules and reminds players to respect their teammates.

Outside on the green field, the soccer and track teams practice on Tuesdays and Thursdays. Soccer is a team sport where eleven players pass the ball and try to score goals together. Track and running are individual sports where each athlete tries to improve their personal time.

On Saturdays, families sometimes visit the school stadium to watch friendly matches and cheer for the students.`;

const EXAM_2_HOLIDAYS_TEXT = `Costa Rica celebrates important dates throughout the year, and students learn about them at school. On April 11th, high schools remember Juan Santamaria Day with short assemblies and historical speeches about bravery and national pride.

Another special celebration happens on July 25th, when Guanacaste Day arrives. Students wear traditional clothes, listen to marimba music, and watch folk dances in the schoolyard. Many families cook traditional food like tortillas and arroz con pollo.

On September 15th, the whole country celebrates Independence Day. The night before, children walk with colorful lanterns in the evening parade. In the morning, school bands play drums and students carry blue, white, and red flags through the town. At the end of the year, families gather in December for Christmas and share tamales at home.`;

const EXAM_3_SCHOOL_TEXT = `Every September, our high school organizes a Science and Music Week for eighth-grade students. On Monday morning, the science teachers open the fair in the main hall. Students present simple experiments about plants, clean water, and chemical reactions.

On Tuesday afternoon, the music room stays open for students who want to play the guitar or sing in small groups. Even shy students can join the choir because the music teacher creates a friendly environment. Meanwhile, the art club paints colorful posters for the school hallways.

On Friday at nine o'clock, the principal thanks the teachers and gives certificates to the teams that worked hard all week. Students do not have regular tests on Friday afternoon, so they celebrate with their classmates before going home.`;

const EXAM_3_SPORTS_TEXT = `Many young athletes in Costa Rica practice sports in their free time. Some students prefer team sports because they enjoy communicating with teammates and working toward a common goal. Volleyball and soccer are two favorite team sports in school tournaments.

Other teenagers prefer individual sports like swimming, cycling, and chess-style table tennis singles. In swimming, an athlete trains in a pool and focuses on breathing and speed. Cyclists ride along safe roads early in the morning when the weather is cool.

Whether a student chooses an indoor sport like gymnastics or an outdoor sport like baseball, regular exercise helps teenagers sleep better at night, concentrate in class, and feel happy with their friends.`;

const EXAM_3_HOLIDAYS_TEXT = `Last year, three eighth-grade friends shared their favorite holiday memories in English class.

Lucia / Alajuela
Last July, my family travelled to Santa Cruz in Guanacaste for the July 25th celebration. We saw a colorful parade in the morning and ate delicious corn tortillas with cheese. I really enjoyed the traditional marimba music in the park.

Mateo / Cartago
My favorite holiday last year was Independence Day on September 15th. On September 14th in the evening, my little sister and I carried our handmade lanterns. The next morning, our high school band played in the parade, and everyone felt proud of our freedom.

Valeria / Heredia
In December, my grandparents visited our house for Christmas. We decorated the living room, cooked a warm dinner together, and listened to holiday songs. On December 25th, my cousins and I played board games all afternoon.`;

export const finalExams: FinalExam[] = [
  {
    id: 'exam-1-pdf',
    number: 1,
    title: 'Examen Final 1 · Práctica Oficial del Profesor',
    subtitle: 'Maurilio Alvarado High School · Units 1–5 (Partes 1 a 10)',
    sourceBadge: 'PDF Oficial del Profesor',
    schoolHeader: 'Maurilio Alvarado High School · Prof. Carlos Rodriguez-H · 8th Graders 2026',
    description:
      'Reproducción fiel e interactiva de las 10 partes de la práctica oficial entregada para el examen: materias, presente simple afirmativo/negativo, in/on/at, lectura escolar, can/cannot, deportes, pasado simple, banco de palabras y respuestas completas.',
    totalPoints: 86,
    parts: [
      {
        partNumber: 1,
        title: 'Part 1 · School Subjects (Matching)',
        topicTag: 'Tema 1 · School Subjects',
        instructions: 'Relaciona cada descripción con su tarjeta ilustrada de materia escolar.',
        kind: 'subject-match',
        ruleTip: 'Nota del PDF: para literatura (poems, stories, and novels) selecciona la tarjeta English.',
        items: [
          { id: 'e1-p1-1', prompt: '1. "I deal with numbers, shapes, and equations."', answer: 'Math', hint: 'Numbers, shapes y equations corresponden a Math.' },
          { id: 'e1-p1-2', prompt: '2. "I explore plants, animals, and the human body."', answer: 'Biology', hint: 'Seres vivos (plants, animals, human body) = Biology.' },
          { id: 'e1-p1-3', prompt: '3. "I study chemical reactions and the properties of matter."', answer: 'Chemistry', hint: 'Chemical reactions y matter = Chemistry.' },
          { id: 'e1-p1-4', prompt: '4. "I teach about events and people from the past."', answer: 'History', hint: 'Events and people from the past = History.' },
          { id: 'e1-p1-5', prompt: '5. "I look at the Earth\'s landscapes, countries, and environments."', answer: 'Geography', hint: 'Landscapes y countries = Geography.' },
          { id: 'e1-p1-6', prompt: '6. "I help you analyze poems, stories, and novels."', answer: 'English', alternatives: ['Literature'], hint: 'En la lámina de tarjetas se trabaja en English (Literature).' },
          { id: 'e1-p1-7', prompt: '7. "I encourage creativity through drawing, painting, and sculpture."', answer: 'Art', hint: 'Drawing, painting y sculpture = Art.' },
          { id: 'e1-p1-8', prompt: '8. "I let you play instruments, sing, and learn about rhythms."', answer: 'Music', hint: 'Instruments, sing y rhythms = Music.' },
          { id: 'e1-p1-9', prompt: '9. "I focus on exercise, games, and staying healthy."', answer: 'Physical Education', hint: 'Exercise y staying healthy = Physical Education.' },
          { id: 'e1-p1-10', prompt: '10. "I teach you to write programs and solve problems with technology."', answer: 'Information Technology', hint: 'Programs y technology = Information Technology.' },
        ],
      },
      {
        partNumber: 2,
        title: 'Part 2 · Present Simple (Fill in the blanks)',
        topicTag: 'Tema 2 · Present Simple',
        instructions: 'Completa los espacios conjugando el verbo entre paréntesis en Present Simple. Cuida la 3.ª persona singular (he, she, it).',
        kind: 'fill-blank',
        ruleTip: 'Con I, you, we, they usa el verbo base. Con he, she, it agrega -s, -es o -ies. Con (be) recuerda am/is/are.',
        items: [
          { id: 'e1-p2-1', prompt: '1. I ___ with my friends.', clue: '(play)', answer: 'play', hint: 'Con I el verbo queda en forma base: play.' },
          { id: 'e1-p2-2', prompt: '2. She ___ English every day.', clue: '(study)', answer: 'studies', hint: 'Consonante + y con she cambia a -ies: studies.' },
          { id: 'e1-p2-3', prompt: '3. They ___ many tests.', clue: '(study)', answer: 'study', hint: 'Con they el verbo queda igual: study.' },
          { id: 'e1-p2-4', prompt: '4. My teacher ___ a lot of things.', clue: '(teach)', answer: 'teaches', hint: 'My teacher = he/she; terminado en -ch agrega -es: teaches.' },
          { id: 'e1-p2-5', prompt: '5. We ___ moments in the high school.', clue: '(share)', answer: 'share', hint: 'Con we usa la forma base: share.' },
          { id: 'e1-p2-6', prompt: '6. I ___ Physical Education.', clue: '(not like)', answer: 'do not like', alternatives: ["don't like"], hint: 'Negativa con I usa do not like o don\'t like.' },
          { id: 'e1-p2-7', prompt: '7. Paul ___ five classes a day.', clue: '(attend)', answer: 'attends', hint: 'Paul = he, agrega -s: attends.' },
          { id: 'e1-p2-8', prompt: '8. Leonie ___ Math a lot.', clue: '(like)', answer: 'likes', hint: 'Leonie = she, agrega -s: likes.' },
          { id: 'e1-p2-9', prompt: '9. Music ___ very interesting.', clue: '(be)', answer: 'is', hint: 'Music = it; el verbo be en presente es is.' },
          { id: 'e1-p2-10', prompt: '10. Emma and I ___ to music in English.', clue: '(listen)', answer: 'listen', hint: 'Emma and I = we, usa el verbo base: listen.' },
        ],
      },
      {
        partNumber: 3,
        title: 'Part 3 · Present Simple Negative',
        topicTag: 'Tema 2 · Negativa en Presente Simple',
        instructions: 'Completa las oraciones en forma negativa usando do not o does not + verbo (y presta atención a to be en la #9).',
        kind: 'fill-blank',
        ruleTip: 'I/you/we/they -> do not + verbo base. He/she/it -> does not + verbo base. Con (be) en plural -> are not.',
        items: [
          { id: 'e1-p3-1', prompt: '1. The students ___ their homework on time.', clue: '(do)', answer: 'do not do', alternatives: ["don't do"], hint: 'The students = they -> do not do.' },
          { id: 'e1-p3-2', prompt: '2. Sarah ___ novels during the library period.', clue: '(read)', answer: 'does not read', alternatives: ["doesn't read"], hint: 'Sarah = she -> does not read (sin -s en read).' },
          { id: 'e1-p3-3', prompt: '3. We ___ notes in every class.', clue: '(take)', answer: 'do not take', alternatives: ["don't take"], hint: 'We -> do not take.' },
          { id: 'e1-p3-4', prompt: '4. The teacher ___ the topic clearly.', clue: '(explain)', answer: 'does not explain', alternatives: ["doesn't explain"], hint: 'The teacher = he/she -> does not explain.' },
          { id: 'e1-p3-5', prompt: '5. My classmates ___ the project in groups.', clue: '(discuss)', answer: 'do not discuss', alternatives: ["don't discuss"], hint: 'My classmates = they -> do not discuss.' },
          { id: 'e1-p3-6', prompt: '6. I ___ the exams.', clue: '(review)', answer: 'do not review', alternatives: ["don't review"], hint: 'I -> do not review.' },
          { id: 'e1-p3-7', prompt: '7. Tom ___ in class activities.', clue: '(participate)', answer: 'does not participate', alternatives: ["doesn't participate"], hint: 'Tom = he -> does not participate.' },
          { id: 'e1-p3-8', prompt: '8. The principal ___ events in the assembly.', clue: '(announce)', answer: 'does not announce', alternatives: ["doesn't announce"], hint: 'The principal = he/she -> does not announce.' },
          { id: 'e1-p3-9', prompt: '9. School rules ___ followed by everyone.', clue: '(be)', answer: 'are not', alternatives: ["aren't"], hint: 'School rules es plural con verbo be -> are not.' },
          { id: 'e1-p3-10', prompt: '10. My friends and I ___ presentations before class.', clue: '(practice)', answer: 'do not practice', alternatives: ["don't practice"], hint: 'My friends and I = we -> do not practice.' },
        ],
      },
      {
        partNumber: 4,
        title: 'Part 4 · Prepositions (IN, ON, AT)',
        topicTag: 'Tema 3 · IN, ON and AT',
        instructions: 'Elige la preposición (in, on o at) que completa correctamente cada oración.',
        kind: 'choice-mcq',
        items: [
          { id: 'e1-p4-1', prompt: '1. I go to school ___ the afternoon', options: ['in', 'on', 'at'], answer: 'in', hint: 'Partes del día como the afternoon llevan in.' },
          { id: 'e1-p4-2', prompt: '2. I attend math classes ___ Wednesday', options: ['in', 'on', 'at'], answer: 'on', hint: 'Los días de la semana llevan on.' },
          { id: 'e1-p4-3', prompt: '3. We celebrate Independence Day ___ September 15th', options: ['in', 'on', 'at'], answer: 'on', hint: 'Una fecha completa con mes y día lleva on.' },
          { id: 'e1-p4-4', prompt: '4. She has dinner ___ the evening', options: ['in', 'on', 'at'], answer: 'in', hint: 'The evening lleva in.' },
          { id: 'e1-p4-5', prompt: '5. I was born ___ 1991', options: ['in', 'on', 'at'], answer: 'in', hint: 'Los años solos llevan in.' },
          { id: 'e1-p4-6', prompt: '6. Zoe goes to bed ___ night', options: ['in', 'on', 'at'], answer: 'at', hint: 'Expresión fija: at night.' },
        ],
      },
      {
        partNumber: 5,
        title: 'Part 5 · Reading I: School Life (Complete Answers)',
        topicTag: 'Comprensión de Lectura · Present Simple',
        instructions: 'Responde en inglés con oraciones completas según la lectura.',
        kind: 'long-answer',
        passageTitle: 'School Life: A Day in Our School',
        passage: SCHOOL_LIFE_TEXT,
        items: [
          {
            id: 'e1-p5-1',
            prompt: '1. What do students always do at the beginning of the school day?',
            starter: 'Students always start their day with...',
            answer: 'Students always start their day with a morning assembly.',
            requiredConcepts: [['start', 'begin'], ['morning assembly', 'assembly']],
            hint: 'Busca en el primer párrafo: "We always start our day with a morning assembly."',
          },
          {
            id: 'e1-p5-2',
            prompt: '2. Who gives a speech during the morning assembly?',
            starter: 'The principal...',
            answer: 'The principal gives a short speech during the morning assembly.',
            requiredConcepts: [['principal'], ['gives', 'speech']],
            hint: 'En el primer párrafo dice quién da el discurso: the principal.',
          },
          {
            id: 'e1-p5-3',
            prompt: '3. What topics does the principal usually talk about?',
            starter: 'The principal usually talks about...',
            answer: 'The principal usually talks about discipline and respect.',
            requiredConcepts: [['discipline'], ['respect']],
            hint: 'El discurso trata sobre discipline and respect.',
          },
          {
            id: 'e1-p5-4',
            prompt: '4. What do students do after the assembly?',
            starter: 'After the assembly, students...',
            answer: 'After the assembly, students go to their classrooms.',
            requiredConcepts: [['go'], ['classroom', 'classrooms']],
            hint: 'Después de la asamblea: "we go to our classrooms."',
          },
          {
            id: 'e1-p5-5',
            prompt: '5. What kinds of activities do students do in class?',
            starter: 'In class, students work on...',
            answer: 'In class, students work on interesting projects, assignments, and group discussions.',
            requiredConcepts: [['projects', 'assignments', 'group discussions', 'discussions']],
            hint: 'Segundo párrafo: interesting projects, assignments y group discussions.',
          },
        ],
      },
      {
        partNumber: 6,
        title: 'Part 6 · CAN and CANNOT (Rewrite Sentences)',
        topicTag: 'Tema 4 · CAN and CANNOT',
        instructions: 'Reescribe cada oración usando can (+) o cannot / can’t (-). Elimina la -s, -es o -ies del verbo.',
        kind: 'modal-rewrite',
        ruleTip: 'Fórmula: Sujeto + can / cannot (can’t) + verbo base + complemento.',
        items: [
          { id: 'e1-p6-1', prompt: '1. I play soccer every weekend. (+)', answer: 'I can play soccer every weekend.', hint: 'Agrega can antes de play.' },
          { id: 'e1-p6-2', prompt: '2. She reads a book before bed. (-)', answer: 'She cannot read a book before bed.', alternatives: ["She can't read a book before bed."], hint: 'Usa cannot o can’t y quita la -s a reads -> read.' },
          { id: 'e1-p6-3', prompt: '3. They walk to school every day. (+)', answer: 'They can walk to school every day.', hint: 'They can walk to school every day.' },
          { id: 'e1-p6-4', prompt: '4. We eat lunch at noon. (-)', answer: 'We cannot eat lunch at noon.', alternatives: ["We can't eat lunch at noon."], hint: 'We cannot / can’t eat lunch at noon.' },
          { id: 'e1-p6-5', prompt: '5. He studies English after school. (+)', answer: 'He can study English after school.', hint: 'Cambia studies por la forma base study.' },
          { id: 'e1-p6-6', prompt: '6. Maria likes chocolate ice cream. (-)', answer: 'Maria cannot like chocolate ice cream.', alternatives: ["Maria can't like chocolate ice cream."], hint: 'Quita la -s de likes -> like.' },
          { id: 'e1-p6-7', prompt: '7. The teacher explains the lesson clearly. (+)', answer: 'The teacher can explain the lesson clearly.', hint: 'Quita la -s de explains -> explain.' },
          { id: 'e1-p6-8', prompt: '8. My brother watches television in the evening. (-)', answer: 'My brother cannot watch television in the evening.', alternatives: ["My brother can't watch television in the evening."], hint: 'Quita -es de watches -> watch.' },
          { id: 'e1-p6-9', prompt: '9. The dogs bark at strangers. (+)', answer: 'The dogs can bark at strangers.', hint: 'The dogs can bark at strangers.' },
          { id: 'e1-p6-10', prompt: '10. Carlos drives to work every morning. (-)', answer: 'Carlos cannot drive to work every morning.', alternatives: ["Carlos can't drive to work every morning."], hint: 'Quita la -s de drives -> drive.' },
        ],
      },
      {
        partNumber: 7,
        title: 'Part 7 · Reading II: Different Types of Sports',
        topicTag: 'Tema 5 & Lectura · Sports',
        instructions: 'Selecciona la opción correcta según la lectura sobre deportes.',
        kind: 'choice-mcq',
        passageTitle: 'Different Types of Sports',
        passage: SPORTS_TYPES_TEXT,
        items: [
          { id: 'e1-p7-1', prompt: '1. Why are sports important?', options: ['They are expensive', 'They help people stay active and healthy.', 'They are only for children'], answer: 'They help people stay active and healthy.', hint: 'Primera oración del texto.' },
          { id: 'e1-p7-2', prompt: '2. Where are indoor sports played?', options: ['On beaches', 'Inside buildings.', 'On roads'], answer: 'Inside buildings.', hint: 'Indoor sports are played inside a building.' },
          { id: 'e1-p7-3', prompt: '3. Which of the following is an indoor sport?', options: ['Soccer', 'Cycling', 'Bowling.'], answer: 'Bowling.', hint: 'Ejemplos indoor: Basketball, Table Tennis, Gymnastics, Badminton, and bowling.' },
          { id: 'e1-p7-4', prompt: '4. Where are outdoor sports usually played?', options: ['In sports halls', 'In parks, fields, or stadiums.', 'In classrooms'], answer: 'In parks, fields, or stadiums.', hint: 'Texto: "They are usually played in parks, fields, or stadiums."' },
          { id: 'e1-p7-5', prompt: '5. Which of the following is an outdoor sport?', options: ['Gymnastics', 'Badminton', 'Running.'], answer: 'Running.', hint: 'Ejemplos outdoor: Soccer, Tennis, Running, Cycling, Baseball.' },
          { id: 'e1-p7-6', prompt: '6. What is one advantage of indoor sports?', options: ['They are always team sports', 'They can be played in any weather.', 'They do not need equipment'], answer: 'They can be played in any weather.', hint: 'Pueden jugarse bajo cualquier clima.' },
          { id: 'e1-p7-7', prompt: '7. What can make outdoor sports difficult to play?', options: ['The number of players', 'The weather.', 'The coach'], answer: 'The weather.', hint: 'Si llueve puede ser difícil jugar afuera.' },
          { id: 'e1-p7-8', prompt: '8. What are team sports?', options: ['Sports played in water', 'Sports where players work together.', 'Sports played indoors only'], answer: 'Sports where players work together.', hint: 'En team sports, players work together.' },
          { id: 'e1-p7-9', prompt: '9. Which of the following is a team sport?', options: ['Boxing', 'Swimming', 'Volleyball.'], answer: 'Volleyball.', hint: 'Ejemplos team sports: Soccer, Basketball, Volleyball, Hockey.' },
          { id: 'e1-p7-10', prompt: '10. Which of the following is an individual sport?', options: ['Basketball', 'Swimming.', 'Soccer'], answer: 'Swimming.', hint: 'Ejemplos individual sports: Swimming, Tennis, Running, Boxing, Golf.' },
        ],
      },
      {
        partNumber: 8,
        title: 'Part 8 · Past Simple (Positive & Negative)',
        topicTag: 'Tema 5 · Past Simple',
        instructions: 'Completa cada oración usando la forma correcta en Past Simple (afirmativa o negativa). Consulta la tabla de verbos.',
        kind: 'fill-blank',
        showVerbChart: true,
        ruleTip: 'En afirmativa usa la columna Past simple (ej. saw, wrote, ate). En negativa usa did not (didn\'t) + forma base.',
        items: [
          { id: 'e1-p8-1', prompt: '1. The students ___ extremely hard for their mid-term exams last week.', clue: '(study)', answer: 'studied', hint: 'Pasado afirmativo de study = studied.' },
          { id: 'e1-p8-2', prompt: '2. Martha ___ the documentary because it was far too long.', clue: '(not / enjoy)', answer: 'did not enjoy', alternatives: ["didn't enjoy"], hint: 'Negativa en pasado: did not enjoy + verbo base.' },
          { id: 'e1-p8-3', prompt: '3. Our family ___ to Manuel Antonio during the summer holidays.', clue: '(travel)', answer: 'travelled', alternatives: ['traveled'], hint: 'Pasado de travel: travelled o traveled.' },
          { id: 'e1-p8-4', prompt: '4. I ___ Carlos at the library yesterday afternoon.', clue: '(not / see)', answer: 'did not see', alternatives: ["didn't see"], hint: 'Negativa en pasado vuelve a forma base: did not see.' },
          { id: 'e1-p8-5', prompt: '5. The scientists ___ a new species of frog in the rainforest.', clue: '(discover)', answer: 'discovered', hint: 'Verbo regular en pasado: discovered.' },
          { id: 'e1-p8-6', prompt: '6. We ___ the tickets for the concert because they were sold out.', clue: '(not / buy)', answer: 'did not buy', alternatives: ["didn't buy"], hint: 'Negativa en pasado: did not buy.' },
          { id: 'e1-p8-7', prompt: '7. She ___ a beautiful poem about her childhood memories.', clue: '(write)', answer: 'wrote', hint: 'Irregular: write -> wrote.' },
          { id: 'e1-p8-8', prompt: '8. The technician ___ the broken computer in less than an hour.', clue: '(fix)', answer: 'fixed', hint: 'Regular: fix -> fixed.' },
          { id: 'e1-p8-9', prompt: '9. They ___ the complex instructions provided by the teacher.', clue: '(not / understand)', answer: 'did not understand', alternatives: ["didn't understand"], hint: 'Negativa en pasado: did not understand.' },
          { id: 'e1-p8-10', prompt: '10. Yesterday, I ___ a delicious traditional breakfast with my grandparents.', clue: '(eat)', answer: 'ate', hint: 'Irregular: eat -> ate.' },
        ],
      },
      {
        partNumber: 9,
        title: 'Part 9 · Word Bank: Holidays Around the World',
        topicTag: 'Tema 5 · Holidays Word Bank',
        instructions: 'Completa las oraciones usando las palabras del banco de palabras.',
        kind: 'word-bank',
        passageTitle: 'Holidays Around the World',
        passage: HOLIDAYS_WORLD_TEXT,
        wordBank: ['Germany', 'Christmas', 'snow', 'festival', 'money', 'Ramadan', 'Thanksgiving', 'thankful', 'family', 'freedom'],
        items: [
          { id: 'e1-p9-1', prompt: '1. Kat is from ___.', answer: 'Germany', hint: 'Kat / Germany.' },
          { id: 'e1-p9-2', prompt: '2. The best holiday in Germany is ___.', answer: 'Christmas', hint: 'Kat menciona Christmas.' },
          { id: 'e1-p9-3', prompt: '3. Christmas time in Germany normally comes with a lot of ___.', answer: 'snow', hint: 'Mucha nieve: a lot of snow.' },
          { id: 'e1-p9-4', prompt: '4. Phoebe says the Spring ___ is the best holiday in China.', answer: 'festival', hint: 'Spring festival.' },
          { id: 'e1-p9-5', prompt: '5. Children in China receive red packs with ___ inside.', answer: 'money', hint: 'Sobres rojos con money.' },
          { id: 'e1-p9-6', prompt: '6. Isma thinks the ___ month is the best holiday in Indonesia.', answer: 'Ramadan', hint: 'Ramadan month.' },
          { id: 'e1-p9-7', prompt: '7. Antoinette says ___ is one of the best holidays in the United States.', answer: 'Thanksgiving', hint: 'Día de Acción de Gracias.' },
          { id: 'e1-p9-8', prompt: '8. During Thanksgiving, people talk about why they are ___.', answer: 'thankful', hint: 'Agradecidos: thankful.' },
          { id: 'e1-p9-9', prompt: '9. Rese enjoys the Christmas-New Year period because ___ gets together.', answer: 'family', hint: 'La familia se reúne: family.' },
          { id: 'e1-p9-10', prompt: '10. Tony likes Independence Day because it celebrates the country\'s ___.', answer: 'freedom', hint: 'Achieved our freedom.' },
        ],
      },
      {
        partNumber: 10,
        title: 'Part 10 · Reading III: Holidays (Complete Answers)',
        topicTag: 'Comprensión de Lectura · Holidays',
        instructions: 'Responde en inglés con oraciones completas según el texto de Holidays Around the World.',
        kind: 'long-answer',
        passageTitle: 'Holidays Around the World',
        passage: HOLIDAYS_WORLD_TEXT,
        items: [
          {
            id: 'e1-p10-1',
            prompt: '1. What does Kat think is the best holiday in Germany?',
            starter: 'Kat thinks that...',
            answer: 'Kat thinks that Christmas is the best holiday in Germany.',
            requiredConcepts: [['christmas'], ['best holiday', 'holiday']],
            hint: 'Completa: Kat thinks that Christmas is the best holiday in Germany.',
          },
          {
            id: 'e1-p10-2',
            prompt: '2. What special events can people find in Germany during the Christmas season?',
            starter: 'During Christmas, people can find...',
            answer: 'During Christmas, people can find many Christmas markets.',
            requiredConcepts: [['markets', 'christmas markets']],
            hint: 'Busca en el párrafo de Kat: "We have many markets especially for Christmas."',
          },
          {
            id: 'e1-p10-3',
            prompt: '3. What does Kat\'s mom make during Christmas?',
            starter: 'Kat\'s mom makes...',
            answer: "Kat's mom makes cookies.",
            requiredConcepts: [['cookies']],
            hint: 'Kat dice: "My mom makes cookies."',
          },
          {
            id: 'e1-p10-4',
            prompt: '4. What do children get during the Spring Festival in China?',
            starter: 'Children get...',
            answer: 'Children get a red pack with money inside.',
            requiredConcepts: [['red pack', 'red packs', 'pack'], ['money']],
            hint: 'Phoebe explica que reciben "their red pack with the money put in".',
          },
          {
            id: 'e1-p10-5',
            prompt: '5. Why does Tony like Independence Day in Mozambique?',
            starter: 'Tony likes Independence Day because...',
            answer: 'Tony likes Independence Day because they achieved their freedom.',
            requiredConcepts: [['freedom']],
            hint: 'Tony menciona: "that\'s where we achieved our freedom."',
          },
        ],
      },
    ],
  },

  // =========================================================================
  // EXAMEN FINAL 2 — SIMULACRO A (Misma metodología del profesor, ítems nuevos)
  // =========================================================================
  {
    id: 'exam-2-sim-a',
    number: 2,
    title: 'Examen Final 2 · Simulacro A (Misma Metodología)',
    subtitle: '10 Partes Nuevas · Mismos 5 Temas del Examen',
    sourceBadge: 'Simulacro Nuevo A',
    schoolHeader: 'Práctica Equivalente de Examen Final · Unidades 1–5 · 8.º Año',
    description:
      'Misma estructura exacta de las 10 partes del profesor (School Subjects, Present Simple +/–, in/on/at, lecturas, can/cannot, deportes, Past Simple, banco de palabras y respuestas completas), pero con oraciones y textos totalmente nuevos para comprobar dominio real.',
    totalPoints: 86,
    parts: [
      {
        partNumber: 1,
        title: 'Part 1 · School Subjects (Matching)',
        topicTag: 'Tema 1 · School Subjects',
        instructions: 'Relaciona cada pista nueva con la tarjeta de materia escolar correspondiente.',
        kind: 'subject-match',
        items: [
          { id: 'e2-p1-1', prompt: '1. "Students draw landscapes and mix colors with brushes."', answer: 'Art', hint: 'Dibujar y mezclar colores con pinceles = Art.' },
          { id: 'e2-p1-2', prompt: '2. "We learn how to write code and create digital presentations."', answer: 'Information Technology', hint: 'Code y digital presentations = Information Technology.' },
          { id: 'e2-p1-3', prompt: '3. "In this class, we act in short plays on stage."', answer: 'Drama', hint: 'Act in plays on stage = Drama.' },
          { id: 'e2-p1-4', prompt: '4. "We calculate percentages, fractions, and angles."', answer: 'Math', hint: 'Percentages, fractions, angles = Math.' },
          { id: 'e2-p1-5', prompt: '5. "The teacher shows us continents, oceans, and mountain ranges."', answer: 'Geography', hint: 'Continents, oceans, mountains = Geography.' },
          { id: 'e2-p1-6', prompt: '6. "We read dialogues, practice vocabulary, and write essays in another language."', answer: 'English', hint: 'Vocabulario y diálogos en otro idioma = English.' },
          { id: 'e2-p1-7', prompt: '7. "Students observe cells under a microscope and study ecosystems."', answer: 'Biology', hint: 'Cells y ecosystems = Biology.' },
          { id: 'e2-p1-8', prompt: '8. "We run laps, stretch, and play basketball to stay strong."', answer: 'Physical Education', hint: 'Run laps, stretch, play basketball = Physical Education.' },
          { id: 'e2-p1-9', prompt: '9. "We study independence movements and ancient civilizations."', answer: 'History', hint: 'Independence movements y ancient civilizations = History.' },
          { id: 'e2-p1-10', prompt: '10. "We mix liquids in test tubes and observe reactions safely."', answer: 'Chemistry', hint: 'Test tubes y chemical reactions = Chemistry.' },
        ],
      },
      {
        partNumber: 2,
        title: 'Part 2 · Present Simple (Fill in the blanks)',
        topicTag: 'Tema 2 · Present Simple',
        instructions: 'Completa con el verbo en Present Simple. Vigila la 3.ª persona singular y el verbo be.',
        kind: 'fill-blank',
        items: [
          { id: 'e2-p2-1', prompt: '1. Marco ___ his bicycle to school.', clue: '(ride)', answer: 'rides', hint: 'Marco = he -> rides.' },
          { id: 'e2-p2-2', prompt: '2. We ___ our science project on Mondays.', clue: '(prepare)', answer: 'prepare', hint: 'We -> forma base: prepare.' },
          { id: 'e2-p2-3', prompt: '3. Mrs. Campos ___ Chemistry in the lab.', clue: '(teach)', answer: 'teaches', hint: 'Terminado en -ch con she -> teaches.' },
          { id: 'e2-p2-4', prompt: '4. Daniel ___ very hard before every exam.', clue: '(study)', answer: 'studies', hint: 'Consonante + y -> studies.' },
          { id: 'e2-p2-5', prompt: '5. The library ___ quiet and comfortable.', clue: '(be)', answer: 'is', hint: 'The library = it -> is.' },
          { id: 'e2-p2-6', prompt: '6. My cousins ___ soccer on Saturdays.', clue: '(play)', answer: 'play', hint: 'My cousins = they -> play.' },
          { id: 'e2-p2-7', prompt: '7. Sofia ___ to bring her calculator.', clue: '(not remember)', answer: 'does not remember', alternatives: ["doesn't remember"], hint: 'Sofia = she en negativa -> does not remember.' },
          { id: 'e2-p2-8', prompt: '8. Our principal ___ early every morning.', clue: '(arrive)', answer: 'arrives', hint: 'Our principal = he/she -> arrives.' },
          { id: 'e2-p2-9', prompt: '9. I ___ my backpack before sleeping.', clue: '(check)', answer: 'check', hint: 'I -> forma base: check.' },
          { id: 'e2-p2-10', prompt: '10. Luis and Ana ___ a lot of fruit at lunch.', clue: '(eat)', answer: 'eat', hint: 'Luis and Ana = they -> eat.' },
        ],
      },
      {
        partNumber: 3,
        title: 'Part 3 · Present Simple Negative',
        topicTag: 'Tema 2 · Negativa en Presente Simple',
        instructions: 'Completa en negativa usando do not o does not + verbo (y are not / is not si el verbo es be).',
        kind: 'fill-blank',
        items: [
          { id: 'e2-p3-1', prompt: '1. Elena ___ television during school hours.', clue: '(watch)', answer: 'does not watch', alternatives: ["doesn't watch"], hint: 'Elena = she -> does not watch.' },
          { id: 'e2-p3-2', prompt: '2. The boys ___ late for morning assembly.', clue: '(arrive)', answer: 'do not arrive', alternatives: ["don't arrive"], hint: 'The boys = they -> do not arrive.' },
          { id: 'e2-p3-3', prompt: '3. I ___ junk food in the cafeteria.', clue: '(buy)', answer: 'do not buy', alternatives: ["don't buy"], hint: 'I -> do not buy.' },
          { id: 'e2-p3-4', prompt: '4. My dog ___ inside the classroom.', clue: '(sleep)', answer: 'does not sleep', alternatives: ["doesn't sleep"], hint: 'My dog = it -> does not sleep.' },
          { id: 'e2-p3-5', prompt: '5. We ___ dictionaries during the English test.', clue: '(use)', answer: 'do not use', alternatives: ["don't use"], hint: 'We -> do not use.' },
          { id: 'e2-p3-6', prompt: '6. Carlos ___ his English workbook at home.', clue: '(forget)', answer: 'does not forget', alternatives: ["doesn't forget"], hint: 'Carlos = he -> does not forget.' },
          { id: 'e2-p3-7', prompt: '7. Cellphones ___ allowed in the exam room.', clue: '(be)', answer: 'are not', alternatives: ["aren't"], hint: 'Cellphones (plural) + be -> are not.' },
          { id: 'e2-p3-8', prompt: '8. You ___ the question before reading carefully.', clue: '(answer)', answer: 'do not answer', alternatives: ["don't answer"], hint: 'You -> do not answer.' },
          { id: 'e2-p3-9', prompt: '9. The bus ___ at midnight.', clue: '(pass)', answer: 'does not pass', alternatives: ["doesn't pass"], hint: 'The bus = it -> does not pass.' },
          { id: 'e2-p3-10', prompt: '10. Ana and I ___ classes on Sundays.', clue: '(attend)', answer: 'do not attend', alternatives: ["don't attend"], hint: 'Ana and I = we -> do not attend.' },
        ],
      },
      {
        partNumber: 4,
        title: 'Part 4 · Prepositions (IN, ON, AT)',
        topicTag: 'Tema 3 · IN, ON and AT',
        instructions: 'Elige la preposición correcta (in, on o at) según la expresión de tiempo.',
        kind: 'choice-mcq',
        items: [
          { id: 'e2-p4-1', prompt: '1. Our English class starts ___ 7:30 a.m.', options: ['in', 'on', 'at'], answer: 'at', hint: 'Las horas exactas llevan at.' },
          { id: 'e2-p4-2', prompt: '2. Students have a cleaning activity ___ Fridays.', options: ['in', 'on', 'at'], answer: 'on', hint: 'Los días de la semana llevan on.' },
          { id: 'e2-p4-3', prompt: '3. The rainy season usually begins ___ May.', options: ['in', 'on', 'at'], answer: 'in', hint: 'Un mes sin día lleva in.' },
          { id: 'e2-p4-4', prompt: '4. We eat lunch ___ noon.', options: ['in', 'on', 'at'], answer: 'at', hint: 'At noon es una expresión fija.' },
          { id: 'e2-p4-5', prompt: '5. Costa Rica celebrates Guanacaste Day ___ July 25th.', options: ['in', 'on', 'at'], answer: 'on', hint: 'Mes + día = fecha específica -> on.' },
          { id: 'e2-p4-6', prompt: '6. My brother practices guitar ___ the morning.', options: ['in', 'on', 'at'], answer: 'in', hint: 'In the morning lleva in.' },
        ],
      },
      {
        partNumber: 5,
        title: 'Part 5 · Reading I: A Busy Wednesday (Complete Answers)',
        topicTag: 'Comprensión de Lectura · Present Simple',
        instructions: 'Responde en inglés con oraciones completas según el texto.',
        kind: 'long-answer',
        passageTitle: 'A Busy Wednesday at Our High School',
        passage: EXAM_2_SCHOOL_TEXT,
        items: [
          {
            id: 'e2-p5-1',
            prompt: '1. What time do classes begin on Wednesdays?',
            starter: 'Classes begin at...',
            answer: "Classes begin at seven o'clock in the morning.",
            requiredConcepts: [['seven', '7', '7:00']],
            hint: 'Primera línea: "Classes begin at seven o\'clock in the morning."',
          },
          {
            id: 'e2-p5-2',
            prompt: '2. Who teaches Mathematics in the first lesson?',
            starter: 'Mr. Vega...',
            answer: 'Mr. Vega teaches Mathematics in the first lesson.',
            requiredConcepts: [['vega'], ['teach', 'teaches', 'math', 'mathematics']],
            hint: 'Primer párrafo: "Mr. Vega teaches Mathematics."',
          },
          {
            id: 'e2-p5-3',
            prompt: '3. Where does the eighth-grade group attend English class?',
            starter: 'The eighth-grade group attends English class in...',
            answer: 'The eighth-grade group attends English class in room four.',
            requiredConcepts: [['room four', 'room 4']],
            hint: 'Segundo párrafo: "attends English class in room four."',
          },
          {
            id: 'e2-p5-4',
            prompt: '4. What do students do in Physical Education on Wednesday afternoons?',
            starter: 'Students run, stretch, and...',
            answer: 'Students run, stretch, and play volleyball.',
            requiredConcepts: [['run'], ['volleyball']],
            hint: 'Tercer párrafo: "everyone runs, stretches, and plays volleyball."',
          },
          {
            id: 'e2-p5-5',
            prompt: '5. When do students review their notes?',
            starter: 'Students review their notes...',
            answer: 'Students review their notes before dinner.',
            requiredConcepts: [['before dinner']],
            hint: 'Última oración: "review their notes before dinner."',
          },
        ],
      },
      {
        partNumber: 6,
        title: 'Part 6 · CAN and CANNOT (Rewrite Sentences)',
        topicTag: 'Tema 4 · CAN and CANNOT',
        instructions: 'Reescribe cada oración con can (+) o cannot / can’t (-), eliminando -s, -es o -ies.',
        kind: 'modal-rewrite',
        ruleTip: 'Después de can o cannot siempre va el verbo en su forma base.',
        items: [
          { id: 'e2-p6-1', prompt: '1. Lucia speaks English in class. (+)', answer: 'Lucia can speak English in class.', hint: 'Quita la -s a speaks -> speak.' },
          { id: 'e2-p6-2', prompt: '2. They use cellphones during the test. (-)', answer: 'They cannot use cellphones during the test.', alternatives: ["They can't use cellphones during the test."], hint: 'Usa cannot o can\'t + use.' },
          { id: 'e2-p6-3', prompt: '3. My cousin plays the guitar well. (+)', answer: 'My cousin can play the guitar well.', hint: 'Quita -s a plays -> play.' },
          { id: 'e2-p6-4', prompt: '4. David runs fast with a heavy backpack. (-)', answer: 'David cannot run fast with a heavy backpack.', alternatives: ["David can't run fast with a heavy backpack."], hint: 'Quita -s a runs -> run.' },
          { id: 'e2-p6-5', prompt: '5. The students solve equations quickly. (+)', answer: 'The students can solve equations quickly.', hint: 'The students can solve equations quickly.' },
          { id: 'e2-p6-6', prompt: '6. Sara watches movies at midnight on weekdays. (-)', answer: 'Sara cannot watch movies at midnight on weekdays.', alternatives: ["Sara can't watch movies at midnight on weekdays."], hint: 'Quita -es a watches -> watch.' },
          { id: 'e2-p6-7', prompt: '7. Our teacher explains irregular verbs clearly. (+)', answer: 'Our teacher can explain irregular verbs clearly.', hint: 'Quita -s a explains -> explain.' },
          { id: 'e2-p6-8', prompt: '8. Andres studies with loud music. (-)', answer: 'Andres cannot study with loud music.', alternatives: ["Andres can't study with loud music."], hint: 'Cambia studies por study.' },
          { id: 'e2-p6-9', prompt: '9. Birds fly across the park. (+)', answer: 'Birds can fly across the park.', hint: 'Birds can fly across the park.' },
          { id: 'e2-p6-10', prompt: '10. Paula fixes the science computer alone. (-)', answer: 'Paula cannot fix the science computer alone.', alternatives: ["Paula can't fix the science computer alone."], hint: 'Quita -es a fixes -> fix.' },
        ],
      },
      {
        partNumber: 7,
        title: 'Part 7 · Reading II: School Sports Clubs (Multiple Choice)',
        topicTag: 'Tema 5 & Lectura · Sports',
        instructions: 'Marca la opción correcta según la lectura sobre los clubes deportivos.',
        kind: 'choice-mcq',
        passageTitle: 'School Sports Clubs and Fair Play',
        passage: EXAM_2_SPORTS_TEXT,
        items: [
          { id: 'e2-p7-1', prompt: '1. When can students join sports clubs at Oakridge High School?', options: ['Before breakfast', 'After classes', 'At midnight'], answer: 'After classes', hint: 'Primera oración.' },
          { id: 'e2-p7-2', prompt: '2. Why does the school offer indoor and outdoor options?', options: ['So every student can stay healthy and active', 'Because the gym is closed', 'To cancel math classes'], answer: 'So every student can stay healthy and active', hint: 'Segunda oración.' },
          { id: 'e2-p7-3', prompt: '3. Which sports do students play in the school gym?', options: ['Soccer and track', 'Basketball and table tennis', 'Cycling and golf'], answer: 'Basketball and table tennis', hint: 'Segundo párrafo.' },
          { id: 'e2-p7-4', prompt: '4. On which days do students play in the gym?', options: ['Mondays and Wednesdays', 'Tuesdays and Thursdays', 'Fridays and Sundays'], answer: 'Mondays and Wednesdays', hint: 'Segundo párrafo.' },
          { id: 'e2-p7-5', prompt: '5. Why are indoor sports popular during the rainy season?', options: ['Rain cannot stop the games', 'Players use umbrellas', 'There is no coach'], answer: 'Rain cannot stop the games', hint: 'Indoor = bajo techo, la lluvia no detiene el juego.' },
          { id: 'e2-p7-6', prompt: '6. What does the coach remind players to do?', options: ['Buy new uniforms', 'Respect their teammates', 'Run outdoors in the rain'], answer: 'Respect their teammates', hint: 'Final del segundo párrafo.' },
          { id: 'e2-p7-7', prompt: '7. Where do the soccer and track teams practice?', options: ['In the library', 'On the green field', 'In the cafeteria'], answer: 'On the green field', hint: 'Tercer párrafo.' },
          { id: 'e2-p7-8', prompt: '8. How many players work together on a soccer team?', options: ['Five players', 'Eleven players', 'Two players'], answer: 'Eleven players', hint: 'Tercer párrafo: eleven players.' },
          { id: 'e2-p7-9', prompt: '9. What kind of sport is track and running?', options: ['An individual sport', 'An indoor sport', 'A board game'], answer: 'An individual sport', hint: 'Tercer párrafo.' },
          { id: 'e2-p7-10', prompt: '10. Who visits the stadium on Saturdays?', options: ['Only principals', 'Families', 'Bus drivers'], answer: 'Families', hint: 'Último párrafo.' },
        ],
      },
      {
        partNumber: 8,
        title: 'Part 8 · Past Simple (Positive & Negative)',
        topicTag: 'Tema 5 · Past Simple',
        instructions: 'Completa en Past Simple (afirmativa o negativa). Usa la tabla de verbos como apoyo.',
        kind: 'fill-blank',
        showVerbChart: true,
        items: [
          { id: 'e2-p8-1', prompt: '1. Yesterday, my sister ___ a new dictionary at the bookstore.', clue: '(buy)', answer: 'bought', hint: 'Pasado irregular de buy = bought.' },
          { id: 'e2-p8-2', prompt: '2. We ___ to the beach because it rained all weekend.', clue: '(not / travel)', answer: 'did not travel', alternatives: ["didn't travel"], hint: 'Negativa en pasado: did not travel.' },
          { id: 'e2-p8-3', prompt: '3. The students ___ the folk dance on Guanacaste Day.', clue: '(enjoy)', answer: 'enjoyed', hint: 'Pasado regular de enjoy = enjoyed.' },
          { id: 'e2-p8-4', prompt: '4. Tom ___ his lunch because he was nervous.', clue: '(not / eat)', answer: 'did not eat', alternatives: ["didn't eat"], hint: 'Negativa: did not eat.' },
          { id: 'e2-p8-5', prompt: '5. Last Friday, I ___ a shooting star from my backyard.', clue: '(see)', answer: 'saw', hint: 'Pasado irregular de see = saw.' },
          { id: 'e2-p8-6', prompt: '6. Elena ___ the essay about Independence Day.', clue: '(write)', answer: 'wrote', hint: 'Pasado irregular de write = wrote.' },
          { id: 'e2-p8-7', prompt: '7. My dad ___ the broken bicycle on Sunday morning.', clue: '(fix)', answer: 'fixed', hint: 'Pasado regular: fixed.' },
          { id: 'e2-p8-8', prompt: '8. They ___ for the quiz until nine o\'clock.', clue: '(study)', answer: 'studied', hint: 'Consonante + y en pasado = studied.' },
          { id: 'e2-p8-9', prompt: '9. The class ___ the difficult grammar rule at first.', clue: '(not / understand)', answer: 'did not understand', alternatives: ["didn't understand"], hint: 'Negativa: did not understand.' },
          { id: 'e2-p8-10', prompt: '10. Students ___ an interesting planet in science class.', clue: '(discover)', answer: 'discovered', hint: 'Pasado regular: discovered.' },
        ],
      },
      {
        partNumber: 9,
        title: 'Part 9 · Word Bank: Celebrations in Costa Rica',
        topicTag: 'Tema 5 · Holidays Word Bank',
        instructions: 'Completa cada oración usando el banco de palabras de la lectura.',
        kind: 'word-bank',
        passageTitle: 'National Holidays & Celebrations in Costa Rica',
        passage: EXAM_2_HOLIDAYS_TEXT,
        wordBank: ['April', 'bravery', 'July', 'marimba', 'dances', 'September', 'lanterns', 'flags', 'December', 'tamales'],
        items: [
          { id: 'e2-p9-1', prompt: '1. Costa Rica remembers Juan Santamaria Day on ___ 11th.', answer: 'April', hint: 'April 11th.' },
          { id: 'e2-p9-2', prompt: '2. Teachers give historical speeches about ___ and pride.', answer: 'bravery', hint: 'Valentía: bravery.' },
          { id: 'e2-p9-3', prompt: '3. Guanacaste Day is celebrated on ___ 25th.', answer: 'July', hint: 'July 25th.' },
          { id: 'e2-p9-4', prompt: '4. At school, students listen to ___ music.', answer: 'marimba', hint: 'Música de marimba.' },
          { id: 'e2-p9-5', prompt: '5. Everyone watches traditional folk ___ in the schoolyard.', answer: 'dances', hint: 'Folk dances.' },
          { id: 'e2-p9-6', prompt: '6. Independence Day takes place on ___ 15th.', answer: 'September', hint: 'September 15th.' },
          { id: 'e2-p9-7', prompt: '7. On September 14th, children walk with colorful ___.', answer: 'lanterns', hint: 'Faroles = lanterns.' },
          { id: 'e2-p9-8', prompt: '8. Students carry blue, white, and red ___.', answer: 'flags', hint: 'Banderas = flags.' },
          { id: 'e2-p9-9', prompt: '9. Families celebrate Christmas in ___.', answer: 'December', hint: 'Mes de Navidad: December.' },
          { id: 'e2-p9-10', prompt: '10. Families share traditional ___ at home.', answer: 'tamales', hint: 'Última línea.' },
        ],
      },
      {
        partNumber: 10,
        title: 'Part 10 · Reading III: Costa Rica Holidays (Complete Answers)',
        topicTag: 'Comprensión de Lectura · Holidays',
        instructions: 'Responde en inglés con oraciones completas según la lectura de Costa Rica.',
        kind: 'long-answer',
        passageTitle: 'National Holidays & Celebrations in Costa Rica',
        passage: EXAM_2_HOLIDAYS_TEXT,
        items: [
          {
            id: 'e2-p10-1',
            prompt: '1. How do high schools remember Juan Santamaria Day?',
            starter: 'High schools remember Juan Santamaria Day with...',
            answer: 'High schools remember Juan Santamaria Day with short assemblies and historical speeches.',
            requiredConcepts: [['assemblies', 'assembly'], ['speeches']],
            hint: 'Primer párrafo: short assemblies and historical speeches.',
          },
          {
            id: 'e2-p10-2',
            prompt: '2. What traditional clothes and dances appear on July 25th?',
            starter: 'Students wear traditional clothes and watch...',
            answer: 'Students wear traditional clothes and watch folk dances.',
            requiredConcepts: [['traditional clothes', 'clothes'], ['folk dances', 'dances']],
            hint: 'Segundo párrafo.'
          },
          {
            id: 'e2-p10-3',
            prompt: '3. When do children walk with colorful lanterns?',
            starter: 'Children walk with colorful lanterns on...',
            answer: 'Children walk with colorful lanterns in the evening parade on September 14th.',
            requiredConcepts: [['evening', 'september 14', 'night before']],
            hint: 'The night before September 15th in the evening parade.'
          },
          {
            id: 'e2-p10-4',
            prompt: '4. What do school bands do on Independence Day morning?',
            starter: 'School bands...',
            answer: 'School bands play drums in the morning.',
            requiredConcepts: [['play', 'drums']],
            hint: 'Tercer párrafo: school bands play drums.'
          },
          {
            id: 'e2-p10-5',
            prompt: '5. When do families gather for Christmas and what food do they share?',
            starter: 'Families gather in December and share...',
            answer: 'Families gather in December and share tamales at home.',
            requiredConcepts: [['december'], ['tamales']],
            hint: 'Última oración del texto.'
          },
        ],
      },
    ],
  },

  // =========================================================================
  // EXAMEN FINAL 3 — SIMULACRO B (Nivel Examen Real, Variación Completa)
  // =========================================================================
  {
    id: 'exam-3-sim-b',
    number: 3,
    title: 'Examen Final 3 · Simulacro B (Preparación Completa)',
    subtitle: '10 Partes Nuevas · Práctica Final Antes del Examen',
    sourceBadge: 'Simulacro Nuevo B',
    schoolHeader: 'Simulacro Final de Consolidación · Unidades 1–5 · 8.º Año',
    description:
      'Tercer examen completo de práctica con situaciones totalmente distintas sobre las 10 partes oficiales: materias, conjugación afirmativa/negativa, preposiciones in/on/at, lectura de feria científica, reescritura con can/cannot, deportes, verbos en pasado simple y tradiciones.',
    totalPoints: 86,
    parts: [
      {
        partNumber: 1,
        title: 'Part 1 · School Subjects (Matching)',
        topicTag: 'Tema 1 · School Subjects',
        instructions: 'Elige la tarjeta de materia escolar que corresponde a cada descripción.',
        kind: 'subject-match',
        items: [
          { id: 'e3-p1-1', prompt: '1. "Students practice singing, rhythm, and reading musical notes."', answer: 'Music', hint: 'Musical notes y singing = Music.' },
          { id: 'e3-p1-2', prompt: '2. "We explore basic physics, experiments, and nature together."', answer: 'Science', hint: 'Ciencia general = Science.' },
          { id: 'e3-p1-3', prompt: '3. "We use maps and atlases to locate rivers and capital cities."', answer: 'Geography', hint: 'Maps y capital cities = Geography.' },
          { id: 'e3-p1-4', prompt: '4. "You learn grammar rules, reading comprehension, and pronunciation."', answer: 'English', hint: 'Grammar y pronunciation = English.' },
          { id: 'e3-p1-5', prompt: '5. "Students practice algebraic formulas and geometry."', answer: 'Math', hint: 'Algebra y geometry = Math.' },
          { id: 'e3-p1-6', prompt: '6. "We study atoms, elements, and chemical formulas."', answer: 'Chemistry', hint: 'Atoms y chemical formulas = Chemistry.' },
          { id: 'e3-p1-7', prompt: '7. "We rehearse costumes, scripts, and theater performances."', answer: 'Drama', hint: 'Scripts y theater = Drama.' },
          { id: 'e3-p1-8', prompt: '8. "We learn about human organs, animals, and rainforest plants."', answer: 'Biology', hint: 'Organs, animals, plants = Biology.' },
          { id: 'e3-p1-9', prompt: '9. "Students sculpt clay and paint watercolors."', answer: 'Art', hint: 'Sculpt clay y watercolors = Art.' },
          { id: 'e3-p1-10', prompt: '10. "We type documents, use spreadsheets, and solve software tasks."', answer: 'Information Technology', hint: 'Spreadsheets y software = Information Technology.' },
        ],
      },
      {
        partNumber: 2,
        title: 'Part 2 · Present Simple (Fill in the blanks)',
        topicTag: 'Tema 2 · Present Simple',
        instructions: 'Conjuga cada verbo en Present Simple según el sujeto.',
        kind: 'fill-blank',
        items: [
          { id: 'e3-p2-1', prompt: '1. Valeria ___ to the library after school.', clue: '(go)', answer: 'goes', hint: 'Valeria = she; go -> goes.' },
          { id: 'e3-p2-2', prompt: '2. Our team ___ every match with respect.', clue: '(win)', answer: 'wins', hint: 'Our team (singular) -> wins.' },
          { id: 'e3-p2-3', prompt: '3. My parents ___ me with my English homework.', clue: '(help)', answer: 'help', hint: 'My parents = they -> help.' },
          { id: 'e3-p2-4', prompt: '4. Gabriel ___ his tablet at home on exam days.', clue: '(leave)', answer: 'leaves', hint: 'Gabriel = he -> leaves.' },
          { id: 'e3-p2-5', prompt: '5. These exercises ___ very helpful.', clue: '(be)', answer: 'are', hint: 'These exercises es plural -> are.' },
          { id: 'e3-p2-6', prompt: '6. I ___ notes in blue ink.', clue: '(write)', answer: 'write', hint: 'I -> forma base: write.' },
          { id: 'e3-p2-7', prompt: '7. She ___ breakfast at six o\'clock.', clue: '(have)', answer: 'has', hint: 'Irregular con she: have -> has.' },
          { id: 'e3-p2-8', prompt: '8. Mateo ___ the broken desk in the classroom.', clue: '(fix)', answer: 'fixes', hint: 'Terminado en -x -> fixes.' },
          { id: 'e3-p2-9', prompt: '9. The students ___ to music with headphones.', clue: '(not listen)', answer: 'do not listen', alternatives: ["don't listen"], hint: 'Negativa plural -> do not listen.' },
          { id: 'e3-p2-10', prompt: '10. You ___ the instructions before starting.', clue: '(read)', answer: 'read', hint: 'You -> forma base: read.' },
        ],
      },
      {
        partNumber: 3,
        title: 'Part 3 · Present Simple Negative',
        topicTag: 'Tema 2 · Negativa en Presente Simple',
        instructions: 'Escribe la forma negativa en Present Simple (do not / does not + verbo, o am/is/are not).',
        kind: 'fill-blank',
        items: [
          { id: 'e3-p3-1', prompt: '1. Andrea ___ whiteout on her exam sheet.', clue: '(use)', answer: 'does not use', alternatives: ["doesn't use"], hint: 'Andrea = she -> does not use.' },
          { id: 'e3-p3-2', prompt: '2. We ___ soccer inside the classroom.', clue: '(play)', answer: 'do not play', alternatives: ["don't play"], hint: 'We -> do not play.' },
          { id: 'e3-p3-3', prompt: '3. The teacher ___ calculators on this test.', clue: '(allow)', answer: 'does not allow', alternatives: ["doesn't allow"], hint: 'The teacher = he/she -> does not allow.' },
          { id: 'e3-p3-4', prompt: '4. Dictionaries ___ necessary for this reading.', clue: '(be)', answer: 'are not', alternatives: ["aren't"], hint: 'Dictionaries es plural con be -> are not.' },
          { id: 'e3-p3-5', prompt: '5. I ___ my pencil for official exams.', clue: '(choose)', answer: 'do not choose', alternatives: ["don't choose"], hint: 'I -> do not choose.' },
          { id: 'e3-p3-6', prompt: '6. Luis ___ late to school assemblies.', clue: '(come)', answer: 'does not come', alternatives: ["doesn't come"], hint: 'Luis = he -> does not come.' },
          { id: 'e3-p3-7', prompt: '7. They ___ extra sheets during the quiz.', clue: '(need)', answer: 'do not need', alternatives: ["don't need"], hint: 'They -> do not need.' },
          { id: 'e3-p3-8', prompt: '8. My sister ___ comics before finishing homework.', clue: '(read)', answer: 'does not read', alternatives: ["doesn't read"], hint: 'My sister = she -> does not read.' },
          { id: 'e3-p3-9', prompt: '9. The school ___ classes on sunny Mondays.', clue: '(cancel)', answer: 'does not cancel', alternatives: ["doesn't cancel"], hint: 'The school = it -> does not cancel.' },
          { id: 'e3-p3-10', prompt: '10. Pablo and you ___ during silent reading.', clue: '(talk)', answer: 'do not talk', alternatives: ["don't talk"], hint: 'Pablo and you = plural -> do not talk.' },
        ],
      },
      {
        partNumber: 4,
        title: 'Part 4 · Prepositions (IN, ON, AT)',
        topicTag: 'Tema 3 · IN, ON and AT',
        instructions: 'Elige la preposición correcta (in, on o at) para cada caso.',
        kind: 'choice-mcq',
        items: [
          { id: 'e3-p4-1', prompt: '1. The science fair opens ___ Monday morning.', options: ['in', 'on', 'at'], answer: 'on', hint: 'Día + parte del día -> manda el día: on Monday morning.' },
          { id: 'e3-p4-2', prompt: '2. Our final exam is ___ November.', options: ['in', 'on', 'at'], answer: 'in', hint: 'Mes sin día -> in November.' },
          { id: 'e3-p4-3', prompt: '3. The school bell rings ___ 11:45 a.m.', options: ['in', 'on', 'at'], answer: 'at', hint: 'Hora exacta -> at.' },
          { id: 'e3-p4-4', prompt: '4. My grandmother was born ___ 1965.', options: ['in', 'on', 'at'], answer: 'in', hint: 'Año -> in.' },
          { id: 'e3-p4-5', prompt: '5. People watch fireworks ___ December 31st.', options: ['in', 'on', 'at'], answer: 'on', hint: 'Fecha exacta con día -> on.' },
          { id: 'e3-p4-6', prompt: '6. Students sleep well ___ night.', options: ['in', 'on', 'at'], answer: 'at', hint: 'At night.' },
        ],
      },
      {
        partNumber: 5,
        title: 'Part 5 · Reading I: Science & Music Week (Complete Answers)',
        topicTag: 'Comprensión de Lectura · Present Simple',
        instructions: 'Responde en inglés con oraciones completas según la lectura.',
        kind: 'long-answer',
        passageTitle: 'Our Science and Music Week',
        passage: EXAM_3_SCHOOL_TEXT,
        items: [
          {
            id: 'e3-p5-1',
            prompt: '1. When does the high school organize the Science and Music Week?',
            starter: 'The high school organizes it every...',
            answer: 'The high school organizes it every September.',
            requiredConcepts: [['september']],
            hint: 'Primera línea: Every September.'
          },
          {
            id: 'e3-p5-2',
            prompt: '2. Where do the science teachers open the fair on Monday morning?',
            starter: 'They open the fair in...',
            answer: 'They open the fair in the main hall.',
            requiredConcepts: [['main hall']],
            hint: 'Primer párrafo: in the main hall.'
          },
          {
            id: 'e3-p5-3',
            prompt: '3. What can students do in the music room on Tuesday afternoon?',
            starter: 'Students can play the guitar or...',
            answer: 'Students can play the guitar or sing in small groups.',
            requiredConcepts: [['guitar', 'sing']],
            hint: 'Segundo párrafo: play the guitar or sing in small groups.'
          },
          {
            id: 'e3-p5-4',
            prompt: '4. What does the art club paint?',
            starter: 'The art club paints...',
            answer: 'The art club paints colorful posters for the school hallways.',
            requiredConcepts: [['posters', 'colorful posters']],
            hint: 'Segundo párrafo: paints colorful posters.'
          },
          {
            id: 'e3-p5-5',
            prompt: '5. What does the principal give on Friday at nine o\'clock?',
            starter: 'The principal gives...',
            answer: 'The principal gives certificates to the teams.',
            requiredConcepts: [['certificates']],
            hint: 'Tercer párrafo: gives certificates to the teams.'
          },
        ],
      },
      {
        partNumber: 6,
        title: 'Part 6 · CAN and CANNOT (Rewrite Sentences)',
        topicTag: 'Tema 4 · CAN and CANNOT',
        instructions: 'Reescribe usando can (+) o cannot / can’t (-) con verbo base.',
        kind: 'modal-rewrite',
        items: [
          { id: 'e3-p6-1', prompt: '1. Sofía paints colorful posters. (+)', answer: 'Sofía can paint colorful posters.', alternatives: ['Sofia can paint colorful posters.'], hint: 'Quita -s a paints -> paint.' },
          { id: 'e3-p6-2', prompt: '2. Students bring smart watches to the test. (-)', answer: 'Students cannot bring smart watches to the test.', alternatives: ["Students can't bring smart watches to the test."], hint: 'cannot / can\'t + bring.' },
          { id: 'e3-p6-3', prompt: '3. Kevin swims fast in the pool. (+)', answer: 'Kevin can swim fast in the pool.', hint: 'Quita -s a swims -> swim.' },
          { id: 'e3-p6-4', prompt: '4. She writes with a red pencil on the exam. (-)', answer: 'She cannot write with a red pencil on the exam.', alternatives: ["She can't write with a red pencil on the exam."], hint: 'Quita -s a writes -> write.' },
          { id: 'e3-p6-5', prompt: '5. My grandfather tells great stories. (+)', answer: 'My grandfather can tell great stories.', hint: 'Quita -s a tells -> tell.' },
          { id: 'e3-p6-6', prompt: '6. We play outdoor soccer in a heavy storm. (-)', answer: 'We cannot play outdoor soccer in a heavy storm.', alternatives: ["We can't play outdoor soccer in a heavy storm."], hint: 'We cannot / can\'t play...' },
          { id: 'e3-p6-7', prompt: '7. Elena reads stories in English. (+)', answer: 'Elena can read stories in English.', hint: 'Quita -s a reads -> read.' },
          { id: 'e3-p6-8', prompt: '8. Carlos misses his music practice today. (-)', answer: 'Carlos cannot miss his music practice today.', alternatives: ["Carlos can't miss his music practice today."], hint: 'Quita -es a misses -> miss.' },
          { id: 'e3-p6-9', prompt: '9. The athletes train before school. (+)', answer: 'The athletes can train before school.', hint: 'The athletes can train before school.' },
          { id: 'e3-p6-10', prompt: '10. My brother cooks tamales alone. (-)', answer: 'My brother cannot cook tamales alone.', alternatives: ["My brother can't cook tamales alone."], hint: 'Quita -s a cooks -> cook.' },
        ],
      },
      {
        partNumber: 7,
        title: 'Part 7 · Reading II: Young Athletes in Costa Rica',
        topicTag: 'Tema 5 & Lectura · Sports',
        instructions: 'Marca la respuesta correcta según la lectura.',
        kind: 'choice-mcq',
        passageTitle: 'Individual and Team Athletes in Costa Rica',
        passage: EXAM_3_SPORTS_TEXT,
        items: [
          { id: 'e3-p7-1', prompt: '1. When do many young athletes in Costa Rica practice sports?', options: ['In their free time', 'During math exams', 'Only at midnight'], answer: 'In their free time', hint: 'Primera oración.' },
          { id: 'e3-p7-2', prompt: '2. Why do some students prefer team sports?', options: ['They enjoy communicating with teammates', 'They prefer playing alone', 'They do not like coaches'], answer: 'They enjoy communicating with teammates', hint: 'Primer párrafo.' },
          { id: 'e3-p7-3', prompt: '3. Which two team sports are mentioned as school favorites?', options: ['Boxing and golf', 'Volleyball and soccer', 'Cycling and swimming'], answer: 'Volleyball and soccer', hint: 'Final del primer párrafo.' },
          { id: 'e3-p7-4', prompt: '4. Which of these is an individual sport in the text?', options: ['Soccer', 'Swimming', 'Volleyball'], answer: 'Swimming', hint: 'Segundo párrafo.' },
          { id: 'e3-p7-5', prompt: '5. Where does a swimmer train?', options: ['In a pool', 'On a highway', 'In a music room'], answer: 'In a pool', hint: 'Segundo párrafo: in a pool.' },
          { id: 'e3-p7-6', prompt: '6. What do swimmers focus on?', options: ['Breathing and speed', 'Guitar chords', 'Cooking meals'], answer: 'Breathing and speed', hint: 'Segundo párrafo.' },
          { id: 'e3-p7-7', prompt: '7. When do cyclists ride along safe roads?', options: ['Early in the morning', 'Late at midnight', 'During storms'], answer: 'Early in the morning', hint: 'Segundo párrafo.' },
          { id: 'e3-p7-8', prompt: '8. What indoor sport is named in the third paragraph?', options: ['Gymnastics', 'Baseball', 'Cycling'], answer: 'Gymnastics', hint: 'Tercer párrafo: an indoor sport like gymnastics.' },
          { id: 'e3-p7-9', prompt: '9. What outdoor sport is named in the third paragraph?', options: ['Baseball', 'Table tennis', 'Gymnastics'], answer: 'Baseball', hint: 'Tercer párrafo: an outdoor sport like baseball.' },
          { id: 'e3-p7-10', prompt: '10. What are two benefits of regular exercise mentioned at the end?', options: ['Sleep better and concentrate in class', 'Skip classes and eat cookies', 'Stay awake all night'], answer: 'Sleep better and concentrate in class', hint: 'Última línea.' },
        ],
      },
      {
        partNumber: 8,
        title: 'Part 8 · Past Simple (Positive & Negative)',
        topicTag: 'Tema 5 · Past Simple',
        instructions: 'Completa en Past Simple (afirmativa o negativa) usando la tabla de verbos.',
        kind: 'fill-blank',
        showVerbChart: true,
        items: [
          { id: 'e3-p8-1', prompt: '1. Last July, our class ___ to Puntarenas.', clue: '(travel)', answer: 'travelled', alternatives: ['traveled'], hint: 'travelled o traveled.' },
          { id: 'e3-p8-2', prompt: '2. Sofia ___ a poem for the September 15th assembly.', clue: '(write)', answer: 'wrote', hint: 'Irregular: write -> wrote.' },
          { id: 'e3-p8-3', prompt: '3. We ___ the parade because we arrived late.', clue: '(not / see)', answer: 'did not see', alternatives: ["didn't see"], hint: 'Negativa en pasado: did not see.' },
          { id: 'e3-p8-4', prompt: '4. My grandfather ___ the old radio yesterday.', clue: '(fix)', answer: 'fixed', hint: 'Regular: fixed.' },
          { id: 'e3-p8-5', prompt: '5. The students ___ the instructions quickly.', clue: '(understand)', answer: 'understood', hint: 'Irregular: understand -> understood.' },
          { id: 'e3-p8-6', prompt: '6. Carlos ___ the movie because it was boring.', clue: '(not / enjoy)', answer: 'did not enjoy', alternatives: ["didn't enjoy"], hint: 'Negativa: did not enjoy.' },
          { id: 'e3-p8-7', prompt: '7. Yesterday, my mom ___ fresh fruit at the market.', clue: '(buy)', answer: 'bought', hint: 'Irregular: buy -> bought.' },
          { id: 'e3-p8-8', prompt: '8. For lunch, we ___ rice, beans, and plantains.', clue: '(eat)', answer: 'ate', hint: 'Irregular: eat -> ate.' },
          { id: 'e3-p8-9', prompt: '9. The biologists ___ a clean river in the mountains.', clue: '(discover)', answer: 'discovered', hint: 'Regular: discovered.' },
          { id: 'e3-p8-10', prompt: '10. Andres ___ last night because he finished earlier.', clue: '(not / study)', answer: 'did not study', alternatives: ["didn't study"], hint: 'Negativa: did not study.' },
        ],
      },
      {
        partNumber: 9,
        title: 'Part 9 · Word Bank: Holiday Memories',
        topicTag: 'Tema 5 · Holidays Word Bank',
        instructions: 'Completa cada oración usando el banco de palabras de la lectura.',
        kind: 'word-bank',
        passageTitle: 'Last Year\'s Holiday Memories',
        passage: EXAM_3_HOLIDAYS_TEXT,
        wordBank: ['Guanacaste', 'parade', 'tortillas', 'marimba', 'September', 'lanterns', 'freedom', 'December', 'grandparents', 'games'],
        items: [
          { id: 'e3-p9-1', prompt: '1. Lucia travelled to Santa Cruz in ___.', answer: 'Guanacaste', hint: 'Provincia mencionada en el párrafo de Lucia.' },
          { id: 'e3-p9-2', prompt: '2. She saw a colorful ___ in the morning.', answer: 'parade', hint: 'Desfile = parade.' },
          { id: 'e3-p9-3', prompt: '3. They ate corn ___ with cheese.', answer: 'tortillas', hint: 'Corn tortillas.' },
          { id: 'e3-p9-4', prompt: '4. Lucia enjoyed the traditional ___ music in the park.', answer: 'marimba', hint: 'Marimba music.' },
          { id: 'e3-p9-5', prompt: '5. Mateo\'s favorite holiday was on ___ 15th.', answer: 'September', hint: 'September 15th.' },
          { id: 'e3-p9-6', prompt: '6. Mateo and his sister carried handmade ___.', answer: 'lanterns', hint: 'Faroles = lanterns.' },
          { id: 'e3-p9-7', prompt: '7. Everyone felt proud of their ___.', answer: 'freedom', hint: 'Libertad = freedom.' },
          { id: 'e3-p9-8', prompt: '8. Valeria celebrated Christmas in ___.', answer: 'December', hint: 'Mes de Navidad: December.' },
          { id: 'e3-p9-9', prompt: '9. Her ___ visited the house for Christmas.', answer: 'grandparents', hint: 'Abuelos = grandparents.' },
          { id: 'e3-p9-10', prompt: '10. On December 25th, they played board ___.', answer: 'games', hint: 'Board games.' },
        ],
      },
      {
        partNumber: 10,
        title: 'Part 10 · Reading III: Holiday Memories (Complete Answers)',
        topicTag: 'Comprensión de Lectura · Holidays & Past Simple',
        instructions: 'Responde en inglés con oraciones completas según las historias de Lucia, Mateo y Valeria.',
        kind: 'long-answer',
        passageTitle: 'Last Year\'s Holiday Memories',
        passage: EXAM_3_HOLIDAYS_TEXT,
        items: [
          {
            id: 'e3-p10-1',
            prompt: '1. Where did Lucia\'s family travel last July?',
            starter: "Lucia's family travelled to...",
            answer: "Lucia's family travelled to Santa Cruz in Guanacaste.",
            requiredConcepts: [['santa cruz', 'guanacaste']],
            hint: 'Párrafo de Lucia: travelled to Santa Cruz in Guanacaste.'
          },
          {
            id: 'e3-p10-2',
            prompt: '2. What did Lucia eat during the July 25th celebration?',
            starter: 'She ate...',
            answer: 'She ate delicious corn tortillas with cheese.',
            requiredConcepts: [['tortillas'], ['cheese']],
            hint: 'Busca "ate delicious corn tortillas with cheese".'
          },
          {
            id: 'e3-p10-3',
            prompt: '3. When did Mateo and his little sister carry their lanterns?',
            starter: 'They carried their lanterns on...',
            answer: 'They carried their lanterns on September 14th in the evening.',
            requiredConcepts: [['september 14', 'evening']],
            hint: 'Párrafo de Mateo: On September 14th in the evening.'
          },
          {
            id: 'e3-p10-4',
            prompt: '4. What did Valeria\'s family decorate for Christmas?',
            starter: 'They decorated...',
            answer: 'They decorated the living room.',
            requiredConcepts: [['living room']],
            hint: 'Párrafo de Valeria: decorated the living room.'
          },
          {
            id: 'e3-p10-5',
            prompt: '5. What did Valeria and her cousins do on December 25th?',
            starter: 'Valeria and her cousins...',
            answer: 'Valeria and her cousins played board games all afternoon.',
            requiredConcepts: [['board games', 'games']],
            hint: 'Última oración del texto.'
          },
        ],
      },
    ],
  },
];
