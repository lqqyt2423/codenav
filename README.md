# codenav README

A better way to read code, only press one key to: jump to declaration, navigate back and navigate forward.

更好的方式去阅读源码，跳转至函数定义、前进或后退仅需按一个键。

## Features

`command + shift + p` then:

- `Codenav: Enable` => enable plugin function to read code quickly and can't edit code.
- `Codenav: Disable` => disable plugin function to the normal mode.

The status bar show current status: `codenav:on` or `codenav:off`.

When you enabled, then you can press key:

- `s` => jump to declaration, use vscode command: `editor.action.goToDeclaration`
- `a` => jump to implementation, use vscode command: `editor.action.goToImplementation`
- `d` => navigate back, use vscode command: `workbench.action.navigateBack`
- `f` => navigate forward, use vscode command: `workbench.action.navigateForward`
- `i` => to the normal mode
- `esc` => to the readonly mode

### For more information

* [GitHub](https://github.com/lqqyt2423/codenav)

**Enjoy!**
