const imageInput = document.getElementById("imageInput");
const fileInfo = document.getElementById("fileInfo");
const sendBtn = document.getElementById("sendBtn");
const progressWrapper = document.getElementById("progressWrapper");
const progressBar = document.getElementById("progressBar");
const resultList = document.getElementById("resultList");

const EXTRA_LIST_ITEMS = [
    "Xamvn",
    "Rphang",
    "Vietdam",
    "xnhau",
    "checkerviet"
];

const LOADING_STEP_DELAY_MS = 5000;

let selectedFiles = [];

imageInput.addEventListener("change", () => {
    selectedFiles = Array.from(imageInput.files);

    if (selectedFiles.length === 0) {
        fileInfo.textContent = "No files selected";
        sendBtn.disabled = true;
        renderEmptyList();
        return;
    }

    fileInfo.textContent = `${selectedFiles.length} image(s) selected`;
    sendBtn.disabled = false;

    renderFileList(selectedFiles);
    resetProgress();
});

sendBtn.addEventListener("click", async () => {
    if (selectedFiles.length === 0) return;

    sendBtn.disabled = true;
    progressWrapper.style.display = "block";
    progressBar.style.width = "0%";

    const uploadedUrls = [];
    const totalItems = selectedFiles.length + EXTRA_LIST_ITEMS.length;
    let completedItems = 0;

    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];

            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(
                "https://demo-six-lime-21.vercel.app/api/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || "ImgBB upload failed");
            }

            const imageUrl = result.data.url;
            uploadedUrls.push(imageUrl);

            completedItems++;
            updateProgress(completedItems, totalItems);
            changeItemToX(i);
            await wait(LOADING_STEP_DELAY_MS);
        }

        for (let i = 0; i < EXTRA_LIST_ITEMS.length; i++) {
            completedItems++;
            updateProgress(completedItems, totalItems);
            changeItemToX(selectedFiles.length + i);
            await wait(LOADING_STEP_DELAY_MS);
        }

        console.log("Uploaded image URLs:", uploadedUrls);
    } catch (error) {
        console.error(error);
        alert("Upload failed. Check console for details.");
    }

    sendBtn.disabled = false;
});

function renderFileList(files) {
    resultList.innerHTML = "";

    files.forEach((file) => {
        const li = document.createElement("li");

        const fileName = document.createElement("span");
        fileName.className = "file-name";
        fileName.textContent = file.name;

        const status = document.createElement("span");
        status.className = "status";
        status.textContent = "no info";

        li.appendChild(fileName);
        li.appendChild(status);
        resultList.appendChild(li);
    });

    EXTRA_LIST_ITEMS.forEach((itemName) => {
        const li = document.createElement("li");

        const fileName = document.createElement("span");
        fileName.className = "file-name";
        fileName.textContent = itemName;

        const status = document.createElement("span");
        status.className = "status";
        status.textContent = "no info";

        li.appendChild(fileName);
        li.appendChild(status);
        resultList.appendChild(li);
    });
}

function renderEmptyList() {
    resultList.innerHTML = `
    <li>
      <span class="file-name">No image yet</span>
      <span class="status">no info</span>
    </li>
  `;
}

function changeItemToX(index) {
    const item = resultList.children[index];

    if (!item) return;

    const status = item.querySelector(".status");

    if (!status) return;

    status.textContent = "✕";
    status.className = "x-icon";
}


function updateProgress(done, total) {
    if (total === 0) {
        progressBar.style.width = "0%";
        return;
    }

    const progress = Math.round((done / total) * 100);
    progressBar.style.width = progress + "%";
}

function wait(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function resetProgress() {
    progressWrapper.style.display = "none";
    progressBar.style.width = "0%";
}