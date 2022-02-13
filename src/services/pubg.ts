import axios, { AxiosResponse } from 'axios';
import dotenv from 'dotenv';
import { EmbedError } from './../embeds/Error';
import { get } from 'lodash';

dotenv.config();

const MINIMUM_GAMES = 8;

function roundHundredth(number: number) {
  return Math.round(number * 100) / 100;
}

// function toPercentage(number: number) {
//   const percentage = number * 100;
//   return Math.round(percentage);
// }

// config
const pubg = axios.create({
  baseURL: 'https://api.playbattlegrounds.com/shards/steam',
  timeout: 10000,
  headers: {
    Authorization: `Bearer ${process.env.PUBG_API_KEY}`,
    Accept: 'application/vnd.api+json',
  },
});

type PubgSeason = {
  type: string;
  id: string;
  attributes: {
    isCurrentSeason: boolean;
    isOffseason: boolean;
  };
};

export enum Tier {
  Master,
  Diamond,
  Platinum,
  Gold,
  Silver,
  Bronze,
}

export type PubgTier = keyof typeof Tier | string;

interface PubgRankedStats {
  currentTier: {
    tier: PubgTier;
    subTier: string;
  };
  currentRankPoint: number;
  bestTier: {
    tier: PubgTier;
    subTier: string;
  };
  bestRankPoint: number;
  roundsPlayed: number;
  avgRank: number;
  avgSurvivalTime: number;
  top10Ratio: number;
  winRatio: number;
  assists: number;
  wins: number;
  kda: number;
  kdr: number;
  kills: number;
  deaths: number;
  roundMostKills: number;
  longestKill: number;
  headshotKills: number;
  headshotKillRatio: number;
  damageDealt: number;
  dBNOs: number;
  reviveRatio: number;
  revives: number;
  heals: number;
  boosts: number;
  weaponsAcquired: number;
  teamKills: number;
  playTime: number;
  killStreak: number;
}

type PubgPlayerResponse = {
  data: {
    type: string;
    attributes: {
      rankedGameModeStats?: {
        'squad-fpp'?: PubgRankedStats;
      };
    };
  };
};

type PubgSquadResponse = {
  data: {
    type: string;
    attributes: {
      gameModeStats?: {
        'squad-fpp'?: PubgRankedStats;
        squad?: PubgRankedStats;
      };
    };
  };
};

export type Stats = {
  kd: number;
  avgDamage: number;
  bestRank: PubgTier;
  currentRankPoint: number;
  adrTPP: number;
  adrFPP: number;
  kdTPP: number;
  kdFPP: number;
};

export type StatsPartial = {
  kd?: number;
  avgDamage?: number;
  bestRank?: PubgTier;
  winRatio?: number;
};

const getCurrentSeason = async (): Promise<PubgSeason> => {
  const url = `/seasons`;
  try {
    const {
      data: { data: seasons },
    } = await pubg.get(url);
    const currentSeason = seasons.find((season: PubgSeason) => season.attributes.isCurrentSeason);
    return currentSeason;
  } catch (err: any) {
    throw new Error(err);
  }
};

const getPlayerId = async (player: string): Promise<string> => {
  const url = `/players?filter[playerNames]=${player}`;
  if (typeof player !== 'string' || !player) throw new Error('Missing player name');
  try {
    const {
      data: { data },
    } = await pubg.get(url);
    const accountId = data[0].id || null;
    if (!accountId)
      throw new EmbedError(
        `Não encontramos nenhum jogador com o nickname \`${player}\`. Tens de escrever o nome do PUBG com as letras exatamente iguais ao PUBG (minúsculas e maiúsculas).`,
      );
    return accountId;
  } catch (err: any) {
    if (err && err.response && err.response.status && err.response.status === 404)
      throw new EmbedError(
        `Não encontramos nenhum jogador com o nickname \`${player}\`.  Tens de escrever o nome do PUBG com as letras exatamente iguais ao PUBG (minúsculas e maiúsculas).`,
      );

    if (err && err.response && err.response.status && err.response.status === 429)
      throw new EmbedError(`✋ Para evitar spam à API do PUBG por favor esperem 1 minuto ⏱ e tentem de novo!`);
    else throw Error(err);
  }
};

