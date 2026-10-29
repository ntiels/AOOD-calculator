const input = document.getElementById("input");
const result = document.getElementById("result");

document.getElementById("powButton").onclick = function() {
  input.value = input.value + "^";
};

document.getElementById("piButton").onclick = function() {
  input.value = input.value + "π";
};

document.getElementById("roundButton").onclick = function() {
  input.value = input.value + ".round()";
};

function tokenize(source) {
  const tokens = [];
  let remaining = source.trim();

  while (remaining.length > 0) {
    const whitespace = /^\s+/.exec(remaining);
    if (whitespace) {
      remaining = remaining.slice(whitespace[0].length);
      continue;
    }

    const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(remaining);
    if (number) {
      tokens.push({ type: "number", value: Number(number[0]) });
      remaining = remaining.slice(number[0].length);
      continue;
    }

    const identifier = /^(?:pi|round)/i.exec(remaining);
    if (identifier) {
      tokens.push({ type: "identifier", value: identifier[0].toLowerCase() });
      remaining = remaining.slice(identifier[0].length);
      continue;
    }

    if (remaining[0] === "π") {
      tokens.push({ type: "identifier", value: "pi" });
      remaining = remaining.slice(1);
      continue;
    }

    if ("+-*/^(),.".includes(remaining[0])) {
      tokens.push({ type: remaining[0], value: remaining[0] });
      remaining = remaining.slice(1);
      continue;
    }

    throw new Error("Unsupported character");
  }

  return tokens;
}

function createParser(tokens) {
  let position = 0;

  function peek() {
    return tokens[position];
  }

  function consume(type) {
    if (!peek() || peek().type !== type) {
      throw new Error("Unexpected token");
    }
    return tokens[position++];
  }

  function parsePrimary() {
    const token = peek();

    if (token && token.type === "number") {
      position += 1;
      return token.value;
    }

    if (token && token.type === "identifier" && token.value === "pi") {
      position += 1;
      return Math.PI;
    }

    if (token && token.type === "identifier" && token.value === "round") {
      position += 1;
      consume("(");
      const value = parseAdditive();
      consume(")");
      return Math.round(value);
    }

    if (token && token.type === "(") {
      position += 1;
      const value = parseAdditive();
      consume(")");
      return value;
    }

    throw new Error("Expected a value");
  }

  function parsePostfix() {
    let value = parsePrimary();

    while (peek() && peek().type === ".") {
      position += 1;
      const method = consume("identifier");
      if (method.value !== "round") {
        throw new Error("Unsupported operation");
      }
      consume("(");
      consume(")");
      value = Math.round(value);
    }

    return value;
  }

  function parsePower() {
    const value = parsePostfix();
    if (peek() && peek().type === "^") {
      position += 1;
      return Math.pow(value, parseUnary());
    }
    return value;
  }

  function parseUnary() {
    if (peek() && (peek().type === "+" || peek().type === "-")) {
      const operator = tokens[position++].type;
      const value = parseUnary();
      return operator === "-" ? -value : value;
    }
    return parsePower();
  }

  function parseMultiplicative() {
    let value = parseUnary();
    while (peek() && (peek().type === "*" || peek().type === "/")) {
      const operator = tokens[position++].type;
      const right = parseUnary();
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseAdditive() {
    let value = parseMultiplicative();
    while (peek() && (peek().type === "+" || peek().type === "-")) {
      const operator = tokens[position++].type;
      const right = parseMultiplicative();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  return {
    hasMore: () => position < tokens.length,
    isNext: (type) => peek() && peek().type === type,
    parseValue: parseAdditive,
    consume
  };
}

function parseExpression(source) {
  const parser = createParser(tokenize(source));
  const value = parser.parseValue();
  if (parser.hasMore() || !Number.isFinite(value)) {
    throw new Error("Invalid expression");
  }
  return value;
}

function parseValues(source) {
  const parser = createParser(tokenize(source));
  const values = [];

  do {
    values.push(parser.parseValue());
    if (!parser.isNext(",")) {
      break;
    }
    parser.consume(",");
    if (!parser.hasMore()) {
      throw new Error("Missing value");
    }
  } while (parser.hasMore());

  if (parser.hasMore() || values.some((value) => !Number.isFinite(value))) {
    throw new Error("Invalid values");
  }
  return values;
}

function parseDataValues(source) {
  const remaining = source.replace(/^\uFEFF/, "").trim();
  if (!remaining) {
    throw new Error("Missing data");
  }

  const values = [];
  let position = 0;
  const numberPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/;

  while (position < remaining.length) {
    while (/\s/.test(remaining[position] || "")) {
      position += 1;
    }

    const match = numberPattern.exec(remaining.slice(position));
    if (!match) {
      throw new Error("Invalid data value");
    }

    const value = Number(match[0]);
    if (!Number.isFinite(value)) {
      throw new Error("Invalid data value");
    }
    values.push(value);
    position += match[0].length;

    const valueEnd = position;
    while (/\s/.test(remaining[position] || "")) {
      position += 1;
    }
    if (position === remaining.length) {
      break;
    }

    if (remaining[position] === "," || remaining[position] === ";") {
      position += 1;
      while (/\s/.test(remaining[position] || "")) {
        position += 1;
      }
      if (position === remaining.length || remaining[position] === "," || remaining[position] === ";") {
        throw new Error("Missing data value");
      }
    } else if (position === valueEnd) {
      throw new Error("Invalid data separator");
    }
  }

  return values;
}

function formatNumber(value) {
  return String(Number(value.toPrecision(12)));
}

function showResult(value) {
  result.textContent = formatNumber(value);
}

function showInvalidInput() {
  result.textContent = "Invalid input.";
}

document.getElementById("expressionForm").addEventListener("submit", (event) => {
  event.preventDefault();
  try {
    showResult(parseExpression(input.value));
  } catch {
    showInvalidInput();
  }
});

function runStatistic(statistic) {
  try {
    const data = document.getElementById("fileInput").value;
    const values = data.trim() ? parseDataValues(data) : parseValues(input.value);
    let value;

    switch (statistic) {
      case "mean":
        value = values.reduce((sum, item) => sum + item, 0) / values.length;
        break;
      case "median": {
        const sorted = values.slice().sort((left, right) => left - right);
        const middle = Math.floor(sorted.length / 2);
        value = sorted.length % 2 === 0
          ? (sorted[middle - 1] + sorted[middle]) / 2
          : sorted[middle];
        break;
      }
      case "maximum":
        value = Math.max(...values);
        break;
      case "minimum":
        value = Math.min(...values);
        break;
      case "standard-deviation": {
        const mean = values.reduce((sum, item) => sum + item, 0) / values.length;
        const variance = values.reduce((sum, item) => sum + (item - mean) ** 2, 0) / values.length;
        value = Math.sqrt(variance);
        break;
      }
      default:
        throw new Error("Unsupported statistic");
    }

    showResult(value);
  } catch {
    showInvalidInput();
  }
}

document.getElementById("meanButton").onclick = () => runStatistic("mean");
document.getElementById("medianButton").onclick = () => runStatistic("median");
document.getElementById("maxButton").onclick = () => runStatistic("maximum");
document.getElementById("minButton").onclick = () => runStatistic("minimum");
document.getElementById("stDevButton").onclick = () => runStatistic("standard-deviation");

input.addEventListener("input", () => {
  result.textContent = "";
});