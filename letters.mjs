const author = `我花了5天的时间
一个人从零开始摸索

用 AI 设计、建模、渲染
还原了记忆中的青铜门

书已经合上很久了
可书里的那些故事
我一直都没有忘怀

爱与存在并不冲突

但这一次
我想把记忆中的故事
做成可以走进去的世界

长白山可以有青铜门
十年之约也可以重现

这是我的第一次尝试
在工作之余挤出时间
熬了几个夜晚之后
才有了现在的模样

还有些细节没打磨好
也请大家多多包涵

用我一生
换你十年天真无邪

用我一生天真无邪
换你再陪我十年

有缘，再续`;

const endpoint = 'https://shinian-zhiyue-letters.akxzhangaio.workers.dev/letters';
const visitorKey = 'shinian-letter-visitor';
const draftKey = 'shinian-letter-draft';
const readStorage = key => { try { return localStorage.getItem(key); } catch { return null; } };
const writeStorage = (key, value) => { try { localStorage.setItem(key, value); return true; } catch { return false; } };
const visitor = readStorage(visitorKey) || crypto.randomUUID();
writeStorage(visitorKey, visitor);

let online = false;
async function receiveLetter() {
  try {
    const response = await fetch(endpoint + '?visitor=' + visitor, { signal: AbortSignal.timeout(6500) });
    if (response.ok) {
      const { letter } = await response.json();
      online = true;
      if (letter?.body) return { ...letter, sender: '先到的旅人' };
    }
  } catch {}
  return { body: author, sender: '作者来信', image: './author-letter-poster.jpg' };
}
let received;

const style = document.createElement('style');
style.textContent = `
#shinian-letters { inset:0; margin:auto auto auto clamp(14px,6vw,100px); width:min(690px,calc(100vw - 36px)); max-width:none; max-height:calc(100% - 28px); padding:clamp(18px,4vw,44px); box-sizing:border-box; border:1px solid #8e7852; border-radius:4px; background:radial-gradient(ellipse at top left,#f1e5cb,#d8c4a0); color:#241d16; font:17px/1.8 "Songti SC","Noto Serif SC",serif; box-shadow:0 15px 80px #000b; overflow:auto; overscroll-behavior:contain; }
#shinian-letters::backdrop { background:linear-gradient(90deg,#101719e8,#10171964 73%,#10171932),url("./author-letter-poster.jpg") center/cover; }
#shinian-letters.writing { background:radial-gradient(ellipse at top left,#343434,#212729); color:#efe2c5; }
#shinian-letters h2 { margin:0; font:600 clamp(23px,4vw,34px)/1.35 "Songti SC",serif; }
#shinian-letters .sender { margin:.45em 0 1em; padding-bottom:.45em; border-bottom:1px solid #8e7852; font-size:14px; }
#shinian-letters:not(.writing) .sender { color:#634729; }
#shinian-letters .letter-content { display:grid; gap:14px; align-items:start; }
#shinian-letters .letter-content.illustrated { grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); }
#shinian-letters .letter-content img { margin:0; width:100%; }
#shinian-letters .letter-body { white-space:pre-wrap; overflow-wrap:anywhere; margin:0 0 18px; }
#shinian-letters button { font:inherit; color:#241d16; background:#e5cea0; border:1px solid #927444; padding:5px 13px; border-radius:2px; cursor:pointer; }
#shinian-letters button.secondary { color:inherit; background:transparent; }
#shinian-letters button:disabled { opacity:.55; cursor:wait; }
#shinian-letters :focus-visible { outline:2px solid currentColor; outline-offset:3px; }
#shinian-letters .actions { display:flex; flex-wrap:wrap; gap:10px; margin:18px 0 0; }
#shinian-letters img { display:block; max-width:100%; max-height:55vh; object-fit:contain; margin:14px auto; border:4px solid #f5e8cb; box-sizing:border-box; }
#shinian-letters textarea { display:block; box-sizing:border-box; width:100%; min-height:clamp(110px,26vh,310px); resize:vertical; padding:10px; background:#161c1e; color:#f5e8cb; border:1px solid #947c55; font:inherit; }
#shinian-letters input[type=file] { display:block; max-width:100%; font:inherit; font-size:14px; margin:4px 0; }
#shinian-letters .count { font-size:13px; text-align:right; }
#shinian-letters [role=status] { font-size:14px; margin:8px 0 0; }
@media (max-width:600px) {
  #shinian-letters { margin:auto; }
  #shinian-letters .letter-content.illustrated { grid-template-columns:1fr; }
  #shinian-letters .letter-content img { order:-1; max-height:26vh; }
}
`;
document.head.append(style);

const dialog = document.createElement('dialog');
dialog.id = 'shinian-letters';
dialog.setAttribute('aria-labelledby','letter-title');
dialog.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    event.stopImmediatePropagation();
    dialog.close();
  }
}, true);
document.body.append(dialog);

function showLetter(letter) {
  dialog.classList.remove('writing');
  dialog.innerHTML = '<h2 id="letter-title">青铜门后的来信</h2><p class="sender"></p><div class="letter-content"><div class="letter-body"></div></div><div class="actions"><button type="button" data-write>写给下一位旅人</button><button type="button" class="secondary" data-close>返回结局</button></div>';
  dialog.querySelector('.sender').textContent = letter.sender;
  const body = dialog.querySelector('.letter-body');
  body.textContent = letter.body;
  if (letter.image === './author-letter-poster.jpg' || letter.image?.startsWith('data:image/jpeg;base64,')) {
    const photo = new Image();
    photo.alt = letter.sender === '作者来信' ? '云顶裂谷全景，青铜门嵌在侧壁，远处可见九龙棺台' : '旅人在信中附上的照片';
    photo.src = letter.image;
    body.parentElement.classList.add('illustrated');
    body.after(photo);
  }
  dialog.querySelector('[data-write]').onclick = showEditor;
  dialog.querySelector('[data-close]').onclick = () => dialog.close();
  dialog.scrollTop = 0;
}

