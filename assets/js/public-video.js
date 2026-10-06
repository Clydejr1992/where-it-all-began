document.addEventListener("DOMContentLoaded",async()=>{
const c=supabase.createClient(WIB_CONFIG.supabaseUrl,WIB_CONFIG.supabasePublishableKey),id=new URLSearchParams(location.search).get("id");
if(!id)return;
const {data,error}=await c.from("videos").select("*").eq("id",id).eq("status","published").single();
if(error||!data){document.getElementById("title").textContent="Video not found";return;}
document.getElementById("title").textContent=data.title;document.getElementById("meta").textContent=[data.category,data.published_at?new Date(data.published_at).toLocaleDateString():""].filter(Boolean).join(" · ");document.getElementById("description").textContent=data.description||"";const p=document.getElementById("player");p.src=data.video_url;if(data.thumbnail_url)p.poster=data.thumbnail_url;
});