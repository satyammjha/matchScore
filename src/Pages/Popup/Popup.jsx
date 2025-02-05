import React, { useState, useEffect } from 'react';
import useJobs from '../../hooks/useJobs';

export default function Popup() {
  const { jobs, refreshJobs } = useJobs();

  return (
    <div className="popup-container">
      <h1>Saved Jobs ({jobs.length})</h1>
      <div className="jobs-list">
        {jobs.map((job, index) => (
          <div key={index} className="job-item">
            <h3>{job.title}</h3>
            <p>{job.company} - {job.location}</p>
            <button onClick={() => chrome.storage.local.remove(job.title)}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}