// 버튼과 안내 메시지 상자를 찾아 둬요
const startBtn = document.getElementById("start-btn");
const toast = document.getElementById("toast");

let toastTimer = null;

// 화면 아래에 안내 메시지를 잠깐 보여주는 함수
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 2000);
}

// "게임 시작" 버튼을 눌렀을 때
// (지금은 안내 메시지만 떠요. 다음 단계에서 채팅 화면으로 연결할 거예요)
startBtn.addEventListener("click", function () {
  showToast("이야기는 다음 단계에서 시작돼요 💬");
});
