// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const reactDocgen = require('react-docgen');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "ReactDocBuilder" is now active!');

    // Register a command to generate documentation for the current component.
    context.subscriptions.push(
        vscode.commands.registerCommand("ReactDocBuilder.generateDocumentation", async () => {
            // Get the active text editor.
            const editor = vscode.window.activeTextEditor;

            // If the active editor is not empty, generate documentation for the component.
            if (editor) {
                const componentName = editor.document.fileName.split("/").pop();
                const componentCode = editor.document.getText();

                // Generate documentation for the component.
                const documentation = reactDocgen(componentCode);

                // Create a new Markdown document with the generated documentation.
                const markdownDocument = await vscode.workspace.openTextDocument({
                    language: "markdown",
                    content: documentation,
                });

                // Display the Markdown document.
                await vscode.window.showTextDocument(markdownDocument);
            }
        })
    );
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
    activate,
    deactivate
}
