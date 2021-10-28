# Aeternum Map - Interactive map for New World

Get all the locations, farming spots, resources, lore documents, chests, mobs and more!

## Features

- Live Tracking of your In-Game position
- Check markers as done (like lore documents)
- Automatic detection of your In-Game character
- Auto start with New World
- Private and guild markers (Coming Soon)
- Areas (Coming Soon)
- Near by (Coming Soon)
- Dungeons (Coming Soon)

## Contribution

This app is Open Source. Contributors are highly welcome!

Join us on our [Discord](https://discord.com/invite/NTZu8Px).

## Development

Please follow the instructions on [Overwolf Developer](http://developers.overwolf.com/documentation/odk-2-0-introduction/creating-your-first-app/) to get white listed in Overwolf. Then you can start developing!
In addition, you need access to a [MongoDB](https://docs.mongodb.com/manual/).

### Set environment variables

You can start by copying the template environment variables file.

```
cp template.env .env
```

The following list shows the variables you need to set:

| KEY               | VALUE                                                           |
| ----------------- | --------------------------------------------------------------- |
| PORT              | Port for the server environment                                 |
| MONGODB_URI       | URI of your MongoDB server                                      |
| VITE_API_ENDPOINT | URL of your server environment                                  |
| SCREENSHOTS_PATH  | Server side path to a folder in which screenshots will be saved |
| SESSION_SECRET    | Session secret                                                  |

### Install dependencies

This project is based on [Node.js](https://nodejs.org/). Make sure you have Node.js installed before installing the dependencies with:

```
npm install
```

You need to install [Overwolf](https://download.overwolf.com/install/Download) too.

### Build project

You can build a production version of the server and client with:

```
npm run build
```

It is required to call this at least once before you can run this app in development mode.

### Install as "unpacked extension"

Based on this [guide](https://overwolf.github.io/docs/start/sample-app-overview#5-install-the-app-as-unpacked-extension) you can install the app.

- Open the Overwolf desktop client settings (by right-clicking the client and selecting "Packages"
  Or by clicking on the wrench icon in the dock and going to the "About" tab => "Development Options").

- Click on "Development options".

- In the opened window, click on "Load unpacked extension" and select the extracted 'ts/dist' folder.
  This will add the app to your Overwolf dock.

- Make sure you are logged in to the OW client. Otherwise, you will get an "Unauthorized App" error message. (Click on the "Appstore" icon in the OW dock to login to the OW client).

### Run development

```
npm run dev
```

This will run the server and client in development mode.

### Start the app

Click on the app's icon in your OW dock to run the app. This will open the app if you run `npm run dev` before.

## Licensing

MIT
