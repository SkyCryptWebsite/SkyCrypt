Contributing to the SkyCrypt
----------------------------

Before contributing to SkyCrypt, make sure you install the development environment first.

### Prerequisites
- [Node.js](https://nodejs.org)
- [MongoDB](https://docs.mongodb.com/manual/administration/install-community/), alternatively you can use the free online version (more instructions below)
- Redis, use [this link](https://github.com/MicrosoftArchive/redis/releases/tag/win-3.2.100) for Windows, and [this link](https://redis.io/) for other OS's (more instructions below)
- A [Hypixel API key](https://api.hypixel.net/)
- [Nginx](https://www.nginx.com/) (Optional but an ideal choice for full deployment)

### Alternative Installations

- Redis
    - On windows, you can get redis through [this link](https://github.com/MicrosoftArchive/redis/releases/tag/win-3.2.100). Download the zip, extract it, and run it by double clicking `redis-server.exe`
- MongoDB
    - Instead of installing Mongo on your own device, you can use the free MongoDB Atlas program [here](https://www.mongodb.com/). It does require an account, but it is free.

### Getting Started

1. Clone the repository. You can do this on the command line by running 
    ```
    git clone https://github.com/SkyCryptWebsite/SkyCrypt.git
     ```
    Alternatively, you can use a git GUI like GitKraken to clone it.

2. Run `npm i` in the project directory to install the necessary dependencies. 
3. On minecraft, log into `mc.hypixel.net`. Run the command `/api`, and copy the result.
4. Open `credentials.json` and input your Hypixel API key into the `hypixel_api_key` field.
5. In the `dbUrl` field, input your MongoDB url. In the `dbName` field, input the name of the database you would like to use.
6. Making sure your Mongo and Redis instances are running, run `npm start` in the project directory. You should now be able to access the site at http://localhost:32464/
