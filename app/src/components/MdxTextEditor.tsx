import { useEffect, useMemo, useState } from "react";
import type { MutableRefObject } from "react";
import {
  MDXEditor,
  toolbarPlugin,
  headingsPlugin,
  listsPlugin,
  linkPlugin,
  linkDialogPlugin,
  markdownShortcutPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  CreateLink,
  BlockTypeSelect,
  ListsToggle,
  type MDXEditorMethods,
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

type Props = {
  value: string;
  onChange: (md: string) => void;

  // ✅ mutable ref, damit wir current setzen dürfen
  editorRef?: MutableRefObject<MDXEditorMethods | null>;
};

export default function MdxTextEditor({ value, onChange, editorRef }: Props) {
  const [editorValue, setEditorValue] = useState<string>(value ?? "");

  useEffect(() => {
    setEditorValue(value ?? "");
  }, [value]);

  const plugins = useMemo(
    () => [
      headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
      listsPlugin(),
      linkPlugin(),
      linkDialogPlugin(),
      toolbarPlugin({
        toolbarContents: () => (
          <>
            <UndoRedo />
            <BlockTypeSelect />
            <BoldItalicUnderlineToggles />
            <CreateLink />
            <ListsToggle />
          </>
        ),
      }),
      markdownShortcutPlugin(),
    ],
    [],
  );

  return (
    <MDXEditor
      ref={(instance) => {
        if (editorRef) editorRef.current = instance;
      }}
      markdown={editorValue}
      onChange={(md) => {
        setEditorValue(md);
        onChange(md);
      }}
      contentEditableClassName="mdx-editor-content"
      plugins={plugins}
    />
  );
}
