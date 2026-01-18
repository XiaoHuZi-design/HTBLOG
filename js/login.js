const $ = (id) => document.getElementById(id);

// ✅ 把你密码的 SHA-256 哈希填到这里（64位 hex）xiaohu123
const HASH_HEX = "2d394b67f713024ef406e2d5151d6f38761d08f6eae73516bd5545124de0c5db";

async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function getRedirect() {
  const u = new URL(location.href);
  return u.searchParams.get("redirect") || "index.html";
}

async function doLogin() {
  const pwd = $("pwd").value.trim();
  const hex = await sha256Hex(pwd);

  if (hex === HASH_HEX) {
    localStorage.setItem("ht_auth", "1");
    location.href = getRedirect();
  } else {
    $("err").style.display = "block";
  }
}

$("btn").addEventListener("click", doLogin);
$("pwd").addEventListener("keydown", (e) => {
  if (e.key === "Enter") doLogin();
});
