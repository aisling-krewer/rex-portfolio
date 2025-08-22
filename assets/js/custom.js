
      // Simulated user state (in real implementation, this would come from Azure AD)
      let currentUser = {
        authenticated: false,
        username: "",
        role: "anonymous", // anonymous, edgerunner, veteran, fixer
      };

      // Sample job data with different access levels
      const jobData = {
        street: [
          {
            title: "Package Delivery - Watson District",
            payout: "5,000 eddies",
            risk: "Low",
            description: "Simple courier run. No questions asked.",
            client: "Anonymous",
          },
          {
            title: "Data Shard Recovery",
            payout: "12,000 eddies",
            risk: "Medium",
            description:
              "Retrieve encrypted shard from abandoned corpo office.",
            client: "Masked Client",
          },
        ],
        veteran: [
          {
            title: "Corpo Executive Extraction",
            payout: "75,000 eddies",
            risk: "High",
            description:
              "Extract high-value target from Arasaka Tower. Stealth required.",
            client: "Militech (Verified)",
          },
          {
            title: "Netrunner Support - Major Op",
            payout: "100,000 eddies",
            risk: "Extreme",
            description:
              "Provide matrix overwatch for multi-team operation. Military-grade ICE expected.",
            client: "Classification: EYES ONLY",
          },
        ],
        legendary: [
          {
            title: "Night City Mayor - Protective Detail",
            payout: "500,000 eddies",
            risk: "Classified",
            description:
              "Long-term protection contract. Full background verification required.",
            client: "City Government",
          },
        ],
      };

      // Initialize page
      document.addEventListener("DOMContentLoaded", function () {
        updateUI();
        loadJobs();
      });

      function toggleAuth() {
        if (currentUser.authenticated) {
          logout();
        } else {
          showLogin();
        }
      }

      function showLogin() {
        // In real implementation, this would redirect to Azure AD
        window.location.hash = "#login";
      }

      function authenticate() {
        const username = document.getElementById("username").value;
        const role = document.getElementById("role-select").value;

        if (username) {
          currentUser.authenticated = true;
          currentUser.username = username;
          currentUser.role = role;

          updateUI();
          loadJobs();
          window.location.hash = "#dashboard";
        }
      }

      function logout() {
        currentUser.authenticated = false;
        currentUser.username = "";
        currentUser.role = "anonymous";
        updateUI();
        loadJobs();
        window.location.hash = "#home";
      }

      function updateUI() {
        const authStatus = document.getElementById("user-role");
        const authBtn = document.getElementById("auth-btn");
        const dashboardBtn = document.getElementById("dashboard-btn");
        const adminBtn = document.getElementById("admin-btn");

        if (currentUser.authenticated) {
          authStatus.textContent = `${currentUser.username} (${currentUser.role})`;
          authBtn.textContent = "Logout";
          dashboardBtn.classList.remove("hidden");

          if (currentUser.role === "fixer") {
            adminBtn.classList.remove("hidden");
          } else {
            adminBtn.classList.add("hidden");
          }
        } else {
          authStatus.textContent = "Anonymous";
          authBtn.textContent = "Login";
          dashboardBtn.classList.add("hidden");
          adminBtn.classList.add("hidden");
        }

        // Update dashboard content
        updateDashboard();
        updateAdminPanel();
      }

      function loadJobs() {
        const jobListings = document.getElementById("job-listings");
        if (!jobListings) return;

        let availableJobs = [...jobData.street];

        if (currentUser.role === "veteran" || currentUser.role === "fixer") {
          availableJobs.push(...jobData.veteran);
        }

        if (currentUser.role === "fixer") {
          availableJobs.push(...jobData.legendary);
        }

        jobListings.innerHTML = availableJobs
          .map(
            (job) => `
          <div class="gig-card">
            <h3>${job.title} <span class="gig-tier tier-${getRiskClass(
              job.risk
            )}">${job.risk}</span></h3>
            <p><strong>Payout:</strong> ${job.payout}</p>
            <p><strong>Client:</strong> ${job.client}</p>
            <p>${job.description}</p>
            ${
              currentUser.authenticated
                ? `<button onclick="claimJob('${job.title}')" class="button small">Claim Gig</button>`
                : `<p><em><a href="#login">Login required</a> to claim gigs</em></p>`
            }
          </div>
        `
          )
          .join("");
      }

      function getRiskClass(risk) {
        switch (risk.toLowerCase()) {
          case "low":
          case "medium":
            return "street";
          case "high":
          case "extreme":
            return "veteran";
          case "classified":
            return "legendary";
          default:
            return "street";
        }
      }

      function updateDashboard() {
        const dashboardContent = document.getElementById("dashboard-content");
        const loginRequired = document.getElementById(
          "dashboard-login-required"
        );
        const welcomeMsg = document.getElementById("dashboard-welcome");

        if (currentUser.authenticated) {
          dashboardContent.classList.remove("hidden");
          loginRequired.classList.add("hidden");
          welcomeMsg.textContent = `Welcome back, ${currentUser.username}`;

          // Load user-specific data
          document.getElementById("active-gigs").innerHTML = `
            <div class="gig-card">
              <h4>Data Recovery - Watson District <span class="role-badge">In Progress</span></h4>
              <p>Status: Package acquired, returning to drop point</p>
            </div>
          `;

          document.getElementById("user-stats").innerHTML = `
            <p><strong>Reputation:</strong> ${getUserReputation()}</p>
            <p><strong>Completed Jobs:</strong> ${getCompletedJobs()}</p>
            <p><strong>Available Credit:</strong> ${getAvailableCredit()} eddies</p>
          `;
        } else {
          dashboardContent.classList.add("hidden");
          loginRequired.classList.remove("hidden");
        }
      }

      function getUserReputation() {
        switch (currentUser.role) {
          case "veteran":
            return "Veteran (4.8/5.0)";
          case "fixer":
            return "Fixer Network";
          default:
            return "Building (3.2/5.0)";
        }
      }

      function getCompletedJobs() {
        switch (currentUser.role) {
          case "veteran":
            return "23";
          case "fixer":
            return "Network Overview";
          default:
            return "3";
        }
      }

      function getAvailableCredit() {
        switch (currentUser.role) {
          case "veteran":
            return "45,000";
          case "fixer":
            return "Unlimited";
          default:
            return "12,500";
        }
      }

      // Action functions
      function claimJob(jobTitle) {
        alert(`Gig "${jobTitle}" claimed! Check your dashboard for details.`);
      }

      function updateStatus() {
        alert("Status updated. Rex has been notified of your progress.");
      }

      function requestPayout() {
        alert(
          "Payout request submitted. Eddies will be transferred within 24 hours."
        );
      }

      function showNewJobForm() {
        const form = document.getElementById("new-job-form");
        form.classList.toggle("hidden");
      }

      function postJob() {
        const title = document.getElementById("job-title").value;
        if (title) {
          alert(`New gig "${title}" posted to the board.`);
          document.getElementById("new-job-form").classList.add("hidden");
        }
      }

      function viewPayments() {
        alert("Payment queue: 3 pending transfers, total 127,000 eddies");
      }

      function submitContactForm(event) {
        event.preventDefault();
        alert("Message encrypted and sent. Rex will respond within 24 hours.");
      }

      // Update jobs when navigating to jobs panel
      window.addEventListener("hashchange", function () {
        if (window.location.hash === "#jobs") {
          loadJobs();
        }
      });
    