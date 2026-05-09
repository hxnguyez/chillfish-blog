import { visit } from "unist-util-visit";

export function remarkZoomableImage() {
  return (tree) => {
    visit(tree, "image", (node) => {
      node.data = node.data || {};
      node.data.hProperties = node.data.hProperties || {};

      node.data.hProperties["data-zoomable"] = "true";
    });
  };
}
