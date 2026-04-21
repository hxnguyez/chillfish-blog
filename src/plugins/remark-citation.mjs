import { visit } from "unist-util-visit";

export function remarkCitation() {
  return (tree) => {
    visit(tree, "blockquote", (node) => {
      // 建立一個數組來收集要移除的索引，避免在遍歷時直接修改導致偏移
      const childrenToRemove = [];
      const citations = [];

      node.children.forEach((child, index) => {
        if (child.type === "paragraph") {
          const lastTextNode = child.children[child.children.length - 1];

          // 檢查該段落是否以 -# 開頭
          if (
            lastTextNode &&
            lastTextNode.type === "text" &&
            lastTextNode.value.trim().startsWith("-#")
          ) {
            // 提取出處文字（移除 -#）
            const citationText = lastTextNode.value.replace("-#", "").trim();
            citations.push(citationText);

            // 標記這個節點需要被移除
            childrenToRemove.push(index);
          }
        }
      });

      // 1. 從後往前移除被識別為出處的段落節點，確保索引不會出錯
      for (let i = childrenToRemove.length - 1; i >= 0; i--) {
        node.children.splice(childrenToRemove[i], 1);
      }

      // 2. 將收集到的所有出處組合成結構化節點，避免直接注入 HTML 字串
      if (citations.length > 0) {
        node.children.push({
          type: "citationWrapper",
          data: {
            hName: "div",
            hProperties: {
              className: ["citation-wrapper"],
            },
          },
          children: citations.map((text) => ({
            type: "citation",
            data: {
              hName: "cite",
              hProperties: {
                className: ["blockquote-citation"],
              },
            },
            children: [
              {
                type: "text",
                value: text,
              },
            ],
          })),
        });
      }
    });
  };
}
