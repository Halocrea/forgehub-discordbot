<h1 align="center">Unofficial ForgeHub Discord Bot ⚒️</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-0.1.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/node-%3E%3D12.16.1-blue.svg" />
  <img src="https://img.shields.io/badge/yarn-%3E%3D1.19.1-blue.svg" />
  <a href="https://choosealicense.com/licenses/gpl-3.0/" target="_blank">
    <img alt="License: GNU GPLv3" src="https://img.shields.io/badge/License-GNU GPLv3-yellow.svg" />
  </a>
  <img src="https://img.shields.io/maintenance/yes/2020" />
  <br />
  <a href="https://discord.gg/74UAq84" target="_blank">
    <img src="https://img.shields.io/discord/443833089966342145?color=7289DA&label=Halo%20Cr%C3%A9ation&logo=Discord" />
  </a>
  <a href="https://twitter.com/HaloCreation" target="_blank">
    <img src="https://img.shields.io/twitter/follow/HaloCreation?color=%232da1f3&logo=Twitter&style=flat-square" />
  </a>
</p>

> A Discord bot that automatically fetches latest map submissions on forgehub.com, latest FH's tweets, and alerts whenever FH goes live on Twitch! 

## Prerequisites

- [node](https://nodejs.org/en/) >=12.16.1
- [yarn](https://yarnpkg.com) >=1.19.1

## Install 
### With Docker 
A `Dockerfile` is available at the root of the project so you can easily set the bot up without having to care about any global dependency or anything. If you want to do it this way, make sure you have [Docker](https://www.docker.com) installed on your machine.

```bash session
git clone https://github.com/Halocrea/forgehub-discordbot.git
cd haloduels

cp .env.dist .env
vi .env
#provide the information required in the .env file

docker build -t forgehub-discordbot .
docker run -d -v /absolute/path/to/forgehub-discordbot/data:/app/data --restart=always --name=forgehub-discordbot forgehub-discordbot
```

### Without Docker
Make sure you have the proper [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com) versions installed on your machine.
```bash session
git clone https://github.com/Halocrea/forgehub-discordbot.git
cd haloduels

cp .env.dist .env
vi .env
#provide the information required in the .env file

yarn

node index.js
```

## Setup 
* If you never set up a Discord bot before, please follow the instructions over [here](https://discordapp.com/developers/docs/intro).
* If you don't want to host your own version of the bot but consume an existing instance of it, you can use the following invite link: https://discordapp.com/oauth2/authorize?client_id=706124989597876294&scope=bot&permissions=27712 
* Once that is done, invite the bot to your server, and type `!fh` to start the installation wizard.

## Supported languages 
* 🇺🇸 English
* 🇫🇷 French

If you'd like to get the bot in another language, feel free to contact us and contribute! 

## Commands list
Use the command `!fh help` (or `!fh aide` in French) to get the full list of available commands. Here are the default English ones:

**General commands**
* `!fh help` : send help
* `!fh latest map`: I will show the latest map submitted on forgehub.com.
* `!fh latest tweet` : I'll post the latest tweet from the official @ForgeHub Twitter account.
* `!fh invite`: get an link to invite this bot to your own servers. 

**Admin commands**
* `!fh prefix new-prefix`: change the prefix used to call the bot. Notice: the prefix won't be changed in the rules of the game.
* `!fh uninstall`: the bot will delete everything it stored about this Discord server and will leave it.\n\nTo ask questions to the developpers of this bot, feel free to contact us at https://discord.gg/74UAq84!

## Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/tepec/forgehub-discordbot/issues). 

## Show your support

Give a ⭐️ if this project helped you!
