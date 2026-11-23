let viewer;
const url = 'https://shinian-postcard.akxzhangaio.workers.dev/?ending=1';
export function openPostcard() {
  if (!viewer) {
    viewer = document.createElement('dialog');
    viewer.id='shinian-letters';
    viewer.style.cssText='position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;background:#171d20;color:#ede0c7';
    const close=document.createElement('button');
    close.textContent='返回结局';
    close.style.cssText='position:absolute;top:12px;right:16px;z-index:2;background:#dcc49d;color:#25201a;padding:8px 12px;border:0;cursor:pointer';
    close.onclick=()=>viewer.close();
    viewer.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopImmediatePropagation();viewer.close()}},true);
    const frame=document.createElement('iframe');
    frame.src=url;
    frame.title='赴约明信片';
    frame.style.cssText='width:100%;height:100%;border:0;display:block';
    window.addEventListener('message',event=>{
      if(event.origin===new URL(url).origin&&event.source===frame.contentWindow&&event.data==='close-postcard')viewer.close();
    });
    viewer.append(frame,close);
    document.body.append(viewer);
  }
  if(!viewer.open)viewer.showModal();
}
