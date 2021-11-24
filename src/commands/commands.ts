import * as sapphire from '@sapphire/framework';
import * as discord from 'discord.js';
import { SubCommandPluginCommand } from '@sapphire/plugin-subcommands';
import { durationToMS, guildDataCache, db, getRandomArbitrary } from '../index';
import * as lux from 'luxon';
let permissionsPrecondition = (...args: discord.PermissionResolvable[]) => {
    let preconditionArray: Array<sapphire.PreconditionEntryResolvable> = [];
    preconditionArray.push('override')
    args.forEach((item) => {
        preconditionArray.push(new sapphire.UserPermissionsPrecondition(item))
    });
    return preconditionArray
};


const SamMessages = [
    "https://cdn.discordapp.com/attachments/743369863103381505/912837273639321640/ImportVideo_11405.430098.mov",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871163577917440/Screen_Shot_2021-11-24_at_11.58.11_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871163846361118/Screen_Shot_2021-11-24_at_11.58.19_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871164265771051/Screen_Shot_2021-11-24_at_11.58.26_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871164538404914/Screen_Shot_2021-11-24_at_11.58.35_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871164878135306/Screen_Shot_2021-11-24_at_11.58.49_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871165243056168/Screen_Shot_2021-11-24_at_11.58.57_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871165515673680/Screen_Shot_2021-11-24_at_11.59.13_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871165796696094/Screen_Shot_2021-11-24_at_11.59.21_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871165796696094/Screen_Shot_2021-11-24_at_11.59.21_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871166241304587/Screen_Shot_2021-11-24_at_11.59.30_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871166601986098/Screen_Shot_2021-11-24_at_11.59.37_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871352577441862/Screen_Shot_2021-11-24_at_11.59.49_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871352862650428/Screen_Shot_2021-11-24_at_11.59.56_am.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871353143689216/Screen_Shot_2021-11-24_at_12.00.04_pm.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871353143689216/Screen_Shot_2021-11-24_at_12.00.04_pm.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871353340788786/Screen_Shot_2021-11-24_at_12.00.11_pm.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871353630220368/Screen_Shot_2021-11-24_at_12.00.17_pm.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871353869291530/Screen_Shot_2021-11-24_at_12.00.23_pm.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871354108346428/Screen_Shot_2021-11-24_at_12.00.32_pm.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871354401955850/Screen_Shot_2021-11-24_at_12.00.39_pm.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871354662010900/Screen_Shot_2021-11-24_at_12.00.49_pm.png",
    "https://cdn.discordapp.com/attachments/848110249373466664/912871354934636574/Screen_Shot_2021-11-24_at_12.00.56_pm.png"
];
const randomSamMessage = SamMessages[Math.floor(Math.random() * SamMessages.length)];

export class testCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'test',
            description: 'short desc',
            detailedDescription: 'desc displayed when help command is called',
            requiredClientPermissions: [],
            preconditions: []
        });
    };
    public async messageRun(message: discord.Message) {
        return message.channel.send('test');
    };
}

export class ownerDisableCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'dismount',
            description: 'Disables a command globally',
            requiredClientPermissions: [],
            preconditions: ['OwnerOnly']
        });
    };
    public async messageRun(message: discord.Message, args: sapphire.Args) {
        let cmd = args.nextMaybe();
        if (!cmd.exists) return
        let command = this.container.stores.get('commands').find(value => value.name === cmd.value);
        if (!command) return message.channel.send('Command not found');
        command.enabled = false;
        return message.channel.send(`Dismounted *${cmd.value}*`);
    };
}

export class ownerEnableCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'mount',
            description: 'Enables a command globally',
            preconditions: ['OwnerOnly']
        });
    };
    public async messageRun(message: discord.Message, args: sapphire.Args) {
        let cmd = args.next();
        let command = this.container.stores.get('commands').find(value => value.name === cmd);
        if (!command) return message.channel.send('Command not found');
        command.enabled = true;
        command.reload();
        return message.channel.send(`Mounted *${cmd}*`);
    };
};

export class ownerEvalCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'eval',
            description: 'Evaluates JS input',
            requiredClientPermissions: [],
            preconditions: ['OwnerOnly']
        });
    };
    public async messageRun(message: discord.Message) {
        let str = message.content;
        let out = str.substring(str.indexOf('```') + 3, str.lastIndexOf('```'));
        try {
            eval(out);
        } catch (error) {
            console.log("error");
            console.log(error);
            message.channel.send(`Unhandled exception: \n ${error}`);
        }
    };
};

