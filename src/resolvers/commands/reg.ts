import User from './../../models/user';
import { GuildMember, MessageEmbed } from 'discord.js';
import { CommandResolver } from '.';
import { EmbedError } from '../../embeds/Error';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { addStatsRoles, removeRoles } from '../../services/roles';


const updateMedia = [
  'https://cdn.discordapp.com/attachments/945683636680790076/945684032484704256/Alpha.png',
  'https://cdn.discordapp.com/attachments/945683636680790076/945684094992416838/Arrowhead.png',
  `https://cdn.discordapp.com/attachments/945683636680790076/945684108489682974/Baby.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684140039213106/Bandito.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684160272531516/Bobo.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684193197817896/Biohazard.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684225426853939/Bolt_Action.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684256347258930/Cast_Iron.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684288127504454/Cobra.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684338996027482/Dead_Mans_Hand.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684365915066398/Die_Happy.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684389394776124/Early_Bird.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684406989905980/Enforcer.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684426065580062/Flesh_Wound.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684441068609606/Fresh_Air.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684453185953802/Grizzly.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684460383395840/Hack_n_Slash.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684483506589736/Haymaker.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684500598378576/Hunter.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684510056517673/Lone_Survivor.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684520475164702/Last_Shot.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684565270360115/Masquerade.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684618697388082/Luchador.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684648007172126/Nuke_em.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684656009928734/One_Shot.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684673416282142/Pinchy.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684685332291644/PUBG_Logo.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684697235750932/Royale.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684718769278976/Snake_Eyes.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684725752799322/Spitfire.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684780127760435/Swordmaster.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684792370937866/The_Kraken.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684805566222386/Three_of_Swords.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684829297598494/Trident.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684843033948200/Voodoo.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684852697620500/Warrior.png`,
  `https://cdn.discordapp.com/attachments/945683636680790076/945684860272537700/Weird_Flex.png`,
];

const LinkResolver: CommandResolver = async (client, message, argumentsParsed) => {
  const isLfsChannel = message.channel.id === process.env.ROLES_CHANNEL_ID;
  const isAdminChannel = message.channel.id === process.env.ADMIN_CHANNEL_ID;
  if (!isLfsChannel && !isAdminChannel) return;

  await message.delete();

  const pubgNickname = argumentsParsed._[1] || '';
  const discordId = argumentsParsed._[2] || '';
  const isAdminCommand = isAdminChannel && discordId;
  const command = isAdminChannel ? `\`!reg Shroud discord_id\`` : `\`!reg Shroud\``;

 
  if (pubgNickname === '') {
    
    throw message.member?.send(
    new MessageEmbed()
      .setDescription(`Для привязки игрового аккаунта введите игровой никнейм.\nПример: ${command}`,)  // <@${message.author.id}> вырезал потому что идет в лс теперь
      );
    
  }


  if (isAdminChannel && discordId === '') {
    throw  new EmbedError(
      `<@${message.author.id}> Чтобы привязать  **${pubgNickname}** в а админ-канале вам необходимо указать ID , пример:  ${command}`,
    
    );
    
  }

  const feedbackMessage = await message.channel.send('Загружаем статистику...');

  const {
    newUser: { stats },
    oldUser,
  } = await User.linkPubgAccount({
    discordId: isAdminChannel ? discordId : message.author.id,
    pubgNickname,
    force: isAdminChannel,
  });

  await feedbackMessage.edit(
    '',
    EmbedSuccessMessage(
      isAdminCommand
        ? `Вы привязали [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) а аккаунту Discord <@${discordId}>`
        : `Вы привязали [${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) к аккаунту Discord!`,
    ),
  );

  if (message?.member) {
    // remove roles from user that had the nickname before forced change
    if (isAdminCommand && oldUser?.discordId) {
      const oldMember = await message.guild?.members.fetch(oldUser.discordId);
      if (oldMember) {
        await removeRoles(oldMember);
        await message.channel.send(`Роли <@${oldUser.discordId}> удалены.`);
      }
    }

    // const linkedDiscordId = isAdminCommand ? discordId : message.author.id;
    let member: GuildMember | undefined = message.member;
    if (isAdminCommand) {
      member = await message.guild?.members.fetch(discordId);
    }
    if (!member) throw new EmbedError('Пользователь не найден.');
    await addStatsRoles(member, stats);

    const thumbnailUpdateMedia = updateMedia[Math.floor(Math.random() * updateMedia.length)];

    await feedbackMessage.edit(
      '',
      new MessageEmbed()
        .setColor(`#00FF00`)
        .setTitle(`<a:OK:940200543119355926> Регистрация пройдена.`)
        .setDescription(`[${pubgNickname}](https://pubg.op.gg/user/${pubgNickname}) <a:arrow:945647104074854410> <@${message.author.id}>`,)
        .setThumbnail(thumbnailUpdateMedia)

        .addField(`**${stats?.bestRank ? stats?.bestRank : 'Unranked'} ${stats?.subTier ? stats?.subTier : ''}**`,`
        > <:Point:945665709399216148> **Point:** ${stats?.currentRankPoint ? stats?.currentRankPoint : '0'} <:Adr:934113837970505788> **ADR:** ${stats?.avgDamage ? stats.avgDamage : '0'} <:KD:934114143500369920> **KD:** ${stats?.kd ? stats?.kd : '0'}`,)

        .addField(`**TPP Squad**`,`\n
        > <:Adr:934113837970505788> **ADR:** ${stats?.adrTPP ? stats?.adrTPP : '0'}
        > <:KD:934114143500369920> **KD:** ${stats?.kdTPP ? stats?.kdTPP : '0'}`,true,)

        .addField(`**FPP Squad**`,`\n
        > <:Adr:934113837970505788> **ADR:** ${stats?.adrFPP ? stats?.adrFPP : '0'}
        > <:KD:934114143500369920> **KD:** ${stats?.kdFPP ? stats?.kdFPP : '0'}`,true,)

        .setTimestamp()
        .setFooter('Команда !reg и ваш игровой ник.',`https://cdn.discordapp.com/attachments/939806800679690260/945611614244208650/GOTOP.png`,),
    );
  }
};

export default LinkResolver;

// ${stats?.subTier ? stats?.subTier : ''}
