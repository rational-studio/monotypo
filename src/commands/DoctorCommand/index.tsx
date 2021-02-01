import { Command } from 'clipanion';

export class DoctorCommand extends Command {
  static paths = [['doctor']];
  static usage = {
    category: 'Diagnostic',
    description: 'find out potential reasons why `m` does not work',
  };
  async execute() {}
}
