// ===== 요소 찾기 =====
const $ = function (id) { return document.getElementById(id); };

const titleScreen = $("title-screen");
const phone = $("phone");
const toast = $("toast");
const chatBody = $("chat-body");
const kBody = $("k-body");
const dotsBox = $("dots");
const dotEls = dotsBox.querySelectorAll("i");

// ===== 설정 (여기 값을 고치면 바뀌어요) =====
const PASSCODE = "1004";

// 태현이 보내는 메시지 (wait = "입력 중..." 보이는 시간, 1000 = 1초)
const messages = [
  { text: "야.", wait: 1200 },
  { text: "자냐", wait: 1000 },
  { text: "...아니겠지. 너 안 자는 거 안다", wait: 1600 },
  { text: "아까는 내가 말이 좀 심했다", wait: 1800 },
  { text: "근데 너도 잘한 건 없어. 그건 알지?", wait: 1800 },
  { text: "밥은 먹었냐", wait: 1400 },
  { text: "대답 안 해도 되니까 읽기나 해", wait: 1600 }
];

// 정우의 메모장 (맨 위가 가장 최근)
const memos = [
  {
    title: "오늘",
    date: "오늘",
    today: true,
    text:
      "태현이한테 상관하지 말라고 했다.\n" +
      "그 말 하려던 게 아니었는데.\n\n" +
      "어지러워서 넘어질 뻔한 걸 걔가 잡아줬다.\n" +
      "괜찮다고 했는데 손이 떨렸다. 걔는 다 봤을 거다.\n\n" +
      "그만 좀 하라고 했다. 내가 무너지는 거 보기 싫다고.\n" +
      "...누가 누구 걱정을 하는 건지.\n\n" +
      "사과해야 하나. 뭐라고 하지.\n" +
      "일단 내일 학급회의 자료부터 마저 만들자."
  },
  {
    title: "학급회의 안건 정리",
    date: "어제",
    text:
      "1. 체육대회 종목 투표\n2. 청소 구역 재배정\n3. 수행평가 일정 공유\n\n" +
      "※ 안건지 인쇄 30부\n※ 칠판 게시용은 따로"
  },
  {
    title: "수학 오답노트",
    date: "10월 30일",
    text:
      "미적분 3단원\n- 합성함수 미분에서 안쪽 미분 빼먹음 (3번 틀림)\n" +
      "- 극한값 계산할 때 부호 조심\n\n" +
      "다시 풀 문제: 교재 p.84 7, 9, 12번"
  },
  {
    title: "영어 단어 Day 23",
    date: "10월 29일",
    text:
      "ambiguous 모호한\nreluctant 꺼리는\nprecede ~에 앞서다\n" +
      "reinforce 강화하다\nthrive 번성하다\n\n" +
      "내일 아침 쪽지시험"
  },
  {
    title: "한국사 요약 - 조선 후기",
    date: "10월 27일",
    text:
      "- 대동법: 공납을 쌀로\n- 균역법: 군포 2필 → 1필\n- 영조 탕평책 / 정조 규장각, 수원 화성\n\n" +
      "서술형 대비: 실학자 비교 (유형원, 이익, 정약용)"
  },
  {
    title: "수행평가 일정",
    date: "10월 25일",
    text:
      "국어 발표 11/3\n과학 실험보고서 11/5\n영어 에세이 11/8\n\n" +
      "겹치는 주 → 과학 먼저 끝내기"
  }
];

// ===== 상태 =====
let runId = 0;        // 채팅 재생 구분 번호
let entered = "";     // 입력 중인 암호
let kTab = "friends"; // 카톡에서 보고 있는 탭
let chatRead = false; // 태현 메시지를 읽었는지
let toastTimer = null;

// ===== 공통 도구 =====
function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1800);
}

// 타이틀 <-> 폰 전환
function showScreen(which) {
  titleScreen.classList.toggle("active", which === "title");
  phone.classList.toggle("active", which === "phone");
}

// 폰 안에서 화면(레이어) 전환
function show(id) {
  document.querySelectorAll(".layer").forEach(function (l) {
    l.classList.remove("active");
  });
  $(id).classList.add("active");
  phone.dataset.view = id;

  if (id === "passcode") {
    entered = "";
    renderDots();
  }
}

// ===== 시계 =====
function updateClock() {
  const d = new Date();
  const t = d.toLocaleTimeString("ko-KR", {
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23"
  });
  $("sb-time").textContent = t;
  $("lock-time").textContent = t;
  $("lock-date").textContent = d.toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

function todayLong() {
  return new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long"
  });
}