export class DeletedMSGCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'deleted',
            description: '',
            requiredClientPermissions: [],
            preconditions: [permissionsPrecondition('MANAGE_MESSAGES'), 'GuildOnly']
        });
    };
    public async messageRun(message: discord.Message, args: sapphire.Args) {
        let arg = args.nextMaybe();
        if (!arg.exists) return message.channel.send('Please specify amount of messages to view.');
        let amount = parseInt(arg.value);
        if (isNaN(amount)) return message.channel.send('Please specify a valid amount of messages to view.');
        let del = await db.query('SELECT * FROM deletedmsgs WHERE guildid=$2 ORDER BY msgtime DESC LIMIT $1;',
            [amount, message.guildId]);
        del.rows.forEach(async (msg) => {
            if (msg.content.length > 1028) {
                var content: string = msg.content.substring(0, 1025) + '...';
            } else {
                var content: string = msg.content;
            }
            const DeleteEmbed = new discord.MessageEmbed()
                .setTitle("Deleted Message")
                .setColor("#fc3c3c")
                .addField("Author", `<@${msg.author}>`, true)
                .addField("Deleted By", msg.deleted_by, true)
                .addField("Channel", `<#${msg.channel}>`, true)
                .addField("Message", content || "None")
                .setFooter(`Message ID: ${msg.msgid} | Author ID: ${msg.author}`);
            message.channel.send({
                embeds: [DeleteEmbed]
            })
        });
        return;
    };

};

export class smiteCommand extends SubCommandPluginCommand {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'smite',
            description: '',
            requiredClientPermissions: ['BAN_MEMBERS'],
            preconditions: [permissionsPrecondition('BAN_MEMBERS'), 'GuildOnly'],
            subCommands: ['add', 'remove', 'list', 'clear', { input: 'show', default: true }]

        });
    };

    public async add(message: discord.Message, args: sapphire.Args) {
        let user = await args.pick('member').catch(() => {
            return args.pick('user')
        })
        let content = await args.pick('string').catch(() => null);
        let reason = await args.repeat('string').catch(() => null);
        let time = content !== null ? durationToMS(content) : null;
        if (time === null) {
            if (content !== null && reason !== null) reason.unshift(content)
        };
        let strReason = reason === null ? 'not given' : reason?.join(' ');
        let endsDate = (time !== null) ? new Date(Date.now() + time) : null;
        if (user instanceof discord.GuildMember) {
            if (message.member!.roles.highest.position >= user.roles.highest.position && (message.guild!.ownerId !== message.member!.id)) {
                message.channel.send(`You do not have a high enough role to do this.`);
                return;
            }
            if (!user.bannable) {
                return message.channel.send("This user is not bannable by the bot.");
            }
            await db.query(`INSERT INTO punishments (member, guild, type, reason, created_time, ends) VALUES ($1, $2, $3, $4, $5, $6) `,
                [user.id, message.guild!.id, 'blist', strReason, new Date(), endsDate]);
            message.guild!.bans.create(user, { reason: strReason, days: 0 });
            message.channel.send(`${user.user.username} has been added to the blacklist and banned${(time === null) ? '.' : `for ${content}`}\nProvided reason: ${strReason}`);
        } else {
            await db.query(`INSERT INTO punishments (member, guild, type, reason, created_time, ends) VALUES ($1, $2, $3, $4, $5, $6) `,
                [user.id, message.guild!.id, 'blist', strReason, new Date(), endsDate]);
            message.channel.send(`${user.username} has been added to the blacklist and banned${(time === null) ? '.' : `for ${content}`}\nProvided reason: ${strReason}`);
        };
        return;
    }

    public async remove(message: discord.Message, args: sapphire.Args) {
        let user = await args.pick('user')
        let q = await db.query('SELECT * FROM punishments WHERE type=\'blist\' AND userid = $2 AND guild = $1', [user.id, message.guild!.id]);
        if (q.rowCount === 0) return;
        await message.guild!.members.unban(user).catch(() => { })
        db.query('UPDATE punishments SET resolved = true WHERE type=\'blist\' AND userid = $2 AND guild = $1', [user.id, message.guild!.id]);
        message.channel.send(`${user.username} has been removed from the blacklist`);
    }

    public async list(message: discord.Message) {
        let smite = await db.query(`SELECT * FROM punishments WHERE type='blist' AND guild = $1 AND NOT RESOLVED`, [message.guild!.id]);
        if (smite.rowCount === 0) message.channel.send(`No users are blacklisted`);
        smite.rows.forEach(async (i) => {
            let x = await message.client.users.fetch(i.member);
            let date = i.ends ? (+new Date(i.ends) - Date.now()) : null;
            let duration = date === null ? 'permanently' : `for ${lux.Duration.fromMillis(date!)}`;
            message.channel.send(`**${x.username}#${x.discriminator}** is blacklisted until *${duration}*. Case ID: ${i.id}`);
        });
    }
    public async reset(message: discord.Message) {
        let banned = await db.query(`SELECT * FROM punishments WHERE type='blist' AND guild = $1 AND NOT RESOLVED`, [message.guild!.id]);
        await db.query('UPDATE punishments SET resolved = true WHERE type=\'blist\' AND guild = $1', [message.guild!.id]);
        message.channel.send(`The blacklist has been cleared`);
        banned.rows.forEach((i) => {
            message.guild!.members.unban(i.userid).catch((err) => {
                console.log(err)
            })
        });
    }
}

