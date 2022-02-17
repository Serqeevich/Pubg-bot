export const HelpMessageLfs = (channel: string) =>
  `
  procurar uma squad entra numa sala e escreve \`lfs\` no canal ${channel}, se tiveres solo não precisas estar numa sala. Podes adicionar uma nota ao pedido com \`lfs "nota"\`.  Se alguém reagir ao teu pedido ✉️ serás notificado por mensagem privada pelo bot 🤖. Se pretendes cancelar a procura escreve \`-\`.
`;

export const HelpMessageDefault = (rolesChannel: string, lfsChannel: string, availableRoles: string[]) => `

Neste canal ${rolesChannel} escreve \`/link PUBG_NICKNAME\` substituindo \`PUBG_NICKNAME\` pelo nome da tua conta de modo a receber os roles e stats no discord.
${HelpMessageLfs(lfsChannel)}
Испоьзуйте  \`!update\` в канале ${rolesChannel} для получения ролей на основании вашей игровой/* статистики.
Используйте \`/role "NOME_DA_ROLE"\` в канале ${rolesChannel} что бы добавить или удалить роль: ${availableRoles
  .map((r) => `\`"${r}"\``)
  .join(',')}
Используйте \`/help\` в нужном канале для получения подробной информации.
`;

export const HelpMessageAdmin = () => `
Как администратор, у вас есть доступ к некоторым дополнительным командам для использования в этом канале.

Используйте \`!reg PUBG_NICK DISCORD_ID\`, что бы привязать пользователя дискорд к учетной записи Pubg.

Используйте \`!unreg PUBG_NICK\`, что бы отвязать пользователя дискорд от учетной записи Pubg.

`;