/**
 * gets player squad-fpp stats
 * @param {string} - shards (platform: steam)
 * @returns {promise}
 */
export const getPlayerStats = async (player: string): Promise<Stats> => {
  if (typeof player !== 'string' || !player) throw Error('Missing player name');

  try {
    const { id: seasonId } = await getCurrentSeason();
    const playerId = await getPlayerId(player);

    const url = `/players/${playerId}/seasons/${seasonId}/ranked`;
    const {
      data: { data },
    }: AxiosResponse<PubgPlayerResponse> = await pubg.get(url);

    const dataSquad: any = await getSquadData(playerId, seasonId);

    //ranked
    const pubgRankStats = data.attributes.rankedGameModeStats?.['squad-fpp'];
    const roundsPlayed = get(pubgRankStats, 'roundsPlayed', NaN);

    //tpp
    const pubgTPPStats = dataSquad.attributes.gameModeStats?.['squad'];
    const roundsTPPPlayed = get(pubgTPPStats, 'roundsPlayed', NaN);

    //fpp
    const pubgFPPStats = dataSquad.attributes.gameModeStats?.['squad-fpp'];
    const roundsFPPPlayed = get(pubgFPPStats, 'roundsPlayed', NaN);

    // if (roundsPlayed < MINIMUM_GAMES || pubgRankStats === undefined) {

    // }

    const wins = get(pubgRankStats, 'wins', NaN);
    //tpp
    const winsTPP = get(pubgTPPStats, 'wins', NaN);
    //fpp
    const winsFPP = get(pubgFPPStats, 'wins', NaN);

    const damageDealt = get(pubgRankStats, 'damageDealt', NaN);
    const damageDealtTPP = get(pubgTPPStats, 'damageDealt', NaN);
    const damageDealtFPP = get(pubgFPPStats, 'damageDealt', NaN);

    const kills = get(pubgRankStats, 'kills', NaN);
    //tpp
    const killsTPP = get(pubgTPPStats, 'kills', NaN);
    //fpp
    const killsFPP = get(pubgFPPStats, 'kills', NaN);

    const bestRank = get(pubgRankStats, 'currentTier.tier', undefined);
    const currentRankPoint = get(pubgRankStats, 'currentRankPoint', undefined);
    // const winRatio = get(pubgRankStats, 'winRatio', NaN);

    const kd = kills / (roundsPlayed - wins);
    const kdTPP = killsTPP / (roundsTPPPlayed - winsTPP);
    const kdFPP = killsFPP / (roundsFPPPlayed - winsFPP);
    const avgDamage = damageDealt / roundsPlayed;
    const adrTPP = damageDealtTPP / roundsTPPPlayed;
    const adrFPP = damageDealtFPP / roundsFPPPlayed;

    if (typeof kd !== 'number' || typeof avgDamage !== 'number') {
      throw new EmbedError(`Não foi possível obter o rank para o jogador \`${player}\``);
    }

    return {
      kd: roundHundredth(kd),
      avgDamage: Math.round(avgDamage),
      currentRankPoint: currentRankPoint!,
      adrTPP: Math.round(adrTPP),
      adrFPP: Math.round(adrFPP),
      kdTPP: roundHundredth(kdTPP),
      kdFPP: roundHundredth(kdFPP),
      bestRank,
    };
  } catch (err: any) {
    if (err && err.response && err.response.status === 404)
      throw new EmbedError(`É necessário jogar no mínimo ${MINIMUM_GAMES} jogos de ranked para obter as roles.`);

    if (err.name === 'EmbedError') {
      throw new EmbedError(err.message);
    } else throw new Error(err);
  }
};

const getSquadData = async (playerId: string, seasonId: string) => {
  const squadUrl = `/players/${playerId}/seasons/${seasonId}`;
  const {
    data: { data },
  }: AxiosResponse<PubgSquadResponse> = await pubg.get(squadUrl);

  return data;
};
