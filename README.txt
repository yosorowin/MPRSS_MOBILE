MPRSS MECHANIC MOBILE ADD-ON

This package contains the React Native / Expo version of the Mechanic App screens.

Target project:
C:\Users\alyssa\MPRSS_MOBILE\MPRSS_MOBILE

Copy these folders into the root of your existing Expo project:

src\screens\mechanic
src\data\mechanicData.js
src\app\mechanic
src\app\mechanic-login.jsx

Routes added:
/mechanic-login
/mechanic/dashboard
/mechanic/jobs
/mechanic/jobs/[jobId]
/mechanic/notifications
/mechanic/profile

Demo mechanic credentials:
Email: mechanic@mprss.com
Password: mechanic123

The mechanic workflow intentionally stops at "Ready for Quality Check".
The mechanic does NOT directly mark a service as Completed. Admin should perform the final quality check/finalization.

Important:
This is a prototype/mock-data implementation. The data in src/data/mechanicData.js should later be replaced with Firebase data and real role-based authentication.
