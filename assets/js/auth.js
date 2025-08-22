window.addEventListener("load", () => {
  const msalConfig = {
    auth: {
      clientId: "83fdbe14-2071-4488-a92b-033f897006a8",
      authority:
        "https://login.microsoftonline.com/f2e5973b-bcbd-4e8c-86f3-91010324aaa7",
      redirectUri: window.location.origin,
    },
  };

  window.msalInstance = new msal.PublicClientApplication(msalConfig);

  function showUser(account) {
    console.log("showUser running...");

    if (!account) {
      document.getElementById("user-role").textContent = "Not logged in";
      console.log("Not logged in");
      document.getElementById("auth-btn").style.display = "inline-block";
      document.getElementById("logoutBtn").style.display = "none";
      return;
    }

    const claims = account.idTokenClaims;
    const name = claims.name || account.username;
    const email = claims.preferred_username || account.username;

    document.getElementById("user-role").textContent = `Hello, ${
      account.username
    } (${email})\n\nRoles: ${claims.roles || "None"}`;

    // Toggle buttons
    document.getElementById("auth-btn").style.display = "none";
    document.getElementById("logoutBtn").style.display = "inline-block";

    console.log(`Logged in as: ${account.username}`);
  }

  // Handle login redirect / set active account
  msalInstance.handleRedirectPromise().then((response) => {
    if (response) msalInstance.setActiveAccount(response.account);
    else {
      const currentAccounts = msalInstance.getAllAccounts();
      if (currentAccounts.length > 0)
        msalInstance.setActiveAccount(currentAccounts[0]);
    }

    showUser(msalInstance.getActiveAccount());
  });

  // Button handlers
  document.getElementById("auth-btn").onclick = () => {
    console.log("logging in");
    msalInstance.loginRedirect({ scopes: ["openid", "profile", "email"] });
  };

  document.getElementById("logoutBtn").onclick = () => {
    console.log("logging out");
    msalInstance.logoutRedirect();
  };
});
