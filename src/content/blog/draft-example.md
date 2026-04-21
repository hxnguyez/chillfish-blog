---
title: Creating a Draft Post
description: Sometimes you may want to write a draft post so you can preview it in a development environment without accidentally publishing it to production. Here is a guide on how to create a draft post in SHBlog Next.
pubDate: 2025-12-28T03:56:51.357Z
heroImage: /assets/blog/blog-placeholder-3.jpg
tags:
  - Test
  - Draft
category: ["Examples"]
draft: true
---

This is a draft post, which will only be visible in the development environment (`nr dev`).

In the production environment (`nr build` + `nr preview`), this post will not be compiled or displayed.

![Image Example](/assets/blog/blog-placeholder-3.jpg)

## How to Use

Set the `draft` property in the post's frontmatter:

- `draft: true` - The post is only visible in the development environment.
- `draft: false` (or not set) - The post is visible in all environments.

This allows you to preview your drafts during development without accidentally releasing them to your live site.