import { Command, Option } from 'clipanion';
import { getPackageInfo } from '../../utils/workspace';
import { parallelizeTasks } from '../../utils/parallelism';
import { MPackage } from '../../utils/MPackage';
import { render } from 'ink';
import BuildUI from './components/BuildUI';

function getTaskQueue(target?: string) {
  const packageInfo = getPackageInfo();
  if (target) {
    const pkg = packageInfo.get(target);
    if (pkg) {
      return parallelizeTasks(pkg);
    } else {
      throw new Error(`Target Package "${target}" is not valid.`);
    }
  } else {
    return parallelizeTasks(...Array.from(packageInfo.values()));
  }
}

function stripTaskQueueWithoutConfig(taskQueue: MPackage[][]) {
  return taskQueue
    .map(items => items.filter(item => item.isMConfigExisted))
    .filter(items => items.length > 0);
}

export class BuildCommand extends Command {
  static paths = [['build']];
  static usage = {
    description: 'Build product',
  };
  private clean = Option.Boolean('--clean,-c', false, {
    description: 'Delete cache folders and do a fresh build',
  });
  private to = Option.String('--to,-t', {
    tolerateBoolean: false,
    required: false,
    description:
      'Normally all projects in the monorepo will be processed; adding this parameter will instead select a subset of projects. Each "--to" parameter expands this selection to include PROJECT and all its dependencies. "." can be used as shorthand for the project in the current working directory.',
  });

  async execute() {
    const { to: target, clean: isCleanBuild } = this;
    // TODO: Should give warning to users if some of the dependent project can't be built
    const taskQueue = stripTaskQueueWithoutConfig(getTaskQueue(target));
    render(<BuildUI taskQueue={taskQueue} isCleanBuild={isCleanBuild} />);
  }
}
