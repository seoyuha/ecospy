// 12단원 We Should Save the World — 기본 문제 은행
// 형식: { q: 문제, c: [보기 4개], a: 정답 번호(0부터) }
// 보기 순서는 게임에서 섞여서 나옵니다. 정답은 항상 a 번째 보기입니다.
module.exports = [
  // ---- 단어 뜻 ----
  { q: "'재활용하다'를 영어로?", c: ["recycle", "reuse", "save", "clean"], a: 0 },
  { q: "'다시 사용하다'를 영어로?", c: ["reuse", "recycle", "forget", "throw away"], a: 0 },
  { q: "'아끼다, 구하다'를 영어로?", c: ["save", "use", "clean", "turn off"], a: 0 },
  { q: "'끄다'를 영어로?", c: ["turn off", "turn on", "throw away", "use"], a: 0 },
  { q: "'버리다'를 영어로?", c: ["throw away", "turn off", "reuse", "save"], a: 0 },
  { q: "'계단'을 영어로?", c: ["stairs", "light", "forest", "bottle"], a: 0 },
  { q: "'숲'을 영어로?", c: ["forest", "energy", "water", "Earth"], a: 0 },
  { q: "'에너지'를 영어로?", c: ["energy", "paper", "plastic", "voice"], a: 0 },
  { q: "'비닐봉지'를 영어로?", c: ["plastic bag", "paper cup", "can", "bottle"], a: 0 },
  { q: "'종이컵'을 영어로?", c: ["paper cup", "plastic bag", "a cup", "paper"], a: 0 },
  { q: "'캔과 병'을 영어로?", c: ["cans and bottles", "paper and cups", "lights and water", "stairs and bikes"], a: 0 },
  { q: "'빨리, 빠르게'를 영어로?", c: ["quickly", "slowly", "loudly", "quietly"], a: 0 },
  { q: "'잊다'를 영어로?", c: ["forget", "remember", "save", "reuse"], a: 0 },

  // ---- 문장 뜻 ----
  { q: "We should save water.\n뜻은?", c: ["우리는 물을 아껴야 해.", "우리는 물을 마셔야 해.", "물을 끄는 것을 잊지 마.", "우리는 숲을 지켜야 해."], a: 0 },
  { q: "We should save energy.\n뜻은?", c: ["우리는 에너지를 아껴야 해.", "우리는 불을 켜야 해.", "우리는 계단을 써야 해.", "우리는 종이를 다시 써야 해."], a: 0 },
  { q: "Don't forget to turn off the light.\n뜻은?", c: ["불 끄는 것을 잊지 마.", "불 켜는 것을 잊지 마.", "물 잠그는 것을 잊지 마.", "불을 끄지 마."], a: 0 },
  { q: "Don't forget to turn off the water.\n뜻은?", c: ["물 잠그는 것을 잊지 마.", "물을 아껴야 해.", "물을 버리지 마.", "불 끄는 것을 잊지 마."], a: 0 },
  { q: "Don't forget to use a cup.\n뜻은?", c: ["컵 쓰는 것을 잊지 마.", "종이컵을 쓰지 마.", "컵을 다시 써야 해.", "컵을 버리지 마."], a: 0 },
  { q: "Don't forget to use the stairs.\n뜻은?", c: ["계단 이용하는 것을 잊지 마.", "자전거 타는 것을 잊지 마.", "계단에서 뛰지 마.", "엘리베이터를 타야 해."], a: 0 },
  { q: "Don't forget to recycle cans and bottles.\n뜻은?", c: ["캔과 병 재활용하는 것을 잊지 마.", "캔과 병을 버리지 마.", "캔과 병을 다시 써야 해.", "캔과 병을 사지 마."], a: 0 },
  { q: "The Earth is sick.\n뜻은?", c: ["지구가 아파요.", "지구는 너무 뜨거워요.", "지구는 우리의 집이에요.", "지구를 사랑해요."], a: 0 },
  { q: "The Earth is our home.\n뜻은?", c: ["지구는 우리의 집이에요.", "지구가 아파요.", "우리는 지구를 구해야 해요.", "지구는 너무 뜨거워요."], a: 0 },
  { q: "What can we do for the Earth?\n뜻은?", c: ["지구를 위해 우리는 무엇을 할 수 있을까?", "지구는 어디에 있니?", "지구는 왜 아프니?", "우리는 지구에 무엇을 버렸니?"], a: 0 },

  // ---- 빈칸·문법 ----
  { q: "We should ___ the world.", c: ["save", "saves", "to save", "saving"], a: 0 },
  { q: "Don't forget ___ off the light.", c: ["to turn", "turn", "turns", "turning"], a: 0 },
  { q: "Don't forget to ___ paper.", c: ["reuse", "reuses", "reusing", "to reuse"], a: 0 },
  { q: "We should ___ a bike.", c: ["ride", "rides", "to ride", "riding"], a: 0 },
  { q: "We ___ save the forest.", c: ["should", "forget", "don't", "let's"], a: 0 },
  { q: "Don't ___ to use a cup.", c: ["forget", "should", "save", "use"], a: 0 },
  { q: "Don't forget to turn ___ the water.", c: ["off", "on", "away", "up"], a: 0 },
  { q: "Don't throw ___ cans and bottles.", c: ["away", "off", "on", "to"], a: 0 },
  { q: "How about ___ the stairs?", c: ["using", "use", "to use", "uses"], a: 0 },
  { q: "How about ___ paper?", c: ["reusing", "reuse", "to reuse", "reuses"], a: 0 },
  { q: "틀린 문장은?", c: ["We should to save water.", "We should save water.", "We should save energy.", "We should ride a bike."], a: 0 },
  { q: "틀린 문장은?", c: ["Don't forget recycle cans.", "Don't forget to recycle cans.", "Don't forget to use a cup.", "Don't forget to reuse paper."], a: 0 },
  { q: "바른 문장은?", c: ["Don't forget to use the stairs.", "Don't forget use the stairs.", "Don't forget to using the stairs.", "Don't forget the stairs to use."], a: 0 },

  // ---- 상황·대화 ----
  { q: "🚰 물이 계속 나오고 있어요. 친구에게 할 말은?", c: ["Don't forget to turn off the water.", "Don't forget to turn off the light.", "We should ride a bike.", "Don't forget to use the stairs."], a: 0 },
  { q: "💡 아무도 없는 교실에 불이 켜져 있어요. 할 말은?", c: ["Don't forget to turn off the light.", "Don't forget to use a cup.", "We should save the forest.", "Let's wash quickly."], a: 0 },
  { q: "🥫 다 마신 캔을 쓰레기통에 버리려 해요. 할 말은?", c: ["Don't forget to recycle cans and bottles.", "Don't forget to turn off the water.", "We should ride a bike.", "Don't forget to use the stairs."], a: 0 },
  { q: "🪥 양치할 때 물을 틀어 놓았어요. 할 말은?", c: ["Don't forget to use a cup.", "Don't forget to reuse paper.", "We should save energy.", "Don't forget to use the stairs."], a: 0 },
  { q: "📄 한 면만 쓴 종이를 버리려 해요. 할 말은?", c: ["Don't forget to reuse paper.", "Don't forget to turn off the light.", "Don't forget to use a cup.", "We should ride a bike."], a: 0 },
  { q: "🛗 2층에 가려고 엘리베이터를 기다려요. 할 말은?", c: ["How about using the stairs?", "How about reusing paper?", "Don't forget to use a cup.", "Let's wash quickly."], a: 0 },
  { q: "A: Don't forget to turn off the light.\nB: ___ We should save energy.", c: ["Sure.", "No, thanks.", "I'm sorry.", "Goodbye."], a: 0 },
  { q: "A: How about using the stairs?\nB: ___ We should save energy.", c: ["Sounds great!", "I'm sick.", "Help me!", "No, I can't."], a: 0 },
  { q: "자전거를 타면 무엇을 아낄 수 있을까요?\nWe should ride a bike. We should save ___.", c: ["energy", "paper", "water", "cups"], a: 0 },
  { q: "물을 아끼는 행동이 아닌 것은?", c: ["Don't forget to turn off the light.", "Don't forget to use a cup.", "Don't forget to turn off the water.", "Let's wash quickly."], a: 0 },
  { q: "에너지를 아끼는 행동이 아닌 것은?", c: ["Don't forget to use a cup.", "Don't forget to turn off the light.", "Don't forget to use the stairs.", "We should ride a bike."], a: 0 },
];
