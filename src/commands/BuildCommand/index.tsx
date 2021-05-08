import { Command, Option } from 'clipanion';
import { render } from 'ink';
import BuildUI from './components/BuildUI';
import {
  stripTaskQueueWithoutConfig,
  getTaskQueue,
} from '../../utils/taskQueue';

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
