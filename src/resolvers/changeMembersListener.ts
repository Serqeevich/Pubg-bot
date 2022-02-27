import { Client, VoiceChannel, VoiceState } from 'discord.js';
import User from '../models/user';
import { parseMessageRelatedToChannel } from './../utils/embeds';
import { LfsMessage } from '../models/LfsMessage';
import * as console from 'console';

const parentChannels = [
  '907629410008584232', //squad tpp
  '907629461321703434', //squad fpp
  '907685149616009236', //ranked
  '907630769906778163', //duo
  '931954839527780392', //squad tpp 18+
  '931954932024758282', //squad fpp 18+
  '931954994796691516', //duo 18+
  '919195736275554345', //other
];

export const voiceResolver = async (client: Client, oldState: VoiceState, newState: VoiceState) => {
  if (!process.env.LFS_CHANNEL_ID) return;

  const prevVoiceChannel = oldState.channel?.id;
  const newVoiceChannel = newState.channel?.id;

  const isParent = newVoiceChannel && parentChannels.indexOf(newVoiceChannel) > -1;

  const hasJoined = Boolean(newVoiceChannel);
  const hasSwitched = Boolean(hasJoined && prevVoiceChannel && prevVoiceChannel !== newVoiceChannel);
  const userId = newState.id;

  const textChannel = await client.channels.fetch(process.env.LFS_CHANNEL_ID);
  if (!textChannel.isText()) return;

  const messages = await textChannel.messages.fetch();
  const messagesArr = messages.map((m) => m);

  let channel;
  console.log('newVoiceChannel', newVoiceChannel);
  console.log('prevVoiceChannel', prevVoiceChannel);

  const newMessageParsed = parseMessageRelatedToChannel(messagesArr, newVoiceChannel);

  // add user to embed
  if (!isParent && hasJoined) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    channel = await client.channels.fetch(newVoiceChannel);
    const userLimit = (channel as VoiceChannel).userLimit;

    if (newMessageParsed?.message && newMessageParsed?.embedParsed && newMessageParsed?.embedParsed.users) {
      const invite = (channel as VoiceChannel).full ? { url: '' } : await (channel as VoiceChannel)?.createInvite();
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

      const missingPlayersContent = userLimit
        ? usersNew && usersNew.length && ` +${userLimit - usersNew.length}`
        : '⛔';

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

    // only proceed to deleting the user from another embed if he switched channels
    if (!hasSwitched) {
      return;
    }
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

  // remove from embed
  if (embedParsed.users && embedParsed.users.length > 1 && embedParsed.author && embedParsed.author.id !== null) {
    channel = await client.channels.fetch(prevVoiceChannel!);
    const invite = (channel as VoiceChannel).full ? { url: '' } : await (channel as VoiceChannel)?.createInvite();
    const userLimit = (channel as VoiceChannel).userLimit;

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
};
