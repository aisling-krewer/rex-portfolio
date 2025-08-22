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
function handleRoute() {
  const hash = window.location.hash.replace("#", "") || "home";
  loadPanel(hash);
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
  };

  const required = panelAccess[panel];

  if (!required) return false;
  if (required === "anonymous") return true;
  if (required === "authenticated") return !!account;
  if (required === "Fixer") return account && roles.includes("Fixer");

  return false;
}
