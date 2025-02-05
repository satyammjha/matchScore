// content.js

// Function to extract job details
function getJobDetails(jobElement) {
    return {
      company: jobElement.querySelector('.EmployerProfile_compactEmployerName__9MGcV')?.innerText || '',
      title: jobElement.querySelector('.JobCard_jobTitle__GLyJ1')?.innerText || '',
      location: jobElement.querySelector('.JobCard_location__Ds1fM')?.innerText || '',
      salary: jobElement.querySelector('.JobCard_salaryEstimate__QpbTW')?.innerText.replace(/ /g, ' ') || '',
      skills: [...jobElement.querySelectorAll('.JobCard_jobDescriptionSnippet__l1tnl div:last-child b')]
        .map(skill => skill.nextSibling?.textContent?.trim()).filter(Boolean)
    };
  }
  
  // Function to create save button
  function createSaveButton(jobElement) {
    const btn = document.createElement('button');
    btn.style.marginTop = '10px';
    btn.style.padding = '8px 16px';
    btn.style.backgroundColor = '#085ff7';
    btn.style.color = 'white';
    btn.style.border = 'none';
    btn.style.borderRadius = '4px';
    btn.style.cursor = 'pointer';
    btn.innerText = 'Save Job';
    
    btn.addEventListener('click', () => {
      const jobDetails = getJobDetails(jobElement);
      
      // Save to Chrome storage
      chrome.storage.local.get(['savedJobs'], (result) => {
        const jobs = result.savedJobs || [];
        if (!jobs.find(j => j.title === jobDetails.title)) {
          jobs.push(jobDetails);
          chrome.storage.local.set({ savedJobs: jobs });
        }
      });
      
      // Visual feedback
      btn.innerText = 'Saved!';
      setTimeout(() => btn.innerText = 'Save Job', 2000);
    });
    
    return btn;
  }
  
  // Function to inject buttons
  function injectSaveButtons() {
    const jobListings = document.querySelectorAll('.JobsList_jobListItem__wjTHv');
    
    jobListings.forEach(jobElement => {
      const existingBtn = jobElement.querySelector('.custom-save-btn');
      if (!existingBtn) {
        const btnContainer = jobElement.querySelector('.JobCard_showMoreButtonWrapper__siLFS');
        if (btnContainer) {
          const saveBtn = createSaveButton(jobElement);
          saveBtn.className = 'custom-save-btn';
          btnContainer.parentNode.insertBefore(saveBtn, btnContainer.nextSibling);
        }
      }
    });
  }
  
  // Run initially
  injectSaveButtons();
  
  // Observe DOM changes for dynamic loading
  const observer = new MutationObserver(injectSaveButtons);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });