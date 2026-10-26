






function checkFileProperty(){
  let x = document.getElementById("fileToLoad");
  let txt = "";
  if ('files' in x) {
    if (x.files.length == 0) {
       txt = "Select one or more files..
