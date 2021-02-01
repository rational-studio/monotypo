import { Command } from 'clipanion';
import { render, Box } from 'ink';
import Watch from '../../components/Watch';
export class TestCommand extends Command {
  static paths = [['test']];
  static usage = {
    description: 'Test product',
  };
  async execute() {
    render(
      <Box>
        <Watch />
      </Box>
    );
  }
}
