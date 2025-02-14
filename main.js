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

// Функция для кнопки начала игры
function startOrStopGame() {
  if (gameBtn.innerHTML === "ИГРАТЬ") {
    gameBtn.innerHTML = "ЗАВЕРШИТЬ ИГРУ";
    gameBtn.style.backgroundColor = "red";
    startGame();
  } else {
    gameBtn.innerHTML = "ИГРАТЬ";
    gameBtn.style.backgroundColor = "#66a663";
    stopGame();
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

// Функция для завершения игры
async function stopGame() {
  const response = await sendRequest("stop_game", "POST", {
    username: USERNAME,
    game_id,
  });
  updateUSerBalance();
  resetField();
}

//Функция для активации игрового поля
function activateArea() {
  let field = document.getElementsByClassName("field");

  for (let i = 0; i < field.length; i++) {
    const row = Math.trunc(i / 10);
    const column = i - row * 10;
    field[i].addEventListener("contextmenu", setFlag);
    field[i].setAttribute("data-row", row);
    field[i].setAttribute("data-column", column);
    field[i].addEventListener("click", makeStep);

    setTimeout(() => {
      field[i].classList.add("active");
    }, i * 30);
  }
}

async function makeStep(event) {
  const target = event.target;
  const row = +target.getAttribute("data-row");
  const column = +target.getAttribute("data-column");
  try {
    const response = await sendRequest("game_step", "POST", {
      game_id,
      row: row,
      column: column,
    });
    updateArea(response.table);
    if (response.error) {
      alert(response.message);
    } else {
      if (response.status === "Ok") {
      } else if (response.status === "Failed") {
        alert("Вы проиграли");
        updateUSerBalance();
        gameBtn.innerHTML = "ИГРАТЬ";
        gameBtn.style.backgroundColor = "#66a663";
        setTimeout(() => {
          resetField();
        }, 2000);
      } else if (response.status === "Won") {
        alert("Вы победитель");
        updateUSerBalance();
        gameBtn.innerHTML = "ИГРАТЬ";
        gameBtn.style.backgroundColor = "#66a663";
        setTimeout(() => {
          resetField();
        }, 2000);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function updateArea(table) {
  let fields = document.querySelectorAll(".field");
  let a = 0;
  for (let i = 0; i < table.length; i++) {
    let row = table[i];
    for (let j = 0; j < row.length; j++) {
      let cell = row[j];
      let value = fields[a];
      if (cell === "") {
      } else if (cell === 0) {
        value.classList.remove("active");
      } else if (cell == "BOMB") {
        value.classList.remove("active");
        value.classList.add("bomb");
      } else if (cell > 0) {
        value.classList.remove("active");
        value.innerHTML = cell;
      }
      a++;
    }
  }
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

function resetField() {
  const gameField = document.querySelector(".gameField");
  gameField.innerHTML = "";
  for (let i = 0; i < 80; i++) {
    const field = document.createElement("div");
    field.classList.add("field");
    gameField.appendChild(field);
  }
}

resetField();

//Функция для добавления иконки флажка
function setFlag(event) {
  event.preventDefault();
  let target = event.target;
  target.classList.toggle("flag");
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
