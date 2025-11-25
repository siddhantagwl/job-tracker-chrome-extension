const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwKdwvMCktafHy7x9AxmQk-R7Ta8-OLf_wHHuM_VBJY0kGcGMh6zDjykcflrmyNJZHejg/exec";

let currentTabUrl = "";
let draftKey = null;
let isSaving = false;
let generateCoverLetter = false;

function msg(text, type = "") {
  const m = document.getElementById("message");
  m.textContent = text || "";
  m.className = type ? type : "";
}

function getElement(id) {
  return document.getElementById(id);
}

function getValue(id) {
  const el = getElement(id);
  return el && "value" in el ? el.value.trim() : "";
}

function setValue(id, value) {
  const el = getElement(id);
  if (el && "value" in el && typeof value === "string") {
    el.value = value;
  }
}

function getFormData() {
  return {
    jobTitle: getValue("jobTitle"),
    company: getValue("company"),
    applicationDate: getValue("applicationDate"),
    status: getValue("status"),
    location: getValue("location"),
    jobBoard: getValue("jobBoard"),
    link: getValue("link"),
    // we don't set interview at application time
    interviewScheduled: "no",
    notes: getValue("notes"),
    cvVersionUsed: getValue("cvVersionUsed"),
    coverLetterUsed: getValue("coverLetterUsed"),
    jdLink: getValue("jdLink"),
	generateCoverLetter: generateCoverLetter
  };
}

function setFormData(data) {
  if (!data) return;
  if (data.jobTitle !== undefined) {
    setValue("jobTitle", data.jobTitle);
  }
  if (data.company !== undefined) {
    setValue("company", data.company);
  }
  if (data.applicationDate !== undefined) {
    setValue("applicationDate", data.applicationDate);
  }
  if (data.status !== undefined) {
    setValue("status", data.status);
  }
  if (data.location !== undefined) {
    setValue("location", data.location);
  }
  if (data.jobBoard !== undefined) {
    setValue("jobBoard", data.jobBoard);
  }
  if (data.link !== undefined) {
    setValue("link", data.link);
  }
  if (data.notes !== undefined) {
    setValue("notes", data.notes);
  }
  if (data.cvVersionUsed !== undefined) {
    setValue("cvVersionUsed", data.cvVersionUsed);
  }
  if (data.coverLetterUsed !== undefined) {
    setValue("coverLetterUsed", data.coverLetterUsed);
  }
  if (data.jdLink !== undefined) {
    setValue("jdLink", data.jdLink);
  }
  if (data.generateCoverLetter) {
    generateCoverLetter = true;
    const clStatus = getElement("cl-status");
    if (clStatus) {
      clStatus.textContent = "CL will be generated on save ✓";
    }
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

  setValue("link", currentTabUrl);

  chrome.storage.local.get(draftKey || "", (res) => {
    const draft = draftKey ? res[draftKey] : null;

    if (draft) {
      // Restore previous inputs
      setFormData(draft);
    } else {
      // No draft: initialize from tab
      setValue("jobTitle", tab.title || "");
      const guessedBoard = guessJobBoardFromUrl(currentTabUrl);
      if (guessedBoard) {
        setValue("jobBoard", guessedBoard);
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

  // Generate CL button
  const clBtn = getElement("generate-cl-btn");
  const clStatus = getElement("cl-status");
  if (clBtn) {
    clBtn.addEventListener("click", () => {
      generateCoverLetter = true;
      if (clStatus) {
        clStatus.textContent = "CL will be generated on save ✓";
      }
      saveDraft();
    });
  }

  const saveBtn = getElement("save-btn");
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