export class queryCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'query',
            description: 'Runs SQL input against database',
            requiredClientPermissions: [],
            preconditions: ['OwnerOnly']
        });
    };
    public async messageRun(message: discord.Message) {
        let str = message.content;
        let out = str.substring(str.indexOf('```') + 3, str.lastIndexOf('```'));
        if (message.author.id !== "471907923056918528" && message.author.id !== "811413512743813181") {
            message.channel.send('You do not have permission to do this');
            return;
        }
        let data = await db.query(out);
        let JSONdata = JSON.stringify(data.rows, null, 1);
        if (JSONdata?.length && JSONdata.length < 2000) {
            message.channel.send(`${data.command} completed - ${data.rowCount} rows, \n${JSONdata}`);
            return;
        } else if (JSONdata?.length && JSONdata.length > 2000) {
            const buffer = Buffer.from(JSONdata)
            const attachment = new discord.MessageAttachment(buffer, 'file.json');
            message.channel.send(`${data.command} completed - ${data.rowCount} rows,`);
            message.channel.send({ files: [attachment] });
        } else {
            message.channel.send(`${data.command} completed - ${data.rowCount} rows,`);
        }

    };

};

export class prefixCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'prefix',
            description: 'Shows prefix',
            requiredClientPermissions: [],
            preconditions: ['GuildOnly', permissionsPrecondition('ADMINISTRATOR')]
        });
    };
    public async messageRun(message: discord.Message, args: sapphire.Args) {
        let x = args.next()
        guildDataCache.change(message.guild!.id, 'prefix', x);
        message.channel.send(`Changed prefix for ${message.guild!.name} to ${x}`);
    }
}

export class sirmoleCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'sirmole',
            description: 'unfunny',
            requiredClientPermissions: [],
            preconditions: []
        });
    };
    public async messageRun(message: discord.Message) {
        message.channel.send('sir mole is unfunny')
    }
}

export class dieCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'die',
        });
    };
    public async messageRun(message: discord.Message) {
        message.channel.send(`no u`);
    }
}

export class politicsCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'politics',
        });
    };
    public async messageRun(message: discord.Message) {
        message.channel.send(`https://cdn.discordapp.com/attachments/377228302336655362/886234477578301490/video0.mp4`);
    }
}

export class repoCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'repo',
        });
    };
    public async messageRun(message: discord.Message) {
        message.channel.send(`https://github.com/mole-den/Gerald`);
    }
}

export class inviteCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'invite',
        });
    };
    public async messageRun(message: discord.Message) {
        message.channel.send(`https://discord.com/oauth2/authorize?client_id=671156130483011605&scope=bot&permissions=829811966`);
    }
}

