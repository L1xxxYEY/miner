let USERNAME;
let POINT;
let game_id;

//Эллементы
let points = document.getElementsByClassName("point");
const gameBtn = document.querySelector("#gameBtn");

// Слушатели событий
document
  .querySelector("#loginWrapper form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    auth();
  });
[...points].forEach((elem) => elem.addEventListener("click", addPoint));
gameBtn.addEventListener("click", startOrStopGame);

// Функция для регистрации и для логина
async function auth() {
  const loginWrapper = document.getElementById("loginWrapper");
  const login = document.getElementById("login").value;
  let response = await sendRequest("user", "GET", { username: login });
  if (response.error) {
    alert("Вы не зарегистрированы");
    let registration = await sendRequest("user", "POST", {
      username: login,
    });
    if (!registration.error) {
      alert("Мы вас зарегистрировали");
      loginWrapper.style.display = "none";
      USERNAME = response.username;
      updateUSerBalance();
    }
  } else {
    USERNAME = response.username;
    loginWrapper.style.display = "none";
    updateUSerBalance();
  }
}

// Функция для выбора баллов
function addPoint(event) {
  let target = event.target.innerHTML;
  POINT = +target;
  let activePoints = document.querySelector(".point.active");
  if (activePoints) {
    activePoints.classList.remove("active");
  }
  event.target.classList.add("active");
}

// Функция для обновления баланса пользователя
async function updateUSerBalance() {
  let response = await sendRequest("user", "GET", {
    username: USERNAME,
  });

  if (response.error) {
    //Если есть ошибка
    alert(response.message);
  } else {
    const user = document.querySelector("header span");
    user.innerHTML = `Пользователь ${response.username} с балансом ${response.balance}`;
  }
}

// Функция для кнопки начала игры
function startOrStopGame() {
  if (gameBtn.innerHTML === "ИГРАТЬ") {
    gameBtn.innerHTML = "ЗАВЕРШИТЬ ИГРУ";
    gameBtn.style.backgroundColor = "red";
    startGame();
  } else {
    gameBtn.innerHTML = "ИГРАТЬ";
    gameBtn.style.backgroundColor = "#66a663";
  }
}

// Функция для старта игры
async function startGame() {
  const payload = {
    username: USERNAME,
    points: POINT,
  };
  let response = await sendRequest("new_game", "POST", payload);
  if (response.error) {
    gameBtn.innerHTML = "ИГРАТЬ";
    gameBtn.style.backgroundColor = "#66a663";
  } else {
    updateUSerBalance();
    game_id = response.game_id;
    activateArea();
  }
}

//Функция для активации игрового поля
function activateArea() {
  let field = document.getElementsByClassName("field");
  for (let i = 0; i < field.length; i++) {
    field[i].addEventListener("contextmenu", setFlag);
    setTimeout(() => {
      field[i].classList.add("active");
    }, i * 30);
  }
}

//Функция для добавления иконки флажка
function setFlag(event) {
  event.preventDefault();
  let target = event.target;
  target.classList.toggle("flag");
}

async function sendRequest(url, method, data) {
  url = `https://tg-api.tehnikum.school/tehnikum_course/minesweeper/${url}`;

  if (method == "POST") {
    let response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    response = await response.json();
    return response;
  } else if (method == "GET") {
    url = url + "?" + new URLSearchParams(data);
    let response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    response = await response.json();
    return response;
  }
}
