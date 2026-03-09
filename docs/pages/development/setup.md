# Development Setup

```info
This guide assumes you are using Linux as your development platform
```

First create fork of the repository and clone this fork.

## Backend

1. Install [nvm](https://github.com/nvm-sh/nvm) & [direnv](https://direnv.net/)
2. Change your current directory to your forked repository
3. Allow the usage of direnv in your repository

   ```bash
   direnv allow .
   ```

4. Run `nvm use` (and if it tells you to install the specified node version install it)
5. Run `npm install`

## Frontend

1. Change your current directory to the frontend folder inside the repository
2. Run `npm install`
3. Change the proxy from `http://localhost:80` to whatever IP your backend currently runs on (if it runs locally, leaving localhost should be fine).
