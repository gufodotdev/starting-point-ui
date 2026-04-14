export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){document.documentElement.style.scrollbarGutter="auto";document.addEventListener("click",function(e){var a=e.target.closest("a");if(a)e.preventDefault()});if(window.frameElement){window.frameElement.style.opacity="1";var sp=window.frameElement.previousElementSibling;if(sp)sp.style.display="none";var f=window.frameElement;function sync(){f.style.height=document.body.scrollHeight+"px"}sync();new ResizeObserver(sync).observe(document.body)}window.addEventListener("storage",function(ev){if(ev.key==="sp-theme"){var s=document.getElementById("sp-theme");if(ev.newValue){if(!s){s=document.createElement("style");s.id="sp-theme";document.head.appendChild(s)}s.textContent=ev.newValue}else if(s){s.remove()}}if(ev.key==="sp-theme-font"){var l=document.getElementById("sp-font-sync");if(ev.newValue){if(!l){l=document.createElement("link");l.id="sp-font-sync";l.rel="stylesheet";document.head.appendChild(l)}l.href=ev.newValue}else if(l){l.remove()}}if(ev.key==="theme"){document.documentElement.classList.toggle("dark",ev.newValue==="dark")}})})()`,
        }}
      />
      {children}
    </>
  );
}
