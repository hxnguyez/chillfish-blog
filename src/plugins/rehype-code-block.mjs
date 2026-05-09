import { visit } from "unist-util-visit";
import { h } from "hastscript";

export default function rehypeCodeBlock() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {

      if (node.tagName !== "pre") {
        return;
      }

      if (!node.properties || !node.properties.dataFilename) {
        return;
      }

      const filename = node.properties.dataFilename;

      delete node.properties.dataFilename;

      const wrapper = h(
        "div",
        {
          class: "code-container",
        },
        [
          h(
            "div",
            {
              class: "code-header",
            },
            [
              h(
                "div",
                {
                  class: "code-header-left",
                },
                [
                  h(
                    "div",
                    {
                      class: "code-icon",
                    },
                    [
                      h(
                        "span",
                        {
                          class: "code-icon-dot",
                        },
                        [{ type: "text", value: "●" }],
                      ),
                    ],
                  ),
                  h(
                    "p",
                    {
                      class: "code-filename",
                    },
                    [{ type: "text", value: filename }],
                  ),
                ],
              ),
              h(
                "div",
                {
                  class: "code-header-right",
                },
                [
                  h(
                    "button",
                    {
                      class: "code-copy",
                      type: "button",
                      ariaLabel: "複製程式碼",
                    },
                    [
                      h(
                        "svg",
                        {
                          xmlns: "http://www.w3.org/2000/svg",
                          width: "16",
                          height: "16",
                          viewBox: "0 0 24 24",
                          fill: "none",
                          stroke: "currentColor",
                          strokeWidth: "2",
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                        },
                        [
                          h("rect", {
                            width: "14",
                            height: "14",
                            x: "8",
                            y: "8",
                            rx: "2",
                            ry: "2",
                          }),
                          h("path", {
                            d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",
                          }),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
          node,
        ],
      );

      if (parent && index != null) {
        parent.children[index] = wrapper;
      }
    });
  };
}
