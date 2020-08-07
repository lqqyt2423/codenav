import * as vscode from 'vscode';

enum Mode {
	OFF,
	ON,
}

const getModeText = (m: Mode) => {
	if (m === Mode.OFF) return 'cn:normal';
	return 'cn:readonly';
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

	let mode = Mode.OFF;
	const modeCtx = new ContextKey('codenav.active');
	const activedCtx = new ContextKey('codenav.escforactive');

	const statusBar = new StatusBar(getModeText(mode));
	const setMode = (m: Mode) => {
		// 开启过此模式，之后 esc 键也可以控制开启
		if (mode == Mode.ON && m == Mode.OFF) activedCtx.set(true);

		mode = m;
		statusBar.setText(getModeText(m));
		modeCtx.set(m === Mode.ON);
	};

	registerCommandNice('codenav.enable', () => {
		setMode(Mode.ON);
	});

	registerCommandNice('codenav.disable', () => {
		setMode(Mode.OFF);
		activedCtx.set(false);
	});

	registerCommandNice('codenav.type.esc', () => {
		if (!vscode.window.activeTextEditor) return;
		setMode(Mode.ON);
	});

	registerCommandNice('type', args => {
		if (!vscode.window.activeTextEditor) return;
		if (mode === Mode.OFF) return vscode.commands.executeCommand('default:type', args);

		const { text } = args;
		switch (text) {
			case 'i':
				setMode(Mode.OFF);
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
			default:
				break;
		}
	});

	registerCommandNice('codenav.type.move', (args) => {
		if (!vscode.window.activeTextEditor) return;
		if (mode === Mode.OFF) return;

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
