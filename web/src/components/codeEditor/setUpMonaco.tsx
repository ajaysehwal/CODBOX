import * as monaco from "monaco-editor";

export const setupMonaco = () => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2015,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    esModuleInterop: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"],
  });

  fetch("https://unpkg.com/@types/react@latest/index.d.ts")
    .then((response) => response.text())
    .then((types) => {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(
        types,
        "file:///node_modules/@types/react/index.d.ts"
      );
    });
};