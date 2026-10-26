function splitFunction() {
  let arr = [];
  let str = document.getElementById("input").value;
  arr = str.split(",");

  return arr;

}

const input = document.getElementById("input");

document.getElementById("powButton").onclick = function() {
  input.value = input.value + "^";
};

document.getElementById("piButton").onclick = function() {
  input.value = input.value + "π";
};

document.getElementById("roundButton").onclick = function() {
  input.value = input.value + ".round()";
};