import { visit } from "unist-util-visit";

export function remarkZoomableImage() {
  return (tree) => {
    visit(tree, "image", (node) => {
      // 確保 node.data 存在
      node.data = node.data || {};
      // hProperties 是 remark 轉換為 HTML 屬性的關鍵欄位
      node.data.hProperties = node.data.hProperties || {};

      // 加入 data-zoomable 標籤
      node.data.hProperties["data-zoomable"] = "true";
    });
  };
}
