import * as vscode from 'vscode';

enum Mode {
	OFF,
	ON,
}

interface IState {
	'codenav.active': boolean;
	'codenav.escforactive': boolean;
}

const getModeText = (m: Mode) => {
	if (m === Mode.OFF) return 'codenav:off';
	return 'codenav:on';
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	// console.log('Congratulations, your extension "codenav" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	function registerCommandNice(commandId: string, run: (...args: any[]) => void): void {
		context.subscriptions.push(vscode.commands.registerCommand(commandId, run));
	}

	// registerCommandNice('codenav.helloWorld', () => {
	// 	// The code you place here will be executed every time your command is executed

	// 	// Display a message box to the user
	// 	vscode.window.showInformationMessage('Hello World from codenav, nice!');
	// });

	const control = new Control(context);

	// when split window, setCursorStyle
	context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => {
		control.setCursorStyle(control.getMode());
	}));

	registerCommandNice('codenav.enable', () => {
		control.setMode(Mode.ON);
	});

	registerCommandNice('codenav.disable', () => {
		control.setMode(Mode.OFF, true);
	});

	registerCommandNice('codenav.type.esc', () => {
		if (!vscode.window.activeTextEditor) return;
		control.setMode(Mode.ON);
	});

	// when mode is on, do nothing
	registerCommandNice('replacePreviousChar', args => {
		if (control.getMode() === Mode.OFF) vscode.commands.executeCommand('default:replacePreviousChar', args);
	});

	registerCommandNice('type', args => {
		if (!vscode.window.activeTextEditor) return;
		if (control.getMode() === Mode.OFF) return vscode.commands.executeCommand('default:type', args);

		const { text } = args;
		switch (text) {
			case 'i':
				control.setMode(Mode.OFF);
				break;
			case 'f':
				vscode.commands.executeCommand('workbench.action.navigateForward');
				break;
			case 'd':
				vscode.commands.executeCommand('workbench.action.navigateBack');
				break;
			case 's':
				vscode.commands.executeCommand('editor.action.goToDeclaration');
				break;
			case 'a':
				vscode.commands.executeCommand('editor.action.goToImplementation');
				break;
			case 'r':
				if (vscode.languages.match(['javascript', 'typescript'], vscode.window.activeTextEditor.document) === 10) {
					vscode.commands.executeCommand('typescript.goToSourceDefinition');
				}
			default:
				break;
		}
	});

	registerCommandNice('codenav.type.move', (args) => {
		if (!vscode.window.activeTextEditor) return;
		if (control.getMode() === Mode.OFF) return;

		switch (args.to) {
			case 'left':
				vscode.commands.executeCommand('cursorLeft');
				break;
			case 'right':
				vscode.commands.executeCommand('cursorRight');
				break;
			case 'down':
				vscode.commands.executeCommand('cursorDown');
				break;
			case 'tabright':
				vscode.commands.executeCommand('cursorWordEndRight');
				break;
			case 'tableft':
				vscode.commands.executeCommand('cursorWordStartLeft');
				break;
			default:
				break;
		}
	});
	

	// some other functions

	const toggleConfig = (section: string, prop: string) => {
		const config = vscode.workspace.getConfiguration(section);
		const detail = config.inspect(prop);

		if (detail?.workspaceValue != null) {
			console.log(`workspace ${section}.${prop} change to ${!detail.workspaceValue}`);
			config.update(prop, !detail.workspaceValue);
			return;
		}

		if (detail?.globalValue != null) {
			console.log(`global ${section}.${prop} change to ${!detail.globalValue}`);
			config.update(prop, !detail.globalValue, 1);
			return;
		}
	}
	registerCommandNice('codenav.formatOnSave.toggle', () => {
		toggleConfig('editor', 'formatOnSave');
	});
	registerCommandNice('codenav.eslint.enable.toggle', () => {
		toggleConfig('eslint', 'enable');
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}

class StatusBar {
	private _actual: vscode.StatusBarItem;
	private _lastText: string;

	constructor(text: string) {
		this._actual = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
		this._lastText = text;
		this._actual.text = text;
		this._actual.show();
	}

	public setText(text: string): void {
		if (this._lastText === text) {
			return;
		}
		this._lastText = text;
		this._actual.text = this._lastText;
	}
}

class ContextKey {
	private _name: string;
	private _lastValue: boolean;

	constructor(name: string, value = false) {
		this._name = name;
		this._lastValue = false;
		this.set(value);
	}

	public set(value: boolean): void {
		if (this._lastValue === value) {
			return;
		}
		this._lastValue = value;
		vscode.commands.executeCommand('setContext', this._name, this._lastValue);
	}
}

class Control {
	private _modeCtx: ContextKey;
	private _activedCtx: ContextKey;
	private _context: vscode.ExtensionContext;
	private _lastMode: Mode;
	private _state: IState;
	private _statusBar: StatusBar;

	constructor(context: vscode.ExtensionContext) {
		this._context = context;
		this._modeCtx = new ContextKey('codenav.active');
		this._activedCtx = new ContextKey('codenav.escforactive');

		// init
		const initState= this._state = context.globalState.get<IState>('state') || { 'codenav.active': false, 'codenav.escforactive': false };
		this._modeCtx.set(initState['codenav.active']);
		this._activedCtx.set(initState['codenav.escforactive']);
		this._lastMode = initState['codenav.active'] ? Mode.ON : Mode.OFF;
		this._statusBar = new StatusBar(getModeText(this._lastMode));

		this.setMode(this._lastMode);
	}

	getMode() {
		return this._lastMode;
	}

	setMode(m: Mode, forceOff: boolean = false) {
		if (m === Mode.OFF) {
			if (forceOff) {
				this._activedCtx.set(false);
				this._state['codenav.escforactive'] = false;
			}

			// 开启过此模式，之后 esc 键也可以控制开启
			else if (this._lastMode === Mode.ON) {
				this._activedCtx.set(true);
				this._state['codenav.escforactive'] = true;
			}
		}

		this.setCursorStyle(m);
		this._statusBar.setText(getModeText(m));
		this._modeCtx.set(m === Mode.ON);
		this._state['codenav.active'] = m === Mode.ON;

		this._lastMode = m;

		// save state
		this._context.globalState.update('state', this._state);
	}

	setCursorStyle(m: Mode) {
		if (!vscode.window.activeTextEditor) return;
		const style = m === Mode.ON ? vscode.TextEditorCursorStyle.Block : vscode.TextEditorCursorStyle.Line;
		const currentCursorStyle = vscode.window.activeTextEditor.options.cursorStyle;
		if (style !== currentCursorStyle) {
			vscode.window.activeTextEditor.options = { cursorStyle: style };
		}
	}
}
