const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwKdwvMCktafHy7x9AxmQk-R7Ta8-OLf_wHHuM_VBJY0kGcGMh6zDjykcflrmyNJZHejg/exec";

let currentTabUrl = "";
let draftKey = null;
let isSaving = false;

function msg(text, type = "") {
  const m = document.getElementById("message");
  m.textContent = text || "";
  m.className = type ? type : "";
}

function getFormData() {
  return {
    jobTitle: document.getElementById("jobTitle").value.trim(),
    company: document.getElementById("company").value.trim(),
    applicationDate: document.getElementById("applicationDate").value.trim(),
    status: document.getElementById("status").value,
    location: document.getElementById("location").value.trim(),
    jobBoard: document.getElementById("jobBoard").value,
    link: document.getElementById("link").value.trim(),
    // we don't set interview at application time
    interviewScheduled: "no",
    notes: document.getElementById("notes").value.trim(),
    cvVersionUsed: document.getElementById("cvVersionUsed").value.trim(),
    coverLetterUsed: document.getElementById("coverLetterUsed").value.trim(),
    jdLink: document.getElementById("jdLink").value.trim()
  };
}

function setFormData(data) {
  if (!data) return;
  if (data.jobTitle !== undefined) {
    document.getElementById("jobTitle").value = data.jobTitle;
  }
  if (data.company !== undefined) {
    document.getElementById("company").value = data.company;
  }
  if (data.applicationDate !== undefined) {
    document.getElementById("applicationDate").value = data.applicationDate;
  }
  if (data.status !== undefined) {
    document.getElementById("status").value = data.status;
  }
  if (data.location !== undefined) {
    document.getElementById("location").value = data.location;
  }
  if (data.jobBoard !== undefined) {
    document.getElementById("jobBoard").value = data.jobBoard;
  }
  if (data.link !== undefined) {
    document.getElementById("link").value = data.link;
  }
  if (data.notes !== undefined) {
    document.getElementById("notes").value = data.notes;
  }
  if (data.cvVersionUsed !== undefined) {
    document.getElementById("cvVersionUsed").value = data.cvVersionUsed;
  }
  if (data.coverLetterUsed !== undefined) {
    document.getElementById("coverLetterUsed").value = data.coverLetterUsed;
  }
  if (data.jdLink !== undefined) {
    document.getElementById("jdLink").value = data.jdLink;
  }
}

function guessJobBoardFromUrl(url) {
  if (!url) return "";
  const u = url.toLowerCase();
  if (u.includes("linkedin.com")) return "LinkedIn";
  if (u.includes("indeed.")) return "Indeed";
  if (u.includes("greenhouse.io")) return "Greenhouse";
  if (u.includes("lever.co")) return "Lever";
  return "";
}

// Save draft to chrome.storage.local
function saveDraft() {
  if (!draftKey) return;
  const draft = getFormData();
  chrome.storage.local.set({ [draftKey]: draft }, () => {
    // draft saved silently
  });
}

// Load draft or initialize from tab
function loadDraftOrInit(tab) {
  currentTabUrl = tab.url || "";
  draftKey = currentTabUrl ? "draft_" + currentTabUrl : null;

  const urlField = document.getElementById("link");
  urlField.value = currentTabUrl;

  chrome.storage.local.get(draftKey || "", (res) => {
    const draft = draftKey ? res[draftKey] : null;

    if (draft) {
      // Restore previous inputs
      setFormData(draft);
    } else {
      // No draft: initialize from tab
      document.getElementById("jobTitle").value = tab.title || "";
      const guessedBoard = guessJobBoardFromUrl(currentTabUrl);
      if (guessedBoard) {
        document.getElementById("jobBoard").value = guessedBoard;
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Get active tab info
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab) return;
    loadDraftOrInit(tab);
  });

  // Auto-save draft on any change
  const inputs = document.querySelectorAll("input, textarea, select");
  inputs.forEach((el) => {
    el.addEventListener("input", () => {
      if (!isSaving) {
        saveDraft();
      }
    });
  });

  const saveBtn = document.getElementById("save-btn");
  const btnText = saveBtn.querySelector(".btn-text");

  saveBtn.addEventListener("click", async () => {
    const data = getFormData();

    if (!data.jobTitle || !data.company || !data.link) {
      msg("Job title, company and link are required.", "error");
      return;
    }

    isSaving = true;
    saveBtn.disabled = true;
    msg("Saving...");

    // add spinner
    const spinner = document.createElement("div");
    spinner.className = "spinner";
    btnText.textContent = "Saving...";
    saveBtn.appendChild(spinner);

    try {
      await fetch(WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(data)
      });

      msg("Saved (check sheet) ✅", "success");

      // Clear draft for this tab
      if (draftKey) {
        chrome.storage.local.remove(draftKey);
      }

      setTimeout(() => {
        window.close();
      }, 700);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      msg("Could not reach Google Script ❌", "error");
      isSaving = false;
      saveBtn.disabled = false;
      btnText.textContent = "Save to Sheet";
      spinner.remove();
    }
  });
});
