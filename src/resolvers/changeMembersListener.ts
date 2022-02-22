import { Client, MessageEmbed, VoiceState } from 'discord.js';
import User from '../models/user';
import { parseMessageRelatedToChannel } from './../utils/embeds';

export type Author = {
  id: string;
  avatar: string | null;
};

export type LfsEmbedProps = {
  author: Author;
  note?: string;
  channelId: string | null;
  users: LfsUsers;
};

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

export type LfsUsers =
  | {
      discordId: string | null;
    }[]
  | undefined;

export const voiceResolver = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (!process.env.LFS_CHANNEL_ID) return;

  const prevVoiceChannel = oldState.channel?.id;
  const newVoiceChannel = newState.channel?.id;
  const hasJoined = Boolean(newVoiceChannel);
  const hasSwitched = Boolean(hasJoined && prevVoiceChannel && prevVoiceChannel !== newVoiceChannel);
  const userId = newState.id;

  const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
  if (!textChannel.isText()) return;

  const messages = await textChannel.messages.fetch();
  const messagesArr = messages.map((m) => m);

  if (hasJoined) {
    // add user to embed
    const newMessageParsed = parseMessageRelatedToChannel(messagesArr, newVoiceChannel);
    if (newMessageParsed?.message && newMessageParsed?.embedParsed && newMessageParsed?.embedParsed.users) {
      const alreadyInEmbed = newMessageParsed.embedParsed.users.find((u: any) => u.discordId === userId);
      if (alreadyInEmbed) return;

      const { message } = newMessageParsed;
      const userDb = await User.findOne({ discordId: userId });
      const userNew = {
        // pubgNickname: userDb?.pubgNickname ?? '',
        discordId: userDb?.discordId ?? userId,
        // stats: {
        //   kd: userDb?.stats?.kd ?? undefined,
        //   avgDamage: userDb?.stats?.avgDamage ?? undefined,
        //   bestRank: userDb?.stats?.bestRank ?? undefined,
        // },
      };

      const usersNew = userNew?.discordId
        ? [...newMessageParsed.embedParsed.users, userNew]
        : newMessageParsed.embedParsed.users;

      const missingPlayersContent = usersNew && usersNew.length && ` +${4 - usersNew.length} `;

      const footerComputed = usersNew?.length === 4 ? 'Канал заполнен ⛔' : `В поиске ${missingPlayersContent}игроков`;

      const missingPlayers = usersNew ? 4 - usersNew.length : 0;

      const thumbnail =
        missingPlayers > 0
          ? missingPlayersMedia[missingPlayers]
          : inProgressMedia[Math.floor(Math.random() * inProgressMedia.length)];
      const newDescription = `${usersNew.map((u) => `\n<@${u.discordId}>`)?.join('')}`;

      const link = newMessageParsed.embed.description?.split('**Подключиться:**')[1];

      console.log(link);

      const newEmbed = new MessageEmbed(newMessageParsed.embed)
        .setDescription(
          `
        ${newDescription} 
        
        Подключиться ${link}      
        
        `,
        )
        .setThumbnail(thumbnail)
        .setFooter(footerComputed);

      await message.edit('', newEmbed);
    }

    //only proceed to deleting the user from another embed if he switched channels
    if (!hasSwitched) {
      return;
    }

    // Remove user from channel embed
    const prevMessageParsed = parseMessageRelatedToChannel(messagesArr, prevVoiceChannel);
    if (!prevMessageParsed?.message || !prevMessageParsed?.embedParsed || !prevMessageParsed?.embedParsed.users) return;
    const { message, embedParsed } = prevMessageParsed;

    // delete embed if only person on embed left or author left
    if (prevMessageParsed.embedParsed.users.length === 1 || embedParsed.author.id === userId) {
      await message.delete();
      return;
    }

    // remove from embed
    // if (embedParsed.users && embedParsed.users.length > 1 && embedParsed.author && embedParsed.author.id !== null) {
    //   const newUsers = embedParsed.users.filter((u) => u.discordId !== userId);
    //   await message.edit('', newEmbed);
    // }
  }
};
