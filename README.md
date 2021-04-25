<p align="center"><img src="https://i.imgur.com/Ij5J9G9.png"></p>
<h1 align="center">SkyCrypt: A Hypixel Skyblock Profile Viewer</h1>

The SkyCrypt Project, which is based on LeaPhant's [sky.lea.moe](https://sky.lea.moe), allows you to share your <a href="https://hypixel.net/">Hypixel</a> SkyBlock profile with other players with a quick overview of your Stats, Skills, Armor, Weapons and Accessories.

**Website**: https://sky.shiiyu.moe

![Node.JS CI](https://github.com/SkyCryptWebsite/SkyCrypt/workflows/Node.js%20CI/badge.svg)  
<h2 align="center">Screenshot</h1>

![Screenshot](public/resources/img/screenshot.jpg)

<h2 align="center">Contributing</h1>

You are free to report bugs or contribute to this project. Just open <a href="../../issues">Issues</a> or <a href="../../pulls">Pull Requests</a> and the Developer team will look into them.

<h3>Prerequisites</h3>

- <a href="https://nodejs.org/">Node.js</a>
- <a href="https://docs.mongodb.com/manual/administration/install-community/">MongoDB</a>
- <a href="https://redis.io/">Redis</a>
- <a href="https://api.hypixel.net/">Hypixel API Key</a>
- <a href="https://www.nginx.com/">Nginx</a> (Optional but an ideal choice for full deployment)


<h3>Installation</h3>
A more explanatory guide can be found in <a href="/CONTRIBUTING.md">CONTRIBUTING.md</a>

Clone the project and and run `npm i` to install the dependencies.

Now open `credentials.json` and enter a valid Hypixel API Key. You can obtain one by joining `mc.hypixel.net` and writing `/api` in chat.

`mongod` needs to be running as a service in the background and the `redis-server` needs to be started.

You can now run `npm start` to start it. You will be able to access the site on <a href="http://localhost:32464">http://localhost:32464</a> if you leave the default port.

<h2 align="center">Credits</h2>

- **Animated Custom Weapons and Armors**: <a href="https://hypixel.net/threads/2138599/">FurfSky+</a> by Furf__
- **Additional Custom Textures**: <a href="https://hypixel.net/threads/2147652/">Vanilla+</a> by TBlazeWarriorT
- **Default Textures**: <a href="https://www.minecraft.net/">Minecraft</a> by Mojang
- **Player Heads**: <a href="https://hypixel.net/forums/skyblock.157/">SkyBlock</a> by Hypixel. 
- **Original Site**: <a href="https://sky.lea.moe/">sky.lea.moe</a> by LeaPhant



