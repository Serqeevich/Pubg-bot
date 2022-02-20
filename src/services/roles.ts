import { Guild, GuildMember, RoleData } from 'discord.js';
import { PubgTier, Stats } from './pubg';
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
  Unranked: 'Unranked',
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

export const TPPADR = {
  '500': 'TPP ADR 500',
  '400': 'TPP ADR 400',
  '300': 'TPP ADR 300',
  '200': 'TPP ADR 200',
  '100': 'TPP ADR 100',
};

export const TPPKD = {
  '5': 'TPP KD 5',
  '4': 'TPP KD 4',
  '3': 'TPP KD 3',
  '2': 'TPP KD 2',
  '1': 'TPP KD 1',
};

export const FPPADR = {
  '500': 'FPP ADR 500',
  '400': 'FPP ADR 400',
  '300': 'FPP ADR 300',
  '200': 'FPP ADR 200',
  '100': 'FPP ADR 100',
};

export const FPPKD = {
  '5': 'FPP KD 5',
  '4': 'FPP KD 4',
  '3': 'FPP KD 3',
  '2': 'FPP KD 2',
  '1': 'FPP KD 1',
};

const ROLES: Roles = [
  { name: RANKS.Master, color: [0, 255, 109] },
  { name: RANKS.Diamond, color: [9, 249, 255] },
  { name: RANKS.Platinum, color: [33, 103, 148] },
  { name: RANKS.Gold, color: [214, 177, 99] },
  { name: RANKS.Silver, color: [121, 138, 150] },
  { name: RANKS.Bronze, color: [153, 110, 86] },
  { name: RANKS.Unranked, color: [153, 110, 86] },
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
  { name: TPPADR['500'], color: [230, 76, 61], hoist: true },
  { name: TPPADR['400'], color: [234, 120, 44], hoist: true },
  { name: TPPADR['300'], color: [237, 154, 32], hoist: true },
  { name: TPPADR['200'], color: [125, 225, 127], hoist: true },
  { name: TPPADR['100'], color: [125, 225, 127], hoist: true },
  { name: TPPKD['1'], color: [147, 112, 219] },
  { name: TPPKD['2'], color: [147, 112, 219] },
  { name: TPPKD['3'], color: [147, 112, 219] },
  { name: TPPKD['4'], color: [147, 112, 219] },
  { name: TPPKD['5'], color: [147, 112, 219] },
  { name: FPPADR['500'], color: [230, 76, 61], hoist: true },
  { name: FPPADR['400'], color: [234, 120, 44], hoist: true },
  { name: FPPADR['300'], color: [237, 154, 32], hoist: true },
  { name: FPPADR['200'], color: [125, 225, 127], hoist: true },
  { name: FPPADR['100'], color: [125, 225, 127], hoist: true },
  { name: FPPKD['1'], color: [147, 112, 219] },
  { name: FPPKD['2'], color: [147, 112, 219] },
  { name: FPPKD['3'], color: [147, 112, 219] },
  { name: FPPKD['4'], color: [147, 112, 219] },
  { name: FPPKD['5'], color: [147, 112, 219] },
];

type RoleGeneric = typeof RANKS | typeof KD | typeof ADR | typeof TPPADR | typeof TPPKD | typeof FPPADR | typeof FPPKD;

const computeRoleNameFromStats = (role: RoleGeneric, stat: number, type: any, max: number) => {
  const statNumbers = Object.keys(role).map((value) => Number(value)); //300
  const statRoleClosest: number = findClosestNumber(statNumbers, stat);
  const statRole = statRoleClosest > max ? `+${statRoleClosest}` : statRoleClosest;
  return `${type} ${statRole}`;
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

const addRoles = async (member: GuildMember, stats: Stats) => {
  // if (typeof stats.kd !== 'number' || typeof stats.avgDamage !== 'number' || typeof stats.bestRank !== 'string') return;

  let rankRoleName;
  let kdRoleName;
  let adrRoleName;
  //unranked
  if (isNaN(stats.kd) || isNaN(stats.avgDamage)) {
    rankRoleName = RANKS['Unranked'];
  } else {
    rankRoleName = stats.bestRank ? RANKS[stats.bestRank] : null;
    kdRoleName = stats.kd ? computeRoleNameFromStats(KD, stats.kd, 'R.KD', 5) : null;
    adrRoleName = stats.avgDamage ? computeRoleNameFromStats(ADR, stats.avgDamage, 'R.ADR', 500) : null;
  }

  const kdRoleNameTPP = stats.kdTPP ? computeRoleNameFromStats(TPPKD, stats.kdTPP, 'TPP KD', 5) : null;
  const adrRoleNameTPP = stats.adrTPP ? computeRoleNameFromStats(TPPADR, stats.adrTPP, 'TPP ADR', 500) : null;
  const kdRoleNameFPP = stats.kdFPP ? computeRoleNameFromStats(FPPKD, stats.kdFPP, 'FPP KD', 5) : null;
  const adrRoleNameFPP = stats.adrFPP ? computeRoleNameFromStats(FPPADR, stats.adrFPP, 'FPP ADR', 500) : null;

  const rolesNameToBeAssigned = [
    kdRoleName,
    adrRoleName,
    rankRoleName,
    kdRoleNameTPP,
    adrRoleNameTPP,
    kdRoleNameFPP,
    adrRoleNameFPP,
  ].filter((role) => role !== null);
  const roles = await member.guild.roles.fetch();

  // add new stats roles
  const rolesToBeAssigned = roles.cache.filter((role) => {
    return rolesNameToBeAssigned.includes(role.name);
  });

  const addRolesPromises = rolesToBeAssigned.map((role) => member.roles.add(role));
  await Promise.all(addRolesPromises);
};

export const addStatsRoles = async (member: GuildMember, stats: Stats | null | undefined) => {
  // remove previous roles
  console.log('addStatsRoles', stats);
  await removeRoles(member);
  if (stats) await addRoles(member, stats);
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
