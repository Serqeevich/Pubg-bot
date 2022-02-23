import { Collection, Message, MessageEmbed, Snowflake, VoiceChannel } from 'discord.js';
import {
  parseAllMentionsIds,
  parseChannelFromLfsEmbed,
  parseDiscordAvatarIdFromUrl,
  parsePubgNickFromQueryString,
  parseUserIdFromMention,
  parseUserIdFromQueryString,
} from './helpers';
import { StatsPartial, Tier } from './../services/pubg';
import { Author, LfsEmbedProps } from '../models/LfsMessage';

const BLOQUOTE = /\> (.*$)/im;

export const parseAuthorIdFromLfsEmbed = (embed: MessageEmbed) => {
  if (embed && embed.author && embed.author.iconURL) {
    const avatarUrl = new URL(embed.author.iconURL);
    const authorId = avatarUrl.pathname.split('/')[2];
    if (authorId) return authorId;
  }

  if (embed && embed.description) {
    // last mention will be the author
    const allMentions = parseAllMentionsIds(embed.description);
    return allMentions ? allMentions[allMentions.length - 1] : null;
  }

  return null;
};

export const isLfsTeamEmbed = (embed: MessageEmbed) => {
  const hasIconURL = embed && embed.author && embed.author.iconURL;
  // const hasType = embed && embed.footer && embed.footer?.text === 'lfs';
  return hasIconURL;
};

type StatsKeys = keyof typeof statsKeysMap;

const STATS: StatsKeys[] = ['KD', 'ADR', 'WR'];
const statsKeysMap = {
  KD: 'kd',
  ADR: 'avgDamage',
  WR: 'winRatio',
};

export const parseUserStatsFromString = (line: string): StatsPartial | undefined => {
  const userInfo = line.split(',');
  if (userInfo.length > 0) {
    const firstSplit = userInfo[0].split(' ');
    const rank = firstSplit[firstSplit.length - 1];

    const statsRaw = userInfo.filter((info) => STATS.find((stat) => info.includes(stat)));
    const stats: StatsPartial = STATS.reduce((acc, current) => {
      const statRaw = statsRaw.find((raw) => raw.includes(current));
      const statWord = statRaw?.split(' ').find((n) => {
        const value = parseFloat(n);
        return value === 0 ? true : Boolean(value);
      });
      const statValue = statWord ? parseFloat(statWord) : NaN;
      const statKey = statsKeysMap[current];

      if (typeof statValue === 'number') {
        if (typeof acc === 'object')
          return {
            ...acc,
            [statKey]: statValue,
          };
        return {
          [statKey]: statValue,
        };
      }
      return acc;
    }, {});

    return {
      ...stats,
      winRatio: typeof stats?.winRatio === 'number' ? stats?.winRatio : NaN,
      bestRank: Object.values(Tier).includes(rank) ? rank : undefined,
    };
  }
};

export const parseUsersFromLfsEmbed = (embed: MessageEmbed) => {
  const lines = embed.description
    ?.split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  const last = lines && lines.length > 0 ? lines[lines.length - 1] : '';

  const hasNote = BLOQUOTE.test(last);
  const linesToRemove = hasNote ? 2 : 1;
  const usersLines = lines?.slice(0, -linesToRemove);

  const users = usersLines?.map((line) => {
    return {
      discordId: parseUserIdFromQueryString(line) || parseUserIdFromMention(line),
    };
  });

  return users;
};

export const parseNoteFromLfsEmbed = (embed: MessageEmbed) => {
  const noteMatch = embed.description ? BLOQUOTE.exec(embed.description) : ['', ''];
  const note = noteMatch ? noteMatch[1] : '';

  return note;
};

export const parseUsersIdsFromLfsEmbed = (embed: MessageEmbed) => {
  const lines = embed.description
    ?.split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const hasNote = lines && lines.length > 0 ? BLOQUOTE.test(lines[lines.length - 1]) : false;
  const linesToRemove = hasNote ? 2 : 1;
  const usersLines = lines?.slice(0, -linesToRemove);

  const users = usersLines?.map((line) => parseUserIdFromQueryString(line) || parseUserIdFromMention(line));

  return users;
};

export const parseLfsEmbed = (embed: MessageEmbed) => {
  const note = parseNoteFromLfsEmbed(embed);
  const channel = parseChannelFromLfsEmbed(embed);

  return {
    author: {
      id: parseAuthorIdFromLfsEmbed(embed) ?? '',
      avatar: embed.author?.iconURL ? parseDiscordAvatarIdFromUrl(embed.author.iconURL) : null,
    },
    channel,
    users: parseUsersFromLfsEmbed(embed),
    note,
  };
};

type MessageParsed = {
  message: Message;
  embed: MessageEmbed;
  embedParsed: LfsEmbedProps | null;
} | null;

export const parseMessageRelatedToChannel = (
  messages: Message[] | undefined,
  voiceChannelId: string | undefined | null,
): MessageParsed => {
  if (!messages || !voiceChannelId) return null;

  const messagesChannel = messages.filter((m) => {
    return m.embeds.find((e) => {
      const channel = parseChannelFromLfsEmbed(e);
      return channel?.id === voiceChannelId && isLfsTeamEmbed(e);
    });
  });
  const messageSortedByDate = messagesChannel.slice().sort((a, b) => {
    const dateA = a.editedTimestamp ?? a.createdTimestamp;
    const dateB = b.editedTimestamp ?? b.createdTimestamp;
    return dateB - dateA;
  });

  const message = messageSortedByDate.length > 0 ? messageSortedByDate[0] : undefined;
  const embed = message?.embeds[0];
  if (!message || !embed || !isLfsTeamEmbed(embed)) return null;
  const embedParsed = embed ? parseLfsEmbed(embed) : null;
  return {
    message,
    embed,
    embedParsed,
  };
};

export const deleteAllLfsAuthorEmbeds = async (authorId: string, messages: Collection<Snowflake, Message>) => {
  const deleteMessagesPromises: Promise<Message>[] = [];
  messages.forEach((m) => {
    if (m.author.bot && m.embeds.length > 0) {
      const embedsGeneratedByAuthor = m.embeds.filter(
        (embed) => isLfsTeamEmbed(embed) && parseAuthorIdFromLfsEmbed(embed) === authorId,
      );
      if (embedsGeneratedByAuthor.length > 0) {
        deleteMessagesPromises.push(m.delete());
      }
    }
  });

  if (deleteMessagesPromises.length > 0) {
    await Promise.all(deleteMessagesPromises);
  }
};
