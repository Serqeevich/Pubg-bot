import User from './../../models/user';
import { CommandResolver } from '.';
import { EmbedSuccessMessage } from '../../embeds/Success';
import { MessageEmbed } from 'discord.js';
import { stat, Stats } from 'fs';

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

const StatResolver: CommandResolver = async (client, message) => {
    //if (message.channel.id !== process.env.ROLES_CHANNEL_ID) return;
    await message.delete();
  
    const feedbackMessage = await message.channel.send(`Поиск...`);

    const updatedUser = await User.updatePubgStats({
      discordId: message.author.id,
    });
  
  await feedbackMessage.edit(
      '',
      EmbedSuccessMessage(`Собираем статистику <@${message.author.id}>`),
    );

    const thumbnailUpdateMedia = updateMedia[Math.floor(Math.random() * updateMedia.length)];

    console.log(updatedUser)
  
      await feedbackMessage.edit(
        '',
        new MessageEmbed()
          .setColor(`#FFFF00`)
          .setTitle(`<a:down:946415717056667698> Статистика игрока`)
          .setDescription(`<:pubg:911168463735758858> [${updatedUser.pubgNickname}](https://pubg.op.gg/user/${updatedUser.pubgNickname})\n <:i_:945642741247901717> <@${message.author.id}>`,)
          .setThumbnail(thumbnailUpdateMedia)

          //ranked stats
          .addField(`${updatedUser.stats?.bestRank ? updatedUser.stats?.bestRank : 'Unranked'} ${updatedUser.stats?.subTier ? updatedUser.stats?.subTier : ''} ${updatedUser.stats?.currentRankPoint ? updatedUser.stats?.currentRankPoint : ''}`,`\n 
          > **Games:** ${updatedUser.stats?.gamesRank ? updatedUser.stats?.gamesRank : '0'}
          > **Wins:** ${updatedUser.stats?.wins ? updatedUser.stats?.wins : '0'}
          > **Kills:** ${updatedUser.stats?.kills ? updatedUser.stats?.kills : '0'}
          > **ADR:** ${updatedUser.stats?.avgDamage ? updatedUser.stats?.avgDamage : '0'} 
          > **KD:** ${updatedUser.stats?.kd ? updatedUser.stats?.kd : '0'}

          `, true,)
          //TPP stats
          .addField('** TPP Squad **',`\n
          > **Games:** ${updatedUser.stats?.gamesTPP ? updatedUser.stats?.gamesTPP : '0'}
          > **Wins:** ${updatedUser.stats?.winsTPP ? updatedUser.stats?.winsTPP : '0'}
          > **Kills:** ${updatedUser.stats?.killsTPP ? updatedUser.stats?.killsTPP : '0'}
          > **ADR:** ${updatedUser.stats?.adrTPP ? updatedUser.stats?.adrTPP : '0'}
          > **KD:** ${updatedUser.stats?.kdTPP ? updatedUser.stats?.kdTPP : '0'}
          
          `,true,)

          //FPP stats
          .addField('** FPP Squad **',`\n
          > **Games:** ${updatedUser.stats?.gamesFPP ? updatedUser.stats?.gamesFPP : '0'}
          > **Wins:** ${updatedUser.stats?.winsFPP ? updatedUser.stats?.winsFPP : '0'}
          > **Kills:** ${updatedUser.stats?.killsFPP ? updatedUser.stats?.killsFPP : '0'}
          > **ADR:** ${updatedUser.stats?.adrFPP ? updatedUser.stats?.adrFPP : '0'}
          > **KD:** ${updatedUser.stats?.kdFPP ? updatedUser.stats?.kdFPP : '0'}
         
          `,true,)
          .setTimestamp()
          .setFooter(
            'Команда !stat',
            `https://cdn.discordapp.com/attachments/939806800679690260/945611614244208650/GOTOP.png`,
          ),
      );
    }
 

  export default StatResolver;