import {Client} from 'discord.js';
import {container} from 'tsyringe';
import {Connection, createConnection} from 'typeorm';
import GlobalSettingsManager from './database/managers/GlobalSettingsManager';
import GlobalSettingsWrapper from './database/wrappers/GlobalSettingsWrapper';

import MasterLogger from './logger/MasterLogger';
import ScopedLogger from './logger/ScopedLogger';
import CommandModule from './modules/command/CommandModule';
import Module from './modules/Module';

export default class Bot {
  public static readonly MODULES: ReadonlyArray<Constructor<Module>> = [CommandModule];

  private masterLogger!: MasterLogger;

  private globalLogger!: ScopedLogger;

  private connection!: Connection;

  private globalSettingsManager!: GlobalSettingsManager;

  private client!: Client;

  private modules!: Module[];

  public async initializeBot(): Promise<void> {
    this.masterLogger = new MasterLogger();
    container.register(MasterLogger, {useValue: this.masterLogger});

    this.globalLogger = new ScopedLogger('global');
    container.register(ScopedLogger, {useValue: this.globalLogger});

    this.connection = await createConnection();
    container.register(Connection, {useValue: this.connection});
    await this.connection.runMigrations({transaction: 'all'});

    this.globalSettingsManager = new GlobalSettingsManager();
    container.register(GlobalSettingsWrapper, {useValue: await this.globalSettingsManager.fetch()});

    this.client = new Client({
      disableMentions: 'everyone',
      partials: ['USER', 'CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION'],
    });
    container.register(Client, {useValue: this.client});

    this.modules = Bot.MODULES.map(constructor => container.resolve(constructor));
    Promise.all(this.modules.map(module => module.initialize?.()));
    Promise.all(this.modules.map(module => module.postInitialize?.()));

    // Discord.js client login here
  }
}
