const Augur = require("augurbot"),
  p = require("../utils/perms"),
  sf = require("../config/snowflakes"),
  u = require("../utils/utils"),
  Discord = require("discord.js");

const menuOptions = require("../data/modMenuOptions");

const isMsg = 1 << 0;
const isMod = 1 << 1;
const isMgr = 1 << 2;

function permCheck(inter) {
  return (
    (inter.targetType === "MESSAGE") * isMsg |
    p.isMod(inter) * isMod |
    p.isAdmin(inter) * isMgr
  );
}

const processes = {
  flagUser: async function(interaction, target) {
    // Stuff goes here
  },
  userInfo: async function(interaction, target) {
    // Stuff goes here
  },
  userAvatar: async function(interaction, target) {
    // Stuff goes here
  },
  flagMessage: async function(interaction, target) {
    // Stuff goes here
  },
  pinMessage: async function(interaction, target) {
    target.pin();
    await interaction.editReply({ embeds: [
      u.embed().setTitle("Message pinned.")
    ] });
  },
  fullinfo: async function(interaction, target) {
    // Stuff goes here
  },
  summary: async function(interaction, target) {
    // Stuff goes here
  },
  noteUser: async function(interaction, target) {
    // Stuff goes here
  },
  renameUser: async function(interaction, target) {
    // Stuff goes here
  },
  trustUser: async function(interaction, target) {
    // Stuff goes here
  },
  trustPlusUser: async function(interaction, target) {
    // Stuff goes here
  },
  watchUser: async function(interaction, target) {
    // Stuff goes here
  },
  warnUser: async function(interaction, target) {
    // Stuff goes here
  },
  muteUser: async function(interaction, target) {
    // Stuff goes here
  },
  timeoutUser: async function(interaction, target) {
    // Stuff goes here
  },
  kickUser: async function(interaction, target) {
    // Stuff goes here
  },
  banUser: async function(interaction, target) {
    // Stuff goes here
  },
  warnMessage: async function(interaction, target) {
    // Stuff goes here
  },
  purgeChannel: async function(interaction, target) {
    // Stuff goes here
  },
  announceMessage: async function(interaction, target) {
    // Stuff goes here
  }
};

const allMenuItems = new u.Collection()
.set(0, ['flagUser', 'userInfo', 'userAvatar'])
.set(isMsg, ['flagMessage', 'pinMessage'])
.set(isMod, ['fullinfo', 'summary', 'noteUser', 'renameUser', 'trustUser', 'trustPlusUser', 'watchUser', 'warnUser',
  'muteUser', 'timeoutUser', 'kickUser', 'banUser'])
.set(isMod + isMsg, ['warnMessage', 'purgeChannel'])
.set(isMgr + isMsg, ['announceMessage']);

/**
   * @param {Discord.ContextMenuInteraction} inter
   */
async function modMenu(inter) {
  await inter.deferReply({ ephemeral: false });
  const includeKey = permCheck(inter);
  /* let optio ns = [];
  for (const [key, item] of allMenuItems) {
    if (includeKey & key == key) options.push(menuOptions[item]);
  } */
  const options = Array.from(allMenuItems.filter((val, key) => (key & includeKey) == key).values())
    .flat().map(o => menuOptions[o])
    .sort((a, b) => a.label.toLowerCase().localeCompare(b.label.toLowerCase()));

  // Present menu to user
  const selectId = u.customId();
  const row = new Discord.MessageActionRow()
    .addComponents(
      new Discord.MessageSelectMenu()
        .setCustomId(selectId)
        .setPlaceholder('Nothing Selected')
        .addOptions(options),
    );

  const target = inter.targetType === "MESSAGE" ? inter.options.getMessage("message") : inter.options.getUser("user");

  const e = u.embed({ author: target.member ?? target.author ?? target }).setColor("RED");
  let embeds = [ e ];
  if (inter.targetType === "MESSAGE") {
    e.setTitle("Select An Action On This Message");
    e.setDescription(target.content);
    embeds = embeds.concat(target.embeds);
  } else {
    e.setTitle("Select An Action On This User");
  }

  await inter.editReply({ embeds, components: [ row ] });

  const filter = (c) => c.customId === selectId && c.user.id === inter.member.id;
  const menuSelect = await inter.channel.awaitMessageComponent({ filter, time: 60000 });
  await menuSelect.deferReply();
  embeds[0].setTitle("Action Selected").setColor("GREEN");
  await inter.editReply({ embeds, components: [ ] });
  const selection = menuSelect.values[0];
  await processes[selection](menuSelect, target);
}

const Module = new Augur.Module()
.addInteractionCommand({ name: "Moderation", commandId: sf.commands.modMessage, process: modMenu })
.addInteractionCommand({ name: "Moderation", commandId: sf.commands.modUser, process: modMenu });

module.exports = Module;
