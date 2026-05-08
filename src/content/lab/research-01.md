---
title: "Knowledge around CVE-2026-34159: llama.cpp"
pubDate: 2026-05-05
description: "Knowledge when I research a CVE with RCE vulnerablity in RPC Backend of an open source AI."
heroImage: "/assets/blog/orange.jpg"
draft: false
tags: ["CVE", "ndays", "RCE"]
category: "ndays Research"
---

# **1. Tác dụng của các file:**
script: dọn file rác
grammars: quy tắc về định dạng đầu ra (json, python,..)
model: các model của AI
docs: file hướng dẫn 
tests: lab check model
scripts: tool vặt
cmake: bản thiết kế
ggml: tính toán phép toán ma trận
src: kết nối các phép toán thành 1 luồng suy nghĩ (trong một promt việc tính toán của AI là rất nhiều và nó sẽ cần kết nối chúng lại để thành output hoàn chỉnh)
common: code để in thông báo lỗi, đọc thông số từ người dùng
examples: các chương trình hoàn chỉnh để test


# **2. task:**
Hiểu tensor, deserialize_tensor
Hiểu tác dụng dòng code trước patch, sau patch


# **3. Tensor là gì? Basic**

Tensor là mảng dữ liệu lưu trữ đa chiều, được sử dụng để lưu trữ dữ liệu của model và metadata cho các cách sử dụng dữ liệu lưu trữ như số chiều, kiểu nén dữ liệu hay pointer, bên cạnh đó tensor cũng là nơi để model làm các phép tính ma trận phức tạp trong quá trình suy nghĩ logic

Dù nó là nhiều chiều nhưng dưới góc độ RAM, tensor chỉ là một đường dữ liệu thẳng tắp (ví dụ tensor 3D thì trong mảng đó có nhiều mảng 2D và trong 2D là các dữ liệu 1D), khi muốn lấy dữ liệu từ tensor cần một thông số Stride (nb) để biết nhảy qua bao nhiêu byte để tới hàng tiếp theo hay chiều tiếp theo để tới đó. Nếu thao túng được nb ta có thể khiến model đọc dữ liệu sai chỗ

# **4. FIle ggml-rpc.cpp có tác dụng gì?**
## **a. tác dụng**
**rpc_tensor:**
```C
struct rpc_tensor {

    uint64_t id;
    uint32_t type;
    uint64_t buffer;
    uint32_t ne[GGML_MAX_DIMS];
    uint32_t nb[GGML_MAX_DIMS];
    uint32_t op;
    int32_t  op_params[GGML_MAX_OP_PARAMS / sizeof(int32_t)];
    int32_t  flags;
    uint64_t src[GGML_MAX_SRC];
    uint64_t view_src;
    uint64_t view_offs;
    uint64_t data;
    char name[GGML_MAX_NAME];

    char padding[4];
};
```
Struct này đóng vai trò làm metadata cho tensor như các kiểu dữ liệu uint64_t cho các thông số khai báo buffer, ne, nb,... 
Đây chính là thứ client gửi đi phía server theo port


**rpc_cmd**:
```C
enum rpc_cmd {
    RPC_CMD_ALLOC_BUFFER = 0,
    RPC_CMD_GET_ALIGNMENT,
    RPC_CMD_GET_MAX_SIZE,
    RPC_CMD_BUFFER_GET_BASE,
    RPC_CMD_FREE_BUFFER,
    RPC_CMD_BUFFER_CLEAR,
    RPC_CMD_SET_TENSOR,
    RPC_CMD_SET_TENSOR_HASH,
    RPC_CMD_GET_TENSOR,
    RPC_CMD_COPY_TENSOR,
    RPC_CMD_GRAPH_COMPUTE,
    RPC_CMD_GET_DEVICE_MEMORY,
    RPC_CMD_INIT_TENSOR,
    RPC_CMD_GET_ALLOC_SIZE,
    RPC_CMD_HELLO,
    RPC_CMD_DEVICE_COUNT,
    RPC_CMD_GRAPH_RECOMPUTE,
    RPC_CMD_COUNT,
};
```
Khai báo sẵn các command để server và client hiểu nhau, các lệnh sẽ được config ở sau. Có một số lệnh khá quan trọng như RPC_CMD_ALLOC_BUFFER yêu cầu server cấp phát RAM/VRAM,...

**deserialize_tensor**:
```C
ggml_tensor * rpc_server::deserialize_tensor(struct ggml_context * ctx, const rpc_tensor * tensor) {
// Kiểu dữ liệu trả về của hàm là ggml_tensor (hay tensor) | thuộc layer rpc_server, tên hàm deserialize_tensor
// ctx (context): con trỏ dùng để cấp phát RAM cho tensor được tạo ra
// tensor: con trỏ gói dữ liệu thô nhận được từ client qua mạng, const (chỉ đọc không sửa - đảm bảo tính toàn vẹn)

    // Kiểm tra xem kiểu dữ liệu từ client gửi lên có nằm trong danh sách được hỗ trợ (GGML_TYPE_COUNT) không, không thì trả về nulll
    if (tensor->type >= GGML_TYPE_COUNT) {
        GGML_LOG_ERROR("[%s] invalid tensor type received: %u\n", __func__, tensor->type);
        return nullptr;
    }
    // dấu -> có tác dụng truy cập vào một thành phần cụ thể bên trong một struct. Ở đây truy cập vào type (kiểu dữ liệu) trong
    // tensor và kiểm tra nếu nó khác GGML_TYPE_COUNT
    
    
    // mỗi kiểu dữ liệu AI có một blocksize, nếu nó = 0 thì máy tính sẽ bị lỗi chia hết cho 0 nên dòng này ngăn lỗi này xảy ra
    if (ggml_blck_size((enum ggml_type)tensor->type) == 0) {
        GGML_LOG_ERROR("[%s] invalid tensor type received (blck_size is 0): %u\n", __func__, tensor->type);
        return nullptr;
		// __func__: lấy tên hàm hiện tại (deserialize_tensor)
		// blocksize có thể bằng 0 khi kiểu dữ liệu sai lệch (do cơ chế tính toán số block trong tensor) 
		// nên khi chia cho 0 sẽ lỗi nên đoạn này dùng điều kiện nếu cái ggml_type của cái type trong tensor = 0 thì in lỗi rồi
		// trả về null
    }
```
Hàm này có tác dụng khởi tạo một tensor dựa trên thông tin nháp được gửi từ mạng


**rpc_server:**
là một class(thường có tác dụng gom các thứ liên quan lại một chỗ cho dễ nhận diện)
các hàm xử lý từng loại lệnh từ client như alloc_buffer, set_tensor, graph_compute,...


**Luồng hoạt động:**
Client: đóng gói metadata gửi vào server qua port 
Server nhận gói tin -> dùng deserialize_tensor để tạo frame tensor trong RAM -> dùng set_tensor để đổ dữ liệu gói tin vào đó -> Tính toán các phép tính ma trận phức tạp để tìm token có tần suất tiếp theo nhiều nhất
Client: Gửi GET_TENSOR để lấy kết quả
## **b. Hiểu đoạn code gây bug**
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