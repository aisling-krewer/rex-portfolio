
      const msalConfig = {
        auth: {
          clientId: "83fdbe14-2071-4488-a92b-033f897006a8",
          authority:
            "https://login.microsoftonline.com/f2e5973b-bcbd-4e8c-86f3-91010324aaa7",
          redirectUri: window.location.origin,
        },
      };

      const msalInstance = new msal.PublicClientApplication(msalConfig);
      function showUser(account) {
        console.log("show user running...");
        if (!account) {
          document.getElementById("user-role").textContent = "Not logged in";
          console.log("Not logged in");
          return;
        } else {
          console.log(`Logged in as: ${account.username}`);
        }

        const claims = account.idTokenClaims;

        // Extract a friendly name/email
        const name = claims.name || account.username;
        const email = claims.preferred_username || account.username;

        // Show in UI
        document.getElementById("user-role").textContent = `Hello, ${
          account.username
        } (${email})\n\nRoles: ${claims.roles || "None"}`;

        // Toggle buttons
        document.getElementById("auth-btn").style.display = "none";
        document.getElementById("logoutBtn").style.display = "inline-block";

        // Role-based UI
        const roles = claims.roles || [];
        if (roles.includes("admin")) {
          document
            .getElementById("admin-section")
            ?.style.setProperty("display", "block");
        }
        if (roles.includes("fixer")) {
          document
            .getElementById("fixer-section")
            ?.style.setProperty("display", "block");
        }
        if (roles.includes("client")) {
          document
            .getElementById("client-section")
            ?.style.setProperty("display", "block");
        }
      }

      // Handle login redirect
      msalInstance.handleRedirectPromise().then((response) => {
        if (response) {
          msalInstance.setActiveAccount(response.account);
        } else {
          const currentAccounts = msalInstance.getAllAccounts();
          if (currentAccounts.length > 0) {
            msalInstance.setActiveAccount(currentAccounts[0]);
          }
        }
        showUser(msalInstance.getActiveAccount());
      });

      // Button handlers
      document.getElementById("auth-btn").onclick = () => {
        msalInstance.loginRedirect({ scopes: ["openid", "profile", "email"] });
      };

      document.getElementById("logoutBtn").onclick = () => {
        msalInstance.logoutRedirect();
      };
    