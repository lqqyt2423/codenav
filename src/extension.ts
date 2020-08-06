import * as vscode from 'vscode';

enum Mode {
	NORMAL,
	READ,
}

const getModeText = (m: Mode) => {
	if (m === Mode.NORMAL) return 'cn:normal';
	return 'cn:readonly';
};

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "codenav" is now active!');

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

	let mode = Mode.NORMAL;
	const statusBar = new StatusBar(getModeText(mode));
	const setMode = (m: Mode) => {
		mode = m;
		statusBar.setText(getModeText(m));
	};

	registerCommandNice('codenav.enable', () => {
		setMode(Mode.READ);
	});

	registerCommandNice('codenav.disable', () => {
		setMode(Mode.NORMAL);
	});

	registerCommandNice('type', args => {
		if (!vscode.window.activeTextEditor) return;
		if (mode === Mode.NORMAL) return vscode.commands.executeCommand('default:type', args);

		const { text } = args;
		switch (text) {
			case 'i':
				setMode(Mode.NORMAL);
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
