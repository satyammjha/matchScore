// Service worker setup
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// Message listener for job saving
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'SAVE_JOB') {
    chrome.storage.local.get(['jobs'], (data) => {
      const jobs = data.jobs || [];
      jobs.push(request.jobData);
      chrome.storage.local.set({ jobs });
    });
  }
});