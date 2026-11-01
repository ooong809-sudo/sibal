// ===== 화면 요소 찾기 =====
const titleScreen = document.getElementById("title-screen");
const chatScreen = document.getElementById("chat-screen");
const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const replayBtn = document.getElementById("replay-btn");
const chatBody = document.getElementById("chat-body");

// ===== 태현이 보내는 메시지 (여기 글만 고치면 대사가 바뀌어요) =====
// wait = 이 메시지가 뜨기 전에 "입력 중..."이 보이는 시간 (1000 = 1초)
const messages = [
  { text: "야.", wait: 1200 },
  { text: "자냐", wait: 1000 },
  { text: "...아니겠지. 너 안 자는 거 안다", wait: 1600 },
  { text: "아까는 내가 말이 좀 심했다", wait: 1800 },
  { text: "근데 너도 잘한 건 없어. 그건 알지?", wait: 1800 },
  { text: "밥은 먹었냐", wait: 1400 },
  { text: "대답 안 해도 되니까 읽기나 해", wait: 1600 }
];

const SENDER_NAME = "태현";
const SENDER_INITIAL = "태";

// ===== 진행 중인 재생을 구분하기 위한 번호 =====
let runId = 0;

// 화면 바꾸기
function showScreen(screen) {
  titleScreen.classList.remove("active");
  chatScreen.classList.remove("active");
  screen.classList.add("active");
}

// 지정한 시간만큼 기다리기
function sleep(ms) {
  return new Promise(function (resolve) {
    setTimeout(resolve, ms);
  });
}

// 채팅창을 맨 아래로 내리기
function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

// 지금 시각을 "오후 11:42" 모양으로 만들기
function nowText() {
  return new Date().toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit"
  });
}

// 오늘 날짜를 "2026년 11월 1일 일요일" 모양으로 만들기
function todayText() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

// 말풍선 하나 추가하기
// isFirst = 묶음의 첫 말풍선인가 (프로필, 이름, 꼬리가 붙어요)
// isLast  = 묶음의 마지막 말풍선인가 (시간이 붙어요)
function addBubble(text, isFirst, isLast) {
  const row = document.createElement("div");
  row.className = "msg-row" + (isFirst ? " first-in-group" : "");

  // 왼쪽 프로필 자리
  if (isFirst) {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = SENDER_INITIAL;
    row.appendChild(avatar);
  } else {
    const spacer = document.createElement("div");
    spacer.className = "avatar-spacer";
    row.appendChild(spacer);
  }

  const col = document.createElement("div");
  col.className = "msg-col";

  if (isFirst) {
    const name = document.createElement("div");
    name.className = "msg-name";
    name.textContent = SENDER_NAME;
    col.appendChild(name);
  }

  const line = document.createElement("div");
  line.className = "bubble-line";

  const bubble = document.createElement("div");
  bubble.className = "bubble" + (isFirst ? " has-tail" : "");
  bubble.textContent = text;
  line.appendChild(bubble);

  if (isLast) {
    const time = document.createElement("span");
    time.className = "msg-time";
    time.textContent = nowText();
    line.appendChild(time);
  }

  col.appendChild(line);
  row.appendChild(col);
  chatBody.appendChild(row);
  scrollToBottom();
}

// "입력 중..." 표시 만들기
function addTyping(isFirst) {
  const row = document.createElement("div");
  row.className = "msg-row" + (isFirst ? " first-in-group" : "");

  const spacer = document.createElement("div");
  spacer.className = "avatar-spacer";
  row.appendChild(spacer);

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  row.appendChild(typing);

  chatBody.appendChild(row);
  scrollToBottom();
  return row;
}

// 채팅 재생하기 (메시지가 하나씩 뜸)
async function playChat() {
  runId += 1;
  const myRun = runId;

  chatBody.innerHTML = "";

  const divider = document.createElement("div");
  divider.className = "date-divider";
  divider.textContent = todayText();
  chatBody.appendChild(divider);

  await sleep(800);

  for (let i = 0; i < messages.length; i++) {
    if (myRun !== runId) return; // 다른 재생이 시작됐으면 멈춤

    const isFirst = i === 0;
    const isLast = i === messages.length - 1;

    const typing = addTyping(isFirst);
    await sleep(messages[i].wait);

    if (myRun !== runId) return;

    typing.remove();
    addBubble(messages[i].text, isFirst, isLast);
  }
}

// ===== 버튼 동작 =====
startBtn.addEventListener("click", function () {
  showScreen(chatScreen);
  playChat();
});

backBtn.addEventListener("click", function () {
  runId += 1; // 재생 멈추기
  showScreen(titleScreen);
});

replayBtn.addEventListener("click", function () {
  playChat();
});
