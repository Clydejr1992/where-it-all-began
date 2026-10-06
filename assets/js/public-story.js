document.addEventListener("DOMContentLoaded",async()=>{
const c=supabase.createClient(WIB_CONFIG.supabaseUrl,WIB_CONFIG.supabasePublishableKey),id=new URLSearchParams(location.search).get("id");
if(!id)return;
const {data,error}=await c.from("stories").select("*").eq("id",id).eq("status","published").single();
if(error||!data){document.getElementById("content").textContent="We couldn't find that story.";return;}
document.getElementById("title").textContent=data.title;document.getElementById("meta").textContent=[data.category,data.published_at?new Date(data.published_at).toLocaleDateString():""].filter(Boolean).join(" · ");document.getElementById("content").textContent=data.content||"";
if(data.featured_image_url){const i=document.getElementById("image");i.src=data.featured_image_url;i.hidden=false;}
});