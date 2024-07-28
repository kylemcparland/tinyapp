# TinyApp Project - By: Kyle McParland (Lighthouse Labs 2024)

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

This simple multi-page app has the following feature highlights:
1. **Account registry** [ User logins, personal user databases ]
2. **Authentication protection** [ Hashed passwords, encrypted cookies ] 
3. **Server client** [ Express ]
4. **CRUD simple entities** [ Custom URL shortening function: submit URLs + edit/delete them from your protected database ]
5. **Pages displayed with HTML** [ ejs ]

Server hosted locally on ***PORT 8080*** using express!

## Installation

- Clone **[TinyApp]** using the SSH key in the git repo:

```bash
git clone git@github.com:kylemcparland/tinyapp.git
cd tinyapp/
```

- Install dependencies using _npm install_ ( full list documented on bottom of README.md ):

```bash
npm install
```

_--- => Installation complete!_

## How to use
- Initialize the development web server using `npm start` or simply the `node express_server.js` command.
```bash
npm start
...
"TinyApp listening on port 8080!"
```
- Connect locally using "localhost:8080" in your browser! _(Or customize the host using the PORT variable stored in express_server.js):_

## Final Product

![Screenshot](https://raw.githubusercontent.com/kylemcparland/tinyapp/main/docs/tinyapp-terminal.png "Screenshot of terminal")
_Create your own account! Don't worry, your data is protected using bcryptjs + cookie-session!_
![Screenshot](https://raw.githubusercontent.com/kylemcparland/tinyapp/main/docs/tinyapp-register.png "Screenshot of account creation")
_Submit your own URLs to be shortened down to a THREE character ID!_
![Screenshot](https://raw.githubusercontent.com/kylemcparland/tinyapp/main/docs/tinyapp-createurl.png "Screenshot of URL submission")
_Customize your URLs and keep track of all your visits (unique or otherwise)!_
![Screenshot](https://raw.githubusercontent.com/kylemcparland/tinyapp/main/docs/tinyapp-editpage.png "Screenshot of edit/delete page")

## Dependencies + Acknowledgements
This project would not be possible without the following amazing libraries:

[Node.js](https://nodejs.org/en/download/package-manager)

[express](https://www.npmjs.com/package/express) "^4.19.2"

[ejs](https://www.npmjs.com/package/ejs) "^3.1.10"

[bcryptjs](https://www.npmjs.com/package/bcryptjs) "^2.4.3"

[cookie-session](https://www.npmjs.com/package/cookie-session) "^2.1.0"

[method-override](https://www.npmjs.com/package/method-override) "^3.0.0"

Furthermore, these amazing development tools:

[chai](https://www.npmjs.com/package/chai) "^4.3.1"

[mocha](https://www.npmjs.com/package/mocha) "^10.7.0"

[nodemon](https://www.npmjs.com/package/nodemon) "^3.1.4"

This project was built for educational purposes. Thank you for checking it out!