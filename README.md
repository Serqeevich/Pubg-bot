# Pubg-bot

### Как установить?

Don't be a crybaby: clone, install and run the commands

## Команды

| Command      | Description                                                      |
| :----------- | :--------------------------------------------------------------- |
| `yarn start:dev` | Create an optimized bundle and serve with the dev server. |
| `yarn start` | Create an optimized bundle and serve with the production server. |

## Bot

Этот бот разрабатывается для дискорд сообщества Pubg GO TOP.

### Server installation

Добавить бота на сервер: `https://discord.com/oauth2/authorize?client_id=BOT_CLIENT_ID&scope=bot`

### Доступные команды

| Команда                          | Канал            | Описание                                                                                                                                                         |
|----------------------------------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `!invite` or `!invite "note"`            | `Поиск`   | Creates a LFS embed with a possible note                                                                                                                                                |
| `-`                              | `Поиск`   | Deletes the last LFS embed of the author                                                                                                                            |
| `!reg PUBG_NICK`            | `Регистрация` | Assigns a pubg nickname to the author and roles according to stats                                                                                                  |
| `/role "ROLE_NICK"`            | `Регистрация` | Assigns a free agent role to user                                                                                                  |
| `!update`                        | `Регистрация` | Updates user pubg stats for users already linked                                                                                                                    |
| `/link PUBG_NIC DISCORD_ID` | `Админ канал` | Assigns a pubg nickname to the user of the discord id and roles according to stats, if someone is linked to that pubg account he will be unlinked and roles removed |
| `/unlink PUBG_NICK`          | `Админ канал` | If someone is linked to that pubg account he will be unlinked and roles removed   

| `/order`                          | any      | Sends a "ORDER" gif                     |

### Triggers
If someone uses lousy words the bot will reply with a notice.

### Usage

The first thing a user must do is link their discord account to a pubg account by linking them, this will assign him roles according to stats and rank, once that's done he can join the rooms according to stats. He can also use the LFS channel with a more detailed embed.

### 1. Регистрация

`!reg PUBG_NICK`

This command will fetch the users stats directly from the PUBG API there's a minimum of 20 games required in order to provide the roles.

`!reg PUBG_NAME DISCORD_ID`

Admin command, same as previous but assigns the stats of the PUBG_NAME to the user of the DISCORD_ID. Used to avoid false linking.

**Роли**
| Role(s) | Description |
|:-----------------|:-------------|
| `Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`, `Master` | Ранговые роли. |
| `KD 0.5`, `KD 1`, `KD 1.5`, `KD 2`, `KD 2.5`, `KD 3`, `KD 3.5`, `KD 4`, `KD 4.5`, `KD 5`, `KD +6` | Роли KD. |
| `100 ADR`, `150 ADR`, `200 ADR`, `250 ADR`, `300 ADR`, `350 ADR`, `400 ADR`, `450 ADR`, `500 ADR`, `+550 ADR` | Роли ADR. |

### 2. Поиск игроков

`!invite`

By typing `lfs` on the `looking-for-someone` channel the bot will create a LFS Embed, if someone reacts with a `✉️` it will send a PM to the author of the `lfs` with the request, the author can accept or decline the request and the interested party will be notified with a PM.

### 3. Помощь

`/help`

Typing `help` on any channel the bot will delete the message sent by the user, create an Embed with a guide to all the bot commands and send it via PM.
