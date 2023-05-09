# Codenav

A better way to read code, only press one key to: jump to declaration, navigate back and navigate forward.

## Installation

1. Open Visual Studio Code
2. Press `Ctrl + Shift + X` to open the Extensions panel
3. Search for `codenav`
4. Click `Install`

## Features

### Usage

1. Press `Command + Shift + P` to open the Command Palette
2. Search for `Codenav: Enable` and select it to enable plugin function to read code quickly and can't edit code.
3. Search for `Codenav: Disable` and select it to disable plugin function to the normal mode.
4. The status bar will show current status: `codenav:on` or `codenav:off`.

### Key Bindings

When you have enabled codenav, you can use the following key bindings:

- `s` => jump to declaration, use vscode command: `editor.action.goToDeclaration`
- `a` => jump to implementation, use vscode command: `editor.action.goToImplementation`
- `d` => navigate back, use vscode command: `workbench.action.navigateBack`
- `f` => navigate forward, use vscode command: `workbench.action.navigateForward`
- `r` => go to source definition, only effect in ts or js project, use vscode command: `typescript.goToSourceDefinition`
- `h` => `cursorLeft`
- `j` => `cursorDown`
- `k` => `cursorUp`
- `l` => `cursorRight`
- `i` => to the edit(normal) mode
- `o` => `editor.action.insertLineAfter`, then to the edit(normal) mode
- `O` => `editor.action.insertLineBefore`, then to the edit(normal) mode

### Modes

When you have enabled codenav, you can switch between the following modes:

- **Readonly Mode:** Press `Esc` to switch to readonly mode. In this mode, you cannot edit the code, and the key bindings behave like vim.
- **Normal Mode:** Press `i` to switch to normal mode. In this mode, you can edit the code, and the key bindings behave like normal Visual Studio Code key bindings.

## More Information

For more information, please visit the [GitHub repository](https://github.com/lqqyt2423/codenav).

**Enjoy!**
