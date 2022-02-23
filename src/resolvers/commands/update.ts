import User from './../../models/user';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { addStatsRoles } from '../../services/roles';
import { MessageEmbed } from 'discord.js';

const updateMedia = [
  'https://cdn.discordapp.com/attachments/945660621058359336/945660728084402210/MedalAnnihilation.png',
  'https://cdn.discordapp.com/attachments/945660621058359336/945660728319311892/MedalAssassin.png',
  `https://cdn.discordapp.com/attachments/945660621058359336/945660728495468553/MedalDeadeye.png`,
  `https://cdn.discordapp.com/attachments/945660621058359336/945660728696782898/MedalDoubleKill.png`,
  `https://cdn.discordapp.com/attachments/945660621058359336/945660728893911050/MedalFirstBlood.png`,
  `https://cdn.discordapp.com/attachments/945660621058359336/945660729170743306/MedalFrenzy.png`,
  `https://cdn.discordapp.com/attachments/945660621058359336/945660729351106611/MedalLastManStanding.png`,
  `https://cdn.discordapp.com/attachments/945660621058359336/945660729644703796/MedalLongshot.png`,
  `https://cdn.discordapp.com/attachments/945660621058359336/945660729875369984/MedalPunisher.png`,
];

const UpdateResolver: CommandResolver = async (client, message) => {
  if (message.channel.id !== process.env.ROLES_CHANNEL_ID) return;
  await message.delete();

  const feedbackMessage = await message.channel.send(`Обновляем статистику...`);

  const updatedUser = await User.updatePubgStats({
    discordId: message.author.id,
  });

  await feedbackMessage.edit(
    '',
    EmbedSuccessMessage(`Обновляем роли <@${message.author.id}>`),
  );

  if (message?.member) {
    await addStatsRoles(message.member, updatedUser.stats);

    const thumbnailUpdateMedia = updateMedia[Math.floor(Math.random() * updateMedia.length)];

    await feedbackMessage.edit(
      '',
      new MessageEmbed()
        .setColor(`#00FFFF`)
        .setTitle(`<a:OK:940200543119355926> Статистика обновлена.`)
        .setDescription(
          `[${updatedUser.pubgNickname}](https://pubg.op.gg/user/${updatedUser.pubgNickname}) <a:arrow:945647104074854410> <@${message.author.id}>`,
        )
        .setThumbnail(thumbnailUpdateMedia)
        .addField(
          `${updatedUser.stats?.bestRank ? updatedUser.stats?.bestRank : 'Unranked'} ${
            updatedUser.stats?.subTier ? updatedUser.stats?.subTier : ''
          }`,
          `> <:Point:945665709399216148> Point: ${
            updatedUser.stats?.currentRankPoint ? updatedUser.stats?.currentRankPoint : '0'
          } <:Adr:934113837970505788> ADR: ${
            updatedUser.stats?.avgDamage ? updatedUser.stats?.avgDamage : '0'
          } <:KD:942655934856048641> KD: ${updatedUser.stats?.kd ? updatedUser.stats?.kd : '0'}`,
        )
        .addField(
          '** TPP Squad **',
          `\n> <:Adr:934113837970505788> ADR: ${
            updatedUser.stats?.adrTPP ? updatedUser.stats?.adrTPP : '0'
          }\n> <:KD:934114143500369920> KD: ${updatedUser.stats?.kdTPP ? updatedUser.stats?.kdTPP : '0'}`,
          true,
        )
        .addField(
          '** FPP Squad **',
          `\n> <:Adr:934113837970505788> ADR: ${
            updatedUser.stats?.adrFPP ? updatedUser.stats?.adrFPP : '0'
          }\n> <:KD:934114143500369920> KD: ${updatedUser.stats?.kdFPP ? updatedUser.stats?.kdFPP : '0'}`,
          true,
        )
        .setTimestamp()
        .setFooter(
          'Введите команду !update для обновления статистики.',
          `https://cdn.discordapp.com/attachments/939806800679690260/945611614244208650/GOTOP.png`,
        ),
    );
  }
};

export default UpdateResolver;
