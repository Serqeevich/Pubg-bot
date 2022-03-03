import { Client, Message, MessageEmbed } from 'discord.js';
import { logError } from '../services/logs';
import { clearMessage } from './../utils/helpers';
import AntiSpam from './../services/spam';

type TriggerResolver = (client: Client, message: Message) => Promise<void>;

type Triggers = {
  [key: string]: {
    words: string[];
    resolver: TriggerResolver;
  };
};

//стоп
const stopWords = ['лс', 'хуй', 'пидор'];

export const triggers: Triggers = {
  lousyWords: {
    words: stopWords,
    resolver: async (client, message) => {
      
      await message.delete();
      const reply = await message.reply(
        new MessageEmbed()
        .setColor(`#FF0000`)
        .setImage('https://cdn.discordapp.com/attachments/939806800679690260/947526278989353040/stop-funny-animal.gif')
      )
      setTimeout(() => reply.delete(), 7000);
    },
  },
};

export const TRIGGERS_AVAILABLE = Object.keys(triggers);

export const triggersResolver = async (client: Client, message: Message) => {
  if (message.author.bot) return;

  try {
    AntiSpam.log(message.author.id, message.content);
    const isSpamDetected = await AntiSpam.checkMessageInterval(message); // Check sent messages interval
    if (isSpamDetected) {
      await message.delete();
      await message.author.send(`<@${message.author.id}>, пожалуйста не нужно спамить.`);
      throw new Error(`Обнаружен спам: ${message.content} от <@${message.author.id}>`);
    }

    const content = message.content ? clearMessage(message.content) : '';
    if (content === '') return;

    TRIGGERS_AVAILABLE.forEach(async (key) => {
      const trigger = triggers[key];
      if (trigger.words.some((w) => content.includes(w))) {
        await trigger.resolver(client, message);
      }
    });
  } catch (err: any) {
    await logError(client, message.channel.id, err);
  }
};
