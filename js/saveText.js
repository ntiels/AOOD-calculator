function checkFileProperty(){
  let x = document.getElementById("fileToLoad");
  let txt = "";
  if ('files' in x) {
    if (x.files.length == 0) {
       txt = "Select one or more files...";
    } else {
       loadFileAsText();
    }
  } 
  else {
    if (x.value == "") {
      txt += "Select one or more files...";
    } else {
      txt += "The files property is not supported by your browser!";
      txt += "<br>The path of the selected file: " + x.value; // If the browser does not support the files property, it will return the path of the selected file instead. 
    }
  }
  document.getElementById("Message").innerHTML = txt;
}
function loadFileAsText() {

  let fileToLoad = document.getElementById("fileToLoad").files[0];

  let fileReader = new FileReader();
  fileReader.onload = function(fileLoadedEvent) 
  {
    let textFromFileLoaded = fileLoadedEvent.target.result;
    document.getElementById("fileInput").value = textFromFileLoaded; 
  };
  
  fileReader.readAsText(fileToLoad, "UTF-8");

}
let fileBox = document.getElementById("fileInput");
