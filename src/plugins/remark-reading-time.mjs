import getReadingTime from "reading-time";
import { toString } from "mdast-util-to-string";

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    
    // Xuất dữ liệu ra frontmatter để dùng trong các component Astro
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}