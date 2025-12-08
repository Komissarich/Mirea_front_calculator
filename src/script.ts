type Calculator = {
  firstNumber: string | null;
  operator: string | null;
  secondNumber: string | null;
  display: string;
  waitingForSecondNumber: boolean;
};

type Expression = {
  expression: string;
  result: string;
  timestamp: string;
};
const history: Expression[] = JSON.parse(
  localStorage.getItem("calcHistory") || "[]"
);
const calculator: Calculator = {
  firstNumber: null,
  operator: null,
  secondNumber: null,
  display: "0",
  waitingForSecondNumber: false,
};
const display = document.querySelector(".expression")!;
const buttons = document.querySelectorAll(".buttons button");
const modal = document.getElementById("history-modal")!;
const openBtn = document.getElementById("history-btn")!;
const clearBtn = document.getElementById("clear-history")!;
openBtn.addEventListener("click", () => {
  modal.classList.add("active");
  renderHistory();
});
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("active");
  }
});
for (let button of buttons) {
  button.addEventListener("click", (event) => {
    click_handler(event.currentTarget as HTMLInputElement);
  });
}
clearBtn.addEventListener("click", () => {
  history.length = 0;
  localStorage.removeItem("calcHistory");
  modal.classList.remove("active");
  renderHistory();
});
function click_handler(button: HTMLInputElement): void {
  if (button.classList.contains("number")) {
    if (calculator.operator === null) {
      if (calculator.firstNumber === null) {
        calculator.firstNumber = button.textContent;
      } else {
        if (calculator.firstNumber.includes(".")) {
          calculator.firstNumber += button.textContent;
        } else {
          calculator.firstNumber = (
            parseFloat(calculator.firstNumber) * 10 +
            parseInt(button.textContent)
          ).toString();
        }
      }
    } else {
      if (calculator.secondNumber === null) {
        calculator.secondNumber = button.textContent;
      } else {
        if (calculator.secondNumber.includes(".")) {
          calculator.secondNumber += button.textContent;
        } else {
          calculator.secondNumber = (
            parseFloat(calculator.secondNumber) * 10 +
            parseInt(button.textContent)
          ).toString();
        }
      }
    }
  } else if (button.classList.contains("operation")) {
    if (button.name === "clear") {
      calculator.firstNumber = null;
      calculator.operator = null;
      calculator.secondNumber = null;
    } else if (button.name === "solve") {
      if (
        calculator.firstNumber &&
        calculator.operator &&
        calculator.secondNumber
      ) {
        let answer = calculate(
          parseFloat(calculator.firstNumber!),
          calculator.operator!,
          parseFloat(calculator.secondNumber!)
        );
        addToHistory(
          calculator.firstNumber +
            " " +
            calculator.operator +
            " " +
            calculator.secondNumber,
          answer
        );
        if (answer) {
          calculator.firstNumber = answer.toString();
        } else {
          calculator.firstNumber = answer?.toString() ?? "Error";
        }

        calculator.operator = null;
        calculator.secondNumber = null;
      }
    } else if (button.name === "fraction") {
      if (
        calculator.secondNumber === null &&
        calculator.firstNumber !== null &&
        !calculator.firstNumber.includes(".")
      ) {
        calculator.firstNumber += ".";
      } else if (calculator.secondNumber !== null) {
        calculator.secondNumber += ".";
      }
    } else if (calculator.firstNumber === null) {
      const container = document.getElementById("buttons")!;
      container.classList.add("pulse");
      container.addEventListener("animationend", function handler() {
        container.classList.remove("pulse");
        container.removeEventListener("animationend", handler);
      });
    } else {
      if (calculator.operator === null) {
        calculator.operator = button.textContent;
      }
    }
  }
  displayText();
}

function displayText(): void {
  const parts: (string | number | null)[] = [calculator.firstNumber];

  if (calculator.operator) {
    parts.push(calculator.operator);
  }

  if (calculator.secondNumber !== null) {
    parts.push(calculator.secondNumber);
  }

  if (calculator.firstNumber === "null") {
    display.textContent = "NaN";
    calculator.firstNumber = null;
  } else {
    display.textContent = parts.join(" ");
    if (display.textContent === "") {
      display.textContent = "0";
    }
  }
}

function calculate(a: number, op: string, b: number): number | null {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return b === 0 ? null : a / b;
    case "^":
      return Math.pow(a, b);
    case "%":
      return a % b;
    default:
      return b;
  }
}

function addToHistory(expression: string, result: number | null) {
  const now = new Date();
  const time = now.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const entry: Expression = {
    expression,
    result: result?.toString() ?? "Error",
    timestamp: time,
  };
  history.unshift(entry);
  localStorage.setItem("calcHistory", JSON.stringify(history));
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("history-list")!;
  list.innerHTML = history
    .map((entry) => {
      const expr = entry.expression;
      return `
        <div class="history-item" data-expression="${expr}">
          <span class="expr">${expr} =</span>
          <span class="result">${entry.result}</span>
          <small class="time">${entry.timestamp}</small>
        </div>
      `;
    })
    .join("");
}

document.getElementById("history-list")!.addEventListener("click", (e) => {
  const item = (e.target as HTMLElement).closest(".history-item");
  if (!item) return;
  const expression = item.getAttribute("data-expression");
  if (!expression) return;
  const parts = expression.trim().split(" ");
  console.log(parts);
  if (parts.length !== 3) {
    calculator.firstNumber = parts[0];
    calculator.operator = null;
    calculator.secondNumber = null;
  } else {
    calculator.firstNumber = parts[0];
    calculator.operator = parts[1];
    calculator.secondNumber = parts[2];
  }

  calculator.waitingForSecondNumber = false;
  modal.classList.remove("active");
  displayText();
});
