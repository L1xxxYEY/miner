let USERNAME;
let POINT;

//Эллементы
let points = document.getElementsByClassName("point");

// Слушатели событий
document
  .querySelector("#loginWrapper form")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    auth();
  });
[...points].forEach((elem) => elem.addEventListener("click", addPoint));

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
    }
  } else {
    USERNAME = response.username;
    loginWrapper.style.display = "none";
  }
}

// Функция для выбора баллов
function addPoint(event) {
  let target = event.target.innerHTML;
  console.log(+target);
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
