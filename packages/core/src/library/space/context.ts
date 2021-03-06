import * as Path from 'path';

import {Composable, File} from '../file';

import {Space} from './space';

export class Context {
  private fileMap = new Map<string, File<unknown, unknown>>();

  constructor(readonly space: Space, readonly dir: string) {}

  getFile(path: string): File<unknown, unknown> | undefined {
    return this.fileMap.get(path);
  }

  ensureFile(
    path: string,
    composable: Composable<unknown, unknown>,
  ): File<unknown, unknown> {
    let space = this.space;

    let fileMap = this.fileMap;

    let file = fileMap.get(path);

    if (file) {
      space.assertFileObject(file, path, composable.type);
    } else {
      file = space.createFileObject(
        path,
        {
          possibleOutputPath: Path.join(
            space.dir,
            Path.relative(this.dir, path),
          ),
        },
        composable.type,
      );

      fileMap.set(path, file);
    }

    return file;
  }

  async generate(): Promise<void> {
    for (let file of this.fileMap.values()) {
      await file.save();
    }
  }
}
