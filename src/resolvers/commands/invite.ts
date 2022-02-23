import { computeChannelUsers } from '../../utils/helpers';
import { CommandResolver, NOTE_LIMIT_CHARS } from '.';
import { deleteAllLfsAuthorEmbeds, parseMessageRelatedToChannel } from '../../utils/embeds';
import { EmbedError } from '../../embeds/Error';
import User from '../../models/user';
import { Author, LfsMessage } from '../../models/LfsMessage';
import { VoiceChannel } from 'discord.js';

const inProgressMedia = [
  'https://media2.giphy.com/media/l3mZfUQOvmrjTTkiY/giphy.gif',
  'https://media.giphy.com/media/3oKIPmaM8aFolCcuI0/giphy.gif',
  'https://media1.giphy.com/media/3ohs7YomxqOz4GRHcQ/giphy.gif',
  'https://media1.giphy.com/media/3ohzdOE33hBQ7duPfi/giphy.gif',
  'https://media.giphy.com/media/qlCFjkSruesco/giphy.gif',
  'https://media.giphy.com/media/3oKIP5KxPss1gjwpG0/giphy.gif',
];

const missingPlayersMedia: { [key: number]: string } = {
  1: 'https://i.imgur.com/TvqWGPH.png',
  2: 'https://i.imgur.com/S8jNcjs.png',
  3: 'https://i.imgur.com/cx62O1M.png',
};

const LfsResolver: CommandResolver = async (client, message, argumentsParsed) => {
  if (message.channel.id !== process.env.LFS_CHANNEL_ID) return;

  await message.delete();
  const authorVoiceChannel = message.member?.voice.channel;
  // const isNoteValid = QUOTE_REGEX.test(argumentsParsed._[1]);
  const str = argumentsParsed._;
  str.shift();
  const note = str.join(' ') ?? '';

  if (note.length - 1 > NOTE_LIMIT_CHARS) {
    throw new EmbedError(
      `<@${message.author.id}> вы можете написать не более 120 символов в команде \`!invite "и ваш коментарий"\`.`,
    );
  }

  // delete previous lfs embeds
  const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
  if (textChannel.isText()) {
    const messages = await textChannel.messages.fetch();
    await deleteAllLfsAuthorEmbeds(message.author.id, messages);

    // should only create lfs if theres not one already related to the channel
    if (authorVoiceChannel?.id) {
      const updatedMessages = await textChannel.messages.fetch();
      const messagesArr = updatedMessages.map((m) => m);
      const embedOfChannel = parseMessageRelatedToChannel(messagesArr, authorVoiceChannel?.id);
      if (
        embedOfChannel?.embedParsed?.channel?.id &&
        embedOfChannel?.embedParsed?.channel?.id === authorVoiceChannel?.id
      )
        return;
    }

    // should only create lfs if less than 4 players in channel
    if (authorVoiceChannel && authorVoiceChannel?.members?.size >= authorVoiceChannel?.userLimit) {
      await message.member?.send('Ваш канал уже заполнен');
      return;
    }
  }

  if (authorVoiceChannel && authorVoiceChannel.members.size > 0) {
    const authorVoiceChannelUsersDiscordIds = authorVoiceChannel?.members.map((member) => member.user.id);
    const channelUsersDocuments = await User.find({ discordId: { $in: authorVoiceChannelUsersDiscordIds } });
    const userLimit = authorVoiceChannel.userLimit;

    //TODO много лишнего
    const users = computeChannelUsers(authorVoiceChannel?.members, channelUsersDocuments, message.author.id);

    const missingPlayersContent = users && users.length && ` +${userLimit - users.length} `;

    const footer = users?.length === userLimit ? 'Канал заполнен ⛔' : `В поиске ${missingPlayersContent} игроков`;

    const invite = authorVoiceChannel.full ? { url: '' } : await authorVoiceChannel?.createInvite();

    const missingPlayers = users ? userLimit - users.length : 0;
    const channel = {
      id: authorVoiceChannel.id,
      name: authorVoiceChannel.name,
    };

    await message.channel.send(
      LfsMessage({ author: message.author, channel, inviteUrl: invite.url, note, footer, missingPlayers, users }),
    );
  }
  //TODO:неголосовой канал
  // else {
  // const authorDocument = await User.findOne({ discordId: message.author.id });
  // const users = [computeUserPartialFromDocument(message.author.id, authorDocument)];
  // const embed = await message.channel.send(
  //   EmbedLookingForSomeone({
  //     author: {
  //       id: message.author.id,
  //       avatar: message.author.avatar,
  //     },
  //     users,
  //     note: isNoteValid ? note : '',
  //   }),
  // );
  // await embed.react('👍');
  // }
};

export default LfsResolver;
