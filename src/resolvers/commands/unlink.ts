import User from './../../models/user';
import { removeRoles } from '../../services/roles';
import { EmbedError } from '../../embeds/Error';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';

const UnlinkResolver: CommandResolver = async (client, message, argumentsParsed) => {
  const isAdminChannel = message.channel.id === process.env.ADMIN_CHANNEL_ID;
  if (!isAdminChannel) return;

  const pubgNickname = argumentsParsed._[1] || '';
  const command = `\`!unreg PUBG_NICK\``;

  if (pubgNickname === '') {
    throw new EmbedError(
      `<@${message.author.id}> что бы отвязать аккаунт введите игровой никнейм, пример:  ${command}`,
    );
  }

  const feedbackMessage = await message.channel.send('Отвязка аккаунта');
  const { discordId } = await User.deleteByPubgAccount(pubgNickname);

  const member = await message.guild?.members.fetch(discordId);
  if (member) {
    await removeRoles(member);
    //await message.channel.send(`<@${discordId}> ваши роли удалены.`);
  }

  await feedbackMessage.edit(
    EmbedSuccessMessage(
      `Игровая учетная запись [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) отвязана от аккаунта Discord <@${discordId}>`,
    ),
  );
};

export default UnlinkResolver;
