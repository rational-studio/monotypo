#!/usr/bin/env node
import { Cli, Builtins } from 'clipanion';
import { BuildCommand } from './commands/BuildCommand';
import { CreateCommand } from './commands/CreateCommand';
import { DevCommand } from './commands/DevCommand';
import { DoctorCommand } from './commands/DoctorCommand';
import { InitCommand } from './commands/InitCommand';
import { LintCommand } from './commands/LintCommand';
import { TestCommand } from './commands/TestCommand';
import * as packageJson from '../package.json';

const [, , ...args] = process.argv;

const cli = new Cli({
  binaryLabel: 'Monotypo',
  binaryName: 'm',
  binaryVersion: packageJson.version,
});

cli.register(Builtins.DefinitionsCommand);
cli.register(Builtins.HelpCommand);
cli.register(Builtins.VersionCommand);
cli.register(BuildCommand);
cli.register(CreateCommand);
cli.register(DevCommand);
cli.register(DoctorCommand);
cli.register(InitCommand);
cli.register(LintCommand);
cli.register(TestCommand);
cli.runExit(args, Cli.defaultContext);
