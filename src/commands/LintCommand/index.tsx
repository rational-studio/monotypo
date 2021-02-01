import { Command } from 'clipanion';
import { render, Box } from 'ink';
import Watch from '../../components/Watch';
export class LintCommand extends Command {
  static paths = [['lint']];
  static usage = {
    description: 'Lint product',
  };
  async execute() {
    render(
      <Box>
        <Watch />
      </Box>
    );
  }
}
