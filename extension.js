const vscode = require('vscode');

function activate(context) {
	console.log('Congratulations, your extension "React-documentation" is now active!');

	let disposable = vscode.commands.registerCommand('React-documentation.insertReactComment', function () {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const selection = editor.selection;
			const position = selection.isEmpty ? selection.active : selection.start;

			// Get the current line content
			const lineContent = editor.document.lineAt(position.line).text.trim();

			// Check if the current line is a React component definition
			if (isReactComponent(lineContent)) {
				try {
					// Parse the component name
					const componentName = getComponentName(lineContent);

					// Get the props from the component definition
					const props = getPropsFromComponent(editor, position.line);

					// Generate a comment with component name and props
					const comment = generateComment(componentName, props);

					// Insert the generated comment at the cursor position
					editor.edit(editBuilder => {
						editBuilder.insert(position, `/**\n${comment}\n*/\n`);
					});

					vscode.window.showInformationMessage('React comment generated successfully!');
				} catch (error) {
					console.error('Error generating React comment:', error);
					vscode.window.showErrorMessage('Error generating React comment. See output for details.');
				}
			} else {
				vscode.window.showInformationMessage('No React component found at the cursor.');
			}
		}
	});

	context.subscriptions.push(disposable);
}

function deactivate() { }

function isReactComponent(lineContent) {
	// Check if the line defines a React component (function component)
	return lineContent.startsWith('function') || lineContent.startsWith('const');
}

function getComponentName(lineContent) {
	// Extract the component name from the function or const definition line
	const match = lineContent.match(/(?:function|const)\s+(\w+)/);
	return match ? match[1] : null;
}

function getPropsFromComponent(editor, line) {
	// Extract props from within the component definition
	const endLine = editor.document.lineCount - 1;

	let props = {};
	for (let currentLine = line + 1; currentLine < endLine; currentLine++) {
		const lineText = editor.document.lineAt(currentLine).text.trim();

		// Check for the end of the component definition
		if (lineText.startsWith('}') || lineText.startsWith('return') || lineText.startsWith('const')) {
			break;
		}

		// Check for prop declarations in destructuring
		const propMatch = lineText.match(/\{([^}]+)\}/);
		if (propMatch) {
			const propList = propMatch[1].split(',').map(prop => prop.trim());
			propList.forEach(prop => {
				const [propName] = prop.split(':');
				props[propName] = { type: 'undefined' }; // You may need to improve type detection
			});
		}

		// Check for prop declarations in function arguments
		const funcArgsMatch = lineText.match(/\(([^)]+)\)/);
		if (funcArgsMatch) {
			const argList = funcArgsMatch[1].split(',').map(arg => arg.trim());
			argList.forEach(arg => {
				const [argName] = arg.split(':');
				props[argName] = { type: 'undefined' }; // You may need to improve type detection
			});
		}
	}

	return props;
}

function generateComment(componentName, props) {
	if (!componentName) {
		return 'No component name found.';
	}

	if (Object.keys(props).length === 0) {
		return ` * @component ${componentName}\n * No props found for this component.`;
	}

	const commentLines = Object.keys(props).map(propName => {
		const propInfo = props[propName];
		return ` * @prop ${propName} (${propInfo.type})`;
	});

	return ` * @component ${componentName}\n${commentLines.join('\n')}`;
}

module.exports = {
	activate,
	deactivate
};
