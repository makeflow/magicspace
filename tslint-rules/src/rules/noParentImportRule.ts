import * as Path from 'path';

import {AbstractWalker, IRuleMetadata, RuleFailure, Rules} from 'tslint';
import {ImportKind, findImports} from 'tsutils';
import * as Typescript from 'typescript';

import {removeQuotes} from '../utils/pathUtils';

const DIRECTORY_MODULE_PATH = /^\.{1,2}(?:[\\/]\.{2})*[\\/]?$/;
const ERROR_MESSAGE_BANNED_PARENT_IMPORT =
  'this module can not be imported, because it is imported from parent directory.';

export class Rule extends Rules.AbstractRule {
  apply(sourceFile: Typescript.SourceFile): RuleFailure[] {
    return this.applyWithWalker(
      new NoParentImportRule(sourceFile, Rule.metadata.ruleName, undefined),
    );
  }

  static metadata: IRuleMetadata = {
    ruleName: 'no-parent-import',
    description: 'No additional parameters are required',
    optionsDescription: '',
    options: undefined,
    type: 'maintainability',
    hasFix: true,
    typescriptOnly: false,
  };
}

class NoParentImportRule extends AbstractWalker<undefined> {
  /** 装 import 语句的容器 */
  private importExpressions: Typescript.Expression[] = [];

  walk(sourceFile: Typescript.SourceFile): void {
    for (let expression of findImports(
      sourceFile,
      ImportKind.AllStaticImports,
    )) {
      this.importExpressions.push(expression);
    }

    this.validate();
  }

  private validate() {
    let importExpressions = this.importExpressions;
    let sourceDirName = Path.dirname(this.sourceFile.fileName);

    for (let expression of importExpressions) {
      let modulePath: string | undefined = removeQuotes(expression.getText());

      modulePath = Path.isAbsolute(modulePath)
        ? Path.relative(sourceDirName, modulePath)
        : (modulePath = Path.relative(
            sourceDirName,
            Path.join(sourceDirName, modulePath),
          ));

      if (!DIRECTORY_MODULE_PATH.test(modulePath) && modulePath !== '') {
        continue;
      }

      this.addFailureAtNode(
        expression.parent!,
        ERROR_MESSAGE_BANNED_PARENT_IMPORT,
      );
    }
  }
}
