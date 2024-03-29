<h1 align="center">Unofficial ForgeHub Discord Bot ⚒️</h1>
<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-2.0.0-blue.svg?cacheSeconds=2592000" />
  <img src="https://img.shields.io/badge/node-%3E%3D16.13.2-blue.svg" />
  <img src="https://img.shields.io/badge/npm-%3E%3D8.4.0-blue.svg" />
  <a href="https://choosealicense.com/licenses/gpl-3.0/" target="_blank">
    <img alt="License: GNU GPLv3" src="https://img.shields.io/badge/License-GNU GPLv3-yellow.svg" />
  </a>
  <img src="https://img.shields.io/maintenance/yes/2022" />
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

- [node](https://nodejs.org/en/) >=16.13.2
- [npm](https://www.npmjs.com/) >=8.4.0

## Install 
### With Docker 
A `Dockerfile` is available at the root of the project so you can easily set the bot up without having to care about any global dependency or anything. If you want to do it this way, make sure you have [Docker](https://www.docker.com) installed on your machine.

```bash session
git clone https://github.com/Halocrea/forgehub-discordbot.git
cd forgehub-discordbot

cp .env.dist .env
vi .env
#provide the information required in the .env file

docker build -t forgehub-discordbot .
docker run -d -v /absolute/path/to/forgehub-discordbot/data:/app/data --restart=always --name=forgehub-discordbot forgehub-discordbot
```

### Without Docker
Make sure you have the proper [Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) versions installed on your machine.
```bash session
git clone https://github.com/Halocrea/forgehub-discordbot.git
cd forgehub-discordbot

cp .env.dist .env
vi .env
#provide the information required in the .env file

npm

node index.js
```

## Setup 
* If you never set up a Discord bot before, please follow the instructions over [here](https://discordapp.com/developers/docs/intro).
* If you don't want to host your own version of the bot but consume an existing instance of it, you can use the following invite link: https://discordapp.com/oauth2/authorize?client_id=706124989597876294&scope=bot&permissions=27712 
* Once that is done, invite the bot to your server, and follow the instructions of the greeting message to learn about the available slash commands.

## Supported languages 
* 🇺🇸 English
* 🇫🇷 French
* 🇪🇸 Spanish

If you'd like to get the bot in another language, feel free to contact us and contribute! 

## Commands list
Here's the list of slash commands available once the bot is on a server; please note that these commands are localized, for example `/help` to show this list of commands is `/aide` in French and `/ayuda` in Spanish.

**General commands**
  * `/help`: show this help message.
  * `/latest` `topic`: I will show you the latest map or tweet depending on which of those two_topics_ you choose.
  * `/invite`: get a link to invite this bot to your own servers.

**Admin commands**
  * `/setup` `topic` `channel`: You can set the channel into which I will automatically post the latest map/tweet/stream alert.
  * `/set-language` `language`: to define which language the bot should use whenever it automatically posts a message.
  
To ask questions to the developers of this bot, feel free to contact us at {discordInvite}!

## Contribution

Thank you RBLS#7532 for the spanish translation!

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/Halocrea/forgehub-discordbot/issues). 

## Show your support

Give a ⭐️ if this project helped you!
