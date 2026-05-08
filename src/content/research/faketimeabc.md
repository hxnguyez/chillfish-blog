---
title: "Knowledge aroun9: llama.cpp"
pubDate: 2026-05-06
description: "Kno CVE with RCE vulnerablity in RPC Backend of an open source AI."
heroImage: "/assets/blog/orange.jpg"
draft: false
tags: ["CVE", "ndays", "RCE"]
category: "ndays Research"
---

### **struct ggml_tensor * result = deserialize_tensor(ctx, tensor);**
struct: một kiểu dữ liệu có thể chứa nhiều kiểu dữ liệu
result: được khai báo là một con trỏ tới một vùng nhớ chứa dữ liệu có cấu trúc là ggml_tensor (ở đây là cái tensor rỗng được tạo ra từ hàm deserialize_tensor)
deserialize_tensor: tạo tensor trong RAM rộng theo kích thước ctx (được tính toán kĩ)
### **if (result == nullptr) {return nullptr;}**
Điều kiện nếu cái tensor đó rỗng thì trả về null

### **c. Hiểu bản vá**
```C
struct ggml_tensor * result = deserialize_tensor(ctx, tensor);
// tạo tensor rỗng
if (result == nullptr || result->buffer == nullptr) {
// trước đó chỉ có dòng nếu result = 0 thì về null
// nhưng giờ thêm điều kiện là nếu cái buffer của result = 0 thì có lỗi và về null
	GGML_LOG_ERROR("[%s] invalid tensor: null %s (id=%" PRIu64 ")\n",
				   __func__, result == nullptr ? "tensor" : "buffer", id);
	return nullptr;
}
```
Bản vá thêm một điều kiện về số buffer của tensor
### **d. Tại sao result và buffer của nó = null thì gây lỗi**
**Result**
Như bạn đã biết, ctx sẽ tính toán và cấp RAM cho tensor được tạo ra từ hàm deserialize_tensor, nhưng nếu Hacker tạo ra một tensor có kích thước lớn hơn RAM rất nhiều được cấp thì con trỏ result sẽ lỗi và gây crack nếu không có cơ chế kiểm tra như ở trên

Giả dụ: Một gói tin metadata nhẹ vài KB, bên trong khai báo tensor có 4 chiều với nb =2^60 ne = 2^60 . Nhưng khi dùng hàm deserialize_tensor nó tính toán ra một tensor cực lớn (> 2^60), điều này khiến máy tính kiểm tra thấy con số quá lớn và result = null, từ đây gây crack. 

Vậy để làm gì để result không bằng null -> khiến sinh ra cái điều kiện thứ 2 ở bản vá 

**Buffer**
Nếu bạn đưa ra một metadata có kích thước nhỏ nhưng số mũ lại vừa nhỏ hơn kích thước tối đa mà máy tính cho phép thì result sẽ không = null

Vì result không bằng null -> điều kiện không xảy ra -> tiếp tục chạy -> lấy RAM để tạo tensor nhưng khi tính toán số RAM lớn hơn số RAM của máy chủ -> crack

Để hiểu rõ hơn: 
tensor: là cái vỏ được tạo ra khi sử dụng hàm deserialize_tensor, chứa gói tin chứa metadata (rpc_tensor) được client gửi qua port
Các phần tử trong tensor trỏ tới các giá trị trong buffer 

RAM được cấp phát (hay gọi là buffer): chứa các giá trị được client gửi (set_tensor) sau đó -> đây là ruột