function nowText() {
  return new Date().toLocaleTimeString("ko-KR", { hour: "numeric", minute: "2-digit" });
}

// ===== 암호 입력 =====
function renderDots() {
  dotEls.forEach(function (d, i) {
    d.classList.toggle("on", i < entered.length);
  });
}

function pressKey(k) {
  if (k === "cancel") { show("lock"); return; }
  if (k === "del") { entered = entered.slice(0, -1); renderDots(); return; }
  if (entered.length >= 4) return;

  entered += k;
  renderDots();

  if (entered.length === 4) {
    setTimeout(function () {
      if (entered === PASSCODE) {
        entered = "";
        renderDots();
        show("home");
      } else {
        dotsBox.classList.add("shake");
        setTimeout(function () {
          dotsBox.classList.remove("shake");
          entered = "";
          renderDots();
        }, 450);
      }
    }, 150);
  }
}

// 키패드 만들기
(function buildKeypad() {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "cancel", "0", "del"];
  keys.forEach(function (k) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "key" + (k === "cancel" || k === "del" ? " plain" : "");
    b.textContent = k === "cancel" ? "취소" : k === "del" ? "⌫" : k;
    b.addEventListener("click", function () { pressKey(k); });
    $("keypad").appendChild(b);
  });
})();

// ===== 카톡 =====
function row(initial, cls, name, sub, side, attr) {
  return (
    '<div class="k-row" ' + (attr || "") + ">" +
    '<div class="k-av ' + cls + '">' + initial + "</div>" +
    '<div class="k-main"><b>' + name + "</b><small>" + sub + "</small></div>" +
    (side ? '<div class="k-side">' + side + "</div>" : "") +
    "</div>"
  );
}

function friendsHTML() {
  return (
    '<div class="k-sec">내 프로필</div>' +
    row("정", "yellow", "정우", "반장이 해야지 뭐", "", "data-soon") +
    '<div class="k-sec">친구 4</div>' +
    row("태", "blue", "태현", "...", "", 'data-open="chat"') +
    row("엄", "green", "엄마", "", "", "data-soon") +
    row("담", "", "담임쌤", "", "", "data-soon") +
    row("학", "", "학원 쌤", "", "", "data-soon")
  );
}

function chatsHTML() {
  const badge = chatRead ? "" : '<span class="k-badge">7</span>';
  return (
    row("태", "blue", "태현", "대답 안 해도 되니까 읽기나 해", "<span>방금</span>" + badge, 'data-open="chat"') +
    row("우", "", "우리 반 단톡방", "내일 수행평가 제출 마감이에요", "<span>12분 전</span>", "data-soon") +
    row("엄", "green", "엄마", "공부 너무 늦게까지 하지 마", "<span>어제</span>", "data-soon")
  );
}

function giftsHTML() {
  const items = [["☕", "커피 쿠폰"], ["🍰", "조각 케이크"], ["🍫", "초콜릿"], ["🍗", "치킨"], ["🧋", "버블티"], ["🎁", "깜짝 선물"]];
  return (
    '<div class="gift-grid">' +
    items.map(function (it) {
      return '<div class="gift" data-soon><div class="e">' + it[0] + "</div><b>" + it[1] + "</b></div>";
    }).join("") +
    "</div>"
  );
}

function moreHTML() {
  return (
    row("⚙", "", "설정", "알림, 화면, 계정", "", "data-soon") +
    row("🔔", "", "알림", "", "", "data-soon") +
    row("💾", "", "대화 백업", "", "", "data-soon")
  );
}

function renderKakao() {
  const titles = { friends: "친구", chats: "채팅", gifts: "선물하기", more: "더보기" };
  const views = { friends: friendsHTML, chats: chatsHTML, gifts: giftsHTML, more: moreHTML };

  $("k-title").textContent = titles[kTab];
  kBody.innerHTML = views[kTab]();
  kBody.scrollTop = 0;

  document.querySelectorAll("#k-tabs button").forEach(function (b) {
    b.classList.toggle("on", b.dataset.tab === kTab);
  });
}

function updateBadge() {
  $("home-badge").style.display = chatRead ? "none" : "flex";
}

function openKakao() {
  kTab = "chats";
  renderKakao();
  show("kakao");
}

function openChat() {
  chatRead = true;
  updateBadge();
  show("chat");
  playChat();
}

