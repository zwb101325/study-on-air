# 晚风 FOCUS

一个包含专注航班、专注咖啡馆、专注直播间和专注课堂的多场景专注网站。直播间支持浏览器摄像头、实时评论、弹幕、礼物特效与播放器控制。

## 本地开发

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build:pages
```

GitHub Pages 构建结果会生成在 `out/` 目录。仓库名会被自动识别，并作为项目站点的路径前缀。

## 发布到 GitHub Pages

1. 将项目推送到 GitHub 仓库的 `main` 分支。
2. 打开仓库的 **Settings → Pages**。
3. 在 **Build and deployment → Source** 中选择 **GitHub Actions**。
4. 等待 `Deploy to GitHub Pages` 工作流完成。

项目站点地址为：

```text
https://用户名.github.io/仓库名/
```

以后修改源码并推送到 `main` 分支，GitHub Actions 会自动重新构建和发布。本项目只保留 GitHub Pages 发布方式。
