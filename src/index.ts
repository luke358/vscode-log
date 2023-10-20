import type { ExtensionContext, Position, TextDocument, TextEditor, TextEditorEdit } from 'vscode'
import { CompletionItem, CompletionItemKind, Range, commands, languages, window } from 'vscode'
import { parse } from '@babel/parser'

export function activate(context: ExtensionContext) {
  const command = 'vscode-log'
  const provider = languages.registerCompletionItemProvider(
    [
      'html',
      'javascript',
      'javascriptreact',
      'typescript',
      'typescriptreact',
      'vue',
    ],
    {
      provideCompletionItems(document: TextDocument, position: Position) {
        const completionItem = new CompletionItem('log', CompletionItemKind.Method)
        completionItem.command = { command, title: 'refactor', arguments: [position] }
        return [
          completionItem,
        ]
      },

    },
    '.',
  )
  const commandHandler = (editor: TextEditor, edit: TextEditorEdit, position: Position) => {
    const s = editor.document.lineAt(position.line).text
    const code = s.slice(0, -4)
    let codeToTest = ''
    let longestRunnableCode = ''
    for (let i = code.length - 1; i >= 0; i--) {
      codeToTest = code.charAt(i) + codeToTest
      if (isCodeValid(codeToTest))
        longestRunnableCode = codeToTest
    }

    const idx = code.length - longestRunnableCode.length
    const insertVal = code.slice(idx)
    edit.delete(new Range(position.with(undefined, idx), position.with(undefined, s.length)))

    edit.insert(position.with(undefined, idx), `${insertVal.startsWith(' ') && ' '}console.log(${insertVal.trim()})`)
    window.showInformationMessage(longestRunnableCode)
  }

  context.subscriptions.push(
    commands.registerTextEditorCommand(command, commandHandler),
  )
  context.subscriptions.push(provider)

  window.showInformationMessage('Hello')

  function isCodeValid(code: string) {
    try {
      parse(code)
      return true
    }
    catch (error) {
      return false
    }
  }
}

export function deactivate() {

}