// ===== 채팅 재생 =====
const SENDER_NAME = "태현";
const SENDER_INITIAL = "태";

function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addBubble(text, isFirst, isLast) {
  const rowEl = document.createElement("div");
  rowEl.className = "msg-row" + (isFirst ? " first-in-group" : "");

  if (isFirst) {
    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = SENDER_INITIAL;
    rowEl.appendChild(avatar);
  } else {
    const spacer = document.createElement("div");
    spacer.className = "avatar-spacer";
    rowEl.appendChild(spacer);
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
  rowEl.appendChild(col);
  chatBody.appendChild(rowEl);
  scrollToBottom();
}

function addTyping(isFirst) {
  const rowEl = document.createElement("div");
  rowEl.className = "msg-row" + (isFirst ? " first-in-group" : "");

  const spacer = document.createElement("div");
  spacer.className = "avatar-spacer";
  rowEl.appendChild(spacer);

  const typing = document.createElement("div");
  typing.className = "typing";
  typing.innerHTML = "<span></span><span></span><span></span>";
  rowEl.appendChild(typing);

  chatBody.appendChild(rowEl);
  scrollToBottom();
  return rowEl;
}

async function playChat() {
  runId += 1;
  const myRun = runId;

  chatBody.innerHTML = "";

  const divider = document.createElement("div");
  divider.className = "date-divider";
  divider.textContent = todayLong();
  chatBody.appendChild(divider);

  await sleep(800);

  for (let i = 0; i < messages.length; i++) {
    if (myRun !== runId) return;

    const isFirst = i === 0;
    const isLast = i === messages.length - 1;

    const typing = addTyping(isFirst);
    await sleep(messages[i].wait);

    if (myRun !== runId) return;

    typing.remove();
    addBubble(messages[i].text, isFirst, isLast);
  }
}

// ===== 메모 =====
function renderMemoList() {
  $("memo-list").innerHTML = memos.map(function (m, i) {
    const firstLine = m.text.split("\n")[0];
    return (
      '<div class="m-item" data-i="' + i + '"><b>' + m.title + "</b><small>" +
      m.date + "  " + firstLine + "</small></div>"
    );
  }).join("");
}

function openMemo(i) {
  const m = memos[i];
  $("mv-date").textContent = m.today ? todayLong() : m.date;
  $("mv-title").textContent = m.title;
  $("mv-text").textContent = m.text;
  show("memo-view");
}

// ===== 버튼 연결 =====
$("start-btn").addEventListener("click", function () {
  chatRead = false;
  updateBadge();
  updateClock();
  showScreen("phone");
  show("lock");
});

// 잠금화면: 아무 데나 누르면 암호 입력으로
$("lock").addEventListener("click", function () {
  show("passcode");
});

$("lock-exit").addEventListener("click", function (e) {
  e.stopPropagation();
  showScreen("title");
});

// 홈화면 앱 아이콘
document.querySelectorAll(".app").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const app = btn.dataset.app;
    if (app === "kakao") {
      openKakao();
    } else if (app === "memo") {
      renderMemoList();
      show("memo");
    } else {
      showToast("아직 준비 중인 앱이에요 🛠");
    }
  });
});

// "홈으로", "메모로" 같은 이동 버튼
document.addEventListener("click", function (e) {
  const go = e.target.closest("[data-go]");
  if (!go) return;
  if (go.dataset.go === "memo") renderMemoList();
  show(go.dataset.go);
});

// 카톡 탭
$("k-tabs").addEventListener("click", function (e) {
  const b = e.target.closest("button");
  if (!b) return;
  kTab = b.dataset.tab;
  renderKakao();
});

// 카톡 목록 안에서 누르기
kBody.addEventListener("click", function (e) {
  if (e.target.closest("[data-open]")) {
    openChat();
    return;
  }
  if (e.target.closest("[data-soon]")) {
    showToast("아직 준비 중이에요 🛠");
  }
});

// 채팅방 버튼
$("back-btn").addEventListener("click", function () {
  runId += 1; // 재생 멈추기
  kTab = "chats";
  renderKakao();
  show("kakao");
});

$("replay-btn").addEventListener("click", function () {
  playChat();
});

// 메모 목록에서 누르기
$("memo-list").addEventListener("click", function (e) {
  const item = e.target.closest(".m-item");
  if (item) openMemo(Number(item.dataset.i));
});

// ===== 시작할 때 한 번 =====
updateClock();
setInterval(updateClock, 10000);
updateBadge();
