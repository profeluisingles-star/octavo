import type { AssessmentMode, Question } from '../types';
import { extraYearVerbs, verbForms } from './curriculum';
import { costaRicaText, gymText, holidaysText, schoolComprehension, schoolLifeText, sportsText } from './readings';

export function normalized(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[’‘]/g, "'")
    .replace(/[.?!]+$/, '')
    .replace(/\s+/g, ' ')
    .replace(/\bdo not\b/g, "don't")
    .replace(/\bdoes not\b/g, "doesn't")
    .replace(/\bdid not\b/g, "didn't")
    .replace(/\bcan not\b|\bcan't\b/g, 'cannot')
    .replace(/\bis not\b/g, "isn't")
    .replace(/\bisn't\b/g, 'is not')
    .replace(/\baren't\b/g, 'are not')
    .replace(/\bI'm\b/gi, 'i am');
}

export function mix<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function make(
  prompt: string,
  correct: string,
  wrong: string[],
  hint: string,
  extra: Partial<Question> = {}
): Question {
  const options = [...new Set([correct, ...wrong])];
  if (options.length !== 3) {
    throw new Error('Se necesitan tres opciones distintas: ' + prompt);
  }
  return { prompt, correct, options, hint, passage: '', ...extra };
}

export function written(
  prompt: string,
  correct: string,
  hint: string,
  extra: Partial<Question> = {}
): Question {
  return { prompt, correct, options: [], hint, passage: '', format: 'write', typed: true, ...extra };
}

export function gapWithVerb(
  subject: string,
  tail: string,
  base: string,
  form: string,
  hint: string,
  opts: { negative?: boolean; cueBefore?: boolean; variants?: string[] } = {}
): Question {
  const { negative = false, cueBefore = false, variants = [] } = opts;
  const cue = negative ? (cueBefore ? 'not / ' : 'not ') + base : base;
  const prompt = cueBefore ? `${subject} (${cue}) ___ ${tail}.` : `${subject} ___ ${tail}. (${cue})`;
  return written(prompt, form, hint, {
    verb: base,
    answerMode: 'blank',
    complete: `${subject} ${form} ${tail}.`,
    alternatives: variants,
  });
}

export function transformQuestion(subject: string, tail: string, verb: string, aux: string): Question {
  const lower = /^(The|My|Our|Her|His|We|They|She|He|You)\b/.test(subject)
    ? subject[0].toLowerCase() + subject.slice(1)
    : subject;
  const question = `${aux} ${lower} ${verb} ${tail}?`;
  const prompt = aux === 'Did' ? `${subject} (${verb}) ___ ${tail}.` : `${subject} ___ ${tail}. (${verb})`;
  return written(
    prompt,
    question,
    `Empieza con ${aux}, pon el sujeto a continuación y usa ${verb} en forma base. Termina con signo de pregunta.`,
    {
      verb,
      answerMode: 'question',
      direction: 'Escribe la pregunta completa en inglés. Usa la información de la oración y el verbo entre paréntesis.',
    }
  );
}

// --- Original PDF Drill Sets (Topics 1, 3, 4) ---
export const exactPresent2: Question[] = (
  [
    ['I', 'with my friends', 'play', 'play', 'I usa el verbo base play.'],
    ['She', 'English every day', 'study', 'studies', 'She lleva studies. Cambia la y por -ies.'],
    ['They', 'many tests', 'study', 'study', 'They usa el verbo base study. Para decir que estudian para muchos exámenes, la expresión habitual es study for many tests.'],
    ['My teacher', 'a lot of things', 'teach', 'teaches', 'My teacher equivale a he o she y teach termina en -ch: teaches.'],
    ['We', 'moments in the high school', 'share', 'share', 'We usa el verbo base share.'],
    ['I', 'Physical Education', 'like', 'do not like', 'I usa do not o don’t. Después va like.', true],
    ['Paul', 'five classes a day', 'attend', 'attends', 'Paul equivale a he. Attend agrega -s.'],
    ['Leonie', 'Math a lot', 'like', 'likes', 'Leonie equivale a she. En afirmativo se escribe likes.'],
    ['Music', 'very interesting', 'be', 'is', 'Music es singular. Con be, usa is.'],
    ['Emma and I', 'to music in English', 'listen', 'listen', 'Emma and I equivale a we. Usa listen.'],
  ] as [string, string, string, string, string, boolean?][]
).map(([who, tail, verb, form, hint, negative]) => gapWithVerb(who, tail, verb, form, hint, { negative }));

export const exactPresent3: Question[] = (
  [
    ['The students', 'their homework on time', 'do', 'do not do'],
    ['Sarah', 'novels during the library period', 'read', 'does not read'],
    ['We', 'notes in every class', 'take', 'do not take'],
    ['The teacher', 'the topic clearly', 'explain', 'does not explain'],
    ['My classmates', 'the project in groups', 'discuss', 'do not discuss'],
    ['I', 'the exams', 'review', 'do not review'],
    ['Tom', 'in class activities', 'participate', 'does not participate'],
    ['The principal', 'events in the assembly', 'announce', 'does not announce'],
    ['School rules', 'followed by everyone', 'be', 'are not'],
    ['My friends and I', 'presentations before class', 'practice', 'do not practice'],
  ] as [string, string, string, string][]
).map(([who, tail, verb, form]) => {
  const prompt = `${who} ___ (${verb}) ${tail}.`;
  const hint =
    verb === 'be'
      ? 'School rules es plural. El verbo be forma su negativa con are not.'
      : `La negativa de ${who} se forma con ${form.split(' ').slice(0, 2).join(' ')} más el verbo base ${verb}.`;
  return written(prompt, form, hint, {
    verb,
    answerMode: 'blank',
    direction: 'Completa en negativo.',
    complete: `${who} ${form} ${tail}.`,
  });
});

export const exactPast8: Question[] = (
  [
    ['The students', 'study', 'extremely hard for their mid-term exams last week'],
    ['Martha', 'enjoy', 'the documentary because it was far too long', true],
    ['Our family', 'travel', 'to Manuel Antonio during the summer holidays'],
    ['I', 'see', 'Carlos at the library yesterday afternoon', true],
    ['The scientists', 'discover', 'a new species of frog in the rainforest'],
    ['We', 'buy', 'the tickets for the concert because they were sold out', true],
    ['She', 'write', 'a beautiful poem about her childhood memories'],
    ['The technician', 'fix', 'the broken computer in less than an hour'],
    ['They', 'understand', 'the complex instructions provided by the teacher', true],
    ['Yesterday, I', 'eat', 'a delicious traditional breakfast with my grandparents'],
  ] as [string, string, string, boolean?][]
).map(([subject, base, tail, negative]) => {
  const verb = verbForms.find((form) => form.base === base)!;
  return gapWithVerb(
    subject,
    tail,
    base,
    negative ? `did not ${base}` : verb.past,
    negative
      ? `Usa did not o didn’t. Como did marca el pasado, el verbo vuelve a ${base}.`
      : verb.rule,
    { negative: Boolean(negative), cueBefore: true, variants: negative ? [] : verb.pastAlternatives || [] }
  );
});

// --- Topic 0: School Subjects ---
const school: [string, string, string[], [string, string]][] = [
  ['Math', 'ecuaciones y figuras', ['I deal with numbers, shapes, and equations.', 'We add fractions and calculate angles.', 'We solve equations with unknown numbers.', 'We measure the sides of triangles.', 'We compare decimals and percentages.', 'We find the area of rectangles.', 'We use multiplication to solve number problems.', 'We count, divide and use formulas.'], ['Chemistry', 'Geography']],
  ['Biology', 'seres vivos', ['I explore plants, animals, and the human body.', 'We study how the heart works.', 'We observe how seeds become plants.', 'We identify the parts of a cell.', 'We study how living things reproduce.', 'We learn how the lungs supply oxygen to the body.', 'We investigate how animals adapt to their habitat.', 'We compare the organs of different animals.'], ['Science', 'Chemistry']],
  ['Chemistry', 'reacciones y propiedades de la materia', ['I study chemical reactions and the properties of matter.', 'We observe how substances react when they mix.', 'We identify acids and bases.', 'We learn what elements and compounds are.', 'We compare the properties of different substances.', 'We investigate what happens when iron rusts.', 'We use the periodic table to identify elements.', 'We balance simple chemical equations.'], ['Science', 'Biology']],
  ['History', 'personas y acontecimientos del pasado', ['I teach about events and people from the past.', 'We place past events on a timeline.', 'We study how people lived centuries ago.', 'We read about the events that led to a war.', 'We find out how an ancient city changed over time.', 'We study the lives of leaders from the past.', 'We compare different periods in a country’s past.', 'We study what happened before and after a revolution.'], ['Geography', 'English']],
  ['Geography', 'lugares, países y paisajes', ['I look at the Earth’s landscapes, countries, and environments.', 'We locate countries on a world map.', 'We study the mountains and rivers of Costa Rica.', 'We locate oceans and continents on a globe.', 'We learn where different deserts are located.', 'We identify borders between countries.', 'We use latitude and longitude to find places.', 'We compare the landscapes of two regions.'], ['History', 'Biology']],
  ['English', 'textos literarios en inglés', ['I help you analyze poems, stories, and novels.', 'We read short stories in English and discuss their characters.', 'We interpret an English-language poem.', 'We compare two English novels.', 'We discuss what the ending of an English story means.', 'We look for themes in a poem written in English.', 'We explain the choices of a character in an English novel.', 'We identify the narrator of a story written in English.'], ['Drama', 'History']],
  ['Art', 'creación visual', ['I encourage creativity through drawing, painting, and sculpture.', 'We paint pictures with watercolors.', 'We make a sculpture out of clay.', 'We sketch a portrait with pencils.', 'We mix colors for a landscape painting.', 'We design a collage with colored paper.', 'We study how a painter used light and color.', 'We make a picture by printing shapes in ink.'], ['Drama', 'Music']],
  ['Music', 'instrumentos, canto y ritmo', ['I let you play instruments, sing, and learn about rhythms.', 'We practice playing a melody on the guitar.', 'We read musical notes before playing the piano.', 'We learn to keep the beat when we sing.', 'We play instruments in a school band.', 'We practice singing together in a choir.', 'We listen for changes in rhythm.', 'We use drums to play a rhythm together.'], ['Art', 'Drama']],
  ['Physical Education', 'ejercicio, juegos y deporte', ['I focus on exercise, games, and staying healthy.', 'We warm up and run laps on the track.', 'We practice passing and catching a ball in the gym.', 'We learn to stretch safely before exercise.', 'We play volleyball and practice our serves.', 'We exercise to improve our strength.', 'We practice jumping over hurdles.', 'We learn how to play on a basketball court.'], ['Biology', 'Music']],
  ['Information Technology', 'computadoras, programas y tecnología', ['I teach you to write programs and solve problems with technology.', 'We write computer code to solve a problem.', 'We learn to organize files and folders on a computer.', 'We design a basic website with code.', 'We create charts in a digital spreadsheet.', 'We practice saving documents on computers.', 'We use software to build a presentation.', 'We fix errors in a computer program.'], ['Math', 'Science']],
];

const schoolMatch: Question[] = school.flatMap(([subject, cue, lines, distractors]) =>
  lines.map((line, i) =>
    make(
      line,
      subject,
      distractors,
      subject === 'English' && i === 0
        ? 'La descripción es de Literature. En la lámina, la tarjeta de lengua dice English.'
        : `La pista es de ${cue}. En la lámina corresponde a ${subject}.`,
      { imageChoices: true }
    )
  )
);

const schoolReverse: Question[] = school.flatMap(([subject, cue, lines], i) =>
  lines.map((line, j) =>
    make(
      'Which description matches this picture?',
      line,
      [school[(i + 1) % school.length][2][j], school[(i + 5) % school.length][2][j]],
      `La tarjeta muestra ${subject}. Busca una descripción de ${cue}.`,
      { picture: subject }
    )
  )
);

// --- Topic 1: Present Simple ---
const subjectPeople: [string, 'first' | 'third' | 'plural'][] = [
  ['I', 'first'],
  ['She', 'third'],
  ['They', 'plural'],
  ['My teacher', 'third'],
  ['We', 'plural'],
  ['Paul', 'third'],
  ['Leonie', 'third'],
  ['Emma and I', 'plural'],
  ['The students', 'plural'],
  ['Sarah', 'third'],
  ['My classmates', 'plural'],
  ['Tom', 'third'],
  ['The principal', 'third'],
  ['My friends and I', 'plural'],
];

const verbsPresent: [string, string, string][] = [
  ['play', 'plays', 'with friends'],
  ['study', 'studies', 'English every day'],
  ['teach', 'teaches', 'two classes'],
  ['share', 'shares', 'ideas during class'],
  ['like', 'likes', 'Physical Education'],
  ['attend', 'attends', 'five classes a day'],
  ['listen', 'listens', 'to music in English'],
  ['do', 'does', 'homework on time'],
  ['read', 'reads', 'novels in the library'],
  ['take', 'takes', 'notes in class'],
  ['explain', 'explains', 'the topic clearly'],
  ['discuss', 'discusses', 'the project'],
  ['review', 'reviews', 'the exam questions'],
  ['practice', 'practices', 'presentations before class'],
  ['go', 'goes', 'to the classroom after assembly'],
  ['have', 'has', 'lunch at noon'],
  ['carry', 'carries', 'a notebook'],
  ['watch', 'watches', 'videos in English'],
  ...verbForms.filter((v) => v.base !== 'study').map((v): [string, string, string] => [v.base, v.third, v.present.replace('her family', 'family')]),
];

const presentAffirm: Question[] = subjectPeople
  .flatMap(([who, kind], i) =>
    verbsPresent
      .filter((_, j) => (i + j) % 3 === 0)
      .map(([verb, third, object]) =>
        gapWithVerb(
          who,
          object,
          verb,
          kind === 'third' ? third : verb,
          kind === 'third'
            ? `${who} funciona como he, she o it. En afirmativo, ${verb} cambia a ${third}.`
            : `Con ${who} se usa el verbo base: ${verb}.`
        )
      )
  )
  .concat(exactPresent2.filter((task) => !task.correct.includes(' ') && task.verb !== 'be'));

const presentNegative: Question[] = subjectPeople
  .flatMap(([who, kind], i) =>
    verbsPresent
      .filter((_, j) => (i + j) % 4 === 0)
      .map(([verb, , object]) => {
        const aux = kind === 'third' ? 'does not' : 'do not';
        return gapWithVerb(
          who,
          object,
          verb,
          `${aux} ${verb}`,
          `Usa ${aux} con ${who} y luego ${verb} en forma base.`,
          { negative: true }
        );
      })
  )
  .concat(
    exactPresent2.filter((task) => task.correct.includes(' ')),
    exactPresent3.filter((task) => task.verb !== 'be')
  );

const presentQuestions: Question[] = subjectPeople
  .flatMap(([who, kind], i) =>
    verbsPresent
      .filter((_, j) => (i + j) % 5 === 0)
      .map(([verb, , object]) => transformQuestion(who, object, verb, kind === 'third' ? 'Does' : 'Do'))
  )
  .concat([
    written('Who ___ a speech at assembly? (give)', 'gives', 'Who funciona como sujeto. Por eso give cambia a gives.', { answerMode: 'blank', complete: 'Who gives a speech at assembly?' }),
    written('Does Paul ___ five classes a day? (attend)', 'attend', 'Con does se usa attend, en forma base.', { answerMode: 'blank', complete: 'Does Paul attend five classes a day?' }),
    written('Where do the students ___ after the assembly? (go)', 'go', 'Where pide lugar. Después de do, go queda en su forma base.', { answerMode: 'blank', complete: 'Where do the students go after the assembly?' }),
    written('Does Sarah ___ novels in the library? (read)', 'read', 'Con Does al inicio, read queda en su forma base.', { answerMode: 'blank', complete: 'Does Sarah read novels in the library?' }),
    written('Do your classmates ___ notes every day? (take)', 'take', 'Después de Do, el verbo vuelve a su forma base take.', { answerMode: 'blank', complete: 'Do your classmates take notes every day?' }),
  ]);

const bePatterns: [string, string, string][] = [
  ['I', 'am', 'ready for class'],
  ['Music', 'is', 'interesting'],
  ['School rules', 'are', 'followed by everyone'],
  ['My classmates', 'are', 'at school'],
  ['The library', 'is', 'open'],
  ['Sarah', 'is', 'in the library'],
  ['We', 'are', 'early for class'],
];

const presentBe: Question[] = bePatterns
  .flatMap(([who, be, end]) => {
    const lowered = /^(My|The|School|We)\b/.test(who) ? who[0].toLowerCase() + who.slice(1) : who;
    return [
      written(`${who} ___ ${end}. (be)`, be, `En presente, ${who} se combina con ${be}.`),
      written(`${who} ___ ${end}. (not / be)`, `${be} not`, `En negativo conserva ${be} y agrega not.`),
      written(`___ ${lowered} ${end}? (be)`, be, `En preguntas con be, ${be} va al inicio.`),
    ];
  })
  .concat(
    exactPresent2.find((t) => t.verb === 'be')!,
    exactPresent3.find((t) => t.verb === 'be')!
  );

const schoolReading: Question[] = schoolComprehension.flatMap(([prompt, answer, ending, hint], i) => {
  const subject = answer.slice(0, answer.indexOf(ending)).trim();
  const distractors = [
    schoolComprehension[(i + 1) % schoolComprehension.length][1],
    schoolComprehension[(i + 4) % schoolComprehension.length][1],
  ];
  return [
    make(prompt, answer, distractors, hint, { passage: schoolLifeText, passageTitle: 'School Life: A Day in Our School' }),
    written(`${prompt} Completa la respuesta: ${subject} ___.`, ending, hint, {
      alternatives: [answer],
      passage: schoolLifeText,
      passageTitle: 'School Life: A Day in Our School',
    }),
  ];
});

// --- Topic 2: IN, ON and AT ---
const timeGroups: [string, string[]][] = [
  ['in', ['the afternoon', 'the evening', 'the morning', '1991', '2026', '2012', 'September', 'December', 'July', 'May', 'winter', 'summer', '2005', '2019', 'August', 'March']],
  ['on', ['Wednesday', 'September 15th', 'Wednesday afternoon', 'April 11th', 'July 25th', 'December 1st', 'November 30th', 'Monday', 'Friday', 'Tuesday morning', 'Sunday evening', 'June 8th', 'Thursday', 'January 1st', 'October 20th', 'Saturday']],
  ['at', ['night', '7:00', '8:30', 'noon', 'midnight', '3:15', 'five o’clock', '9:00', '10:30', '2:05', '11:45', 'dawn', '4:40', '6:20', '10:00', '12:30']],
];

const timeBank: Question[] = timeGroups
  .flatMap(([prep, times]) =>
    times.flatMap((time) => {
      const starters = /^\d{4}$/.test(time)
        ? ['I was born', 'The school opened']
        : /^\d/.test(time) || /^(noon|midnight|dawn|five)/.test(time)
        ? ['The event starts', 'Class ends']
        : ['We have practice', 'I review my notes'];
      return starters.map((s) => make(`${s} ___ ${time}.`, prep, ['in', 'on', 'at'], `Con “${time}” usa ${prep.toUpperCase()}.`));
    })
  )
  .concat([
    make('I go to school ___ the afternoon.', 'in', ['on', 'at'], 'The afternoon es una parte del día.'),
    make('I attend math classes ___ Wednesday.', 'on', ['in', 'at'], 'Wednesday es un día.'),
    make('We celebrate Independence Day ___ September 15th.', 'on', ['in', 'at'], 'September 15th es una fecha con día y mes.'),
    make('She has dinner ___ the evening.', 'in', ['on', 'at'], 'The evening va con in.'),
    make('Zoe goes to bed ___ night.', 'at', ['in', 'on'], 'At night es la expresión fija.'),
  ]);

const timePaired: Question[] = Array.from({ length: 36 }, (_, i) => {
  const a = timeGroups[i % 3];
  const b = timeGroups[(i + 1 + (Math.floor(i / 3) % 2)) % 3];
  const first = a[1][(Math.floor(i / 3) + 4) % 16];
  const second = b[1][(i * 5 + 7) % 16];
  return make(
    `The club meets ___ ${first} and ___ ${second}.`,
    `${a[0]} / ${b[0]}`,
    [`${b[0]} / ${a[0]}`, `${a[0]} / ${a[0]}`],
    `La expresión “${first}” usa ${a[0]} y “${second}” usa ${b[0]}.`
  );
});

// --- Topic 3: CAN and CANNOT ---
const modalVerbs: [string, string, string][] = [
  ['play', 'plays', 'soccer every weekend'],
  ['read', 'reads', 'a book before bed'],
  ['walk', 'walks', 'to school every day'],
  ['eat', 'eats', 'lunch at noon'],
  ['study', 'studies', 'English after school'],
  ['explain', 'explains', 'the lesson clearly'],
  ['watch', 'watches', 'television in the evening'],
  ['bark', 'barks', 'at strangers'],
  ['drive', 'drives', 'to work every morning'],
  ['carry', 'carries', 'a backpack to class'],
  ['teach', 'teaches', 'a short lesson'],
  ['go', 'goes', 'to the library on Mondays'],
];

function modalRewrite(who: string, verb: string, third: string, tail: string, isThird: boolean, negative: boolean): Question {
  const marker = negative ? '−' : '+';
  const modal = negative ? 'cannot' : 'can';
  const original = isThird ? third : verb;
  const good = `${who} ${modal} ${verb} ${tail}.`;
  const hint = `El signo (${marker}) pide ${modal}. Después va ${verb} en forma base. Conserva ${who} y el complemento.`;
  return written(`${who} ${original} ${tail}. (${marker})`, good, hint, {
    verb,
    answerMode: 'sentence',
    direction: 'Reescribe la oración completa con CAN (+) o CANNOT (−).',
  });
}

export const modalExamples: Question[] = (
  [
    ['I', 0, false, false],
    ['She', 1, true, true],
    ['They', 2, false, false],
    ['We', 3, false, true],
    ['He', 4, true, false],
    ['The teacher', 5, true, false],
    ['My brother', 6, true, true],
    ['The dogs', 7, false, false],
    ['Carlos', 8, true, true],
  ] as [string, number, boolean, boolean][]
).map(([who, i, third, no]) => modalRewrite(who, ...modalVerbs[i], third, no));

modalExamples.splice(5, 0, modalRewrite('Maria', 'like', 'likes', 'chocolate ice cream', true, true));

const modalBank: Question[] = modalExamples.concat(
  subjectPeople.flatMap(([who, kind], i) =>
    modalVerbs
      .filter((_, j) => (i + j) % 2 === 0)
      .map(([verb, third, tail], j) => modalRewrite(who, verb, third, tail, kind === 'third', (i + j) % 2 === 0))
  )
);

// --- Topic 4: Past Simple, Sports and Holidays ---
const pastContexts: Record<string, string[]> = {
  study: ['for the exam', 'the history of the city', 'English during vacation', 'the sports rules'],
  enjoy: ['the documentary', 'the parade', 'the holiday concert', 'the school match'],
  travel: ['to Manuel Antonio', 'to Nicoya', 'to San José', 'to Cartago'],
  see: ['Carlos at the library', 'the fireworks', 'the basketball game', 'the flags near the park'],
  discover: ['a new species of frog', 'a trail near town', 'an article about local traditions', 'a way to fix the computer'],
  buy: ['tickets for the concert', 'a flag for the parade', 'a ball before the game', 'snacks for the trip'],
  write: ['a poem about childhood', 'a report about sports', 'a message before the parade', 'a story for English class'],
  fix: ['the broken computer', 'a bicycle before the race', 'the lights in the gym', 'a shelf in the classroom'],
  understand: ['the teacher’s instructions', 'the rules of the game', 'the story in English', 'the instructions for the parade'],
  eat: ['a traditional breakfast', 'lunch after the game', 'rice and beans at home', 'fruit before the race'],
};

const pastTasks = verbForms.flatMap(({ base, past, es, pastAlternatives = [] }, i) =>
  pastContexts[base].map((tail, j) => {
    const people = ['I', 'Martha', 'Our family', 'The students', 'We', 'She', 'My classmates', 'They'];
    const who = people[(i + j) % 8];
    const when = ['last week', 'yesterday', 'last Saturday', 'last year'][(i + j) % 4];
    const rest = `${tail} ${when}`;
    return [
      gapWithVerb(who, rest, base, past, `${past} es el pasado de ${base} (${es}).`, { cueBefore: true, variants: pastAlternatives }),
      gapWithVerb(who, rest, base, `did not ${base}`, `Did not indica el pasado. Después va ${base} en forma base.`, { negative: true, cueBefore: true }),
      transformQuestion(who, rest, base, 'Did'),
    ];
  })
);

// Also generate Past Simple tasks using the 6 extra verbs (+, -, ?) mirrored cleanly from Present Simple
const extraPastTasks = extraYearVerbs.map((v, i) => {
  const subjects = ['The students', 'She', 'Our teacher', 'Daniel', 'My family', 'Elena'];
  const who = subjects[i % subjects.length];
  return {
    affirm: gapWithVerb(who, v.then, v.base, v.past, v.rule, { cueBefore: true }),
    negative: gapWithVerb(who, v.then, v.base, `did not ${v.base}`, `Did not marca pasado; el verbo vuelve a su forma base ${v.base}.`, { negative: true, cueBefore: true }),
    question: transformQuestion(who, v.then, v.base, 'Did'),
  };
});

const pastAffirm: Question[] = pastTasks
  .map((t) => t[0])
  .concat(exactPast8.filter((t) => !t.correct.startsWith('did not ')))
  .concat(extraPastTasks.map((t) => t.affirm));

const pastNegative: Question[] = pastTasks
  .map((t) => t[1])
  .concat(exactPast8.filter((t) => t.correct.startsWith('did not ')))
  .concat(extraPastTasks.map((t) => t.negative));

const pastQuestions: Question[] = pastTasks
  .map((t) => t[2])
  .concat(extraPastTasks.map((t) => t.question));

const sportBank: Question[] = (
  [
    ['Why are sports important?', 'They help people stay active and healthy.', 'They are only for children.', 'They are always expensive.', 'La primera frase menciona active and healthy.'],
    ['Where are indoor sports played?', 'Inside buildings.', 'On outdoor roads.', 'In fields.', 'Busca inside buildings.'],
    ['Which is an indoor sport in the text?', 'Bowling.', 'Cycling.', 'Running.', 'Bowling aparece en la lista indoor.'],
    ['Where are outdoor sports usually played?', 'In parks, fields or stadiums.', 'In sports halls only.', 'In classrooms.', 'La oración de outdoor sports enumera tres lugares.'],
    ['Which is an outdoor sport in the text?', 'Running.', 'Gymnastics.', 'Badminton.', 'Running está en la lista outdoor.'],
    ['What is an advantage of indoor sports?', 'The games can continue when it rains.', 'They are always team sports.', 'They need no equipment.', 'La lluvia dificulta los juegos al aire libre.'],
    ['What can make outdoor games difficult?', 'Rain.', 'Reading a rule book.', 'Having a personal best.', 'La lectura relaciona lluvia con partidos al aire libre.'],
    ['What do teammates do in team sports?', 'They work together.', 'They compete alone.', 'They only play in water.', 'Work together significa trabajar juntos.'],
    ['Which is a team sport in the text?', 'Volleyball.', 'Boxing.', 'Swimming.', 'Volleyball aparece junto con otros deportes de equipo.'],
    ['Which is an individual sport in the text?', 'Swimming.', 'Volleyball.', 'Soccer.', 'Swimming aparece en la lista individual.'],
    ['Which sport is on both the outdoor and individual lists?', 'Tennis.', 'Basketball.', 'Hockey.', 'Compara las dos listas. Tennis aparece en ambas.'],
    ['Which sport is on both the indoor and team lists?', 'Basketball.', 'Running.', 'Golf.', 'Basketball está en la lista indoor y en la de team.'],
  ] as [string, string, string, string, string][]
)
  .map(([prompt, correct, a, b, hint]) => make(prompt, correct, [a, b], hint, { passage: sportsText, passageTitle: 'Different Types of Sports' }))
  .concat(
    (
      [
        ['Why did organizers move the activities indoors?', 'It rained.', 'They had no teams.', 'The event ended.', 'La primera frase explica el cambio de plan.'],
        ['Which team sport did the students play in the gym?', 'Volleyball.', 'Soccer.', 'Cycling.', 'Lee lo que sí ocurrió. Soccer y cycling eran parte del plan original.'],
        ['What did Mira play?', 'Table tennis.', 'Volleyball.', 'Soccer.', 'Busca el nombre Mira y la acción que realiza.'],
        ['When did the event end?', 'At noon.', 'In the evening.', 'On Friday.', 'La última oración dice at noon.'],
        ['Which activities were originally planned outdoors?', 'Soccer and cycling.', 'Volleyball and table tennis.', 'Running and boxing.', 'Were planned distingue el plan inicial de lo que sucedió.'],
        ['Did Mira compete as part of a team?', 'No, she competed as an individual.', 'Yes, she played on a soccer team.', 'Yes, she played on a volleyball team.', 'El texto dice individual competitor.'],
      ] as [string, string, string, string, string][]
    ).map(([prompt, correct, a, b, hint]) => make(prompt, correct, [a, b], hint, { passage: gymText, passageTitle: 'A Rainy Sports Festival' }))
  );

const holidayGaps: [string, string, string][] = [
  ['Kat is from ___.', 'Germany', 'Kat · Germany aparece en el encabezado.'],
  ['Kat’s favorite holiday is ___.', 'Christmas', 'La primera línea sobre Kat nombra Christmas.'],
  ['Christmas in Germany often comes with a lot of ___.', 'snow', 'Snow significa nieve.'],
  ['Phoebe prefers the Spring ___.', 'festival', 'La expresión es Spring Festival.'],
  ['The red envelopes contain ___.', 'money', 'With money inside indica qué contienen.'],
  ['Isma’s favorite time of year is ___.', 'Ramadan', 'Isma escoge Ramadan.'],
  ['Antoinette mentions ___ as her favorite holiday.', 'Thanksgiving', 'El texto de Antoinette nombra Thanksgiving.'],
  ['Families explain why they are ___ during Thanksgiving.', 'thankful', 'Thankful describe cómo se sienten.'],
  ['Rese likes the holiday because ___ members get together.', 'family', 'Family members son los miembros de la familia.'],
  ['Tony says Independence Day celebrates his country’s ___.', 'freedom', 'Freedom es libertad.'],
];

const localGaps: [string, string, string][] = [
  ['The Annexation of the Partido de Nicoya is commemorated on ___.', 'July 25th', 'El primer enunciado da la fecha de la conmemoración.'],
  ['Costa Rica celebrates Independence Day on ___.', 'September 15th', 'September 15th es el 15 de septiembre.'],
  ['On her trip, Elena saw a ___.', 'folk dance', 'Busca la expresión después de saw.'],
  ['Elena ate ___ in Nicoya.', 'traditional food', 'Busca ate. Justo después aparece lo que comió.'],
  ['Elena’s class celebrated ___ in September.', 'Independence Day', 'Ese fue el motivo de la celebración de septiembre.'],
  ['The students watched a ___.', 'parade', 'Watched indica qué vieron.'],
  ['They carried ___ during the celebration.', 'flags', 'Carried flags significa que llevaron banderas.'],
  ['The rain did not stop the ___.', 'school assembly', 'El texto indica que la asamblea se mantuvo.'],
];

function gapQuestions(rows: [string, string, string][], words: string[], passage: string, passageTitle: string): Question[] {
  return rows.map(([prompt, correct, hint]) =>
    written(prompt, correct, hint, {
      wordBank: words,
      passage,
      passageTitle,
      alternatives: correct === 'September 15th' ? ['September 15'] : correct === 'July 25th' ? ['July 25'] : [],
    })
  );
}

const holidayWordQuestions: Question[] = gapQuestions(
  holidayGaps,
  ['Germany', 'Christmas', 'snow', 'festival', 'money', 'Ramadan', 'Thanksgiving', 'thankful', 'family', 'freedom'],
  holidaysText,
  'Holidays Around the World'
).concat(
  gapQuestions(
    localGaps,
    ['parade', 'flags', 'folk dance', 'traditional food', 'Independence Day', 'July 25th', 'September 15th', 'school assembly'],
    costaRicaText,
    'Two Celebrations in Costa Rica'
  )
);

const holidayAnswers: [string, string, string, string][] = [
  ['What does Kat think is the best holiday?', 'Kat thinks that', 'Christmas is the best holiday', 'Kat menciona Christmas como su preferido.'],
  ['What can people visit during Christmas in Germany?', 'People can visit', 'Christmas markets', 'La lectura menciona Christmas markets.'],
  ['What does Kat’s mother make?', 'Kat’s mother makes', 'cookies', 'Busca mother makes.'],
  ['What is the main festival in Phoebe’s paragraph?', 'The main festival is', 'the Spring Festival', 'El nombre completo es the Spring Festival.'],
  ['What do children receive during the Spring Festival?', 'Children receive', 'red envelopes with money inside', 'La lectura dice que reciben sobres rojos con dinero.'],
  ['Why does Isma prefer Ramadan?', 'Isma prefers Ramadan because', 'it is a holy month', 'Holy month significa mes sagrado.'],
  ['What holiday does Antoinette prefer?', 'Antoinette prefers', 'Thanksgiving', 'Busca Thanksgiving en su párrafo.'],
  ['What does Antoinette like about Thanksgiving?', 'She likes that', 'families gather and explain why they are thankful', 'Busca families gather y why they are thankful.'],
  ['Why does Rese like the Christmas–New Year period?', 'Rese likes it because', 'family members get together', 'Una razón del texto es que la familia se reúne.'],
  ['Why is Independence Day important to Tony?', 'It is important to Tony because', 'it celebrates his country’s freedom', 'El texto lo relaciona con la libertad de su país.'],
];

const localAnswers: [string, string, string, string][] = [
  ['Where did Elena travel in July?', 'Elena travelled', 'to Nicoya', 'Busca travelled to.'],
  ['What did Elena see in Nicoya?', 'Elena saw', 'a folk dance', 'Folk dance significa baile folclórico.'],
  ['What did Elena write about?', 'Elena wrote', 'about the trip', 'El texto dice wrote about the trip.'],
  ['What did the class watch in September?', 'The class watched', 'a parade', 'El texto separa el desfile de las actividades de julio.'],
  ['What did the class carry?', 'The class carried', 'flags', 'Busca el verbo carried.'],
  ['Did the rain stop the school assembly?', 'The rain did not stop', 'the school assembly', 'La última oración dice que no detuvo la asamblea.'],
];

function fullSentenceQuestions(rows: [string, string, string, string][], passage: string, passageTitle: string): Question[] {
  return rows.map(([prompt, stem, ending, hint]) =>
    written(`${prompt} Completa la oración: ${stem} ___.`, ending, hint, {
      alternatives: [`${stem} ${ending}`],
      passage,
      passageTitle,
    })
  );
}

const holidayReading: Question[] = fullSentenceQuestions(holidayAnswers, holidaysText, 'Holidays Around the World').concat(
  fullSentenceQuestions(localAnswers, costaRicaText, 'Two Celebrations in Costa Rica')
);

// Master banks and cuts strictly for the 5 Exam Topics (0..4)
export const bankForLearning: Question[][][] = [
  [schoolMatch, schoolReverse],
  [presentAffirm, presentNegative, presentQuestions, presentBe, schoolReading],
  [timeBank, timePaired],
  [modalBank],
  [pastAffirm, pastNegative, pastQuestions, sportBank, holidayWordQuestions, holidayReading],
];

export const bankCuts: Record<AssessmentMode, number[][]> = {
  practice: [
    [18, 12],
    [8, 7, 5, 4, 6],
    [26, 4],
    [30],
    [6, 4, 3, 7, 5, 5],
  ],
  quiz: [
    [15, 10],
    [7, 6, 4, 3, 5],
    [21, 4],
    [25],
    [5, 4, 3, 5, 4, 4],
  ],
};

export function idFor(q: Question): string {
  return (
    q.prompt +
    '|' +
    q.passage +
    (q.picture ? '|' + q.picture + '|' + q.correct : '') +
    (q.answerMode === 'question' ? '|question' : '')
  );
}

export function balanceSlots(total: number): number[] {
  const slots = Array.from({ length: total }, (_, i) => i % 3);
  for (let tries = 0; tries < 150; tries++) {
    const candidate = mix(slots);
    if (candidate.every((slot, i) => i < 2 || slot !== candidate[i - 1] || slot !== candidate[i - 2])) {
      return candidate;
    }
  }
  return slots;
}

export function reorder(question: Question, slot: number): string[] {
  const distractors = mix(question.options.filter((option) => option !== question.correct));
  distractors.splice(slot, 0, question.correct);
  return distractors;
}

export function drawQuestions(mode: AssessmentMode, topicIdx: number, excluded: string[] = []): Question[] {
  const cuts = bankCuts[mode][topicIdx];
  const seen = new Set(excluded);
  const usedVerbs = new Set<string>();

  const questions = mix(
    bankForLearning[topicIdx].flatMap((bank, j) => {
      const remaining = mix(bank.filter((q) => !seen.has(idFor(q))));
      const used = mix(bank.filter((q) => seen.has(idFor(q))));
      const distinct = new Map<string, Question>();
      for (const question of [...remaining, ...used]) {
        const id = idFor(question);
        if (!distinct.has(id)) distinct.set(id, question);
      }
      const ordered = [...distinct.values()];
      if (topicIdx !== 4 || j > 2) {
        return ordered.slice(0, cuts[j]);
      }
      const selected: Question[] = [];
      while (selected.length < cuts[j] && ordered.length) {
        const fresh = ordered.findIndex((q) => !seen.has(idFor(q)) && (!q.verb || !usedVerbs.has(q.verb)));
        const [question] = ordered.splice(fresh < 0 ? 0 : fresh, 1);
        if (question.verb) usedVerbs.add(question.verb);
        selected.push(question);
      }
      return selected;
    })
  );

  const slots = balanceSlots(questions.filter((q) => q.format !== 'write').length);
  let next = 0;
  return questions.map((q) =>
    q.format === 'write'
      ? { ...q, typed: true }
      : { ...q, options: reorder(q, slots[next++]) }
  );
}

export function isCorrectAnswer(item: Pick<Question, 'typed' | 'correct' | 'alternatives'>, value: string): boolean {
  if (!item.typed) return value === item.correct;
  const answer = normalized(value);
  return [item.correct, ...(item.alternatives || [])].some((option) => normalized(option) === answer);
}

export interface VerbDrillSet {
  label: string;
  intro: string;
  items: Question[];
}

export const verbSetsByTopic: Record<number, VerbDrillSet[]> = {
  1: [
    { label: 'Parte 2 · Conjuga el verbo', intro: 'Lee el verbo al final y escribe solo lo que falta.', items: exactPresent2 },
    { label: 'Parte 3 · Completa en negativo', intro: 'Usa do not o does not con el verbo base. Recuerda la forma especial de be.', items: exactPresent3 },
    {
      label: 'Diez verbos · Presente afirmativo',
      intro: 'Con I y we se usa la forma base. Con he, she o it, usa la forma de tercera persona.',
      items: verbForms.flatMap((v) => [
        gapWithVerb('I', v.present.replace('her family', 'my family'), v.base, v.base, `Con I se usa la forma base ${v.base}.`),
        gapWithVerb('She', v.present, v.base, v.third, v.rule),
      ]),
    },
    {
      label: 'Diez verbos · Presente negativo',
      intro: 'Usa do not con we y does not con she. El verbo principal vuelve a su forma base.',
      items: verbForms.map((v, i) => {
        const who = i % 2 ? 'We' : 'She';
        const aux = i % 2 ? 'do not' : 'does not';
        return gapWithVerb(
          who,
          v.present.replace('her family', i % 2 ? 'our family' : 'her family'),
          v.base,
          `${aux} ${v.base}`,
          `Con ${who} se usa ${aux} y después ${v.base}.`,
          { negative: true }
        );
      }),
    },
    {
      label: 'Diez verbos · Preguntas',
      intro: 'Escribe la pregunta completa con Does y el verbo base.',
      items: verbForms.map((v) => transformQuestion('She', v.present, v.base, 'Does')),
    },
    {
      label: 'Serie mixta · Completar oraciones en Present Simple',
      intro: 'Practica afirmativas, negativas y preguntas combinadas usando los verbos escolares.',
      items: [
        gapWithVerb('Mateo', 'Math and History in the morning', 'study', 'studies', 'Mateo (he) en presente agrega -ies → studies.'),
        gapWithVerb('The students', 'novels before lunch', 'read', 'do not read', 'The students (they) niega con do not read.', { negative: true }),
        transformQuestion('Paul', 'Music club on Fridays', 'attend', 'Does'),
        gapWithVerb('Our teacher', 'Science clearly', 'teach', 'teaches', 'Teach termina en -ch y toma -es con he/she.'),
        gapWithVerb('Valeria', 'soccer with her friends', 'play', 'plays', 'Vocal + y agrega solo -s → plays.'),
        gapWithVerb('My classmates', 'the library at noon', 'visit', 'visit', 'My classmates (they) conserva el verbo base visit.'),
        gapWithVerb('Carlos', 'his homework after school', 'do', 'does not do', 'Carlos (he) niega con does not + verbo base do.', { negative: true }),
        transformQuestion('They', 'to Music class on Mondays', 'go', 'Do'),
      ],
    },
  ],
  3: [
    {
      label: 'Parte 6 · Reescribe con CAN o CANNOT',
      intro: 'Copia el sujeto y el complemento. Usa el signo y recupera el verbo base.',
      items: modalExamples,
    },
    {
      label: 'Reescritura ampliada (+) y (−)',
      intro: 'Más oraciones del mismo formato con CAN (+) y CANNOT (−) para reforzar la forma base del verbo.',
      items: [
        modalRewrite('Sarah', 'read', 'reads', 'novels in the library', true, false),
        modalRewrite('Paul', 'attend', 'attends', 'five classes a day', true, true),
        modalRewrite('My classmates', 'play', 'plays', 'soccer after school', false, false),
        modalRewrite('She', 'study', 'studies', 'Chemistry at home', true, true),
        modalRewrite('Tom', 'fix', 'fixes', 'computers in Information Technology', true, false),
        modalRewrite('We', 'go', 'goes', 'to the gym on Fridays', false, true),
      ],
    },
  ],
  4: [
    { label: 'Parte 8 · Completa en pasado', intro: 'El verbo va entre paréntesis antes del espacio. La pista not indica una negativa.', items: exactPast8 },
    {
      label: 'Diez verbos · Pasado afirmativo',
      intro: 'Recuerda el pasado de cada verbo y escribe la forma que falta.',
      items: verbForms.map((v) => gapWithVerb('She', v.then, v.base, v.past, v.rule, { cueBefore: true, variants: v.pastAlternatives || [] })),
    },
    {
      label: 'Diez verbos · Pasado negativo',
      intro: 'Escribe did not o didn’t y el verbo base.',
      items: verbForms.map((v) =>
        gapWithVerb('She', v.then, v.base, `did not ${v.base}`, `Después de didn’t se usa ${v.base} en forma base.`, { cueBefore: true, negative: true })
      ),
    },
    {
      label: 'Diez verbos · Preguntas en pasado',
      intro: 'Escribe la pregunta completa con Did y el verbo base.',
      items: verbForms.map((v) => transformQuestion('She', v.then, v.base, 'Did')),
    },
    {
      label: 'Serie mixta · Igual que Presente, pero en Pasado Simple',
      intro: 'Completa oraciones afirmativas, negativas (didn’t + base) y preguntas (Did + sujeto + base) en Past Simple.',
      items: [
        gapWithVerb('The students', 'volleyball in the gym yesterday', 'play', 'played', 'Vocal + y agrega -ed → played.', { cueBefore: true }),
        gapWithVerb('She', 'to the library last Friday', 'go', 'went', 'Go es irregular en pasado: went.', { cueBefore: true }),
        gapWithVerb('Our team', 'the basketball match on Saturday', 'win', 'did not win', 'Con not en pasado usa did not + verbo base win.', { negative: true, cueBefore: true }),
        transformQuestion('Elena', 'traditional food in Nicoya', 'eat', 'Did'),
        gapWithVerb('Our teacher', 'History and Geography last year', 'teach', 'taught', 'Teach es irregular: taught.', { cueBefore: true }),
        gapWithVerb('Paul', 'the morning assembly yesterday', 'attend', 'did not attend', 'Did not + verbo base attend.', { negative: true, cueBefore: true }),
        gapWithVerb('Valeria', 'a story in her notebook last night', 'read', 'read', 'El pasado de read se escribe igual (read).', { cueBefore: true }),
        transformQuestion('They', 'tickets for the concert yesterday', 'buy', 'Did'),
      ],
    },
  ],
};
