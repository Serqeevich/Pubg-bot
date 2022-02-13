import { Guild, RoleData, GuildMember } from 'discord.js';
import { PubgTier, StatsPartial } from './pubg';
import { findClosestNumber } from '../utils/helpers';

type Roles = RoleData[];

export const RANKS: {
  [key: string]: PubgTier;
} = {
  Master: 'Master',
  Diamond: 'Diamond',
  Platinum: 'Platinum',
  Gold: 'Gold',
  Silver: 'Silver',
  Bronze: 'Bronze',
};

export const ADR = {
  '500': 'R.ADR 500',
  '400': 'R.ADR 400',
  '300': 'R.ADR 300',
  '200': 'R.ADR 200',
  '100': 'R.ADR 100',
};

export const KD = {
  '5': 'R.KD 5',
  '4': 'R.KD 4',
  '3': 'R.KD 3',
  '2': 'R.KD 2',
  '1': 'R.KD 1',
};

const ROLES: Roles = [
  { name: RANKS.Master, color: [0, 255, 109] },
  { name: RANKS.Diamond, color: [9, 249, 255] },
  { name: RANKS.Platinum, color: [33, 103, 148] },
  { name: RANKS.Gold, color: [214, 177, 99] },
  { name: RANKS.Silver, color: [121, 138, 150] },
  { name: RANKS.Bronze, color: [153, 110, 86] },
  { name: ADR['500'], color: [230, 76, 61], hoist: true },
  { name: ADR['400'], color: [234, 120, 44], hoist: true },
  { name: ADR['300'], color: [237, 154, 32], hoist: true },
  { name: ADR['200'], color: [125, 225, 127], hoist: true },
  { name: ADR['100'], color: [125, 225, 127], hoist: true },
  { name: KD['1'], color: [147, 112, 219] },
  { name: KD['2'], color: [147, 112, 219] },
  { name: KD['3'], color: [147, 112, 219] },
  { name: KD['4'], color: [147, 112, 219] },
  { name: KD['5'], color: [147, 112, 219] },
];

type RoleGeneric = typeof RANKS | typeof KD | typeof ADR;

const computeRoleNameFromStats = (role: RoleGeneric, stat: number, type: 'KD' | 'ADR', max: number) => {
  const statNumbers = Object.keys(role).map((value) => Number(value));
  const statRoleClosest = findClosestNumber(statNumbers, stat);
  const statRole = statRoleClosest > max ? `+${statRoleClosest}` : statRoleClosest;
  return `${statRole} ${type}`;
};

export const removeRoles = async (member: GuildMember) => {
  const rolesToBeRemoved = member.roles.cache.filter((role) => {
    const statsRolesFound = ROLES.filter((r) => r.name === role.name);
    const statsRolesNamefound = statsRolesFound.map((roleFound) => roleFound.name);
    return statsRolesNamefound.includes(role.name);
  });
  const removeRolesPromises = rolesToBeRemoved.map((role) => member.roles.remove(role));
  await Promise.all(removeRolesPromises);
};

const addRoles = async (member: GuildMember, stats: StatsPartial) => {
  if (typeof stats.kd !== 'number' || typeof stats.avgDamage !== 'number' || typeof stats.bestRank !== 'string') return;

  const kdRoleName = stats.kd ? computeRoleNameFromStats(KD, stats.kd, 'KD', 5) : null;
  const adrRoleName = stats.avgDamage ? computeRoleNameFromStats(ADR, stats.avgDamage, 'ADR', 500) : null;
  const rankRoleName = stats.bestRank ? RANKS[stats.bestRank] : null;
  const rolesNameToBeAssigned = [kdRoleName, adrRoleName, rankRoleName].filter((role) => role !== null);
  const roles = await member.guild.roles.fetch();

  // add new stats roles
  const rolesToBeAssigned = roles.cache.filter((role) => {
    return rolesNameToBeAssigned.includes(role.name);
  });

  const addRolesPromises = rolesToBeAssigned.map((role) => member.roles.add(role));
  await Promise.all(addRolesPromises);
};

export const addStatsRoles = async (member: GuildMember, stats: StatsPartial) => {
  // remove previous roles
  await removeRoles(member);
  await addRoles(member, stats);
};

export default async (guild: Guild) => {
  // delete
  // await Promise.race(
  //   guild.roles.cache.map(async (r) => {
  //     if (r.name !== 'Supreme bot') await r.delete();
  //   }),
  // );
  // console.log('roles deleted');

  const createRolesPromises = ROLES.filter((role) => {
    const alreadyExists = guild.roles.cache.find((r) => r.name === role.name, {});
    if (alreadyExists) return false;
    return guild.roles.create({ data: role });
  });
  await Promise.all(createRolesPromises);
};
