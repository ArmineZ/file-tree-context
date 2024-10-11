import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import ignore, { Ignore } from "ignore";

export function activate(context: vscode.ExtensionContext) {
  try {
    // Handle file save event only
    const disposableSave = vscode.workspace.onDidSaveTextDocument(() => {
      updateFileTree();
    });

    context.subscriptions.push(disposableSave);
  } catch (error) {
    console.error(`Failed to activate the extension: ${error}`);
  }
}

function updateFileTree() {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) return;

  const rootPath = workspaceFolders[0].uri.fsPath;

  // Check for 'ftctx.config.json' in the root of the project
  const configPath = path.join(rootPath, "filetreecontext.config.json");
  if (!fs.existsSync(configPath)) {
    // Config file not found; do nothing
    return;
  }

  // Read and parse the configuration file
  let configContent: string;
  try {
    configContent = fs.readFileSync(configPath, "utf-8");
  } catch (err) {
    console.error(`Failed to read config file: ${err}`);
    return;
  }

  let config: {
    ignoreFiles?: string[];
    targetFile?: string;
  };
  try {
    config = JSON.parse(configContent);
  } catch (err) {
    console.error(`Invalid JSON in config file: ${err}`);
    return;
  }

  // Get ignore files from config or default to ['.gitignore']
  const ignoreFiles = Array.isArray(config.ignoreFiles) ? config.ignoreFiles : [".gitignore"];

  // Get target file from config
  const targetFile = typeof config.targetFile === "string" ? config.targetFile : null;

  if (!targetFile) {
    console.error("No 'targetFile' specified in config file.");
    return;
  }

  // Load ignore rules from specified ignore files
  const ignoreRules = loadIgnoreFiles(rootPath, ignoreFiles);

  // Generate file tree
  const fileTree = generateFileTree(rootPath, ignoreRules, rootPath);

  const targetFilePath = path.join(rootPath, targetFile);
  let targetFileContent = "";

  // Check if the target file exists
  if (fs.existsSync(targetFilePath)) {
    targetFileContent = fs.readFileSync(targetFilePath, "utf-8");
  } else {
    // If the file doesn't exist, initialize with empty <FileTree> tags
    targetFileContent = "<FileTree></FileTree>";
  }

  const newContent = insertFileTreeBetweenTags(targetFileContent, fileTree);

  // Write the updated content to the target file
  try {
    fs.writeFileSync(targetFilePath, newContent);
  } catch (err) {
    console.error(`Failed to update ${targetFile}: ${err}`);
  }
}

// Load rules from provided ignore files
function loadIgnoreFiles(rootPath: string, ignoreFiles: string[]): Ignore {
  const ig = ignore();

  ignoreFiles.forEach((ignoreFileName) => {
    const ignoreFilePath = path.join(rootPath, ignoreFileName);
    if (fs.existsSync(ignoreFilePath)) {
      const ignoreContent = fs.readFileSync(ignoreFilePath, "utf-8");
      ig.add(ignoreContent);
    }
  });

  return ig;
}

function generateFileTree(
  dir: string,
  ig: Ignore,
  rootPath: string,
  prefix: string = "",
  isLast: boolean = false
): string {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  let tree = "";

  items.forEach((item, index) => {
    const isDir = item.isDirectory();

    // Skip hidden files and directories
    if (item.name.startsWith(".")) {
      return;
    }

    const absoluteItemPath = path.join(dir, item.name);
    const relativeItemPath = path.relative(rootPath, absoluteItemPath); // Get path relative to the root

    // Append '/' to directories to match patterns that end with '/'
    const pathToCheck = isDir ? `${relativeItemPath}/` : relativeItemPath;

    // Skip ignored files and directories, including their roots
    if (ig.ignores(pathToCheck)) {
      return;
    }

    const connector = index === items.length - 1 ? "└──" : "├──";
    tree += `${prefix}${connector} ${item.name}\n`;

    // If it's a directory, recurse into it
    if (isDir) {
      const newPrefix = prefix + (index === items.length - 1 ? "    " : "│   ");
      tree += generateFileTree(absoluteItemPath, ig, rootPath, newPrefix, index === items.length - 1);
    }
  });

  return tree;
}

// Insert the file tree between <FileTree></FileTree> tags
function insertFileTreeBetweenTags(originalContent: string, fileTree: string): string {
  const fileTreeStartTag = "<FileTree>";
  const fileTreeEndTag = "</FileTree>";

  const startIdx = originalContent.indexOf(fileTreeStartTag);
  const endIdx = originalContent.indexOf(fileTreeEndTag);

  if (startIdx !== -1 && endIdx !== -1) {
    return (
      originalContent.substring(0, startIdx + fileTreeStartTag.length) +
      "\n" +
      fileTree +
      originalContent.substring(endIdx)
    );
  } else {
    // If the tags are not present, add them
    return `${fileTreeStartTag}\n${fileTree}\n${fileTreeEndTag}`;
  }
}

export function deactivate() {}