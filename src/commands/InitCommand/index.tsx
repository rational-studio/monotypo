import { Command } from 'clipanion';
import { render, Box } from 'ink';
import Watch from '../../components/Watch';
export class InitCommand extends Command {
  static paths = [['init']];
  static usage = {
    description: 'Init product',
  };
  async execute() {
    render(
      <Box>
        <Watch />
      </Box>
    );
  }
}
