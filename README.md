

#  Dynamic Registration Web
 
Dynamic Registration of OIDC clients  with any supported provider
 
 ## Live site
 
Deployed to https://web.gid.dynidp.com/

# Usage By Screen Shots

### Create or choose a provider
|Select a provider | [Or] Add a new issuer  |
|--|--|
|  | Then fill up redirect URLs and scope  |
|![image](https://user-images.githubusercontent.com/29256880/215363151-e1f1c401-fb97-44bf-a151-a725166f8c14.png)   |  ![image](https://user-images.githubusercontent.com/29256880/215363190-8ed4848f-1716-4e48-92d7-9f41eed6b374.png)
|  |  

### Check OP details in the provider section

|    | | |
|--|--|--|
|The `OP details` as provided by discovery API | ![image](https://user-images.githubusercontent.com/29256880/215365512-37fb855f-1c38-442f-8056-ef1f67e36ad0.png) | |
|The newly `registered client`   | ![image](https://user-images.githubusercontent.com/29256880/215363280-24561be1-043a-40b0-a6a0-6ffbee1b8ead.png)| |
| the `authorization request` to be sent to the issuer | ![image](https://user-images.githubusercontent.com/29256880/215363339-15270c1a-51d7-4c17-b314-2b92b3b60b0f.png) |

### Sigh in
| Then click on the `Sigh in button` |  |
|--|--|
| ![image](https://user-images.githubusercontent.com/29256880/215363443-4a1ff5b2-edad-4125-968f-24648d242eb5.png?width=50&hight=50)|  |

### Trace

| Tracing Bar |  |
|--|--|
| In the right side you can find tracing events of your jurney | ![image](https://user-images.githubusercontent.com/29256880/215363575-a8e68c4f-09a3-4f7d-bada-2baf37356af5.png) |
||
|Click on the tracing event to get more data| ![image](https://user-images.githubusercontent.com/29256880/215363593-ac217050-2428-4a5f-a44c-23b95a7af838.png)|


# Local development

In the project directory, you can run:

### `yarn dev`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
 
##  More

