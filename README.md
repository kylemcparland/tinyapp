# TinyApp - By: Kyle McParland (Lighthouse Labs 2024)

This is a simple multi-page app with the following features:
1. **Account registry** [ User logins, personal user databases ]
2. **Authentication protection** [ Hashed passwords, encrypted cookies ] 
3. **Server client** [ Express ]
4. **CRUD simple entities** [ Custom URL shortening function: submit URLs + edit them from your protected database / delete ]
5. **Pages displayed with HTML** [ ejs ]

Server hosted locally on ***PORT 8080*** using express!

## Installation

- Clone **[TinyApp]** using the SSH key in the git repo into an empty directory:

```bash
git clone git@github.com:kylemcparland/tinyapp.git
cd tinyapp/
```

- Install dependencies using _npm install_ ( full list documented on bottom of README.md )

```bash
npm install
```

_--- => Installation complete!_

## How to use
- Initialize server using _npm start_
```bash
npm start
...
"TinyApp listening on port 8080!"
```
- Connect locally using [localhost:8080/](localhost:8080/)

## Final Product

_Initializing..._
![Screenshot](https://i.ibb.co/Yt8f8gm/screenshot1-tinyapp.png "Screenshot")
_Create your own account! Don't worry, your data is protected using bcryptjs + cookie-session!_
![Screenshot](https://i.ibb.co/NsC5WjZ/screenshot2-tinyapp.png "Screenshot")
_Submit your own URLs to be shortened down to a THREE character ID!_
![Screenshot](https://i.ibb.co/5khy1MD/screenshot3-tinyapp.png "Screenshot")
_Customize your URLs and keep track of all your visits (unique or otherwise)!_
![Screenshot](https://i.ibb.co/FH8RCKn/screenshot4-tinyapp.png "Screenshot")

## Acknowledgements
This project would not be possible without the following amazing libraries:

[bcryptjs](https://www.npmjs.com/package/bcryptjs) "^2.4.3"

[cookie-session](https://www.npmjs.com/package/cookie-session) "^2.1.0"

[ejs](https://www.npmjs.com/package/ejs) "^3.1.10"

[express](https://www.npmjs.com/package/express) "^4.19.2"

[method-override](https://www.npmjs.com/package/method-override) "^3.0.0"

Furthermore, these amazing development tools:

[chai](https://www.npmjs.com/package/chai) "^4.3.1"

[mocha](https://www.npmjs.com/package/mocha) "^10.7.0"

[nodemon](https://www.npmjs.com/package/nodemon) "^3.1.4"

This project was built for educational purposes. Thank you for checking it out!