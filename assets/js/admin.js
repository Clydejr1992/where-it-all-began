document.addEventListener("DOMContentLoaded", async () => {
const client=supabase.createClient(WIB_CONFIG.supabaseUrl,WIB_CONFIG.supabasePublishableKey);
const $=id=>document.getElementById(id);
const {data:{session}}=await client.auth.getSession();
if(!session){location.href="login.html";return;}

const {data:profile,error:pError}=await client.from("profiles").select("role,status").eq("id",session.user.id).single();
if(pError||!profile||profile.role!=="admin"||profile.status!=="approved"){
$("authStatus").textContent="This account does not have administrator access.";return;
}
$("authStatus").hidden=true;$("dashboard").hidden=false;

$("logout").onclick=async()=>{await client.auth.signOut();location.href="login.html";};

document.querySelectorAll(".tab").forEach(btn=>btn.onclick=()=>{
document.querySelectorAll(".tab").forEach(x=>x.classList.remove("active"));btn.classList.add("active");
$("storiesPanel").hidden=btn.dataset.target!=="storiesPanel";$("videosPanel").hidden=btn.dataset.target!=="videosPanel";
});

async function loadStories(){
const box=$("storyList");box.innerHTML="<p>Loading...</p>";
const {data,error}=await client.from("stories").select("*").order("created_at",{ascending:false});
if(error){box.innerHTML="<p>"+esc(error.message)+"</p>";return;}
box.innerHTML=data.length?data.map(s=>`<article class="admin-item"><div><h3>${esc(s.title)}</h3><p class="muted">${esc(s.category||"No category")} · ${esc(s.status)}</p></div><div class="actions"><button class="button small" data-edit="${s.id}">Edit</button><button class="button light small" data-del="${s.id}">Delete</button></div></article>`).join(""):"<p>No stories yet.</p>";
box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editStory(b.dataset.edit));
box.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>deleteStory(b.dataset.del));
}
async function loadVideos(){
const box=$("videoList");box.innerHTML="<p>Loading...</p>";
const {data,error}=await client.from("videos").select("*").order("created_at",{ascending:false});
if(error){box.innerHTML="<p>"+esc(error.message)+"</p>";return;}
box.innerHTML=data.length?data.map(v=>`<article class="admin-item"><div><h3>${esc(v.title)}</h3><p class="muted">${esc(v.category||"No category")} · ${esc(v.status)}</p></div><div class="actions"><button class="button small" data-edit="${v.id}">Edit</button><button class="button light small" data-del="${v.id}">Delete</button></div></article>`).join(""):"<p>No videos yet.</p>";
box.querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editVideo(b.dataset.edit));
box.querySelectorAll("[data-del]").forEach(b=>b.onclick=()=>deleteVideo(b.dataset.del));
}

$("newStory").onclick=()=>{ $("storyForm").reset();$("storyId").value="";$("storyHeading").textContent="New Story";$("storyEditor").hidden=false;$("storyEditor").scrollIntoView({behavior:"smooth"});};
$("cancelStory").onclick=()=>$("storyEditor").hidden=true;
$("newVideo").onclick=()=>{ $("videoForm").reset();$("videoId").value="";$("videoHeading").textContent="New Video";$("videoEditor").hidden=false;$("videoEditor").scrollIntoView({behavior:"smooth"});};
$("cancelVideo").onclick=()=>$("videoEditor").hidden=true;

$("storyForm").onsubmit=async e=>{
e.preventDefault();$("storyMsg").textContent="Saving...";
const id=$("storyId").value, published=$("storyStatus").value==="published";
const payload={title:$("storyTitle").value.trim(),excerpt:$("storyExcerpt").value.trim(),category:$("storyCategory").value||null,topics:csv($("storyTopics").value),content:$("storyContent").value,featured_image_url:$("storyImage").value.trim()||null,status:$("storyStatus").value,published_at:published?new Date().toISOString():null,updated_at:new Date().toISOString()};
let result=id?await client.from("stories").update(payload).eq("id",id):await client.from("stories").insert({...payload,author_id:session.user.id});
if(result.error){$("storyMsg").textContent=result.error.message;return;}
$("storyMsg").textContent="Saved.";$("storyEditor").hidden=true;loadStories();
};

$("videoForm").onsubmit=async e=>{
e.preventDefault();$("videoMsg").textContent="Saving...";
const id=$("videoId").value,file=$("videoFile").files[0];let videoUrl=null;
if(file){
const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,"-").toLowerCase(),path=`${session.user.id}/${Date.now()}-${safe}`;
const up=await client.storage.from("story-videos").upload(path,file,{cacheControl:"3600",upsert:false,contentType:file.type});
if(up.error){$("videoMsg").textContent=up.error.message;return;}
videoUrl=client.storage.from("story-videos").getPublicUrl(path).data.publicUrl;
}
if(!id&&!videoUrl){$("videoMsg").textContent="Choose a video file.";return;}
const payload={title:$("videoTitle").value.trim(),description:$("videoDescription").value.trim(),category:$("videoCategory").value||null,topics:csv($("videoTopics").value),thumbnail_url:$("videoThumbnail").value.trim()||null,status:$("videoStatus").value,published_at:$("videoStatus").value==="published"?new Date().toISOString():null,updated_at:new Date().toISOString()};
if(videoUrl)payload.video_url=videoUrl;
let result=id?await client.from("videos").update(payload).eq("id",id):await client.from("videos").insert({...payload,video_url:videoUrl,author_id:session.user.id});
if(result.error){$("videoMsg").textContent=result.error.message;return;}
$("videoMsg").textContent="Saved.";$("videoEditor").hidden=true;loadVideos();
};

async function editStory(id){const {data,error}=await client.from("stories").select("*").eq("id",id).single();if(error){alert(error.message);return;}
$("storyId").value=data.id;$("storyTitle").value=data.title||"";$("storyExcerpt").value=data.excerpt||"";$("storyCategory").value=data.category||"";$("storyTopics").value=(data.topics||[]).join(", ");$("storyContent").value=data.content||"";$("storyImage").value=data.featured_image_url||"";$("storyStatus").value=data.status||"draft";$("storyHeading").textContent="Edit Story";$("storyEditor").hidden=false;$("storyEditor").scrollIntoView({behavior:"smooth"});}
async function editVideo(id){const {data,error}=await client.from("videos").select("*").eq("id",id).single();if(error){alert(error.message);return;}
$("videoId").value=data.id;$("videoTitle").value=data.title||"";$("videoDescription").value=data.description||"";$("videoCategory").value=data.category||"";$("videoTopics").value=(data.topics||[]).join(", ");$("videoThumbnail").value=data.thumbnail_url||"";$("videoStatus").value=data.status||"draft";$("videoFile").value="";$("videoHeading").textContent="Edit Video";$("videoEditor").hidden=false;$("videoEditor").scrollIntoView({behavior:"smooth"});}
async function deleteStory(id){if(!confirm("Delete this story?"))return;const {error}=await client.from("stories").delete().eq("id",id);if(error)alert(error.message);else loadStories();}
async function deleteVideo(id){if(!confirm("Delete this video record?"))return;const {error}=await client.from("videos").delete().eq("id",id);if(error)alert(error.message);else loadVideos();}
function csv(s){return s.split(",").map(x=>x.trim()).filter(Boolean);}
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
loadStories();loadVideos();
});