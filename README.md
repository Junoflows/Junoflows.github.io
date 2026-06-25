# Junoflows 기술 블로그

[Jekyll](https://jekyllrb.com/) 기반 개인 기술 블로그. **GitHub Pages 네이티브 빌드**로 동작하므로
별도 빌드 설정(Actions) 없이 `git push`만으로 배포됩니다.

논문 리뷰 · 사이드 프로젝트 · 다양한 기술 주제를 다룹니다.

## 🚀 배포 (처음 한 번만)

1. GitHub에서 **`Junoflows.github.io`** 라는 이름으로 새 저장소를 만듭니다.
   (저장소 이름이 정확히 `<사용자명>.github.io` 여야 루트 도메인으로 배포됩니다.)
2. 이 폴더를 그 저장소로 push 합니다.

   ```bash
   cd Junoflows.github.io
   git init
   git add .
   git commit -m "Initial blog"
   git branch -M main
   git remote add origin https://github.com/Junoflows/Junoflows.github.io.git
   git push -u origin main
   ```

3. GitHub 저장소 → **Settings → Pages** → *Build and deployment* → Source를
   **Deploy from a branch** / `main` / `/ (root)` 로 설정합니다.
4. 1~2분 뒤 **https://junoflows.github.io** 에서 확인합니다.

이후에는 글을 추가하고 `git push` 하면 자동으로 반영됩니다.

## ✍️ 새 글 쓰기

`_posts/` 에 `YYYY-MM-DD-제목.md` 파일을 만들고 아래 front matter로 시작합니다.

```markdown
---
title: "글 제목"
date: 2026-06-25
categories: [논문 리뷰]      # 또는 [사이드 프로젝트] 등
tags: [LLM, RAG]
description: "목록·SEO에 쓰이는 한 줄 요약"
math: true                   # 수식($$...$$)이 있으면 추가, 없으면 생략
---

본문 (마크다운)
```

- **카테고리**가 `/categories/`, **태그**가 `/tags/` 페이지에 자동 분류됩니다.
- **수식**: `math: true` 를 넣고 본문에 `$$E = mc^2$$` 처럼 작성하면 MathJax가 렌더링합니다.
- **코드 블록**, **표**, **이미지**, **각주** 모두 지원합니다.

## 🛠 로컬 미리보기 (선택)

Ruby 3.1+ 환경에서:

```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000
```

> 현 시스템 기본 Ruby(2.6)는 최신 `github-pages` gem과 호환되지 않습니다.
> 로컬 미리보기가 필요하면 [rbenv](https://github.com/rbenv/rbenv) 등으로 Ruby 3.1+ 설치를 권장합니다.
> (로컬 빌드 없이 push만 해도 GitHub가 알아서 빌드·배포합니다.)

## 📁 구조

```
_config.yml          사이트 설정 (제목·네비·소셜·페이지네이션)
_layouts/            default · home · post · page 레이아웃
_includes/           head · header · footer · post-card
assets/css/main.scss 디자인 (라이트/다크 토큰, 타이포그래피)
assets/js/main.js    테마 토글 · 목차(TOC) · 코드 복사
_posts/              글 (마크다운)
about.md             소개 페이지
categories.html      카테고리별 목록
tags.html            태그별 목록
archive.html         연도별 전체 글
```

## 🎨 커스터마이즈 빠른 참고

- **블로그 제목 / 소개**: `_config.yml` 의 `title`, `tagline`, `description`
- **네비게이션 / 소셜 링크**: `_config.yml` 의 `nav`, `social`
- **색상 테마**: `assets/css/main.scss` 상단의 `--bg`, `--accent` 등 CSS 변수
- **About 내용**: `about.md`
