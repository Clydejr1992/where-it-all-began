document.addEventListener("DOMContentLoaded", () => {
const client = supabase.createClient(WIB_CONFIG.supabaseUrl, WIB_CONFIG.supabasePublishableKey);
document.getElementById("form").addEventListener("submit", async e => {
e.preventDefault();
const status=document.getElementById("status"); status.textContent="Signing in...";
const {error}=await client.auth.signInWithPassword({
email:document.getElementById("email").value.trim(),
password:document.getElementById("password").value
});
if(error){status.textContent=error.message;return;}
location.href="admin.html";
});
});