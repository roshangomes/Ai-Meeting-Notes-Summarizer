// Global setup for pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";

// DOM elements
const fileInput = document.getElementById("fileInput");
const fileInfo = document.getElementById("fileInfo");
const fileName = document.getElementById("fileName");
const uploadArea = document.querySelector(".upload-area");
const generateBtn = document.getElementById("generateBtn");

// Global variables
let uploadedFile = null;

fileInput.addEventListener("change", handleFileSelect);
uploadArea.addEventListener("dragover", handleDragOver);
uploadArea.addEventListener("drop", handleFileDrop);
uploadArea.addEventListener("dragleave", handleDragLeave);

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) {
    processFile(file);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  uploadArea.classList.add("dragover"); // Use class for styling if defined in CSS
}

function handleDragLeave(event) {
  event.preventDefault();
  uploadArea.classList.remove("dragover");
}

function handleFileDrop(event) {
  event.preventDefault();
  uploadArea.classList.remove("dragover");
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    processFile(files[0]);
  }
}

function processFile(file) {
  const allowedTypes = [".txt", ".docx", ".pdf"];
  const fileExtension = "." + file.name.split(".").pop().toLowerCase();

  if (!allowedTypes.includes(fileExtension)) {
    showError("Please upload a .txt, .docx, or .pdf file");
    return;
  }

  uploadedFile = file;
  window.uploadedFile = file; // Expose for summary.js
  fileName.textContent = file.name;
  fileInfo.style.display = "block";
  generateBtn.disabled = false;
  hideError();
}

async function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    if (fileExtension === ".txt") {
      // Simple text file
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("Failed to read text file"));
      reader.readAsText(file);
    } else if (fileExtension === ".pdf") {
      // PDF extraction with pdf.js
      reader.onload = async (e) => {
        try {
          const typedarray = new Uint8Array(e.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let textContent = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const text = await page.getTextContent();
            textContent +=
              text.items.map((item) => item.str).join(" ") + "\n\n";
          }
          resolve(textContent.trim());
        } catch (err) {
          reject(new Error("Failed to extract PDF text: " + err.message));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read PDF file"));
      reader.readAsArrayBuffer(file);
    } else if (fileExtension === ".docx") {
      // DOCX extraction with mammoth.js
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        mammoth
          .extractRawText({ arrayBuffer: arrayBuffer })
          .then((result) => {
            resolve(result.value); // Raw text
          })
          .catch((err) => {
            reject(new Error("Failed to extract DOCX text: " + err.message));
          });
      };
      reader.onerror = () => reject(new Error("Failed to read DOCX file"));
      reader.readAsArrayBuffer(file);
    }
  });
}

// Expose for summary.js
window.readFileContent = readFileContent;
