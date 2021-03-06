import {MessageEmbed, TextBasedChannel} from 'discord.js';
import {container} from 'tsyringe';
import GlobalSettingsWrapper, {ColorType} from '../../../database/wrappers/GlobalSettingsWrapper';
import ResponseError from './ResponseError';

export default class DetailedErrorResponseError extends ResponseError {
  readonly publicTitle: string;

  readonly publicDetail: string;

  constructor(
    channel: TextBasedChannel,
    publicTitle: string,
    publicDetail: string,
    messageOrRealError:
      | Error
      | string
      | undefined = `DetailedErrorResponseError with title "${publicTitle}" and detail "${publicDetail}".`,
    globalSettings = container.resolve(GlobalSettingsWrapper)
  ) {
    const embed = new MessageEmbed()
      .setColor(globalSettings.getColor(ColorType.Bad))
      .setTitle(`❌ ${publicTitle}`)
      .setDescription(publicDetail);
    super(channel, undefined, embed, messageOrRealError);
    this.publicTitle = publicTitle;
    this.publicDetail = publicDetail;
  }
}
