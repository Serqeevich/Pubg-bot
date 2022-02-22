import { clearQuotes, computeChannelUsers } from './../../utils/helpers';
import { CommandResolver, NOTE_LIMIT_CHARS, QUOTE_REGEX } from '.';
import { deleteAllLfsAuthorEmbeds, parseMessageRelatedToChannel } from '../../utils/embeds';
import { EmbedError } from '../../embeds/Error';
import User from './../../models/user';
import { MessageEmbed, VoiceChannel } from 'discord.js';
import { Author } from '../changeMembersListener';

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
  const note = clearQuotes(argumentsParsed._[1]) ?? '';

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
      if (embedOfChannel?.embedParsed?.channelId && embedOfChannel?.embedParsed?.channelId === authorVoiceChannel?.id)
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

    const computeAuthorAvatar = (channel: VoiceChannel, author?: Author) => {
      if (author && author.id) {
        return `https://cdn.discordapp.com/avatars/${author.id}/${author.avatar}.png?size=128&channelId=${
          channel.id
        }&channelName=${encodeURIComponent(channel.name ?? '')}`;
      }
    };

    const usersList = users?.map((user) => {
      // if (user.pubgNickname === '' || user.stat  s === undefined) return `\n<@${user.discordId}>${NOT_FOUND_MESSAGE}`;
      return `\n<@${user.discordId}>`;
    });

    const missingPlayersContent = users && users.length && ` +${userLimit - users.length} `;

    const footerComputed =
      users?.length === userLimit ? 'Канал заполнен ⛔' : `В поиске ${missingPlayersContent} игроков`;

    const invite = authorVoiceChannel.full ? { url: '' } : await authorVoiceChannel?.createInvite();

    const missingPlayers = users ? userLimit - users.length : 0;

    const thumbnail =
      missingPlayers > 0
        ? missingPlayersMedia[missingPlayers]
        : inProgressMedia[Math.floor(Math.random() * inProgressMedia.length)];
        
    await message.channel.send(
      new MessageEmbed()
        .setColor(users?.length === 4 ? '#2FCC71' : '#0099ff') //цвет сообщения
        .setDescription(
          `
          ${usersList?.join('')}

          **Подключиться:** ${invite?.url}

          ${note ? `> ${note}` : ''}
        `,
        )
        .setFooter(footerComputed)
        .setTimestamp()
        .setThumbnail(thumbnail)
        .setAuthor(
          authorVoiceChannel.name,
          computeAuthorAvatar(authorVoiceChannel, {
            id: message.author.id,
            avatar: message.author.avatar,
          }),
        ),
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
