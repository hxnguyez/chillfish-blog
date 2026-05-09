import { visit } from "unist-util-visit";

export function remarkCitation() {
  return (tree) => {
    visit(tree, "blockquote", (node) => {
      const childrenToRemove = [];
      const citations = [];

      node.children.forEach((child, index) => {
        if (child.type === "paragraph") {
          const lastTextNode = child.children[child.children.length - 1];

          if (
            lastTextNode &&
            lastTextNode.type === "text" &&
            lastTextNode.value.trim().startsWith("-#")
          ) {
            const citationText = lastTextNode.value.replace("-#", "").trim();
            citations.push(citationText);

            childrenToRemove.push(index);
          }
        }
      });

      for (let i = childrenToRemove.length - 1; i >= 0; i--) {
        node.children.splice(childrenToRemove[i], 1);
      }

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
