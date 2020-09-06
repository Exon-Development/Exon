import { Collection } from 'discord.js';

import AbstractCommand from './AbstractCommand';

export default class CommandCollection extends Collection<string, AbstractCommand> {
  constructor(commands?: AbstractCommand[]) {
    super();
    commands?.forEach((command) => this.addCommand(command));
  }

  addCommand(command: AbstractCommand) {
    this.set(command.name, command);
    command.aliases?.forEach((alias) => this.set(alias, command));
  }
}