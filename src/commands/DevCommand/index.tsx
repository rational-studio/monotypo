import { Command, Option } from 'clipanion';
import { render, Box, Text } from 'ink';
import Watch from '../../components/Watch';
export class DevCommand extends Command {
  static paths = [['dev'], ['watch']];
  static usage = {
    description: 'Start Development server',
    examples: [
      ['Start local development server with default option', '$0 dev'],
    ] as [string, string][],
  };
  private packageName = Option.String({
    required: false,
  });
  private port = Option.String(`-p,--port`, '8080', {
    arity: 1,
    description: 'port number for the local server, default value is 8080',
  });
  async execute() {
    render(
      <Box>
        <Text>{this.packageName}</Text>
        <Watch />
      </Box>
    );
  }
}
