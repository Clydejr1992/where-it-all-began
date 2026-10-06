document.addEventListener("DOMContentLoaded",async()=>{
const c=supabase.createClient(WIB_CONFIG.supabaseUrl,WIB_CONFIG.supabasePublishableKey),status=document.getElementById("status"),grid=document.getElementById("grid");
const {data,error}=await c.from("stories").select("id,title,excerpt,category,featured_image_url,published_at").eq("status","published").order("published_at",{ascending:false});
if(error){status.textContent="We couldn't load the stories.";return;}if(!data.length){status.textContent="No published stories yet.";return;}status.hidden=true;
data.forEach(s=>{const card=document.createElement("article");card.className="card";if(s.featured_image_url)card.innerHTML+=`<img src="${esc(s.featured_image_url)}" class="thumb" alt="">`;card.innerHTML+=`<div class="card-body"><p class="eyebrow">${esc(s.category||"Story")}</p><h2>${esc(s.title)}</h2><p>${esc(s.excerpt||"Read this story.")}</p><a class="button small" href="story.html?id=${encodeURIComponent(s.id)}">Read Story</a></div>`;grid.appendChild(card);});
function esc(v){return String(v??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");}
});