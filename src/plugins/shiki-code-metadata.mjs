const langToFilenameMap = {
  bash: "Shell",
  c: "C",
  cpp: "C++",
  css: "CSS",
  go: "Go",
  html: "HTML",
  js: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  plaintext: "Plain Text",
  py: "Python",
  python: "Python",
  ruby: "Ruby",
  rust: "Rust",
  scala: "Scala",
  sh: "Shell",
  shell: "Shell",
  solidity: "Solidity",
  toml: "TOML",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  vue: "Vue",
  yaml: "YAML",
  yml: "YAML",
  zsh: "Shell",
  astro: "Astro",
  svelte: "Svelte",
  mjs: "JavaScript",
  cjs: "JavaScript",
};

export default function shikiCodeMetadata() {
  return {
    name: "shiki-code-metadata",
    pre(node) {
      const meta = this.options.meta?.__raw;

      if (meta == undefined) {
        const lang = this.options.lang;
        const defaultFilename = langToFilenameMap[lang];
        if (defaultFilename) {
          node.properties.dataFilename = defaultFilename;
        }
        return;
      }

      const attributes = meta.split(/\s+/).filter(Boolean);
      const styles = [];
      let hasExplicitFilename = false;

      for (const attr of attributes) {
        const [key, value] = attr.split("=", 2);

        if (!key) {
          continue;
        }

        switch (key) {
          case "file":
            node.properties.dataFilename = value;
            hasExplicitFilename = true;
            break;
          case "start":
            styles.push(`--start-line: ${value}`);
            break;
          case "numbers":
            this.addClassToHast(node, "show-line-numbers");
            break;
        }
      }

      if (!hasExplicitFilename) {
        const lang = this.options.lang;
        const defaultFilename = langToFilenameMap[lang];
        if (defaultFilename) {
          node.properties.dataFilename = defaultFilename;
        }
      }

      if (styles.length > 0) {
        const existingStyle = node.properties.style || "";
        const separator =
          existingStyle && !existingStyle.endsWith(";") ? ";" : "";
        node.properties.style = existingStyle + separator + styles.join(";");
      }
    },
  };
}
