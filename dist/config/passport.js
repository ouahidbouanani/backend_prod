"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require('passport');
const AzureOAuth2Strategy = require('passport-azure-ad-oauth2').Strategy;
const axios = require('axios');
const db = require('./db');
require('dotenv').config();
passport.use(new AzureOAuth2Strategy({
    clientID: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/microsoft/callback",
    tenant: process.env.AZURE_TENANT_ID,
    authorizationURL: "https://login.microsoftonline.com/common/oauth2/authorize",
    tokenURL: "https://login.microsoftonline.com/common/oauth2/token",
    scope: ['https://graph.microsoft.com/User.Read']
}, async (accessToken, refreshToken, params, profile, done) => {
    try {
        const response = await axios.get("https://graph.microsoft.com/v1.0/me", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        const userInfo = response.data;
        const email = userInfo.mail || userInfo.userPrincipalName;
        const name = userInfo.displayName;
        db.query(`SELECT * FROM users WHERE email = ?`, [email], (err, results) => {
            if (err)
                return done(err);
            if (results.length === 0) {
                const insertQuery = `INSERT INTO users (microsoft_id, name, email) VALUES (?, ?, ?)`;
                db.query(insertQuery, [userInfo.id, name, email], (err, result) => {
                    if (err)
                        return done(err);
                    return done(null, { id: result.insertId, microsoft_id: userInfo.id, name, email });
                });
            }
            else {
                return done(null, results[0]);
            }
        });
    }
    catch (error) {
        console.error("Erreur lors de la récupération des infos Microsoft Graph:", error);
        return done(error);
    }
}));
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));
exports.default = passport;
