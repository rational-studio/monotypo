import { Command, Option } from 'clipanion';
import { render, Box, Text } from 'ink';
import Watch from '../../components/Watch';
import {
  stripTaskQueueWithoutConfig,
  getTaskQueue,
} from '../../utils/taskQueue';
export class DevCommand extends Command {
  static paths = [['dev'], ['watch']];
  static usage = {
    description: 'Start Development server',
    examples: [
      ['Start local development server with default option', '$0 dev'],
    ] as [string, string][],
  };
  private to = Option.String('--to,-t', {
    tolerateBoolean: false,
    required: false,
    description:
      'Normally all projects in the monorepo will be processed; adding this parameter will instead select a subset of projects. Each "--to" parameter expands this selection to include PROJECT and all its dependencies. "." can be used as shorthand for the project in the current working directory.',
  });

  private port = Option.String(`-p,--port`, '8080', {
    arity: 1,
    description: 'port number for the local server, default value is 8080',
  });
  async execute() {
    const { to: target } = this;
    // TODO: Should give warning to users if some of the dependent project can't be built
    const taskQueue = stripTaskQueueWithoutConfig(getTaskQueue(target));
    for (const tasks of taskQueue) {
      if (tasks.find(task => task.name === target)) {
        await Promise.all(tasks.map(task => task.watch()));
      } else {
        await Promise.all(tasks.map(task => task.build()));
      }
    }
    render(
      <Box>
        <Text>{target}</Text>
      </Box>
    );
  }
}
