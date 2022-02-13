import User from './../../models/user';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { addStatsRoles } from '../../services/roles';

const UpdateResolver: CommandResolver = async (client, message) => {
  if (message.channel.id !== process.env.ROLES_CHANNEL_ID) return;

  const feedbackMessage = await message.channel.send('A atualizar...');

  const updatedUser = await User.updatePubgStats({
    discordId: message.author.id,
  });

  await feedbackMessage.edit(
    EmbedSuccessMessage(
      `Conta atualizada [${updatedUser.pubgNickname}](https://pubg.op.gg/user/${updatedUser.pubgNickname}).`,
    ),
  );

  if (
    typeof updatedUser?.stats?.bestRank === 'string' &&
    typeof updatedUser?.stats?.avgDamage === 'number' &&
    typeof updatedUser?.stats?.kd === 'number' &&
    message?.member
  ) {
    await addStatsRoles(message.member, updatedUser.stats);
    await feedbackMessage.edit(
      `<@${message.author.id}>,\n
       **Режим**: Ранговый, **Звание**: ${updatedUser.stats.bestRank} ${updatedUser.stats.currentRankPoint} , **ADR**: ${updatedUser.stats.avgDamage}, **K/D**: ${updatedUser.stats.kd}\n
      **Режим**: Squad TPP, **ADR**: ${updatedUser.stats.adrTPP}, **K/D**: ${updatedUser.stats.kdTPP}\n
      **Режим**: Squad FPP, **ADR**: ${updatedUser.stats.adrFPP}, **K/D**: ${updatedUser.stats.kdFPP}`,
    );
  }
};

export default UpdateResolver;
