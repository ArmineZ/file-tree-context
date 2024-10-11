# File Tree Context

Save your project's file tree into a file between `<FileTree>` tags on save. Useful for providing context to AI IDEs like [Cursor](https://www.cursor.so/) (e.g., in `.cursorrules`).

## Overview

**File Tree Context** is a Visual Studio Code extension that automatically generates a textual representation of your project's file tree. This file tree is inserted between `<FileTree>` tags in a specified target file whenever you save a file in the workspace.

By providing a snapshot of your project structure, this extension can enhance the context available to AI tools and IDEs that utilize such information for code suggestions, refactoring, or other intelligent features.

## Features

- Automatically updates your project's file tree on file save.
- Inserts the file tree between customizable `<FileTree>` tags in a target file.
- Supports ignore patterns using `.gitignore` or custom ignore files.
- Customizable via a configuration file (`filetreecontext.config.json`).

## Installation

1. Install the extension from the Visual Studio Code Marketplace: [File Tree Context](#) (link to be updated upon publishing).

2. Reload or restart Visual Studio Code to activate the extension.

## Usage

### Configuration

To use **File Tree Context**, you need to add a configuration file named `filetreecontext.config.json` to the root of your project. This file tells the extension when to activate and how to behave.

#### Example `filetreecontext.config.json`:

```json
{
  "ignoreFiles": [".gitignore", ".myignore"],
  "targetFile": ".cursorrules"
}
```

- **`ignoreFiles`** (optional): An array of file names containing ignore patterns. The extension will use these patterns to exclude files or directories from the generated file tree. Defaults to `[".gitignore"]` if not specified.
- **`targetFile`** (required): The file where the extension will insert the `<FileTree>` tags and the generated file tree.

### How It Works

1. **Activation**: The extension activates when it detects the `filetreecontext.config.json` file in the root of your project.

2. **File Save Event**: Every time you save a file in the workspace, the extension triggers the file tree update process.

3. **Generating the File Tree**:
   - Reads the ignore patterns from the files specified in `ignoreFiles`.
   - Scans your project directory, excluding files and directories that match the ignore patterns.
   - Creates a textual representation of the file tree.

4. **Updating the Target File**:
   - Inserts the generated file tree between `<FileTree>` and `</FileTree>` tags in the `targetFile`.
   - If the `targetFile` doesn't exist, it creates it with the file tree between the tags.

### Example

Given the following project structure:

```
my-project/
├── filetreecontext.config.json
├── .gitignore
├── src/
│   ├── index.js
│   └── utils.js
├── README.md
└── package.json
```

With `.gitignore` content:

```
node_modules/
```

And `filetreecontext.config.json`:

```json
{
  "ignoreFiles": [".gitignore"],
  "targetFile": ".cursorrules"
}
```

After saving a file, the `.cursorrules` file will look like:

```
<FileTree>
├── filetreecontext.config.json
├── src
│   ├── index.js
│   └── utils.js
├── README.md
└── package.json
</FileTree>
```

### Notes

- The extension only updates the file tree on file save events.
- Hidden files and directories (those starting with `.`) are ignored by default.
- If the `<FileTree>` tags are not present in the `targetFile`, the extension will add them and insert the file tree between them.

## Contributing

Contributions are welcome! Please submit issues and pull requests to the [GitHub repository](#) (link to be updated upon repository creation).

## License

This project is [MIT Licensed](LICENSE).

## Acknowledgments

- Inspired by the need to provide context to AI-assisted IDEs like [Cursor](https://www.cursor.so/).
- Uses the [`ignore`](https://www.npmjs.com/package/ignore) library for handling ignore patterns.