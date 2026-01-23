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
} from "@mdxeditor/editor";

import "@mdxeditor/editor/style.css";

type Props = {
  value: string;
  onChange: (md: string) => void;
};

export default function MdxTextEditor({ value, onChange }: Props) {
  return (
    <MDXEditor
      markdown={value}
      onChange={onChange}
      contentEditableClassName="mdx-editor-content"
      plugins={[
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
      ]}
    />
  );
}
