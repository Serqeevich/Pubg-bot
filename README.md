# Pubg-bot

## Команды

| Команды      | Описание                                                      |
| :----------- | :--------------------------------------------------------------- |
| `yarn start:dev` | Create an optimized bundle and serve with the dev server. |
| `yarn start` | Create an optimized bundle and serve with the production server. |

## Bot

Этот бот разработан для дискорд сообщества Pubg GO TOP.

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
Если кто-то пишет запрещеные слова бот ему отвечает.

### 1. Регистрация

`!reg PUBG_NICK`

This command will fetch the users stats directly from the PUBG API there's a minimum of 20 games required in order to provide the roles.

`!reg PUBG_NAME DISCORD_ID`

Admin command, same as previous but assigns the stats of the PUBG_NAME to the user of the DISCORD_ID. Used to avoid false linking.

**Роли**
| Название | Описание |
|:-----------------|:-------------|
| `Bronze`, `Silver`, `Gold`, `Platinum`, `Diamond`, `Master` | Ранговые роли. |
| `R.ADR 100+`,`R.ADR 200+`,`R.ADR 300+`,`R.ADR 400+`,`R.ADR 500+`,|Ранговые роли ADR. |
| `R.KD 1+`, `R.KD 2+`, `R.KD 3+`, `R.KD 4+`, , `R.KD 5+`,  |Ранговые роли KD. |
| `TPP ADR 100+`,`TPP ADR 200+`,`TPP ADR 300+`,`TPP ADR 400+`,`TPP ADR 500+`,|TPP роли ADR. |
| `TPP KD 1+`, `TPP KD 2+`, `TPP KD 3+`, `TPP KD 4+`, , `TPP KD 5+`,  |TPP роли KD. |
| `FPP ADR 100+`,`FPP ADR 200+`,`FPP ADR 300+`,`FPP ADR 400+`,`FPP ADR 500+`,|FPP роли ADR. |
| `FPP KD 1+`, `FPP KD 2+`, `FPP KD 3+`, `FPP KD 4+`, , `FPP KD 5+`,  |FPP роли KD. |

### 2. Поиск игроков

`!invite`

By typing `!invite` on the `!i` channel the bot will create a LFS Embed, if someone reacts with a `✉️` it will send a PM to the author of the `lfs` with the request, the author can accept or decline the request and the interested party will be notified with a PM.
