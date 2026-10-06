document.addEventListener("DOMContentLoaded",async()=>{
const c=supabase.createClient(WIB_CONFIG.supabaseUrl,WIB_CONFIG.supabasePublishableKey),status=document.getElementById("status"),grid=document.getElementById("grid");
const {data,error}=await c.from("videos").select("id,title,description,category,thumbnail_url,published_at").eq("status","published").order("published_at",{ascending:false});
if(error){status.textContent="We couldn't load the videos.";return;}if(!data.length){status.textContent="No published videos yet.";return;}status.hidden=true;
data.forEach(v=>{const card=document.createElement("article");card.className="card";if(v.thumbnail_url)card.innerHTML+=`<img src="${esc(v.thumbnail_url)}" class="thumb" alt="">`;card.innerHTML+=`<div class="card-body"><p class="eyebrow">${esc(v.category||"Video")}</p><h2>${esc(v.title)}</h2><p>${esc(v.description||"Watch this video.")}</p><a class="button small" href="video.html?id=${encodeURIComponent(v.id)}">Watch Video</a></div>`;grid.appendChild(card);});
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
});