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

// ===== 진행 중인 재생을 구분하기 위한 번호 =====
// (뒤로 갔다가 다시 시작할 때 이전 재생이 섞이지 않게 해줘요)
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

// 말풍선 하나 추가하기
function addBubble(text, showTime) {
  const row = document.createElement("div");
  row.className = "msg-row";

  const bubble = document.createElement("div");
  bubble.className = "bubble";
  bubble.textContent = text;
  row.appendChild(bubble);

  if (showTime) {
    const time = document.createElement("span");
    time.className = "msg-time";
    time.textContent = nowText();
    row.appendChild(time);
  }

  chatBody.appendChild(row);
  scrollToBottom();
}

// "입력 중..." 표시 만들기 / 지우기
function addTyping() {
  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  chatBody.appendChild(typing);
  scrollToBottom();
  return typing;
}

// 채팅 재생하기 (메시지가 하나씩 뜸)
async function playChat() {
  runId += 1;
  const myRun = runId;

  chatBody.innerHTML = "";

  const divider = document.createElement("div");
  divider.className = "date-divider";
  divider.textContent = "오늘 밤";
  chatBody.appendChild(divider);

  await sleep(800);

  for (let i = 0; i < messages.length; i++) {
    if (myRun !== runId) return; // 다른 재생이 시작됐으면 멈춤

    const typing = addTyping();
    await sleep(messages[i].wait);

    if (myRun !== runId) return;

    typing.remove();
    const isLast = i === messages.length - 1;
    addBubble(messages[i].text, isLast);
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