export class uptimeCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'uptime',
        });
    };
    public async messageRun(message: discord.Message) {
        let uptime = process.uptime();
        let uptimeString = "";
        if (uptime >= 86400) {
            uptimeString += Math.floor(uptime / 86400) + " days ";
            uptime %= 86400;
        }
        if (uptime >= 3600) {
            uptimeString += Math.floor(uptime / 3600) + " hours ";
            uptime %= 3600;
        }
        if (uptime >= 60) {
            uptimeString += Math.floor(uptime / 60) + " minutes ";
            uptime %= 60;
        }
        uptimeString += Math.floor(uptime) + " seconds";
        message.channel.send(`Uptime: ${uptimeString}`);
    }
}

export class pingCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'ping',
        });
    };
    public async messageRun(message: discord.Message) {
        let start = Date.now()
        await db.query('select 1;')
        let elapsed = Date.now() - start
        message.channel.send(`Websocket heartbeat: ${message.client.ws.ping}ms \nDatabase heartbeat: ${elapsed}ms`)
    }
}

export class statusCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'status',
        });
    };
    public async messageRun(message: discord.Message) {
        let user = message.mentions.users.first()
        if (user) {
            let member = await message.guild?.members.fetch(user);
            if (member && member.presence) {
                let presence = member.presence.activities.filter(x => x.type === "PLAYING");
                let x = "";
                if (presence[0]) x = `Playing **${presence[0].name}**`;
                let status = (member.id !== "536047005085204480") ? member.presence.status : "cringe";
                message.channel.send(`${(member.nickname || user.username)} is ${status}\n${x}`);
            }
        }
    }
}

export class setstatusCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'setstatus',
            preconditions: ['OwnerOnly']
        });
    };
    public async messageRun(message: discord.Message, args: sapphire.Args) {
        let stat = args.next();
        if (stat === 'online' || stat === 'idle' || stat === 'dnd' || stat === 'invisible') {
            message.client.user!.setStatus(stat);
        };
        const activity = args.next()
        if (activity === 'playing' || activity === 'streaming' || activity === 'watching' || activity === 'listening' || activity === 'none') {
            let stat = (activity === 'none') ? undefined : <discord.ActivityType>activity.toUpperCase();
            let name = (await args.repeat('string')).join(' ');
            message.client.user!.setActivity(name, { type: (stat as any) });
            return;
        };
    }
}

export class setupCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'setup',
        });
    };
    public async messageRun(message: discord.Message) {
        message.channel.send(`Beginning setup but no because zac cant code`);
    }
}

export class sexCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'sex'
        });
    };
    public async messageRun(message: discord.Message) {
        if (getRandomArbitrary(1, 50) === 2) {
            let msg = discord.Util.splitMessage(`
It was a wonderful monday morning... 
BigUniverse got out of bed and immediatly grabbed his phone to talk to his wonderful boyfriend, Gustavo. He messaged him, "Squish me daddy!!!"
Unfortunately, Gustavo had greater plans then going over to BigUniverse's house and railing him. Gustavo wanted a better boyfriend.
He had been programming an AI that would function as a boyfriend for him, but he did not have a body for it. He messaged BigUniverse,
"Im sorry but I dont think we can continue this relationship."
BigUniverse was distraught. He replied, "I will 1v1 you in minecraft bedwars!"
But nothing could change this. Gustavo would date a robot.
If u want more, dm me :)
-sirmole
		`);
            msg.forEach(x => message.channel.send(x));
            return
        }

        let msg = discord.Util.splitMessage(`
No. You aren't having this.
But... you can have this https://www.youtube.com/watch?v=k4FF7x8vnZg&t=0s&ab_channel=Hepburn
		`);
        msg.forEach(x => message.channel.send(x));
    }
};

export class helpCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'help',
        });
    };
    public async messageRun(message: discord.Message) {
        message.channel.send('Hello! I am Gerald. I will enable you to take control of your server by my rules >:)');
    }
}

export class guildsCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'guilds',
        });
    };
    public async messageRun(message: discord.Message) {
        let x = await message.client.guilds.fetch();
        x.each((a) => { message.channel.send(`In guild '${a.name}'', (${a.id})'\n Owner is ${a.owner}`) });
    }
}


//Made by PlutosNotRed

export class samCommand extends sapphire.Command {
    constructor(context: sapphire.PieceContext, options: sapphire.CommandOptions | undefined) {
        super(context, {
            ...options,
            name: 'sam',
        });
    };
    public async messageRun(message: discord.Message) {
        message.channel.send(randomSamMessage);
        message.channel.send("credit to PlutosNotRed, Illible, Moduluss, Sir Mole and <333")
    }
}