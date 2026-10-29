function checkFileProperty() {
  const fileInput = document.getElementById("fileToLoad");
  const fileStatus = document.getElementById("fileStatus");
  const file = fileInput.files && fileInput.files[0];

  if (!file) {
    fileStatus.textContent = "Select a file first.";
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result !== "string") {
      fileStatus.textContent = "Unable to read selected file.";
      return;
    }

    document.getElementById("fileInput").value = reader.result;
    document.getElementById("result").textContent = "";
    fileStatus.textContent = `Loaded ${file.name}`;
  };
  reader.onerror = () => {
    fileStatus.textContent = "Unable to read selected file.";
  };
  reader.readAsText(file, "UTF-8");
}
