document.addEventListener("DOMContentLoaded",()=>{
const client=supabase.createClient(WIB_CONFIG.supabaseUrl,WIB_CONFIG.supabasePublishableKey);
const $=id=>document.getElementById(id);
$("submissionForm").onsubmit=async e=>{
e.preventDefault();
const msg=$("msg");msg.textContent="Submitting...";
if($("website").value){msg.textContent="Thank you! Your story has been submitted for review.";return;}
const payload={name:$("name").value.trim(),email:$("email").value.trim(),title:$("title").value.trim(),content:$("content").value.trim(),category:$("category").value||null,topics:csv($("topics").value),anonymous:$("anonymous").checked,permission:$("permission").checked,status:"pending"};
const {error}=await client.from("story_submissions").insert(payload);
if(error){msg.textContent="We couldn't submit your story right now. Please try again.";return;}
$("submissionForm").reset();msg.textContent="Thank you! Your story has been submitted for review. We will review it before anything is published.";
};
function csv(s){return s.split(",").map(x=>x.trim()).filter(Boolean);}
});
