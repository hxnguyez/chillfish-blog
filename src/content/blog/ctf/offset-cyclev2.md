---
title: "Offset-CycleV2"
date: "2026-04-20"
category: "ctf"
---

## TL;DR

ret2win + known canary → overwrite return address

## Overview

Bài buffer overflow với custom canary = 'pico'

## Analysis

- input1 → size
- input2 → overflow
- canary check → bypass được vì known value

## Exploitation

payload:

[padding][canary][junk][win]

## Deep Dive

- vì sao canary = pico?
- vì sao không random?

## Takeaways

- custom canary != secure
- time constraint → cần script sẵn