let submissionId;
let draft = { body: '', image: null };
try { Object.assign(draft, JSON.parse(readStorage(draftKey) || '{}')); } catch {}
async function compress(file) {
  if (file.size > 20 * 1024 * 1024 || !/^image\/(jpeg|png|webp)$/.test(file.type)) throw Error('请选择 20 MB 以内的 JPG、PNG 或 WebP 图片。');
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, 1280 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext('2d', {alpha:false});
  context.fillStyle = '#ebdfc5';
  context.fillRect(0,0,canvas.width,canvas.height);
  context.drawImage(bitmap,0,0,canvas.width,canvas.height);
  bitmap.close();
  for (const quality of [.84,.7,.55,.4,.25]) {
    const image = canvas.toDataURL('image/jpeg', quality);
    if (image.length <= 420000) return image;
  }
  throw Error('这张图片压缩后仍太大，请换一张。');
}

function showEditor() {
  dialog.classList.add('writing');
  dialog.innerHTML = '<h2 id="letter-title">写给下一位旅人</h2><p class="sender">审核通过后，后来的人可能读到这封信。</p><form><label for="letter-body">你想留下一句什么？</label><textarea id="letter-body" required maxlength="5000" placeholder="一句话也好，一整封信也好。"></textarea><div class="count"></div><label for="letter-image">附上一张照片（可选）</label><input id="letter-image" type="file" accept="image/jpeg,image/png,image/webp"><div class="preview" hidden><img alt="待提交的照片"><button type="button" class="secondary" data-remove>移除照片</button></div><div class="actions"><button type="submit">留下这封信</button><button type="button" class="secondary" data-back>返回来信</button><button type="button" class="secondary" data-close>返回结局</button></div><p role="status"></p></form>';
  dialog.scrollTop = 0;
  const form = dialog.querySelector('form');
  const body = form.querySelector('textarea');
  const file = form.querySelector('input');
  const preview = form.querySelector('.preview');
  const photo = preview.querySelector('img');
  const status = form.querySelector('[role=status]');
  const submit = form.querySelector('[type=submit]');
  if (!online) {
    dialog.querySelector('.sender').textContent = '共享信箱暂未接通。文字和照片可以保存在此浏览器。';
    submit.textContent = '保存草稿';
  }
  const sync = () => {
    body.value = draft.body;
    form.querySelector('.count').textContent = draft.body.length + ' / 5000';
    preview.hidden = !draft.image;
    if (draft.image) photo.src = draft.image;
    else photo.removeAttribute('src');
  };
  const save = () => writeStorage(draftKey, JSON.stringify(draft));
  body.oninput = () => {
    draft.body = body.value;
    submissionId = undefined;
    form.querySelector('.count').textContent = body.value.length + ' / 5000';
    save();
  };
  file.onchange = async () => {
    const selected = file.files[0];
    if (!selected) return;
    file.disabled = submit.disabled = true;
    status.textContent = '正在处理图片…';
    try {
      draft.image = await compress(selected);
      submissionId = undefined;
      sync();
      save();
      status.textContent = '';
    } catch (error) { status.textContent = error.message; }
    finally { file.disabled = submit.disabled = false; file.value = ''; }
  };
  preview.querySelector('button').onclick = () => {
    draft.image = null;
    submissionId = undefined;
    sync();
    save();
  };
  form.querySelector('[data-back]').onclick = async () => showLetter(await received);
  form.querySelector('[data-close]').onclick = () => dialog.close();
  form.onsubmit = async event => {
    event.preventDefault();
    if (!body.value.trim()) { status.textContent = '请先写下一句话。'; body.focus(); return; }
    const saved = save();
    if (!online) {
      status.textContent = saved ? '草稿已保存在此浏览器。' : '浏览器暂时无法保存草稿。';
      return;
    }
    const fields = [...form.querySelectorAll('button, input, textarea')];
    fields.forEach(element => element.disabled = true);
    status.textContent = '正在寄出…';
    try {
      submissionId ||= crypto.randomUUID();
      const response = await fetch(endpoint, {
        method: 'POST', headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ body:draft.body, image:draft.image, visitor, id:submissionId }),
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw Error(response.status === 429 ? '寄信太频繁，请稍后再试。' : '这次未能确认寄出，请重试。');
      draft = {body:'', image:null};
      submissionId = undefined;
      save();
      dialog.innerHTML = '<h2 id="letter-title">信已收到</h2><p>审核通过后，下一位旅人就有机会读到它。</p><button type="button">返回结局</button>';
      dialog.querySelector('button').onclick = () => dialog.close();
      dialog.querySelector('button').focus();
    } catch (error) {
      status.textContent = (error.name === 'Error' ? error.message : '这次未能确认寄出，请重试。') +
        (saved ? ' 草稿已保存在这个浏览器。' : '');
    } finally { fields.forEach(element => element.disabled = false); }
  };
  sync();
  body.focus({preventScroll:true});
}

export async function openLetters() {
  if (dialog.open) return;
  dialog.innerHTML = '<h2 id="letter-title">青铜门后的来信</h2><p role="status">正在取信…</p>';
  dialog.showModal();
  received ||= receiveLetter();
  const letter = await received;
  if (dialog.open) {
    showLetter(letter);
    dialog.querySelector('[data-write]').focus({preventScroll:true});
  }
}
