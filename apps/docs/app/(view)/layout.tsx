export default function ViewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){document.documentElement.style.scrollbarGutter="auto";document.addEventListener("click",function(e){var a=e.target.closest("a");if(a)e.preventDefault()});if(window.frameElement){window.frameElement.style.opacity="1";var sp=window.frameElement.previousElementSibling;if(sp)sp.style.display="none";var f=window.frameElement;function sync(){f.style.height=document.body.scrollHeight+"px"}sync();new ResizeObserver(sync).observe(document.body)}try{var parentDoc=window.parent.document;function syncTheme(){var parentStyle=parentDoc.getElementById("sp-theme");var s=document.getElementById("sp-theme");if(parentStyle){if(!s){s=document.createElement("style");s.id="sp-theme";document.head.appendChild(s)}s.textContent=parentStyle.textContent}else if(s){s.remove()}var fonts=parentDoc.querySelectorAll('link[id^="sp-font-"]');var have={};fonts.forEach(function(l){have[l.id]=l.href;if(!document.getElementById(l.id)){var c=document.createElement("link");c.id=l.id;c.rel="stylesheet";c.href=l.href;document.head.appendChild(c)}});document.querySelectorAll('link[id^="sp-font-"]').forEach(function(l){if(!have[l.id])l.remove()})}function syncAppearance(){document.documentElement.classList.toggle("dark",parentDoc.documentElement.classList.contains("dark"))}syncTheme();syncAppearance();new MutationObserver(syncTheme).observe(parentDoc.head,{childList:true,subtree:true,characterData:true});new MutationObserver(syncAppearance).observe(parentDoc.documentElement,{attributes:true,attributeFilter:["class"]})}catch(e){}})()`,
        }}
      />
      {children}
    </>
  );
}
