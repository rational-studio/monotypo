import { Command } from 'clipanion';
import { render, Box } from 'ink';
import Watch from '../../components/Watch';
export class CreateCommand extends Command {
  static paths = [['create']];
  static usage = {
    description: 'Create product',
  };
  async execute() {
    render(
      <Box>
        <Watch />
      </Box>
    );
  }
}
