Getting started
make .env file to root and ad your firebase APIs there

In functions folder do these steps in terminal:
npm install
npm install -g firebase-tools
firebase login and choose your project
firebase deploy --only functions


Download the android app google-services.json document from firebase and put it to root
Download the Service Account key from firebase

Terminal:
npm install
eas credentials
select android as platform and development configure.
Select Google Service Account
Select Upload a Google Service account Key and paste your Service Account keys path
Then select manage your Google Service Account Key for Push Notifications (FMC V1) and choose the just put one
Exit


Make EAS build: eas build --profile development --platform android
Then download the app to phone from link or qr-code

Start the project with npx expo start --dev-client
