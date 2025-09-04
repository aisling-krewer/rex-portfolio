async function loadPanel(route) {
  try {
    if (!canAccessPanel(route)) {
      document.getElementById("wrapper").innerHTML = `<h2>Access denied</h2>`;
      return;
    }

    const response = await fetch(`partials/${route}.html`);
    if (!response.ok) throw new Error("Panel not found");
    document.getElementById("wrapper").innerHTML = await response.text();
  } catch (e) {
    document.getElementById("wrapper").innerHTML = `<h2>${e.message}</h2>`;
  }
}

function handleRoute() {
  const hash = window.location.hash.replace("#", "") || "home";
  loadPanel(hash);
}

window.addEventListener("load", handleRoute);
window.addEventListener("hashchange", handleRoute);

function handleRoute() {
  const hash = window.location.hash.replace("#", "") || "home";
  loadPanel(hash);
}

window.addEventListener("load", handleRoute);
window.addEventListener("hashchange", handleRoute);

// Simple hash router
async function handleRoute() {
  const hash = window.location.hash.replace("#", "") || "home";
  await loadPanel(hash);
  if (hash === "jobs") {
    loadJobs(); // only run after jobs partial is in DOM
  }
  if (hash === "admin") {
    initFixerForm(); // only run after admin partial is in DOM
  }
}

// Run on load and hash change
window.addEventListener("load", handleRoute);
window.addEventListener("hashchange", handleRoute);

function canAccessPanel(panel) {
  const msal = window.msalInstance;
  const account = msal?.getActiveAccount();
  const roles = account?.idTokenClaims?.roles || [];
  console.log("User roles:", roles);

  const panelAccess = {
    home: "anonymous",
    about: "anonymous",
    dashboard: "authenticated",
    contact: "authenticated",
    admin: "Fixer",
    jobs: "authenticated",
  };

  const required = panelAccess[panel];

  if (!required) return false;
  if (required === "anonymous") return true;
  if (required === "authenticated") return !!account;
  if (required === "Fixer") return account && roles.includes("Fixer");

  return false;
}

async function loadJobs() {
  console.log("load jobs is running");
  const jobListings = document.getElementById("job-listings");
  if (!jobListings) {
    console.log("Still no job listings element found.");
    return;
  }

  jobListings.innerHTML = `<p>Loading jobs...</p>`;

  try {
    // Fetch all jobs from Cosmos via your API
    const response = await fetch("/api/jobs");
    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
      console.error("Failed to fetch jobs:", response.statusText);
    }

    const allJobs = await response.json(); // array of documents from Cosmos

    // Get user roles
    const account = window.msalInstance?.getActiveAccount();
    const roles = account?.idTokenClaims?.roles || [];
    const isAuthenticated = !!account;

    // Start with street jobs
    let availableJobs = allJobs.filter((job) => job.category === "street");

    // Add veteran jobs if user is veteran or fixer
    if (roles.includes("veteran") || roles.includes("Fixer")) {
      availableJobs.push(
        ...allJobs.filter((job) => job.category === "veteran")
      );
    }

    // Add legendary jobs if user is fixer
    if (roles.includes("Fixer")) {
      availableJobs.push(
        ...allJobs.filter((job) => job.category === "legendary")
      );
    }

    // Render
    if (availableJobs.length === 0) {
      jobListings.innerHTML = `<p>No jobs available.</p>`;
      return;
    }

    jobListings.innerHTML = availableJobs
      .map(
        (job) => `
        <div class="gig-card">
          <h3>
            ${job.title}
            <span class="gig-tier tier-${getRiskClass(job.risk)}">${
          job.risk
        }</span>
          </h3>
          <p><strong>Payout:</strong> ${job.payout}</p>
          <p><strong>Client:</strong> ${job.client}</p>
          <p>${job.description}</p>
          ${
            isAuthenticated
              ? `<button onclick="claimJob('${job.id}')" class="button small">Claim Gig</button>`
              : `<p><em><a href="#login">Login required</a> to claim gigs</em></p>`
          }
        </div>
      `
      )
      .join("");
  } catch (err) {
    console.error(err);
    jobListings.innerHTML = `<p>Failed to load jobs.</p>`;
  }
}

function initFixerForm() {
  const btn = document.getElementById("post-job-btn");
  const message = document.getElementById("fixer-message");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    message.textContent = "";

    const account = window.msalInstance?.getActiveAccount();
    if (!account) {
      message.style.color = "red";
      message.textContent = "You must be logged in as a Fixer to post jobs.";
      return;
    }

    const roles = account.idTokenClaims.roles || [];
    if (!roles.includes("Fixer")) {
      message.style.color = "red";
      message.textContent = "Only Fixers can post new gigs.";
      return;
    }

    // Build job object from form
    const newJob = {
      title: document.getElementById("job-title").value,
      category: document.getElementById("job-tier").value,
      payout: document.getElementById("job-payout").value,
      description: document.getElementById("job-description").value,
      client: account.username, // automatically set client to current Fixer
      createdAt: new Date().toISOString(),
      status: "open",
    };

    try {
      const response = await fetch("/api/fixer/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJob),
      });

      if (!response.ok) throw new Error("Failed to post job");

      message.style.color = "green";
      message.textContent = "Job posted successfully!";
      // Reset form
      document.getElementById("job-title").value = "";
      document.getElementById("job-payout").value = "";
      document.getElementById("job-description").value = "";
      document.getElementById("job-tier").value = "street";
    } catch (err) {
      console.error(err);
      message.style.color = "red";
      message.textContent = "Error posting job.";
    }
  });
}
