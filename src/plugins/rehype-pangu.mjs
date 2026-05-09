import { visit } from "unist-util-visit";
import pangu from "pangu";

const excludeHtmlTags = ["code", "pre", "kbd", "samp", "var", "tt"]; 


export default function rehypePangu() {
  return (tree) => {
    visit(tree, "text", (node, _index, parent) => {

      if (parent && excludeHtmlTags.includes(parent.tagName)) {
        return;
      }

      if (node.value && typeof node.value === "string") {
        node.value = pangu.spacingText(node.value);
      }
    });
  };
}
