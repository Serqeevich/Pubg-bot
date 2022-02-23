import { Client, VoiceChannel, VoiceState } from 'discord.js';
import User from '../models/user';
import { parseMessageRelatedToChannel } from './../utils/embeds';
import { LfsMessage } from '../models/LfsMessage';
import * as console from 'console';

export const voiceResolver = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (!process.env.LFS_CHANNEL_ID) return;

  const prevVoiceChannel = oldState.channel?.id;
  const newVoiceChannel = newState.channel?.id;
  const hasJoined = true;
  const hasSwitched = Boolean(hasJoined && prevVoiceChannel && prevVoiceChannel !== newVoiceChannel);
  const userId = newState.id;

  const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
  if (!textChannel.isText()) return;

  const messages = await textChannel.messages.fetch();
  const messagesArr = messages.map((m) => m);

  let channel;

  //only proceed to deleting the user from another embed if he switched channels
  if (!hasSwitched && newVoiceChannel) {
    channel = await client.channels.fetch(newVoiceChannel!);
  } else {
    channel = await client.channels.fetch(prevVoiceChannel!);
  }

  const invite = (channel as VoiceChannel).full ? { url: '' } : await (channel as VoiceChannel)?.createInvite();
  const userLimit = (channel as VoiceChannel).userLimit;

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

      const missingPlayersContent = usersNew && usersNew.length && ` +${userLimit - usersNew.length} `;

      const footer = usersNew?.length === userLimit ? 'Канал заполнен ⛔' : `В поиске ${missingPlayersContent} игроков`;
      const missingPlayers = usersNew ? userLimit - usersNew?.length : 0;

      await message.edit(
        '',
        LfsMessage({
          ...newMessageParsed.embedParsed,
          footer,
          missingPlayers,
          inviteUrl: invite.url,
          users: usersNew,
        }),
      );
    }

    // Remove user from channel embed
    const prevMessageParsed = parseMessageRelatedToChannel(messagesArr, prevVoiceChannel);
    if (!prevMessageParsed?.message || !prevMessageParsed?.embedParsed || !prevMessageParsed?.embedParsed.users) return;
    const { message, embedParsed } = prevMessageParsed;

    // delete embed if only person on embed left or author left
    if (prevMessageParsed.embedParsed.users.length === 1 || embedParsed.author?.id === userId) {
      await message.delete();
      return;
    }
    console.log('embedParsed');
    console.log(embedParsed);
    // remove from embed
    if (embedParsed.users && embedParsed.users.length > 1 && embedParsed.author && embedParsed.author.id !== null) {
      const newUsers = embedParsed.users.filter((u: any) => u.discordId !== userId);
      console.log('newUsers');
      console.log(newUsers);
      const missingPlayersContent = newUsers && newUsers.length && ` +${userLimit - newUsers.length} `;

      const footer = newUsers?.length === userLimit ? 'Канал заполнен ⛔' : `В поиске ${missingPlayersContent} игроков`;
      const missingPlayers = newUsers ? userLimit - newUsers?.length : 0;

      await message.edit(
        '',
        LfsMessage({
          ...embedParsed,
          footer,
          missingPlayers,
          inviteUrl: invite.url,
          users: newUsers,
        }),
      );
    }
  }
};
