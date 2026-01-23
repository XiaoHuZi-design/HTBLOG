(function () {
  const authed = localStorage.getItem("ht_auth") === "1";
  if (!authed) {
    // 带上当前页面，登录后自动跳回
    const cur = location.pathname.split("/").pop() || "index.html";
    location.href = `login.html?redirect=${encodeURIComponent(cur)}`;
  }
})();
