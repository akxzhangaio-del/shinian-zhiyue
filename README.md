# 十年之约 · 云顶裂谷

《盗墓笔记》粉丝向同人作品 · 浏览器实时 3D（three.js）· Aholo / Lux3D 黑客松参赛作品

**在线体验：** https://akxzhangaio-del.github.io/shinian-zhiyue/ （发布后把这一行换成真实地址）

## 怎么体验

- 用桌面版 Chrome 或 Edge 打开，并开启硬件加速。第一次进入要下载约 165 MB 模型，进度条走完前请不要关闭页面。
- 在长白山舆图上点击「青铜门」，圆窗显现后再点「入境」。
- 进谷后先播一段入谷镜头，按任意键可以跳过。之后的操作：
  - 入谷镜头之后**默认自动带路**，吴邪会一路走到青铜门前触发结局
  - **W A S D / 方向键**：随时接管、自己走（停下 6 秒不操作会接着带路，按 **G** 立即继续）
  - **Shift**：奔跑
  - **拖动鼠标**：转向
  - **滚轮**：调整镜头远近
  - **Esc**：打开菜单（继续、自动带路、手动探索、留影、重新出发、返回舆图）
- 走到青铜门前会触发结局，结束页可以选择「重新出发」「自由探索」或「返回舆图」。
- 右上角的 ♪ 是声音开关。
- 手机和平板没有键盘，进谷后会直接进入自动跟随镜头。

## 目录

| 路径 | 内容 |
| --- | --- |
| `index.html` | 舆图入口：开场动画和背景音乐 |
| `scene/index.html` | 谷底实时场景 |
| `scene/assets/*.glb` | 场景、人物、九龙底座等模型，每个文件都小于 100 MB |
| `scene/assets/song.m4a` | 背景音乐 |
| `.nojekyll` | 让 GitHub Pages 原样发布全部文件 |

## 发布到 GitHub Pages

1. 在 GitHub 新建一个**公开**仓库，例如 `shinian-zhiyue`。
2. 把本文件夹的全部内容推送上去，`.nojekyll` 也要带上。GitHub 网页上传单个文件不能超过 25 MB，而 `scene.glb` 有 69.6 MB，所以要用 git 命令行或 GitHub Desktop：

   ```bash
   cd 本文件夹
   git init
   git add .
   git commit -m "十年之约 · 云顶裂谷 网页版"
   git branch -M main
   git remote add origin https://github.com/你的用户名/仓库名.git
   git push -u origin main
   ```

   推送时 git 可能提示 `scene.glb` 超过 50 MB，这只是警告，不影响推送。**不要用 Git LFS**：GitHub Pages 不会发布 LFS 文件，用了模型会加载失败。
3. 打开仓库的 **Settings → Pages**，Source 选 **Deploy from a branch**，Branch 选 **main** 和 **/(root)**，然后保存。
4. 等一到两分钟，访问 `https://akxzhangaio-del.github.io/shinian-zhiyue/` 就能看到。

## 本地预览

这一版的模型是分开的文件，直接双击 `index.html` 无法加载，需要先启动一个本地服务：

```bash
python -m http.server 8000
```

然后在浏览器打开 http://localhost:8000/ 。

参赛包里另有一个离线单文件版，可以直接双击打开。

## 声明

本作品是非商业的粉丝向同人创作。《盗墓笔记》人物与设定的版权归原作者南派三叔及相关版权方所有。背景音乐《十年人间》（演唱：李常超 / Lao乾妈）作为粉丝向二创使用，版权归原作者及版权方所有。场景与道具的部分资产由 Aholo Lux3D 生成，人物模型与动作由制作团队提供，场景装配、交互、镜头与光影由本项目代码实现。
